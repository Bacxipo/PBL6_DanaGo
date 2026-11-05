"""
trip_planner.py - lõi thuật toán gợi ý và lên lịch cho DanaGO.

Quy ước:
- budget_pp: ngân sách cho MỖI NGƯỜI cho cả chuyến đi (VND), tính theo price_est.
- Mỗi ngày gợi ý PLACES_PER_DAY = 3 địa điểm, nằm trong cùng một vùng (region).
- Các nhóm sở thích là giá trị của cột interest_group trong destination_AI.csv.

Hai chức năng:
- get_candidates(): gợi ý danh sách ứng viên theo nhóm sở thích, đã lọc theo ngân sách.
- make_plan(): lên lịch từng ngày, gán giờ bắt đầu, kiểm tra giờ mở cửa và thời lượng.
"""
import math
import pandas as pd

PLACES_PER_DAY = 3
DAY_START = 8 * 60        # 08:00
DAY_END = 21 * 60         # 21:00
TRAVEL_KMH = 25.0         # tốc độ di chuyển trung bình trong đô thị
MIN_TRAVEL = 5            # phút tối thiểu giữa hai điểm
INTERESTS = ["Biển & đảo", "Ẩm thực", "Văn hóa & lịch sử", "Thiên nhiên & khám phá", "Vui chơi & check-in"]


def load_places(csv_path):
    df = pd.read_csv(csv_path)
    df = df[df["status"].eq("APPROVED")] if "status" in df.columns else df
    df = df.reset_index(drop=True)
    df["price_est"] = df["price_est"].fillna(0).astype(float)
    df["visit_duration_min"] = df["visit_duration_min"].fillna(90).astype(int)
    df["open_time"] = df["open_time"].astype(int)
    df["close_time"] = df["close_time"].astype(int)
    return df


