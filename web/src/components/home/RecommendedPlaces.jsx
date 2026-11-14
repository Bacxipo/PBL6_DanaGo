'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import PlaceCard from '../comon/place/PlaceCard';
import { getRecommendedDestinations } from '@/lib/recommendation-api';
import PlaceCardSkeleton from './PlaceCardSkeleton';

export default function RecommendedPlaces({ favoriteState }) {
    const [recommendedPlaces, setRecommendedPlaces] = useState([]);
    const [recommendationsLoading, setRecommendationsLoading] = useState(true);
    const [recommendationsError, setRecommendationsError] = useState('');
    const [recommendationsSignedIn, setRecommendationsSignedIn] =
        useState(false);
    const [recommendationsReloadKey, setRecommendationsReloadKey] = useState(0);

    useEffect(() => {
        let active = true;
        let generation = 0;
        async function loadRecommendations() {
            const version = ++generation;
            const token = sessionStorage.getItem('accessToken');
            setRecommendationsLoading(true);
            setRecommendationsError('');
            setRecommendedPlaces([]);
            setRecommendationsSignedIn(Boolean(token));
            try {
                if (!token) return;
                const data = await getRecommendedDestinations(token);
                if (
                    active &&
                    version === generation &&
                    token === sessionStorage.getItem('accessToken')
                )
                    setRecommendedPlaces(data);
            } catch (cause) {
                if (active && version === generation)
                    setRecommendationsError(cause.message);
            } finally {
                if (active && version === generation)
                    setRecommendationsLoading(false);
            }
        }
        loadRecommendations();
        window.addEventListener('auth-changed', loadRecommendations);
        return () => {
            active = false;
            window.removeEventListener('auth-changed', loadRecommendations);
        };
    }, [recommendationsReloadKey]);

    return (
        <>
            {recommendationsSignedIn && (
                <div className="w-full max-w-7xl mx-auto px-2">
                    <h2 className="text-black font-bold text-2xl md:text-3xl mb-6">
                        Gợi ý cho bạn
                    </h2>
                    {recommendationsLoading ? (
                        <PlaceCardSkeleton label="Đang tìm địa điểm phù hợp với sở thích của bạn…" />
                    ) : recommendationsError ? (
                        <div role="alert" className="text-red-600">
                            {recommendationsError}
                            <button
                                type="button"
                                onClick={() =>
                                    setRecommendationsReloadKey(
                                        (value) => value + 1,
                                    )
                                }
                                className="ml-2 underline"
                            >
                                Thử lại
                            </button>
                        </div>
                    ) : recommendedPlaces.length === 0 ? (
                        <p className="text-gray-500">
                            Chưa có địa điểm phù hợp. Bạn có thể{' '}
                            <Link
                                href="/interests"
                                className="text-[#006971] underline"
                            >
                                cập nhật sở thích
                            </Link>{' '}
                            hoặc{' '}
                            <Link
                                href="/explore"
                                className="text-[#006971] underline"
                            >
                                khám phá địa điểm
                            </Link>
                            .
                        </p>
                    ) : (
                        <>
                            <p className="text-sm text-gray-500 mb-4">
                                Các điểm đến thuộc danh mục sở thích bạn đã
                                chọn.
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                                {recommendedPlaces.map((place) => (
                                    <PlaceCard
                                        favoriteState={favoriteState}
                                        key={place.id}
                                        id={place.id}
                                        name={place.name}
                                        img={place.img}
                                        des={place.des}
                                        stars={place.stars}
                                        price={place.priceDisplay}
                                        category={place.category}
                                        address={place.address}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                </div>
            )}
        </>
    );
}
