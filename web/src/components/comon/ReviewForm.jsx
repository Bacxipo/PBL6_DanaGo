import { Star,Send } from "lucide-react";
export default function ReviewForm(){
    return(
        <div className ='bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4'>
            <h4 className="font-bold text-gray-800 text-lg">Viết đánh giá của bạn</h4>
            <div className = 'flex items-center gap-1'>
                {[1,2,3,4,5].map((star)=>(
                    <button key = {star} type = 'button' className ='p-1 text-gray-300 hover:text-orange-400 hover:scale-100 transition-all'>
                        <Star size = {22} className = 'fill-curent'/>
                    </button>
                ))}
            </div>
            <div>
                <label className = 'block text-sm font-medium text-gray-700 mb-1'>Bình luận</label>
                <textarea placeholder="Chia sẻ trải nghiệm của bạn..." className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006971]/30 focus:border-[#006971] text-sm resize-none"></textarea>
            </div>
            <button type="button"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#006971] hover:bg-[#005258] text-white rounded-md font-semibold text-sm transition-colors">
                <Send size = {15}/> Gửi đánh giá
            </button>
        </div>
    );
}