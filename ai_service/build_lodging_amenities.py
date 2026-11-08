"""
build_lodging_amenities.py - gán tiện ích tự động từ mô tả, và sinh dữ liệu đầu vào cho lodging.

Chạy (trong thư mục ai_service):
    python build_lodging_amenities.py --src lodging_import.csv --out data

Vùng, tỉnh, trạng thái và giờ trả phòng được tính trong script, không cần file cũ.

Đầu ra:
  data/lodging_amenity.csv : id_lodging, amenity_id, amenity_code, nguon (keyword) -> import vào bảng lodging_amenity
  data/lodging_AI.csv      : có thêm sức chứa, giá, tiện ích, giờ nhận phòng, embedding_text_v2
Sau khi chạy, RÀ SOÁT lodging_amenity.csv vì gán theo từ khoá có thể sai.
"""
import argparse
import os
import re
import unicodedata
import pandas as pd

# id phải khớp với bảng amenity trong lodging_amenity.sql
AMENITY = {
    1: ("pool", "hồ bơi"), 2: ("pool_private", "hồ bơi riêng"), 3: ("hot_spring", "khoáng nóng"),
    4: ("spa", "spa"), 5: ("gym", "gym"), 6: ("kitchen", "bếp"), 7: ("buffet_breakfast", "buffet"),
    8: ("restaurant", "nhà hàng"), 9: ("bar", "bar"), 10: ("tea_afternoon", "trà chiều"),
    11: ("local_cook", "cơm nhà"), 12: ("bbq", "bbq"), 13: ("games", "trò chơi"),
    14: ("tennis", "tennis"), 15: ("water_activity", "kayak"), 16: ("camp_mountain", "săn mây"),
    17: ("sea_view", "view biển"), 18: ("near_beach", "gần biển"), 19: ("river_lake_view", "view sông"),
    20: ("balcony", "ban công"), 21: ("garden", "vườn"), 22: ("pickup", "đưa đón"),
    23: ("bike_free", "xe đạp"), 24: ("motorbike_rent", "xe máy"), 25: ("parking", "đỗ xe"),
    26: ("kids_play", "trẻ em"), 27: ("family_room", "gia đình"),
}

# từ khoá (đã bỏ dấu, chữ thường) -> id tiện ích
RULES = {
    2: ["ho boi rieng", "ho boi rieng biet lap"],
    1: ["ho boi"],
    3: ["khoang", "onsen", "tam suoi"],
    4: ["spa", "massage"],
    5: ["gym"],
    6: ["bep rieng", "bep de", "bep nau", "tu nau"],
    7: ["buffet", "bua sang"],
    8: ["nha hang"],
    9: ["quay bar", " bar "],
    10: ["tra chieu"],
    11: ["nau com", "nau an", "com nha"],
    12: ["bbq", "nuong"],
    13: ["tro choi", "the thao"],
    14: ["tennis"],
    15: ["kayak", "cau ca", "lan ong tho", "lan san ho", "chèo thuyền", "cheo thuyen", "thuyen"],
    16: ["san may", "cam trai", "trekking", "leo nui"],
    17: ["view bien", "ngam bien", "nhin ra bien", "huong bien", "nhin thang ra bien", "ngam binh minh", "ngam trọn canh bien", "ngam tron canh bien"],
    18: ["sat bien", "cach bien", "ven bien", "gan bien", "mat bien", "buoc chan ra bien", "chạm biển", "cham bien", "bai bien", "bai tam"],
    19: ["ven song", "ven ho", "long ho", "nhin ra ho", "ven song hoai"],
    20: ["ban cong", "san hien"],
    21: ["vuon", "san vuon"],
    22: ["dua don", "don khach", "don tu"],
    23: ["xe dap"],
    24: ["thue xe may", "xe may"],
    25: ["do xe", "bai do", "dau xe"],
    26: ["tre em", "khu choi cho tre", "khu vui choi"],
    27: ["gia dinh", "nhom ban", "nhom 4", "nhom 6"],
}


REGION = {
    "Hải Châu": "Đà Nẵng nội thành", "Thanh Khê": "Đà Nẵng nội thành", "Cẩm Lệ": "Đà Nẵng nội thành",
    "Sơn Trà": "Đà Nẵng nội thành", "Ngũ Hành Sơn": "Đà Nẵng nội thành", "Liên Chiểu": "Đà Nẵng nội thành",
    "Hòa Vang": "Hòa Vang - Bà Nà",
    "Hội An": "Hội An - Điện Bàn", "Điện Bàn": "Hội An - Điện Bàn",
    "Duy Xuyên": "Duy Xuyên - Mỹ Sơn",
    "Tam Kỳ": "Nam Quảng Nam", "Núi Thành": "Nam Quảng Nam", "Phú Ninh": "Nam Quảng Nam", "Thăng Bình": "Nam Quảng Nam",
    "Đông Giang": "Tây Bắc Quảng Nam", "Tây Giang": "Tây Bắc Quảng Nam", "Nam Giang": "Tây Bắc Quảng Nam", "Đại Lộc": "Tây Bắc Quảng Nam",
    "Nông Sơn": "Tây Nam Quảng Nam", "Hiệp Đức": "Tây Nam Quảng Nam", "Quế Sơn": "Tây Nam Quảng Nam",
    "Tiên Phước": "Tây Nam Quảng Nam", "Phước Sơn": "Tây Nam Quảng Nam", "Nam Trà My": "Tây Nam Quảng Nam",
    "Bắc Trà My": "Tây Nam Quảng Nam",
}
DA_NANG = {"Hải Châu", "Thanh Khê", "Cẩm Lệ", "Sơn Trà", "Ngũ Hành Sơn", "Liên Chiểu", "Hòa Vang"}


