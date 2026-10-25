
from pathlib import Path

import joblib
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer


# ==================================================
# CẤU HÌNH
# ==================================================

BASE_DIR = Path(__file__).resolve().parent

DATA_PATH = BASE_DIR / "destination_rows_with_category.csv"

MODEL_DIR = BASE_DIR / "artifacts"

MODEL_PATH = MODEL_DIR / "tfidf_model.pkl"


# ==================================================
# 1. ĐỌC VÀ KIỂM TRA DỮ LIỆU
# ==================================================

def load_training_data():
    if not DATA_PATH.exists():
        raise FileNotFoundError(
            f"Không tìm thấy file dữ liệu: {DATA_PATH}\n"
            "Hãy đặt destination_rows_with_category.csv "
            "cùng thư mục với train_model.py."
        )

    df = pd.read_csv(DATA_PATH)

    required_columns = [
        "name",
        "description",
        "category",
    ]

    missing_columns = [
        col for col in required_columns
        if col not in df.columns
    ]

    if missing_columns:
        raise ValueError(
            f"CSV thiếu các cột: {missing_columns}"
        )

    # Chỉ sử dụng địa điểm đã được duyệt
    if "status" in df.columns:
        df = df[
            df["status"].astype(str).str.upper() == "APPROVED"
        ].copy()

    # Loại bỏ các dòng không có tên hoặc danh mục
    df["name"] = df["name"].fillna("").astype(str).str.strip()
    df["description"] = (
        df["description"].fillna("").astype(str).str.strip()
    )
    df["category"] = (
        df["category"].fillna("").astype(str).str.strip()
    )

    df = df[
        (df["name"] != "")
        & (df["category"] != "")
    ].copy()

    df = df.drop_duplicates(
        subset=["name", "category"]
    ).reset_index(drop=True)

    if df.empty:
        raise ValueError(
            "Không có địa điểm hợp lệ để huấn luyện."
        )

    return df


# ==================================================
# 2. HUẤN LUYỆN MÔ HÌNH TF-IDF
# ==================================================

def train_model():
    print("=" * 50)
    print("BẮT ĐẦU HUẤN LUYỆN MÔ HÌNH DANAGO")
    print("=" * 50)

    df = load_training_data()

    print(f"Số địa điểm sử dụng: {len(df)}")
    print(f"Số danh mục: {df['category'].nunique()}")

    # Ghép thông tin địa điểm thành văn bản
    documents = (
        df["name"]
        + ". "
        + df["description"]
        + ". "
        + df["category"]
    ).tolist()

    # Khởi tạo vectorizer
    vectorizer = TfidfVectorizer(
        ngram_range=(1, 2),
        sublinear_tf=True,
    )

    # Học từ vựng và trọng số TF-IDF
    X = vectorizer.fit_transform(documents)

    print(f"Số văn bản: {X.shape[0]}")
    print(f"Số đặc trưng: {X.shape[1]}")

    # ==================================================
    # 3. LƯU MÔ HÌNH
    # ==================================================

    MODEL_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )

    model_data = {
        "vectorizer": vectorizer,
        "feature_names": vectorizer.get_feature_names_out(),
        "training_rows": len(df),
        "categories": sorted(
            df["category"].unique().tolist()
        ),
    }

    joblib.dump(
        model_data,
        MODEL_PATH,
    )

    print("\nHUẤN LUYỆN THÀNH CÔNG!")
    print(f"Đã lưu mô hình tại:\n{MODEL_PATH}")
    print("=" * 50)


# ==================================================
# 4. CHẠY CHƯƠNG TRÌNH
# ==================================================

if __name__ == "__main__":
    train_model()
