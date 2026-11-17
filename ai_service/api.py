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
import db_sync

DATA_PATH = os.environ.get("DANAGO_DATA", "data/destination_AI.csv")
API_KEY = os.environ.get("DANAGO_API_KEY")

LODGING_PATH = os.environ.get("DANAGO_LODGING", "data/lodging_AI.csv")
DF = tp.load_places(DATA_PATH)
LODGING = tp.load_lodging(LODGING_PATH) if os.path.exists(LODGING_PATH) else None
EMB_MODEL = os.environ.get("DANAGO_EMB_MODEL", "thaitoan1908/dana_travel_model")
_MODEL = None       # giữ instance SentenceTransformer trong RAM để reload nhanh
EMB = None          # (model, ma trận vector, id -> hàng)
EMB_ERROR = None


def _rebuild_embeddings():
    """Mã hoá lại ma trận vector embedding từ DF hiện tại mà không cần tải lại model."""
    global _MODEL, EMB, EMB_ERROR
    try:
        if _MODEL is None:
            from sentence_transformers import SentenceTransformer
            _MODEL = SentenceTransformer(EMB_MODEL)
        texts = DF["embedding_text"].astype(str).tolist()
        mat = np.asarray(_MODEL.encode(texts, normalize_embeddings=True, batch_size=32))
        EMB = (_MODEL, mat, {int(i): k for k, i in enumerate(DF["id"])})
        EMB_ERROR = None
    except Exception as e:
        EMB_ERROR = str(e)


def sync_and_reload_data():
    """Đồng bộ từ Backend API (nếu đang chạy) vào CSV rồi nạp lại DF, LODGING và vector embedding."""
    global DF, LODGING
    dest_synced, _ = db_sync.sync_destinations_from_backend(DATA_PATH)
    lodg_synced, _ = db_sync.sync_lodgings_from_backend(LODGING_PATH)
    DF = tp.load_places(DATA_PATH)
    LODGING = tp.load_lodging(LODGING_PATH) if os.path.exists(LODGING_PATH) else None
    if _MODEL is not None:
        _rebuild_embeddings()
    return {
        "status": "reloaded",
        "places": int(len(DF)),
        "lodgings": int(len(LODGING)) if LODGING is not None else 0,
        "synced_destinations_from_db": dest_synced,
        "synced_lodgings_from_db": lodg_synced,
    }


@asynccontextmanager
async def lifespan(app):
    """Đồng bộ dữ liệu mới nhất từ Backend, nạp model embedding và tính vector khi khởi động."""
    try:
        db_sync.sync_destinations_from_backend(DATA_PATH)
        db_sync.sync_lodgings_from_backend(LODGING_PATH)
        global DF, LODGING
        DF = tp.load_places(DATA_PATH)
        LODGING = tp.load_lodging(LODGING_PATH) if os.path.exists(LODGING_PATH) else None
    except Exception:
        pass
    _rebuild_embeddings()
    yield


import re

def normalize_query(query: str) -> str:
    """Chuẩn hoá câu query tìm kiếm tiếng Việt và mở rộng các từ viết tắt phổ biến."""
    if not query:
        return ""
    q = query.strip()
    patterns = [
        (r'\bcf\b', 'cà phê'),
        (r'\bcafe\b', 'cà phê'),
        (r'\bks\b', 'khách sạn'),
        (r'\bđn\b', 'Đà Nẵng'),
        (r'\bha\b', 'Hội An'),
        (r'\bqn\b', 'Quảng Nam'),
        (r'\bq\.?ăn\b', 'quán ăn'),
    ]
    for pattern, repl in patterns:
        q = re.sub(pattern, repl, q, flags=re.IGNORECASE)
    return q


def query_scores(query):
    model, mat, _ = EMB
    expanded = normalize_query(query)
    q = model.encode([expanded], normalize_embeddings=True)[0]
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
    regions: List[str] = Field(default_factory=list, description="Danh sách khu vực trọng tâm người dùng chọn")
    per_group: int = Field(default=6, ge=1, le=30)
    top_k: int = Field(default=10, ge=1, le=100)
    include_food: bool = Field(default=True, description="Bao gồm quán ăn, quán cà phê trong kết quả")


