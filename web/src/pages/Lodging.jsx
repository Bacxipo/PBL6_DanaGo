'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
    Hotel,
    Search,
    MapPin,
    Users,
    Star,
    Clock,
    Sparkles,
    RotateCcw,
    ExternalLink,
    Check,
    SlidersHorizontal,
    X,
    Globe,
    Coins,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
} from 'lucide-react';
import { getLodgings, getLodgingAmenities } from '@/lib/lodging-api';

const LODGING_TYPES = ['ALL', 'Khách sạn', 'Homestay', 'Villa', 'Nhà nghỉ'];

const REGIONS = [
    { value: 'ALL', label: 'Tất cả khu vực' },
    { value: 'Đà Nẵng nội thành', label: 'Đà Nẵng nội thành (Sơn Trà, Hải Châu, Ngũ Hành Sơn)' },
    { value: 'Hội An - Điện Bàn', label: 'Hội An - Điện Bàn' },
    { value: 'Hòa Vang - Bà Nà', label: 'Hòa Vang - Bà Nà' },
    { value: 'Cù Lao Chàm', label: 'Cù Lao Chàm' },
    { value: 'Duy Xuyên - Mỹ Sơn', label: 'Duy Xuyên - Mỹ Sơn' },
    { value: 'Nam Quảng Nam', label: 'Nam Quảng Nam' },
];

const GUEST_OPTIONS = [
    { value: 0, label: 'Tất cả' },
    { value: 1, label: '1+ người' },
    { value: 2, label: '2+ người' },
    { value: 4, label: '4+ người' },
    { value: 6, label: '6+ người' },
];

const DEFAULT_AMENITIES = [
    'Hồ bơi',
    'Gần biển',
    'View biển',
    'Buffet sáng',
    'Nhà hàng',
    'Spa',
    'Phòng gym',
    'Bếp',
    'Ban công',
    'Sân vườn',
    'Đưa đón sân bay',
    'Chỗ đỗ xe',
    'Phòng gia đình',
    'Xe đạp miễn phí',
];

const FALLBACK_IMAGES = [
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=900&q=80',
];

const ITEMS_PER_PAGE = 9;

