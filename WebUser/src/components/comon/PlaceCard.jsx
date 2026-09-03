import { MapPin,Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import Rating from './Rating';

export default function PlaceCard({ id, name, img, des, stars, price, category, address }) {
    const content = (
        <>
            <div className="relative w-full h-48 overflow-hidden bg-gray-100">
                <img src={img} alt={name} className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 ease-out"/>
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                
                {category && (
                    <span className="absolute top-3 left-3 bg-[#006971]/85 backdrop-blur-md text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
                        {category}
                    </span>
                )}
                <Heart className="w-4 h-4 absolute top-3 right-3 text-white/80 hover:text-red-500 transition-colors cursor-pointer" />
                {price && (
                    <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-bold text-[#006971] shadow-sm">
                        {price}
                    </div>
                )}
            </div>

            <div className="p-4 flex flex-col flex-grow justify-between gap-3">
                <div>
                    <h3 className="font-bold text-base text-gray-800 group-hover:text-[#006971] transition-colors line-clamp-1">
                        {name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1.5 line-clamp-2 leading-relaxed">
                        {des}
                    </p>
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1 text-gray-500 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-[#006971] shrink-0" />
                        <span className="truncate max-w-[120px]">{address || "Đà Nẵng"}</span>
                    </div>

                    <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-md text-amber-700 font-semibold border border-amber-200/50">
                        <Rating rating = {stars}/>
                    </div>  
                </div>
            </div>
        </>
    );

    if (id) {
        return (
            <Link to={`/place/${id}`} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col justify-between cursor-pointer">
                {content}
            </Link>
        );
    }

    return (
        <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col justify-between cursor-pointer">
            {content}
        </div>
    );
}