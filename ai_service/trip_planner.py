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
# Chi phí ăn uống không tính vào ngân sách, chỉ gợi ý quán
MEAL_PRICE_TEXT = "Tùy theo món ăn"
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


def _normalize_regions(region):
    """Chuẩn hóa tham số region (có thể là None, chuỗi đơn, chuỗi phân cách dấu phẩy, hoặc list) thành list các khu vực."""
    if not region:
        return []
    if isinstance(region, str):
        parts = [r.strip() for r in region.split(",") if r.strip() and r.strip() != "Tất cả khu vực"]
        return parts
    if isinstance(region, (list, tuple, set)):
        out = []
        for item in region:
            if isinstance(item, str):
                for sub in item.split(","):
                    s = sub.strip()
                    if s and s != "Tất cả khu vực" and s not in out:
                        out.append(s)
        return out
    return []


def _pool(df, interests, budget_pp=None, region=None, include_food=False, premium_boost=0.0, randomize=False):
    """
    premium_boost > 0: điểm có vé cao hơn được ưu tiên hơn khi ngân sách còn nhiều.
    Công thức: score = avg_rating + premium_boost * min(price_est / 600_000, 1.0)
    randomize=True: thêm độ nhiễu ngẫu nhiên vào điểm để mỗi lần lập lịch ra các phương án đa dạng, không bị cố định.
    """
    d = df
    if interests:
        d = d[d["interest_group"].isin(interests)]
    target_regions = _normalize_regions(region)
    if target_regions:
        d = d[d["region"].isin(target_regions)]
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


def _arrange_day_seq(atts):
    """
    Sắp xếp thứ tự các điểm trong ngày hợp lý:
    - Nếu có điểm thời lượng dài (>= 240p) và mở cửa buổi sáng (<= 09:00), đưa lên đầu ngày (ca sáng - trưa) để khởi hành sớm & ăn trưa tại điểm.
    - Điểm chỉ mở cửa chiều/tối (open_time >= 13:00 như Asia Park) luôn xếp về sau.
    - Trong các điểm buổi chiều/tối: ưu tiên điểm đóng cửa sớm (< 19:00) vào ca chiều, điểm mở muộn vào ca tối.
    """
    seq = list(atts)
    if len(seq) <= 1:
        return seq

    long_morning_idx = None
    best_dur = -1
    for idx, r in enumerate(seq):
        dur = int(r.get("visit_duration_min", 90))
        op = int(r.get("open_time", 0))
        if dur >= 240 and op <= 9 * 60 and dur > best_dur:
            best_dur = dur
            long_morning_idx = idx

    if long_morning_idx is not None and long_morning_idx != 0:
        first = seq.pop(long_morning_idx)
        seq.insert(0, first)
    elif int(seq[0].get("open_time", 0)) >= 13 * 60:
        for idx in range(1, len(seq)):
            if int(seq[idx].get("open_time", 0)) < 13 * 60:
                first = seq.pop(idx)
                seq.insert(0, first)
                break

    if len(seq) >= 3:
        a1, a2 = seq[1], seq[2]
        if int(a2["close_time"]) < 19 * 60 and int(a1["close_time"]) >= int(a2["close_time"]):
            seq[1], seq[2] = a2, a1
    return seq


