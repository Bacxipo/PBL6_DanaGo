'use client';

import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Rating from '../components/comon/ui/Rating';
import PlaceList from "../components/comon/place/PlaceList";
import PlaceCardSkeleton from '../components/home/PlaceCardSkeleton';
import { RefreshCw, AlertCircle, Search, X } from 'lucide-react';
import { getRawDestinations, getDestinationCategories, normalizeDestinationCard } from "@/lib/destination-api";

import { searchPlaces } from '@/utils/filterPlace';

const AI_API_URL = process.env.NEXT_PUBLIC_AI_API_URL || 'http://localhost:8000';

// Các câu hỏi mẫu gợi ý nhanh cho AI Semantic Search
const AI_QUICK_PROMPTS = [
    '☕ Quán cà phê view sống ảo',
    '🏖️ Bãi biển trong xanh',
    '🏛️ Địa điểm văn hóa',
];

export default function Explore() {
    const searchParams = useSearchParams();
    const initialQuery = searchParams.get('search') || '';
    const initialCategory = searchParams.get('category') || 'Tất cả';

    const [destinations, setDestinations] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Bộ lọc thông thường
    const [searchTerm, setSearchTerm] = useState(initialQuery);
    const [category, setCategory] = useState(initialCategory);
    const [address, setAddress] = useState("Tất cả quận");
    const [minRating, setMinRating] = useState(0);

    // Chế độ tìm kiếm: 'standard' (theo tên) | 'ai' (gợi ý bằng AI theo text)
    const [searchMode, setSearchMode] = useState('standard');
    const [aiQuery, setAiQuery] = useState('');
    const [aiActiveQuery, setAiActiveQuery] = useState('');
    const [aiResults, setAiResults] = useState(null);
    const [aiLoading, setAiLoading] = useState(false);
    const [aiError, setAiError] = useState(null);

    // Cập nhật searchTerm khi URL query param thay đổi (ví dụ navigate từ trang Home)
    useEffect(() => {
        const queryFromUrl = searchParams.get('search');
        if (queryFromUrl !== null) {
            setSearchTerm(queryFromUrl);
        }
        const categoryFromUrl = searchParams.get('category');
        if (categoryFromUrl !== null) {
            setCategory(categoryFromUrl);
        }
    }, [searchParams]);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [destData, catData] = await Promise.all([
                getRawDestinations({ status: 'APPROVED' }),
                getDestinationCategories(),
            ]);
            setDestinations(destData);
            setCategories(catData);
        } catch (err) {
            console.error('Lỗi khi gọi API destinations:', err);
            setError(err.message || 'Không thể kết nối đến máy chủ API.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Gọi AI Semantic Search (NLP Matching)
    const handleAiSearch = async (queryText, interestsList = []) => {
        const text = (queryText || '').trim();
        if (!text && interestsList.length === 0) return;

        setAiLoading(true);
        setAiError(null);
        setSearchMode('ai');
        setAiActiveQuery(text || interestsList.join(', '));

        try {
            const payload = {
                query: text || null,
                interests: interestsList,
                budget_pp: null,
                region: null,
                top_k: 50,
            };

            const res = await fetch(`${AI_API_URL}/candidates`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                let detailMsg = errData.detail || `Lỗi máy chủ AI (Mã lỗi ${res.status})`;
                if (Array.isArray(detailMsg)) detailMsg = detailMsg.map((d) => d.msg || JSON.stringify(d)).join(', ');
                throw new Error(detailMsg);
            }

            const data = await res.json();
            setAiResults(data.top || []);
        } catch (err) {
            console.error('Lỗi tìm kiếm AI:', err);
            setAiError(
                err.message.includes('Failed to fetch')
                    ? 'Không thể kết nối tới AI Service (cổng 8000). Vui lòng đảm bảo server AI đang chạy.'
                    : err.message
            );
        } finally {
            setAiLoading(false);
        }
    };

    // Thoát khỏi kết quả tìm kiếm AI, quay lại danh sách toàn bộ điểm đến
    const handleClearAiSearch = () => {
        setAiResults(null);
        setAiQuery('');
        setAiActiveQuery('');
        setAiError(null);
        setSearchMode('standard');
    };

    // Danh sách các quận/huyện duy nhất lấy từ dữ liệu thực tế
    const districtsList = useMemo(() => {
        const unique = new Set(
            destinations
                .map((d) => d.district?.trim())
                .filter(Boolean)
        );
        return ["Tất cả quận", ...Array.from(unique).sort((a, b) => a.localeCompare(b, 'vi'))];
    }, [destinations]);

    // Chuẩn hóa danh sách điểm đến sang format PlaceCard cần (ghép nối Match Score từ AI nếu có)
    const mappedPlaces = useMemo(() => {
        if (aiResults && aiResults.length > 0) {
            return aiResults.map((aiItem) => {
                const raw = destinations.find((d) => d.id === aiItem.id);
                if (raw) {
                    const card = normalizeDestinationCard(raw);
                    return {
                        ...card,
                        matchScore: aiItem.match_score,
                    };
                }
                return {
                    id: aiItem.id,
                    name: aiItem.name,
                    img: null,
                    des: aiItem.price_text || '',
                    stars: aiItem.avg_rating || 4.5,
                    reviews: '100+',
                    category: aiItem.category || 'Khám phá',
                    categoryType: 'sightseeing',
                    address: aiItem.district ? `${aiItem.district}, Đà Nẵng` : 'Đà Nẵng',
                    district: aiItem.district || '',
                    priceDisplay: aiItem.price_text || 'Miễn phí',
                    time: `${aiItem.open || '08:00'} - ${aiItem.close || '18:00'}`,
                    matchScore: aiItem.match_score,
                };
            });
        }
        return destinations.map(normalizeDestinationCard);
    }, [destinations, aiResults]);

    // Áp dụng bộ lọc (bao gồm tìm kiếm theo tên hoặc danh sách đã lọc từ AI)
    const filteredPlaces = useMemo(() => {
        const source = aiResults ? mappedPlaces : searchPlaces(mappedPlaces, searchTerm);
        return source.filter((item) => {
            const matchCategory = category === "Tất cả" || item.category === category;
            const matchAddress = address === "Tất cả quận" || item.address === address;
            const matchRating = minRating === 0 || item.stars >= minRating;
            return matchCategory && matchAddress && matchRating;
        });
    }, [mappedPlaces, searchTerm, category, address, minRating, aiResults]);

    const handleClearFilter = () => {
        setSearchTerm("");
        setCategory("Tất cả");
        setAddress("Tất cả quận");
        setMinRating(0);
        handleClearAiSearch();
    };

    return (
        <section className="dana-content-page w-full flex flex-col lg:flex-row gap-6 px-4 sm:px-6 lg:px-8 py-6">
            {/* Cột Bộ Lọc Bên Trái */}
            <aside className="w-full lg:w-72 shrink-0 h-fit lg:sticky lg:top-24 flex flex-col bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80">
                <div className="flex items-center justify-between mb-5">
                    <h3 className="font-bold text-gray-800">Bộ lọc</h3>
                    <button
                        type="button"
                        onClick={handleClearFilter}
                        className="text-sm text-[#006971] font-bold hover:text-orange-500 cursor-pointer transition-colors"
                    >
                        Xóa lọc
                    </button>
                </div>

                {/* Danh mục */}
                <div>
                    <span className="text-sm font-bold text-gray-800 mb-3 block">Danh mục</span>
                    <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1 scrollbar-thin">
                        <button
                            type="button"
                            onClick={() => setCategory("Tất cả")}
                            className={`cursor-pointer px-3 py-2 rounded-xl text-xs text-center transition-all ${category === "Tất cả"
                                ? "bg-[#007C83] text-white font-bold shadow-sm"
                                : "bg-[#E2F5F6] text-[#007C83] hover:bg-[#d0f0f2]"
                                }`}
                        >
                            Tất cả
                        </button>
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                type="button"
                                onClick={() => setCategory(cat.name)}
                                className={`cursor-pointer px-3 py-2 rounded-xl text-xs text-center transition-all truncate ${category === cat.name
                                    ? "bg-[#007C83] text-white font-bold shadow-sm"
                                    : "bg-[#E2F5F6] text-[#007C83] hover:bg-[#d0f0f2]"
                                    }`}
                                title={cat.name}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Đánh giá */}
                <div className="mt-5">
                    <span className="text-sm font-bold text-gray-800 mb-3 block">Đánh giá tối thiểu</span>
                    <div className="space-y-2">
                        {[
                            { label: "Tất cả đánh giá", val: 0 },
                            { label: "5 sao", val: 5 },
                            { label: "Từ 4 sao trở lên", val: 4 },
                            { label: "Từ 3 sao trở lên", val: 3 },
                        ].map((r) => (
                            <label
                                key={r.val}
                                className="flex items-center gap-3 cursor-pointer group text-xs text-gray-700"
                            >
                                <input
                                    type="radio"
                                    name="ratingFilter"
                                    checked={minRating === r.val}
                                    onChange={() => setMinRating(r.val)}
                                    className="w-4 h-4 accent-[#006971] cursor-pointer"
                                />
                                {r.val > 0 ? <Rating rating={String(r.val)} /> : r.label}
                            </label>
                        ))}
                    </div>
                </div>

                {/* Khu vực */}
                <div className="mt-5">
                    <span className="text-sm font-bold text-gray-800 mb-3 block">Khu vực / Quận</span>
                    <select
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full bg-[#f7fafa] border border-slate-200/80 rounded-xl px-3 py-2 text-sm outline-none cursor-pointer focus:border-[#006971]"
                    >
                        {districtsList.map((dist, idx) => (
                            <option key={idx} value={dist}>
                                {dist}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex justify-center mt-6">
                    <button
                        type="button"
                        onClick={fetchData}
                        className="flex items-center justify-center gap-2 bg-[#006971] w-full p-2.5 rounded-xl font-bold text-white cursor-pointer hover:bg-[#00555c] transition-colors"
                    >
                        <RefreshCw className="w-4 h-4" /> Làm mới dữ liệu
                    </button>
                </div>
            </aside>

            {/* Cột Danh Sách Địa Điểm Bên Phải */}
            <div className="flex-1 min-w-0 flex flex-col">
                {/* THANH TÌM KIẾM ĐỈNH CAO: TÌM THEO TÊN & GỢI Ý BẰNG AI */}
                <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-2xs space-y-3 mb-5 shrink-0">
                    {/* Header chọn chế độ tìm kiếm & Thống kê kết quả */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-2.5">
                        <div className="flex items-center gap-1.5 p-1 bg-gray-100 rounded-xl text-xs font-bold self-start">
                            <button
                                type="button"
                                onClick={() => {
                                    setSearchMode('standard');
                                    if (aiResults) setAiResults(null);
                                }}
                                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${searchMode === 'standard' && !aiResults
                                    ? 'bg-white text-gray-900 shadow-2xs'
                                    : 'text-gray-500 hover:text-gray-800'
                                    }`}
                            >
                                <Search size={13} />
                                <span>Tìm kiếm theo tên</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setSearchMode('ai')}
                                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${searchMode === 'ai' || aiResults
                                    ? 'bg-[#006971] text-white shadow-2xs'
                                    : 'text-gray-500 hover:text-[#006971]'
                                    }`}
                            >
                                <Sparkles size={13} className="text-amber-300 fill-amber-300" />
                                <span>Gợi ý thông minh bằng AI</span>
                            </button>
                        </div>

                        {/* Thống kê kết quả */}
                        <div className="flex items-center gap-2">
                            <span role="status" className="text-gray-800 font-bold text-xs whitespace-nowrap">
                                {loading || aiLoading ? (
                                    <span className="text-[#006971] flex items-center gap-1.5">
                                        <Loader2 size={13} className="animate-spin" />
                                        <span>Đang xử lý dữ liệu...</span>
                                    </span>
                                ) : (
                                    `Tìm thấy ${filteredPlaces.length} điểm đến`
                                )}
                            </span>
                            {category !== "Tất cả" && (
                                <span className="text-2xs font-semibold px-2.5 py-0.5 bg-[#E2F5F6] text-[#007C83] rounded-full border border-[#007C83]/20 whitespace-nowrap">
                                    {category}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Ô NHẬP LIỆU THEO CHẾ ĐỘ ĐANG CHỌN */}
                    {searchMode === 'standard' && !aiResults ? (
                        /* CHẾ ĐỘ 1: TÌM THEO TÊN ĐỊA ĐIỂM */
                        <div className="relative">
                            <Search aria-hidden="true" className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            <input
                                id="destination-search"
                                type="text"
                                autoComplete="off"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Tìm kiếm theo tên địa điểm (Bà Nà, Mỹ Khê, Sơn Trà...)..."
                                className="w-full pl-11 pr-11 py-3 bg-white border border-slate-200 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:border-[#006971] focus:ring-2 focus:ring-[#006971]/20 transition-all shadow-xs"
                            />
                            {searchTerm && (
                                <button
                                    type="button"
                                    onClick={() => setSearchTerm("")}
                                    aria-label="Xóa từ khóa tìm kiếm"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer p-0.5 rounded-full hover:bg-gray-100 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    ) : (
                        /* CHẾ ĐỘ 2: GỢI Ý ĐỊA ĐIỂM BẰNG TEXT (AI SEMANTIC SEARCH) */
                        <div className="space-y-2.5">
                            <div className="relative flex items-center gap-2">
                                <div className="relative flex-1">
                                    <Sparkles className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#006971]" />
                                    <input
                                        type="text"
                                        value={aiQuery}
                                        onChange={(e) => setAiQuery(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                handleAiSearch(aiQuery);
                                            }
                                        }}
                                        placeholder="Mô tả trải nghiệm mong muốn (ví dụ: Chỗ ngắm hoàng hôn yên tĩnh, quán cà phê view biển ở Hội An...)..."
                                        className="w-full pl-10 pr-10 py-2.5 bg-teal-50/30 border border-teal-200 rounded-xl text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#006971] focus:ring-2 focus:ring-[#006971]/30 transition-all"
                                    />
                                    {aiQuery && (
                                        <button
                                            type="button"
                                            onClick={() => setAiQuery('')}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
                                        >
                                            <X size={14} />
                                        </button>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleAiSearch(aiQuery)}
                                    disabled={aiLoading || !aiQuery.trim()}
                                    className="px-4 py-2.5 bg-[#006971] hover:bg-[#00555c] active:scale-95 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-2xs shrink-0 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    {aiLoading ? (
                                        <>
                                            <Loader2 size={13} className="animate-spin" />
                                            <span>Đang tìm...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Send size={13} />
                                            <span>Tìm với AI</span>
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* Các prompt gợi ý nhanh */}
                            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                                <span className="text-2xs font-semibold text-gray-400 flex items-center gap-1 shrink-0">
                                    <Sparkles size={11} className="text-amber-500" /> Thử gợi ý:
                                </span>
                                {AI_QUICK_PROMPTS.map((p, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => {
                                            const clean = p.replace(/^[\p{Emoji}\s]+/u, '').trim();
                                            setAiQuery(clean);
                                            handleAiSearch(clean);
                                        }}
                                        className="text-2xs px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-teal-50 text-gray-700 hover:text-[#006971] transition-colors cursor-pointer"
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>

                            {/* Banner trạng thái kết quả AI */}
                            {aiResults && (
                                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-800">
                                    <div className="flex items-center gap-2 truncate">
                                        <Sparkles size={14} className="text-emerald-600 shrink-0" />
                                        <span className="truncate">
                                            Đã xếp hạng địa điểm theo AI cho: <strong>"{aiActiveQuery}"</strong>
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleClearAiSearch}
                                        className="text-2xs font-bold text-emerald-700 hover:text-red-600 underline shrink-0 cursor-pointer ml-2"
                                    >
                                        Xem lại toàn bộ 254 địa điểm
                                    </button>
                                </div>
                            )}

                            {/* Thông báo lỗi AI (nếu có) */}
                            {aiError && (
                                <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                                    <AlertCircle size={14} className="text-red-500 shrink-0" />
                                    <span>{aiError}</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="w-full flex flex-col">
                    {loading ? (
                        <PlaceCardSkeleton label="Đang tải danh sách điểm đến…" />
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center flex-1 gap-3 text-red-500 min-h-[400px]">
                            <AlertCircle className="w-10 h-10" />
                            <p className="text-base font-bold">{error}</p>
                            <button
                                type="button"
                                onClick={fetchData}
                                className="px-4 py-2 bg-[#006971] text-white rounded-lg text-sm font-semibold hover:bg-[#00555c] transition-colors cursor-pointer"
                            >
                                Thử lại
                            </button>
                        </div>
                    ) : (
                        <PlaceList places={filteredPlaces} placesPerPage={9} />
                    )}
                </div>
            </div>
        </section>
    );
}
