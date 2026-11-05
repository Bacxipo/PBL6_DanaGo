'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Sparkles,
    MapPin,
    Clock,
    Coins,
    Star,
    Compass,
    Check,
    AlertCircle,
    Loader2,
    RotateCcw,
    SlidersHorizontal,
    Waves,
    Utensils,
    Landmark,
    Trees,
    FerrisWheel,
    ArrowRight,
    Send,
    CornerDownLeft,
} from 'lucide-react';

const AI_API_URL = process.env.NEXT_PUBLIC_AI_API_URL || 'http://localhost:8000';
const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// 5 nhóm sở thích chuẩn từ model AI DanaGo
const INTEREST_GROUPS = [
    { id: 'Biển & đảo', label: 'Biển & Đảo', icon: Waves },
    { id: 'Ẩm thực', label: 'Ẩm thực địa phương', icon: Utensils },
    { id: 'Văn hóa & lịch sử', label: 'Văn hóa & Lịch sử', icon: Landmark },
    { id: 'Thiên nhiên & khám phá', label: 'Thiên nhiên & Khám phá', icon: Trees },
    { id: 'Vui chơi & check-in', label: 'Vui chơi & Check-in', icon: FerrisWheel },
];

// Danh sách khu vực
const REGIONS = [
    { value: '', label: 'Tất cả khu vực' },
    { value: 'Đà Nẵng nội thành', label: 'Đà Nẵng nội thành' },
    { value: 'Hội An - Điện Bàn', label: 'Hội An - Điện Bàn' },
    { value: 'Hòa Vang - Bà Nà', label: 'Hòa Vang - Bà Nà' },
    { value: 'Duy Xuyên - Mỹ Sơn', label: 'Duy Xuyên - Mỹ Sơn' },
    { value: 'Cù Lao Chàm', label: 'Cù Lao Chàm' },
    { value: 'Nam Quảng Nam', label: 'Nam Quảng Nam' },
    { value: 'Tây Bắc Quảng Nam', label: 'Tây Bắc Quảng Nam' },
    { value: 'Tây Nam Quảng Nam', label: 'Tây Nam Quảng Nam' },
];

// Các gợi ý câu hỏi mẫu thông minh
const QUICK_PROMPTS = [
    '🌅 Chỗ ngắm hoàng hôn yên tĩnh lãng mạn',
    '☕ Quán cà phê view đẹp sống ảo ở Hội An',
    '🏖️ Bãi biển trong xanh yên bình ít người',
    '🍜 Quán ăn ngon đặc sản đậm chất Đà Nẵng',
    '🏛️ Địa điểm văn hóa lịch sử tâm linh',
    '🌲 Khám phá thiên nhiên suối thác mát mẻ',
];

// Ảnh mặc định theo từng nhóm sở thích khi chưa tải được ảnh riêng
const FALLBACK_IMAGES = {
    'Biển & đảo': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
    'Ẩm thực': 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80',
    'Văn hóa & lịch sử': 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800&q=80',
    'Thiên nhiên & khám phá': 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&q=80',
    'Vui chơi & check-in': 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=800&q=80',
};