class PlanIn(BaseModel):
    num_days: int = Field(ge=1, le=7)
    budget_pp: int = Field(gt=0, description="Ngân sách mỗi người cho cả chuyến (VND)")
    interests: List[str] = Field(default_factory=list)
    region: Optional[str] = None
    regions: List[str] = Field(default_factory=list, description="Danh sách khu vực trọng tâm người dùng chọn (rỗng = tất cả khu vực)")
    selected_ids: List[int] = Field(default_factory=list, description="Điểm tham quan người dùng đã chọn")
    lodging_ids: List[int] = Field(default_factory=list, description="Nơi nghỉ người dùng đã chọn, theo thứ tự từng đêm")
    include_meals: bool = Field(default=True, description="Có gợi ý quán ăn/quán cà phê cho bữa sáng, trưa, tối hay không (chi phí ăn uống tùy theo món, không tính vào ngân sách)")
    include_lodging: bool = Field(default=True, description="Có tính chi phí và xếp nơi lưu trú hay không")
    guests_per_room: int = Field(default=2, ge=1, le=10, description="Số người ở chung mỗi phòng (1 = đi 1 người / phòng riêng)")
    lodging_price_tier: Optional[str] = Field(default="auto", description="Phân khúc giá nơi lưu trú: auto, low (<=500k/đêm), mid (450k-1.3tr/đêm), high (>1.2tr/đêm)")
    places_per_day: int = Field(default=3, ge=2, le=3, description="Số địa điểm tham quan mỗi ngày: 2 hoặc 3")
    randomize: bool = Field(default=True, description="Đa dạng hoá kết quả để mỗi lần tạo lịch trình ra phương án mới")


@app.get("/health")
def health():
    return {
        "status": "ok",
        "places": int(len(DF)),
        "lodgings": int(len(LODGING)) if LODGING is not None else 0,
        "embedding_loaded": EMB is not None,
        "embedding_error": EMB_ERROR,
    }


@app.post("/reload", dependencies=[Depends(require_key)])
@app.get("/reload", dependencies=[Depends(require_key)])
def reload_ai_data():
    """Đồng bộ ngay dữ liệu Destination & Lodging từ Backend DB vào CSV và nạp lại bộ nhớ AI."""
    return sync_and_reload_data()


@app.post("/lodging", dependencies=[Depends(require_key)])
def lodging(
    budget_pp: Optional[int] = None,
    region: Optional[str] = None,
    type: Optional[str] = None,
    price_tier: Optional[str] = None,
    top_k: Optional[int] = None,
):
    """Danh sách nơi nghỉ để người dùng chọn, xếp theo đánh giá, lọc theo ngân sách, phân khúc giá và loại nơi nghỉ."""
    if LODGING is None:
        raise HTTPException(status_code=503, detail="Chưa có dữ liệu nơi nghỉ")
    d = LODGING
    reg_list = tp._normalize_regions(region)
    if reg_list:
        d = d[d["region"].isin(reg_list)]
    if type:
        d = d[d["type"] == type]
    if budget_pp is not None:
        d = d[d["price_pp_night"] <= budget_pp]
    if price_tier and price_tier in tp.LODGING_TIERS:
        tier_cfg = tp.LODGING_TIERS[price_tier]
        sub = d[(d["price_per_night"] >= tier_cfg["min"]) & (d["price_per_night"] <= tier_cfg["max"])]
        if not sub.empty:
            d = sub
    d = d.sort_values(["avg_rating", "id"], ascending=[False, True])
    if top_k is not None and top_k > 0:
        d = d.head(top_k)
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
    effective_regions = body.regions if body.regions else body.region
    try:
        res = tp.get_candidates(DF, interests, body.budget_pp, effective_regions,
                                body.per_group, scores, body.top_k,
                                include_food=body.include_food)
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
        effective_regions = body.regions if body.regions else body.region
        return tp.make_plan(
            DF, body.num_days, body.budget_pp, body.interests, effective_regions,
            body.selected_ids,
            lodging_df=LODGING if body.include_lodging else None,
            lodging_ids=body.lodging_ids,
            include_meals=body.include_meals,
            include_lodging=body.include_lodging,
            guests_per_room=body.guests_per_room,
            lodging_price_tier=body.lodging_price_tier or "auto",
            places_per_day=body.places_per_day,
            randomize=body.randomize,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))