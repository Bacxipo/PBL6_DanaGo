"""
db_sync.py - Tự động đồng bộ dữ liệu Địa điểm (Destination) và Nơi lưu trú (Lodging)
từ Backend API (PostgreSQL) sang bộ dữ liệu AI (destination_AI.csv & lodging_AI.csv).

Khi Admin thêm/sửa/duyệt/xóa một địa điểm hoặc khách sạn trên WebAdmin:
1. Backend NestJS tự động gọi POST /reload sang AI Service (hoặc AI Service tự đồng bộ khi khởi động).
2. db_sync.py tải danh sách APPROVED từ Backend API, tự động suy luận các trường AI
   (region, interest_group, is_food, price_est, open_time, close_time, checkin_min, embedding_text...),
   cập nhật trực tiếp vào DataFrame trong RAM và ghi lưu xuống file CSV trong thư mục data/.
"""
import json
import os
import re
import unicodedata
import urllib.request
from typing import Optional, Tuple

import pandas as pd

BACKEND_API_URL = os.environ.get("DANAGO_BACKEND_URL", "http://localhost:5000")

DESTINATION_COLS = [
    "id", "name", "category", "interest_group", "is_food", "district", "province",
    "region", "latitude", "longitude", "site_group", "open_time", "close_time",
    "visit_duration_min", "best_time", "avg_rating", "price_text", "price_type",
    "price_min", "price_max", "price_est", "price_est_source", "description", "embedding_text"
]

LODGING_COLS = [
    "id", "name", "type", "district", "latitude", "longitude", "max_guests",
    "price_per_night", "price_pp_night", "price_band", "checkin", "checkout",
    "checkin_min", "avg_rating", "amenities", "description", "address_url",
    "website", "embedding_text_v2", "region", "province", "status", "checkout_min"
]

DISTRICT_TO_REGION = {
    "Hải Châu": ("Đà Nẵng nội thành", "Đà Nẵng"),
    "Thanh Khê": ("Đà Nẵng nội thành", "Đà Nẵng"),
    "Cẩm Lệ": ("Đà Nẵng nội thành", "Đà Nẵng"),
    "Sơn Trà": ("Đà Nẵng nội thành", "Đà Nẵng"),
    "Ngũ Hành Sơn": ("Đà Nẵng nội thành", "Đà Nẵng"),
    "Liên Chiểu": ("Đà Nẵng nội thành", "Đà Nẵng"),
    "Hòa Vang": ("Hòa Vang - Bà Nà", "Đà Nẵng"),
    "Bà Nà": ("Hòa Vang - Bà Nà", "Đà Nẵng"),
    "Hội An": ("Hội An - Điện Bàn", "Quảng Nam"),
    "Điện Bàn": ("Hội An - Điện Bàn", "Quảng Nam"),
    "Cù Lao Chàm": ("Cù Lao Chàm", "Quảng Nam"),
    "Tân Hiệp": ("Cù Lao Chàm", "Quảng Nam"),
    "Duy Xuyên": ("Duy Xuyên - Mỹ Sơn", "Quảng Nam"),
    "Mỹ Sơn": ("Duy Xuyên - Mỹ Sơn", "Quảng Nam"),
    "Tam Kỳ": ("Nam Quảng Nam", "Quảng Nam"),
    "Núi Thành": ("Nam Quảng Nam", "Quảng Nam"),
    "Phú Ninh": ("Nam Quảng Nam", "Quảng Nam"),
    "Thăng Bình": ("Nam Quảng Nam", "Quảng Nam"),
    "Đông Giang": ("Tây Bắc Quảng Nam", "Quảng Nam"),
    "Tây Giang": ("Tây Bắc Quảng Nam", "Quảng Nam"),
    "Nam Giang": ("Tây Bắc Quảng Nam", "Quảng Nam"),
    "Đại Lộc": ("Tây Bắc Quảng Nam", "Quảng Nam"),
}

