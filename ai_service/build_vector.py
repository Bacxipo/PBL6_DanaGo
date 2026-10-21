"""
BƯỚC 1: Tạo vector database (FAISS) từ destination_AI.csv bằng model embedding đã fine-tune.

Cách chạy (trong thư mục dự án, đã kích hoạt môi trường ảo):
    python build_vector_db.py                         # mặc định: dùng cột embedding_text
    python build_vector_db.py --text-mode name_desc   # tên + mô tả (nếu lúc huấn luyện bạn dùng dạng này)
Kết quả: vector_db/places.index  và  vector_db/metadata.json
"""
import argparse, json, os
import numpy as np
import pandas as pd
import faiss

ap = argparse.ArgumentParser()
ap.add_argument("--csv", default="data/destination_AI.csv")
ap.add_argument("--model", default="thaitoan1908/dana_travel_model")
ap.add_argument("--text-mode", choices=["embedding_text", "name_desc"], default="embedding_text")
ap.add_argument("--out", default="vector_db")
ap.add_argument("--dummy", action="store_true", help="chỉ để thử logic, không tải model thật")
args = ap.parse_args()

def place_text(row):
    """Văn bản đại diện cho 1 địa điểm. PHẢI giống định dạng phía địa điểm trong embedding_dataset.json
    lúc huấn luyện. Nếu khác cả 2 kiểu dưới đây thì sửa ngay tại hàm này."""
    if args.text_mode == "name_desc":
        return f"{row['name']}. {row['description']}"
    return row["embedding_text"]

df = pd.read_csv(args.csv)
texts = [place_text(r) for _, r in df.iterrows()]
print(f"Đọc {len(df)} địa điểm. Ví dụ văn bản đem nhúng:\n  {texts[0][:200]}\n")

if args.dummy:
    rng = np.random.default_rng(0)
    vecs = rng.normal(size=(len(texts), 64)).astype("float32")
    vecs /= np.linalg.norm(vecs, axis=1, keepdims=True)
    encode_query = lambda q: vecs[hash(q) % len(vecs)][None, :]
else:
    from sentence_transformers import SentenceTransformer
    model = SentenceTransformer(args.model)
    vecs = model.encode(texts, batch_size=32, normalize_embeddings=True, show_progress_bar=True).astype("float32")
    encode_query = lambda q: model.encode([q], normalize_embeddings=True).astype("float32")

index = faiss.IndexFlatIP(vecs.shape[1])      # vector đã chuẩn hoá -> tích vô hướng = cosine
index.add(vecs)

os.makedirs(args.out, exist_ok=True)
faiss.write_index(index, os.path.join(args.out, "places.index"))
meta = json.loads(df.to_json(orient="records", force_ascii=False))   # NaN -> null; thứ tự khớp với index
with open(os.path.join(args.out, "metadata.json"), "w", encoding="utf-8") as f:
    json.dump(meta, f, ensure_ascii=False, indent=1)
print(f"Đã lưu {index.ntotal} vector (chiều {vecs.shape[1]}) và metadata vào '{args.out}/'")

# Kiểm tra nhanh: 4 câu hỏi, in top 3
print("\n--- Kiểm tra nhanh ---")
for q in ["quán cà phê view đẹp ở Hội An", "ngắm hoàng hôn bán đảo Sơn Trà", "bãi biển yên tĩnh", "món ăn đặc sản Đà Nẵng"]:
    scores, ids = index.search(encode_query(q), 3)
    print(f"\n{q}")
    for s, i in zip(scores[0], ids[0]):
        print(f"  {s:.3f}  {meta[i]['name']}  [{meta[i]['category']}, {meta[i]['region']}]")