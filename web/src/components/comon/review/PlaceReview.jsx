import Rating from "../ui/Rating";
import { Clock } from "lucide-react";

export default function PlaceReview({ avataUrl, name, stars, comment, createdAt, images = [] }) {
    // 🌟 Tránh lỗi crash: Nếu user chưa có avatar thì dùng ảnh mặc định
    const displayAvatar = avataUrl || '/default-avatar.svg';

    return (
        <div className='flex flex-col border border-gray-100 p-4 rounded-xl gap-y-2.5 w-full bg-white shadow-xs'>
            <div className='flex items-start justify-between gap-2'>
                <div className='flex items-center gap-x-3'>
                    <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 border border-gray-100">
                        <img 
                            src={displayAvatar} 
                            alt={name} 
                            className="w-full h-full object-cover" 
                        />
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-800 text-sm">{name}</h4>
                        <Rating rating={stars} />
                    </div>
                </div>
                {createdAt && (
                    <div className="flex items-center gap-1 text-xs text-gray-400 shrink-0">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{new Date(createdAt).toLocaleDateString('vi-VN')}</span>
                    </div>
                )}
            </div>
            
            <p className="text-gray-600 text-sm w-full break-words leading-relaxed">{comment}</p>
            {images && images.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                    {images.map((img, idx) => {
                        const imgUrl = typeof img === 'string' ? img : img?.imageUrl;
                        if (!imgUrl) return null;
                        return (
                            <a 
                                key={idx} 
                                href={imgUrl} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200 hover:opacity-90 transition-opacity"
                            >
                                <img 
                                    src={imgUrl} 
                                    alt={`Ảnh review ${idx + 1}`} 
                                    className="w-full h-full object-cover" 
                                />
                            </a>
                        );
                    })}
                </div>
            )}
        </div>
    );
}