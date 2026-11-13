"""
trip_planner.py - lõi lập lịch DanaGO: điểm tham quan + bữa ăn + nơi nghỉ.

Quy ước:
- budget_pp: ngân sách MỖI NGƯỜI cho cả chuyến (VND) = vé + ăn uống + nơi nghỉ. Đi lại không tính tiền.
- Mỗi ngày: bữa sáng, tối đa 3 điểm tham quan, bữa trưa, bữa tối; ngày không phải ngày cuối có nghỉ đêm.
- Nơi nghỉ: nếu người dùng chọn (lodging_ids) thì dùng đúng nơi đó; nếu không thì chọn nơi đánh giá cao
  nhất trong vùng của ngày đó mà vẫn nằm trong ngân sách.
- Số đêm nghỉ = num_days - 1.
"""
import math
import random
import numpy as np
import pandas as pd

PLACES_PER_DAY = 3
DAY_START = 7 * 60 + 30         # bắt đầu bữa sáng 07:30
DAY_END = 21 * 60 + 30          # kết thúc trong ngày muộn nhất 21:30
TRAVEL_KMH = 25.0
MIN_TRAVEL = 5
INTERESTS = ["Biển & đảo", "Ẩm thực", "Văn hóa & lịch sử", "Thiên nhiên & khám phá", "Vui chơi & check-in"]
# (cửa sổ bắt đầu, cửa sổ kết thúc, thời lượng)
MEALS = {"breakfast": (7 * 60, 10 * 60, 45), "lunch": (11 * 60, 14 * 60, 60),
         "dinner": (17 * 60, 19 * 60, 60)}
MEAL_LABEL = {"breakfast": "Bữa sáng", "lunch": "Bữa trưa", "dinner": "Bữa tối"}
REST_DUR = 60
CHECKOUT_DUR = 10


# ------------------------------------------------------------------ tiện ích
def load_places(csv_path):
    df = pd.read_csv(csv_path, encoding="utf-8-sig")
    if "status" in df.columns:
        df = df[df["status"].eq("APPROVED")]
    df = df.reset_index(drop=True)
    df["price_est"] = df["price_est"].fillna(0).astype(float)
    df["visit_duration_min"] = df["visit_duration_min"].fillna(90).astype(int)
    df["open_time"] = df["open_time"].astype(int)
    df["close_time"] = df["close_time"].astype(int)
    if "is_food" in df.columns:
        df["is_food"] = df["is_food"].astype(str).str.lower().isin(["true", "1"])
    else:
        df["is_food"] = False
    # Phân loại cờ rõ ràng: quán ăn/nhà hàng (is_meal) vs quán cà phê/tiệm trà (is_cafe)
    df["is_cafe"] = df["category"].astype(str).str.contains("Cà phê|Tiệm trà", case=False, na=False)
    df["is_meal"] = df["is_food"] & (~df["is_cafe"])
    return df


def load_lodging(csv_path):
    lo = pd.read_csv(csv_path, encoding="utf-8-sig")
    if "status" in lo.columns:
        lo = lo[lo["status"].eq("APPROVED")]
    lo = lo.reset_index(drop=True)
    lo["price_pp_night"] = lo["price_pp_night"].astype(float)
    lo["checkin_min"] = lo["checkin_min"].astype(int)
    lo["checkout_min"] = lo["checkout_min"].astype(int)
    return lo


