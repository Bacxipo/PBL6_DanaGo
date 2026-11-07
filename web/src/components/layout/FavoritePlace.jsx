'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { getMyFavorites, addFavorite, removeFavorite } from '@/lib/favorite-api';
import { normalizeDestinationCard } from '@/lib/destination-api';
import { searchPlaces } from '@/utils/filterPlace';
import PlaceList from '../comon/place/PlaceList.jsx';

export default function FavoritePlace() {
    const [searchTerm, setSearchTerm] = useState('');
    const [category, setCategory] = useState('');
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
    const { favorites, loading, signedIn, error, refresh } = favoriteState;
    const places = useMemo(() => favorites.map(({ destination }) => normalizeDestinationCard(destination)), [favorites]);
    const categories = useMemo(() => [...new Set([
        ...places.map((place) => place.category), category,
    ].filter(Boolean))].sort((a, b) => a.localeCompare(b, 'vi')), [places, category]);
    const filteredPlaces = useMemo(() => searchPlaces(places, searchTerm)
        .filter((place) => !category || place.category === category), [places, searchTerm, category]);
    return (
        <div className='flex flex-col gap-4'>
            <div>
                <h4 className='font-bold text-lg text-gray-800'>Địa điểm yêu thích</h4>
                <p className='text-gray-600 text-sm'>Những góc nhỏ Đà Nẵng bạn đã lưu lại cho chuyến đi sắp tới</p>
            </div>

            <div className='mt-2'>
                {loading ? <p role="status">Đang tải địa điểm yêu thích...</p>
                    : !signedIn ? <p>Vui lòng đăng nhập để xem địa điểm yêu thích.</p>
                        : error ? <div role="alert" className="text-red-600">{error}
                            <button type="button" onClick={refresh} className="ml-2 underline">Thử lại</button>
                        </div>
                            : places.length === 0 ? <p>Bạn chưa lưu địa điểm yêu thích nào.</p>
                                : <>
                                    <div className="flex flex-col sm:flex-row gap-3 mb-4">
                                        <div className="flex-1">
                                            <label htmlFor="favorite-search" className="block text-sm font-medium mb-1">Tìm địa điểm</label>
                                            <div className="flex gap-2">
                                                <input id="favorite-search" type="search" value={searchTerm}
                                                    onChange={(event) => setSearchTerm(event.target.value)}
                                                    aria-describedby="favorite-result-count"
                                                    aria-controls="favorite-results"
                                                    placeholder="Nhập tên địa điểm (có dấu hoặc không dấu)..."
                                                    className="w-full min-w-0 rounded-xl border border-gray-300 px-4 py-2" />
                                                {searchTerm && <button type="button"
                                                    onClick={() => setSearchTerm('')}
                                                    aria-label="Xóa từ khóa tìm kiếm"
                                                    className="shrink-0 text-sm text-[#006971] underline">Xóa</button>}
                                            </div>
                                        </div>
                                        <div>
                                            <label htmlFor="favorite-category" className="block text-sm font-medium mb-1">Danh mục</label>
                                            <select id="favorite-category" value={category}
                                                onChange={(event) => setCategory(event.target.value)}
                                                className="w-full rounded-xl border border-gray-300 px-4 py-2">
                                                <option value="">Tất cả danh mục</option>
                                                {categories.map((name) => <option key={name} value={name}>{name}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <p id="favorite-result-count" role="status" className="mb-3 text-sm text-gray-500">Tìm thấy {filteredPlaces.length} / {places.length} địa điểm</p>
                                    <div id="favorite-results">
                                        {filteredPlaces.length > 0
                                            ? <PlaceList places={filteredPlaces} favoriteState={favoriteState} />
                                            : <div className="py-10 text-center text-gray-500">
                                                <p>Không có địa điểm phù hợp với bộ lọc.</p>
                                                <button type="button" onClick={() => { setSearchTerm(''); setCategory(''); }}
                                                    className="mt-3 text-[#006971] underline">Xóa bộ lọc</button>
                                            </div>}
                                    </div>
                                </>}
            </div>
        </div>
    );
}
