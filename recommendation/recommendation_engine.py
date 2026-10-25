"""
Gợi ý lịch trình du lịch Đà Nẵng - Quảng Nam.

Input : số ngày, ngân sách (VND/người), danh mục yêu thích (nhiều danh mục, ngang nhau)
Output: lịch trình từng ngày (tối đa 5 địa điểm/ngày, chia đều, thứ tự đi, giờ đến, chi phí)

Pipeline:
  1. Làm sạch dữ liệu (giá vé, giờ mở cửa, thời gian tham quan theo danh mục)
  2. Chấm điểm: khớp danh mục + TF-IDF + rating + độ rẻ
  3. Chọn pool ứng viên có quota đều theo danh mục
  4. K-means cân bằng theo tọa độ -> mỗi cụm là một ngày
  5. Cheapest-insertion + 2-opt, kiểm tra giờ mở cửa / ngân sách / giờ trong ngày
  6. Bù theo vòng tròn để các ngày đều nhau, không ngày nào trống
"""
from collections import Counter
import json
import re

import numpy as np
import pandas as pd
from pathlib import Path
import joblib
from sklearn.cluster import KMeans
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

MODEL_PATH = (
    Path(__file__).resolve().parent
    / "artifacts"
    / "tfidf_model.pkl"
)

MODEL = joblib.load(MODEL_PATH)
VECTORIZER = MODEL["vectorizer"]
# --------------------------------------------------------------------------
# Cấu hình
# --------------------------------------------------------------------------
# Thời gian tham quan ước tính (phút) theo danh mục
DURATION = {
    "Ẩm thực địa phương, Chợ": 60,
    "Di tích Lịch sử": 75,
    "Cắm trại & Trekking": 240,
    "Cà phê, Tiệm trà": 60,
    "Nhà hàng, Quán ăn nổi tiếng": 75,
    "Làng nghề Truyền thống": 90,
    "Check-in Kiến trúc & Danh thắng": 60,
    "Bãi biển Nghỉ dưỡng": 120,
    "Tâm linh & Tôn giáo": 60,
    "Sinh thái, Suối & Thác": 150,
    "Phố cổ & Văn hóa Đô thị": 120,
    "Khu Vui chơi & Nghỉ dưỡng": 180,
    "Bảo tàng & Nghệ thuật": 90,
    "Đảo & Bãi đá Hoang sơ": 180,
}
DEFAULT_DURATION = 90

BASE = (16.0544, 108.2022)      # điểm xuất phát mặc định: trung tâm Đà Nẵng
ROAD_FACTOR = 1.3               # đường thực tế dài hơn đường chim bay
SPEED_KMH = 30                  # tốc độ di chuyển trung bình
TRANSPORT_VND_PER_KM = 4000     # chi phí di chuyển ước tính (đặt 0 nếu chỉ tính giá vé)
DAY_START = 8 * 60              # 08:00
DAY_END = 20 * 60               # phải về lại điểm xuất phát trước 20:00

MAX_STOPS_PER_DAY = 5           # tối đa số địa điểm mỗi ngày
CATEGORY_DECAY = 0.6            # mỗi lần lặp danh mục trong 1 ngày, điểm nhân 0.6
W_CATEGORY, W_TFIDF, W_RATING, W_CHEAP = 0.55, 0.20, 0.15, 0.10

NUM = re.compile(r"\d{1,3}(?:\.\d{3})+|\d+")


# --------------------------------------------------------------------------
# 1. Làm sạch dữ liệu
# --------------------------------------------------------------------------
def parse_price(text):
    """Trả về (min, max) VND; (nan, nan) nếu không rõ."""
    t = str(text)
    nums = [int(n.replace(".", "")) for n in NUM.findall(t)]
    nums = [n for n in nums if n >= 1000]
    if not nums:
        if "Miễn phí" in t:
            return 0.0, 0.0
        return np.nan, np.nan
    if "Quốc tế" in t:                      # "100.000 (Việt Nam) / 150.000 (Quốc tế)"
        return float(nums[0]), float(nums[0])
    return float(min(nums)), float(max(nums))


def parse_hours(text):
    t = str(text)
    if "24/7" in t:
        return 0, 1440
    m = re.findall(r"(\d{1,2}):(\d{2})", t)
    if len(m) >= 2:
        o = int(m[0][0]) * 60 + int(m[0][1])
        c = int(m[1][0]) * 60 + int(m[1][1])
        if c <= o:
            c += 1440
        return o, c
    return 6 * 60, 18 * 60


