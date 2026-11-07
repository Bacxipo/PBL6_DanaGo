'use client';

    import React, { useEffect, useRef, useState } from 'react';
import { getMyFavorites, addFavorite, removeFavorite } from '@/lib/favorite-api';
    import Link from 'next/link';
    import { Clock, Ticket, Car, Heart, CalendarPlus } from 'lucide-react';

    export default function PlaceAction({
        time = '08:00 - 18:00',
        price = 'Miễn phí',
        move = 'Xe máy, ô tô, taxi',
        placeId,
        onAddToItinerary,
    }) {
    const [favoriteItems, setFavoriteItems] = useState([]);
    const [favoritesLoading, setFavoritesLoading] = useState(true);
    const [favoritesSignedIn, setFavoritesSignedIn] = useState(false);
    const [favoritesError, setFavoritesError] = useState('');
    const [favoritesSaving, setFavoritesSaving] = useState(false);
    const [favoritesReloadKey, setFavoritesReloadKey] = useState(0);
    const favoritesBusy = useRef(false);
    const favoritesGeneration = useRef(0);

    useEffect(() => {
        let active = true;
        async function load() {
            const version = ++favoritesGeneration.current;
            const token = sessionStorage.getItem('accessToken');
            setFavoritesLoading(true);
            setFavoritesError('');
            setFavoriteItems([]);
            setFavoritesSignedIn(Boolean(token));
            try {
                if (!token) return;
                const data = await getMyFavorites(token);
                if (active && version === favoritesGeneration.current && token === sessionStorage.getItem('accessToken')) setFavoriteItems(data);
            } catch (cause) {
                if (active && version === favoritesGeneration.current) setFavoritesError(cause.message);
            } finally {
                if (active && version === favoritesGeneration.current) setFavoritesLoading(false);
            }
        }
        load();
        window.addEventListener('auth-changed', load);
        return () => {
            active = false;
            window.removeEventListener('auth-changed', load);
        };
    }, [favoritesReloadKey]);

    async function handleFavoriteToggle(destinationId) {
        const id = Number(destinationId);
        const token = sessionStorage.getItem('accessToken');
        if (!token) { setFavoritesError('Bạn cần đăng nhập để lưu địa điểm.'); return; }
        if (!Number.isSafeInteger(id) || id <= 0 || favoritesBusy.current || favoritesLoading || favoritesError) return;
        const version = favoritesGeneration.current;
        favoritesBusy.current = true;
        setFavoritesSaving(true);
        setFavoritesError('');
        try {
            if (favoriteItems.some((item) => item.destinationId === id)) {
                await removeFavorite(id, token);
                if (version === favoritesGeneration.current && token === sessionStorage.getItem('accessToken')) {
                    setFavoriteItems((items) => items.filter((item) => item.destinationId !== id));
                }
            } else {
                await addFavorite(id, token);
                if (version === favoritesGeneration.current && token === sessionStorage.getItem('accessToken')) {
                    setFavoritesReloadKey((value) => value + 1);
                }
            }
        } catch (cause) {
            if (version === favoritesGeneration.current && token === sessionStorage.getItem('accessToken')) setFavoritesError(cause.message);
        } finally {
            favoritesBusy.current = false;
            setFavoritesSaving(false);
        }
    }

    const favoriteState = { favorites: favoriteItems, loading: favoritesLoading, signedIn: favoritesSignedIn, error: favoritesError, saving: favoritesSaving, toggle: handleFavoriteToggle, refresh: () => setFavoritesReloadKey((value) => value + 1) };
        const { favorites, loading, saving, signedIn, error, refresh: retry, toggle } = favoriteState;
        const isFavorited = favorites.some((item) => item.destinationId === Number(placeId));
        const disabled = loading || saving || (signedIn && Boolean(error)) || !Number.isSafeInteger(Number(placeId)) || Number(placeId) <= 0;

        return (
                    <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200/90 w-full flex flex-col space-y-4">
                        <div className="flex items-start gap-3.5 pb-3 border-b border-slate-100">
                            <div className="w-9 h-9 rounded-xl bg-teal-50 text-[#006971] flex items-center justify-center shrink-0">
                                <Clock className="w-5 h-5 stroke-[2.2]" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm text-slate-800">Giờ mở cửa</h3>
                                <p className="text-xs text-slate-500 mt-0.5">{time}</p>
                            </div>
                        </div>

                            <div className="flex items-start gap-3.5 pb-3 border-b border-slate-100">
                                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                                    <Ticket className="w-5 h-5 stroke-[2.2]" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm text-slate-800">Giá vé tham quan</h3>
                                    <p className="text-xs text-slate-500 mt-0.5 font-medium">{price}</p>
                                </div>
                            </div>

                                <div className="flex items-start gap-3.5 pb-3 border-b border-slate-100">
                                    <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center shrink-0">
                                        <Car className="w-5 h-5 stroke-[2.2]" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-sm text-slate-800">Phương tiện di chuyển</h3>
                                        <p className="text-xs text-slate-500 mt-0.5">{move}</p>
                                    </div>
                                </div>

                                <div className="pt-2 space-y-2.5">
                                    {onAddToItinerary ? (
                                        <button
                                            type="button"
                                            onClick={onAddToItinerary}
                                            className="w-full flex items-center justify-center gap-2 bg-[#006971] hover:bg-[#00555c] active:scale-95 text-white py-3 rounded-xl font-bold text-xs sm:text-sm cursor-pointer shadow-sm transition-all"
                                        >
                                            <CalendarPlus className="w-4 h-4 stroke-[2.2]" />
                                            <span>Thêm vào lịch trình</span>
                                        </button>
                                    ) : (
                                        <Link
                                            href="/itinerary"
                                            className="w-full flex items-center justify-center gap-2 bg-[#006971] hover:bg-[#00555c] active:scale-95 text-white py-3 rounded-xl font-bold text-xs sm:text-sm cursor-pointer shadow-sm transition-all text-center"
                                        >
                                            <CalendarPlus className="w-4 h-4 stroke-[2.2]" />
                                            <span>Lên kế hoạch đến điểm này</span>
                                        </Link>
                                    )}

                                    <button
                                        type="button"
                                        onClick={() => toggle(placeId)}
                                        disabled={disabled}
                                        aria-pressed={isFavorited}
                                        className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-xs transition-all cursor-pointer border ${isFavorited
                                                ? 'bg-rose-50 border-rose-200 text-rose-600'
                                                : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                                            }`}
                                    >
                                        <Heart
                                            className={`w-4 h-4 transition-colors ${isFavorited ? 'fill-rose-500 text-rose-500' : 'text-slate-400'
                                                }`}
                                        />
                                        <span>{isFavorited ? 'Đã lưu vào yêu thích' : 'Lưu vào yêu thích'}</span>
                                    </button>
                                    {error && <div role="alert" className="text-sm text-red-600">
                                        {error}
                                        <button type="button" onClick={retry} className="ml-2 underline">Thử lại</button>
                                    </div>}
                                </div>
                            </div>
                            );
}
