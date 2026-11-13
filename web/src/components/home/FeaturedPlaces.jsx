'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import PlaceCard from '../comon/place/PlaceCard';
import { getFeaturedDestinations } from '@/lib/destination-api';
import heroImg from '../../assets/images/cr.jpg';
import PlaceCardSkeleton from './PlaceCardSkeleton';

export default function FeaturedPlaces({ favoriteState }) {
    const [featuredPlaces, setFeaturedPlaces] = useState([]);
    const [loadingFeatured, setLoadingFeatured] = useState(true);
    const sliderRef = useRef(null);
    const handleScrollLeft = () => {
        if (sliderRef.current) {
            sliderRef.current.scrollBy({
                left: -sliderRef.current.offsetWidth,
                behavior: 'smooth',
            });
        }
    };
    const handleScrollRight = () => {
        if (sliderRef.current) {
            sliderRef.current.scrollBy({
                left: sliderRef.current.offsetWidth,
                behavior: 'smooth',
            });
        }
    };
    useEffect(() => {
        async function fetchFeatured() {
            setLoadingFeatured(true);
            const data = await getFeaturedDestinations(6);
            setFeaturedPlaces(data);
            setLoadingFeatured(false);
        }
        fetchFeatured();
    }, []);

    return (
        <div className="w-full max-w-7xl mx-auto px-2">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#006971]">
                        Những điểm dừng đáng nhớ
                    </p>
                    <h2 className="font-bold text-2xl tracking-tight text-[#163438] md:text-3xl">
                        Địa điểm nổi tiếng
                    </h2>
                </div>
                {featuredPlaces.length > 4 && (
                    <div className="hidden sm:flex items-center gap-2">
                        <button
                            onClick={handleScrollLeft}
                            className="p-2 rounded-full border border-gray-200 hover:bg-gray-100 transition shadow-sm cursor-pointer bg-white"
                            title="Xem trước đó"
                        >
                            <ChevronLeft className="w-5 h-5 text-gray-700" />
                        </button>
                        <button
                            onClick={handleScrollRight}
                            className="p-2 rounded-full border border-gray-200 hover:bg-gray-100 transition shadow-sm cursor-pointer bg-white"
                            title="Xem tiếp theo"
                        >
                            <ChevronRight className="w-5 h-5 text-gray-700" />
                        </button>
                    </div>
                )}
            </div>

            {loadingFeatured ? (
                <PlaceCardSkeleton label="Đang tải địa điểm nổi bật…" />
            ) : featuredPlaces.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                    Chưa có địa điểm nổi bật nào.
                </div>
            ) : (
                /* Container vuốt ngang: Mỗi màn hình desktop chia đúng 4 card, mobile chia 1.2 card */
                <div
                    ref={sliderRef}
                    className="flex gap-6 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory scroll-smooth no-scrollbar"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {featuredPlaces.map((place) => {
                        const mainImg =
                            place.images?.find((img) => img.isPrimary)
                                ?.imageUrl ||
                            place.images?.[0]?.imageUrl ||
                            place.images?.[0]?.url ||
                            heroImg;

                        return (
                            <div
                                key={place.id}
                                className="w-[280px] sm:w-[calc(50%-12px)] lg:w-[calc(25%-18px)] flex-shrink-0 snap-start"
                            >
                                <PlaceCard
                                    favoriteState={favoriteState}
                                    key={place.id}
                                    id={place.id}
                                    name={place.name}
                                    img={mainImg}
                                    des={place.description}
                                    stars={place.avgRating}
                                    price={place.ticketPrice || 'Miễn phí'}
                                    category={
                                        place.categoryName ||
                                        place.category?.name
                                    }
                                    address={place.district}
                                    isFeatured={place.isFeatured}
                                />
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
