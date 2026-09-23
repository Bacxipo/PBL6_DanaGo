import { Compass } from 'lucide-react';

export default function DayColumnEmpty({ onExplore }) {
    return (
        <div className="border-2 border-dashed border-slate-200/80 rounded-3xl p-8 flex flex-col items-center justify-center text-center min-h-[380px] bg-slate-50/30">
            <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                <Compass className="w-7 h-7 stroke-[1.5]" />
            </div>
            <p className="text-slate-500 text-sm font-medium mb-4">
                Chưa có lịch trình cho ngày này
            </p>
            <button 
                onClick={onExplore}
                className="px-5 py-2.5 bg-[#006971]/90 hover:bg-[#006971] text-white text-sm font-semibold rounded-xl shadow-xs transition cursor-pointer"
            >
                Khám phá ngay
            </button>
        </div>
    );
}
