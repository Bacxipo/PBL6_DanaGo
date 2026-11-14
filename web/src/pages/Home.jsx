'use client';

import { useState, useEffect, useRef } from 'react';
import {
    getMyFavorites,
    addFavorite,
    removeFavorite,
} from '@/lib/favorite-api';
import HomeHero from '../components/home/HomeHero';
import HomeCategories from '../components/home/HomeCategories';
import FeaturedPlaces from '../components/home/FeaturedPlaces';
import RecommendedPlaces from '../components/home/RecommendedPlaces';
import NearbyPlaces from '../components/home/NearbyPlaces';
import ItineraryBanner from '../components/home/ItineraryBanner';
import UpcomingEvents from '../components/comon/event/UpcomingEvents';

export default function Home() {
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
                if (
                    active &&
                    version === favoritesGeneration.current &&
                    token === sessionStorage.getItem('accessToken')
                )
                    setFavoriteItems(data);
            } catch (cause) {
                if (active && version === favoritesGeneration.current)
                    setFavoritesError(cause.message);
            } finally {
                if (active && version === favoritesGeneration.current)
                    setFavoritesLoading(false);
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
        if (!token) {
            setFavoritesError('Bạn cần đăng nhập để lưu địa điểm.');
            return;
        }
        if (
            !Number.isSafeInteger(id) ||
            id <= 0 ||
            favoritesBusy.current ||
            favoritesLoading ||
            favoritesError
        )
            return;
        const version = favoritesGeneration.current;
        favoritesBusy.current = true;
        setFavoritesSaving(true);
        setFavoritesError('');
        try {
            if (favoriteItems.some((item) => item.destinationId === id)) {
                await removeFavorite(id, token);
                if (
                    version === favoritesGeneration.current &&
                    token === sessionStorage.getItem('accessToken')
                ) {
                    setFavoriteItems((items) =>
                        items.filter((item) => item.destinationId !== id),
                    );
                }
            } else {
                await addFavorite(id, token);
                if (
                    version === favoritesGeneration.current &&
                    token === sessionStorage.getItem('accessToken')
                ) {
                    setFavoritesReloadKey((value) => value + 1);
                }
            }
        } catch (cause) {
            if (
                version === favoritesGeneration.current &&
                token === sessionStorage.getItem('accessToken')
            )
                setFavoritesError(cause.message);
        } finally {
            favoritesBusy.current = false;
            setFavoritesSaving(false);
        }
    }

    const favoriteState = {
        favorites: favoriteItems,
        loading: favoritesLoading,
        signedIn: favoritesSignedIn,
        error: favoritesError,
        saving: favoritesSaving,
        toggle: handleFavoriteToggle,
        refresh: () => setFavoritesReloadKey((value) => value + 1),
    };
    return (
        <section className="w-full space-y-12 pb-8 pt-4 sm:space-y-16 sm:px-4">
            <HomeHero />
            <HomeCategories />
            <FeaturedPlaces favoriteState={favoriteState} />
            <UpcomingEvents />
            <RecommendedPlaces favoriteState={favoriteState} />
            <NearbyPlaces favoriteState={favoriteState} />
            <ItineraryBanner />
        </section>
    );
}