AMENITY_RULES = {
    "hồ bơi riêng": ["ho boi rieng", "ho boi rieng biet lap"],
    "hồ bơi": ["ho boi", "be boi"],
    "khoáng nóng": ["khoang", "onsen", "tam suoi"],
    "spa": ["spa", "massage"],
    "gym": ["gym", "the hinh"],
    "bếp": ["bep rieng", "bep de", "bep nau", "tu nau", "co bep"],
    "buffet": ["buffet", "bua sang"],
    "nhà hàng": ["nha hang"],
    "bar": ["quay bar", " bar "],
    "trà chiều": ["tra chieu"],
    "bbq": ["bbq", "nuong"],
    "view biển": ["view bien", "ngam bien", "nhin ra bien", "huong bien"],
    "gần biển": ["sat bien", "cach bien", "ven bien", "gan bien", "mat bien", "bai bien", "my khe"],
    "ban công": ["ban cong", "san hien"],
    "vườn": ["vuon", "san vuon"],
    "đưa đón": ["dua don", "don khach", "san bay"],
    "xe đạp": ["xe dap"],
    "đỗ xe": ["do xe", "bai do", "dau xe"],
    "gia đình": ["gia dinh", "nhom ban"],
}


def _norm_ascii(s: str) -> str:
    s = str(s or "").replace("đ", "d").replace("Đ", "D")
    s = unicodedata.normalize("NFD", s)
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    return " " + re.sub(r"\s+", " ", s.lower()) + " "


def infer_region_province(district: str, name: str = "") -> Tuple[str, str]:
    dist = str(district or "").strip()
    nm = str(name or "").strip()
    if "cù lao chàm" in nm.lower() or "cù lao chàm" in dist.lower():
        return "Cù Lao Chàm", "Quảng Nam"
    for key, val in DISTRICT_TO_REGION.items():
        if key.lower() in dist.lower():
            return val
    return "Đà Nẵng nội thành", "Đà Nẵng"


def infer_interest_and_food(category: str, name: str, description: str) -> Tuple[str, str, bool]:
    cat = str(category or "").strip()
    text = f"{cat} {name or ''} {description or ''}".lower()

    food_kws = [
        "ẩm thực", "nhà hàng", "quán ăn", "hải sản", "đặc sản", "cà phê", "cafe",
        "tiệm trà", "bánh tráng", "mì quảng", "bún", "phở", "cơm", "ăn vặt", "chè"
    ]
    if any(k in text for k in food_kws):
        if "cà phê" in text or "cafe" in text or "tiệm trà" in text:
            final_cat = cat or "Quán Cà phê & Tiệm trà"
        else:
            final_cat = cat or "Ẩm thực địa phương"
        return final_cat, "Ẩm thực", True

    beach_kws = ["biển", "bãi tắm", "bán đảo", "đảo", "cù lao", "rạn", "san hô", "mỹ khê"]
    if any(k in text for k in beach_kws):
        return cat or "Biển & Bán đảo", "Biển & đảo", False

    culture_kws = [
        "di tích", "lịch sử", "bảo tàng", "chùa", "nhà thờ", "đình", "đền",
        "làng cổ", "làng nghề", "phố cổ", "văn hóa", "tâm linh", "thánh địa"
    ]
    if any(k in text for k in culture_kws):
        return cat or "Di tích & Văn hóa", "Văn hóa & lịch sử", False

    nature_kws = [
        "thiên nhiên", "núi", "đèo", "suối", "thác", "rừng", "hồ",
        "cắm trại", "trekking", "sinh thái", "đỉnh"
    ]
    if any(k in text for k in nature_kws):
        return cat or "Thiên nhiên & Sinh thái", "Thiên nhiên & khám phá", False

    return cat or "Khu Vui chơi & Check-in", "Vui chơi & check-in", False