def load_data(path):
    df = pd.read_csv(path)
    df = df[df["status"].eq("APPROVED")].copy() if "status" in df else df.copy()

    pr = df["ticket_price"].apply(parse_price)
    df["price_min"] = [p[0] for p in pr]
    df["price_max"] = [p[1] for p in pr]
    df["price_est"] = (df["price_min"] + df["price_max"]) / 2
    # giá chưa rõ -> trung vị của danh mục
    med = df.groupby("category")["price_est"].transform("median").fillna(0)
    df["price_known"] = df["price_est"].notna()
    df["price_est"] = df["price_est"].fillna(med)

    hr = df["open_hours"].apply(parse_hours)
    df["open_min"] = [h[0] for h in hr]
    df["close_min"] = [h[1] for h in hr]
    df["duration"] = df["category"].map(DURATION).fillna(DEFAULT_DURATION)
    return df.reset_index(drop=True)


# --------------------------------------------------------------------------
# Tiện ích địa lý
# --------------------------------------------------------------------------
def haversine(lat1, lon1, lat2, lon2):
    r = 6371.0
    p1, p2 = np.radians(lat1), np.radians(lat2)
    dphi, dl = p2 - p1, np.radians(lon2 - lon1)
    a = np.sin(dphi / 2) ** 2 + np.cos(p1) * np.cos(p2) * np.sin(dl / 2) ** 2
    return 2 * r * np.arcsin(np.sqrt(a))


def build_dist(df, base):
    """Ma trận khoảng cách (km đường bộ ước tính). Chỉ số n = điểm xuất phát."""
    lat = np.append(df["latitude"].values, base[0])
    lon = np.append(df["longitude"].values, base[1])
    d = haversine(lat[:, None], lon[:, None], lat[None, :], lon[None, :])
    return d * ROAD_FACTOR


# --------------------------------------------------------------------------
# 2. Chấm điểm
# --------------------------------------------------------------------------
def minmax(x):
    x = np.asarray(x, dtype=float)
    rng = x.max() - x.min()
    return np.zeros_like(x) if rng < 1e-9 else (x - x.min()) / rng


def resolve_categories(spec, all_cats):
    """Nhận list hoặc chuỗi ngăn cách bằng ';'. Trả về {tên danh mục: 1.0} (mọi danh mục ngang nhau)."""
    names = spec if isinstance(spec, (list, tuple, set)) else spec.split(";")
    out = {}
    for name in [str(n).strip().lower() for n in names if str(n).strip()]:
        hits = [c for c in all_cats if c.lower() == name] or \
               [c for c in all_cats if name in c.lower()]
        if not hits:
            raise ValueError(f"Không tìm thấy danh mục: '{name}'. Danh mục hợp lệ: {all_cats}")
        for c in hits:
            out[c] = 1.0
    return out


def score_places(df, cat_w, daily_budget):
    df = df.copy()

    docs = (
        df["name"].fillna("").astype(str)
        + ". "
        + df["description"].fillna("").astype(str)
        + ". "
        + df["category"].fillna("").astype(str)
    ).tolist()

    # Dùng model TF-IDF đã lưu trong file .pkl
    X = VECTORIZER.transform(docs)

    sel_mask = df["category"].isin(cat_w).values

    if not sel_mask.any():
        raise ValueError("Không có địa điểm thuộc danh mục đã chọn.")

    centroid = np.asarray(X[sel_mask].mean(axis=0))
    sim = minmax(cosine_similarity(X, centroid).ravel())

    wmax = max(cat_w.values())
    cat = df["category"].map(
        lambda c: cat_w.get(c, 0.0) / wmax
    ).values

    ratings = pd.to_numeric(
        df["avg_rating"], errors="coerce"
    ).fillna(0)

    rating = minmax(
        (ratings - ratings.mean()) /
        (ratings.std() + 1e-9)
    )

    prices = pd.to_numeric(
        df["price_est"], errors="coerce"
    ).fillna(0).values

    cheap = 1 - np.clip(
        prices / max(daily_budget, 1), 0, 1
    )

    df["score"] = (
        W_CATEGORY * cat
        + W_TFIDF * sim
        + W_RATING * rating
        + W_CHEAP * cheap
    )

    return df


def select_pool(df, cat_w, pool_size):
    """Chọn pool có quota theo trọng số danh mục (đa dạng hóa)."""
    total_w = sum(cat_w.values())
    picked = []
    for c, w in cat_w.items():
        quota = int(np.ceil(pool_size * w / total_w))
        picked.append(df[df["category"] == c].nlargest(quota, "score"))
    pool = pd.concat(picked)
    if len(pool) < pool_size:           # thiếu -> bù bằng địa điểm điểm cao khác
        rest = df.drop(pool.index).nlargest(pool_size - len(pool), "score")
        pool = pd.concat([pool, rest])
    return pool


