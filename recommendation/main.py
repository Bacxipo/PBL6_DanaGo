from pathlib import Path
from recommendation_engine import load_data, recommend, print_plan

BASE_DIR = Path(__file__).resolve().parent

csv_path = BASE_DIR / "destination_rows_with_category.csv"

df = load_data(csv_path)

plan = recommend(
    df,
    days=4,
    budget=1_000_000,
    categories=[
        "Bãi biển Nghỉ dưỡng",
        "Ẩm thực địa phương, Chợ",
        "Di tích Lịch sử",
    ],
)

print_plan(plan)