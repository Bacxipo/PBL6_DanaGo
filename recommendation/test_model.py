
from pathlib import Path
import joblib

model_path = (
    Path(__file__).resolve().parent
    / "artifacts"
    / "tfidf_model.pkl"
)

model = joblib.load(model_path)
vectorizer = model["vectorizer"]

print("Nạp mô hình thành công!")
print("Số địa điểm dùng huấn luyện:", model["training_rows"])
print("Số danh mục:", len(model["categories"]))
print("Số đặc trưng:", len(model["feature_names"]))

sample = vectorizer.transform([
    "biển nghỉ dưỡng ngắm bình minh"
])

print("Kích thước vector kiểm thử:", sample.shape)
