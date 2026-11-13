'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';

const getToday = () => new Date().toISOString().split('T')[0];
const getNextThreeDays = () => new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0];

export default function CreateItineraryModal({ isOpen, onClose, onSave, initialData = null }) {
    const [prevInitialData, setPrevInitialData] = useState(initialData);
    const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

    const [title, setTitle] = useState(initialData?.title || '');
    const [startDate, setStartDate] = useState(initialData?.startDate || getToday());
    const [endDate, setEndDate] = useState(initialData?.endDate || getNextThreeDays());
    const [description, setDescription] = useState(initialData?.description || '');
    const [error, setError] = useState('');

    if (initialData !== prevInitialData || isOpen !== prevIsOpen) {
        setPrevInitialData(initialData);
        setPrevIsOpen(isOpen);
        if (initialData) {
            setTitle(initialData.title || '');
            setStartDate(initialData.startDate || getToday());
            setEndDate(initialData.endDate || getNextThreeDays());
            setDescription(initialData.description || '');
        } else {
            setTitle('');
            setStartDate(getToday());
            setEndDate(getNextThreeDays());
            setDescription('');
        }
        setError('');
    }

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!title.trim()) {
            setError('Vui lòng nhập tên lịch trình');
            return;
        }
        if (!startDate || !endDate) {
            setError('Vui lòng chọn đầy đủ ngày bắt đầu và kết thúc');
            return;
        }
        if (new Date(startDate) > new Date(endDate)) {
            setError('Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu');
            return;
        }

        onSave({
            title: title.trim(),
            startDate,
            endDate,
            description: description.trim()
        });

        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
            <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                    <h3 className="text-xl font-bold text-slate-800">
                        {initialData ? 'Chỉnh sửa lịch trình' : 'Tạo lịch trình mới'}
                    </h3>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600 flex items-center justify-center transition"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="p-3 text-sm text-red-600 bg-red-50 rounded-xl border border-red-100">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                            Tên lịch trình <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Ví dụ: Đà Nẵng 3 Ngày 2 Đêm..."
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#006971]/30 focus:border-[#006971]"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                Ngày bắt đầu <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#006971]/30 focus:border-[#006971]"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                Ngày kết thúc <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#006971]/30 focus:border-[#006971]"
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                            Mô tả ngắn
                        </label>
                        <textarea
                            rows={3}
                            placeholder="Ghi chú thêm về chuyến đi của bạn..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#006971]/30 focus:border-[#006971]"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 rounded-xl text-slate-600 bg-slate-100 hover:bg-slate-200 text-sm font-semibold transition"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2.5 rounded-xl text-white bg-[#006971] hover:bg-[#005259] text-sm font-semibold shadow-sm transition"
                        >
                            {initialData ? 'Lưu thay đổi' : 'Tạo lịch trình'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
