'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import {
    Sparkles,
    MapPin,
    Calendar,
    Coins,
    SlidersHorizontal,
    Plus,
    X,
    Hotel,
    Loader2,
    AlertCircle,
    RotateCcw,
    Map as MapIcon,
    ListFilter,
    Compass,
    Check,
    ChevronDown,
    Utensils,
    Users,
} from 'lucide-react';

import SelectPlacesModal from '@/components/comon/ai-plan/SelectPlacesModal';
import SelectLodgingModal from '@/components/comon/ai-plan/SelectLodgingModal';
import PlanResultView from '@/components/comon/ai-plan/PlanResultView';

// Tải bản đồ Leaflet động (tránh lỗi SSR trong Next.js)
const AiPlanMap = dynamic(
    () => import('@/components/comon/ai-plan/AiPlanMap'),
    {
        ssr: false,
        loading: () => (
            <div className="w-full h-full min-h-[550px] flex flex-col items-center justify-center bg-slate-100 rounded-2xl border border-gray-200 text-gray-500 space-y-2">
                <Loader2 size={30} className="animate-spin text-[#006971]" />
                <span className="text-xs font-medium">Đang tải bản đồ tương tác...</span>
            </div>
        ),
    }
);

const AI_API_URL = process.env.NEXT_PUBLIC_AI_API_URL || 'http://localhost:8000';

// Các phong cách du lịch tương ứng với model AI
const STYLE_OPTIONS = [
    { id: 'Văn hóa & lịch sử', label: 'Đậm văn hóa & Bản địa', icon: '🏛️' },
    { id: 'Biển & đảo', label: 'Nghỉ dưỡng biển & Đảo', icon: '🌊' },
    { id: 'Ẩm thực', label: 'Khám phá ẩm thực địa phương', icon: '🍜' },
    { id: 'Thiên nhiên & khám phá', label: 'Thiên nhiên sinh thái & Suối thác', icon: '🌲' },
    { id: 'Vui chơi & check-in', label: 'Vui chơi giải trí & Check-in', icon: '🎡' },
];

// Danh sách khu vực
const REGION_OPTIONS = [
    { value: '', label: 'Tất cả khu vực (AI tự cân đối cung đường)' },
    { value: 'Đà Nẵng nội thành', label: 'Đà Nẵng nội thành (Sơn Trà, Hải Châu, Ngũ Hành Sơn)' },
    { value: 'Hội An - Điện Bàn', label: 'Hội An - Điện Bàn (Phố Cổ, Biển An Bàng)' },
    { value: 'Hòa Vang - Bà Nà', label: 'Hòa Vang - Bà Nà (Bà Nà Hills, Núi Thần Tài)' },
    { value: 'Cù Lao Chàm', label: 'Cù Lao Chàm (Lặn biển & Khám phá đảo)' },
    { value: 'Duy Xuyên - Mỹ Sơn', label: 'Duy Xuyên - Mỹ Sơn (Thánh địa Mỹ Sơn)' },
    { value: 'Nam Quảng Nam', label: 'Nam Quảng Nam (Tam Kỳ, Làng Bích Họa)' },
];

// Phân khúc mức giá nơi lưu trú (tính theo giá cả phòng / đêm)
const LODGING_PRICE_TIERS = [
    { id: 'low', label: 'Thấp', sub: '< 500k/đêm', desc: 'Homestay, khách sạn bình dân (~25-32% ngân sách)' },
    { id: 'mid', label: 'Trung bình', sub: '500k - 1.3tr', desc: 'Khách sạn 3-4 sao, boutique (~35-45% ngân sách)' },
    { id: 'high', label: 'Cao', sub: '> 1.3tr/đêm', desc: 'Resort, khách sạn 5 sao, villa (~50-60% ngân sách)' },
];