def parse_price_string(ticket_price: str, is_food: bool) -> Tuple[str, str, float, float, float]:
    raw = str(ticket_price or "").strip()
    if not raw or "miễn phí" in raw.lower() or raw == "0":
        return "Miễn phí", "free", 0.0, 0.0, 0.0
    if is_food and ("tùy" in raw.lower() or "món" in raw.lower()):
        return raw, "meal", 50000.0, 150000.0, 50000.0

    # Tìm tất cả cụm số tiền (VD: 100.000, 450,000, 250k, 150000)
    cleaned = raw.lower().replace(",", ".")
    nums = []
    for m in re.finditer(r"(\d+(?:\.\d{3})+|\d+)\s*(k|nghìn|ngàn)?", cleaned):
        num_str = m.group(1).replace(".", "")
        try:
            val = float(num_str)
            if m.group(2) or (0 < val < 2000):
                val *= 1000.0
            if val >= 5000:
                nums.append(val)
        except ValueError:
            pass

    if not nums:
        return raw, "free", 0.0, 0.0, 0.0

    p_min = min(nums)
    p_max = max(nums)
    p_type = "meal" if is_food else "ticket"
    return raw, p_type, p_min, p_max, p_min


def parse_open_hours(open_hours: str, open_time_db: Optional[int] = None, close_time_db: Optional[int] = None) -> Tuple[int, int]:
    if open_time_db is not None and close_time_db is not None:
        return int(open_time_db), int(close_time_db)
    raw = str(open_hours or "").strip().lower()
    if not raw or "cả ngày" in raw or "24/7" in raw or "24/24" in raw:
        return 0, 1439
    matches = re.findall(r"(\d{1,2})[:h](\d{2})?", raw)
    if len(matches) >= 2:
        h1, m1 = int(matches[0][0]), int(matches[0][1] or 0)
        h2, m2 = int(matches[1][0]), int(matches[1][1] or 0)
        open_m = h1 * 60 + m1
        close_m = h2 * 60 + m2
        if close_m <= open_m:
            close_m = 1380
        return open_m, close_m
    return 420, 1260  # Mặc định 07:00 - 21:00


def parse_hm_to_min(hm_str: str, default_min: int) -> Tuple[str, int]:
    raw = str(hm_str or "").strip()
    m = re.search(r"(\d{1,2}):(\d{2})", raw)
    if m:
        h, mins = int(m.group(1)), int(m.group(2))
        return f"{h:02d}:{mins:02d}", h * 60 + mins
    return f"{default_min // 60:02d}:{default_min % 60:02d}", default_min


def _fetch_json(url: str):
    req = urllib.request.Request(url, headers={"Accept": "application/json"})
    with urllib.request.urlopen(req, timeout=8) as resp:
        return json.loads(resp.read().decode("utf-8"))