def haversine_km(lat1, lon1, lat2, lon2):
    r = 6371.0
    p1, p2 = math.radians(lat1), math.radians(lat2)
    a = math.sin((p2 - p1) / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(math.radians(lon2 - lon1) / 2) ** 2
    return 2 * r * math.asin(math.sqrt(a))


def travel_min(a, b):
    if a is None or b is None:
        return 0
    km = haversine_km(a["latitude"], a["longitude"], b["latitude"], b["longitude"])
    return max(MIN_TRAVEL, round(km / TRAVEL_KMH * 60))


def hm(m):
    m = int(m)
    return f"{m // 60:02d}:{m % 60:02d}"


def _record(r):
    return {
        "id": int(r["id"]), "name": r["name"], "category": r["category"],
        "interest_group": r["interest_group"], "is_food": bool(r.get("is_food", False)),
        "is_cafe": bool(r.get("is_cafe", False)), "is_meal": bool(r.get("is_meal", False)),
        "region": r["region"], "district": r["district"],
        "latitude": float(r["latitude"]), "longitude": float(r["longitude"]),
        "price_text": r["price_text"], "price_est": int(r["price_est"]),
        "avg_rating": float(r["avg_rating"]), "visit_duration_min": int(r["visit_duration_min"]),
        "open": hm(r["open_time"]), "close": hm(r["close_time"]),
    }


def _pool(df, interests, budget_pp=None, region=None, include_food=False, premium_boost=0.0, randomize=False):
    """
    premium_boost > 0: điểm có vé cao hơn được ưu tiên hơn khi ngân sách còn nhiều.
    Công thức: score = avg_rating + premium_boost * min(price_est / 600_000, 1.0)
    randomize=True: thêm độ nhiễu ngẫu nhiên vào điểm để mỗi lần lập lịch ra các phương án đa dạng, không bị cố định.
    """
    d = df
    if interests:
        d = d[d["interest_group"].isin(interests)]
    if region:
        d = d[d["region"] == region]
    if budget_pp is not None:
        d = d[d["price_est"] <= budget_pp]
    if not include_food:
        d = d[~d["is_food"]]
    d = d.copy()
    base_score = d["avg_rating"].astype(float)
    if premium_boost > 0:
        base_score = base_score + premium_boost * (d["price_est"] / 600_000.0).clip(upper=1.0)
    if randomize and len(d) > 0:
        jitter = np.random.uniform(-0.3, 0.3, size=len(d))
        d["_score"] = base_score + jitter
    else:
        d["_score"] = base_score
    d = d.sort_values(["_score", "id"], ascending=[False, True])
    has = d[d["site_group"].notna()].drop_duplicates(subset=["site_group"], keep="first") if "site_group" in d.columns else d.iloc[0:0]
    rest = d[d["site_group"].isna()] if "site_group" in d.columns else d
    result = pd.concat([has, rest]).sort_values(["_score", "id"], ascending=[False, True])
    if "_score" in result.columns:
        result = result.drop(columns=["_score"])
    return result


def get_candidates(df, interests, budget_pp=None, region=None, per_group=6, scores=None, top_k=10, include_food=True):
    if interests:
        bad = [i for i in interests if i not in INTERESTS]
        if bad:
            raise ValueError(f"Nhóm sở thích không hợp lệ: {bad}")
    pool = _pool(df, interests, budget_pp, region, include_food=include_food)
    if scores:
        pool = pool.assign(_s=pool["id"].map(lambda i: scores.get(int(i), 0.0)))
        pool = pool.sort_values(["_s", "avg_rating"], ascending=[False, False])

    def rec(r):
        x = _record(r)
        if scores:
            x["match_score"] = round(float(scores.get(int(r["id"]), 0.0)), 4)
        return x

    groups = {}
    for g in (interests or INTERESTS):
        sub = pool[pool["interest_group"] == g].head(per_group)
        groups[g] = [rec(r) for _, r in sub.iterrows()]
    top = [rec(r) for _, r in pool.head(top_k).iterrows()]
    return {"groups": groups, "top": top}


# ------------------------------------------------------------------ mô phỏng một ngày
def _food_choice(foods, loc, t, kind, exclude_ids=None, randomize=True):
    """
    Chọn quán ăn gần loc nhất, mở cửa và kịp trong cửa sổ bữa. Trả về (quán, bắt đầu) hoặc (None, None).
    - kind in ['lunch', 'dinner']: BẮT BUỘC là quán ăn/nhà hàng (is_meal), TUYỆT ĐỐI không chọn quán cà phê.
    - kind == 'breakfast': Ưu tiên quán ăn sáng thực thụ (mì Quảng, bún chả cá, bánh mì...), chỉ chọn cà phê nếu không có quán ăn.
    - exclude_ids: Loại trừ các quán đã được chọn trong lịch trình để tránh lặp quán.
    - randomize=True: Chọn ngẫu nhiên trong top 3 quán ăn phù hợp gần nhất để tăng tính phong phú, đa dạng.
    """
    ws, we, dur = MEALS[kind]
    cands = foods.copy()
    if cands.empty:
        return None, None

    # Lọc bỏ các quán đã dùng trước đó trong chuyến đi
    if exclude_ids:
        fresh = cands[~cands["id"].isin(exclude_ids)]
        if len(fresh):
            cands = fresh

    is_cafe_mask = cands["category"].astype(str).str.contains("Cà phê|Tiệm trà", case=False, na=False)
    meals_only = cands[~is_cafe_mask]

    if kind in ["lunch", "dinner"]:
        # Bữa trưa và Bữa tối: Tuyệt đối không chọn quán cà phê
        if len(meals_only):
            cands = meals_only
        else:
            return None, None
    elif kind == "breakfast":
        # Bữa sáng: Ưu tiên quán ăn sáng truyền thống
        if len(meals_only):
            early_meals = meals_only[meals_only["open_time"] <= ws + 60]
            if len(early_meals):
                cands = early_meals
            else:
                cands = meals_only
        else:
            early = cands[cands["open_time"] <= ws + 60]
            if len(early):
                cands = early

    if loc is not None and len(cands):
        cands = cands.assign(_d=[haversine_km(loc["latitude"], loc["longitude"], r["latitude"], r["longitude"])
                                 for _, r in cands.iterrows()]).sort_values("_d")
    valid_cands = []
    for _, f in cands.iterrows():
        start = max(t + travel_min(loc, f), int(f["open_time"]), ws)
        if start <= we and start + dur <= int(f["close_time"]):
            valid_cands.append((f.to_dict(), start))
            if len(valid_cands) >= 3:
                break
    if valid_cands:
        if randomize:
            return random.choice(valid_cands)
        return valid_cands[0]
    return None, None


def simulate_day(atts, foods, lodging, prev_lodging, prev_checkout_min, need_night, include_meals=True, used_food_ids=None, randomize=True):
    """
    Thứ tự một ngày:
      [trả phòng đêm trước] -> bữa sáng -> tham quan (sáng) -> bữa trưa
      -> nghỉ ngơi ở khách sạn (nếu có đêm nghỉ) -> tham quan (chiều) -> tham quan (tối)
      -> bữa tối -> về lại khách sạn (nếu có đêm nghỉ)
    Trả về (items, end_loc) nếu khả thi, ngược lại None.
    """
    items, t, loc = [], DAY_START, prev_lodging
    seq = list(atts)
    if not seq:
        return None
    slots = ["sáng", "chiều", "tối"]
    day_used_foods = set(used_food_ids or [])

    def free_meal_item(kind, t_start, anchor_loc):
        label_map = {"breakfast": "Bữa sáng (Tự túc)", "lunch": "Bữa trưa (Tự túc)", "dinner": "Bữa tối (Tự túc)"}
        name_map = {
            "breakfast": "Tự túc bữa sáng tại nơi nghỉ hoặc tự do",
            "lunch": "Nghỉ ngơi & tự túc ăn trưa",
            "dinner": "Tự túc bữa tối & khám phá phố đêm",
        }
        ws, we, dur = MEALS[kind]
        actual_start = max(t_start, ws)
        c_lat = float(anchor_loc["latitude"]) if anchor_loc is not None else float(seq[0]["latitude"])
        c_lng = float(anchor_loc["longitude"]) if anchor_loc is not None else float(seq[0]["longitude"])
        c_dist = str(anchor_loc.get("district", "")) if (anchor_loc is not None and pd.notna(anchor_loc.get("district"))) else ""
        c_reg = str(anchor_loc.get("region", "")) if (anchor_loc is not None and pd.notna(anchor_loc.get("region"))) else ""
        return {
            "type": kind,
            "label": label_map.get(kind, "Ăn uống"),
            "id": 0,
            "name": name_map.get(kind, "Tự túc ăn uống"),
            "district": c_dist,
            "region": c_reg,
            "start": hm(actual_start),
            "end": hm(actual_start + dur),
            "price_text": "Tự túc",
            "price_est": 0,
            "latitude": c_lat,
            "longitude": c_lng,
        }

    # trả phòng đêm trước + bữa sáng
    if prev_lodging is not None:
        if include_meals:
            f, s = _food_choice(foods, prev_lodging, t, "breakfast", exclude_ids=day_used_foods, randomize=randomize)
            if f is None:
                items.append({"type": "breakfast", "label": "Ăn sáng tại khách sạn", "id": int(prev_lodging["id"]),
                              "name": prev_lodging["name"],
                              "district": str(prev_lodging.get("district", "")) if pd.notna(prev_lodging.get("district")) else "",
                              "region": str(prev_lodging.get("region", "")) if pd.notna(prev_lodging.get("region")) else "",
                              "start": hm(t), "end": hm(t + 30),
                              "price_text": "", "price_est": 0,
                              "latitude": float(prev_lodging["latitude"]), "longitude": float(prev_lodging["longitude"])})
                t = t + 30
            else:
                day_used_foods.add(int(f["id"]))
                items.append(_item("breakfast", f, s, s + MEALS["breakfast"][2]))
                t = s + MEALS["breakfast"][2]
        else:
            items.append(free_meal_item("breakfast", t, prev_lodging))
            t = t + MEALS["breakfast"][2]
        loc = prev_lodging
        # Nếu cùng một nơi nghỉ qua đêm thì không cần làm thủ tục trả phòng buổi sáng
        is_same_hotel = need_night and lodging is not None and int(prev_lodging["id"]) == int(lodging["id"])
        if not is_same_hotel:
            co = t
            items.append(_checkout(prev_lodging, co, co + CHECKOUT_DUR))
            t, loc = co + CHECKOUT_DUR, prev_lodging
    else:
        if include_meals:
            f, s = _food_choice(foods, seq[0], t, "breakfast", exclude_ids=day_used_foods, randomize=randomize)
            if f is None:
                return None
            day_used_foods.add(int(f["id"]))
            items.append(_item("breakfast", f, s, s + MEALS["breakfast"][2]))
            t, loc = s + MEALS["breakfast"][2], f
        else:
            items.append(free_meal_item("breakfast", t, seq[0]))
            t = t + MEALS["breakfast"][2]
            loc = seq[0]

    def place_att(a, t, loc, slot):
        st = max(t + travel_min(loc, a), int(a["open_time"]))
        en = st + int(a["visit_duration_min"])
        if en > int(a["close_time"]) or en > DAY_END:
            return None
        return _item("attraction", a, st, en, slot)

    def place_meal(kind, t, loc):
        if not include_meals:
            return free_meal_item(kind, t, loc)
        f, s = _food_choice(foods, loc, t, kind, exclude_ids=day_used_foods, randomize=randomize)
        if f is None:
            return None
        day_used_foods.add(int(f["id"]))
        return _item(kind, f, s, s + MEALS[kind][2])

    # tham quan (sáng)
    it = place_att(seq[0], t, loc, "sáng")
    if it is None:
        return None
    items.append(it); t, loc = hm_to_min(it["end"]), seq[0]
    # bữa trưa
    it = place_meal("lunch", t, loc)
    if it is None:
        return None
    items.append(it)
    t = hm_to_min(it["end"])
    loc = (foods_row(foods, it["id"]) if it.get("id") else None) or loc

    # nghỉ ngơi ở khách sạn (chờ nhận phòng nếu chưa đến giờ)
    if need_night:
        if lodging is None:
            return None
        arr = t + travel_min(loc, lodging)
        is_same_hotel = prev_lodging is not None and int(prev_lodging["id"]) == int(lodging["id"])
        if is_same_hotel:
            # Cùng một nơi nghỉ: về phòng nghỉ ngơi buổi trưa mà không cần chờ nhận phòng lại
            st = max(arr, t)
            items.append({"type": "checkin", "label": "Nghỉ ngơi ở khách sạn", "id": int(lodging["id"]), "name": lodging["name"],
                          "district": str(lodging.get("district", "")) if pd.notna(lodging.get("district")) else "",
                          "region": str(lodging.get("region", "")) if pd.notna(lodging.get("region")) else "",
                          "start": hm(st), "end": hm(st + REST_DUR), "price_text": "", "price_est": 0,
                          "latitude": float(lodging["latitude"]), "longitude": float(lodging["longitude"])})
            t, loc = st + REST_DUR, lodging
        else:
            st = max(arr, int(lodging["checkin_min"]))
            items.append(_checkin(lodging, st, st + REST_DUR))
            t, loc = st + REST_DUR, lodging

    # 1. Tham quan (chiều) nếu có từ 2 điểm trở lên
    att_afternoon = None
    att_evening = None
    if len(seq) == 2:
        att_afternoon = seq[1]
    elif len(seq) >= 3:
        # Nếu có 3 điểm: ưu tiên điểm đóng cửa sớm vào ca chiều, điểm mở khuya vào ca tối
        a1, a2 = seq[1], seq[2]
        if int(a2["close_time"]) < 19 * 60 and int(a1["close_time"]) >= int(a2["close_time"]):
            att_afternoon, att_evening = a2, a1
        else:
            att_afternoon, att_evening = a1, a2

    if att_afternoon is not None:
        it = place_att(att_afternoon, t, loc, "chiều")
        if it is None:
            return None
        items.append(it)
        t, loc = hm_to_min(it["end"]), att_afternoon

    # 2. Bữa tối (Ăn tối lúc ~17:00 - 18:30 trước khi đi chơi tối)
    it = place_meal("dinner", t, loc)
    if it is None:
        return None
    items.append(it)
    t = hm_to_min(it["end"])
    loc = (foods_row(foods, it["id"]) if it.get("id") else None) or loc

    # 3. Tham quan (tối) nếu có điểm thứ 3 (Đi chơi tối lúc ~19:00 - 20:30)
    if att_evening is not None:
        it = place_att(att_evening, t, loc, "tối")
        if it is None:
            return None
        items.append(it)
        t, loc = hm_to_min(it["end"]), att_evening

    # 4. Về lại khách sạn
    if need_night:
        st = t + travel_min(loc, lodging)
        if st > DAY_END:
            return None
        items.append(_return(lodging, st, st + 10))
        t, loc = st + 10, lodging
    if t > DAY_END:
        return None
    return items, loc


def hm_to_min(s):
    h, m = str(s).split(":")
    return int(h) * 60 + int(m)


def foods_row(foods, item_id):
    row = foods[foods["id"] == item_id]
    return row.iloc[0].to_dict() if len(row) else None


def _return(lo, st, en):
    lo = dict(lo)
    return {"type": "return", "label": "Về lại khách sạn", "id": int(lo["id"]), "name": lo["name"],
            "district": str(lo.get("district", "")) if pd.notna(lo.get("district")) else "",
            "region": str(lo.get("region", "")) if pd.notna(lo.get("region")) else "",
            "start": hm(st), "end": hm(en), "price_text": "", "price_est": 0,
            "latitude": float(lo["latitude"]), "longitude": float(lo["longitude"])}


def _item(kind, r, st, en, slot=None):
    r = dict(r)
    label = MEAL_LABEL.get(kind, "Tham quan")
    if kind == "attraction":
        label = f"Tham quan ({slot})" if slot else "Tham quan"
    return {"type": kind, "label": label, "id": int(r["id"]), "name": r["name"],
            "district": str(r.get("district", "")) if pd.notna(r.get("district")) else "",
            "region": str(r.get("region", "")) if pd.notna(r.get("region")) else "",
            "start": hm(st), "end": hm(en), "price_text": r.get("price_text", ""),
            "price_est": int(r.get("price_est", 0)),
            "latitude": float(r["latitude"]), "longitude": float(r["longitude"])}


def _checkin(lo, st, en):
    lo = dict(lo)
    return {"type": "checkin", "label": "Nghỉ ngơi ở khách sạn", "id": int(lo["id"]), "name": lo["name"],
            "district": str(lo.get("district", "")) if pd.notna(lo.get("district")) else "",
            "region": str(lo.get("region", "")) if pd.notna(lo.get("region")) else "",
            "start": hm(st), "end": hm(en), "price_text": f"{int(lo['price_per_night']):,}đ/đêm (cả phòng)",
            "price_est": 0, "latitude": float(lo["latitude"]), "longitude": float(lo["longitude"])}


def _checkout(lo, st, en):
    lo = dict(lo)
    return {"type": "checkout", "label": "Trả phòng", "id": int(lo["id"]), "name": lo["name"],
            "district": str(lo.get("district", "")) if pd.notna(lo.get("district")) else "",
            "region": str(lo.get("region", "")) if pd.notna(lo.get("region")) else "",
            "start": hm(st), "end": hm(en), "price_text": "", "price_est": 0,
            "latitude": float(lo["latitude"]), "longitude": float(lo["longitude"])}


# ------------------------------------------------------------------ lập lịch nhiều ngày
def make_plan(df, num_days, budget_pp, interests=None, region=None, selected_ids=None,
              lodging_df=None, lodging_ids=None, max_lodging_tries=8,
              include_meals=True, include_lodging=True, guests_per_room=2, randomize=True):
    """
    df: điểm tham quan + quán ăn (đã APPROVED)
    lodging_df: nơi nghỉ (đã APPROVED); None thì không có nghỉ đêm
    selected_ids: id điểm tham quan người dùng chọn
    lodging_ids: id nơi nghỉ người dùng chọn, theo thứ tự từng đêm
    include_meals: có tính chi phí và xếp các quán ăn cho bữa sáng, trưa, tối hay không
    include_lodging: có tính chi phí và xếp nơi lưu trú hay không
    guests_per_room: số người chia sẻ mỗi phòng/căn (1 = ở phòng đơn / bao trọn phòng, >=2 = chia sẻ phòng)
    randomize: đa dạng hoá kết quả để mỗi lần bấm tạo lịch sẽ cho ra các gợi ý mới mẻ
    """
    warnings = []
    selected_ids = [int(i) for i in (selected_ids or [])]
    lodging_ids = [int(i) for i in (lodging_ids or [])]
    if not include_lodging:
        lodging_df = None
        lodging_ids = []
    nights = max(0, num_days - 1) if lodging_df is not None else 0

    # Nếu người dùng đi 1 mình (guests_per_room == 1), tính giá cả phòng (price_per_night)
    # và loại bỏ các căn Villa lớn (> 4 khách) để tránh việc 1 người bị xếp vào ở Villa nguyên căn.
    if lodging_df is not None:
        lodging_df = lodging_df.copy()
        if guests_per_room <= 1:
            lodging_df["price_pp_night"] = lodging_df["price_per_night"].astype(float)
            # Không tự động xếp Villa nguyên căn nhiều phòng ngủ cho người đi 1 mình
            lodging_df = lodging_df[~((lodging_df["type"] == "Villa") & (lodging_df["max_guests"] > 2))]
        else:
            # Nếu đi theo nhóm: chia theo guests_per_room nhưng không vượt quá max_guests
            def calc_pp(row):
                divisor = max(1, min(int(row["max_guests"]), guests_per_room))
                return float(row["price_per_night"]) / divisor
            lodging_df["price_pp_night"] = lodging_df.apply(calc_pp, axis=1)

    by_id = {int(r["id"]): r for _, r in df.iterrows()}
    meal_cap = max(150_000.0, budget_pp / (3 * max(1, num_days)) * 1.5)
    foods_all = df[df["is_food"] & (df["price_est"] <= meal_cap)]
    # Tính premium_boost: khi không có meals + lodging, dư nhiều budget → ưu tiên địa điểm có vé cao hơn
    # để AI chủ động chọn trải nghiệm premium thay vì chỉ đi chùa miễn phí.
    free_services_budget = 0.0
    if not include_meals:
        free_services_budget += budget_pp * 0.35   # tiết kiệm ~35% so với có bữa ăn
    if not include_lodging:
        free_services_budget += budget_pp * 0.25   # tiết kiệm ~25% so với có nơi nghỉ
    # premium_boost tỷ lệ thuận với ngân sách dư thêm (0.0 khi đủ cả meals+lodging, tới 1.5 khi tự túc hết)
    premium_boost = min(1.5, free_services_budget / max(1, budget_pp))

    # Khi premium_boost đáng kể (người dùng tự túc nhiều), mở rộng interests để lấy địa điểm premium
    # ngoài nhóm sở thích chính (Bà Nà Hills, Hội An Memories, Núi Thần Tài...)
    pool_interests = list(interests or [])
    # Nếu sở thích chỉ chọn "Ẩm thực", cần bổ sung điểm tham quan tổng hợp (Văn hóa, Check-in, Biển)
    # vì các dòng "Ẩm thực" là quán ăn/chợ, không có điểm tham quan độc lập
    attraction_interests = [i for i in pool_interests if i != "Ẩm thực"]
    if not attraction_interests:
        pool_interests = ["Văn hóa & lịch sử", "Vui chơi & check-in", "Biển & đảo"]
    elif premium_boost >= 0.3 and "Vui chơi & check-in" not in pool_interests:
        # Thêm "Vui chơi & check-in" để có các địa điểm premium (Bà Nà 600k, Thần Tài 450k, v.v.)
        pool_interests = pool_interests + ["Vui chơi & check-in"]
    pool = _pool(df, pool_interests, None, region, premium_boost=premium_boost, randomize=randomize)
    if include_meals:
        day_reserve = max(400_000.0, 0.5 * budget_pp / max(1, num_days))
    else:
        day_reserve = max(50_000.0, 0.2 * budget_pp / max(1, num_days))
    min_night = float(lodging_df["price_pp_night"].min()) if lodging_df is not None else 0.0

    used, spent = set(), 0.0
    trip_used_food_ids = set()
    chosen_lodging = {}
    if lodging_df is not None and lodging_ids:
        lo_by_id = {int(r["id"]): r for _, r in lodging_df.iterrows()}
        for k, lid in enumerate(lodging_ids[:nights]):
            if lid in lo_by_id:
                chosen_lodging[k + 1] = lo_by_id[lid].to_dict()
            else:
                warnings.append(f"Không tìm thấy nơi nghỉ id {lid}.")

    def plan_day_in_region(reg, d, prev_lo, prev_checkout, need_night, reserve_after, spent_now, lodging_fixed, used_food_ids=None):
        """Thử xếp một ngày ở vùng reg. Trả về dict hoặc None."""
        foods = foods_all[foods_all["region"] == reg]
        if foods.empty:
            foods = foods_all
        # các phương án nơi nghỉ (theo đánh giá giảm dần, trong ngân sách)
        lo_options = []
        if need_night:
            if lodging_fixed is not None:
                lo_options = [lodging_fixed]
                # Thêm các nơi nghỉ trong vùng reg dự phòng nếu nơi cố định không khả thi do khoảng cách / giờ giấc
                cands = lodging_df[lodging_df["region"] == reg].sort_values(["avg_rating", "id"], ascending=[False, True])
                for _, lo in cands.iterrows():
                    if int(lo["id"]) != int(lodging_fixed.get("id", -1)):
                        lo_options.append(lo.to_dict())
                    if len(lo_options) >= max_lodging_tries:
                        break
            elif prev_lo is not None and prev_lo.get("region") == reg:
                # Nếu cùng khu vực (region): BẮT BUỘC giữ nguyên nơi nghỉ đêm trước, không đổi khách sạn
                lo_options = [prev_lo]
            else:
                cands = lodging_df[lodging_df["region"] == reg].copy()
                if randomize and not cands.empty:
                    cands["_score"] = cands["avg_rating"].astype(float) + np.random.uniform(-0.2, 0.2, size=len(cands))
                    cands = cands.sort_values(["_score", "id"], ascending=[False, True])
                else:
                    cands = cands.sort_values(["avg_rating", "id"], ascending=[False, True])
                for _, lo in cands.iterrows():
                    if spent_now + lo["price_pp_night"] + reserve_after + day_reserve <= budget_pp:
                        lo_options.append(lo.to_dict())
                    if len(lo_options) >= max_lodging_tries:
                        break
            if not lo_options:
                lo_options = [None]   # sẽ dùng nơi rẻ nhất ở phần sau
        else:
            lo_options = [None]

        ordered = [by_id[i] for i in selected_ids if i in by_id and i not in used and by_id[i]["region"] == reg]
        ids_ordered = {int(r["id"]) for r in ordered}
        rest_rows = [r for _, r in pool[(pool["region"] == reg) & (~pool["id"].isin(used))].iterrows()
                     if int(r["id"]) not in ids_ordered]
        cand_rows = list(ordered) + rest_rows

        for lo in lo_options:
            if need_night and lo is None:
                cheapest = lodging_df.sort_values("price_pp_night").iloc[0].to_dict()
                lo = cheapest
            night_cost = float(lo["price_pp_night"]) if need_night and lo is not None else 0.0
            day_cap = budget_pp - spent_now - night_cost - reserve_after
            seq, items_best, day_spent = [], None, 0.0
            for r in cand_rows:
                if len(seq) == PLACES_PER_DAY:
                    break
                sim = simulate_day(seq + [r], foods, lo if need_night else None, prev_lo, prev_checkout, need_night, include_meals=include_meals, used_food_ids=used_food_ids, randomize=randomize)
                if sim is None:
                    continue
                items_try, _ = sim
                cost_try = sum(i["price_est"] for i in items_try)
                if cost_try > day_cap:
                    continue
                seq.append(r)
                day_spent = cost_try
                items_best = items_try
            if items_best is not None and seq:
                return {"seq": seq, "items": items_best, "lodging": lo if need_night else None,
                        "cost": day_spent, "night_cost": night_cost}
        return None

    days_out = []
    for d in range(1, num_days + 1):
        need_night = d < num_days and lodging_df is not None
        days_after = num_days - d
        nights_after = max(0, nights - d)
        reserve_after = day_reserve * days_after + min_night * nights_after
        prev_lo = chosen_lodging.get(d - 1) if d > 1 else None
        prev_checkout = int(prev_lo["checkout_min"]) if prev_lo else None
        lodging_fixed = chosen_lodging.get(d) if need_night else None

        left_sel = [i for i in selected_ids if i in by_id and i not in used]
        avail = pool[~pool["id"].isin(used)]
        if left_sel:
            regions_try = [by_id[left_sel[0]]["region"]]
        else:
            regions_try = []
            if prev_lo is not None and prev_lo["region"] in set(avail["region"]):
                regions_try.append(prev_lo["region"])   # ngày bắt đầu từ vùng nơi nghỉ đêm trước
            for g in sorted(avail["region"].unique(),
                            key=lambda g: -avail[avail["region"] == g]["avg_rating"].head(3).sum()):
                if g not in regions_try:
                    regions_try.append(g)

        res, reg_used = None, None
        for reg in regions_try:
            res = plan_day_in_region(reg, d, prev_lo, prev_checkout, need_night, reserve_after, spent, lodging_fixed, used_food_ids=trip_used_food_ids)
            if res is not None:
                reg_used = reg
                break

        if res is None:
            warnings.append(f"Ngày {d}: Không thể xếp lịch tham quan do ngân sách dự tính quá thấp hoặc tiêu chí quá chặt. Bạn nên tăng ngân sách, chọn tự túc ăn uống / nơi ở hoặc mở rộng khu vực.")
            days_out.append({"day": d, "region": None, "items": [], "night": None, "cost_pp": 0})
            continue

        if need_night and res["lodging"] is not None:
            chosen_lodging[d] = res["lodging"]
            if lodging_fixed is not None and lodging_fixed.get("region") != reg_used:
                warnings.append(f"Ngày {d}: nơi nghỉ {lodging_fixed['name']} nằm ngoài vùng {reg_used} của ngày này.")
        if lodging_fixed is None and need_night and res["lodging"] is not None and res["lodging"]["region"] != reg_used:
            warnings.append(f"Ngày {d}: nơi nghỉ {res['lodging']['name']} nằm ngoài vùng {reg_used}.")
        if len(res["seq"]) < PLACES_PER_DAY:
            warnings.append(f"Ngày {d} chỉ có {len(res['seq'])}/{PLACES_PER_DAY} điểm tham quan.")
        used.update(int(r["id"]) for r in res["seq"])
        for it in res["items"]:
            if it.get("type") in ["breakfast", "lunch", "dinner"] and it.get("id"):
                trip_used_food_ids.add(int(it["id"]))
        spent += res["cost"] + res["night_cost"]
        lo = res["lodging"]
        days_out.append({
            "day": d, "region": reg_used, "items": res["items"],
            "night": ({"id": int(lo["id"]), "name": lo["name"],
                       "district": str(lo.get("district", "")) if pd.notna(lo.get("district")) else "",
                       "region": str(lo.get("region", "")) if pd.notna(lo.get("region")) else "",
                       "price_pp_night": int(lo["price_pp_night"]),
                       "checkin": lo["checkin"], "checkout": lo["checkout"],
                       "address_url": lo.get("address_url", "")} if need_night and lo is not None else None),
            "cost_pp": int(res["cost"] + res["night_cost"]),
        })

    for i in selected_ids:
        if i in by_id and i not in used:
            warnings.append(f"Không xếp được {by_id[i]['name']} vào lịch.")
    if spent > budget_pp:
        warnings.append(f"Tổng chi phí {int(spent):,}đ/người vượt ngân sách {int(budget_pp):,}đ "
                        f"(thường do nơi nghỉ bạn đã chọn đắt hơn ngân sách).")
    return {
        "num_days": num_days, "budget_pp": int(budget_pp), "total_cost_pp": int(spent),
        "budget_left_pp": int(budget_pp - spent), "days": days_out, "warnings": warnings,
    }