export default function AIPlanPage() {
    // Form States
    const [query, setQuery] = useState('');
    const [selectedInterests, setSelectedInterests] = useState([]);
    const [region, setRegion] = useState('');
    const [budget, setBudget] = useState('');
    const [perGroup, setPerGroup] = useState(6);

    // Results States
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [results, setResults] = useState(null);
    const [activeGroupTab, setActiveGroupTab] = useState('ALL');
    const [selectedPlaces, setSelectedPlaces] = useState([]);
    const [destinationThumbnails, setDestinationThumbnails] = useState({});

    // Toggle nhóm sở thích
    const toggleInterest = (interestId) => {
        setSelectedInterests((prev) =>
            prev.includes(interestId) ? prev.filter((i) => i !== interestId) : [...prev, interestId]
        );
    };

    // Chọn câu hỏi mẫu
    const handleSelectPrompt = (prompt) => {
        const cleanText = prompt.replace(/^[\p{Emoji}\s]+/u, '').trim();
        setQuery(cleanText);
    };

    // Gửi request tới AI Service
    const handleSearchCandidates = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        setLoading(true);
        setError(null);

        // Chuyển đổi ngân sách thành số (nếu có)
        let parsedBudget = null;
        if (budget && budget.toString().trim()) {
            const num = parseInt(budget.toString().replace(/[^0-9]/g, ''), 10);
            if (!isNaN(num) && num > 0) {
                parsedBudget = num;
            }
        }

        const payload = {
            query: query.trim() || null,
            interests: selectedInterests,
            budget_pp: parsedBudget,
            region: region || null,
            per_group: perGroup,
            top_k: 12,
        };

        try {
            const res = await fetch(`${AI_API_URL}/candidates`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                let detailMsg = errData.detail;
                if (Array.isArray(detailMsg)) {
                    detailMsg = detailMsg.map((d) => d.msg || JSON.stringify(d)).join(', ');
                }
                throw new Error(detailMsg || `Lỗi máy chủ AI (Mã lỗi ${res.status})`);
            }

            const data = await res.json();
            setResults(data);
            setActiveGroupTab('ALL');

            // Tải ảnh đại diện cho các địa điểm trả về từ backend API (nếu có)
            fetchThumbnailsForResults(data.groups);
        } catch (err) {
            console.error('Lỗi khi gọi AI service:', err);
            setError(
                err.message.includes('Failed to fetch')
                    ? 'Không thể kết nối tới AI Service (cổng 8000). Vui lòng đảm bảo bạn đang chạy server AI ở terminal local: "uvicorn api:app --port 8000"'
                    : err.message
            );
        } finally {
            setLoading(false);
        }
    };

    // Lấy thumbnail ảnh từ API Backend cho các địa điểm tìm được
    const fetchThumbnailsForResults = (groups) => {
        if (!groups) return;
        const allPlaces = Object.values(groups).flat();
        const ids = [...new Set(allPlaces.map((p) => p.id))].slice(0, 30);

        ids.forEach(async (id) => {
            if (destinationThumbnails[id]) return;
            try {
                const res = await fetch(`${BACKEND_API_URL}/destinations/${id}`);
                if (res.ok) {
                    const placeData = await res.json();
                    let imgUrl = null;
                    if (placeData.images && placeData.images.length > 0) {
                        imgUrl = typeof placeData.images[0] === 'string' ? placeData.images[0] : placeData.images[0]?.imageUrl;
                    }
                    if (imgUrl) {
                        setDestinationThumbnails((prev) => ({ ...prev, [id]: imgUrl }));
                    }
                }
            } catch {
                // Bỏ qua lỗi tải thumbnail lẻ
            }
        });
    };

    // Toggle chọn địa điểm
    const toggleSelectPlace = (place) => {
        setSelectedPlaces((prev) => {
            const exists = prev.some((p) => p.id === place.id);
            if (exists) {
                return prev.filter((p) => p.id !== place.id);
            } else {
                return [...prev, place];
            }
        });
    };

    // Tự động tìm kiếm lần đầu khi vào trang
    useEffect(() => {
        handleSearchCandidates();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Lọc danh sách địa điểm theo tab đang chọn
    const getDisplayedPlaces = () => {
        if (!results || !results.groups) return [];
        if (activeGroupTab === 'ALL') {
            const all = [];
            Object.entries(results.groups).forEach(([groupName, places]) => {
                places.forEach((p) => all.push({ ...p, groupName }));
            });
            // Nếu có match_score thì sắp xếp giảm dần theo match_score
            if (results.ranked_by === 'embedding') {
                all.sort((a, b) => (b.match_score || 0) - (a.match_score || 0));
            }
            return all;
        }
        return (results.groups[activeGroupTab] || []).map((p) => ({ ...p, groupName: activeGroupTab }));
    };

    const displayedPlaces = getDisplayedPlaces();
    const totalPlacesCount = results?.groups
        ? Object.values(results.groups).reduce((acc, curr) => acc + curr.length, 0)
        : 0;

    return (
        <div className="w-full min-h-screen bg-gray-50/60 pb-16">
            {/* ================= HERO HEADER ================= */}
            <div className="bg-gradient-to-r from-[#004e54] via-[#006971] to-[#00828c] text-white py-10 px-4 mb-8 shadow-sm">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="space-y-2 max-w-2xl text-center md:text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold text-amber-200 border border-white/20">
                            <Sparkles size={14} className="text-amber-300 animate-pulse" />
                            DanaGO AI Semantic Discovery
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                            Gợi Ý Địa Điểm Du Lịch Thông Minh
                        </h1>
                        <p className="text-sm sm:text-base text-gray-200 leading-relaxed">
                            Mô tả trải nghiệm mong muốn của bạn bằng ngôn ngữ tự nhiên, hệ thống AI sẽ phân tích ngữ nghĩa
                            và đề xuất những điểm đến phù hợp nhất tại Đà Nẵng & Quảng Nam.
                        </p>
                    </div>

                    {/* Huy hiệu AI Stats */}
                    <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md border border-white/15 p-4 rounded-2xl shadow-inner shrink-0">
                        <div className="text-center px-2">
                            <div className="text-2xl font-black text-amber-300">250+</div>
                            <div className="text-xs text-gray-200">Địa điểm du lịch</div>
                        </div>
                        <div className="h-8 w-px bg-white/20" />
                        <div className="text-center px-2">
                            <div className="text-2xl font-black text-emerald-300">AI</div>
                            <div className="text-xs text-gray-200">Semantic Matching</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* ================= CỘT TRÁI: FORM ĐIỀU KHIỂN & BỘ LỌC ================= */}
                    <aside className="lg:col-span-4 bg-white p-6 rounded-2xl shadow-xs border border-gray-100 space-y-6 lg:sticky lg:top-6">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                            <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
                                <SlidersHorizontal size={18} className="text-[#006971]" />
                                Yêu cầu & Bộ lọc
                            </h2>
                            <button
                                type="button"
                                onClick={() => {
                                    setQuery('');
                                    setSelectedInterests([]);
                                    setRegion('');
                                    setBudget('');
                                }}
                                className="text-xs text-gray-500 hover:text-[#006971] flex items-center gap-1 transition-colors cursor-pointer"
                            >
                                <RotateCcw size={12} /> Đặt lại
                            </button>
                        </div>

                        {/* 1. Ô NHẬP MÔ TẢ TỰ DO CHO AI */}
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="block text-sm font-semibold text-gray-800">
                                    Mô tả mong muốn của bạn:
                                </label>
                                <span className="text-xs font-normal text-gray-400">{query.length}/300</span>
                            </div>

                            {/* Khung Textarea tích hợp nút Gửi và phím Enter */}
                            <div className="rounded-2xl border border-gray-300 bg-white p-2.5 focus-within:ring-2 focus-within:ring-[#006971]/30 focus-within:border-[#006971] transition-all shadow-xs">
                                <textarea
                                    rows={3}
                                    maxLength={300}
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSearchCandidates();
                                        }
                                    }}
                                    placeholder="Ví dụ: Chỗ ngắm hoàng hôn yên tĩnh lãng mạn, hoặc quán cà phê view biển đẹp ở Hội An..."
                                    className="w-full p-1 text-sm bg-transparent text-gray-800 placeholder-gray-400 focus:outline-none resize-none leading-relaxed"
                                />

                                <div className="flex items-center justify-between pt-2 border-t border-gray-100 mt-1">
                                    <span className="text-xs text-gray-400 flex items-center gap-1 select-none">
                                        <CornerDownLeft size={11} className="text-gray-400" />
                                        Nhấn <kbd className="px-1 py-0.5 bg-gray-100 rounded text-gray-600 font-sans text-xs">Enter</kbd> để gửi
                                    </span>

                                    {/* Nút gửi trực tiếp cạnh ô text */}
                                    <button
                                        type="button"
                                        onClick={handleSearchCandidates}
                                        disabled={loading}
                                        className="px-3.5 py-1.5 rounded-xl bg-[#006971] hover:bg-[#00555c] active:scale-95 text-white transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-xs"
                                        title="Gửi tìm kiếm (Enter)"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 size={13} className="animate-spin" />
                                                <span>Đang gửi...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Send size={13} className="stroke-[2.5]" />
                                                <span>Gửi</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Gợi ý nhanh các prompt mẫu */}
                            <div className="mt-2.5">
                                <span className="text-xs font-medium text-gray-500 mb-1.5 flex items-center gap-1">
                                    <Sparkles size={12} className="text-amber-500" /> Thử các gợi ý nhanh:
                                </span>
                                <div className="flex flex-wrap gap-1.5">
                                    {QUICK_PROMPTS.map((p, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => handleSelectPrompt(p)}
                                            className="text-xs px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-[#e6f4f5] text-gray-700 hover:text-[#006971] transition-colors cursor-pointer text-left"
                                        >
                                            {p}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* 2. CHỌN NHÓM SỞ THÍCH */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-800 mb-2">
                                Nhóm sở thích (AI phân nhóm):
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {INTEREST_GROUPS.map((ig) => {
                                    const isSelected = selectedInterests.includes(ig.id);
                                    const IconComponent = ig.icon;
                                    return (
                                        <button
                                            key={ig.id}
                                            type="button"
                                            onClick={() => toggleInterest(ig.id)}
                                            className={`px-3 py-1.5 rounded-xl text-xs font-medium border flex items-center gap-1.5 transition-all cursor-pointer ${isSelected
                                                    ? 'bg-[#006971] text-white border-[#006971] shadow-xs'
                                                    : 'bg-white text-gray-700 border-gray-200 hover:border-[#006971]/40'
                                                }`}
                                        >
                                            <IconComponent size={14} className={isSelected ? 'text-white' : 'text-gray-500'} />
                                            {ig.label}
                                            {isSelected && <Check size={12} className="ml-0.5" />}
                                        </button>
                                    );
                                })}
                            </div>
                            <p className="text-2xs text-gray-400 mt-1.5">
                                * Để trống để AI tự động phân bổ theo tất cả 5 nhóm sở thích.
                            </p>
                        </div>

                        {/* 3. CHỌN KHU VỰC */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-800 mb-1.5">
                                Khu vực ưu tiên:
                            </label>
                            <select
                                value={region}
                                onChange={(e) => setRegion(e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white text-gray-800 focus:outline-none focus:border-[#006971] cursor-pointer"
                            >
                                {REGIONS.map((r) => (
                                    <option key={r.value} value={r.value}>
                                        {r.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* 4. NGÂN SÁCH MỖI NGƯỜI */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-800 mb-1.5">
                                Ngân sách tối đa / người (VNĐ):
                            </label>
                            <input
                                type="text"
                                value={budget}
                                onChange={(e) => setBudget(e.target.value)}
                                placeholder="Ví dụ: 500000 hoặc để trống"
                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white text-gray-800 focus:outline-none focus:border-[#006971]"
                            />
                            <div className="flex gap-2 mt-2">
                                {[
                                    { label: 'Miễn phí', val: '0' },
                                    { label: '< 200k', val: '200000' },
                                    { label: '< 500k', val: '500000' },
                                    { label: '< 1 triệu', val: '1000000' },
                                ].map((b, i) => (
                                    <button
                                        key={i}
                                        type="button"
                                        onClick={() => setBudget(b.val)}
                                        className="text-2xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-600 cursor-pointer"
                                    >
                                        {b.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* NÚT TÌM KIẾM CHÍNH */}
                        <button
                            type="button"
                            onClick={handleSearchCandidates}
                            disabled={loading}
                            className="w-full py-3 rounded-xl bg-[#006971] hover:bg-[#00555c] active:scale-[0.99] text-white font-semibold text-sm transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    Đang phân tích & tìm kiếm...
                                </>
                            ) : (
                                <>
                                    <Sparkles size={16} className="text-amber-300" />
                                    Tìm kiếm với AI
                                </>
                            )}
                        </button>
                    </aside>

                    {/* ================= CỘT PHẢI: KẾT QUẢ ĐỊA ĐIỂM GỢI Ý ================= */}
                    <main className="lg:col-span-8 space-y-6">
                        {/* THÔNG BÁO LỖI (NẾU CÓ) */}
                        {error && (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-red-700 text-sm">
                                <AlertCircle size={18} className="shrink-0 mt-0.5 text-red-500" />
                                <div className="space-y-1">
                                    <div className="font-semibold">Đã xảy ra lỗi khi tìm kiếm:</div>
                                    <div className="text-xs text-red-600">{error}</div>
                                </div>
                            </div>
                        )}

                        {/* THANH TAB LỌC KẾT QUẢ THEO NHÓM */}
                        {results && (
                            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs space-y-3">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                                    <div>
                                        <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                                            <Compass size={18} className="text-[#006971]" />
                                            Gợi Ý Phù Hợp ({totalPlacesCount} địa điểm)
                                        </h3>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            {results.ranked_by === 'embedding' ? (
                                                <span className="text-emerald-700 font-medium">
                                                    ✨ Đã xếp hạng ưu tiên theo mức độ phù hợp ngữ nghĩa câu hỏi của bạn
                                                </span>
                                            ) : (
                                                'Sắp xếp theo độ nổi tiếng & đánh giá người dùng'
                                            )}
                                        </p>
                                    </div>
                                    {results.applied_filters?.budget_pp && (
                                        <span className="text-xs px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg self-start sm:self-auto font-medium">
                                            Ngân sách &le; {results.applied_filters.budget_pp.toLocaleString('vi-VN')} đ
                                        </span>
                                    )}
                                </div>

                                {/* Tabs các nhóm */}
                                <div className="flex flex-wrap gap-2 pt-1">
                                    <button
                                        type="button"
                                        onClick={() => setActiveGroupTab('ALL')}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${activeGroupTab === 'ALL'
                                                ? 'bg-[#006971] text-white shadow-xs'
                                                : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                                            }`}
                                    >
                                        Tất cả ({totalPlacesCount})
                                    </button>
                                    {results.groups &&
                                        Object.entries(results.groups).map(([groupName, places]) => (
                                            <button
                                                key={groupName}
                                                type="button"
                                                onClick={() => setActiveGroupTab(groupName)}
                                                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${activeGroupTab === groupName
                                                        ? 'bg-[#006971] text-white shadow-xs'
                                                        : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                                                    }`}
                                            >
                                                {groupName} ({places.length})
                                            </button>
                                        ))}
                                </div>
                            </div>
                        )}

                        {/* DANH SÁCH THẺ ĐỊA ĐIỂM (CARDS) */}
                        {loading ? (
                            <div className="py-20 flex flex-col items-center justify-center space-y-4 bg-white rounded-2xl border border-gray-100">
                                <Loader2 size={36} className="text-[#006971] animate-spin" />
                                <div className="text-center space-y-1">
                                    <div className="text-sm font-semibold text-gray-800">
                                        DanaGO AI đang tìm kiếm và đối soát địa điểm...
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        Mô hình ngôn ngữ đang so khớp nội dung với cơ sở dữ liệu hơn 250 điểm du lịch.
                                    </div>
                                </div>
                            </div>
                        ) : displayedPlaces.length === 0 ? (
                            <div className="py-16 text-center bg-white rounded-2xl border border-gray-100 p-6 space-y-3">
                                <Compass size={40} className="mx-auto text-gray-300" />
                                <div className="text-base font-bold text-gray-800">
                                    Chưa có địa điểm nào phù hợp
                                </div>
                                <p className="text-xs text-gray-500 max-w-md mx-auto">
                                    Hãy thử điều chỉnh lại câu mô tả, mở rộng khoảng ngân sách hoặc chọn thêm các nhóm sở thích khác để tìm thêm gợi ý.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {displayedPlaces.map((place) => {
                                    const isSelected = selectedPlaces.some((p) => p.id === place.id);
                                    const thumbnail =
                                        destinationThumbnails[place.id] ||
                                        FALLBACK_IMAGES[place.groupName] ||
                                        FALLBACK_IMAGES['Biển & đảo'];

                                    const matchPercent =
                                        place.match_score !== undefined
                                            ? Math.round(place.match_score * 100)
                                            : null;

                                    return (
                                        <div
                                            key={`${place.groupName}-${place.id}`}
                                            className={`group bg-white rounded-2xl border overflow-hidden transition-all flex flex-col justify-between ${isSelected
                                                    ? 'border-[#006971] ring-2 ring-[#006971]/20 shadow-md'
                                                    : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                                                }`}
                                        >
                                            {/* Phần trên: Ảnh & Badges */}
                                            <div>
                                                <div className="relative h-44 w-full bg-gray-100 overflow-hidden">
                                                    <img
                                                        src={thumbnail}
                                                        alt={place.name}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                        loading="lazy"
                                                    />

                                                    {/* Nhãn nhóm sở thích */}
                                                    <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full text-2xs font-semibold bg-black/60 text-white backdrop-blur-md">
                                                        {place.groupName}
                                                    </span>

                                                    {/* Match score (nếu có từ semantic embedding) */}
                                                    {matchPercent !== null && (
                                                        <span
                                                            className={`absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-2xs font-bold shadow-xs backdrop-blur-md ${matchPercent >= 70
                                                                    ? 'bg-emerald-600 text-white'
                                                                    : matchPercent >= 50
                                                                        ? 'bg-teal-600 text-white'
                                                                        : 'bg-gray-800 text-white'
                                                                }`}
                                                        >
                                                            Phù hợp {matchPercent}%
                                                        </span>
                                                    )}

                                                    {/* Khu vực */}
                                                    {place.region && (
                                                        <span className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-md text-2xs font-medium bg-white/90 text-gray-700 backdrop-blur-md flex items-center gap-1">
                                                            <MapPin size={10} className="text-[#006971]" />
                                                            {place.region}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Phần thân thông tin */}
                                                <div className="p-4 space-y-2.5">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <h4 className="font-bold text-gray-900 text-sm leading-snug line-clamp-1 group-hover:text-[#006971] transition-colors">
                                                            {place.name}
                                                        </h4>
                                                        <div className="flex items-center gap-1 text-amber-500 font-bold text-xs shrink-0">
                                                            <Star size={12} className="fill-amber-400 text-amber-400" />
                                                            <span>{place.rating ? Number(place.rating).toFixed(1) : '4.5'}</span>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-2 text-2xs text-gray-600 pt-1 border-t border-gray-100">
                                                        <div className="flex items-center gap-1.5">
                                                            <Coins size={12} className="text-amber-600 shrink-0" />
                                                            <span>
                                                                {place.cost_per_person
                                                                    ? `${Number(place.cost_per_person).toLocaleString('vi-VN')} đ`
                                                                    : 'Miễn phí'}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5">
                                                            <Clock size={12} className="text-sky-600 shrink-0" />
                                                            <span>{place.duration_hours || 1.5} giờ</span>
                                                        </div>
                                                    </div>

                                                    {place.category && (
                                                        <div className="text-2xs text-gray-500 bg-gray-50 px-2 py-1 rounded-md line-clamp-1">
                                                            Phân loại: <span className="font-medium text-gray-700">{place.category}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Phần dưới: Nút tương tác */}
                                            <div className="p-4 pt-0 flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => toggleSelectPlace(place)}
                                                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${isSelected
                                                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                            : 'bg-[#006971]/10 text-[#006971] hover:bg-[#006971] hover:text-white'
                                                        }`}
                                                >
                                                    {isSelected ? (
                                                        <>
                                                            <Check size={14} className="stroke-[3]" />
                                                            Đã chọn
                                                        </>
                                                    ) : (
                                                        'Chọn địa điểm'
                                                    )}
                                                </button>

                                                <Link
                                                    href={`/explore/place/${place.id}`}
                                                    className="p-2 rounded-xl border border-gray-200 hover:border-[#006971] hover:text-[#006971] text-gray-500 transition-colors"
                                                    title="Xem chi tiết"
                                                >
                                                    <ArrowRight size={14} />
                                                </Link>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </main>
                </div>
            </div>

            {/* ================= THANH CỐ ĐỊNH PHÍA DƯỚI KHI ĐÃ CHỌN ĐỊA ĐIỂM ================= */}
            {selectedPlaces.length > 0 && (
                <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-11/12 max-w-4xl bg-gray-900/95 text-white backdrop-blur-md rounded-2xl p-4 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-3 border border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold text-sm shrink-0">
                            {selectedPlaces.length}
                        </div>
                        <div>
                            <div className="text-sm font-bold">Địa điểm đã chọn</div>
                            <div className="text-xs text-gray-300 line-clamp-1 max-w-md">
                                {selectedPlaces.map((p) => p.name).join(', ')}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button
                            type="button"
                            onClick={() => setSelectedPlaces([])}
                            className="px-3 py-2 text-xs text-gray-400 hover:text-white transition-colors cursor-pointer"
                        >
                            Xóa hết
                        </button>
                        <Link
                            href={{
                                pathname: '/explore',
                                query: { selected: selectedPlaces.map((p) => p.id).join(',') },
                            }}
                            className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-[#006971] hover:bg-[#00828c] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm"
                        >
                            <span>Xem trên bản đồ</span>
                            <ArrowRight size={14} />
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
