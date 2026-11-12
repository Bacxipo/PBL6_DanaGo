'use client';

import React, { useState, useEffect } from 'react';
import { X, Search, Check, Hotel, Star, Users, Clock, ChevronLeft, ChevronRight } from 'lucide-react';

const AI_API_URL = process.env.NEXT_PUBLIC_AI_API_URL || 'http://localhost:8000';
const ITEMS_PER_PAGE = 15;

export default function SelectLodgingModal({
    isOpen,
    onClose,
    currentRegion = '',
    budgetPp = null,
    selectedLodgings = [],
    onConfirmSelection,
}) {
    const [lodgings, setLodgings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState('ALL');
    const [currentPage, setCurrentPage] = useState(1);
    const [localSelected, setLocalSelected] = useState([]);

    useEffect(() => {
        if (isOpen) {
            setLocalSelected([...selectedLodgings]);
            setCurrentPage(1);
            fetchLodgingList();
        }
    }, [isOpen, currentRegion, budgetPp]);

    // Khi đổi từ khoá tìm kiếm hoặc loại, reset về trang 1
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedType]);

    const fetchLodgingList = async () => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams();
            if (currentRegion) queryParams.set('region', currentRegion);
            // Lấy tất cả nơi nghỉ trong bảng (không giới hạn top_k 30)
            const res = await fetch(`${AI_API_URL}/lodging?${queryParams.toString()}`, {
                method: 'POST',
            });
            if (res.ok) {
                const data = await res.json();
                setLodgings(data.items || []);
            }
        } catch (err) {
            console.error('Lỗi khi tải danh sách nơi nghỉ:', err);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const lodgingTypes = ['ALL', 'Khách sạn', 'Homestay', 'Villa', 'Nhà nghỉ'];

    const toggleLodging = (lo) => {
        const exists = localSelected.some((item) => item.id === lo.id);
        if (exists) {
            setLocalSelected(localSelected.filter((item) => item.id !== lo.id));
        } else {
            setLocalSelected([lo]); // Chọn 1 nơi nghỉ chính cho chuyến đi
        }
    };

    const filtered = lodgings.filter((l) => {
        const matchSearch =
            l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (l.district && l.district.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchType = selectedType === 'ALL' || l.type === selectedType;
        return matchSearch && matchType;
    });

    // Phân trang danh sách nơi nghỉ (15 items/trang)
    const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
    const paginatedItems = filtered.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const handleSave = () => {
        onConfirmSelection(localSelected);
        onClose();
    };

    const handleClear = () => {
        setLocalSelected([]);
        onConfirmSelection([]);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <Hotel size={18} className="text-[#006971]" />
                            Chọn Nơi Lưu Trú (Khách sạn / Villa / Homestay)
                        </h3>
                        <p className="text-xs text-gray-500">
                            Chọn nơi nghỉ cố định hoặc để AI tự động chọn khách sạn có đánh giá cao nhất phù hợp ngân sách.
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Tìm kiếm & Bộ lọc loại nơi nghỉ */}
                <div className="p-4 border-b border-gray-100 bg-gray-50/50 space-y-2.5">
                    <div className="relative">
                        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm khách sạn, resort, villa theo tên hoặc khu vực..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#006971]/30 focus:border-[#006971]"
                        />
                    </div>
                    {/* Filter tabs theo loại nơi nghỉ */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                        {lodgingTypes.map((typeKey) => {
                            const isTypeActive = selectedType === typeKey;
                            const count = typeKey === 'ALL'
                                ? lodgings.length
                                : lodgings.filter((l) => l.type === typeKey).length;
                            return (
                                <button
                                    key={typeKey}
                                    type="button"
                                    onClick={() => setSelectedType(typeKey)}
                                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${isTypeActive
                                        ? 'bg-[#006971] text-white shadow-2xs'
                                        : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <span>{typeKey === 'ALL' ? 'Tất cả' : typeKey}</span>
                                    <span className={`text-2xs px-1.5 py-0.2 rounded-full ${isTypeActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                                        }`}>
                                        {count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Danh sách nơi nghỉ */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {loading ? (
                        <div className="py-12 text-center text-sm text-gray-500">Đang tìm nơi nghỉ phù hợp...</div>
                    ) : filtered.length === 0 ? (
                        <div className="py-12 text-center text-sm text-gray-500">
                            Không tìm thấy nơi nghỉ nào trong danh mục này. Hãy thử chọn danh mục khác hoặc để AI tự chọn.
                        </div>
                    ) : (
                        paginatedItems.map((lo) => {
                            const isSelected = localSelected.some((item) => item.id === lo.id);
                            return (
                                <div
                                    key={lo.id}
                                    onClick={() => toggleLodging(lo)}
                                    className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer transition-all ${isSelected
                                        ? 'border-[#006971] bg-teal-50/60 ring-2 ring-[#006971]/20'
                                        : 'border-gray-200 hover:border-gray-300 bg-white'
                                        }`}
                                >
                                    <div className="space-y-1.5 flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="px-2 py-0.5 rounded text-2xs font-semibold bg-gray-100 text-gray-700">
                                                {lo.type || 'Khách sạn'}
                                            </span>
                                            <h4 className="text-sm font-bold text-gray-900">{lo.name}</h4>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                                            <span className="flex items-center gap-1 text-amber-500 font-semibold">
                                                <Star size={12} className="fill-amber-400" />
                                                {Number(lo.avg_rating || 5).toFixed(1)}
                                            </span>
                                            <span>📍 {lo.district}, {lo.region}</span>
                                            <span className="flex items-center gap-1">
                                                <Users size={12} />
                                                Tối đa {lo.max_guests} khách
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock size={12} />
                                                Check-in: {lo.checkin} • Out: {lo.checkout}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-gray-100 gap-1 shrink-0">
                                        <div className="text-sm font-bold text-[#006971]">
                                            {Number(lo.price_per_night || 0).toLocaleString('vi-VN')} đ/đêm
                                        </div>
                                        <div className="text-2xs text-gray-400">
                                            (~{Math.round(lo.price_pp_night || 0).toLocaleString('vi-VN')} đ/người)
                                        </div>
                                        <button
                                            type="button"
                                            className={`mt-1 px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${isSelected
                                                ? 'bg-[#006971] text-white'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                }`}
                                        >
                                            {isSelected ? (
                                                <>
                                                    <Check size={12} strokeWidth={3} /> Đã chọn
                                                </>
                                            ) : (
                                                'Chọn nơi này'
                                            )}
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Thanh chuyển trang (Pagination) */}
                {filtered.length > ITEMS_PER_PAGE && (
                    <div className="px-6 py-2.5 border-t border-gray-100 bg-white flex items-center justify-between text-xs text-gray-600">
                        <div className="text-2xs text-gray-500">
                            Hiển thị {(currentPage - 1) * ITEMS_PER_PAGE + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} trên tổng số {filtered.length} nơi nghỉ
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                type="button"
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft size={14} />
                            </button>
                            <span className="px-3 py-1 font-bold text-gray-700 bg-gray-100 rounded-lg text-2xs">
                                Trang {currentPage} / {totalPages}
                            </span>
                            <button
                                type="button"
                                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className="px-6 py-3 border-t border-gray-100 flex items-center justify-between bg-gray-50">
                    <button
                        type="button"
                        onClick={handleClear}
                        className="text-xs text-gray-500 hover:text-red-600 underline font-medium"
                    >
                        Để AI tự chọn nơi nghỉ
                    </button>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-200 transition-colors"
                        >
                            Đóng
                        </button>
                        <button
                            type="button"
                            onClick={handleSave}
                            className="px-5 py-2 rounded-xl text-xs font-bold bg-[#006971] hover:bg-[#00555c] text-white shadow-xs transition-colors"
                        >
                            Xác nhận {localSelected.length > 0 ? `(${localSelected[0].name})` : ''}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

