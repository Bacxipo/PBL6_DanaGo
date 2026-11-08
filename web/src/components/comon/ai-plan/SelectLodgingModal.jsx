'use client';

import React, { useState, useEffect } from 'react';
import { X, Search, Check, Hotel, Star, Users, Clock, ExternalLink } from 'lucide-react';

const AI_API_URL = process.env.NEXT_PUBLIC_AI_API_URL || 'http://localhost:8000';

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
    const [localSelected, setLocalSelected] = useState([]);

    useEffect(() => {
        if (isOpen) {
            setLocalSelected([...selectedLodgings]);
            fetchLodgingList();
        }
    }, [isOpen, currentRegion, budgetPp]);

    const fetchLodgingList = async () => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams();
            if (currentRegion) queryParams.set('region', currentRegion);
            if (budgetPp && budgetPp > 0) queryParams.set('budget_pp', String(Math.round(budgetPp / 2))); // Ước tính cho mỗi đêm
            queryParams.set('top_k', '30');

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

    const toggleLodging = (lo) => {
        const exists = localSelected.some((item) => item.id === lo.id);
        if (exists) {
            setLocalSelected(localSelected.filter((item) => item.id !== lo.id));
        } else {
            // Có thể chọn 1 hoặc nhiều nơi nghỉ
            setLocalSelected([lo]); // Chọn 1 nơi nghỉ chính cho chuyến đi
        }
    };

    const filtered = lodgings.filter((l) =>
        l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (l.district && l.district.toLowerCase().includes(searchTerm.toLowerCase()))
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

                {/* Tìm kiếm */}
                <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex gap-2">
                    <div className="relative flex-1">
                        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm khách sạn, resort, villa theo tên hoặc khu vực..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#006971]/30 focus:border-[#006971]"
                        />
                    </div>
                </div>

                {/* Danh sách nơi nghỉ */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {loading ? (
                        <div className="py-12 text-center text-sm text-gray-500">Đang tìm nơi nghỉ phù hợp...</div>
                    ) : filtered.length === 0 ? (
                        <div className="py-12 text-center text-sm text-gray-500">
                            Không tìm thấy nơi nghỉ nào trong khoảng ngân sách này. Hãy thử tăng ngân sách hoặc để AI tự chọn.
                        </div>
                    ) : (
                        filtered.map((lo) => {
                            const isSelected = localSelected.some((item) => item.id === lo.id);
                            return (
                                <div
                                    key={lo.id}
                                    onClick={() => toggleLodging(lo)}
                                    className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer transition-all ${
                                        isSelected
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
                                            className={`mt-1 px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                                                isSelected
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

