'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import PlaceAction from '../components/comon/place/PlaceAction';
import PlaceMap from '../components/comon/place/PlaceMap';
import { placesData, reviews } from '../database/data';
import PlaceReview from '../components/comon/review/PlaceReview';
import ReviewForm from '../components/comon/review/ReviewForm';
import { useEffect } from 'react';
import Image from 'next/image';
export default function DetailPlace({ id: propId }) {
    const params = useParams();
    const id = propId || params?.id;
    const place = placesData.find((item) => item.id === Number(id));

    useEffect(() => {
        if (typeof window !== 'undefined') {
            window.scrollTo(0, 0);
        }
    }, [id]);

    if (!place) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-bold text-gray-700">Không tìm thấy địa điểm!</h2>
            </div>
        );
    }

    return (
        <section className="w-full max-w-7xl mx-auto space-y-6 pb-12 flex flex-col">
            <Link href="/explore" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-[#006971] transition-colors">
                <ArrowLeft className="w-4 h-4" /> Quay lại
            </Link>
            <div className="flex w-full">
                <div className="w-2/3 flex flex-col">
                    <Image src={place.img} alt={place.name} width={1200} height={800} className="w-full h-full object-cover rounded-xl" />
                    <p className="text-[#006971] font-bold mt-2 text-sm">{place.category}</p>
                </div>
                <PlaceAction time={place.time} price={place.priceDisplay} move={place.move}/>
            </div>
            <div className="w-2/3 flex flex-col gap-3">
                <h2 className="text-2xl font-bold text-gray-800">{place.name}</h2>
                <p className="text-gray-600 mt-2">{place.des}</p>
                <div className="items-center gap-2 mt-3 p-3">
                    <span className="font-bold">Về địa điểm này</span>
                    <p>{place.infor}</p>
                </div>
            </div>
            <div>
                <PlaceMap mapUrl={place.mapUrl} />
            </div>
            <div className="w-full flex flex-col gap-3">
                <div className="w-2/3 flex flex-col gap-6 mt-6">
                    <ReviewForm/>
                    <h3 className="font-bold">Đánh giá từ du khách</h3>
                    <div className="flex flex-col gap-4 h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                        {reviews.map((review) => (
                            <PlaceReview
                                key={review.id}
                                avataUrl={review.avataUrl}
                                name={review.name}
                                stars={review.stars}
                                comment={review.comment}
                                createdAt={review.createdAt}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}