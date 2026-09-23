import Rating from "../ui/Rating";
import { Clock } from "lucide-react";
import Image from 'next/image';

export default function PlaceReview({ avataUrl, name, stars, comment, createdAt }) {
    return(
        <div className='flex flex-col border border-gray-100 p-4 rounded-xl gap-y-2.5 w-full bg-white shadow-xs'>
            <div className='flex items-start justify-between gap-2'>
                <div className='flex items-center gap-x-3'>
                    <Image src={avataUrl} alt={name} width={40} height={40} className="rounded-full object-cover shrink-0" />
                    <div>
                        <h4 className="font-semibold text-gray-800 text-sm">{name}</h4>
                        <Rating rating={stars} />
                    </div>
                </div>
                {createdAt && (
                    <div className="flex items-center gap-1 text-xs text-gray-400 shrink-0">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{createdAt}</span>
                    </div>
                )}
            </div>
            <p className="text-gray-600 text-sm w-full break-words leading-relaxed">{comment}</p>
        </div>
    );
}
