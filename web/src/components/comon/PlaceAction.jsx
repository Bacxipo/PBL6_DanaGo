import {Clock,Ticket,Car,Plus,Heart} from "lucide-react";

export default function PlaceAction({ time, price, move }) {
    return (
        <div className="bg-white rounded-xl p-4 shadow-xl/20 ml-4 border border-gray-300 w-1/3 flex flex-col">
            <div className="flex gap-3 mb-4">
                <Clock className="w-5 h-5 text-[#006971] shrink-0" />
                <div>
                    <h3 className="font-bold text-sm text-gray-800">
                        Giờ mở cửa
                    </h3>

                    <p className="text-xs text-gray-500 mt-1">
                        {time}
                    </p>
                </div>
            </div>
            <div className="flex gap-3 mb-4">
                <Ticket className="w-5 h-5 text-[#006971] shrink-0" />

                <div>
                    <h3 className="font-bold text-sm text-gray-800">
                        Giá vé
                    </h3>

                    <p className="text-xs text-gray-500 mt-1">
                        {price}
                    </p>
                </div>
            </div>
            <div className="flex gap-3">
                <Car className="w-5 h-5 text-[#006971] shrink-0" />

                <div>
                    <h3 className="font-bold text-sm text-gray-800">
                        Phương tiện di chuyển
                    </h3>

                    <p className="text-xs text-gray-500 mt-1">
                        {move}
                    </p>
                </div>
            </div>
            <button
                type="button"
                className="w-full mt-5 flex items-center justify-center gap-2 bg-[#006971] text-white py-2 rounded-lg font-bold text-sm cursor-pointer hover:bg-[#005258] transition-colors"
            >
                <Plus className="w-4 h-4" />
                Thêm vào lịch trình
            </button>
            <button
                type="button"
                className="w-full mt-2 flex items-center justify-center gap-2 border border-gray-300 py-2 rounded-lg font-bold text-sm cursor-pointer hover:bg-gray-100 transition-colors"
            >
                <Heart className="w-4 h-4" />
                Lưu vào yêu thích
            </button>

        </div>
    );
}