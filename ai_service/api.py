"""
api.py - AI service cho DanaGO: gợi ý địa điểm và lên lịch trình.

Chạy local:   uvicorn api:app --port 8000
.\venv\Scripts\Activate.ps1
uvicorn api:app --port 8000 --reload
Biến môi trường (tuỳ chọn):
  DANAGO_DATA     đường dẫn destination_AI.csv (mặc định data/destination_AI.csv)
  DANAGO_API_KEY  nếu đặt, mọi request phải gửi header X-API-Key trùng khớp
"""
import os
from typing import List, Optional

from contextlib import asynccontextmanager

import numpy as np
from fastapi import Depends, FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

import trip_planner as tp

DATA_PATH = os.environ.get("DANAGO_DATA", "data/destination_AI.csv")
API_KEY = os.environ.get("DANAGO_API_KEY")

LODGING_PATH = os.environ.get("DANAGO_LODGING", "data/lodging_AI.csv")
DF = tp.load_places(DATA_PATH)
LODGING = tp.load_lodging(LODGING_PATH) if os.path.exists(LODGING_PATH) else None
EMB_MODEL = os.environ.get("DANAGO_EMB_MODEL", "thaitoan1908/dana_travel_model")
EMB = None          # (model, ma trận vector, id -> hàng)
EMB_ERROR = None


@asynccontextmanager
async def lifespan(app):
    """Nạp model embedding và tính vector cho mọi địa điểm một lần khi khởi động."""
    global EMB, EMB_ERROR
    try:
        from sentence_transformers import SentenceTransformer
        model = SentenceTransformer(EMB_MODEL)
        texts = DF["embedding_text"].astype(str).tolist()
        mat = np.asarray(model.encode(texts, normalize_embeddings=True, batch_size=32))
        EMB = (model, mat, {int(i): k for k, i in enumerate(DF["id"])})
    except Exception as e:  # dịch vụ vẫn chạy, chỉ /candidates có query bị từ chối
        EMB_ERROR = str(e)
    yield


def query_scores(query):
    model, mat, _ = EMB
    q = model.encode([query], normalize_embeddings=True)[0]
    sims = mat @ q
    return {int(i): float(sims[k]) for k, i in enumerate(DF["id"])}


app = FastAPI(title="DanaGO AI Service", version="1.1", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def require_key(x_api_key: Optional[str] = Header(default=None)):
    if API_KEY and x_api_key != API_KEY:
        raise HTTPException(status_code=401, detail="API key không hợp lệ")


class CandidatesIn(BaseModel):
    query: Optional[str] = Field(default=None, max_length=300, description="Mô tả tự do, tiếng Việt")
    interests: List[str] = Field(default_factory=list, description="Nhóm sở thích, rỗng = tất cả")
    budget_pp: Optional[int] = Field(default=None, gt=0, description="Ngân sách mỗi người (VND), không bắt buộc")
    region: Optional[str] = None
    per_group: int = Field(default=6, ge=1, le=20)
    top_k: int = Field(default=10, ge=1, le=50)


class PlanIn(BaseModel):
    num_days: int = Field(ge=1, le=7)
    budget_pp: int = Field(gt=0, description="Ngân sách mỗi người cho cả chuyến (VND)")
    interests: List[str] = Field(default_factory=list)
    region: Optional[str] = None
    selected_ids: List[int] = Field(default_factory=list, description="Điểm tham quan người dùng đã chọn")
    lodging_ids: List[int] = Field(default_factory=list, description="Nơi nghỉ người dùng đã chọn, theo thứ tự từng đêm")


@app.get("/health")
def health():
    return {"status": "ok", "places": int(len(DF)),
            "embedding_loaded": EMB is not None, "embedding_error": EMB_ERROR}


@app.post("/lodging", dependencies=[Depends(require_key)])
def lodging(budget_pp: Optional[int] = None, region: Optional[str] = None, top_k: int = 10):
    """Danh sách nơi nghỉ để người dùng chọn, xếp theo đánh giá, lọc theo ngân sách một người mỗi đêm."""
    if LODGING is None:
        raise HTTPException(status_code=503, detail="Chưa có dữ liệu nơi nghỉ")
    d = LODGING
    if region:
        d = d[d["region"] == region]
    if budget_pp is not None:
        d = d[d["price_pp_night"] <= budget_pp]
    d = d.sort_values(["avg_rating", "id"], ascending=[False, True]).head(top_k)
    cols = ["id", "name", "type", "region", "district", "latitude", "longitude", "price_per_night",
            "price_pp_night", "max_guests", "checkin", "checkout", "avg_rating", "address_url"]
    return {"count": len(d), "items": d[cols].to_dict("records")}


@app.post("/candidates", dependencies=[Depends(require_key)])
def candidates(body: CandidatesIn):
    q = (body.query or "").strip()
    interests = body.interests or []
    if not q and body.budget_pp is None and not interests:
        interests = tp.INTERESTS
    scores = None
    if q:
        if EMB is None:
            raise HTTPException(status_code=503, detail=f"Chưa nạp được model embedding: {EMB_ERROR}")
        scores = query_scores(q)
    try:
        res = tp.get_candidates(DF, interests, body.budget_pp, body.region,
                                body.per_group, scores, body.top_k)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return {"query": q or None, "budget_pp": body.budget_pp,
            "ranked_by": "embedding" if scores else "rating",
            "top": res["top"], "groups": res["groups"]}


@app.post("/plan", dependencies=[Depends(require_key)])
def plan(body: PlanIn):
    try:
        if body.interests:
            bad = [i for i in body.interests if i not in tp.INTERESTS]
            if bad:
                raise ValueError(f"Nhóm sở thích không hợp lệ: {bad}")
        return tp.make_plan(DF, body.num_days, body.budget_pp, body.interests, body.region,
                            body.selected_ids, lodging_df=LODGING, lodging_ids=body.lodging_ids)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))