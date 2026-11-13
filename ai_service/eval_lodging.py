"""
eval_lodging.py - đo embedding trên bộ câu hỏi nơi nghỉ (có đáp án).

Hai cách ghép văn bản để so sánh:
  --text-mode basic : tên + loại + khu vực + mô tả (cách cũ)
  --text-mode v2    : cột embedding_text_v2 (có sức chứa, giá, giờ nhận phòng, tiện ích)

Chạy (trong thư mục ai_service):
    python eval_lodging.py --text-mode basic
    python eval_lodging.py --text-mode v2
    python eval_lodging.py --text-mode v2 --base-model bkai-foundation-models/vietnamese-bi-encoder

Đầu vào:
  data/lodging_AI.csv          (có cột name, type, district, province, description, embedding_text_v2)
  lodging_eval_queries.csv     (cột query, expected; nhiều đáp án ngăn bằng |)
"""
import argparse
import sys
import numpy as np
import pandas as pd

ap = argparse.ArgumentParser()
ap.add_argument("--lodging", default="data/lodging_AI.csv")
ap.add_argument("--queries", default="lodging_eval_queries.csv")
ap.add_argument("--tuned", default="thaitoan1908/dana_travel_model")
ap.add_argument("--base-model", default=None)
ap.add_argument("--text-mode", choices=["basic", "v2"], default="basic")
ap.add_argument("--dummy", action="store_true")
args = ap.parse_args()

df = pd.read_csv(args.lodging, encoding="utf-8-sig")
names = df["name"].astype(str).tolist()
if args.text_mode == "v2":
    if "embedding_text_v2" not in df.columns:
        sys.exit("Thiếu cột embedding_text_v2 trong lodging_AI.csv, chạy lại build_lodging_amenities.py")
    texts = df["embedding_text_v2"].astype(str).tolist()
else:
    texts = (df["name"].astype(str) + ". Loại: " + df["type"].astype(str) + ". Khu vực: "
             + df["district"].astype(str) + ", " + df["province"].astype(str) + ". "
             + df["description"].fillna("").astype(str)).tolist()

qs = pd.read_csv(args.queries, encoding="utf-8-sig")
qs["exp"] = qs["expected"].apply(lambda s: [x.strip() for x in str(s).split("|")])
unknown = sorted({n for L in qs["exp"] for n in L if n not in set(names)})
if unknown:
    print("Tên không có trong lodging_AI.csv, hãy sửa:")
    for u in unknown:
        print("  -", u)
    sys.exit(1)


def encode_all(model_id):
    if args.dummy:
        rng = np.random.default_rng(abs(hash(model_id)) % 1000)
        return rng.normal(size=(len(texts), 32)), rng.normal(size=(len(qs), 32))
    from sentence_transformers import SentenceTransformer
    m = SentenceTransformer(model_id)
    P = m.encode(texts, normalize_embeddings=True, batch_size=32, show_progress_bar=False)
    Q = m.encode(qs["query"].tolist(), normalize_embeddings=True, show_progress_bar=False)
    return P, Q


def evaluate(model_id):
    P, Q = encode_all(model_id)
    P = P / np.linalg.norm(P, axis=1, keepdims=True)
    Q = Q / np.linalg.norm(Q, axis=1, keepdims=True)
    ranks, tops = [], []
    for i, row in qs.iterrows():
        order = np.argsort(-(P @ Q[i]))
        ranked = [names[j] for j in order]
        ranks.append(min(ranked.index(n) for n in row["exp"]) + 1)
        tops.append(ranked[:5])
    r = np.array(ranks)
    return {"hit@1": (r == 1).mean(), "hit@5": (r <= 5).mean(), "mrr": (1 / r).mean()}, r, tops


res = {f"fine-tune ({args.text_mode})": evaluate(args.tuned)}
if args.base_model:
    res[f"model gốc ({args.text_mode})"] = evaluate(args.base_model)

print(f"\n{len(qs)} câu hỏi | {len(df)} nơi nghỉ | văn bản: {args.text_mode}\n")
print(f"{'Model':<26}{'Hit@1':>8}{'Hit@5':>8}{'MRR':>8}")
for k, (m, _, _) in res.items():
    print(f"{k:<26}{m['hit@1']:>8.2f}{m['hit@5']:>8.2f}{m['mrr']:>8.2f}")

_, ranks, tops = res[f"fine-tune ({args.text_mode})"]
miss = [i for i, r in enumerate(ranks) if r > 5]
print("\n--- Câu không có đáp án trong top 5 ---")
if not miss:
    print("(không có)")
for i in miss:
    print(f"\n[hạng {ranks[i]}] {qs['query'][i]}\n  đúng: {qs['exp'][i]}\n  top 5: {tops[i]}")