def simulate_day(atts, foods, lodging, prev_lodging, prev_checkout_min, need_night, include_meals=True, used_food_ids=None, randomize=True):
    """
    Thứ tự một ngày:
      [trả phòng đêm trước] -> bữa sáng -> tham quan (sáng) -> bữa trưa
      -> nghỉ ngơi ở khách sạn (nếu có đêm nghỉ) -> tham quan (chiều) -> tham quan (tối)
      -> bữa tối -> về lại khách sạn (nếu có đêm nghỉ)
    Đặc biệt với các điểm có thời gian du lịch dài (>= 240 phút như Bà Nà Hills, Núi Thần Tài, Cù Lao Chàm, VinWonders, Asia Park...):
      - Cho khởi hành sớm hơn (06:45) + ăn sáng nhanh (30p)
      - Cắt bớt buổi đi ăn rời bên ngoài (kết hợp ăn uống & nghỉ ngơi trực tiếp tại khu du lịch) để giữ trọn thời gian trải nghiệm.
    Trả về (items, end_loc) nếu khả thi, ngược lại None.
    """
    raw_seq = list(atts)
    if not raw_seq:
        return None
    seq = _arrange_day_seq(raw_seq)
    has_long_morning = int(seq[0].get("visit_duration_min", 90)) >= 240 and int(seq[0].get("open_time", 0)) <= 9 * 60
    day_start_min = (6 * 60 + 45) if has_long_morning else DAY_START
    breakfast_dur = 30 if has_long_morning else MEALS["breakfast"][2]

    items, t, loc = [], day_start_min, prev_lodging
    day_used_foods = set(used_food_ids or [])

    def free_meal_item(kind, t_start, anchor_loc, custom_dur=None):
        label_map = {"breakfast": "Bữa sáng (Tự túc)", "lunch": "Bữa trưa (Tự túc)", "dinner": "Bữa tối (Tự túc)"}
        name_map = {
            "breakfast": "Tự túc bữa sáng tại nơi nghỉ hoặc tự do",
            "lunch": "Nghỉ ngơi & tự túc ăn trưa",
            "dinner": "Tự túc bữa tối & khám phá phố đêm",
        }
        ws, we, dur = MEALS[kind]
        if custom_dur is not None:
            dur = custom_dur
        actual_start = max(t_start, (6 * 60 + 45) if (kind == "breakfast" and has_long_morning) else ws)
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
        is_same_hotel = need_night and lodging is not None and int(prev_lodging["id"]) == int(lodging["id"])
        if not is_same_hotel:
            items.append(_checkout(prev_lodging, t, t + CHECKOUT_DUR))
            t, loc = t + CHECKOUT_DUR, prev_lodging
        if include_meals:
            f, s = _food_choice(foods, prev_lodging, t, "breakfast", exclude_ids=day_used_foods, randomize=randomize)
            if f is None or (has_long_morning and s > 7 * 60 + 25):
                items.append({"type": "breakfast", "label": "Ăn sáng sớm tại khách sạn" if has_long_morning else "Ăn sáng tại khách sạn",
                              "id": int(prev_lodging["id"]),
                              "name": prev_lodging["name"],
                              "district": str(prev_lodging.get("district", "")) if pd.notna(prev_lodging.get("district")) else "",
                              "region": str(prev_lodging.get("region", "")) if pd.notna(prev_lodging.get("region")) else "",
                              "start": hm(t), "end": hm(t + breakfast_dur),
                              "price_text": MEAL_PRICE_TEXT, "price_est": 0, "price_excluded": True,
                              "latitude": float(prev_lodging["latitude"]), "longitude": float(prev_lodging["longitude"])})
                t, loc = t + breakfast_dur, prev_lodging
            else:
                day_used_foods.add(int(f["id"]))
                items.append(_item("breakfast", f, s, s + breakfast_dur))
                t, loc = s + breakfast_dur, f
        else:
            items.append(free_meal_item("breakfast", t, prev_lodging, custom_dur=breakfast_dur))
            t, loc = t + breakfast_dur, prev_lodging
    else:
        if include_meals:
            f, s = _food_choice(foods, seq[0], t, "breakfast", exclude_ids=day_used_foods, randomize=randomize)
            if f is None:
                return None
            if has_long_morning and s > 7 * 60 + 15:
                s = 7 * 60
            day_used_foods.add(int(f["id"]))
            items.append(_item("breakfast", f, s, s + breakfast_dur))
            t, loc = s + breakfast_dur, f
        else:
            items.append(free_meal_item("breakfast", t, seq[0], custom_dur=breakfast_dur))
            t = t + breakfast_dur
            loc = seq[0]

    def place_att(a, t, loc, slot, combine_meal=None):
        st = max(t + travel_min(loc, a), int(a["open_time"]))
        raw_dur = int(a["visit_duration_min"])
        if combine_meal == "lunch":
            # Điểm tham quan dài buổi sáng (Bà Nà, Núi Thần Tài, Cù Lao Chàm, VinWonders, Mikazuki...): cộng thêm 60p ăn trưa tại chỗ
            slot_max = 340 if len(seq) <= 2 else 300
            dur = min(raw_dur + 60, slot_max)
        elif combine_meal == "dinner":
            # Điểm vui chơi dài buổi chiều - tối (Asia Park, Mikazuki...): cộng thêm 45p ăn tối tại chỗ
            slot_max = 240 if len(seq) <= 2 else 210
            dur = min(raw_dur + 45, slot_max)
        else:
            slot_max = {"sáng": 180, "chiều": 165, "tối": 105}.get(slot, 180)
            dur = min(raw_dur, slot_max)
        en = st + dur
        if en > int(a["close_time"]) or en > DAY_END:
            return None
        it_out = _item("attraction", a, st, en, slot)
        if combine_meal == "lunch":
            it_out["label"] = "Tham quan & Ăn trưa tại điểm"
            it_out["description"] = "Địa điểm có thời gian tham quan dài — khởi hành sớm và kết hợp ăn trưa, nghỉ ngơi ngay tại khu du lịch (chi phí ăn tùy món)."
        elif combine_meal == "dinner":
            it_out["label"] = "Tham quan & Ăn tối tại điểm"
            it_out["description"] = "Địa điểm có thời gian vui chơi dài — kết hợp ăn tối và thưởng thức ẩm thực ngay tại điểm đến (chi phí ăn tùy món)."
        return it_out

    def place_meal(kind, t, loc):
        if not include_meals:
            return free_meal_item(kind, t, loc)
        f, s = _food_choice(foods, loc, t, kind, exclude_ids=day_used_foods, randomize=randomize)
        if f is None:
            return None
        day_used_foods.add(int(f["id"]))
        return _item(kind, f, s, s + MEALS[kind][2])

    # tham quan (sáng)
    it = place_att(seq[0], t, loc, "sáng", combine_meal="lunch" if has_long_morning else None)
    if it is None:
        return None
    items.append(it); t, loc = hm_to_min(it["end"]), seq[0]

    # bữa trưa (chỉ xếp bữa trưa rời nếu điểm buổi sáng KHÔNG phải là khu du lịch dài đã gộp ăn trưa)
    if not has_long_morning:
        it = place_meal("lunch", t, loc)
        if it is None:
            return None
        items.append(it)
        t = hm_to_min(it["end"])
        loc = (foods_row(foods, it["id"]) if it.get("id") else None) or loc

    # nghỉ ngơi ở khách sạn (về nhận phòng / gửi hành lý & nghỉ trưa liền mạch ngay sau khi di chuyển tới)
    if need_night:
        if lodging is None:
            return None
        arr = t + travel_min(loc, lodging)
        is_same_hotel = prev_lodging is not None and int(prev_lodging["id"]) == int(lodging["id"])
        if is_same_hotel:
            # Nếu đi khu du lịch dài cả sáng-trưa và đã nhận phòng từ đêm trước thì không bắt buộc quay về khách sạn giữa trưa
            if not has_long_morning:
                st = arr
                items.append({"type": "checkin", "label": "Nghỉ ngơi ở khách sạn", "id": int(lodging["id"]), "name": lodging["name"],
                              "district": str(lodging.get("district", "")) if pd.notna(lodging.get("district")) else "",
                              "region": str(lodging.get("region", "")) if pd.notna(lodging.get("region")) else "",
                              "start": hm(st), "end": hm(st + REST_DUR), "price_text": "", "price_est": 0,
                              "latitude": float(lodging["latitude"]), "longitude": float(lodging["longitude"])})
                t, loc = st + REST_DUR, lodging
        else:
            rest_dur = 45 if has_long_morning else REST_DUR
            st = arr
            items.append(_checkin(lodging, st, st + rest_dur))
            t, loc = st + rest_dur, lodging

    # 1. Tham quan (chiều) nếu có từ 2 điểm trở lên
    att_afternoon = seq[1] if len(seq) >= 2 else None
    att_evening = seq[2] if len(seq) >= 3 else None

    has_long_afternoon = (
        att_afternoon is not None
        and not has_long_morning
        and int(att_afternoon.get("visit_duration_min", 90)) >= 240
    )

    if att_afternoon is not None:
        it = place_att(att_afternoon, t, loc, "chiều", combine_meal="dinner" if has_long_afternoon else None)
        if it is None:
            return None
        items.append(it)
        t, loc = hm_to_min(it["end"]), att_afternoon

    # 2. Bữa tối (chỉ xếp bữa tối rời nếu ca chiều không gộp ăn tối tại khu vui chơi)
    if not has_long_afternoon:
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

    # 5. Khớp nối liền mạch khung giờ (loại bỏ khoảng trống chết giữa các điểm) & gắn thông tin thời gian di chuyển (travel_min, distance_km)
    items[0]["travel_min"] = 0
    items[0]["distance_km"] = 0.0
    for k in range(1, len(items)):
        prev_it = items[k - 1]
        curr_it = items[k]
        dist_km = haversine_km(prev_it["latitude"], prev_it["longitude"], curr_it["latitude"], curr_it["longitude"])
        same_place = (prev_it.get("id") == curr_it.get("id")) and dist_km < 0.05
        tr = 0 if same_place else max(MIN_TRAVEL, round(dist_km / TRAVEL_KMH * 60))
        prev_end = hm_to_min(prev_it["end"])
        curr_start = hm_to_min(curr_it["start"])
        gap = curr_start - prev_end
        if gap > tr:
            # Mở rộng thời gian lưu lại ở điểm trước (tham quan/nghỉ ngơi thêm) để lấp khoảng chờ trước giờ mở cửa/giờ ăn tiếp theo
            prev_it["end"] = hm(curr_start - tr)
            gap = tr
        curr_it["travel_min"] = max(0, int(gap))
        curr_it["distance_km"] = round(float(dist_km), 1)

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
    is_meal = kind in MEAL_LABEL
    # Quán ăn: vẫn xếp vào lịch nhưng KHÔNG tính tiền vào ngân sách, giá tuỳ theo món khách gọi
    price_text = MEAL_PRICE_TEXT if is_meal else r.get("price_text", "")
    price_est = 0 if is_meal else int(r.get("price_est", 0))
    item = {"type": kind, "label": label, "id": int(r["id"]), "name": r["name"],
            "district": str(r.get("district", "")) if pd.notna(r.get("district")) else "",
            "region": str(r.get("region", "")) if pd.notna(r.get("region")) else "",
            "start": hm(st), "end": hm(en), "price_text": price_text,
            "price_est": price_est,
            "latitude": float(r["latitude"]), "longitude": float(r["longitude"])}
    if is_meal:
        item["price_excluded"] = True
        desc = r.get("description")
        if desc is not None and pd.notna(desc) and str(desc).strip():
            item["description"] = str(desc).strip()
    return item


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