export default function LodgingPage() {
    const [lodgings, setLodgings] = useState([]);
    const [amenitiesList, setAmenitiesList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Bộ lọc bên trái
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState('ALL');
    const [selectedRegion, setSelectedRegion] = useState('ALL');
    const [selectedDistrict, setSelectedDistrict] = useState('ALL');
    const [minGuests, setMinGuests] = useState(0);
    const [draftMinGuests, setDraftMinGuests] = useState(0);
    const [selectedAmenities, setSelectedAmenities] = useState([]);
    const [showAmenitiesDropdown, setShowAmenitiesDropdown] = useState(false);
    const [maxPrice, setMaxPrice] = useState(12000000);
    const [draftMaxPrice, setDraftMaxPrice] = useState(12000000);
    const [sortBy, setSortBy] = useState('rating'); // 'rating' | 'price_asc' | 'price_desc'
    const [currentPage, setCurrentPage] = useState(1);

    // Debounce thanh kéo giá & sức chứa để giao diện mượt, không bị nhảy layout khi đang kéo
    useEffect(() => {
        const timer = setTimeout(() => {
            setMaxPrice(draftMaxPrice);
            setCurrentPage(1);
        }, 120);
        return () => clearTimeout(timer);
    }, [draftMaxPrice]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setMinGuests(draftMinGuests);
            setCurrentPage(1);
        }, 100);
        return () => clearTimeout(timer);
    }, [draftMinGuests]);

    // Modal xem chi tiết nơi ở
    const [activeLodging, setActiveLodging] = useState(null);
    const [activeImgIdx, setActiveImgIdx] = useState(0);

    const fetchInitialData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [items, ams] = await Promise.all([
                getLodgings({ status: 'APPROVED' }),
                getLodgingAmenities(),
            ]);
            setLodgings(items || []);
            if (ams && ams.length > 0) {
                setAmenitiesList(ams.map((a) => a.nameVi));
            } else {
                setAmenitiesList(DEFAULT_AMENITIES);
            }
        } catch (err) {
            setError(err.message || 'Không thể tải danh sách nơi lưu trú.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInitialData();
    }, []);

    // Danh sách quận/huyện tự động trích từ dữ liệu
    const availableDistricts = useMemo(() => {
        const set = new Set();
        lodgings.forEach((l) => {
            if (l.district) set.add(l.district);
        });
        return Array.from(set).sort();
    }, [lodgings]);

    const toggleAmenity = (am) => {
        setSelectedAmenities((prev) =>
            prev.includes(am) ? prev.filter((item) => item !== am) : [...prev, am]
        );
        setCurrentPage(1);
    };

    const handleResetFilters = () => {
        setSearchTerm('');
        setSelectedType('ALL');
        setSelectedRegion('ALL');
        setSelectedDistrict('ALL');
        setMinGuests(0);
        setDraftMinGuests(0);
        setSelectedAmenities([]);
        setMaxPrice(12000000);
        setDraftMaxPrice(12000000);
        setSortBy('rating');
        setCurrentPage(1);
    };

    const filteredLodgings = useMemo(() => {
        const q = searchTerm.trim().toLowerCase();
        return lodgings
            .filter((item) => {
                if (selectedType !== 'ALL' && item.type !== selectedType) return false;
                if (selectedRegion !== 'ALL' && item.region !== selectedRegion) return false;
                if (selectedDistrict !== 'ALL' && item.district !== selectedDistrict) return false;
                if (minGuests > 0 && Number(item.maxGuests || 0) < minGuests) return false;
                if (Number(item.pricePerNight || 0) > maxPrice) return false;

                if (q) {
                    const matchName = (item.name || '').toLowerCase().includes(q);
                    const matchDesc = (item.description || '').toLowerCase().includes(q);
                    const matchDist = (item.district || '').toLowerCase().includes(q);
                    if (!matchName && !matchDesc && !matchDist) return false;
                }

                if (selectedAmenities.length > 0) {
                    const itemAms = (item.amenities || []).map((a) => a.toLowerCase());
                    const desc = (item.description || '').toLowerCase();
                    const allMatched = selectedAmenities.every((req) => {
                        const r = req.toLowerCase();
                        return itemAms.some((ia) => ia.includes(r) || r.includes(ia)) || desc.includes(r);
                    });
                    if (!allMatched) return false;
                }

                return true;
            })
            .sort((a, b) => {
                if (sortBy === 'price_asc') return a.pricePerNight - b.pricePerNight;
                if (sortBy === 'price_desc') return b.pricePerNight - a.pricePerNight;
                return (b.avgRating || 0) - (a.avgRating || 0);
            });
    }, [
        lodgings,
        searchTerm,
        selectedType,
        selectedRegion,
        selectedDistrict,
        minGuests,
        selectedAmenities,
        maxPrice,
        sortBy,
    ]);

    const totalPages = Math.max(1, Math.ceil(filteredLodgings.length / ITEMS_PER_PAGE));
    const paginatedLodgings = filteredLodgings.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const getCoverImage = (item) => {
        if (item.images && item.images.length > 0 && item.images[0]?.imageUrl) {
            return item.images[0].imageUrl;
        }
        return FALLBACK_IMAGES[item.id % FALLBACK_IMAGES.length];
    };

    return (
        <div className="min-h-screen bg-[#f4f7f8] pb-16">
            {/* Banner Header */}
            <div className="bg-gradient-to-r from-[#004e54] via-[#006971] to-[#00897b] text-white py-10 px-4 sm:px-6">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-2">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-amber-300 text-xs font-bold tracking-wide">
                            <Hotel size={14} /> Lưu Trú Đà Nẵng & Quảng Nam
                        </span>
                        <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                            Khám Phá Khách Sạn, Resort, Villa & Homestay
                        </h1>
                        <p className="text-sm text-teal-100 max-w-2xl">
                            Tìm kiếm nơi nghỉ dưỡng lý tưởng theo số lượng khách, khu vực, loại hình lưu trú và tiện ích đi kèm.
                        </p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-5 py-3.5 text-right shrink-0">
                        <div className="text-2xl font-black text-amber-300">{filteredLodgings.length}</div>
                        <div className="text-xs text-teal-50 font-semibold">Nơi lưu trú phù hợp</div>
                    </div>
                </div>
            </div>

            {/* Nội dung chính: Cột trái Bộ lọc - Cột phải Danh sách nơi ở */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 flex flex-col lg:flex-row gap-6 items-start">
                {/* ================= CỘT TRÁI: BỘ LỌC CHI TIẾT ================= */}
                <aside className="w-full lg:w-[320px] shrink-0 bg-white rounded-3xl border border-gray-200/80 shadow-xs p-5 space-y-5 lg:sticky lg:top-24">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                        <h2 className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
                            <SlidersHorizontal size={16} className="text-[#006971]" />
                            Bộ Lọc Tìm Kiếm
                        </h2>
                        <button
                            type="button"
                            onClick={handleResetFilters}
                            className="text-xs font-bold text-[#006971] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                            <RotateCcw size={12} /> Đặt lại
                        </button>
                    </div>

                    {/* 1. Tìm kiếm theo tên */}
                    <div>
                        <label className="block text-2xs font-extrabold uppercase tracking-wider text-gray-400 mb-1.5">
                            Tên nơi lưu trú / Мо tả
                        </label>
                        <div className="relative">
                            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1);
                                }}
                                placeholder="VD: Mỹ Khê, Boutique, Villa..."
                                className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#006971]/30"
                            />
                        </div>
                    </div>

                    {/* 2. Loại nơi ở */}
                    <div>
                        <label className="block text-2xs font-extrabold uppercase tracking-wider text-gray-400 mb-1.5">
                            Loại Nơi Ở
                        </label>
                        <div className="grid grid-cols-2 gap-1.5">
                            {LODGING_TYPES.map((type) => {
                                const active = selectedType === type;
                                return (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => {
                                            setSelectedType(type);
                                            setCurrentPage(1);
                                        }}
                                        className={`px-3 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${active
                                                ? 'bg-[#006971] border-[#006971] text-white shadow-2xs'
                                                : 'bg-white border-gray-200 text-gray-700 hover:border-[#006971]/50'
                                            }`}
                                    >
                                        {type === 'ALL' ? 'Tất cả loại' : type}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* 3. Số người (Sức chứa từ 1 đến 15 người - kéo hoặc chọn) */}
                    <div>
                            <div className="flex items-center justify-between gap-2 mb-1.5">
                                <label className="text-2xs font-extrabold uppercase tracking-wider text-gray-400">
                                    Sức Chứa (1 - 15 Người)
                                </label>
                                <span className="text-xs font-extrabold text-[#006971] tabular-nums whitespace-nowrap">
                                    {draftMinGuests === 0 ? 'Tất cả sức chứa' : `Từ ${draftMinGuests} người`}
                                </span>
                            </div>
                            <div className="flex items-center gap-2.5">
                                <input
                                    type="range"
                                    min="0"
                                    max="15"
                                    step="1"
                                    value={draftMinGuests}
                                    onChange={(e) => setDraftMinGuests(Number(e.target.value))}
                                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#006971]"
                                />
                                <select
                                    value={draftMinGuests}
                                    onChange={(e) => {
                                        const val = Number(e.target.value);
                                        setDraftMinGuests(val);
                                        setMinGuests(val);
                                        setCurrentPage(1);
                                    }}
                                    className="w-24 px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#006971]/30 cursor-pointer shrink-0"
                                >
                                    <option value={0}>Tất cả</option>
                                    {Array.from({ length: 15 }, (_, idx) => idx + 1).map((n) => (
                                        <option key={n} value={n}>
                                            {n} người
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex justify-between text-2xs text-gray-400 font-semibold mt-1">
                                <span>Tất cả</span>
                                <span>5 người</span>
                                <span>10 người</span>
                                <span>15 người</span>
                            </div>
                        </div>

                        {/* 4. Khu vực & Quận huyện */}
                        <div className="space-y-3">
                            <div>
                                <label className="block text-2xs font-extrabold uppercase tracking-wider text-gray-400 mb-1.5">
                                    Khu Vực Trọng Tâm
                                </label>
                                <select
                                    value={selectedRegion}
                                    onChange={(e) => {
                                        setSelectedRegion(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#006971]/30 cursor-pointer"
                                >
                                    {REGIONS.map((r) => (
                                        <option key={r.value} value={r.value}>
                                            {r.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-2xs font-extrabold uppercase tracking-wider text-gray-400 mb-1.5">
                                    Quận / Huyện Cụ Thể
                                </label>
                                <select
                                    value={selectedDistrict}
                                    onChange={(e) => {
                                        setSelectedDistrict(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#006971]/30 cursor-pointer"
                                >
                                    <option value="ALL">Tất cả quận/huyện</option>
                                    {availableDistricts.map((d) => (
                                        <option key={d} value={d}>
                                            {d}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* 5. Giá phòng tối đa / đêm */}
                        <div>
                                    <div className="flex items-center justify-between gap-2 mb-1.5">
                                        <label className="text-2xs font-extrabold uppercase tracking-wider text-gray-400 shrink-0">
                                            Giá Phòng Tối Đa / Đêm
                                        </label>
                                            <span className="text-xs font-extrabold text-[#006971] tabular-nums whitespace-nowrap text-right min-w-[115px]">
                                                {draftMaxPrice >= 12000000
                                                    ? 'Không giới hạn'
                                                    : `<= ${draftMaxPrice.toLocaleString('vi-VN')} đ`}
                                            </span>
                                    </div>
                                    <input
                                        type="range"
                                        min="300000"
                                        max="12000000"
                                        step="200000"
                                        value={draftMaxPrice}
                                        onChange={(e) => setDraftMaxPrice(Number(e.target.value))}
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#006971]"
                                    />
                                    <div className="flex justify-between text-2xs text-gray-400 font-semibold mt-1">
                                        <span>300k</span>
                                        <span>3 triệu</span>
                                        <span>6 triệu</span>
                                        <span>12 triệu+</span>
                                    </div>
                            </div>

                            {/* 6. Tiện ích đi kèm (Xổ xuống để chọn) */}
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="text-2xs font-extrabold uppercase tracking-wider text-gray-400">
                                        Tiện Ích Đi Kèm ({selectedAmenities.length})
                                    </label>
                                    {selectedAmenities.length > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSelectedAmenities([]);
                                                setCurrentPage(1);
                                            }}
                                            className="text-2xs font-bold text-[#006971] hover:underline cursor-pointer"
                                        >
                                            Bỏ chọn tất cả
                                        </button>
                                    )}
                                </div>

                        <button
                            type="button"
                            onClick={() => setShowAmenitiesDropdown((prev) => !prev)}
                            className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 hover:border-[#006971] rounded-xl flex items-center justify-between text-left transition-colors cursor-pointer"
                        >
                            <span className="text-xs font-semibold text-gray-700 truncate pr-2">
                                {selectedAmenities.length === 0
                                    ? 'Tất cả tiện ích (Bấm để chọn)'
                                    : `Đã chọn ${selectedAmenities.length}: ${selectedAmenities.join(', ')}`}
                            </span>
                            <ChevronDown
                                size={15}
                                className={`text-gray-500 shrink-0 transition-transform duration-200 ${
                                    showAmenitiesDropdown ? 'rotate-180 text-[#006971]' : ''
                                }`}
                            />
                        </button>

                        {
                                            !showAmenitiesDropdown && selectedAmenities.length > 0 && (
                                                <div className="flex flex-wrap gap-1.5 mt-2">
                                                    {selectedAmenities.map((am) => (
                                                        <span
                                                            key={am}
                                                            onClick={() => toggleAmenity(am)}
                                                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-2xs font-bold bg-teal-50 text-[#006971] border border-teal-200 cursor-pointer hover:bg-teal-100"
                                                        >
                                        {am}
                                        <X size={10} />
                                                        </span>
                                                    ))}
                                                </div>
                                            )
                                        }

                                        {
                                            showAmenitiesDropdown && (
                                                <div className="mt-2 p-2 bg-gray-50/90 border border-gray-200 rounded-2xl max-h-56 overflow-y-auto space-y-1">
                                                    {amenitiesList.map((am) => {
                                                        const checked = selectedAmenities.includes(am);
                                                        return (
                                                            <button
                                                                key={am}
                                                                type="button"
                                                                onClick={() => toggleAmenity(am)}
                                                                className={`w-full px-2.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${checked
                                                                        ? 'border-[#006971] bg-teal-50 text-[#006971]'
                                                                        : 'border-transparent bg-white hover:bg-gray-100 text-gray-700'
                                                                    }`}
                                                            >
                                <span className="truncate">{am}</span>
                                <span
                                    className={`w-4 h-4 rounded-md flex items-center justify-center text-white ${checked ? 'bg-[#006971]' : 'border border-gray-300'
                                        }`}
                                >
                                    {checked && <Check size={11} strokeWidth={3} />}
                                </span>
                            </button>
                            );
                                })}
                        </div>
                        )}
                    </div>
                </aside>

                {/* ================= CỘT PHẢI: DANH SÁCH NƠI Ở ================= */}
                    <main className="flex-1 min-w-0 w-full min-h-[760px] space-y-5">
                        {/* Thanh sắp xếp */}
                        <div className="bg-white rounded-2xl border border-gray-200/80 px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
                            <div className="text-xs font-semibold text-gray-600">
                                Hiển thị <strong className="text-gray-900">{filteredLodgings.length}</strong> nơi lưu trú
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500 font-medium">Sắp xếp theo:</span>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:outline-none cursor-pointer"
                                >
                                    <option value="rating">Đánh giá cao nhất</option>
                                    <option value="price_asc">Giá thấp đến cao</option>
                                    <option value="price_desc">Giá cao đến thấp</option>
                                </select>
                            </div>
                        </div>

                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                                {[1, 2, 3, 4, 5, 6].map((n) => (
                                    <div key={n} className="bg-white rounded-3xl border border-gray-100 p-4 space-y-3 animate-pulse">
                                        <div className="h-44 bg-gray-200 rounded-2xl" />
                                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                                        <div className="h-3 bg-gray-100 rounded w-1/2" />
                                        <div className="h-8 bg-gray-100 rounded-xl" />
                                    </div>
                                ))}
                            </div>
                        ) : error ? (
                            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center text-red-700 space-y-3">
                                <p className="font-bold text-sm">{error}</p>
                                <button
                                    onClick={fetchInitialData}
                                    className="px-4 py-2 bg-[#006971] text-white rounded-xl text-xs font-bold cursor-pointer"
                                >
                                    Thử lại
                                </button>
                            </div>
                        ) : filteredLodgings.length === 0 ? (
                            <div className="bg-white rounded-3xl border border-gray-200/80 p-12 text-center space-y-3">
                                <Hotel size={40} className="mx-auto text-gray-300" />
                                <h3 className="text-base font-bold text-gray-800">Không tìm thấy nơi lưu trú phù hợp</h3>
                                <p className="text-xs text-gray-500">
                                    Hãy thử nới lỏng bộ lọc tiện ích, số người hoặc khoảng giá.
                                </p>
                                <button
                                    onClick={handleResetFilters}
                                    className="px-4 py-2 bg-[#006971] text-white rounded-xl text-xs font-bold cursor-pointer"
                                >
                                    Xóa bộ lọc
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                                    {paginatedLodgings.map((item) => {
                                        const cover = getCoverImage(item);
                                        return (
                                            <div
                                                key={item.id}
                                                onClick={() => {
                                                    setActiveLodging(item);
                                                    setActiveImgIdx(0);
                                                }}
                                                className="group bg-white rounded-3xl border border-gray-200/80 overflow-hidden shadow-xs hover:shadow-lg transition-all duration-200 flex flex-col justify-between cursor-pointer"
                                            >
                                                <div>
                                                    <div className="relative h-48 overflow-hidden bg-gray-100">
                                                        <img
                                                            src={cover}
                                                            alt={item.name}
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                        />
                                                        <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-2xs font-extrabold bg-black/65 text-white backdrop-blur-xs">
                                                            {item.type}
                                                        </span>
                                                        <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-extrabold bg-white/95 text-amber-600 shadow-xs flex items-center gap-1">
                                                            <Star size={12} className="fill-amber-400 text-amber-400" />
                                                            {Number(item.avgRating || 4.5).toFixed(1)}
                                                        </span>
                                                    </div>

                                                    <div className="p-4 space-y-2.5">
                                                        <h3 className="font-extrabold text-gray-900 text-sm line-clamp-1 group-hover:text-[#006971] transition-colors">
                                                            {item.name}
                                                        </h3>

                                                        <div className="flex items-center justify-between text-xs text-gray-500">
                                                            <span className="flex items-center gap-1 truncate">
                                                                <MapPin size={13} className="text-[#006971] shrink-0" />
                                                                {item.district} • {item.region}
                                                            </span>
                                                            <span className="flex items-center gap-1 font-bold text-gray-700 shrink-0">
                                                                <Users size={13} className="text-purple-600" />
                                                                Tối đa {item.maxGuests} khách
                                                            </span>
                                                        </div>

                                                        {item.description && (
                                                            <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                                                                {item.description}
                                                            </p>
                                                        )}

                                                        {item.amenities && item.amenities.length > 0 && (
                                                            <div className="flex flex-wrap gap-1 pt-1">
                                                                {item.amenities.slice(0, 4).map((am, i) => (
                                                                    <span
                                                                        key={i}
                                                                        className="px-2 py-0.5 rounded-md bg-teal-50 text-[#006971] text-[10px] font-semibold"
                                                                    >
                                                                        {am}
                                                                    </span>
                                                                ))}
                                                                {item.amenities.length > 4 && (
                                                                    <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 text-[10px] font-semibold">
                                                                        +{item.amenities.length - 4}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="px-4 py-3 bg-gray-50/70 border-t border-gray-100 flex items-center justify-between">
                                                    <div>
                                                        <div className="text-sm font-black text-[#006971]">
                                                            {Number(item.pricePerNight || 0).toLocaleString('vi-VN')} đ
                                                            <span className="text-2xs font-medium text-gray-500"> / đêm</span>
                                                        </div>
                                                        <div className="text-[10px] text-gray-400">
                                                            ~{Number(item.pricePpNight || 0).toLocaleString('vi-VN')} đ/người
                                                        </div>
                                                    </div>
                                                    <span className="text-xs font-bold text-[#006971] group-hover:translate-x-0.5 transition-transform">
                                                        Xem chi tiết →
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Phân trang */}
                                {totalPages > 1 && (
                                    <div className="flex items-center justify-center gap-2 pt-4">
                                        <button
                                            type="button"
                                            disabled={currentPage === 1}
                                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                            className="p-2 rounded-xl border border-gray-200 bg-white disabled:opacity-40 cursor-pointer"
                                        >
                                            <ChevronLeft size={16} />
                                        </button>
                                        <span className="text-xs font-bold text-gray-700 px-3">
                                            Trang {currentPage} / {totalPages}
                                        </span>
                                        <button
                                            type="button"
                                            disabled={currentPage === totalPages}
                                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                            className="p-2 rounded-xl border border-gray-200 bg-white disabled:opacity-40 cursor-pointer"
                                        >
                                            <ChevronRight size={16} />
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </main>
            </div>

            {/* Modal chi tiết nơi lưu trú */}
            {activeLodging && (
                <div
                    onClick={() => setActiveLodging(null)}
                    className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100"
                    >
                        <div className="relative h-64 sm:h-72 bg-gray-100">
                            <img
                                src={
                                    activeLodging.images && activeLodging.images[activeImgIdx]
                                        ? activeLodging.images[activeImgIdx].imageUrl
                                        : getCoverImage(activeLodging)
                                }
                                alt={activeLodging.name}
                                className="w-full h-full object-cover"
                            />
                            <button
                                onClick={() => setActiveLodging(null)}
                                className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white hover:bg-black cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                            <span className="absolute bottom-4 left-4 px-3 py-1 rounded-full bg-black/70 text-white text-xs font-bold">
                                {activeLodging.type}
                            </span>
                        </div>

                        {activeLodging.images && activeLodging.images.length > 1 && (
                            <div className="flex gap-2 px-6 pt-3 overflow-x-auto">
                                {activeLodging.images.map((img, idx) => (
                                    <img
                                        key={img.id || idx}
                                        src={img.imageUrl}
                                        alt=""
                                        onClick={() => setActiveImgIdx(idx)}
                                        className={`w-16 h-16 rounded-xl object-cover cursor-pointer border-2 ${activeImgIdx === idx ? 'border-[#006971]' : 'border-transparent opacity-70'
                                            }`}
                                    />
                                ))}
                            </div>
                        )}

                        <div className="p-6 space-y-4">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <h2 className="text-xl font-black text-gray-900">{activeLodging.name}</h2>
                                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                        <MapPin size={14} className="text-[#006971]" />
                                        {activeLodging.district} • {activeLodging.region}
                                    </p>
                                </div>
                                <div className="text-right shrink-0">
                                    <div className="text-lg font-black text-[#006971]">
                                        {Number(activeLodging.pricePerNight || 0).toLocaleString('vi-VN')} đ/đêm
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        Sức chứa: {activeLodging.maxGuests} người
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-3 p-3.5 bg-gray-50 rounded-2xl text-xs">
                                <div>
                                    <span className="text-gray-400 block">Nhận phòng</span>
                                    <strong className="text-gray-800">Từ {activeLodging.checkin}</strong>
                                </div>
                                <div>
                                    <span className="text-gray-400 block">Trả phòng</span>
                                    <strong className="text-gray-800">Trước {activeLodging.checkout}</strong>
                                </div>
                                <div>
                                    <span className="text-gray-400 block">Đánh giá</span>
                                    <strong className="text-amber-600 flex items-center gap-1">
                                        <Star size={13} className="fill-amber-400 text-amber-400" />
                                        {Number(activeLodging.avgRating || 4.5).toFixed(1)} / 5.0
                                    </strong>
                                </div>
                            </div>

                            {activeLodging.description && (
                                <div>
                                    <h4 className="text-xs font-extrabold uppercase text-gray-400 mb-1">Mô tả</h4>
                                    <p className="text-sm text-gray-700 leading-relaxed">{activeLodging.description}</p>
                                </div>
                            )}

                            {activeLodging.amenities && activeLodging.amenities.length > 0 && (
                                <div>
                                    <h4 className="text-xs font-extrabold uppercase text-gray-400 mb-2">Tiện ích nổi bật</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {activeLodging.amenities.map((am, i) => (
                                            <span
                                                key={i}
                                                className="px-3 py-1 rounded-xl bg-teal-50 border border-teal-200/70 text-[#006971] text-xs font-bold"
                                            >
                                                ✓ {am}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center justify-end gap-3">
                                {activeLodging.addressUrl && (
                                    <a
                                        href={activeLodging.addressUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="px-4 py-2.5 rounded-xl border border-[#006971] text-[#006971] text-xs font-bold flex items-center gap-1.5 hover:bg-teal-50"
                                    >
                                        <MapPin size={14} /> Xem trên Google Maps
                                    </a>
                                )}
                                {activeLodging.website && (
                                    <a
                                        href={activeLodging.website}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="px-4 py-2.5 rounded-xl bg-[#006971] text-white text-xs font-bold flex items-center gap-1.5 hover:bg-[#005258]"
                                    >
                                        <Globe size={14} /> Website đặt phòng
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