export default function AiPlanPage() {
    // 1. FORM STATES (Theo giao diện người dùng yêu cầu)
    const [destination, setDestination] = useState('Đà Nẵng');

    // Ngày bắt đầu & kết thúc (Mặc định hôm nay -> 2 ngày sau = 3 ngày 2 đêm)
    const todayStr = new Date().toISOString().split('T')[0];
    const defaultEndStr = (() => {
        const d = new Date();
        d.setDate(d.getDate() + 2);
        return d.toISOString().split('T')[0];
    })();

    const [startDate, setStartDate] = useState(todayStr);
    const [endDate, setEndDate] = useState(defaultEndStr);
    const [numDays, setNumDays] = useState(3);

    // Tính toán số ngày và đêm
    useEffect(() => {
        if (!startDate || !endDate) return;
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.max(0, end - start);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
        setNumDays(Math.min(Math.max(1, diffDays), 7));
    }, [startDate, endDate]);

    // Ngân sách mỗi người
    const [budget, setBudget] = useState(4200000);

    // Phong cách / Sở thích đã chọn
    const [selectedInterests, setSelectedInterests] = useState(['Văn hóa & lịch sử']);

    // Dropdown mở/đóng cho Cảm xúc phong cách & Khu vực trọng tâm
    const [isStyleDropdownOpen, setIsStyleDropdownOpen] = useState(false);
    const [isRegionDropdownOpen, setIsRegionDropdownOpen] = useState(false);
    // Khu vực trọng tâm (mảng cho phép chọn nhiều khu vực, rỗng = Tất cả khu vực)
    const [selectedRegions, setSelectedRegions] = useState([]);

    // Địa điểm người dùng chọn trước
    const [selectedPlaces, setSelectedPlaces] = useState([]);
    const [isPlacesModalOpen, setIsPlacesModalOpen] = useState(false);

    // Nơi ở người dùng chọn trước
    const [selectedLodgings, setSelectedLodgings] = useState([]);
    const [isLodgingModalOpen, setIsLodgingModalOpen] = useState(false);

    // Tùy chọn dịch vụ ăn uống & nơi lưu trú & số địa điểm/ngày
    const [includeMeals, setIncludeMeals] = useState(true);
    const [includeLodging, setIncludeLodging] = useState(true);
    const [guestsPerRoom, setGuestsPerRoom] = useState(2); // 1 = Đi 1 mình / phòng đơn, 2 = 2 người/phòng, v.v.
    const [lodgingPriceTier, setLodgingPriceTier] = useState('mid'); // 'low' | 'mid' | 'high'
    const [placesPerDay, setPlacesPerDay] = useState(3); // 2 hoặc 3 địa điểm tham quan mỗi ngày

    // 2. KẾT QUẢ VÀ TRẠNG THÁI LẬP LỊCH
    const [loadingPlan, setLoadingPlan] = useState(false);
    const [error, setError] = useState(null);
    const [plan, setPlan] = useState(null);

    // Chế độ xem cột phải trên màn hình nhỏ: Bản đồ hoặc Chi tiết lịch
    const [mobileRightView, setMobileRightView] = useState('map'); // 'map' | 'timeline'

    // Toggle nhóm sở thích
    const toggleInterest = (id) => {
        setSelectedInterests((prev) => {
            const isCurrentlySelected = prev.includes(id);
            if (isCurrentlySelected) {
                return prev.length > 1 ? prev.filter((i) => i !== id) : prev;
            } else {
                // Nếu người dùng chọn "Khám phá ẩm thực địa phương", tự động tick bật dịch vụ ăn uống
                if (id === 'Ẩm thực') {
                    setIncludeMeals(true);
                }
                return [...prev, id];
            }
        });
    };

    // Khi người dùng tắt "Dịch vụ ăn uống", nếu đang chọn "Khám phá ẩm thực địa phương" thì thông báo hoặc nhắc nhở
    const handleToggleIncludeMeals = (checked) => {
        if (!checked && selectedInterests.includes('Ẩm thực')) {
            // Tự động bỏ chọn hoặc cảnh báo nhẹ
            setSelectedInterests((prev) => prev.length > 1 ? prev.filter((i) => i !== 'Ẩm thực') : ['Văn hóa & lịch sử']);
        }
        setIncludeMeals(checked);
    };

    // Toggle chọn một hoặc nhiều khu vực
    const toggleRegion = (val) => {
        if (!val) {
            // Chọn "Tất cả khu vực" -> xóa lọc riêng lẻ
            setSelectedRegions([]);
            return;
        }
        setSelectedRegions((prev) =>
            prev.includes(val) ? prev.filter((r) => r !== val) : [...prev, val]
        );
    };

    // Đặt lại form về mặc định
    const handleResetAll = () => {
        setStartDate(todayStr);
        setEndDate(defaultEndStr);
        setBudget(4200000);
        setSelectedInterests(['Văn hóa & lịch sử']);
        setSelectedRegions([]);
        setSelectedPlaces([]);
        setSelectedLodgings([]);
        setIncludeMeals(true);
        setIncludeLodging(true);
        setLodgingPriceTier('mid');
        setPlacesPerDay(3);
        setPlan(null);
        setError(null);
    };

    // Gọi AI Service lập lịch trình
    const handleGeneratePlan = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        setLoadingPlan(true);
        setError(null);

        try {
            const nights = Math.max(0, numDays - 1);
            // Nếu người dùng chọn 1 nơi nghỉ, áp dụng nơi nghỉ đó cho tất cả các đêm của chuyến đi
            const lodgingIds = includeLodging && selectedLodgings.length > 0
                ? Array(nights).fill(selectedLodgings[0].id)
                : [];

            const payload = {
                num_days: numDays,
                budget_pp: budget,
                interests: selectedInterests,
                region: selectedRegions.length > 0 ? selectedRegions.join(',') : null,
                regions: selectedRegions,
                selected_ids: selectedPlaces.map((p) => p.id),
                lodging_ids: lodgingIds,
                include_meals: includeMeals,
                include_lodging: includeLodging,
                guests_per_room: Number(guestsPerRoom) || 2,
                lodging_price_tier: lodgingPriceTier,
                places_per_day: Number(placesPerDay) || 3,
            };

            const res = await fetch(`${AI_API_URL}/plan`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                let msg = errData.detail || `Lỗi từ AI Planner (Mã lỗi ${res.status})`;
                if (Array.isArray(msg)) msg = msg.map((m) => m.msg || JSON.stringify(m)).join(', ');
                throw new Error(msg);
            }

            const data = await res.json();
            setPlan(data);
            setMobileRightView('timeline'); // Tự động mở tab timeline xem chi tiết khi tạo xong
        } catch (err) {
            console.error('Lỗi tạo lịch trình:', err);
            setError(
                err.message.includes('Failed to fetch')
                    ? 'Không thể kết nối tới AI Service (cổng 8000). Vui lòng đảm bảo server AI đang chạy.'
                    : err.message
            );
        } finally {
            setLoadingPlan(false);
        }
    };

    const nightsCount = Math.max(0, numDays - 1);

    return (
        <div className="w-full min-h-[calc(100vh-70px)] bg-[#f4f7f8] flex flex-col">
            {/* GIAO DIỆN CHÍNH: 2 CỘT FULL SCREEN VIEW NHƯ ẢNH MẪU */}
            <div className="flex-1 w-full max-w-[1700px] mx-auto p-3 sm:p-5 flex flex-col lg:flex-row gap-5 items-stretch">
                {/* ================= CỘT TRÁI: PANEL ĐIỀU KHIỂN AI PLAN (SCROLLABLE) ================= */}
                <aside className="w-full lg:w-[440px] xl:w-[470px] shrink-0 bg-white rounded-3xl shadow-sm border border-gray-200/80 p-5 sm:p-6 flex flex-col justify-between space-y-5 overflow-y-auto max-h-[calc(100vh-100px)] lg:sticky lg:top-20">
                    <div className="space-y-5">
                        {/* 1. SLOGAN BANNER DU LỊCH ĐÀ NẴNG */}
                        <div className="px-4 py-3.5 rounded-2xl bg-gradient-to-br from-[#004e54] via-[#006971] to-[#00897b] text-white shadow-sm relative overflow-hidden flex items-center justify-center text-center">
                            <h2 className="text-sm font-black text-white leading-snug tracking-wide">
                                Đà Nẵng - Thành Phố Đáng Sống, Điểm Đến Diệu Kỳ
                            </h2>
                        </div>

                        {/* 2. THỜI GIAN CHUYẾN ĐI */}
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="block text-2xs font-extrabold uppercase tracking-wider text-gray-400">
                                    Thời Gian Chuyến Đi
                                </label>
                            </div>

                            <div className="flex items-center gap-2">
                                <div className="flex-1 relative flex items-center">
                                    <input
                                        type="date"
                                        value={startDate}
                                        min={todayStr}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="w-full px-3 py-2 bg-gray-50/60 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#006971]/30"
                                    />
                                </div>
                                <span className="text-gray-400 font-bold text-xs">-</span>
                                <div className="flex-1 relative flex items-center">
                                    <input
                                        type="date"
                                        value={endDate}
                                        min={startDate || todayStr}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="w-full px-3 py-2 bg-gray-50/60 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#006971]/30"
                                    />
                                </div>

                                {/* Badge ngày đêm */}
                                <div className="px-3 py-2 bg-teal-50 border border-teal-200 rounded-xl text-xs font-extrabold text-[#006971] whitespace-nowrap shrink-0">
                                    {numDays} Ngày {nightsCount > 0 ? `${nightsCount} Đêm` : ''}
                                </div>
                            </div>

                            {/* Chọn số địa điểm du lịch mỗi ngày: 2 hoặc 3 địa điểm/ngày */}
                            <div className="mt-2.5 p-2.5 bg-teal-50/40 rounded-xl border border-teal-100 space-y-1.5">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="font-bold text-gray-800 flex items-center gap-1.5">
                                        <Compass size={13} className="text-[#006971]" />
                                        <span>Số điểm tham quan / ngày:</span>
                                    </span>
                                    <span className="text-2xs font-semibold text-[#006971]">
                                        {placesPerDay === 2 ? 'Thong thả, chuyên sâu' : 'Khám phá nhiều điểm'}
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    {[
                                        { count: 2, title: '2 địa điểm / ngày', desc: 'Thong thả, dư dả thời gian' },
                                        { count: 3, title: '3 địa điểm / ngày', desc: 'Đi nhiều điểm (Sáng - Chiều - Tối)' },
                                    ].map((opt) => {
                                        const active = placesPerDay === opt.count;
                                        return (
                                            <button
                                                key={opt.count}
                                                type="button"
                                                onClick={() => setPlacesPerDay(opt.count)}
                                                className={`py-2 px-2.5 rounded-xl border text-left transition-all cursor-pointer ${active
                                                    ? 'bg-[#006971] border-[#006971] text-white shadow-2xs'
                                                    : 'bg-white border-teal-200/80 text-gray-700 hover:border-[#006971]/60 hover:bg-teal-50/40'
                                                    }`}
                                            >
                                                <div className="text-xs font-extrabold leading-tight">
                                                    {opt.title}
                                                </div>
                                                <div className={`text-3xs font-medium mt-0.5 ${active ? 'text-teal-100' : 'text-gray-400'}`}>
                                                    {opt.desc}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* 3. NGÂN SÁCH (BUDGET) */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-2xs font-extrabold uppercase tracking-wider text-gray-400">
                                    Ngân Sách (Budget)
                                </label>
                                <span className="text-xs font-extrabold text-[#006971]">
                                    Ước tính: {budget.toLocaleString('vi-VN')} VND
                                </span>
                            </div>

                            {/* Slider kéo ngân sách */}
                            <input
                                type="range"
                                min="1000000"
                                max="15000000"
                                step="200000"
                                value={budget}
                                onChange={(e) => {
                                    const val = Number(e.target.value);
                                    setBudget(val);
                                    if (val <= 2500000) setLodgingPriceTier('low');
                                    else if (val <= 5000000) setLodgingPriceTier('mid');
                                    else setLodgingPriceTier('high');
                                }}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#006971]"
                            />

                            {/* 3 mốc ngân sách */}
                            <div className="flex justify-between text-2xs text-gray-400 font-semibold mt-1.5">
                                <span
                                    className={`cursor-pointer ${budget <= 2500000 ? 'text-[#006971] font-bold' : ''}`}
                                    onClick={() => {
                                        setBudget(2000000);
                                        setLodgingPriceTier('low');
                                    }}
                                >
                                    Tiết kiệm
                                </span>
                                <span
                                    className={`cursor-pointer ${budget > 2500000 && budget <= 5000000 ? 'text-[#006971] font-bold' : ''}`}
                                    onClick={() => {
                                        setBudget(4200000);
                                        setLodgingPriceTier('mid');
                                    }}
                                >
                                    Tiêu chuẩn
                                </span>
                                <span
                                    className={`cursor-pointer ${budget > 5000000 ? 'text-[#006971] font-bold' : ''}`}
                                    onClick={() => {
                                        setBudget(9000000);
                                        setLodgingPriceTier('high');
                                    }}
                                >
                                    Cao cấp
                                </span>
                            </div>
                        </div>

                        {/* 4. CẢM XÚC & PHONG CÁCH / SỞ THÍCH (DROPDOWN XỔ XUỐNG) */}
                        <div className="relative">
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="block text-2xs font-extrabold uppercase tracking-wider text-gray-400">
                                    Cảm Xúc & Phong Cách
                                </label>
                                <span className="text-2xs font-bold text-[#006971]">
                                    Đã chọn ({selectedInterests.length})
                                </span>
                            </div>

                            {/* Nút trigger dropdown */}
                            <button
                                type="button"
                                onClick={() => setIsStyleDropdownOpen((prev) => !prev)}
                                className={`w-full p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all cursor-pointer bg-gray-50/60 ${
                                    isStyleDropdownOpen
                                        ? 'border-[#006971] ring-2 ring-[#006971]/20 bg-white'
                                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                                }`}
                            >
                                <div className="flex items-center gap-1.5 overflow-hidden pr-2">
                                    <span className="shrink-0 text-sm">🎨</span>
                                    <span className="truncate text-xs font-bold text-gray-800">
                                        {selectedInterests.length === 0
                                            ? 'Chọn phong cách du lịch...'
                                            : selectedInterests.join(', ')}
                                    </span>
                                </div>
                                <ChevronDown
                                    size={16}
                                    className={`text-gray-400 shrink-0 transition-transform duration-200 ${
                                        isStyleDropdownOpen ? 'rotate-180 text-[#006971]' : ''
                                    }`}
                                />
                            </button>

                            {/* Danh sách xổ xuống */}
                            {isStyleDropdownOpen && (
                                <div className="mt-2 p-2 bg-white rounded-2xl border border-gray-200 shadow-lg space-y-1 z-20 relative animate-in fade-in duration-150">
                                    {STYLE_OPTIONS.map((style) => {
                                        const isSelected = selectedInterests.includes(style.id);
                                        return (
                                            <button
                                                key={style.id}
                                                type="button"
                                                onClick={() => toggleInterest(style.id)}
                                                className={`w-full px-3 py-2 rounded-xl border text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                                                    isSelected
                                                        ? 'border-[#006971] bg-teal-50/70 text-[#006971]'
                                                        : 'border-transparent hover:bg-gray-50 text-gray-700'
                                                }`}
                                            >
                                                <span className="flex items-center gap-2">
                                                    <span>{style.icon}</span>
                                                    <span>{style.label}</span>
                                                </span>
                                                <span
                                                    className={`w-4 h-4 rounded-md flex items-center justify-center text-white ${
                                                        isSelected ? 'bg-[#006971]' : 'border border-gray-300'
                                                    }`}
                                                >
                                                    {isSelected && <Check size={11} strokeWidth={3} />}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* 5. KHU VỰC TRỌNG TÂM (DROPDOWN XỔ XUỐNG) */}
                        <div className="relative">
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="block text-2xs font-extrabold uppercase tracking-wider text-gray-400">
                                    Khu Vực Trọng Tâm
                                </label>
                                {selectedRegions.length > 0 ? (
                                    <button
                                        type="button"
                                        onClick={() => setSelectedRegions([])}
                                        className="text-2xs font-bold text-[#006971] hover:underline cursor-pointer"
                                    >
                                        Chọn tất cả
                                    </button>
                                ) : (
                                    <span className="text-2xs font-semibold text-gray-400">Tất cả khu vực</span>
                                )}
                            </div>

                            {/* Nút trigger dropdown */}
                            <button
                                type="button"
                                onClick={() => setIsRegionDropdownOpen((prev) => !prev)}
                                className={`w-full p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all cursor-pointer bg-gray-50/60 ${
                                    isRegionDropdownOpen
                                        ? 'border-[#006971] ring-2 ring-[#006971]/20 bg-white'
                                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                                }`}
                            >
                                <div className="flex items-center gap-1.5 overflow-hidden pr-2">
                                    <MapPin size={14} className="text-[#006971] shrink-0" />
                                    <span className="truncate text-xs font-bold text-gray-800">
                                        {selectedRegions.length === 0
                                            ? 'Tất cả khu vực (AI tự cân đối)'
                                            : selectedRegions.join(', ')}
                                    </span>
                                </div>
                                <ChevronDown
                                    size={16}
                                    className={`text-gray-400 shrink-0 transition-transform duration-200 ${
                                        isRegionDropdownOpen ? 'rotate-180 text-[#006971]' : ''
                                    }`}
                                />
                            </button>

                            {/* Danh sách xổ xuống */}
                            {isRegionDropdownOpen && (
                                <div className="mt-2 p-2 bg-white rounded-2xl border border-gray-200 shadow-lg space-y-1 z-20 relative max-h-60 overflow-y-auto no-scrollbar animate-in fade-in duration-150">
                                    {REGION_OPTIONS.map((opt) => {
                                        const isAll = opt.value === '';
                                        const isSelected = isAll
                                            ? selectedRegions.length === 0
                                            : selectedRegions.includes(opt.value);
                                        return (
                                            <button
                                                key={opt.value || 'ALL'}
                                                type="button"
                                                onClick={() => toggleRegion(opt.value)}
                                                className={`w-full px-3 py-2 rounded-xl border text-xs font-bold flex items-center justify-between transition-all cursor-pointer text-left ${
                                                    isSelected
                                                        ? 'border-[#006971] bg-teal-50/70 text-[#006971]'
                                                        : 'border-transparent hover:bg-gray-50 text-gray-700'
                                                }`}
                                            >
                                                <span className="flex items-center gap-2 pr-2">
                                                    <span className="leading-snug">{opt.label}</span>
                                                </span>
                                                <span
                                                    className={`w-4 h-4 rounded-md shrink-0 flex items-center justify-center text-white ${
                                                        isSelected ? 'bg-[#006971]' : 'border border-gray-300'
                                                    }`}
                                                >
                                                    {isSelected && <Check size={11} strokeWidth={3} />}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* 6. ĐỊA ĐIỂM NGƯỜI DÙNG CHỌN THÊM */}
                        <div className="pt-2 border-t border-gray-100">
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-2xs font-extrabold uppercase tracking-wider text-gray-400">
                                    Điểm Tham Quan Mong Muốn ({selectedPlaces.length})
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setIsPlacesModalOpen(true)}
                                    className="text-xs font-bold text-[#006971] hover:underline flex items-center gap-1 cursor-pointer"
                                >
                                    <Plus size={13} /> Chọn thêm
                                </button>
                            </div>

                            {selectedPlaces.length === 0 ? (
                                <div
                                    onClick={() => setIsPlacesModalOpen(true)}
                                    className="p-3 border border-dashed border-gray-300 rounded-xl text-center text-xs text-gray-400 hover:border-[#006971] hover:text-[#006971] hover:bg-teal-50/30 transition-all cursor-pointer"
                                >
                                    Chưa chọn điểm nào. Click để chọn địa điểm yêu thích!
                                </div>
                            ) : (
                                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto no-scrollbar">
                                    {selectedPlaces.map((p) => (
                                        <span
                                            key={p.id}
                                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-2xs font-semibold bg-teal-50 border border-teal-200 text-[#006971]"
                                        >
                                            <span className="truncate max-w-[130px]">{p.name}</span>
                                            <button
                                                type="button"
                                                onClick={() => setSelectedPlaces(selectedPlaces.filter((item) => item.id !== p.id))}
                                                className="hover:text-red-500 cursor-pointer"
                                            >
                                                <X size={11} />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* 7. NƠI Ở / KHÁCH SẠN */}
                        <div className="pt-2 border-t border-gray-100 space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-2xs font-extrabold uppercase tracking-wider text-gray-400">
                                    Nơi Lưu Trú Mong Muốn
                                </label>
                                {includeLodging && (
                                    <button
                                        type="button"
                                        onClick={() => setIsLodgingModalOpen(true)}
                                        className="text-xs font-bold text-purple-700 hover:underline flex items-center gap-1 cursor-pointer"
                                    >
                                        <Plus size={13} /> {selectedLodgings.length > 0 ? 'Đổi nơi ở' : 'Chọn nơi ở'}
                                    </button>
                                )}
                            </div>

                            {/* Checkbox bật/tắt nơi lưu trú */}
                            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-700 select-none">
                                <input
                                    type="checkbox"
                                    checked={includeLodging}
                                    onChange={(e) => setIncludeLodging(e.target.checked)}
                                    className="w-4 h-4 rounded text-[#006971] focus:ring-[#006971] accent-[#006971] cursor-pointer"
                                />
                                <span>Bao gồm nơi lưu trú trong lịch trình & ngân sách</span>
                            </label>

                            {includeLodging ? (
                                <>
                                    {/* Chọn mức độ giá tiền nơi lưu trú: Thấp / Trung bình / Cao */}
                                    <div className="p-2.5 bg-purple-50/50 rounded-xl border border-purple-100 space-y-2">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="font-bold text-gray-800 flex items-center gap-1.5">
                                                <Coins size={13} className="text-purple-600" />
                                                <span>Mức giá phòng:</span>
                                            </span>
                                            <span className="text-2xs font-semibold text-purple-700">
                                                {LODGING_PRICE_TIERS.find((t) => t.id === lodgingPriceTier)?.desc}
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-3 gap-1.5">
                                            {LODGING_PRICE_TIERS.map((tier) => {
                                                const active = lodgingPriceTier === tier.id;
                                                return (
                                                    <button
                                                        key={tier.id}
                                                        type="button"
                                                        onClick={() => setLodgingPriceTier(tier.id)}
                                                        className={`py-2 px-2 rounded-xl border text-center transition-all cursor-pointer ${active
                                                            ? 'bg-purple-600 border-purple-600 text-white shadow-2xs'
                                                            : 'bg-white border-purple-200/80 text-gray-700 hover:border-purple-400 hover:bg-purple-50/50'
                                                            }`}
                                                    >
                                                        <div className="text-xs font-extrabold leading-tight">
                                                            {tier.label}
                                                        </div>
                                                        <div
                                                            className={`text-3xs font-medium mt-0.5 ${active ? 'text-purple-100' : 'text-gray-400'
                                                                }`}
                                                        >
                                                            {tier.sub}
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Tuỳ chọn số người / phòng để tính chi phí và chọn loại phòng phù hợp */}
                                    <div className="flex items-center justify-between p-2.5 bg-purple-50/60 rounded-xl border border-purple-100 text-xs">
                                        <div className="space-y-0.5">
                                            <div className="font-bold text-gray-800 flex items-center gap-1.5">
                                                <Users size={13} className="text-purple-600" />
                                                <span>Hình thức lưu trú:</span>
                                            </div>
                                            <div className="text-2xs text-gray-500">
                                                {guestsPerRoom === 1 ? 'Đi 1 mình (bao phòng đơn, không xếp villa lớn)' : `Chia sẻ phòng (${guestsPerRoom} người/phòng)`}
                                            </div>
                                        </div>
                                        <select
                                            value={guestsPerRoom}
                                            onChange={(e) => setGuestsPerRoom(Number(e.target.value))}
                                            className="px-2.5 py-1.5 bg-white border border-purple-200 rounded-lg text-xs font-bold text-purple-900 focus:outline-none focus:ring-2 focus:ring-purple-400 cursor-pointer"
                                        >
                                            <option value={1}>1 người (Phòng riêng/Đơn)</option>
                                            <option value={2}>2 người / phòng (Cặp đôi/Bạn bè)</option>
                                            <option value={3}>3 người / phòng</option>
                                            <option value={4}>4 người / phòng (Gia đình/Nhóm)</option>
                                        </select>
                                    </div>

                                    {selectedLodgings.length === 0 ? (
                                        <div
                                            onClick={() => setIsLodgingModalOpen(true)}
                                            className="p-3 border border-dashed border-purple-200 rounded-xl text-center text-xs text-purple-600/80 bg-purple-50/30 hover:border-purple-400 hover:bg-purple-50 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                                        >
                                            <Hotel size={13} />
                                            <span>Để AI tự động tối ưu hoặc click chọn nơi ở</span>
                                        </div>
                                    ) : (
                                        <div className="p-2.5 rounded-xl border border-purple-200 bg-purple-50/50 flex items-center justify-between text-xs">
                                            <div className="flex items-center gap-2 truncate">
                                                <Hotel size={14} className="text-purple-600 shrink-0" />
                                                <span className="font-bold text-purple-900 truncate">
                                                    {selectedLodgings[0].name}
                                                </span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setSelectedLodgings([])}
                                                className="text-purple-500 hover:text-red-600 shrink-0"
                                            >
                                                <X size={13} />
                                            </button>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-2xs text-gray-500 flex items-center gap-1.5">
                                    <Hotel size={13} className="text-gray-400 shrink-0" />
                                    <span>Tự túc nơi ở: Lịch trình sẽ không tính chi phí phòng nghỉ vào ngân sách (0đ).</span>
                                </div>
                            )}
                        </div>

                        {/* 8. DỊCH VỤ ĂN UỐNG (BỮA SÁNG, TRƯA, TỐI) */}
                        <div className="pt-2 border-t border-gray-100 space-y-2">
                            <label className="text-2xs font-extrabold uppercase tracking-wider text-gray-400 block">
                                Dịch Vụ Ăn Uống (Sáng, Trưa, Tối)
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-700 select-none">
                                <input
                                    type="checkbox"
                                    checked={includeMeals}
                                    onChange={(e) => handleToggleIncludeMeals(e.target.checked)}
                                    className="w-4 h-4 rounded text-[#006971] focus:ring-[#006971] accent-[#006971] cursor-pointer"
                                />
                                <span>AI gợi ý và xếp các quán ăn / cà phê vào các bữa</span>
                            </label>
                            {!includeMeals ? (
                                <div className="p-2.5 bg-amber-50/70 border border-amber-200/80 rounded-xl text-2xs text-amber-800 flex items-center gap-1.5">
                                    <Utensils size={13} className="text-amber-600 shrink-0" />
                                    <span>Tự túc ăn uống: Lịch trình vẫn giữ khung giờ ăn nhưng không gắn quán và không tính chi phí (0đ).</span>
                                </div>
                            ) : (
                                <div className="text-2xs text-gray-400 pl-6">
                                    Gợi ý quán ăn sáng, trưa, tối & cà phê đặc trưng theo vùng. Chi phí ăn uống tùy theo món, không tính vào ngân sách.
                                </div>
                            )}
                        </div>

                        {/* THÔNG BÁO LỖI (NẾU CÓ) */}
                        {error && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
                                <AlertCircle size={15} className="text-red-500 shrink-0 mt-0.5" />
                                <div>{error}</div>
                            </div>
                        )}

                        {/* 8. NÚT TẠO LỊCH TRÌNH AI (BUTTON TO CHÍNH) */}
                        <div className="pt-2">
                            <button
                                type="button"
                                onClick={handleGeneratePlan}
                                disabled={loadingPlan}
                                className="w-full py-3.5 px-6 rounded-2xl bg-[#004e54] hover:bg-[#003c40] active:scale-[0.98] text-white font-extrabold text-sm tracking-wide shadow-md transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {loadingPlan ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin text-amber-300" />
                                        <span>AI Đang Tối Ưu Lịch Trình...</span>
                                    </>
                                ) : (
                                    <>
                                        <Sparkles size={18} className="text-amber-400 fill-amber-400" />
                                        <span>TẠO LỊCH TRÌNH AI</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* 9. BANNER MASCOT DƯỚI PANEL */}
                    <div className="pt-4 border-t border-gray-100 flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-amber-100/80 border border-amber-300 flex items-center justify-center text-xl shadow-2xs shrink-0">
                            🧭
                        </div>
                        <div className="space-y-0.5 min-w-0">
                            <div className="text-xs font-black text-gray-900 truncate">
                                Khám phá Đà Nẵng cùng AI Plan
                            </div>
                            <div className="text-2xs text-gray-500 leading-tight">
                                Tự động sắp xếp cung đường, tính toán chi phí & đồng bộ checklist hành lý.
                            </div>
                        </div>
                    </div>
                </aside>

                {/* ================= CỘT PHẢI: BẢN ĐỒ INTERACTIVE & KẾT QUẢ LỊCH TRÌNH ================= */}
                <main className="flex-1 min-w-0 flex flex-col space-y-4">
                    {/* Thanh công cụ chuyển đổi trên mobile / tablet */}
                    <div className="flex items-center justify-between bg-white px-4 py-2.5 rounded-2xl border border-gray-200/80 shadow-2xs">
                        <div className="flex items-center gap-2">
                            <span className="font-extrabold text-gray-900 text-sm flex items-center gap-1.5">
                                <Compass size={17} className="text-[#006971]" />
                                {plan ? `Lịch Trình AI (${numDays} Ngày)` : 'Bản Đồ Điểm Đến & Nơi Lưu Trú'}
                            </span>
                        </div>

                        {/* Nút chuyển đổi view */}
                        <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-xl">
                            <button
                                type="button"
                                onClick={() => setMobileRightView('map')}
                                className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${mobileRightView === 'map'
                                    ? 'bg-white text-[#006971] shadow-2xs'
                                    : 'text-gray-500 hover:text-gray-800'
                                    }`}
                            >
                                <MapIcon size={13} />
                                <span>Bản đồ</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setMobileRightView('timeline')}
                                disabled={!plan}
                                className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${mobileRightView === 'timeline'
                                    ? 'bg-white text-[#006971] shadow-2xs'
                                    : 'text-gray-500 hover:text-gray-800'
                                    }`}
                            >
                                <ListFilter size={13} />
                                <span>Lịch trình chi tiết</span>
                            </button>
                        </div>
                    </div>

                    {/* VÙNG NỘI DUNG CHÍNH CỘT PHẢI */}
                    <div className="flex-1 min-h-[550px] relative">
                        {mobileRightView === 'map' ? (
                            <AiPlanMap
                                plan={plan}
                                selectedPlaces={selectedPlaces}
                                selectedLodgings={selectedLodgings}
                            />
                        ) : (
                            <div className="bg-white rounded-3xl p-5 border border-gray-200/80 shadow-sm max-h-[calc(100vh-140px)] overflow-y-auto">
                                <PlanResultView
                                    plan={plan}
                                    startDateStr={startDate}
                                    endDateStr={endDate}
                                    onReset={() => setMobileRightView('map')}
                                    includeMeals={includeMeals}
                                    includeLodging={includeLodging}
                                />
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* MODALS */}
            <SelectPlacesModal
                isOpen={isPlacesModalOpen}
                onClose={() => setIsPlacesModalOpen(false)}
                selectedPlaces={selectedPlaces}
                onConfirmSelection={(places) => setSelectedPlaces(places)}
            />

            <SelectLodgingModal
                isOpen={isLodgingModalOpen}
                onClose={() => setIsLodgingModalOpen(false)}
                currentRegion={selectedRegions.join(',')}
                budgetPp={budget}
                selectedLodgings={selectedLodgings}
                onConfirmSelection={(lodgings) => setSelectedLodgings(lodgings)}
            />
        </div>
    );
}