def haversine_km(lat1, lon1, lat2, lon2):
    r = 6371.0
    p1, p2 = math.radians(lat1), math.radians(lat2)
    a = math.sin((p2 - p1) / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(math.radians(lon2 - lon1) / 2) ** 2
    return 2 * r * math.asin(math.sqrt(a))


def travel_min(a, b):
    km = haversine_km(a["latitude"], a["longitude"], b["latitude"], b["longitude"])
    return max(MIN_TRAVEL, round(km / TRAVEL_KMH * 60))


def hm(m):
    m = int(m)
    return f"{m // 60:02d}:{m % 60:02d}"


def _record(r):
    return {
        "id": int(r["id"]), "name": r["name"], "category": r["category"],
        "interest_group": r["interest_group"], "region": r["region"], "district": r["district"],
        "latitude": float(r["latitude"]), "longitude": float(r["longitude"]),
        "price_text": r["price_text"], "price_est": int(r["price_est"]),
        "avg_rating": float(r["avg_rating"]), "visit_duration_min": int(r["visit_duration_min"]),
        "open": hm(r["open_time"]), "close": hm(r["close_time"]),
    }


def _pool(df, interests, budget_pp=None, region=None):
    """Địa điểm đủ điều kiện: đúng nhóm (nếu có), trong ngân sách một người (nếu có), không trùng khu."""
    d = df
    if interests:
        d = d[d["interest_group"].isin(interests)]
    if region:
        d = d[d["region"] == region]
    if budget_pp is not None:
        d = d[d["price_est"] <= budget_pp]
    d = d.sort_values(["avg_rating", "id"], ascending=[False, True])
    # chỉ loại trùng những địa điểm cùng khu (có site_group); dòng rỗng giữ nguyên
    has = d[d["site_group"].notna()].drop_duplicates(subset=["site_group"], keep="first")
    d = pd.concat([has, d[d["site_group"].isna()]]).sort_values(["avg_rating", "id"], ascending=[False, True])
    return d


def get_candidates(df, interests, budget_pp, region=None, per_group=6, scores=None):
    if interests:
        bad = [i for i in interests if i not in INTERESTS]
        if bad:
            raise ValueError(f"Nhóm sở thích không hợp lệ: {bad}")
    pool = _pool(df, interests, budget_pp, region)
    if scores:
        pool = pool.assign(_s=pool["id"].map(lambda i: scores.get(int(i), 0.0)))
        pool = pool.sort_values(["_s", "avg_rating"], ascending=[False, False])
    out = {}
    for g in (interests or INTERESTS):
        sub = pool[pool["interest_group"] == g].head(per_group)
        items = []
        for _, r in sub.iterrows():
            rec = _record(r)
            if scores:
                rec["match_score"] = round(float(scores.get(int(r["id"]), 0.0)), 4)
            items.append(rec)
        out[g] = items
    return out

def _schedule(stops):
    """Sắp thứ tự các điểm theo láng giềng gần nhất, rồi tính giờ. Trả về (None, None) nếu không khả thi."""
    items = [dict(x) for x in stops]
    if not items:
        return [], 0
    items.sort(key=lambda r: (int(r["open_time"]), int(r["id"])))
    ordered = [items.pop(0)]
    while items:
        last = ordered[-1]
        k = min(range(len(items)), key=lambda i: haversine_km(
            last["latitude"], last["longitude"], items[i]["latitude"], items[i]["longitude"]))
        ordered.append(items.pop(k))
    t, prev, timeline = DAY_START, None, []
    for r in ordered:
        if prev is not None:
            t += travel_min(prev, r)
        arrive = max(t, int(r["open_time"]))
        end = arrive + int(r["visit_duration_min"])
        if end > int(r["close_time"]) or end > DAY_END:
            return None, None
        timeline.append((r, arrive, end))
        t, prev = end, r
    return timeline, t


def make_plan(df, num_days, budget_pp, interests=None, region=None, selected_ids=None):
    """
    Lên lịch: mỗi ngày tối đa PLACES_PER_DAY điểm cùng vùng, tổng chi phí một người không vượt budget_pp.
    Bước 1: xếp các điểm người dùng đã chọn (selected_ids) vào ngày phù hợp trước.
    Bước 2: lấp các chỗ còn trống bằng địa điểm tốt nhất trong nhóm sở thích.
    """
    warnings = []
    selected_ids = [int(i) for i in (selected_ids or [])]
    pool = _pool(df, interests or [], budget_pp, region)
    by_id = {int(r["id"]): r for _, r in df.iterrows()}

    days = [{"day": i + 1, "region": None, "stops": []} for i in range(num_days)]
    used, spent = set(), 0

    def try_add(day, r):
        nonlocal spent
        if int(r["id"]) in used or len(day["stops"]) >= PLACES_PER_DAY:
            return False
        if spent + r["price_est"] > budget_pp:
            return False
        if day["region"] and day["region"] != r["region"]:
            return False
        timeline, _ = _schedule(day["stops"] + [r])
        if timeline is None:
            return False
        day["stops"].append(r)
        day["region"] = r["region"]
        used.add(int(r["id"]))
        spent += r["price_est"]
        return True

    # Bước 1: điểm người dùng chọn
    for sid in selected_ids:
        r = by_id.get(sid)
        if r is None:
            warnings.append(f"Không tìm thấy địa điểm id {sid}.")
            continue
        if r["price_est"] > budget_pp:
            warnings.append(f"{r['name']} vượt ngân sách một người, không đưa vào lịch.")
            continue
        placed = any(try_add(d, r) for d in days)
        if not placed:
            warnings.append(f"Không xếp được {r['name']} vào lịch (trùng giờ, hết chỗ hoặc vượt ngân sách).")

    # Bước 2: lấp chỗ trống
    for day in days:
        if len(day["stops"]) >= PLACES_PER_DAY:
            continue
        if day["region"]:
            cands = [("fixed", day["region"])]
        else:
            avail = pool[~pool["id"].isin(used)]
            regs = sorted(avail["region"].unique(), key=lambda reg: -avail[avail["region"] == reg]["avg_rating"].head(PLACES_PER_DAY).sum())
            cands = [("auto", reg) for reg in regs]
        best = None
        for _, reg in cands:
            snapshot = (list(day["stops"]), day["region"], set(used), spent)
            day["region"] = reg
            for _, r in pool[(pool["region"] == reg) & (~pool["id"].isin(used))].iterrows():
                if len(day["stops"]) >= PLACES_PER_DAY:
                    break
                try_add(day, r)
            if len(day["stops"]) == PLACES_PER_DAY:
                best = None
                break
            # chưa đủ 3: khôi phục để thử vùng khác (chỉ khi vùng tự chọn)
            if best is None or len(day["stops"]) > best[0]:
                best = (len(day["stops"]), reg, list(day["stops"]), set(used), spent)
            day["stops"], day["region"], used, spent = snapshot[0], snapshot[1], snapshot[2], snapshot[3]
            if cands[0][0] == "fixed":
                break
        if best is not None:
            _, reg, stops, used_b, spent_b = best
            day["region"], day["stops"], used, spent = reg, [], used_b, spent_b
            for r in stops:
                day["stops"].append(r)
        if len(day["stops"]) < PLACES_PER_DAY:
            warnings.append(f"Ngày {day['day']} chỉ có {len(day['stops'])}/{PLACES_PER_DAY} địa điểm.")

    out_days = []
    for day in days:
        if not day["stops"]:
            warnings.append(f"Ngày {day['day']}: không tìm được địa điểm phù hợp với ngân sách và giờ mở cửa.")
            out_days.append({"day": day["day"], "region": None, "stops": [], "cost_pp": 0})
            continue
        timeline, _ = _schedule(day["stops"])
        cost = sum(int(r["price_est"]) for r in day["stops"])
        out_days.append({
            "day": day["day"], "region": day["region"], "cost_pp": int(cost),
            "stops": [{
                "id": int(r["id"]), "name": r["name"], "category": r["category"],
                "start": hm(a), "end": hm(b), "duration_min": int(r["visit_duration_min"]),
                "price_text": r["price_text"], "price_est": int(r["price_est"]),
                "latitude": float(r["latitude"]), "longitude": float(r["longitude"]),
            } for r, a, b in timeline],
        })
    return {
        "num_days": num_days, "budget_pp": int(budget_pp), "total_cost_pp": int(spent),
        "budget_left_pp": int(budget_pp - spent), "days": out_days, "warnings": warnings,
    }