def sync_destinations_from_backend(csv_path: str, api_base: Optional[str] = None) -> Tuple[bool, int]:
    """Đồng bộ bảng destination (APPROVED) từ Backend API vào destination_AI.csv."""
    base = (api_base or BACKEND_API_URL).rstrip("/")
    existing_df = pd.read_csv(csv_path, encoding="utf-8-sig") if os.path.exists(csv_path) else pd.DataFrame(columns=DESTINATION_COLS)
    existing_by_id = {int(r["id"]): r.to_dict() for _, r in existing_df.iterrows() if pd.notna(r.get("id"))}

    try:
        items = _fetch_json(f"{base}/destinations?status=APPROVED")
        if not isinstance(items, list) or len(items) == 0:
            return False, len(existing_df)
    except Exception:
        return False, len(existing_df)

    rows = []
    seen_ids = set()
    for item in items:
        if item.get("status") and item.get("status") != "APPROVED":
            continue
        did = int(item["id"])
        seen_ids.add(did)
        old = existing_by_id.get(did, {})

        name = str(item.get("name") or old.get("name") or "").strip()
        district = str(item.get("district") or old.get("district") or "Hải Châu").strip()
        desc = str(item.get("description") or old.get("description") or f"Địa điểm tham quan du lịch tại {district}.").strip()
        cat_raw = str(item.get("categoryName") or old.get("category") or "").strip()

        cat, interest_group, is_food = infer_interest_and_food(cat_raw, name, desc)
        if old.get("interest_group") and not item.get("categoryName"):
            interest_group = old["interest_group"]
            is_food = str(old.get("is_food", "False")).lower() in ("true", "1")

        region, province = infer_region_province(district, name)
        if old.get("region") and old.get("district") == district:
            region = old["region"]
            province = old.get("province", province)

        lat = float(item.get("latitude") or old.get("latitude") or 16.0600)
        lon = float(item.get("longitude") or old.get("longitude") or 108.2200)
        rating = float(item.get("avgRating") or old.get("avg_rating") or 4.4)
        if rating <= 0:
            rating = 4.4

        open_m, close_m = parse_open_hours(item.get("openHours"), old.get("open_time"), old.get("close_time"))
        visit_dur = int(old.get("visit_duration_min") or (60 if is_food else 90))
        best_time = str(old.get("best_time") or ("any" if is_food else "morning"))
        site_group = old.get("site_group") if pd.notna(old.get("site_group")) else ""

        ticket_raw = item.get("ticketPrice")
        if ticket_raw and str(ticket_raw).strip() != str(old.get("price_text", "")).strip():
            p_text, p_type, p_min, p_max, p_est = parse_price_string(ticket_raw, is_food)
            p_src = "parsed" if p_est > 0 else "free"
        elif "price_est" in old and pd.notna(old.get("price_est")):
            p_text = old.get("price_text", "Miễn phí")
            p_type = old.get("price_type", "free")
            p_min = old.get("price_min", 0.0)
            p_max = old.get("price_max", 0.0)
            p_est = float(old.get("price_est", 0.0))
            p_src = old.get("price_est_source", "parsed")
        else:
            p_text, p_type, p_min, p_max, p_est = parse_price_string(ticket_raw or "Miễn phí", is_food)
            p_src = "parsed" if p_est > 0 else "free"

        emb_text = f"{name}. Loại: {cat}. Khu vực: {district}, {province}. {desc}"

        rows.append({
            "id": did,
            "name": name,
            "category": cat,
            "interest_group": interest_group,
            "is_food": is_food,
            "district": district,
            "province": province,
            "region": region,
            "latitude": lat,
            "longitude": lon,
            "site_group": site_group,
            "open_time": open_m,
            "close_time": close_m,
            "visit_duration_min": visit_dur,
            "best_time": best_time,
            "avg_rating": rating,
            "price_text": p_text,
            "price_type": p_type,
            "price_min": p_min,
            "price_max": p_max,
            "price_est": p_est,
            "price_est_source": p_src,
            "description": desc,
            "embedding_text": emb_text,
        })

    # Giữ lại các mục trong CSV chưa có trên DB (nếu DB chỉ chứa một phần) hoặc cập nhật đầy đủ
    for old_id, old_row in existing_by_id.items():
        if old_id not in seen_ids:
            rows.append(old_row)

    new_df = pd.DataFrame(rows)
    for col in DESTINATION_COLS:
        if col not in new_df.columns:
            new_df[col] = ""
    new_df = new_df[DESTINATION_COLS].sort_values("id").reset_index(drop=True)
    os.makedirs(os.path.dirname(os.path.abspath(csv_path)), exist_ok=True)
    new_df.to_csv(csv_path, index=False, encoding="utf-8-sig")
    return True, len(new_df)


