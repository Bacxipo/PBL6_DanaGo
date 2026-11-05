'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
    X,
    MapPin,
    Car,
    Coffee,
    Utensils,
    Sparkles,
    Clock,
    Search,
    Star,
    Coins,
    ExternalLink,
    ChevronLeft,
    ChevronRight,
    DollarSign,
} from 'lucide-react';
import Image from 'next/image';
import TimePicker24h from './TimePicker24h';

const CATEGORY_TABS = [
    { id: 'all', label: 'Tất cả' },
    { id: 'food', label: '🍜 Ẩm thực & Quán ngon' },
    { id: 'cafe', label: '☕ Cà phê & Trà' },
    { id: 'sightseeing', label: '🏖️ Thắng cảnh & Bãi biển' },
    { id: 'culture', label: '🏛️ Văn hóa & Lịch sử' },
    { id: 'entertainment', label: '🎡 Vui chơi giải trí' },
];

const VEHICLE_OPTIONS = [
    'Xe máy',
    'Taxi / Grab',
    'Ô tô riêng',
    'Đi bộ',
    'Xe buýt',
    'Tàu / Thuyền',
];

const ITEMS_PER_PAGE = 8;

export default function AddActivityModal({
    isOpen,
    onClose,
    onAddPlace,
    onAddCustomActivity,
    places = [],
    defaultTime = '08:00',
    activeDay = 1,
}) {
    // Tab chính: 'place' (Địa điểm tham quan & ăn uống), 'transit' (Di chuyển), 'rest' (Nghỉ ngơi), 'custom' (Khác)
    const [mainTab, setMainTab] = useState('place');

    // State cho tab Chọn Địa Điểm
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategoryTab, setSelectedCategoryTab] = useState('all');
    const [placeTime, setPlaceTime] = useState(defaultTime);
    const [currentPage, setCurrentPage] = useState(1);

    // State cho tab Hoạt động tùy chỉnh (Di chuyển / Nghỉ ngơi / Hoạt động khác)
    const [customType, setCustomType] = useState('transit');
    const [customTime, setCustomTime] = useState(defaultTime);
    const [customName, setCustomName] = useState('');
    const [duration, setDuration] = useState('30 phút');
    const [vehicle, setVehicle] = useState('Xe máy');
    const [location, setLocation] = useState('');
    const [note, setNote] = useState('');
    const [cost, setCost] = useState('');
    const [customError, setCustomError] = useState('');

    // Reset về trang 1 khi thay đổi từ khóa hoặc đổi danh mục
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, selectedCategoryTab]);

    // Khi mở modal, cập nhật lại defaultTime nếu có
    useEffect(() => {
        if (isOpen) {
            setPlaceTime(defaultTime);
            setCustomTime(defaultTime);
        }
    }, [isOpen, defaultTime]);

    // Lọc danh sách địa điểm theo từ khóa và danh mục
    const filteredPlaces = useMemo(() => {
        return places.filter((p) => {
            // Lọc theo từ khóa
            const q = searchQuery.toLowerCase().trim();
            const matchesQuery =
                !q ||
                p.name?.toLowerCase().includes(q) ||
                p.address?.toLowerCase().includes(q) ||
                p.category?.toLowerCase().includes(q) ||
                p.des?.toLowerCase().includes(q);

            if (!matchesQuery) return false;

            // Lọc theo danh mục
            if (selectedCategoryTab === 'all') return true;
            const cat = (p.category || '').toLowerCase();
            if (selectedCategoryTab === 'food') {
                return (
                    cat.includes('ẩm thực') ||
                    cat.includes('ăn uống') ||
                    cat.includes('nhà hàng') ||
                    cat.includes('chợ')
                );
            }
            if (selectedCategoryTab === 'cafe') {
                return (
                    cat.includes('cà phê') ||
                    cat.includes('tiệm trà') ||
                    cat.includes('coffee') ||
                    cat.includes('tea')
                );
            }
            if (selectedCategoryTab === 'sightseeing') {
                return (
                    cat.includes('bãi biển') ||
                    cat.includes('thắng cảnh') ||
                    cat.includes('suối') ||
                    cat.includes('thác') ||
                    cat.includes('đảo') ||
                    cat.includes('núi')
                );
            }
            if (selectedCategoryTab === 'culture') {
                return (
                    cat.includes('văn hóa') ||
                    cat.includes('lịch sử') ||
                    cat.includes('bảo tàng') ||
                    cat.includes('chùa') ||
                    cat.includes('tâm linh') ||
                    cat.includes('phố cổ') ||
                    cat.includes('làng nghề')
                );
            }
            if (selectedCategoryTab === 'entertainment') {
                return (
                    cat.includes('vui chơi') ||
                    cat.includes('nghỉ dưỡng') ||
                    cat.includes('công viên') ||
                    cat.includes('check-in')
                );
            }
            return true;
        });
    }, [places, searchQuery, selectedCategoryTab]);

    // Phân trang
    const totalPages = Math.ceil(filteredPlaces.length / ITEMS_PER_PAGE) || 1;
    const paginatedPlaces = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredPlaces.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredPlaces, currentPage]);

    if (!isOpen) return null;

    // Xử lý khi chọn một địa điểm tham quan / ăn uống
    const handleSelectPlaceItem = (place) => {
        if (onAddPlace) {
            onAddPlace(place, activeDay, placeTime);
        }
        onClose();
    };

    // Xử lý khi thêm ô di chuyển / nghỉ ngơi / tùy chỉnh
    const handleCustomSubmit = (e) => {
        e.preventDefault();
        if (!customName.trim()) {
            setCustomError('Vui lòng nhập tiêu đề hoạt động');
            return;
        }

        const newActivity = {
            id: Date.now(),
            type: customType,
            name: customName.trim(),
            time: customTime || '08:00',
            duration: duration.trim() || undefined,
            vehicle: customType === 'transit' ? vehicle : undefined,
            location: location.trim() || undefined,
            note: note.trim() || undefined,
            cost: cost.trim() || undefined,
            tag:
                customType === 'transit'
                    ? 'Di chuyển'
                    : customType === 'rest'
                        ? 'Nghỉ ngơi'
                        : customType === 'meal'
                            ? 'Ăn uống'
                            : 'Hoạt động',
        };

        if (onAddCustomActivity) {
            onAddCustomActivity(newActivity, activeDay);
        }
        onClose();

        // Reset
        setCustomName('');
        setNote('');
        setLocation('');
        setCost('');
        setCustomError('');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-3 sm:p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[92vh]">
                {/* ================= HEADER MODAL ================= */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white">
                    <div>
                        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <span>Thêm Hoạt Động Vào Ngày {activeDay}</span>
                        </h3>
                        <p className="text-xs text-slate-500">
                            Chọn địa điểm du lịch, ẩm thực hoặc tạo ô di chuyển, nghỉ ngơi
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600 flex items-center justify-center transition cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* ================= THANH TABS CHÍNH ================= */}
                <div className="flex border-b border-slate-200 bg-slate-50/70 px-6 pt-3 gap-2 shrink-0 overflow-x-auto scrollbar-none">
                    <button
                        type="button"
                        onClick={() => setMainTab('place')}
                        className={`pb-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition cursor-pointer shrink-0 ${mainTab === 'place'
                            ? 'border-[#006971] text-[#006971]'
                            : 'border-transparent text-slate-500 hover:text-slate-800'
                            }`}
                    >
                        <MapPin className="w-4 h-4" />
                        <span>Chọn Điểm Tham Quan & Ăn Uống ({filteredPlaces.length})</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            setMainTab('custom');
                            setCustomType('transit');
                            if (!customName) setCustomName('Di chuyển đến ');
                        }}
                    className={`pb-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition cursor-pointer shrink-0 ${mainTab === 'custom' && customType === 'transit'
                            ? 'border-sky-600 text-sky-700'
                            : 'border-transparent text-slate-500 hover:text-slate-800'
                        }`}
                                >
                    <Car className="w-4 h-4" />
                    <span>Ô Di Chuyển</span>
                </button>

                <button
                    type="button"
                    onClick={() => {
                        setMainTab('custom');
                        setCustomType('rest');
                        if (!customName) setCustomName('Nghỉ ngơi tại khách sạn');
                    }}
                    className={`pb-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition cursor-pointer shrink-0 ${mainTab === 'custom' && customType === 'rest'
                        ? 'border-purple-600 text-purple-700'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                        }`}
                >
                    <Coffee className="w-4 h-4" />
                    <span>Ô Nghỉ Ngơi</span>
                </button>

                <button
                    type="button"
                    onClick={() => {
                        setMainTab('custom');
                        setCustomType('custom');
                        if (!customName) setCustomName('');
                    }}
                className={`pb-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition cursor-pointer shrink-0 ${mainTab === 'custom' && customType === 'custom'
                        ? 'border-emerald-600 text-emerald-700'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                                >
                <Sparkles className="w-4 h-4" />
                <span>Hoạt Động Khác</span>
            </button>
        </div>

                {/* ================= NỘI DUNG THEO TAB ================= */ }
    <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
        {/* TAB 1: CHỌN ĐỊA ĐIỂM THAM QUAN & ĂN UỐNG */}
        {mainTab === 'place' && (
            <div className="space-y-4">
                {/* Thanh công cụ: Chọn khung giờ 0-23h (Kiểu đồng hồ) & Ô tìm kiếm */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                    <div className="flex items-center gap-2 flex-wrap">
                        <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 shrink-0">
                            <Clock className="w-4 h-4 text-[#006971]" />
                            <span>Khung giờ ghé thăm:</span>
                        </label>
                        {/* BỘ CHỌN GIỜ ĐỒNG HỒ THEO KHUNG 0-23H */}
                        <TimePicker24h
                            value={placeTime}
                            onChange={(val) => setPlaceTime(val)}
                        />
                        <span className="text-2xs text-slate-400 hidden sm:inline">
                            (Chọn khung 0h - 23h)
                        </span>
                    </div>

                    <div className="relative flex-1 max-w-md">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Tìm theo tên địa điểm, món ăn, quận huyện..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#006971]/30 focus:border-[#006971] placeholder:text-slate-400"
                        />
                    </div>
                </div>

                {/* Danh mục lọc nhanh */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                    {CATEGORY_TABS.map((cat) => (
                        <button
                            key={cat.id}
                            type="button"
                            onClick={() => setSelectedCategoryTab(cat.id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition cursor-pointer ${selectedCategoryTab === cat.id
                                ? 'bg-[#006971] text-white shadow-xs'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>

                {/* Danh sách thẻ địa điểm */}
                <div className="space-y-3">
                    {paginatedPlaces.length === 0 ? (
                        <div className="text-center py-12 text-slate-400 text-sm">
                            Không tìm thấy địa điểm nào phù hợp với từ khóa &quot;{searchQuery}&quot;
                        </div>
                    ) : (
                        paginatedPlaces.map((place) => (
                            <div
                                key={place.id}
                                className="bg-white border border-slate-200/90 rounded-2xl p-4 hover:border-[#006971]/40 hover:shadow-xs transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
                            >
                                {/* Ảnh và thông tin chính */}
                                <div className="flex items-start gap-3.5 sm:gap-4 flex-1 min-w-0">
                                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-slate-100 shrink-0 border border-slate-100">
                                        <Image
                                            src={
                                                place.img ||
                                                'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=600&q=80'
                                            }
                                            alt={place.name}
                                            fill
                                            sizes="96px"
                                            className="object-cover group-hover:scale-105 transition duration-300"
                                        />
                                    </div>

                                    <div className="space-y-1.5 flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h4 className="font-bold text-slate-900 text-sm sm:text-base group-hover:text-[#006971] transition-colors line-clamp-1">
                                                {place.name}
                                            </h4>
                                            <span className="text-2xs font-semibold px-2 py-0.5 rounded-md bg-teal-50 text-[#006971] border border-teal-100 shrink-0">
                                                {place.category}
                                            </span>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                                            <div className="flex items-center gap-1 text-amber-500 font-bold">
                                                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                                <span>{place.rating || '4.5'}</span>
                                            </div>
                                            <div className="flex items-center gap-1 text-slate-500">
                                                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                <span className="line-clamp-1">{place.address}</span>
                                            </div>
                                            {place.ticketPrice && (
                                                <div className="flex items-center gap-1 text-emerald-700 font-medium">
                                                    <Coins className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                                    <span>{place.ticketPrice}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Mô tả ngắn */}
                                        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                                            {place.des || place.infor || 'Địa điểm hấp dẫn tại Đà Nẵng & Quảng Nam.'}
                                        </p>
                                    </div>
                                </div>

                                {/* Nút hành động */}
                                <div className="flex items-center gap-2 sm:flex-col sm:items-end shrink-0 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                                    {/* XEM CHI TIẾT SANG TAB KHÁC */}
                                    <a
                                        href={`/explore/place/${place.id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-2xs text-[#006971] hover:text-[#004e54] font-semibold py-1.5 px-3 rounded-xl bg-teal-50 hover:bg-teal-100 transition cursor-pointer border border-teal-100"
                                        title="Mở trang chi tiết trong tab mới"
                                    >
                                        <span>Xem chi tiết</span>
                                        <ExternalLink className="w-3 h-3" />
                                    </a>

                                    <button
                                        type="button"
                                        onClick={() => handleSelectPlaceItem(place)}
                                        className="px-4 py-2 rounded-xl bg-[#006971] hover:bg-[#00555c] active:scale-95 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition cursor-pointer"
                                    >
                                        <span>+ Thêm lúc {placeTime}</span>
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* ================= THANH PHÂN TRANG (PAGINATION) ================= */}
                {filteredPlaces.length > ITEMS_PER_PAGE && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200">
                        <div className="text-xs text-slate-500">
                            Hiển thị{' '}
                            <span className="font-bold text-slate-700">
                                {(currentPage - 1) * ITEMS_PER_PAGE + 1} -{' '}
                                {Math.min(currentPage * ITEMS_PER_PAGE, filteredPlaces.length)}
                            </span>{' '}
                            trên tổng số{' '}
                            <span className="font-bold text-slate-700">
                                {filteredPlaces.length}
                            </span>{' '}
                            địa điểm
                        </div>

                        {/* Các nút chuyển trang */}
                        <div className="flex items-center gap-1">
                            <button
                                type="button"
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                                title="Trang trước"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>

                            {/* Render số trang thông minh */}
                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                                .filter(
                                    (page) =>
                                        page === 1 ||
                                        page === totalPages ||
                                        Math.abs(page - currentPage) <= 2
                                )
                                .map((page, idx, arr) => {
                                    const prevPage = arr[idx - 1];
                                    const isGap = prevPage && page - prevPage > 1;
                                    return (
                                        <React.Fragment key={page}>
                                            {isGap && (
                                                <span className="px-1 text-slate-400 text-xs">
                                                    ...
                                                </span>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => setCurrentPage(page)}
                                                className={`w-7 h-7 rounded-lg text-xs font-bold transition cursor-pointer ${page === currentPage
                                                    ? 'bg-[#006971] text-white shadow-xs'
                                                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                                                    }`}
                                            >
                                                {page}
                                            </button>
                                        </React.Fragment>
                                    );
                                })}

                            <button
                                type="button"
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                                title="Trang sau"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        )}

        {/* TAB 2: Ô DI CHUYỂN / NGHỈ NGƠI / TÙY CHỈNH */}
        {mainTab === 'custom' && (
            <form onSubmit={handleCustomSubmit} className="space-y-4 max-w-xl mx-auto">
                {customError && (
                    <div className="p-3 text-xs text-red-600 bg-red-50 rounded-xl border border-red-100">
                        {customError}
                    </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-[#006971]" />
                            Khung giờ bắt đầu (0-23h) <span className="text-red-500">*</span>
                        </label>
                        <TimePicker24h
                            value={customTime}
                            onChange={(val) => setCustomTime(val)}
                            className="w-full"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Thời gian ước tính
                        </label>
                        <input
                            type="text"
                            placeholder="Ví dụ: 30 phút, 1.5 giờ"
                            value={duration}
                            onChange={(e) => setDuration(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#006971]/30 focus:border-[#006971]"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Tiêu đề hoạt động <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        placeholder={
                            customType === 'transit'
                                ? 'Ví dụ: Di chuyển từ khách sạn sang Bà Nà Hills'
                                : customType === 'rest'
                                    ? 'Ví dụ: Nghỉ ngơi tại khách sạn, thư giãn'
                                    : 'Ví dụ: Dạo chợ đêm, mua sắm quà lưu niệm'
                        }
                        value={customName}
                        onChange={(e) => setCustomName(e.target.value)}
                        required
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#006971]/30 focus:border-[#006971]"
                    />
                </div>

                {customType === 'transit' && (
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Phương tiện di chuyển:
                        </label>
                        <select
                            value={vehicle}
                            onChange={(e) => setVehicle(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:border-[#006971] cursor-pointer"
                        >
                            {VEHICLE_OPTIONS.map((v) => (
                                <option key={v} value={v}>
                                    {v}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {customType === 'transit' ? 'Lộ trình / Điểm đến' : 'Địa điểm / Khách sạn'}
                    </label>
                    <input
                        type="text"
                        placeholder="Ví dụ: Đường Võ Nguyên Giáp, Khách sạn Mường Thanh..."
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#006971]/30 focus:border-[#006971]"
                    />
                </div>

                <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Ghi chú bổ sung
                    </label>
                    <textarea
                        rows={2}
                        placeholder="Ghi chú vé, thời gian hẹn, lưu ý trang phục..."
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#006971]/30 focus:border-[#006971]"
                    />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 rounded-xl text-slate-600 bg-slate-100 hover:bg-slate-200 text-xs font-semibold transition cursor-pointer"
                    >
                        Hủy
                    </button>
                    <button
                        type="submit"
                        className="px-5 py-2 rounded-xl text-white bg-[#006971] hover:bg-[#00555c] text-xs font-semibold shadow-xs transition cursor-pointer"
                    >
                        Thêm vào Ngày {activeDay}
                    </button>
                </div>
            </form>
        )}
    </div >
            </div >
        </div >
    );
}