# Phân khúc giá phòng/đêm (tính theo giá cả phòng price_per_night)
LODGING_TIERS = {
    "low":  {"min": 0,         "max": 500_000,    "target": 380_000,   "target_share": 0.30, "max_budget_share": 0.40},
    "mid":  {"min": 450_000,   "max": 1_300_000,  "target": 850_000,   "target_share": 0.46, "max_budget_share": 0.56},
    "high": {"min": 1_200_000, "max": 99_000_000, "target": 2_000_000, "target_share": 0.62, "max_budget_share": 0.72},
}


# ------------------------------------------------------------------ lập lịch nhiều ngày
def make_plan(df, num_days, budget_pp, interests=None, region=None, selected_ids=None,
              lodging_df=None, lodging_ids=None, max_lodging_tries=8,
              include_meals=True, include_lodging=True, guests_per_room=2,
              lodging_price_tier="auto", places_per_day=3, randomize=True):
    """
    df: điểm tham quan + quán ăn (đã APPROVED)
    lodging_df: nơi nghỉ (đã APPROVED); None thì không có nghỉ đêm
    selected_ids: id điểm tham quan người dùng chọn
    lodging_ids: id nơi nghỉ người dùng chọn, theo thứ tự từng đêm
    include_meals: có gợi ý quán ăn cho bữa sáng, trưa, tối hay không (chi phí ăn uống KHÔNG tính vào ngân sách)
    include_lodging: có tính chi phí và xếp nơi lưu trú hay không
    guests_per_room: số người chia sẻ mỗi phòng/căn (1 = ở phòng đơn / bao trọn phòng, >=2 = chia sẻ phòng)
    lodging_price_tier: mức giá nơi lưu trú ('auto', 'low', 'mid', 'high')
    places_per_day: số điểm tham quan mỗi ngày (2 hoặc 3)
    randomize: đa dạng hoá kết quả để mỗi lần bấm tạo lịch sẽ cho ra các gợi ý mới mẻ
    """
    warnings = []
    target_places_per_day = max(2, min(3, int(places_per_day or PLACES_PER_DAY)))
    selected_ids = [int(i) for i in (selected_ids or [])]
    lodging_ids = [int(i) for i in (lodging_ids or [])]
    if not include_lodging:
        lodging_df = None
        lodging_ids = []
    nights = max(0, num_days - 1) if lodging_df is not None else 0

    # Xác định phân khúc giá phòng hiệu lực (low / mid / high)
    tier_key = (lodging_price_tier or "auto").lower().strip()
    if tier_key not in LODGING_TIERS:
        daily_budget = budget_pp / max(1, num_days)
        if daily_budget <= 800_000:
            tier_key = "low"
        elif daily_budget <= 2_000_000:
            tier_key = "mid"
        else:
            tier_key = "high"
    tier_cfg = LODGING_TIERS[tier_key]

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
    # Ăn uống không tính vào ngân sách nên không lọc quán theo giá
    foods_all = df[df["is_food"]]

    # Trần ngân sách tối đa cho mỗi đêm nghỉ/người để luôn giữ lại 40% - 68% ngân sách cho vé tham quan & vui chơi
    max_lodging_total_pp = budget_pp * tier_cfg["max_budget_share"] if nights > 0 else 0.0
    night_cap_pp = max_lodging_total_pp / nights if nights > 0 else 0.0

    # Ngân sách kỳ vọng dành cho vé tham quan trong toàn chuyến
    expected_att_budget = max(0.0, budget_pp - max_lodging_total_pp)
    premium_boost = min(1.5, expected_att_budget / max(1.0, num_days * 450_000.0))

    pool_interests = list(interests or [])
    attraction_interests = [i for i in pool_interests if i != "Ẩm thực"]
    if not attraction_interests:
        pool_interests = ["Văn hóa & lịch sử", "Vui chơi & check-in", "Biển & đảo"]
    user_interest_set = set(pool_interests)

    target_regions = _normalize_regions(region)

    # Lấy pool chính theo sở thích + bổ sung các địa điểm có vé (paid attractions) nổi bật để tránh toàn điểm 0đ
    pool_main = _pool(df, pool_interests, None, target_regions, premium_boost=premium_boost, randomize=randomize)
    paid_source = df[df["price_est"] > 0]
    if "Đà Nẵng nội thành" in target_regions and "Hòa Vang - Bà Nà" not in target_regions:
        # Khi có chọn Đà Nẵng nội thành, bổ sung thêm các khu du lịch có vé lớn thuộc TP. Đà Nẵng (Hòa Vang - Bà Nà: Bà Nà Hills, Núi Thần Tài, Hòa Phú Thành...)
        extra_regs = list(set(target_regions + ["Hòa Vang - Bà Nà"]))
        dn_paid = df[(df["price_est"] > 0) & (df["region"].isin(extra_regs))]
        pool_paid_extra = _pool(dn_paid, None, None, None, premium_boost=premium_boost, randomize=randomize)
    else:
        pool_paid_extra = _pool(paid_source, None, None, target_regions, premium_boost=premium_boost, randomize=randomize)
    pool = pd.concat([pool_main, pool_paid_extra[~pool_paid_extra["id"].isin(pool_main["id"])]], ignore_index=True)

    # Dự phòng cho mỗi ngày còn lại (vé tham quan tối thiểu mỗi ngày)
    day_reserve = max(60_000.0, 0.15 * expected_att_budget / max(1, num_days))
    if lodging_df is not None and nights > 0:
        tier_sub = lodging_df[(lodging_df["price_per_night"] >= tier_cfg["min"]) & (lodging_df["price_per_night"] <= tier_cfg["max"])]
        min_night = float(tier_sub["price_pp_night"].min()) if not tier_sub.empty else float(lodging_df["price_pp_night"].min())
    else:
        min_night = 0.0

    used, spent = set(), 0.0
    trip_used_food_ids = set()
    visited_regions = {}
    chosen_lodging = {}
    if lodging_df is not None and lodging_ids:
        lo_by_id = {int(r["id"]): r for _, r in lodging_df.iterrows()}
        for k, lid in enumerate(lodging_ids[:nights]):
            if lid in lo_by_id:
                chosen_lodging[k + 1] = lo_by_id[lid].to_dict()
            else:
                warnings.append(f"Không tìm thấy nơi nghỉ id {lid}.")

    def _rank_lodging_candidates(reg_df, max_pp_allowed):
        """Chấm điểm và lọc danh sách nơi nghỉ theo phân khúc giá (low/mid/high) + trần ngân sách."""
        if reg_df.empty:
            return []
        cands = reg_df.copy()
        budget_target_room = (budget_pp * tier_cfg.get("target_share", 0.45) / max(1, nights)) * max(1, guests_per_room)
        target_room = min(float(tier_cfg["max"]), max(float(tier_cfg["min"]), budget_target_room, float(tier_cfg["target"])))
        # Khoảng cách tương đối so với mức giá mục tiêu của phân khúc
        price_diff_ratio = (cands["price_per_night"].astype(float) - target_room).abs() / max(target_room, 300_000.0)
        in_tier = ((cands["price_per_night"] >= tier_cfg["min"]) & (cands["price_per_night"] <= tier_cfg["max"])).astype(float)
        under_cap = (cands["price_pp_night"] <= max_pp_allowed).astype(float)

        noise = np.random.uniform(-0.15, 0.15, size=len(cands)) if randomize else 0.0
        # Ưu tiên: (1) nằm trong trần ngân sách đêm, (2) khớp phân khúc giá người dùng chọn, (3) gần giá mục tiêu & rating cao
        cands["_lo_score"] = (
            under_cap * 10.0
            + in_tier * 4.5
            + cands["avg_rating"].astype(float)
            - 1.2 * price_diff_ratio
            + noise
        )
        cands = cands.sort_values(["_lo_score", "price_pp_night", "id"], ascending=[False, True, True])
        return [lo.to_dict() for _, lo in cands.head(max_lodging_tries).iterrows()]

    def plan_day_in_region(reg, d, prev_lo, prev_checkout, need_night, reserve_after, spent_now, lodging_fixed, used_food_ids=None):
        """Thử xếp một ngày ở vùng reg. Trả về dict hoặc None."""
        foods = foods_all[foods_all["region"] == reg]
        if len(foods) < 6:
            foods = foods_all
        # các phương án nơi nghỉ (cân đối theo phân khúc giá & trần ngân sách đêm)
        lo_options = []
        if need_night:
            remaining_for_today = budget_pp - spent_now - reserve_after - day_reserve
            max_pp_tonight = min(night_cap_pp, max(0.0, remaining_for_today))
            if lodging_fixed is not None:
                lo_options = [lodging_fixed]
                cands = lodging_df[lodging_df["region"] == reg]
                for lo_d in _rank_lodging_candidates(cands, max_pp_tonight):
                    if int(lo_d["id"]) != int(lodging_fixed.get("id", -1)):
                        lo_options.append(lo_d)
                    if len(lo_options) >= max_lodging_tries:
                        break
            elif prev_lo is not None and prev_lo.get("region") == reg:
                # Nếu cùng khu vực (region): giữ nguyên nơi nghỉ đêm trước
                lo_options = [prev_lo]
            else:
                cands = lodging_df[lodging_df["region"] == reg]
                lo_options = [
                    lo_d for lo_d in _rank_lodging_candidates(cands, max_pp_tonight)
                    if spent_now + lo_d["price_pp_night"] + reserve_after + day_reserve <= budget_pp
                ]
            if not lo_options:
                lo_options = [None]   # sẽ dùng nơi rẻ nhất ở phần sau
        else:
            lo_options = [None]

        ordered = [by_id[i] for i in selected_ids if i in by_id and i not in used and by_id[i]["region"] == reg]
        ids_ordered = {int(r["id"]) for r in ordered}
        if reg == "Đà Nẵng nội thành":
            # Cho phép kết hợp các khu du lịch có vé lớn thuộc TP. Đà Nẵng (Hòa Vang - Bà Nà) để tận dụng tốt ngân sách
            reg_mask = (pool["region"] == reg) | ((pool["region"] == "Hòa Vang - Bà Nà") & (pool["price_est"] >= 100_000))
        else:
            reg_mask = (pool["region"] == reg)
        avail_reg = pool[reg_mask & (~pool["id"].isin(used)) & (~pool["id"].isin(ids_ordered))]

        for lo in lo_options:
            if need_night and lo is None:
                reg_lo = lodging_df[lodging_df["region"] == reg]
                base_lo = reg_lo if not reg_lo.empty else lodging_df
                cheapest = base_lo.sort_values("price_pp_night").iloc[0].to_dict()
                lo = cheapest
            night_cost = float(lo["price_pp_night"]) if need_night and lo is not None else 0.0
            day_cap = budget_pp - spent_now - night_cost - reserve_after
            if day_cap < 0:
                continue

            # Ngân sách vé mục tiêu của ngày hôm nay: phân bổ đều phần ngân sách vé còn lại cho số ngày còn lại
            days_left = max(1, num_days - d + 1)
            est_future_nights = max(0, nights - d) * min(night_cap_pp, night_cost if night_cost > 0 else night_cap_pp)
            rem_att_budget = max(0.0, budget_pp - spent_now - night_cost - est_future_nights)
            target_day_att = rem_att_budget / days_left

            # Tách địa điểm có vé (paid) và miễn phí (free) để phối hợp hài hòa trong ngày
            paid_df = avail_reg[(avail_reg["price_est"] > 0) & (avail_reg["price_est"] <= day_cap)].copy()
            free_df = avail_reg[avail_reg["price_est"] <= 0].copy()

            paid_rows = [r for _, r in paid_df.iterrows()]
            free_rows = [r for _, r in free_df.iterrows()]

            seq, items_best, day_spent = [], None, 0.0
            chosen_day_ids = set()

            # 1. Xếp các điểm người dùng đã chọn trước
            for r in ordered:
                if len(seq) == target_places_per_day:
                    break
                sim = simulate_day(seq + [r], foods, lo if need_night else None, prev_lo, prev_checkout, need_night, include_meals=include_meals, used_food_ids=used_food_ids, randomize=randomize)
                if sim is None:
                    continue
                items_try, _ = sim
                cost_try = sum(i["price_est"] for i in items_try)
                if cost_try > day_cap:
                    continue
                seq.append(r)
                chosen_day_ids.add(int(r["id"]))
                day_spent = cost_try
                items_best = items_try

            # 2. Chọn động từng địa điểm tiếp theo để tổng chi phí vé trong ngày bám sát target_day_att
            while len(seq) < target_places_per_day:
                still_need = target_day_att - day_spent
                has_long_in_seq = any(int(x.get("visit_duration_min", 90)) >= 240 for x in seq)

                rem_paid = [
                    r for r in paid_rows
                    if int(r["id"]) not in chosen_day_ids
                    and (day_spent + float(r["price_est"]) <= day_cap)
                    and not (has_long_in_seq and int(r.get("visit_duration_min", 90)) >= 240)
                ]
                rem_free = [
                    r for r in free_rows
                    if int(r["id"]) not in chosen_day_ids
                    and not (has_long_in_seq and int(r.get("visit_duration_min", 90)) >= 240)
                ]

                if still_need >= 35_000 and rem_paid:
                    # Chấm điểm ứng viên có vé sao cho giá vé khớp với phần ngân sách còn thiếu (still_need) của ngày
                    def _score_paid_cand(r):
                        p = float(r["price_est"])
                        in_p = 1.0 if r["interest_group"] in user_interest_set else 0.0
                        same_r = 1.0 if r["region"] == reg else 0.0
                        diff_ratio = abs(p - still_need) / max(still_need, 80_000.0)
                        jitter = random.uniform(-0.12, 0.12) if randomize else 0.0
                        return (
                            (1.2 if p >= 40_000 else 0.0)
                            + in_p * 0.5
                            + same_r * 0.9
                            + float(r["avg_rating"])
                            - 1.5 * diff_ratio
                            + jitter
                        )
                    rem_paid_sorted = sorted(rem_paid, key=_score_paid_cand, reverse=True)
                    try_list = rem_paid_sorted + rem_free
                else:
                    try_list = rem_free + rem_paid

                added = False
                for r in try_list:
                    sim = simulate_day(seq + [r], foods, lo if need_night else None, prev_lo, prev_checkout, need_night, include_meals=include_meals, used_food_ids=used_food_ids, randomize=randomize)
                    if sim is None:
                        continue
                    items_try, _ = sim
                    cost_try = sum(i["price_est"] for i in items_try)
                    if cost_try > day_cap:
                        continue
                    seq.append(r)
                    chosen_day_ids.add(int(r["id"]))
                    day_spent = cost_try
                    items_best = items_try
                    added = True
                    break
                if not added:
                    break

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
        priority_order = {
            "Đà Nẵng nội thành": 0,
            "Hòa Vang - Bà Nà": 1,
            "Hội An - Điện Bàn": 2,
            "Cù Lao Chàm": 3,
            "Duy Xuyên - Mỹ Sơn": 4,
        }
        def _reg_sort_key(g):
            reg_sub = avail[avail["region"] == g]
            has_paid = int((reg_sub["price_est"] >= 40_000).any())
            visited_cnt = visited_regions.get(g, 0)
            prio = priority_order.get(g, 5)
            top_r = float(reg_sub["avg_rating"].head(3).sum()) if not reg_sub.empty else 0.0
            return (visited_cnt, -has_paid, prio, -top_r)

        if left_sel:
            regions_try = [by_id[left_sel[0]]["region"]]
        elif len(target_regions) == 1:
            regions_try = [target_regions[0]]
        elif len(target_regions) > 1:
            regions_try = sorted(target_regions, key=_reg_sort_key)
        else:
            regions_try = []
            for g in sorted(avail["region"].unique(), key=_reg_sort_key):
                if g not in regions_try:
                    regions_try.append(g)

        res, reg_used = None, None
        for reg in regions_try:
            res = plan_day_in_region(reg, d, prev_lo, prev_checkout, need_night, reserve_after, spent, lodging_fixed, used_food_ids=trip_used_food_ids)
            if res is not None:
                reg_used = reg
                break

        if res is None:
            warnings.append(f"Ngày {d}: Không thể xếp lịch tham quan do ngân sách dự tính quá thấp hoặc tiêu chí quá chặt. Bạn nên tăng ngân sách, chọn tự túc nơi ở hoặc mở rộng khu vực.")
            days_out.append({"day": d, "region": None, "items": [], "night": None, "cost_pp": 0})
            continue

        visited_regions[reg_used] = visited_regions.get(reg_used, 0) + 1

        if need_night and res["lodging"] is not None:
            chosen_lodging[d] = res["lodging"]
            if lodging_fixed is not None and lodging_fixed.get("region") != reg_used:
                warnings.append(f"Ngày {d}: nơi nghỉ {lodging_fixed['name']} nằm ngoài vùng {reg_used} của ngày này.")
        if lodging_fixed is None and need_night and res["lodging"] is not None and res["lodging"]["region"] != reg_used:
            warnings.append(f"Ngày {d}: nơi nghỉ {res['lodging']['name']} nằm ngoài vùng {reg_used}.")
        has_major_park = any(int(r.get("visit_duration_min", 90)) >= 240 for r in res["seq"])
        expected_min = min(target_places_per_day, 2) if has_major_park else target_places_per_day
        if len(res["seq"]) < expected_min:
            warnings.append(f"Ngày {d} chỉ có {len(res['seq'])}/{target_places_per_day} điểm tham quan.")
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
        "budget_left_pp": int(budget_pp - spent), "places_per_day": target_places_per_day,
        "days": days_out, "warnings": warnings,
    }