# --------------------------------------------------------------------------
# 5. Lập lịch trong ngày
# --------------------------------------------------------------------------
def simulate(route, df, dist, n_base):
    """Trả về (feasible, schedule, tickets, transport_cost, end_time)."""
    t, prev, tickets, km_total, sched = DAY_START, n_base, 0.0, 0.0, []
    for i in route:
        km = dist[prev, i]
        t += km / SPEED_KMH * 60
        km_total += km
        arrive = max(t, df.at[i, "open_min"])            # chờ nếu chưa mở cửa
        dur = df.at[i, "duration"]
        if arrive > df.at[i, "close_min"] - min(dur, 30):  # đến quá muộn
            return False, None, 0, 0, 0
        leave = arrive + dur
        sched.append((i, arrive, leave))
        tickets += df.at[i, "price_est"]
        t, prev = leave, i
    km_back = dist[prev, n_base]
    t += km_back / SPEED_KMH * 60
    km_total += km_back
    if t > DAY_END:
        return False, None, 0, 0, 0
    return True, sched, tickets, km_total * TRANSPORT_VND_PER_KM, t


def route_km(route, dist, n_base):
    pts = [n_base] + list(route) + [n_base]
    return sum(dist[a, b] for a, b in zip(pts, pts[1:]))


def two_opt(route, df, dist, n_base):
    best = list(route)
    improved = True
    while improved and len(best) > 2:
        improved = False
        for i in range(len(best) - 1):
            for j in range(i + 1, len(best)):
                cand = best[:i] + best[i:j + 1][::-1] + best[j + 1:]
                if route_km(cand, dist, n_base) + 1e-9 < route_km(best, dist, n_base) \
                        and simulate(cand, df, dist, n_base)[0]:
                    best, improved = cand, True
    return best


def plan_day(cands, df, dist, n_base, day_cap, route=None, max_stops=MAX_STOPS_PER_DAY):
    """Greedy + cheapest insertion. Điểm bị giảm dần nếu cùng danh mục đã có trong ngày."""
    route = list(route or [])
    left = [c for c in cands if c not in route]
    while left and len(route) < max_stops:
        cnt = Counter(df.at[k, "category"] for k in route)
        left.sort(key=lambda k: -df.at[k, "score"] * CATEGORY_DECAY ** cnt[df.at[k, "category"]])
        chosen = None
        for i in list(left):
            best_route, best_km = None, None
            for pos in range(len(route) + 1):
                cand = route[:pos] + [i] + route[pos:]
                ok, _, tickets, transport, _ = simulate(cand, df, dist, n_base)
                if not ok or tickets + transport > day_cap:
                    continue
                km = route_km(cand, dist, n_base)
                if best_km is None or km < best_km:
                    best_route, best_km = cand, km
            if best_route is None:
                left.remove(i)          # không xếp được -> bỏ hẳn
                continue
            chosen = (i, best_route)
            break
        if chosen is None:
            break
        route = chosen[1]
        left.remove(chosen[0])
    return two_opt(route, df, dist, n_base)


# --------------------------------------------------------------------------
# Chia cụm cân bằng (mỗi ngày số địa điểm xấp xỉ nhau)
# --------------------------------------------------------------------------
def balanced_clusters(coords, k, seed=42):
    """K-means rồi gán lại có giới hạn sức chứa = ceil(n/k) cho mỗi cụm."""
    n = len(coords)
    centers = KMeans(n_clusters=k, n_init=10, random_state=seed).fit(coords).cluster_centers_
    cap = int(np.ceil(n / k))
    d = np.linalg.norm(coords[:, None, :] - centers[None, :, :], axis=2)
    labels, size = -np.ones(n, dtype=int), np.zeros(k, dtype=int)
    for idx in np.dstack(np.unravel_index(np.argsort(d, axis=None), d.shape))[0]:
        i, c = idx
        if labels[i] == -1 and size[c] < cap:
            labels[i] = c
            size[c] += 1
    return labels


