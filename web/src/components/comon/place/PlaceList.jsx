'use client';

import { useEffect, useRef, useState } from "react";
import PlaceCard from "./PlaceCard";
import Pagination from "../ui/Pagination";
import { getMyFavorites, addFavorite, removeFavorite } from '@/lib/favorite-api';

export default function PlaceList({ places = [], placesPerPage = 9, favoriteState }) {
    const favoritesEnabled = !favoriteState;
    const [favoriteItems, setFavoriteItems] = useState([]);
    const [favoritesLoading, setFavoritesLoading] = useState(true);
    const [favoritesSignedIn, setFavoritesSignedIn] = useState(false);
    const [favoritesError, setFavoritesError] = useState('');
    const [favoritesSaving, setFavoritesSaving] = useState(false);
    const [favoritesReloadKey, setFavoritesReloadKey] = useState(0);
    const favoritesBusy = useRef(false);
    const favoritesGeneration = useRef(0);

    useEffect(() => {
        if (!favoritesEnabled) return;
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
    }, [favoritesEnabled, favoritesReloadKey]);

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

    const localFavorites = { favorites: favoriteItems, loading: favoritesLoading, signedIn: favoritesSignedIn, error: favoritesError, saving: favoritesSaving, toggle: handleFavoriteToggle, refresh: () => setFavoritesReloadKey((value) => value + 1) };
    const favorites = favoriteState || localFavorites;
    const [currentPage, setCurrentPage] = useState(1);
    const [prevPlaces, setPrevPlaces] = useState(places);

    // Khi danh sách places thay đổi (lọc danh mục, quận...) thì quay về trang 1
    if (places !== prevPlaces) {
        setPrevPlaces(places);
        setCurrentPage(1);
    }

    // Tổng số trang
    const totalPages = Math.ceil(places.length / placesPerPage);

    // Vị trí bắt đầu
    const startIndex = (currentPage - 1) * placesPerPage;

    // Danh sách địa điểm của trang hiện tại
    const currentPlaces = places.slice(
        startIndex,
        startIndex + placesPerPage
    );

    return (
        <div className="w-full flex flex-col">
            {/* Khung hiển thị các thẻ địa điểm (Destination Cards Frame) */}
            <div className="w-full pb-6">
                {currentPlaces.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                        {currentPlaces.map((place) => (
                            <PlaceCard
                                favoriteState={favorites}
                                key={place.id}
                                id={place.id}
                                name={place.name}
                                img={place.img}
                                des={place.des}
                                stars={place.stars}
                                price={place.priceDisplay ?? place.price}
                                category={place.category}
                                address={place.address}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex items-center justify-center min-h-[350px] text-center bg-white rounded-2xl border border-gray-100 p-8">
                        <h3 className="text-xl font-bold text-gray-700">
                            Không tìm thấy dữ liệu điểm đến phù hợp
                        </h3>
                    </div>
                )}
            </div>

            {/* Khung phân trang TÁCH BIỆT hoàn toàn khỏi khung cards */}
            {totalPages > 1 && (
                <div className="shrink-0 pt-4 border-t border-gray-200 mt-2">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        setCurrentPage={setCurrentPage}
                    />
                </div>
            )}
        </div>
    );
}