def sync_lodgings_from_backend(csv_path: str, api_base: Optional[str] = None) -> Tuple[bool, int]:
    """Đồng bộ bảng lodging (APPROVED) từ Backend API vào lodging_AI.csv."""
    base = (api_base or BACKEND_API_URL).rstrip("/")
    existing_df = pd.read_csv(csv_path, encoding="utf-8-sig") if os.path.exists(csv_path) else pd.DataFrame(columns=LODGING_COLS)
    existing_by_id = {int(r["id"]): r.to_dict() for _, r in existing_df.iterrows() if pd.notna(r.get("id"))}

    try:
        items = _fetch_json(f"{base}/lodgings?status=APPROVED")
        if not isinstance(items, list) or len(items) == 0:
            return False, len(existing_df)
    except Exception:
        return False, len(existing_df)

    rows = []
    seen_ids = set()
    for item in items:
        if item.get("status") and item.get("status") != "APPROVED":
            continue
        lid = int(item["id"])
        seen_ids.add(lid)
        old = existing_by_id.get(lid, {})

        name = str(item.get("name") or old.get("name") or "").strip()
        ltype = str(item.get("type") or old.get("type") or "Khách sạn").strip()
        district = str(item.get("district") or old.get("district") or "Sơn Trà").strip()
        lat = float(item.get("latitude") or old.get("latitude") or 16.0600)
        lon = float(item.get("longitude") or old.get("longitude") or 108.2400)
        max_guests = max(1, int(item.get("maxGuests") or old.get("max_guests") or 2))
        price_per_night = int(float(item.get("pricePerNight") or old.get("price_per_night") or 600000))
        price_pp_night = round(price_per_night / max_guests)

        if price_per_night <= 500_000:
            p_band = "giá rẻ"
        elif price_per_night <= 1_500_000:
            p_band = "giá trung bình"
        else:
            p_band = "giá cao cấp"

        checkin_str, checkin_min = parse_hm_to_min(item.get("checkin") or old.get("checkin") or "14:00", 840)
        checkout_str, checkout_min = parse_hm_to_min(item.get("checkout") or old.get("checkout") or "12:00", 720)
        rating = float(item.get("avgRating") or old.get("avg_rating") or 4.5)
        if rating <= 0:
            rating = 4.5

        desc = str(item.get("description") or old.get("description") or f"{ltype} tiện nghi tại {district}").strip()
        raw_ams = item.get("amenities")
        if isinstance(raw_ams, list) and len(raw_ams) > 0:
            am_names = [str(a.get("name") if isinstance(a, dict) else a).strip().lower() for a in raw_ams]
            amenities_str = ", ".join(filter(None, am_names))
        elif old.get("amenities") and pd.notna(old.get("amenities")):
            amenities_str = str(old["amenities"])
        else:
            norm_txt = _norm_ascii(f"{name} {desc}")
            matched = [label for label, kws in AMENITY_RULES.items() if any(_norm_ascii(k) in norm_txt for k in kws)]
            amenities_str = ", ".join(matched)

        region, province = infer_region_province(district, name)
        if item.get("region"):
            region = str(item["region"])
        elif old.get("region") and old.get("district") == district:
            region = str(old["region"])

        address_url = str(item.get("addressUrl") or old.get("address_url") or "")
        website = str(item.get("website") or old.get("website") or "")
        if website == "nan":
            website = ""

        guest_tag = "phù hợp nhóm đông, gia đình" if max_guests >= 4 else f"phù hợp {max_guests} người"
        am_part = f" Tiện ích: {amenities_str}." if amenities_str else ""
        emb_v2 = (
            f"{name}. Loại: {ltype}. Khu vực: {district}. "
            f"Sức chứa: {max_guests} người, {guest_tag}. "
            f"{p_band}, {price_per_night:,} đồng mỗi đêm cho cả phòng, "
            f"khoảng {price_pp_night:,} đồng mỗi người mỗi đêm. "
            f"Nhận phòng từ {checkin_str}, trả phòng {checkout_str}.{am_part} {desc}"
        )

        rows.append({
            "id": lid,
            "name": name,
            "type": ltype,
            "district": district,
            "latitude": lat,
            "longitude": lon,
            "max_guests": max_guests,
            "price_per_night": price_per_night,
            "price_pp_night": price_pp_night,
            "price_band": p_band,
            "checkin": checkin_str,
            "checkout": checkout_str,
            "checkin_min": checkin_min,
            "avg_rating": rating,
            "amenities": amenities_str,
            "description": desc,
            "address_url": address_url,
            "website": website,
            "embedding_text_v2": emb_v2,
            "region": region,
            "province": province,
            "status": "APPROVED",
            "checkout_min": checkout_min,
        })

    for old_id, old_row in existing_by_id.items():
        if old_id not in seen_ids:
            rows.append(old_row)

    new_df = pd.DataFrame(rows)
    for col in LODGING_COLS:
        if col not in new_df.columns:
            new_df[col] = ""
    new_df = new_df[LODGING_COLS].sort_values("id").reset_index(drop=True)
    os.makedirs(os.path.dirname(os.path.abspath(csv_path)), exist_ok=True)
    new_df.to_csv(csv_path, index=False, encoding="utf-8-sig")
    return True, len(new_df)

