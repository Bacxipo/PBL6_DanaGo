'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Calendar,
    Clock,
    MapPin,
    Coins,
    Hotel,
    Utensils,
    Compass,
    ArrowRight,
    AlertTriangle,
    Save,
    RotateCcw,
    CheckCircle2,
} from 'lucide-react';
import { saveItineraryFull, getCurrentUserId } from '@/lib/itinerary-api';

const STORAGE_KEY = 'danago_itineraries';

export default function PlanResultView({
    plan,
    startDateStr = '',
    endDateStr = '',
    onReset = () => { },
    includeMeals = true,
    includeLodging = true,
}) {
    const router = useRouter();
    const [activeDayTab, setActiveDayTab] = useState(0); // 0 = all days
    const [savedSuccess, setSavedSuccess] = useState(false);

    if (!plan || !plan.days) return null;

    const daysCount = plan.num_days || plan.days.length;
    const nightsCount = Math.max(0, daysCount - 1);

    // Kiểm tra ngân sách dư nhiều (> 40% tổng) và chủ yếu chỉ có vé tham quan
    const budgetLeftRatio = plan.budget_pp > 0 ? (plan.budget_left_pp / plan.budget_pp) : 0;
    const showBudgetSurplusHint = budgetLeftRatio > 0.4 && (!includeMeals || !includeLodging);

    // Label quy chuẩn ngân sách
    const budgetStandardLabel = (() => {
        const parts = ['Vé tham quan'];
        if (includeMeals) parts.push('Ăn uống');
        if (includeLodging) parts.push('Nơi nghỉ');
        return `Bao gồm: ${parts.join(', ')}`;
    })();

    // Lưu toàn bộ lịch trình AI tạo ra vào danh sách Lịch trình cá nhân (Itinerary)
    const handleSaveToItinerary = async () => {
        try {
            const start = startDateStr || new Date().toISOString().split('T')[0];
            const end = endDateStr || (() => {
                const d = new Date(start);
                d.setDate(d.getDate() + (daysCount - 1));
                return d.toISOString().split('T')[0];
            })();

            // Chuyển đổi các items của từng ngày sang định dạng Itinerary
            const daysMap = {};
            plan.days.forEach((dayData) => {
                const dayNum = dayData.day;
                const itemsList = [];

                (dayData.items || []).forEach((it, idx) => {
                    // Tạo sẵn các checklist vật dụng cho hoạt động
                    const isLodgingItem =
                        ['checkin', 'checkout', 'return', 'lodging'].includes(it.type) ||
                        Boolean(it.label && it.label.toLowerCase().includes('khách sạn'));

                    const checklists = [];
                    if (it.type === 'attraction') {
                        checklists.push(
                            { id: Date.now() + idx * 10 + 1, itemName: 'Vé tham quan / QR Code', isChecked: false },
                            { id: Date.now() + idx * 10 + 2, itemName: 'Điện thoại, sạc dự phòng & máy ảnh', isChecked: false },
                            { id: Date.now() + idx * 10 + 3, itemName: 'Mũ nón, kính râm & kem chống nắng', isChecked: false }
                        );
                    } else if (it.type === 'breakfast' || it.type === 'lunch' || it.type === 'dinner' || it.type === 'food') {
                        checklists.push(
                            { id: Date.now() + idx * 10 + 1, itemName: 'Khăn ướt / Nước rửa tay', isChecked: false },
                            { id: Date.now() + idx * 10 + 2, itemName: 'Tiền mặt hoặc ứng dụng thanh toán', isChecked: false }
                        );
                    } else if (it.type === 'checkin' || it.type === 'checkout' || isLodgingItem) {
                        checklists.push(
                            { id: Date.now() + idx * 10 + 1, itemName: 'CCCD / Hộ chiếu nhận phòng', isChecked: false },
                            { id: Date.now() + idx * 10 + 2, itemName: 'Kiểm tra hành lý & đồ đạc cá nhân', isChecked: false }
                        );
                    }

                    itemsList.push({
                        id: it.id || Date.now() + idx,
                        placeId: it.id || null,
                        destinationId: !isLodgingItem ? (it.id || null) : null,
                        lodgingId: isLodgingItem ? (it.id || null) : null,
                        name: it.name,
                        location: it.district ? `${it.district}, ${it.region || 'Đà Nẵng'}` : 'Đà Nẵng',
                        time: it.start || '08:00',
                        endTime: it.end || '10:00',
                        tag: it.label || it.type,
                        type: it.type || 'attraction',
                        priceEst: it.price_est || 0,
                        budget: it.price_est || 0,
                        checklists: checklists,
                    });
                });

                daysMap[dayNum] = itemsList;
            });

            const currentUserId = getCurrentUserId();
            const newItinerary = {
                userId: currentUserId || undefined,
                title: `Lịch trình AI Đà Nẵng ${daysCount} Ngày ${nightsCount} Đêm`,
                startDate: start,
                endDate: end,
                description: `Lịch trình tự động tối ưu hóa bởi DanaGO AI với tổng chi phí ước tính ${Number(plan.total_cost_pp || 0).toLocaleString('vi-VN')} đ/người.`,
                coverImg: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
                budget: plan.total_cost_pp || 0,
                days: daysMap,
            };

            // 1. Lưu vào Database PostgreSQL qua API Backend
            let savedDb = null;
            try {
                savedDb = await saveItineraryFull(newItinerary);
            } catch (err) {
                console.warn('Lưu vào Database thất bại:', err);
            }

            // Gán id từ backend (nếu có)
            const finalItinerary = {
                ...newItinerary,
                id: savedDb && savedDb.id ? savedDb.id : Date.now(),
            };

            // 2. Đồng bộ thêm vào localStorage
            let existing = [];
            const savedStr = localStorage.getItem(STORAGE_KEY);
            if (savedStr) {
                try {
                    const parsed = JSON.parse(savedStr);
                    if (Array.isArray(parsed)) existing = parsed;
                } catch {
                    // Ignore
                }
            }

            const updated = [finalItinerary, ...existing];
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

            setSavedSuccess(true);
            setTimeout(() => {
                router.push('/itinerary');
            }, 1000);
        } catch (err) {
            console.error('Lỗi khi lưu lịch trình sang Itinerary:', err);
        }
    };

    const daysToDisplay = activeDayTab === 0
        ? plan.days
        : plan.days.filter((d) => d.day === activeDayTab);

    // Kiểm tra xem có ngày nào không xếp được điểm tham quan do ngân sách / tiêu chí không
    const hasEmptyDays = plan.days.some(
        (d) => !d.items || d.items.length === 0 || d.items.filter((it) => it.type === 'attraction').length === 0
    );

    return (
        <div className="space-y-6">
            {/* THÔNG BÁO NỔI BẬT NẾU CÓ NGÀY THIẾU HOẠT ĐỘNG */}
            {hasEmptyDays && (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-900 space-y-2.5 shadow-xs">
                    <div className="flex items-center gap-2 font-bold text-sm text-rose-800">
                        <AlertTriangle className="text-rose-600 w-5 h-5 shrink-0" />
                        <span>Có ngày chưa thể xếp lịch tham quan do ngân sách quá ít hoặc tiêu chí quá chặt!</span>
                    </div>
                    <p className="text-xs text-rose-700 leading-relaxed">
                        Ngân sách hiện tại không đủ để chi trả cho các điểm tham quan hoặc nơi nghỉ trong ngày này. Bạn hãy thử <strong>tăng ngân sách</strong>, hoặc <strong>tắt tùy chọn ăn uống / nơi lưu trú để tự túc (giảm chi phí)</strong>, hoặc chọn <strong>"Tất cả khu vực"</strong> để AI có thể tự do lên lịch tối ưu.
                    </p>
                    <div className="pt-1">
                        <button
                            type="button"
                            onClick={onReset}
                            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-bold rounded-xl transition-all inline-flex items-center gap-2 cursor-pointer shadow-xs"
                        >
                            <RotateCcw size={14} />
                            Điều chỉnh & Tạo lại lịch trình
                        </button>
                    </div>
                </div>
            )}

            {/* Thanh tổng quan & Thống kê tài chính */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
                    <div>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 mb-1">
                            <CheckCircle2 size={13} />
                            AI Đã Tạo Lịch Trình Tối Ưu
                        </div>
                        <h2 className="text-xl font-black text-gray-900">
                            Chuyến Đi {daysCount} Ngày {nightsCount > 0 ? `${nightsCount} Đêm` : ''}
                        </h2>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={onReset}
                            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors flex items-center gap-1.5"
                        >
                            <RotateCcw size={13} />
                            Đổi thông số
                        </button>
                        <button
                            type="button"
                            onClick={handleSaveToItinerary}
                            disabled={savedSuccess}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 ${savedSuccess
                                ? 'bg-emerald-600 text-white'
                                : 'bg-[#006971] hover:bg-[#00555c] text-white active:scale-95'
                                }`}
                        >
                            <Save size={14} />
                            {savedSuccess ? 'Đang chuyển sang Lịch trình...' : 'Lưu & Xem trong Lịch trình'}
                        </button>
                    </div>
                </div>

                {/* Grid thẻ tài chính */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <span className="text-2xs text-gray-500 font-medium block mb-1">Tổng chi phí dự tính / người</span>
                        <span className="text-base font-bold text-[#006971]">
                            {Number(plan.total_cost_pp || 0).toLocaleString('vi-VN')} đ
                        </span>
                    </div>
                    <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100">
                        <span className="text-2xs text-emerald-700 font-medium block mb-1">Ngân sách còn lại / người</span>
                        <span className="text-base font-bold text-emerald-700">
                            {Number(plan.budget_left_pp || 0).toLocaleString('vi-VN')} đ
                        </span>
                    </div>
                    <div className="p-3 bg-teal-50/40 rounded-xl border border-teal-100 col-span-2 sm:col-span-1">
                        <span className="text-2xs text-teal-800 font-medium block mb-1">Quy chuẩn ngân sách</span>
                        <span className="text-xs font-semibold text-teal-900 block truncate">
                            {budgetStandardLabel}
                        </span>
                    </div>
                </div>

                {/* Gợi ý khi ngân sách dư nhiều do tắt meals/lodging */}
                {showBudgetSurplusHint && (
                    <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-xs text-blue-800 flex gap-2 items-start">
                        <span className="text-lg leading-none">💡</span>
                        <div>
                            <span className="font-bold">Ngân sách còn dư nhiều!</span> Bạn đang tự túc{!includeMeals ? ' ăn uống' : ''}{!includeLodging ? ' & nơi nghỉ' : ''}. AI đã ưu tiên chọn các địa điểm <strong>trải nghiệm premium</strong> (vé có phí) để tận dụng ngân sách. Bạn cũng có thể{' '}
                            <button type="button" onClick={onReset} className="underline font-semibold hover:text-blue-600">
                                bật lại tùy chọn ăn uống / nơi nghỉ
                            </button>{' '}để AI lên lịch đầy đủ hơn.
                        </div>
                    </div>
                )}

                {/* Cảnh báo từ thuật toán (nếu có) */}
                {plan.warnings && plan.warnings.length > 0 && (
                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 space-y-1">
                        <div className="flex items-center gap-1.5 font-bold">
                            <AlertTriangle size={14} className="text-amber-600" />
                            Ghi chú từ AI:
                        </div>
                        <ul className="list-disc pl-5 space-y-0.5 text-2xs">
                            {plan.warnings.map((w, i) => (
                                <li key={i}>{w}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            {/* Tabs chọn ngày */}
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
                <button
                    type="button"
                    onClick={() => setActiveDayTab(0)}
                    className={`px-4 py-2 rounded-xl font-bold whitespace-nowrap transition-all ${activeDayTab === 0
                        ? 'bg-[#006971] text-white shadow-xs'
                        : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
                        }`}
                >
                    Toàn bộ chuyến đi ({daysCount} ngày)
                </button>
                {plan.days.map((d) => (
                    <button
                        key={d.day}
                        type="button"
                        onClick={() => setActiveDayTab(d.day)}
                        className={`px-4 py-2 rounded-xl font-bold whitespace-nowrap transition-all ${activeDayTab === d.day
                            ? 'bg-[#006971] text-white shadow-xs'
                            : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
                            }`}
                    >
                        Ngày {d.day} ({d.region || 'Đà Nẵng'})
                    </button>
                ))}
            </div>

            {/* Chi tiết từng ngày */}
            <div className="space-y-6">
                {daysToDisplay.map((dayData) => (
                    <div
                        key={dayData.day}
                        className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden"
                    >
                        {/* Header ngày */}
                        <div className="px-5 py-3.5 bg-gradient-to-r from-gray-50 to-teal-50/30 border-b border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="w-7 h-7 rounded-lg bg-[#006971] text-white flex items-center justify-center font-bold text-xs">
                                    {dayData.day}
                                </span>
                                <div>
                                    <h3 className="font-bold text-gray-900 text-sm">
                                        Ngày {dayData.day} • {dayData.region || 'Đà Nẵng'}
                                    </h3>
                                    <span className="text-2xs text-gray-500">
                                        Chi phí trong ngày: ~{Number(dayData.cost_pp || 0).toLocaleString('vi-VN')} đ/người
                                    </span>
                                </div>
                            </div>

                            {dayData.night && (
                                <div className="text-2xs text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200 flex items-center gap-1 font-semibold">
                                    <Hotel size={12} />
                                    <span>Nơi nghỉ: {dayData.night.name}</span>
                                </div>
                            )}
                        </div>

                        {/* Timeline các hoạt động */}
                        <div className="p-5 space-y-4">
                            {
                                !dayData.items || dayData.items.length === 0 ? (
                                    <div className="p-6 bg-rose-50/50 border border-dashed border-rose-200 rounded-2xl text-center space-y-2.5">
                                        <AlertTriangle className="mx-auto text-rose-500 w-7 h-7" />
                                        <h4 className="text-xs font-bold text-rose-800">Không thể xếp lịch khả thi cho ngày này</h4>
                                        <p className="text-2xs text-rose-600 max-w-sm mx-auto">
                                            Ngân sách không đủ hoặc các tiêu chí quá chặt. Bạn vui lòng tăng ngân sách hoặc chuyển sang hình thức tự túc ăn uống / nơi ở để AI xếp đủ lịch.
                                        </p>
                                        <button
                                            type="button"
                                            onClick={onReset}
                                            className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-2xs font-bold rounded-xl transition-all cursor-pointer shadow-xs inline-flex items-center gap-1.5"
                                        >
                                            <RotateCcw size={12} />
                                            Đổi thông số & Tạo lại
                                        </button>
                                    </div>
                                ) : (
                                    <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-gray-200">
                                        {(dayData.items || []).map((item, idx) => {
                                            const isMeal = item.type === 'breakfast' || item.type === 'lunch' || item.type === 'dinner';
                                            const isHotel = item.type === 'checkin' || item.type === 'checkout' || item.type === 'return';

                                            return (
                                                <div key={idx} className="relative group">
                                                    {/* Node icon trên timeline */}
                                                    <span
                                                        className={`absolute -left-6 top-1.5 w-5 h-5 rounded-full border-2 border-white shadow-xs flex items-center justify-center text-white text-2xs font-bold ${isHotel
                                                            ? 'bg-purple-600'
                                                            : isMeal
                                                                ? 'bg-amber-500'
                                                                : 'bg-[#006971]'
                                                            }`}
                                                    >
                                                        {isHotel ? '🏨' : isMeal ? '🍽️' : idx + 1}
                                                    </span>

                                                    {/* Thẻ hoạt động */}
                                                    <div className="p-3.5 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:border-gray-200 hover:shadow-xs transition-all space-y-1.5">
                                                        <div className="flex items-center justify-between gap-2">
                                                            <span className="text-xs font-bold text-[#006971] flex items-center gap-1">
                                                                <Clock size={12} />
                                                                {item.start} - {item.end}
                                                            </span>
                                                            <span className="px-2 py-0.5 rounded text-2xs font-semibold bg-white border border-gray-200 text-gray-700">
                                                                {item.label || item.type}
                                                            </span>
                                                        </div>

                                                        <div className="font-bold text-gray-900 text-sm">
                                                            {item.name}
                                                        </div>

                                                        <div className="flex flex-wrap items-center justify-between gap-2 text-2xs text-gray-500 pt-1 border-t border-gray-100">
                                                            <span className="flex items-center gap-1">
                                                                <MapPin size={11} className="text-[#006971]" />
                                                                {item.district ? `${item.district}, ${item.region || ''}` : 'Đà Nẵng'}
                                                            </span>
                                                            {item.price_est > 0 ? (
                                                                <span className="text-amber-700 font-bold">
                                                                    ~{item.price_est.toLocaleString('vi-VN')} đ/người
                                                                </span>
                                                            ) : (
                                                                <span className="text-gray-400">
                                                                    {item.price_text || 'Miễn phí'}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                            {/* Khối nơi nghỉ đêm */}
                            {dayData.night && (
                                <div className="mt-4 p-3.5 rounded-xl border border-purple-200 bg-purple-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-1.5 font-bold text-purple-900">
                                            <Hotel size={14} className="text-purple-600" />
                                            Nghỉ đêm tại: {dayData.night.name}
                                        </div>
                                        <div className="text-2xs text-purple-700">
                                            📍 {dayData.night.district}, {dayData.night.region} • Nhận phòng: {dayData.night.checkin} - Trả: {dayData.night.checkout}
                                        </div>
                                    </div>
                                    <div className="text-xs font-bold text-purple-900 sm:text-right">
                                        ~{Number(dayData.night.price_pp_night || 0).toLocaleString('vi-VN')} đ/người/đêm
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Action Bar dưới cùng */}
            <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs text-gray-500">
                    💡 Bạn có thể lưu lịch trình này vào tài khoản để dùng ngay tính năng Checklist hành lý và chỉnh sửa chi tiết.
                </div>
                <button
                    type="button"
                    onClick={handleSaveToItinerary}
                    disabled={savedSuccess}
                    className={`w-full sm:w-auto px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm flex items-center justify-center gap-2 ${savedSuccess
                        ? 'bg-emerald-600 text-white'
                        : 'bg-[#006971] hover:bg-[#00555c] text-white active:scale-95'
                        }`}
                >
                    <Save size={16} />
                    {savedSuccess ? 'Đang chuyển sang Lịch trình...' : 'Lưu Vào Lịch Trình Của Tôi'}
                    <ArrowRight size={15} />
                </button>
            </div>
        </div>
    );
}