# --------------------------------------------------------------------------
# Hàm chính
# --------------------------------------------------------------------------
def recommend(df, days, budget, categories,
              base=BASE, max_radius_km=60, max_stops=MAX_STOPS_PER_DAY, seed=42):
    cat_w = resolve_categories(categories, sorted(df["category"].unique()))

    # chỉ giữ địa điểm trong bán kính quanh điểm xuất phát
    d0 = haversine(df["latitude"], df["longitude"], base[0], base[1]) * ROAD_FACTOR
    df = df[d0 <= max_radius_km].reset_index(drop=True)

    ticket_budget = budget
    warn = None
    if ticket_budget <= 0:
        warn = "Ngân sách không hợp lệ (phải > 0)."
        ticket_budget = 0

    df = score_places(df, cat_w, ticket_budget / days)
    pool = select_pool(df, cat_w, pool_size=min(len(df), days * (max_stops + 2)))

    dist = build_dist(df, base)
    n_base = len(df)

    # Chia cụm cân bằng: mỗi cụm = 1 ngày
    k = min(days, len(pool))
    labels = balanced_clusters(pool[["latitude", "longitude"]].values, k, seed)
    clusters = {c: pool.index[labels == c].tolist() for c in range(k)}
    # ngày gần điểm xuất phát đi trước
    order = sorted(clusters, key=lambda c: np.mean([dist[i, n_base] for i in clusters[c]]))

    # Lượt 1: mỗi cụm -> 1 ngày (tối đa max_stops)
    routes, spent, remaining = [], [], ticket_budget
    for d, c in enumerate(order, 1):
        day_cap = remaining / (len(order) - d + 1)
        route = plan_day(clusters[c], df, dist, n_base, day_cap, max_stops=max_stops)
        _, _, tk, tr, _ = simulate(route, df, dist, n_base) if route else (0, 0, 0.0, 0.0, 0)
        routes.append(route)
        spent.append(tk + tr)
        remaining -= tk + tr

    # Lượt 2: bù thêm theo vòng tròn, mỗi vòng thêm tối đa 1 điểm cho ngày đang ít điểm nhất
    # -> số điểm các ngày đều nhau, không ngày nào bị trống (ưu tiên điểm điểm cao, gần tuyến)
    used = {i for r in routes for i in r}
    extra = [i for i in df.sort_values("score", ascending=False).index if i not in used]
    progress = True
    while progress and extra:
        progress = False
        for d in sorted(range(len(routes)), key=lambda x: len(routes[x])):
            if len(routes[d]) >= max_stops:
                continue
            leftover = ticket_budget - sum(spent)
            cap = spent[d] + leftover / sum(1 for r in routes if len(r) < max_stops)
            new_route = plan_day(extra, df, dist, n_base, cap, route=routes[d],
                                 max_stops=len(routes[d]) + 1)
            if len(new_route) > len(routes[d]):
                added = [i for i in new_route if i not in routes[d]]
                routes[d] = new_route
                _, _, tk, tr, _ = simulate(new_route, df, dist, n_base)
                spent[d] = tk + tr
                extra = [i for i in extra if i not in added]
                progress = True

    if any(not r for r in routes):
        warn = (warn or "") + " Có ngày chưa xếp được địa điểm do ngân sách/giờ mở cửa quá chặt."

    result = []
    for d, route in enumerate(routes, 1):
        ok, sched, tickets, transport, end = simulate(route, df, dist, n_base) if route \
            else (True, [], 0.0, 0.0, DAY_START)
        result.append({
            "day": d,
            "stops": [{
                "name": df.at[i, "name"],
                "category": df.at[i, "category"],
                "district": df.at[i, "district"],
                "arrive": f"{int(a // 60) % 24:02d}:{int(a % 60):02d}",
                "leave": f"{int(l // 60) % 24:02d}:{int(l % 60):02d}",
                "ticket_vnd": int(df.at[i, "price_est"]),
                "price_note": df.at[i, "ticket_price"],
                "rating": float(df.at[i, "avg_rating"]),
                "score": round(float(df.at[i, "score"]), 3),
                "map": df.at[i, "address_url"],
            } for i, a, l in sched],
            "tickets_vnd": int(tickets),
            "transport_vnd": int(transport),
            "day_total_vnd": int(tickets + transport),
            "return_time": f"{int(end // 60):02d}:{int(end % 60):02d}",
        })

    return {
        "inputs": {"days": days, "budget_vnd": budget, "categories": cat_w},
        "warning": warn,
        "total_vnd": sum(r["day_total_vnd"] for r in result),
        "itinerary": result,
    }


def print_plan(plan):
    inp = plan["inputs"]
    print(f"\n=== LỊCH TRÌNH {inp['days']} NGÀY | Ngân sách {inp['budget_vnd']:,} VND/người ===")
    print("Danh mục:", "; ".join(inp["categories"].keys()))
    if plan["warning"]:
        print("!", plan["warning"])
    for day in plan["itinerary"]:
        print(f"\n--- Ngày {day['day']} ---")
        if not day["stops"]:
            print("  (không tìm được địa điểm phù hợp với ràng buộc)")
        for s in day["stops"]:
            fee = "miễn phí" if s["ticket_vnd"] == 0 else f"~{s['ticket_vnd']:,}đ"
            print(f"  {s['arrive']}-{s['leave']}  {s['name']}  [{s['category']} | {s['district']}]"
                  f"  ★{s['rating']}  {fee}")
        print(f"  Vé/chi phí tại điểm: {day['tickets_vnd']:,}đ | Di chuyển: {day['transport_vnd']:,}đ"
              f" | Tổng ngày: {day['day_total_vnd']:,}đ"
              f" | Về lúc {day['return_time']}")
    print(f"\nTỔNG CHI PHÍ ƯỚC TÍNH: {plan['total_vnd']:,} VND\n")


