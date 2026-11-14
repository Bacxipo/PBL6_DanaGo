'use client';

import { useState, useEffect } from 'react';
import PlaceCard from '../comon/place/PlaceCard';
import { getNearbyDestinations } from '@/lib/destination-api';
import { LocateFixed, RefreshCw } from 'lucide-react';
import PlaceCardSkeleton from './PlaceCardSkeleton';

export default function NearbyPlaces({ favoriteState }) {
    const [nearbyPlaces, setNearbyPlaces] = useState([]);
    const [nearbyLoading, setNearbyLoading] = useState(true);
    const [nearbyError, setNearbyError] = useState('');
    const [nearbyRetry, setNearbyRetry] = useState(0);

    useEffect(() => {
        let active = true;
        const controller = new AbortController();

        setNearbyLoading(true);
        setNearbyError('');
        setNearbyPlaces([]);

        if (!window.isSecureContext || !navigator.geolocation) {
            setNearbyError(
                'Không thể lấy vị trí. Hãy mở trang bằng HTTPS hoặc localhost.',
            );
            setNearbyLoading(false);
            return () => {
                active = false;
                controller.abort();
            };
        }

        navigator.geolocation.getCurrentPosition(
            async ({ coords }) => {
                if (!active) return;

                try {
                    const places = await getNearbyDestinations(
                        coords.latitude,
                        coords.longitude,
                        6,
                        controller.signal,
                    );

                    if (active) setNearbyPlaces(places);
                } catch (error) {
                    if (active && error.name !== 'AbortError') {
                        setNearbyError(error.message);
                    }
                } finally {
                    if (active) setNearbyLoading(false);
                }
            },
            (error) => {
                if (!active) return;

                const messages = {
                    1: 'Bạn chưa cho phép truy cập vị trí. Hãy cấp quyền trong cài đặt trang rồi thử lại.',
                    2: 'Không xác định được vị trí. Hãy kiểm tra dịch vụ vị trí trên thiết bị.',
                    3: 'Lấy vị trí quá lâu. Vui lòng thử lại.',
                };

                setNearbyError(
                    messages[error.code] || 'Không lấy được vị trí hiện tại.',
                );
                setNearbyLoading(false);
            },
            {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 60000,
            },
        );

        return () => {
            active = false;
            controller.abort();
        };
    }, [nearbyRetry]);

    return (
        <section
            aria-labelledby="nearby-places-title"
            className="w-full max-w-7xl mx-auto px-2"
        >
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p className="mb-2 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.14em] text-[#006971]">
                        <LocateFixed size={14} aria-hidden="true" />
                        Theo vị trí hiện tại
                    </p>
                    <h2
                        id="nearby-places-title"
                        className="text-2xl font-bold tracking-tight text-[#163438] md:text-3xl"
                    >
                        Địa điểm gần bạn
                    </h2>
                </div>
                <button
                    type="button"
                    disabled={nearbyLoading}
                    onClick={() => setNearbyRetry((value) => value + 1)}
                    className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-white px-4 py-2.5 text-xs font-semibold text-[#006971] transition-colors hover:bg-teal-50 disabled:opacity-50"
                >
                    <RefreshCw size={14} aria-hidden="true" />
                    Cập nhật vị trí
                </button>
            </div>

            <div aria-live="polite">
                {nearbyLoading ? (
                    <PlaceCardSkeleton label="Đang lấy vị trí và tìm địa điểm gần bạn…" />
                ) : nearbyError ? (
                    <div className="rounded-2xl border border-teal-100 bg-teal-50/60 px-6 py-8">
                        <LocateFixed
                            className="mb-3 text-[#006971]"
                            size={28}
                            aria-hidden="true"
                        />
                        <p className="mb-2 font-semibold text-[#163438]">
                            Khám phá những điểm đến quanh bạn
                        </p>
                        <p className="max-w-xl text-sm leading-6 text-slate-600">
                            {nearbyError}
                        </p>
                        <button
                            type="button"
                            onClick={() => setNearbyRetry((value) => value + 1)}
                            className="mt-4 rounded-xl bg-[#006971] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#005258]"
                        >
                            Thử lại
                        </button>
                    </div>
                ) : nearbyPlaces.length === 0 ? (
                    <p className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
                        Chưa có địa điểm phù hợp quanh vị trí này. Hãy thử cập
                        nhật vị trí hoặc khám phá danh sách điểm đến.
                    </p>
                ) : (
                    <div className="flex snap-x gap-6 overflow-x-auto pb-4 sm:grid sm:grid-cols-2 sm:overflow-visible lg:grid-cols-4">
                        {nearbyPlaces.map((place) => (
                            <div
                                key={place.id}
                                className="flex w-[85%] shrink-0 snap-start flex-col sm:w-auto sm:min-w-0 [&>a]:flex-1"
                            >
                                <PlaceCard
                                    favoriteState={favoriteState}
                                    id={place.id}
                                    name={place.name}
                                    img={place.img}
                                    des={place.des}
                                    stars={place.stars}
                                    price={place.priceDisplay}
                                    category={place.category}
                                    address={place.address}
                                    distance={place.distance}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
