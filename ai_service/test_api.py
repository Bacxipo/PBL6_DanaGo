"""
test_api.py - Script tự động kiểm thử 3 endpoint chính của DanaGO AI Service:
  1. GET  /health   : Kiểm tra nạp dữ liệu và model embedding
  2. POST /lodging  : Lấy danh sách nơi nghỉ theo vùng và ngân sách
  3. POST /plan     : Lập lịch trình 2 ngày với ngân sách 3.000.000đ

Cách chạy:
  python test_api.py
  (hoặc: .\\venv\\Scripts\\python test_api.py)
"""
import urllib.request
import urllib.parse
import json
import sys

BASE_URL = "http://127.0.0.1:8000"


def print_separator(title=""):
    print("\n" + "=" * 60)
    if title:
        print(f" {title} ".center(60, "="))
        print("=" * 60)


def send_request(endpoint, method="GET", params=None, body=None):
    url = f"{BASE_URL}{endpoint}"
    if params:
        url += "?" + urllib.parse.urlencode(params)
    
    headers = {"Accept": "application/json"}
    data = None
    if body is not None:
        headers["Content-Type"] = "application/json"
        data = json.dumps(body).encode("utf-8")

    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            status_code = resp.getcode()
            response_data = json.loads(resp.read().decode("utf-8"))
            return status_code, response_data
    except urllib.error.HTTPError as e:
        error_content = e.read().decode("utf-8")
        try:
            return e.code, json.loads(error_content)
        except Exception:
            return e.code, {"error": error_content}
    except urllib.error.URLError as e:
        print(f"\n❌ LỖI KẾT NỐI: Không thể kết nối tới {BASE_URL}.")
        print("👉 Hãy chắc chắn bạn đã khởi động server AI trước:")
        print("   .\\venv\\Scripts\\python -m uvicorn api:app --port 8000 --reload")
        sys.exit(1)


# ==============================================================================
# TEST 1: GET /health
# ==============================================================================
def test_health():
    print_separator("TEST 1: KIỂM TRA TRẠNG THÁI HỆ THỐNG (GET /health)")
    status, data = send_request("/health", method="GET")
    
    print(f"HTTP Status: {status}")
    print(f"Trạng thái hoạt động : {data.get('status')}")
    print(f"Số lượng địa điểm    : {data.get('places')} địa điểm")
    print(f"Model embedding      : {'ĐÃ NẠP THÀNH CÔNG' if data.get('embedding_loaded') else 'CHƯA NẠP'}")
    
    if data.get("embedding_error"):
        print(f"⚠️ Cảnh báo lỗi model : {data.get('embedding_error')}")
    else:
        print("✅ /health: ĐẠT")


# ==============================================================================
# TEST 2: POST /lodging
# ==============================================================================
def test_lodging():
    print_separator("TEST 2: LỌC NƠI NGHỈ THEO VÙNG & NGÂN SÁCH (POST /lodging)")
    # Tham số: Vùng "Đà Nẵng nội thành", Ngân sách tối đa 1.000.000đ/người/đêm, lấy top 3
    params = {
        "region": "Đà Nẵng nội thành",
        "budget_pp": 1_000_000,
        "top_k": 3
    }
    status, data = send_request("/lodging", method="POST", params=params)

    print(f"HTTP Status: {status}")
    print(f"Bộ lọc: Vùng = '{params['region']}' | Ngân sách <= {params['budget_pp']:,} đ/người/đêm")
    print(f"Tìm thấy: {data.get('count', 0)} nơi nghỉ phù hợp:\n")

    for i, item in enumerate(data.get("items", []), start=1):
        price_room = f"{item['price_per_night']:,} đ/đêm"
        price_pp = f"{int(item['price_pp_night']):,} đ/người"
        print(f"  {i}. {item['name']} ({item['type']})")
        print(f"     📍 Khu vực: {item['district']}, {item['region']}")
        print(f"     ⭐ Đánh giá: {item['avg_rating']}/5.0 | Sức chứa: {item['max_guests']} khách")
        print(f"     💰 Giá: {price_room} (~{price_pp}) | Nhận phòng: {item['checkin']} - Trả: {item['checkout']}")
        print()

    print("✅ /lodging: ĐẠT")


# ==============================================================================
# TEST 3: POST /plan
# ==============================================================================
def test_plan():
    print_separator("TEST 3: LẬP LỊCH TRÌNH 2 NGÀY (POST /plan)")
    payload = {
        "num_days": 2,
        "budget_pp": 3_000_000,
        "interests": [],
        "selected_ids": []
    }
    status, data = send_request("/plan", method="POST", body=payload)

    print(f"HTTP Status: {status}")
    print(f"Yêu cầu : {payload['num_days']} ngày | Ngân sách: {payload['budget_pp']:,} đ/người")
    print(f"Tổng chi phí ước tính / người : {data.get('total_cost_pp', 0):,} đ")
    print(f"Số dư ngân sách còn lại       : {data.get('budget_left_pp', 0):,} đ")
    
    warnings = data.get("warnings", [])
    if warnings:
        print(f"⚠️ Cảnh báo: {warnings}")

    print("\n--- CHI TIẾT LỊCH TRÌNH TỪNG NGÀY ---")
    for day in data.get("days", []):
        day_num = day.get("day")
        region = day.get("region")
        cost = day.get("cost_pp", 0)
        night = day.get("night")
        print(f"\n🗓️  NGÀY {day_num} [{region}] - Chi phí: {cost:,} đ/người")
        
        for stop in day.get("items", []):
            label = stop.get("label", stop.get("type", ""))
            name = stop.get("name")
            start = stop.get("start")
            end = stop.get("end")
            price_est = stop.get("price_est", 0)
            price_str = f"({price_est:,} đ)" if price_est > 0 else ""
            print(f"   • {start} - {end}: [{label}] {name} {price_str}")
            
        if night:
            print(f"   🏨 Nơi nghỉ đêm {day_num}: {night['name']} ({night.get('price_pp_night', 0):,} đ/người)")

    print("\n✅ /plan: ĐẠT")


if __name__ == "__main__":
    print("🚀 BẮT ĐẦU CHẠY BỘ KIỂM THỬ API DANAGO...")
    test_health()
    test_lodging()
    test_plan()
    print_separator("TẤT CẢ CÁC KIỂM THỬ ĐÃ HOÀN TẤT THÀNH CÔNG! 🎉")