def norm(s):
    s = str(s).replace("đ", "d").replace("Đ", "D")
    s = unicodedata.normalize("NFD", s)
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    return " " + re.sub(r"\s+", " ", s.lower()) + " "


def tag(row):
    text = norm(f"{row['name']} {row['description']}")
    ids = {aid for aid, kws in RULES.items() if any(norm(kw) in text for kw in kws)}
    if 2 in ids:          # đã có hồ bơi riêng thì không cần ghi thêm hồ bơi chung
        ids.discard(1)
    return sorted(ids)


def band(price):
    if price <= 500_000:
        return "giá rẻ"
    if price <= 1_500_000:
        return "giá trung bình"
    return "giá cao cấp"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--src", default="lodging_import.csv")
    ap.add_argument("--out", default="data")
    args = ap.parse_args()
    os.makedirs(args.out, exist_ok=True)

    df = pd.read_csv(args.src, dtype=str, encoding="utf-8-sig")
    df["price_per_night"] = df["price_per_night"].astype(int)
    df["max_guests"] = df["max_guests"].astype(int)
    df["id"] = df["id"].astype(int)
    df["latitude"] = df["latitude"].astype(float)
    df["longitude"] = df["longitude"].astype(float)

    # 1. gán tiện ích theo từ khoá
    links = []
    for _, r in df.iterrows():
        for aid in tag(r):
            links.append({"id_lodging": r["id"], "amenity_id": aid,
                          "amenity_code": AMENITY[aid][0], "nguon": "keyword"})
    links = pd.DataFrame(links)
    links.to_csv(os.path.join(args.out, "lodging_amenity.csv"), index=False, encoding="utf-8-sig")

    # 2. dữ liệu đầu vào cho AI: sức chứa, giá, tiện ích, giờ nhận phòng
    ten_tien_ich = {aid: AMENITY[aid][1] for aid in AMENITY}
    rows = []
    for _, r in df.iterrows():
        aids = sorted(links.loc[links.id_lodging == r["id"], "amenity_id"].tolist())
        amen = ", ".join(ten_tien_ich[a] for a in aids)
        p, g = r["price_per_night"], r["max_guests"]
        pp = round(p / g)
        ci = r["checkin"]
        text2 = (f"{r['name']}. Loại: {r['type']}. Khu vực: {r['district']}. "
                 f"Sức chứa: {g} người, phù hợp {g} người. {band(p)}, {p:,} đồng mỗi đêm cho cả phòng, "
                 f"khoảng {pp:,} đồng mỗi người mỗi đêm. Nhận phòng từ {ci}, trả phòng {r['checkout']}. "
                 f"Tiện ích: {amen or 'không rõ'}. {r['description']}")
        h, m = map(int, ci.split(":"))
        rows.append({
            "id": r["id"], "name": r["name"], "type": r["type"], "district": r["district"],
            "latitude": r["latitude"], "longitude": r["longitude"],
            "max_guests": g, "price_per_night": p, "price_pp_night": pp, "price_band": band(p),
            "checkin": ci, "checkout": r["checkout"], "checkin_min": h * 60 + m,
            "avg_rating": r["avg_rating"], "amenities": amen, "description": r["description"],
            "address_url": r["address_url"], "website": r.get("website", ""),
            "embedding_text_v2": text2,
        })
    out = pd.DataFrame(rows)
    # vùng, tỉnh, trạng thái, giờ trả phòng: tính từ dữ liệu, không phụ thuộc file cũ
    region = out["district"].map(REGION)
    is_island = (out["district"] == "Hội An") & (out["longitude"] > 108.45)
    out["region"] = region.mask(is_island, "Cù Lao Chàm")
    out["province"] = out["district"].map(lambda d: "Đà Nẵng" if d in DA_NANG else "Quảng Nam")
    out["status"] = "APPROVED"
    out["checkout_min"] = out["checkout"].map(lambda t: int(t.split(":")[0]) * 60 + int(t.split(":")[1]))
    assert out["region"].notna().all(), "không gán được vùng"
    out.to_csv(os.path.join(args.out, "lodging_AI.csv"), index=False, encoding="utf-8-sig")

    print(f"{len(df)} nơi nghỉ, {len(links)} lượt gán tiện ích")
    print("vùng:", out["region"].value_counts().to_dict())
    print(links["amenity_code"].value_counts().to_dict())
    print("nơi không có tiện ích nào:", len(df) - links.id_lodging.nunique())


if __name__ == "__main__":
    main()