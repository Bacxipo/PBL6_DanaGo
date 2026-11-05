'use client';

import React, { useState, useMemo } from 'react';
import {
    CheckSquare,
    Square,
    X,
    Plus,
    Trash2,
    CheckCircle2,
    ListChecks,
    Filter,
    Clock,
    Sparkles,
    Calendar,
    ChevronDown,
    MapPin,
    Car,
    Coffee,
    Utensils,
} from 'lucide-react';

const TYPE_ICONS = {
    destination: MapPin,
    transit: Car,
    rest: Coffee,
    meal: Utensils,
    custom: Sparkles,
};

export default function ChecklistDrawer({
    isOpen,
    onClose,
    currentItinerary,
    onToggleChecklist,
    onAddChecklist,
    onDeleteChecklist,
    activeDay = 1,
}) {
    const [filter, setFilter] = useState('all'); // 'all' | 'pending' | 'completed'
    const [newItemName, setNewItemName] = useState('');
    const [selectedActivityKey, setSelectedActivityKey] = useState('');
    const [inlineInputs, setInlineInputs] = useState({});

    // Thu thập toàn bộ hoạt động theo ngày để chọn trong dropdown
    const allActivities = useMemo(() => {
        if (!currentItinerary?.days) return [];
        const result = [];
        Object.entries(currentItinerary.days).forEach(([dayKey, activities]) => {
            (activities || []).forEach((act) => {
                result.push({
                    dayId: dayKey,
                    activityId: act.id,
                    name: act.name,
                    time: act.time || '08:00',
                    type: act.type || 'destination',
                    uniqueKey: `${dayKey}-${act.id}`,
                });
            });
        });
        return result;
    }, [currentItinerary]);

    // Thu thập tất cả các checklist items từ tất cả các ngày
    const allChecklistItems = useMemo(() => {
        if (!currentItinerary?.days) return [];
        const items = [];
        Object.entries(currentItinerary.days).forEach(([dayKey, activities]) => {
            (activities || []).forEach((act) => {
                (act.checklists || []).forEach((chk) => {
                    items.push({
                        id: chk.id,
                        itemName: chk.itemName,
                        isChecked: Boolean(chk.isChecked),
                        dayId: dayKey,
                        activityId: act.id,
                        activityName: act.name,
                        activityTime: act.time || '08:00',
                        activityType: act.type || 'destination',
                    });
                });
            });
        });
        return items;
    }, [currentItinerary]);

    const totalCount = allChecklistItems.length;
    const completedCount = allChecklistItems.filter((i) => i.isChecked).length;
    const pendingCount = totalCount - completedCount;
    const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    // Lọc theo tab
    const filteredItems = useMemo(() => {
        if (filter === 'pending') return allChecklistItems.filter((i) => !i.isChecked);
        if (filter === 'completed') return allChecklistItems.filter((i) => i.isChecked);
        return allChecklistItems;
    }, [allChecklistItems, filter]);

    // Nhóm các items theo hoạt động để hiển thị có tổ chức
    const groupedByActivity = useMemo(() => {
        const groups = {};
        filteredItems.forEach((item) => {
            const groupKey = `${item.dayId}-${item.activityId}`;
            if (!groups[groupKey]) {
                groups[groupKey] = {
                    dayId: item.dayId,
                    activityId: item.activityId,
                    activityName: item.activityName,
                    activityTime: item.activityTime,
                    activityType: item.activityType,
                    items: [],
                };
            }
            groups[groupKey].items.push(item);
        });
        return Object.values(groups);
    }, [filteredItems]);

    // Xử lý thêm nhanh ở đầu drawer
    const handleAddQuick = (e) => {
        e.preventDefault();
        if (!newItemName.trim()) return;

        let targetDayId = activeDay;
        let targetActId = null;

        if (selectedActivityKey) {
            const [dId, aId] = selectedActivityKey.split('-');
            targetDayId = dId;
            targetActId = aId;
        } else if (allActivities.length > 0) {
            targetDayId = allActivities[0].dayId;
            targetActId = allActivities[0].activityId;
        }

        if (targetActId && onAddChecklist) {
            onAddChecklist(targetDayId, targetActId, newItemName.trim());
            setNewItemName('');
        }
    };

    // Xử lý thêm inline trong từng hoạt động
    const handleAddInline = (dayId, activityId) => {
        const key = `${dayId}-${activityId}`;
        const val = inlineInputs[key] || '';
        if (!val.trim()) return;

        if (onAddChecklist) {
            onAddChecklist(dayId, activityId, val.trim());
            setInlineInputs((prev) => ({ ...prev, [key]: '' }));
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
            {/* Backdrop mờ */}
            <div
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300"
                onClick={onClose}
            />

            {/* Panel trượt từ phải sang */}
            <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300 ease-out">
                {/* Header Panel */}
                <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-teal-800 to-[#006971] text-white">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-md">
                            <ListChecks className="w-5 h-5 text-amber-300 stroke-[2.2]" />
                        </div>
                        <div>
                            <h2 className="font-bold text-base sm:text-lg flex items-center gap-2">
                                <span>Checklist Hành Lý</span>
                            </h2>
                            <p className="text-2xs text-teal-100 font-medium">
                                Kiểm tra vật dụng cần mang cho từng hoạt động
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2 text-white/80 hover:text-white hover:bg-white/15 rounded-xl transition cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Thanh tiến độ chuẩn bị (Progress Bar) */}
                <div className="p-4 bg-teal-50/60 border-b border-teal-100/70">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1.5">
                        <span className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            Tiến độ chuẩn bị:
                        </span>
                        <span className="text-[#006971] font-bold">
                            {completedCount}/{totalCount} ({percent}%)
                        </span>
                    </div>
                    <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                        <div
                            className="bg-gradient-to-r from-teal-500 to-emerald-500 h-full rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${percent}%` }}
                        />
                    </div>
                    {percent === 100 && totalCount > 0 && (
                        <div className="mt-2 text-2xs font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-lg text-center animate-in fade-in">
                            🎉 Tuyệt vời! Bạn đã chuẩn bị đầy đủ tất cả vật dụng!
                        </div>
                    )}
                </div>

                {/* Bộ lọc Tab (Tất cả, Chưa mang, Đã mang) */}
                <div className="px-4 pt-3 pb-2 flex items-center gap-2 border-b border-slate-100 bg-slate-50/50">
                    <button
                        type="button"
                        onClick={() => setFilter('all')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                            filter === 'all'
                                ? 'bg-[#006971] text-white shadow-2xs'
                                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                        }`}
                    >
                        Tất cả ({totalCount})
                    </button>
                    <button
                        type="button"
                        onClick={() => setFilter('pending')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                            filter === 'pending'
                                ? 'bg-amber-600 text-white shadow-2xs'
                                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                        }`}
                    >
                        Chưa đem ({pendingCount})
                    </button>
                    <button
                        type="button"
                        onClick={() => setFilter('completed')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                            filter === 'completed'
                                ? 'bg-emerald-600 text-white shadow-2xs'
                                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                        }`}
                    >
                        Đã đem ({completedCount})
                    </button>
                </div>

                {/* Ô Thêm nhanh vật dụng */}
                {allActivities.length > 0 && (
                    <form onSubmit={handleAddQuick} className="p-3 bg-white border-b border-slate-100 space-y-2">
                        <div className="text-2xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                            <Plus className="w-3 h-3 text-[#006971]" />
                            <span>Thêm nhanh vật dụng vào hoạt động:</span>
                        </div>
                        <div className="flex gap-2">
                            <select
                                value={selectedActivityKey || (allActivities[0]?.uniqueKey || '')}
                                onChange={(e) => setSelectedActivityKey(e.target.value)}
                                className="w-1/2 px-2.5 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#006971]/30 truncate cursor-pointer"
                            >
                                {allActivities.map((act) => (
                                    <option key={act.uniqueKey} value={act.uniqueKey}>
                                        N{act.dayId} ({act.time}): {act.name}
                                    </option>
                                ))}
                            </select>
                            <input
                                type="text"
                                placeholder="Tên vật dụng (VD: Áo bơi, CCCD...)"
                                value={newItemName}
                                onChange={(e) => setNewItemName(e.target.value)}
                                className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#006971]/30"
                            />
                            <button
                                type="submit"
                                disabled={!newItemName.trim()}
                                className="px-3.5 py-2 bg-[#006971] hover:bg-[#00555c] disabled:opacity-40 text-white text-xs font-bold rounded-xl transition cursor-pointer shrink-0"
                            >
                                Thêm
                            </button>
                        </div>
                    </form>
                )}

                {/* Danh sách các vật dụng theo từng hoạt động */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {groupedByActivity.length === 0 ? (
                        <div className="py-12 text-center text-slate-400 space-y-3">
                            <div className="w-14 h-14 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                <CheckSquare className="w-7 h-7 stroke-[1.5]" />
                            </div>
                            <div className="text-sm font-semibold text-slate-600">
                                {filter === 'completed'
                                    ? 'Chưa có vật dụng nào được đánh dấu đã đem.'
                                    : filter === 'pending'
                                    ? 'Đã đem đủ các vật dụng theo yêu cầu!'
                                    : 'Chưa có vật dụng nào trong lịch trình.'}
                            </div>
                            <p className="text-xs text-slate-400 max-w-xs mx-auto">
                                Bạn có thể gán các vật dụng cần chuẩn bị trực tiếp trong từng thẻ hoạt động trên dòng thời gian.
                            </p>
                        </div>
                    ) : (
                        groupedByActivity.map((group) => {
                            const IconComp = TYPE_ICONS[group.activityType] || MapPin;
                            const isAllDone = group.items.every((it) => it.isChecked);

                            return (
                                <div
                                    key={`${group.dayId}-${group.activityId}`}
                                    className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden"
                                >
                                    {/* Tiêu đề hoạt động */}
                                    <div className="px-3.5 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <span className="text-2xs font-extrabold px-2 py-0.5 rounded-md bg-[#006971]/10 text-[#006971] shrink-0">
                                                Ngày {group.dayId}
                                            </span>
                                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 truncate">
                                                <IconComp className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                                <span className="truncate">{group.activityName}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <span className="text-2xs font-semibold text-slate-500 flex items-center gap-1">
                                                <Clock className="w-3 h-3 text-slate-400" />
                                                {group.activityTime}
                                            </span>
                                            {isAllDone && (
                                                <span className="text-2xs text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-bold">
                                                    Xong
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Danh sách items của hoạt động này */}
                                    <div className="p-3 divide-y divide-slate-100 space-y-1">
                                        {group.items.map((item) => (
                                            <div
                                                key={item.id}
                                                className="pt-2 first:pt-0 flex items-center justify-between gap-2 group/item hover:bg-slate-50/80 -mx-1 px-1.5 py-1 rounded-lg transition"
                                            >
                                                {/* Checkbox & Tên */}
                                                <label className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0">
                                                    <input
                                                        type="checkbox"
                                                        checked={item.isChecked}
                                                        onChange={() =>
                                                            onToggleChecklist(
                                                                group.dayId,
                                                                group.activityId,
                                                                item.id
                                                            )
                                                        }
                                                        className="w-4 h-4 rounded text-[#006971] accent-[#006971] focus:ring-[#006971] cursor-pointer"
                                                    />
                                                    <span
                                                        className={`text-xs select-none transition-colors truncate ${
                                                            item.isChecked
                                                                ? 'line-through text-slate-400'
                                                                : 'text-slate-800 font-medium'
                                                        }`}
                                                    >
                                                        {item.itemName}
                                                    </span>
                                                </label>

                                                {/* Nút xóa item */}
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        onDeleteChecklist(
                                                            group.dayId,
                                                            group.activityId,
                                                            item.id
                                                        )
                                                    }
                                                    className="opacity-0 group-hover/item:opacity-100 p-1 text-slate-300 hover:text-red-500 rounded transition cursor-pointer"
                                                    title="Xóa vật dụng này"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Inline Add nhanh vào hoạt động này */}
                                    <div className="px-3 pb-3 pt-1 border-t border-slate-50 flex items-center gap-1.5">
                                        <input
                                            type="text"
                                            placeholder="+ Thêm vật dụng khác..."
                                            value={inlineInputs[`${group.dayId}-${group.activityId}`] || ''}
                                            onChange={(e) =>
                                                setInlineInputs((prev) => ({
                                                    ...prev,
                                                    [`${group.dayId}-${group.activityId}`]: e.target.value,
                                                }))
                                            }
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    handleAddInline(group.dayId, group.activityId);
                                                }
                                            }}
                                            className="flex-1 px-2.5 py-1.5 text-2xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#006971]"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleAddInline(group.dayId, group.activityId)}
                                            className="px-2.5 py-1.5 bg-slate-100 hover:bg-[#006971] hover:text-white text-slate-700 text-2xs font-bold rounded-lg transition cursor-pointer"
                                        >
                                            Thêm
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Footer Drawer */}
                <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs">
                    <span className="text-slate-500 text-2xs">
                        Đồng bộ tự động cùng lịch trình
                    </span>
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs transition cursor-pointer"
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
}

