'use client';

import React, { useState } from 'react';
import {
    MapPin,
    Trash2,
    Clock,
    Car,
    Coffee,
    Utensils,
    Sparkles,
    Navigation,
    DollarSign,
    ExternalLink,
    CheckSquare,
    Plus,
} from 'lucide-react';
import Image from 'next/image';
import TimePicker24h from './TimePicker24h';

const TYPE_CONFIGS = {
    destination: {
        label: 'Địa điểm tham quan',
        icon: MapPin,
        badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        nodeBg: 'bg-emerald-600',
        lineColor: 'border-emerald-300',
    },
    transit: {
        label: 'Di chuyển',
        icon: Car,
        badgeColor: 'bg-sky-50 text-sky-700 border-sky-200',
        nodeBg: 'bg-sky-600',
        lineColor: 'border-sky-300',
    },
    rest: {
        label: 'Nghỉ ngơi / Thư giãn',
        icon: Coffee,
        badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
        nodeBg: 'bg-purple-600',
        lineColor: 'border-purple-300',
    },
    meal: {
        label: 'Ăn uống / Cà phê',
        icon: Utensils,
        badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
        nodeBg: 'bg-amber-600',
        lineColor: 'border-amber-300',
    },
    custom: {
        label: 'Hoạt động',
        icon: Sparkles,
        badgeColor: 'bg-slate-50 text-slate-700 border-slate-200',
        nodeBg: 'bg-slate-600',
        lineColor: 'border-slate-300',
    },
};

    const getSuggestions = (item) => {
        const nameLower = (item.name || '').toLowerCase();
        const tagLower = (item.tag || '').toLowerCase();
        const type = item.type || 'destination';

        if (nameLower.includes('biển') || tagLower.includes('biển') || nameLower.includes('mỹ khê') || nameLower.includes('non nước')) {
            return ['Đồ bơi', 'Kem chống nắng', 'Khăn tắm', 'Kính râm'];
        }
        if (nameLower.includes('bà nà') || nameLower.includes('núi') || nameLower.includes('đèo') || nameLower.includes('sơn trà')) {
            return ['Áo khoác nhẹ', 'Giày thể thao', 'Vé cáp treo', 'Sạc dự phòng'];
        }
        if (type === 'transit') {
            return ['CCCD / Bằng lái', 'Mũ bảo hiểm', 'Áo mưa', 'Tiền lẻ'];
        }
        if (type === 'meal' || tagLower.includes('ẩm thực') || tagLower.includes('ăn')) {
            return ['Khăn ướt', 'Tiền mặt', 'Nước suối'];
        }
        return ['CCCD / Hộ chiếu', 'Điện thoại & Sạc', 'Kem chống nắng', 'Ô / Dù'];
    };

    export default function TimelineTreeItem({
        item,
        isLast = false,
        onDelete,
        onUpdateTime,
        onToggleChecklist,
        onAddChecklist,
        onDeleteChecklist,
    }) {
        const [newItemName, setNewItemName] = useState('');
        const itemType = item.type || 'destination';
        const config = TYPE_CONFIGS[itemType] || TYPE_CONFIGS.destination;
        const IconComponent = config.icon;

        const checklists = Array.isArray(item.checklists) ? item.checklists : [];
        const completedCount = checklists.filter((c) => c.isChecked).length;
        const suggestions = getSuggestions(item);

        const handleAdd = () => {
            if (!newItemName.trim()) return;
            if (onAddChecklist) {
                onAddChecklist(item.id, newItemName.trim());
                setNewItemName('');
            }
        };

        return (
            <div className="relative flex items-start gap-4 sm:gap-6 group">
                {/* CỘT TRÁI: DÒNG THỜI GIAN VÀ NÚT CÂY (TREE STEM & NODE) */}
                    <div className="flex flex-col items-center shrink-0 w-20 sm:w-24 pt-1">
                        {/* Khung giờ chọn theo đồng hồ / 0-23h */}
                        <TimePicker24h
                            value={item.time || '08:00'}
                            compact={true}
                            onChange={(newTime) => {
                                if (onUpdateTime) onUpdateTime(item.id, newTime);
                            }}
                        />

                            {/* Nút icon tròn trên cây */}
                <div
                            className={`mt-2 w-7 h-7 sm:w-8 sm:h-8 rounded-full ${config.nodeBg} text-white flex items-center justify-center shadow-sm z-10 ring-4 ring-white shrink-0 transition-transform group-hover:scale-110`}
                        >
                            <IconComponent className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.2]" />
                        </div>

                        {/* Đường kẻ nối dài xuống nút tiếp theo (trừ phần tử cuối cùng) */}
                        {!isLast && (
                            <div className="w-0.5 bg-gradient-to-b from-slate-300 via-slate-200 to-slate-200 h-full min-h-[70px] -mt-1" />
                        )}
                    </div>

                    {/* CỘT PHẢI: NỘI DUNG CARD CỦA HOẠT ĐỘNG */}
                    <div className="flex-1 bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all mb-6">
                        {/* Hàng trên: Nhãn loại hoạt động & Nút xóa */}
                        <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-100">
                            <span
                                className={`text-2xs font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${config.badgeColor}`}
                            >
                                <IconComponent className="w-3 h-3" />
                                {config.label}
                            </span>

                            <div className="flex items-center gap-1">
                                {itemType === 'destination' && (item.placeId || item.id) && (
                                    <a
                                        href={`/explore/place/${item.placeId || item.id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-2xs text-[#006971] hover:text-[#004e54] font-semibold py-1 px-2 rounded-lg hover:bg-teal-50 transition cursor-pointer"
                                        title="Mở trang chi tiết trong tab mới"
                                    >
                                        <span>Xem chi tiết</span>
                                        <ExternalLink className="w-3 h-3" />
                                    </a>
                                )}
                                <button
                                    type="button"
                                    onClick={() => onDelete(item.id)}
                                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                                    title="Xóa hoạt động này"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>

                                {/* Tiêu đề & Nội dung theo từng loại */}
                                <div className="space-y-2">
                                    <h4 className="text-base font-bold text-slate-900 leading-snug group-hover:text-[#006971] transition-colors">
                                        {item.name}
                                    </h4>

                    {/* 1. NẾU LÀ ĐỊA ĐIỂM THAM QUAN */}
                                        {itemType === 'destination' && (
                                            <div className="space-y-2">
                                                {item.img && (
                                                    <div className="relative w-full h-36 sm:h-44 rounded-xl overflow-hidden bg-slate-100 my-2">
                                                        <Image
                                                            src={item.img}
                                                            alt={item.name}
                                                            fill
                                                            sizes="(max-width: 768px) 100vw, 50vw"
                                                            className="object-cover"
                                                        />
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-1.5 text-xs text-slate-600">
                                                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                    <span className="line-clamp-1">{item.location || item.address || 'Đà Nẵng'}</span>
                                                </div>
                                            </div>
                    )}

                    {/* 2. NẾU LÀ Ô DI CHUYỂN */}
                                                {itemType === 'transit' && (
                                                    <div className="bg-sky-50/60 rounded-xl p-3 border border-sky-100 space-y-1.5 text-xs">
                                                        <div className="flex flex-wrap items-center gap-3 text-sky-900 font-semibold">
                                                            <span className="flex items-center gap-1">
                                                                <Car className="w-3.5 h-3.5 text-sky-600" />
                                                                Phương tiện: {item.vehicle || 'Xe máy'}
                                                            </span>
                                                            {item.duration && (
                                                                <span className="flex items-center gap-1 text-sky-700 font-normal">
                                                                    <Clock className="w-3.5 h-3.5" />
                                                                    Thời gian: {item.duration}
                                                                </span>
                                                            )}
                                                            </div>
                                                            {item.location && (
                                                                <div className="text-slate-600 flex items-center gap-1">
                                                                    <Navigation className="w-3 h-3 text-sky-500 shrink-0" />
                                                                    <span>Lộ trình: {item.location}</span>
                                                                </div>
                            )}
                                                    </div>
                                                )}

                                                            {/* 3. NẾU LÀ Ô NGHỈ NGƠI */}
                                                            {itemType === 'rest' && (
                                                                <div className="bg-purple-50/60 rounded-xl p-3 border border-purple-100 space-y-1 text-xs">
                                                                    <div className="flex items-center gap-3 text-purple-900 font-semibold">
                                                                        {item.duration && (
                                                                            <span className="flex items-center gap-1">
                                                                                <Clock className="w-3.5 h-3.5 text-purple-600" />
                                                                                Nghỉ khoảng: {item.duration}
                                                                            </span>
                                                                    )}
                                                                </div>
                                                            {item.location && (
                                                                <div className="text-slate-600 flex items-center gap-1">
                                                                    <MapPin className="w-3 h-3 text-purple-500 shrink-0" />
                                                                    <span>Địa điểm: {item.location}</span>
                                                                </div>
                                                            )}
                                                        </div>
                    )}

                    {/* 4. NẾU LÀ Ô ĂN UỐNG */}
                                                                {itemType === 'meal' && (
                                                                    <div className="bg-amber-50/60 rounded-xl p-3 border border-amber-100 space-y-1.5 text-xs">
                                                                        <div className="flex flex-wrap items-center gap-3 text-amber-900 font-semibold">
                                                                            {item.cost && (
                                                                                <span className="flex items-center gap-1 text-amber-700">
                                                                                    <DollarSign className="w-3.5 h-3.5 text-amber-600" />
                                                                                    Chi phí: {item.cost}
                                                                                </span>
                                                                            )}
                                                                            {item.duration && (
                                                                                <span className="flex items-center gap-1 font-normal text-slate-500">
                                                                                    <Clock className="w-3.5 h-3.5" />
                                                                                    {item.duration}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                        {item.location && (
                                                                            <div className="text-slate-600 flex items-center gap-1">
                                                                                <MapPin className="w-3 h-3 text-amber-500 shrink-0" />
                                                                                <span>Địa chỉ: {item.location}</span>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                )}

                                                                                {/* GHI CHÚ BỔ SUNG */}
                                                                                {item.note && (
                                                                                    <div className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-100 italic">
                                                                                        * {item.note}
                                                                                    </div>
                                                                                )}

                                                                                {/* PHẦN GÁN CHECKLIST_ITEM CHO TỪNG HOẠT ĐỘNG */}
                                                                                <div className="mt-4 pt-3.5 border-t border-slate-100">
                                                                                    <div className="flex items-center justify-between gap-2 mb-2">
                                                                                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                                                                                            <CheckSquare className="w-4 h-4 text-[#006971]" />
                                                                                            <span>Vật dụng cần chuẩn bị ({checklists.length})</span>
                                                                                        </div>
                                                                                        {checklists.length > 0 && (
                                                                                            <span
                                                                                                className={`text-2xs font-bold px-2 py-0.5 rounded-full ${completedCount === checklists.length
                                                                                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                                                                        : 'bg-teal-50 text-[#006971] border border-teal-200'
                                                                                                    }`}
                                                                                            >
                                                                                                {completedCount}/{checklists.length} đã đem
                                                                                            </span>
                                                                                        )}
                                                                                    </div>

                                                                                    {/* Danh sách items của hoạt động này */}
                                                                                    {checklists.length > 0 && (
                                                                                        <div className="space-y-1 mb-2.5">
                                                                                            {checklists.map((chk) => (
                                                                                                <div
                                                                                                    key={chk.id}
                                                                                                    className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100/80 transition group/chk text-xs border border-slate-100"
                                                                                                >
                                                                                                    <label className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0">
                                                                                                        <input
                                                                                                            type="checkbox"
                                                                                                            checked={Boolean(chk.isChecked)}
                                                                                                            onChange={() =>
                                                                                                                onToggleChecklist && onToggleChecklist(item.id, chk.id)
                                                                                                            }
                                                                                                            className="w-4 h-4 rounded text-[#006971] accent-[#006971] cursor-pointer"
                                                                                                        />
                                                                                                        <span
                                                                                                            className={`select-none truncate transition-colors ${chk.isChecked
                                                                                                                    ? 'line-through text-slate-400'
                                                                                                                    : 'text-slate-800 font-medium'
                                                                                                                }`}
                                                                                                        >
                                                                                                            {chk.itemName}
                                                                                                        </span>
                                                                                                    </label>
                                                                                                    <button
                                                                                                        type="button"
                                                                                                        onClick={() =>
                                                                                                            onDeleteChecklist && onDeleteChecklist(item.id, chk.id)
                                                                                                        }
                                                                                                        className="opacity-0 group-hover/chk:opacity-100 p-1 text-slate-300 hover:text-red-500 rounded transition cursor-pointer"
                                                                                                        title="Xóa vật dụng này"
                                                                                                    >
                                                                                                        <Trash2 className="w-3.5 h-3.5" />
                                                                                                    </button>
                                                                                                </div>
                                ))}
                                                                                        </div>
                                                                                    )}

                                                                                            {/* Input thêm checklist item mới vào hoạt động */}
                                                                                            <div className="flex items-center gap-1.5">
                                                                                                <input
                                                                                                    type="text"
                                                                                                    placeholder="+ Gán vật dụng cần mang (VD: Áo bơi, CCCD, Kem chống nắng...)"
                                                                                                    value={newItemName}
                                                                                                    onChange={(e) => setNewItemName(e.target.value)}
                                                                                                    onKeyDown={(e) => {
                                                                                                        if (e.key === 'Enter') {
                                                                                                            e.preventDefault();
                                                                                                            handleAdd();
                                                                                                        }
                                                                                                    }}
                                                                                                    className="flex-1 px-3 py-1.5 text-xs bg-slate-50/70 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#006971]"
                                                                                                />
                                                                                                <button
                                                                                                    type="button"
                                                                                                    onClick={handleAdd}
                                                                                                    disabled={!newItemName.trim()}
                                                                                                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#006971] hover:bg-[#00555c] disabled:opacity-40 text-white text-xs font-bold rounded-xl transition cursor-pointer shrink-0"
                                                                                                >
                                                                                                    <Plus className="w-3.5 h-3.5" />
                                                                                                    <span>Thêm</span>
                                                                                                </button>
                                                                                            </div>

                                                                                            {/* Gợi ý vật dụng nhanh theo ngữ cảnh */}
                                                                                            {suggestions.length > 0 && (
                                                                                                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                                                                                                    <span className="text-2xs text-slate-400 font-medium">Gợi ý nhanh:</span>
                                                                                                    {suggestions.map((sug) => {
                                                                                                        const alreadyAdded = checklists.some(
                                                                                                            (c) => (c.itemName || '').toLowerCase() === sug.toLowerCase()
                                                                                                        );
                                                                                                        if (alreadyAdded) return null;
                                                                                                        return (
                                                                                                            <button
                                                                                                                key={sug}
                                                                                                                type="button"
                                                                                                                onClick={() => onAddChecklist && onAddChecklist(item.id, sug)}
                                                                                                                className="text-2xs px-2 py-0.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-[#006971] border border-teal-200/60 transition cursor-pointer font-medium"
                                                                                                            >
                                                                                                                + {sug}
                                                                                                            </button>
                                                                                                        );
                                                                                                    })}
                                                                                                </div>
                                                                                            )}
                                                                                        </div>
                </div>
                                                                            </div>
                                                                    </div>
                                                                );
}
