"""
api.py - AI service cho DanaGO: gợi ý địa điểm và lên lịch trình.

Chạy local:   uvicorn api:app --reload --port 8000
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
EMB_MODEL = os.environ.get("DANAGO_EMB_MODEL", "thaitoan1908/dana_travel_model")
EMB = None          # (model, matrix, id->row)
EMB_ERROR = None
import trip_planner as tp

DATA_PATH = os.environ.get("DANAGO_DATA", "data/destination_AI.csv")
API_KEY = os.environ.get("DANAGO_API_KEY")

DF = tp.load_places(DATA_PATH)
EMB_MODEL = os.environ.get("DANAGO_EMB_MODEL", "thaitoan1908/dana_travel_model")
EMB = None          # (model, ma trận vector, id -> hàng)
EMB_ERROR = None


@asynccontextmanager
async def lifespan(app):
    global EMB, EMB_ERROR
    try:
        from sentence_transformers import SentenceTransformer
        model = SentenceTransformer(EMB_MODEL)
        texts = DF["embedding_text"].astype(str).tolist()
        mat = model.encode(texts, normalize_embeddings=True, batch_size=32)
        EMB = (model, np.asarray(mat), {int(i): k for k, i in enumerate(DF["id"])})
    except Exception as e:
        EMB_ERROR = str(e)
    yield


app = FastAPI(title="DanaGO AI Service", version="1.1", lifespan=lifespan)

# Bật CORS để Web Frontend (Next.js) có thể gọi trực tiếp
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def query_scores(query):
    model, mat, _ = EMB
    q = model.encode([query], normalize_embeddings=True)[0]
    sims = mat @ q
    return {int(i): float(sims[k]) for k, i in enumerate(DF["id"])}


def require_key(x_api_key: Optional[str] = Header(default=None)):
    if API_KEY and x_api_key != API_KEY:
        raise HTTPException(status_code=401, detail="API key không hợp lệ")


class CandidatesIn(BaseModel):
    interests: List[str] = Field(default_factory=list)
    budget_pp: Optional[int] = Field(default=None, gt=0, description="Ngân sách mỗi người (VND), để trống hoặc null nếu không giới hạn")
    region: Optional[str] = None
    per_group: int = Field(default=6, ge=1, le=20)
    top_k: Optional[int] = None
    query: Optional[str] = Field(default=None, max_length=300, description="Mô tả tự do, tiếng Việt")


class PlanIn(BaseModel):
    num_days: int = Field(ge=1, le=7)
    budget_pp: int = Field(gt=0, description="Ngân sách mỗi người cho cả chuyến (VND)")
    interests: List[str] = Field(default_factory=list)
    region: Optional[str] = None
    selected_ids: List[int] = Field(default_factory=list, description="Địa điểm người dùng đã chọn")


@app.get("/health")
def health():
    return {"status": "ok", "places": int(len(DF)), "embedding_loaded": EMB is not None, "embedding_error": EMB_ERROR}

@app.post("/candidates", dependencies=[Depends(require_key)])
def candidates(body: CandidatesIn):
    scores = None
    if body.query and body.query.strip():
        if EMB is None:
            raise HTTPException(status_code=503, detail=f"Chưa nạp được model embedding: {EMB_ERROR}")
        scores = query_scores(body.query.strip())
    try:
        groups = tp.get_candidates(DF, body.interests, body.budget_pp, body.region, body.per_group, scores)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return {"budget_pp": body.budget_pp, "query": body.query,
            "ranked_by": "embedding" if scores else "rating", "groups": groups}


@app.post("/plan", dependencies=[Depends(require_key)])
def plan(body: PlanIn):
    try:
        if body.interests:
            bad = [i for i in body.interests if i not in tp.INTERESTS]
            if bad:
                raise ValueError(f"Nhóm sở thích không hợp lệ: {bad}")
        return tp.make_plan(DF, body.num_days, body.budget_pp, body.interests, body.region, body.selected_ids)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
