'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import PlaceCard from '../components/comon/place/PlaceCard';
import { getMyFavorites, addFavorite, removeFavorite } from '@/lib/favorite-api';
import { getFeaturedDestinations } from '../../lib/destination-api';
import { getRecommendedDestinations } from '@/lib/recommendation-api';
import heroImg from '../assets/images/cr.jpg';
import Link from 'next/link';
import { getFeedCategories } from '@/lib/feed-api';
import { ChevronLeft, ChevronRight, ArrowUpRight, Compass } from 'lucide-react';

export default function Home() {
    const [categories, setCategories] = useState([]);
    const [categoriesLoading, setCategoriesLoading] = useState(true);
    const [categoriesError, setCategoriesError] = useState('');
    const [categoriesReloadKey, setCategoriesReloadKey] = useState(0);

    useEffect(() => {
        let active = true;
        async function loadCategories() {
            setCategoriesLoading(true);
            setCategoriesError('');
            try {
                const data = await getFeedCategories();
                if (active) setCategories(data);
            } catch (cause) {
                if (active) setCategoriesError(cause.message);
            } finally {
                if (active) setCategoriesLoading(false);
            }
        }
        loadCategories();
        return () => { active = false; };
    }, [categoriesReloadKey]);
    const [recommendedPlaces, setRecommendedPlaces] = useState([]);
    const [recommendationsLoading, setRecommendationsLoading] = useState(true);
    const [recommendationsError, setRecommendationsError] = useState('');
    const [recommendationsSignedIn, setRecommendationsSignedIn] = useState(false);
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
                if (active && version === generation && token === sessionStorage.getItem('accessToken')) setRecommendedPlaces(data);
            } catch (cause) {
                if (active && version === generation) setRecommendationsError(cause.message);
            } finally {
                if (active && version === generation) setRecommendationsLoading(false);
            }
        }
        loadRecommendations();
        window.addEventListener('auth-changed', loadRecommendations);
        return () => {
            active = false;
            window.removeEventListener('auth-changed', loadRecommendations);
        };
    }, [recommendationsReloadKey]);
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
    const bgUrl = typeof heroImg === 'string' ? heroImg : heroImg.src || heroImg;
    const [searchQuery, setSearchQuery] = useState('');
    const router = useRouter();
    const [featuredPlaces, setFeaturedPlaces] = useState([]);
    const [loadingFeatured, setLoadingFeatured] = useState(true);
    const sliderRef = useRef(null);
    const handleScrollLeft = () => {
        if (sliderRef.current) {
            sliderRef.current.scrollBy({ left: -sliderRef.current.offsetWidth, behavior: 'smooth' });
        }
    };
    const handleScrollRight = () => {
        if (sliderRef.current) {
            sliderRef.current.scrollBy({ left: sliderRef.current.offsetWidth, behavior: 'smooth' });
        }
    };
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/explore?search=${encodeURIComponent(searchQuery.trim())}`);
        } else {
            router.push('/explore');
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
        <section className="w-full space-y-12 pb-8">
            {/* Hero Section */}
            <div
                className="w-full h-[450px] md:h-[500px] bg-cover bg-center rounded-2xl flex items-center justify-center text-white shadow-md relative overflow-hidden"
                style={{ backgroundImage: `url(${bgUrl})` }}
            >
                <div className="bg-black/50 p-8 md:p-12 rounded-2xl text-center mx-4 backdrop-blur-xs">
                    <h1 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">Khám Phá Đà Nẵng Cùng DanaGo</h1>
                    <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row justify-center items-center gap-3">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Bạn muốn đến đâu ở Đà Nẵng?"
                            className="w-full sm:w-[320px] bg-white text-gray-800 placeholder-gray-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#006971]"
                        />
                        <button
                            type="submit"
                            className="w-full sm:w-auto bg-[#006971] hover:bg-[#005258] text-white px-6 py-3 rounded-xl font-bold text-sm transition-colors cursor-pointer"
                        >
                            Tìm kiếm
                        </button>
                    </form>
                </div>
            </div>

            {/* Catalog Section */}
            <section aria-labelledby="home-categories-title" className="w-full max-w-7xl mx-auto px-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">
                    <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
                        <div>
                            <h2 id="home-categories-title" className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">Bạn muốn khám phá điều gì?</h2>
                            <p className="mt-1.5 text-sm text-slate-500">Chọn một danh mục để tìm điểm đến cho chuyến đi của bạn.</p>
                        </div>
                        <Link href="/explore" className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm font-semibold text-[#006971] transition-colors hover:bg-teal-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#006971]">
                            Xem tất cả <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
                        </Link>
                    </div>
                    <div className="flex flex-nowrap gap-3 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                        {categoriesLoading ? <p role="status">Đang tải danh mục...</p>
                            : categoriesError ? <div role="alert" className="text-red-600">{categoriesError}
                                <button type="button" onClick={() => setCategoriesReloadKey((value) => value + 1)} className="ml-2 underline">Thử lại</button>
                            </div>
                                : categories.length === 0 ? <p className="text-gray-500">Chưa có danh mục địa điểm.</p>
                                    : categories.slice(0, 5).map((item) => (
                                        <Link key={item.id} href={`/explore?category=${encodeURIComponent(item.name)}`}
                                            className="group flex shrink-0 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/60 p-4 transition-colors hover:border-teal-300 hover:bg-teal-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#006971]">
                                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#006971] ring-1 ring-slate-200 transition-colors group-hover:ring-teal-200">
                                                <Compass aria-hidden="true" className="h-5 w-5" />
                                            </span>
                                            <span className="whitespace-nowrap text-sm font-semibold leading-5 text-slate-700 group-hover:text-[#006971]">{item.name}</span>
                                            <ArrowUpRight aria-hidden="true" className="h-4 w-4 shrink-0 text-slate-400 group-hover:text-[#006971]" />
                                        </Link>
                                    ))}
                    </div>
                </div>
            </section>

            {/* Featured Places Section */}
            <div className="w-full max-w-7xl mx-auto px-2">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-black font-bold text-2xl md:text-3xl">Địa điểm nổi tiếng</h2>
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
                    <div className="text-center py-10 text-gray-500">Đang tải địa điểm nổi bật...</div>
                ) : featuredPlaces.length === 0 ? (
                    <div className="text-center py-10 text-gray-500">Chưa có địa điểm nổi bật nào.</div>
                ) : (
                    /* Container vuốt ngang: Mỗi màn hình desktop chia đúng 4 card, mobile chia 1.2 card */
                    <div
                        ref={sliderRef}
                        className="flex gap-6 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory scroll-smooth no-scrollbar"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        {featuredPlaces.map((place) => {
                            const mainImg = place.images?.find((img) => img.isPrimary)?.imageUrl
                                || place.images?.[0]?.imageUrl
                                || place.images?.[0]?.url
                                || heroImg;

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
                                        category={place.categoryName || place.category?.name}
                                        address={place.district}
                                        isFeatured={place.isFeatured}
                                    />
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
            {/* Featured Places Section Recommended */}
            <div className="w-full max-w-7xl mx-auto px-2">
                <h2 className="text-black font-bold text-2xl md:text-3xl mb-6">Gợi ý cho bạn</h2>
                {recommendationsLoading ? <p role="status">Đang tìm địa điểm phù hợp với sở thích của bạn...</p>
                    : !recommendationsSignedIn ? <p className="text-gray-500">Hãy <Link href="/login" className="text-[#006971] underline">đăng nhập</Link> để nhận gợi ý theo sở thích.</p>
                        : recommendationsError ? <div role="alert" className="text-red-600">{recommendationsError}
                            <button type="button" onClick={() => setRecommendationsReloadKey((value) => value + 1)} className="ml-2 underline">Thử lại</button>
                        </div>
                            : recommendedPlaces.length === 0 ? <p className="text-gray-500">Chưa có địa điểm phù hợp. Bạn có thể <Link href="/interests" className="text-[#006971] underline">cập nhật sở thích</Link> hoặc <Link href="/explore" className="text-[#006971] underline">khám phá địa điểm</Link>.</p>
                                : <>
                                    <p className="text-sm text-gray-500 mb-4">Các điểm đến thuộc danh mục sở thích bạn đã chọn.</p>
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
                                </>}
            </div>
            {/* Banner Lập lịch trình */}
            <div className='flex flex-wrap gap-4 bg-[#006971] rounded-2xl p-8 md:p-10 items-center justify-between shadow-sm'>
                <div className='flex flex-col space-y-2'>
                    <h2 className='font-bold text-2xl md:text-3xl text-white'>Lập lịch trình thông minh</h2>
                    <p className='text-cyan-100 text-sm md:text-base'>Để chúng tôi gợi ý hành trình hoàn hảo dựa trên sở thích và ngân sách của bạn</p>
                </div>
                <div>
                    <Link href="/itinerary" className='inline-flex items-center justify-center px-6 py-3 bg-white text-[#006971] hover:bg-gray-200 font-bold rounded-xl transition-colors shadow-md'>
                        Bắt đầu ngay
                    </Link>
                </div>
            </div>
        </section>
    );
}
