'use client';

import React, { useState, useMemo } from 'react';
import {
    Plus,
    Clock,
    Car,
    Coffee,
    Utensils,
    Sparkles,
    Compass,
    MapPin,
    CheckSquare,
    CheckCircle2,
    ListChecks,
    ExternalLink,
    Trash2,
} from 'lucide-react';
import ItineraryHeader from './ItineraryHeader';
import DayTabsNav from './DayTabsNav';
import TimelineTreeItem from './TimelineTreeItem';
import AddActivityModal from './AddActivityModal';
import ChecklistDrawer from './ChecklistDrawer';

export default function ItineraryEditorView({
    currentItinerary,
    daysList = [],
    activeDay,
    setActiveDay,
    activeDayPlaces = [],
    quickSearchPlacesData = [],
    hasUnsavedChanges = false,
    onSave,
    onBackToList,
    onEditInfo,
    onDeletePlace,
    onUpdateTime,
    onAddPlace,
    onAddCustomActivity,
    onToggleChecklist,
    onAddChecklist,
    onDeleteChecklist,
}) {
    const [isAddActivityOpen, setIsAddActivityOpen] = useState(false);
    const [isChecklistDrawerOpen, setIsChecklistDrawerOpen] = useState(false);
    const [quickWidgetInput, setQuickWidgetInput] = useState('');

    if (!currentItinerary) return null;

    // Sắp xếp các hoạt động trong ngày theo thứ tự thời gian tăng dần
    const sortedPlaces = [...activeDayPlaces].sort((a, b) =>
        (a.time || '00:00').localeCompare(b.time || '00:00')
    );

    // Tính toán giờ mặc định cho hoạt động tiếp theo
    const getNextDefaultTime = () => {
        if (sortedPlaces.length === 0) return '08:00';
        const lastTime = sortedPlaces[sortedPlaces.length - 1].time || '08:00';
        const [h, m] = lastTime.split(':').map(Number);
        const nextHour = Math.min(23, (h || 8) + 2);
        return `${String(nextHour).padStart(2, '0')}:${String(m || 0).padStart(2, '0')}`;
    };

    // Thu thập tất cả các checklist items từ tất cả các hoạt động để tính toán tiến độ
    const allChecklistItems = useMemo(() => {
        if (!currentItinerary?.days) return [];
                const items = [];
        Object.entries(currentItinerary.days).forEach(([dayKey, activities]) => {
                    (activities || []).forEach((act) => {
                        (act.checklists || []).forEach((chk) => {
                            items.push({
                                ...chk,
                                dayId: dayKey,
                                activityId: act.id,
                                activityName: act.name,
                                activityTime: act.time || '08:00',
                            });
                        });
                    });
        });
                return items;
    }, [currentItinerary]);

                const totalChecklistCount = allChecklistItems.length;
    const completedChecklistCount = allChecklistItems.filter((i) => i.isChecked).length;
                const percent =
        totalChecklistCount > 0
                ? Math.round((completedChecklistCount / totalChecklistCount) * 100)
                : 0;

    // Nhóm theo hoạt động cho view nhỏ bên cạnh
    const activitiesWithChecklist = useMemo(() => {
        if (!currentItinerary?.days) return [];
                        const result = [];
        Object.entries(currentItinerary.days).forEach(([dayKey, activities]) => {
                            (activities || []).forEach((act) => {
                                if (act.checklists && act.checklists.length > 0) {
                                    result.push({
                                        dayId: dayKey,
                                        activityId: act.id,
                                        activityName: act.name,
                                        activityTime: act.time || '08:00',
                                        checklists: act.checklists,
                                    });
                                }
                            });
        });
                        return result;
    }, [currentItinerary]);

    // Xử lý thêm nhanh từ widget nhỏ
    const handleQuickWidgetAdd = (dayId, activityId) => {
        if (!quickWidgetInput.trim()) return;
                    if (onAddChecklist) {
                        onAddChecklist(dayId, activityId, quickWidgetInput.trim());
                    setQuickWidgetInput('');
        }
    };

                    return (
                    <div className="w-full bg-slate-50/50 p-3 sm:p-6 lg:p-8 rounded-3xl min-h-screen">
                        <div className="max-w-7xl mx-auto flex flex-col xl:flex-row gap-6 items-start">
                            {/* ================= CỘT TRÁI: DÒNG THỜI GIAN TIMELINE TREE ================= */}
                            <div className="flex-1 min-w-0 w-full space-y-6">
                                <ItineraryHeader
                                    title={currentItinerary.title}
                                    startDate={currentItinerary.startDate}
                                    endDate={currentItinerary.endDate}
                                    hasUnsavedChanges={hasUnsavedChanges}
                                    onSave={onSave}
                                    onBackToList={onBackToList}
                                    onEditInfo={onEditInfo}
                                    onToggleChecklist={() => setIsChecklistDrawerOpen(true)}
                                    totalChecklistCount={totalChecklistCount}
                                    completedChecklistCount={completedChecklistCount}
                                />

                                                {/* Thanh chuyển ngày */}
                                                <DayTabsNav
                                                    days={daysList}
                                                    activeDay={activeDay}
                                                    onSelectDay={setActiveDay}
                                                />

                                                {/* Tiêu đề ngày & Nút Thêm hoạt động chính */}
                                                <div className="space-y-4">
                                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs">
                                                        <div>
                                                            <h3 className="font-bold text-slate-800 text-base sm:text-lg flex items-center gap-2">
                                                                <Clock className="w-5 h-5 text-[#006971]" />
                                                                <span>
                                                                    Dòng thời gian {daysList.find((d) => d.id === activeDay)?.title || `Ngày ${activeDay}`}
                                                                </span>
                                                            </h3>
                                                            <p className="text-xs text-slate-500 mt-0.5">
                                                                {sortedPlaces.length} hoạt động được sắp xếp theo khung giờ từ sáng đến tối
                                                            </p>
                                                        </div>

                                                        {/* NÚT THÊM HOẠT ĐỘNG TO ĐẸP */}
                                                        <button
                                                            type="button"
                                                            onClick={() => setIsAddActivityOpen(true)}
                                                            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#006971] hover:bg-[#00555c] active:scale-95 text-white text-xs sm:text-sm font-bold shadow-sm transition-all cursor-pointer shrink-0"
                                                        >
                                                            <Plus className="w-4 h-4 stroke-[2.5]" />
                                                            <span>Thêm hoạt động</span>
                                                        </button>
                                                    </div>

                                                            {/* Thanh phím tắt thêm nhanh */}
                                                            <div className="flex flex-wrap items-center gap-2 px-1">
                                                                <span className="text-2xs font-semibold text-slate-400 uppercase tracking-wider">
                                                                    Thêm nhanh:
                                                                </span>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setIsAddActivityOpen(true)}
                                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white hover:bg-teal-50 text-[#006971] border border-teal-200 shadow-2xs transition cursor-pointer"
                                                                >
                                                                    <MapPin className="w-3.5 h-3.5 text-[#006971]" />
                                                                    <span>+ Điểm tham quan / Ăn uống</span>
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setIsAddActivityOpen(true)}
                                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white hover:bg-sky-50 text-sky-700 border border-sky-200 shadow-2xs transition cursor-pointer"
                                                                >
                                                                    <Car className="w-3.5 h-3.5 text-sky-600" />
                                                                    <span>+ Di chuyển</span>
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setIsAddActivityOpen(true)}
                                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white hover:bg-purple-50 text-purple-700 border border-purple-200 shadow-2xs transition cursor-pointer"
                                                                >
                                                                    <Coffee className="w-3.5 h-3.5 text-purple-600" />
                                                                    <span>+ Nghỉ ngơi</span>
                                                                </button>
                                                            </div>

                                                            {/* DÒNG THỜI GIAN DẠNG CÂY (TREE VIEW) */}
                                                            {sortedPlaces.length === 0 ? (
                                                                <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-10 text-center flex flex-col items-center justify-center min-h-[360px] space-y-4">
                                                                    <div className="w-16 h-16 rounded-full bg-teal-50 text-[#006971] flex items-center justify-center border border-teal-100">
                                                                        <Compass className="w-8 h-8 stroke-[1.8]" />
                                                                    </div>
                                                                    <div className="space-y-1">
                                                                        <div className="font-bold text-slate-800 text-base">
                                                                            Chưa có hoạt động nào trong Ngày {activeDay}
                                                                        </div>
                                                                        <p className="text-slate-500 text-xs max-w-md mx-auto leading-relaxed">
                                                                            Bấm nút &quot;Thêm hoạt động&quot; để chọn các địa điểm tham quan nổi tiếng, quán ăn đặc sản, hoặc tạo ô di chuyển, nghỉ ngơi cho ngày này.
                                                                        </p>
                                                                    </div>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setIsAddActivityOpen(true)}
                                                                        className="px-5 py-2.5 bg-[#006971] text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs hover:bg-[#00555c] transition cursor-pointer flex items-center gap-2"
                                                                    >
                                                                        <Plus className="w-4 h-4 stroke-[2.5]" />
                                                                        <span>Thêm hoạt động đầu tiên</span>
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <div className="pt-4">
                                                                    {sortedPlaces.map((item, index) => (
                                                                        <TimelineTreeItem
                                                                            key={item.id}
                                                                            item={item}
                                                                            isLast={index === sortedPlaces.length - 1}
                                                                            onDelete={(id) => onDeletePlace(activeDay, id)}
                                                                            onUpdateTime={(id, newTime) => onUpdateTime(activeDay, id, newTime)}
                                                                            onToggleChecklist={(actId, chkId) =>
                                                                                onToggleChecklist(activeDay, actId, chkId)
                                                                            }
                                                                            onAddChecklist={(actId, itemName) =>
                                                                                onAddChecklist(activeDay, actId, itemName)
                                                                            }
                                                                            onDeleteChecklist={(actId, chkId) =>
                                                                                onDeleteChecklist(activeDay, actId, chkId)
                                                                            }
                                                                        />
                                                                    ))}

                                                                    {/* Nút thêm tiếp theo ở cuối cây */}
                                                                    <div className="pl-16 sm:pl-20 pt-2">
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => setIsAddActivityOpen(true)}
                                                                            className="w-full py-3.5 rounded-2xl border-2 border-dashed border-slate-200 hover:border-[#006971] bg-white hover:bg-teal-50/40 text-slate-500 hover:text-[#006971] text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                                                                        >
                                                                            <Plus className="w-4 h-4" />
                                                                            <span>Thêm hoạt động tiếp theo vào Ngày {activeDay}</span>
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* ================= CỘT PHẢI: VIEW NHỎ BÊN GIAO DIỆN HIỂN THỊ TẤT CẢ ITEM CHECKLIST ================= */}
                                                    <aside className="w-full xl:w-80 2xl:w-92 shrink-0 xl:sticky xl:top-24">
                                                        <div className="bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-5 shadow-xs space-y-4">
                                                            {/* Header View nhỏ */}
                                                            <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100">
                                                                <div className="flex items-center gap-2.5">
                                                                    <div className="w-9 h-9 rounded-xl bg-teal-50 text-[#006971] flex items-center justify-center shadow-2xs">
                                                                        <ListChecks className="w-5 h-5 stroke-[2.2]" />
                                                                    </div>
                                                                    <div>
                                                                        <h4 className="text-sm font-bold text-slate-800">
                                                                            Checklist Vật Dụng
                                                                        </h4>
                                                                        <p className="text-2xs text-slate-400">
                                                                            Tất cả hoạt động trong chuyến đi
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setIsChecklistDrawerOpen(true)}
                                                                    className="text-2xs text-[#006971] hover:text-[#004e54] font-bold px-2 py-1 rounded-lg hover:bg-teal-50 transition cursor-pointer"
                                                                >
                                                                    Xem tất cả
                                                                </button>
                                                            </div>

                                                        {/* Thanh Tiến độ */}
                                                        <div className="p-3 bg-teal-50/50 rounded-2xl border border-teal-100/70 space-y-1.5">
                                                            <div className="flex items-center justify-between text-2xs font-bold text-slate-700">
                                                                <span className="flex items-center gap-1">
                                                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                                                    Đã chuẩn bị:
                                                                </span>
                                                                <span className="text-[#006971]">
                                                                    {completedChecklistCount}/{totalChecklistCount} ({percent}%)
                                                                </span>
                                                            </div>
                                                            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                                                                <div
                                                                    className="bg-gradient-to-r from-teal-500 to-emerald-500 h-full rounded-full transition-all duration-300"
                                                                    style={{ width: `${percent}%` }}
                                                                />
                                                            </div>
                                                        </div>

                                                        {/* Danh sách các item checklist theo từng hoạt động */}
                                                        <div className="max-h-[500px] overflow-y-auto space-y-3.5 pr-1 divide-y divide-slate-100">
                                                            {activitiesWithChecklist.length === 0 ? (
                                                                <div className="py-8 text-center text-slate-400 space-y-2">
                                                                    <CheckSquare className="w-8 h-8 mx-auto text-slate-300 stroke-[1.5]" />
                                                                    <p className="text-xs font-semibold text-slate-600">
                                                                        Chưa có vật dụng nào
                                                                    </p>
                                                                    <p className="text-2xs text-slate-400 max-w-[200px] mx-auto">
                                                                        Gán vật dụng vào các thẻ hoạt động bên dòng thời gian để theo dõi đồ dùng cần mang.
                                                                    </p>
                                                                </div>
                                                            ) : (
                                                                activitiesWithChecklist.map((act) => (
                                                                    <div key={`${act.dayId}-${act.activityId}`} className="pt-3 first:pt-0 space-y-1.5">
                                                                        {/* Tiêu đề hoạt động */}
                                                                        <div className="flex items-center justify-between text-2xs font-bold text-slate-600">
                                                                            <span className="truncate flex items-center gap-1 text-slate-800">
                                                                                <span className="px-1.5 py-0.5 rounded bg-teal-100/80 text-[#006971] text-2xs">
                                                                                    N{act.dayId}
                                                                                </span>
                                                                                <span className="truncate">{act.activityName}</span>
                                                                            </span>
                                                                            <span className="text-slate-400 shrink-0">{act.activityTime}</span>
                                                                        </div>

                                                                        {/* Từng checkbox item */}
                                                                        <div className="space-y-1 pl-1">
                                                                            {act.checklists.map((chk) => (
                                                                                <label
                                                                                    key={chk.id}
                                                                                    className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-50 transition cursor-pointer text-xs"
                                                                                >
                                                                                    <input
                                                                                        type="checkbox"
                                                                                        checked={Boolean(chk.isChecked)}
                                                                                        onChange={() =>
                                                                                            onToggleChecklist(
                                                                                                act.dayId,
                                                                                                act.activityId,
                                                                                                chk.id
                                                                                            )
                                                                                        }
                                                                                        className="w-3.5 h-3.5 rounded text-[#006971] accent-[#006971] cursor-pointer"
                                                                                    />
                                                                                    <span
                                                                                        className={`truncate select-none ${chk.isChecked
                                                                                                ? 'line-through text-slate-400'
                                                                                                : 'text-slate-700 font-medium'
                                                                                            }`}
                                                                                    >
                                                                                        {chk.itemName}
                                                                                    </span>
                                                                                </label>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                ))
                                                            )}
                                                        </div>

                                                        {/* Nút mở toàn bộ Checklist */}
                                                        <button
                                                            type="button"
                                                            onClick={() => setIsChecklistDrawerOpen(true)}
                                                            className="w-full py-2.5 rounded-xl border border-teal-200 bg-teal-50/50 hover:bg-teal-100 text-[#006971] text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                                                        >
                                                            <ListChecks className="w-4 h-4" />
                                                            <span>Quản lý toàn bộ Checklist</span>
                                                        </button>
                                                </div>
                                            </aside>
                                        </div>

                                        {/* Modal Thêm hoạt động TẤT CẢ TRONG MỘT (Điểm tham quan, ăn uống, di chuyển, nghỉ ngơi) */}
                                        <AddActivityModal
                                            isOpen={isAddActivityOpen}
                                            onClose={() => setIsAddActivityOpen(false)}
                                            onAddPlace={onAddPlace}
                                            onAddCustomActivity={onAddCustomActivity}
                                            places={quickSearchPlacesData}
                                            defaultTime={getNextDefaultTime()}
                                            activeDay={activeDay}
                                        />

                                        {/* Drawer Toàn diện danh sách chuẩn bị Checklist */}
                                        <ChecklistDrawer
                                            isOpen={isChecklistDrawerOpen}
                                            onClose={() => setIsChecklistDrawerOpen(false)}
                                            currentItinerary={currentItinerary}
                                            onToggleChecklist={onToggleChecklist}
                                            onAddChecklist={onAddChecklist}
                                            onDeleteChecklist={onDeleteChecklist}
                                            activeDay={activeDay}
                                        />
                                    </div>
                                );
}
