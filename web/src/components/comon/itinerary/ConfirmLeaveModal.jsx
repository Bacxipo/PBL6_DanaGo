'use client';

import React from 'react';
import { AlertTriangle, Save, LogOut, ArrowLeft } from 'lucide-react';

export default function ConfirmLeaveModal({ isOpen, onClose, onSaveAndLeave, onDiscardAndLeave }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200 p-6 space-y-5">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-200">
                        <AlertTriangle className="w-6 h-6 stroke-[2]" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-800">
                            Thay đổi chưa được lưu!
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Bạn đã chỉnh sửa lịch trình nhưng chưa bấm "Lưu lịch trình".
                        </p>
                    </div>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 text-xs text-slate-600 leading-relaxed">
                    Nếu bạn rời đi mà không lưu, các hoạt động vừa thêm hoặc chỉnh sửa trong lịch trình này sẽ không được cập nhật.
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold transition cursor-pointer"
                    >
                        Ở lại tiếp tục sửa
                    </button>
                    <button
                        type="button"
                        onClick={onDiscardAndLeave}
                        className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-red-600 bg-red-50 hover:bg-red-100 text-xs font-semibold transition cursor-pointer"
                    >
                        Không lưu (Bỏ qua)
                    </button>
                    <button
                        type="button"
                        onClick={onSaveAndLeave}
                        className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-white bg-[#006971] hover:bg-[#00555c] text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                        <Save className="w-4 h-4" />
                        <span>Lưu & Quay lại</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

