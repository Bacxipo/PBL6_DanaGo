"""
Đánh giá model embedding bằng bộ câu hỏi có đáp án (eval_queries.csv).

Cách chạy (trong thư mục ai_service, đã kích hoạt venv):
    # chỉ đo model fine-tune
    python eval_embedding.py

    # so với model gốc (điền đúng tên model gốc bạn đã fine-tune từ đó)
    python eval_embedding.py --base-model <ten-model-goc>

    # nếu model gốc là họ E5 cần tiền tố
    python eval_embedding.py --base-model intfloat/multilingual-e5-base --query-prefix "query: " --passage-prefix "passage: "

    # nếu lúc huấn luyện văn bản địa điểm là "tên + mô tả"
    python eval_embedding.py --text-mode name_desc

Đầu vào:
    data/destination_AI.csv  (cùng file đã dùng để build_vector_db)
    eval_queries.csv         (cột: query, expected; nhiều đáp án ngăn bằng dấu |)

Đầu ra: bảng Hit@1, Hit@5, MRR cho từng model, và danh sách câu fine-tune không đưa đáp án vào top 5.
"""
import argparse
import sys
import numpy as np
import pandas as pd

ap = argparse.ArgumentParser()
ap.add_argument("--csv", default="data/destination_AI.csv")
ap.add_argument("--queries", default="eval_queries.csv")
ap.add_argument("--tuned", default="thaitoan1908/dana_travel_model")
ap.add_argument("--base-model", default=None, help="model gốc để so sánh (bỏ trống = chỉ đo model fine-tune)")
ap.add_argument("--text-mode", choices=["embedding_text", "name_desc"], default="embedding_text")
ap.add_argument("--query-prefix", default="", help="tiền tố câu hỏi của model gốc, ví dụ 'query: '")
ap.add_argument("--passage-prefix", default="", help="tiền tố địa điểm của model gốc, ví dụ 'passage: '")
ap.add_argument("--dummy", action="store_true", help="chỉ thử logic, không tải model")
args = ap.parse_args()

df = pd.read_csv(args.csv)
names = df["name"].tolist()
if args.text_mode == "embedding_text":
    texts = df["embedding_text"].tolist()
else:
    texts = (df["name"] + ". " + df["description"]).tolist()

qs = pd.read_csv(args.queries)
qs["exp"] = qs["expected"].apply(lambda s: [x.strip() for x in str(s).split("|")])
valid = set(names)
unknown = sorted({n for L in qs["exp"] for n in L if n not in valid})
if unknown:
    print("Các tên sau KHÔNG có trong cột name của CSV, hãy sửa eval_queries.csv:")
    for u in unknown: print("  -", u)
    sys.exit(1)

def encode_all(model_id, qp="", pp=""):
    from sentence_transformers import SentenceTransformer
    m = SentenceTransformer(model_id)
    P = m.encode([pp + t for t in texts], normalize_embeddings=True, batch_size=32, show_progress_bar=False)
    Q = m.encode([qp + q for q in qs["query"]], normalize_embeddings=True, show_progress_bar=False)
    return P, Q

def fake(model_id):
    rng = np.random.default_rng(abs(hash(model_id)) % 1000)
    return rng.normal(size=(len(texts), 32)), rng.normal(size=(len(qs), 32))

def evaluate(model_id, qp="", pp=""):
    P, Q = fake(model_id) if args.dummy else encode_all(model_id, qp, pp)
    P = P / np.linalg.norm(P, axis=1, keepdims=True)
    Q = Q / np.linalg.norm(Q, axis=1, keepdims=True)
    ranks, tops = [], []
    for i, row in qs.iterrows():
        order = np.argsort(-(P @ Q[i]))
        ranked = [names[j] for j in order]
        r = min(ranked.index(n) for n in row["exp"]) + 1   # hạng của đáp án đúng đầu tiên
        ranks.append(r); tops.append(ranked[:5])
    ranks = np.array(ranks)
    metrics = {"hit@1": (ranks == 1).mean(), "hit@5": (ranks <= 5).mean(), "mrr": (1 / ranks).mean()}
    return metrics, ranks, tops

res = {"fine-tune": evaluate(args.tuned)}
if args.base_model:
    res["model gốc"] = evaluate(args.base_model, args.query_prefix, args.passage_prefix)

print(f"\n{len(qs)} câu hỏi | text-mode = {args.text_mode}\n")
print(f"{'Model':<14}{'Hit@1':>8}{'Hit@5':>8}{'MRR':>8}")
for k, (m, _, _) in res.items():
    print(f"{k:<14}{m['hit@1']:>8.2f}{m['hit@5']:>8.2f}{m['mrr']:>8.2f}")

_, ranks, tops = res["fine-tune"]
print("\n--- Câu fine-tune KHÔNG đưa đáp án vào top 5 ---")
miss = [i for i, r in enumerate(ranks) if r > 5]
if not miss: print("(không có)")
for i in miss:
    print(f"\n[hạng {ranks[i]}] {qs['query'][i]}")
    print(f"  đúng: {qs['exp'][i]}")
    print(f"  top 5: {tops[i]}")
