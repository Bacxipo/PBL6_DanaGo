'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import {
    ArrowLeft,
    Loader2,
    AlertCircle,
    Image as ImageIcon,
    ChevronLeft,
    ChevronRight,
    Maximize2,
    X,
    Scaling,
    Star,
    MapPin,
    Share2,
    Calendar,
    Compass,
} from 'lucide-react';
import PlaceAction from '../components/comon/place/PlaceAction';
import PlaceMap from '../components/comon/place/PlaceMap';
import PlaceReview from '../components/comon/review/PlaceReview';
import ReviewForm from '../components/comon/review/ReviewForm';
import { getDestinationById } from '@/lib/destination-api';
import { getDestinationReviews } from '@/lib/review-api';

export default function DetailPlace({ id: propId }) {
    const params = useParams();
    const router = useRouter();
    const id = propId || params?.id;


    const [place, setPlace] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [fitMode, setFitMode] = useState('contain'); // 'contain' | 'cover'
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);

    const [reviewList, setReviewList] = useState([]);
    const [reviewsLoading, setReviewsLoading] = useState(false);
    const [copyToast, setCopyToast] = useState(false);

    // Tải thông tin đánh giá
    const fetchReviews = async () => {
        if (!id) return;
        setReviewsLoading(true);
        try {
            const data = await getDestinationReviews(id);
            setReviewList(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Lỗi khi tải đánh giá điểm đến:', err);
        } finally {
            setReviewsLoading(false);
        }
    };

    // Tải chi tiết điểm đến qua API chuẩn hóa từ @/lib/destination-api
    useEffect(() => {
        if (typeof window !== 'undefined') {
            window.scrollTo(0, 0);
        }
        if (!id) return;

            const loadPlace = async () => {
                setLoading(true);
                setError(null);
                try {
                    const data = await getDestinationById(id);
                    setPlace(data);
                    setCurrentImageIndex(0);
                } catch (err) {
                    console.error('Lỗi khi tải chi tiết điểm đến:', err);
                    setError(err.message || 'Không thể tải thông tin điểm đến.');
                } finally {
                    setLoading(false);
                }
            };

            loadPlace();
            fetchReviews();
        }, [id]);

    // Phím tắt bàn phím khi mở xem ảnh toàn màn hình
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!isLightboxOpen) return;
            if (e.key === 'Escape') {
                setIsLightboxOpen(false);
            } else if (e.key === 'ArrowLeft') {
                if (!place?.images?.length) return;
                setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : place.images.length - 1));
            } else if (e.key === 'ArrowRight') {
                if (!place?.images?.length) return;
                setCurrentImageIndex((prev) => (prev < place.images.length - 1 ? prev + 1 : 0));
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isLightboxOpen, place]);

    // Khóa cuộn trang khi mở Lightbox
    useEffect(() => {
        if (isLightboxOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isLightboxOpen]);

    const handlePrevImage = (e) => {
        if (e) e.stopPropagation();
        if (!place?.images?.length) return;
        setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : place.images.length - 1));
    };

    const handleNextImage = (e) => {
        if (e) e.stopPropagation();
        if (!place?.images?.length) return;
        setCurrentImageIndex((prev) => (prev < place.images.length - 1 ? prev + 1 : 0));
    };

    const handleShare = () => {
        if (typeof window !== 'undefined') {
            navigator.clipboard.writeText(window.location.href);
            setCopyToast(true);
            setTimeout(() => setCopyToast(false), 2500);
        }
    };

    if (loading) {
        return (
                <div className="flex flex-col items-center justify-center min-h-[460px] gap-3 text-slate-500 py-24">
                    <Loader2 className="w-9 h-9 animate-spin text-[#006971]" />
                    <p className="text-sm font-semibold">Đang tải chi tiết điểm đến...</p>
                </div>
                );
    }

                if (error || !place) {
        return (
                        <div className="text-center py-24 flex flex-col items-center gap-4 max-w-md mx-auto px-4">
                            <AlertCircle className="w-12 h-12 text-rose-500" />
                            <h2 className="text-xl font-bold text-slate-800">
                                {error || 'Không tìm thấy địa điểm!'}
                            </h2>
                            <p className="text-xs text-slate-500">
                                Địa điểm có thể đã được gỡ bỏ hoặc bạn đã truy cập đường dẫn chưa chính xác.
                            </p>
                            <Link
                                href="/explore"
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#006971] text-white rounded-xl font-bold text-xs hover:bg-[#00555c] transition-all shadow-sm"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                <span>Quay lại danh sách khám phá</span>
                            </Link>
                        </div>
                        );
    }

                        const currentImg = place.images?.[currentImageIndex] || place.img;
    const hasMultipleImages = place.images && place.images.length > 1;

                        return (
                            <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
                                {/* Thanh Breadcrumb & Nút Quay Lại */}
                                <div className="flex items-center justify-between gap-4 flex-wrap pb-2 border-b border-slate-100">
                                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                                        <Link href="/explore" className="inline-flex items-center gap-1.5 hover:text-[#006971] transition-colors">
                                            <Compass className="w-4 h-4" />
                                            <span>Khám phá điểm đến</span>
                                        </Link>
                                        <span>/</span>
                                        <span className="text-[#006971] truncate max-w-[200px] sm:max-w-md font-bold">
                                            {place.name}
                                        </span>
                                    </div>

                <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={handleShare}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition cursor-pointer"
                                                    title="Sao chép liên kết chia sẻ"
                                                >
                                                            <Share2 className="w-3.5 h-3.5 text-[#006971]" />
                                                            <span>{copyToast ? 'Đã sao chép link!' : 'Chia sẻ'}</span>
                                                        </button>
                                                    <Link
                                                        href="/explore"
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition cursor-pointer"
                                                    >
                                                        <ArrowLeft className="w-3.5 h-3.5" />
                                                        <span>Quay lại</span>
                                                    </Link>
                                            </div>
                                        </div>

            {/* Tiêu đề & Thông tin nhanh điểm đến */}
            <div className="space-y-2">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="text-2xs font-extrabold px-3 py-1 rounded-full bg-teal-50 text-[#006971] border border-teal-200/80">
                                                    {place.category}
                                                </span>
                                                <span className="inline-flex items-center gap-1 text-2xs font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                                                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                                    <span>{place.avgRating ? place.avgRating.toFixed(1) : '4.8'}</span>
                                                    <span className="text-slate-400 font-normal">({reviewList.length} đánh giá)</span>
                                                </span>
                                                <span className="inline-flex items-center gap-1 text-2xs text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
                                                    <MapPin className="w-3 h-3 text-slate-400" />
                                                    <span>{place.address}</span>
                                                </span>
                                            </div>
                                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
                                                {place.name}
                                            </h1>
                                            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-4xl">
                                                {place.des}
                                            </p>
                                        </div>

                                        {/* Bố cục chính 2 Cột: Bên Trái Slider & Nội Dung, Bên Phải Thẻ Hành Động */}
                                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                                            {/* ================= CỘT TRÁI (2/3) ================= */}
                                            <div className="lg:col-span-2 space-y-8 min-w-0">
                                                {/* KHUNG SLIDER HÌNH ẢNH */}
                                                <div className="space-y-3">
                                                    <div
                                                        className="relative w-full h-[360px] sm:h-[460px] lg:h-[480px] rounded-3xl overflow-hidden bg-neutral-900 group select-none shadow-md cursor-pointer"
                                                        onClick={() => currentImg && setIsLightboxOpen(true)}
                                                        title="Bấm để xem ảnh toàn màn hình"
                                                    >
                                                        {currentImg ? (
                                                            <>
                                                                {/* Ambient Blur Background */}
                                                                <Image
                                                                    src={currentImg}
                                                                    alt=""
                                                                    fill
                                                                    sizes="(max-width: 1200px) 100vw, 800px"
                                                                    className="object-cover blur-2xl opacity-40 scale-110 pointer-events-none"
                                                                    aria-hidden="true"
                                                                />
                                                                <div className="absolute inset-0 bg-black/20 pointer-events-none z-1" />

                                                                {/* Ảnh chính */}
                                                                <Image
                                                                    src={currentImg}
                                                                    alt={`${place.name} - ảnh ${currentImageIndex + 1}`}
                                                                    fill
                                                                    sizes="(max-width: 1200px) 100vw, 800px"
                                                                    className={`${fitMode === 'contain' ? 'object-contain' : 'object-cover'
                                                                        } relative z-2 transition-all duration-300`}
                                                                priority
                                    />

                                                                {/* Nút chế độ hiển thị: Trọn vẹn vs Tràn viền */}
                                                                <button
                                                                    type="button"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setFitMode((prev) => (prev === 'contain' ? 'cover' : 'contain'));
                                                                    }}
                                                                    className="absolute top-4 left-4 z-10 px-3 py-1.5 rounded-xl bg-black/60 hover:bg-black/80 text-white text-xs font-semibold backdrop-blur-md flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                                                                >
                                                                    <Scaling className="w-3.5 h-3.5" />
                                                                    <span>{fitMode === 'contain' ? 'Xem trọn vẹn' : 'Tràn viền'}</span>
                                                                </button>

                                                                {/* Nút phóng to toàn màn hình */}
                                                                <button
                                                                    type="button"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setIsLightboxOpen(true);
                                                                    }}
                                                                    className="absolute top-4 right-4 z-10 px-3 py-1.5 rounded-xl bg-black/60 hover:bg-black/80 text-white text-xs font-semibold backdrop-blur-md flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                                                                >
                                                                    <Maximize2 className="w-3.5 h-3.5" />
                                                                    <span>Toàn màn hình</span>
                                                                </button>

                                                                        {/* Nút Prev / Next */}
                                                                        {hasMultipleImages && (
                                                                            <>
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={handlePrevImage}
                                                                                    aria-label="Ảnh trước"
                                                                                    className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md transition-all shadow-md cursor-pointer opacity-80 group-hover:opacity-100"
                                                                                >
                                                                                    <ChevronLeft className="w-6 h-6" />
                                                                                </button>
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={handleNextImage}
                                                                                    aria-label="Ảnh tiếp theo"
                                                                                    className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md transition-all shadow-md cursor-pointer opacity-80 group-hover:opacity-100"
                                                                                >
                                                                                    <ChevronRight className="w-6 h-6" />
                                                                                </button>

                                                                                {/* Đếm số ảnh */}
                                                                                <div className="absolute bottom-3 right-4 z-10 bg-black/65 backdrop-blur-md text-white text-2xs font-bold px-2.5 py-1 rounded-full">
                                                                                    {currentImageIndex + 1} / {place.images.length}
                                                                                </div>

                                            {/* Dots điều hướng */}
                                            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full">
                                                {place.images.map((_, idx) => (
                                                    <button
                                                        key={idx}
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setCurrentImageIndex(idx);
                                                        }}
                                                        className={`h-2 rounded-full transition-all cursor-pointer ${
                                                            currentImageIndex === idx
                                                                ? 'bg-white w-5'
                                                                : 'bg-white/50 w-2 hover:bg-white/80'
                                                        }`}
                                                                                aria-label={`Xem ảnh ${idx + 1}`}
                                                    />
                                                ))}
                                                                            </div>
                                                                        </>
                                    )}
                                                                    </>
                                                                ) : (
                                                                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-100 rounded-3xl select-none">
                                                                    <ImageIcon className="w-10 h-10 stroke-[1.5] mb-2" />
                                                                    <p className="text-xs font-semibold">Chưa có hình ảnh cho điểm đến này</p>
                                                                </div>
                            )}
                                                            </div>

                                                        {/* Dải ảnh nhỏ Thumbnail nếu có nhiều hơn 1 ảnh */}
                                                        {hasMultipleImages && (
                                                            <div className="flex gap-2.5 overflow-x-auto py-2 scrollbar-none">
                                                                {place.images.map((imgUrl, idx) => (
                                                                    <button
                                                                        key={idx}
                                                                        type="button"
                                                                        onClick={() => setCurrentImageIndex(idx)}
                                                                        className={`relative w-20 h-14 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${currentImageIndex === idx
                                                                                ? 'border-[#006971] ring-2 ring-[#006971]/30 opacity-100 scale-105'
                                                                                : 'border-transparent opacity-60 hover:opacity-100'
                                                                            }`}
                                                                    >
                                                                        <Image
                                                                            src={imgUrl}
                                                                            alt={`Thumbnail ${idx + 1}`}
                                                                            fill
                                                                            sizes="80px"
                                                                            className="object-cover"
                                                                        />
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>

                                                            {/* VỀ ĐỊA ĐIỂM NÀY */}
                                                            <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-xs space-y-4">
                                                                <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
                                                                    Giới thiệu chi tiết
                                                                </h3>
                                                                <p className="text-sm sm:text-base text-slate-700 leading-relaxed whitespace-pre-line">
                                                                    {place.infor || place.des}
                                                                </p>
                                                            </div>

                                                            {/* BẢN ĐỒ VỊ TRÍ */}
                                                            <div className="space-y-3">
                                                                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                                                    <MapPin className="w-5 h-5 text-[#006971]" />
                                                                    <span>Bản đồ vị trí</span>
                                                                </h3>
                                                                <div className="rounded-3xl overflow-hidden border border-slate-200/90 shadow-xs">
                                                                    <PlaceMap mapUrl={place.mapUrl} />
                                                                </div>
                                                            </div>

                    {/* ĐÁNH GIÁ TỪ DU KHÁCH */}
                                                    <div className="space-y-6 pt-4 border-t border-slate-200">
                                                        <h3 className="text-xl font-bold text-slate-900">
                                                            Đánh giá từ du khách ({reviewList.length})
                                                        </h3>

                                                    {/* Form gửi đánh giá */}
                                                    <ReviewForm destinationId={place.id} onSuccess={fetchReviews} />

                                                            {/* Danh sách các đánh giá */}
                                                            {reviewsLoading ? (
                                                                <div className="flex items-center justify-center py-10 text-slate-400">
                                                                    <Loader2 className="w-7 h-7 animate-spin text-[#006971]" />
                                                                </div>
                                                            ) : reviewList.length > 0 ? (
                                                                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 divide-y divide-slate-100">
                                                                    {reviewList.map((review) => (
                                                                        <div key={review.id} className="pt-4 first:pt-0">
                                                                            <PlaceReview
                                                                                avataUrl={review.user?.avatarUrl}
                                                                                name={review.user?.fullName || 'Người dùng ẩn danh'}
                                                                                stars={review.rating}
                                                                                comment={review.comment}
                                                                                createdAt={review.createdAt}
                                                                                images={review.images}
                                                                            />
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            ) : (
                                                                <div className="py-8 text-center text-slate-500 bg-slate-50 rounded-2xl border border-slate-200/60">
                                                                    <p className="text-sm font-medium">
                                                                        Chưa có đánh giá nào cho địa điểm này. Hãy là người đầu tiên chia sẻ cảm nhận!
                                                                    </p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                {/* ================= CỘT PHẢI (1/3): THẺ HÀNH ĐỘNG STICKY ================= */}
                                                <aside className="w-full lg:sticky lg:top-24 space-y-4">
                                                    <PlaceAction
                                                        time={place.time}
                                                        price={place.priceDisplay}
                                                        move={place.move}
                                                        placeId={place.id}
                                                        placeName={place.name}
                                                        onAddToItinerary={() => router.push('/itinerary')}
                                                    />

                                                                    {/* Thẻ gợi ý nhanh */}
                                                                    <div className="bg-teal-50/60 rounded-2xl p-4 border border-teal-100 text-xs space-y-2 text-teal-900">
                                                                        <div className="font-bold flex items-center gap-1.5 text-[#006971]">
                                                                            <Calendar className="w-4 h-4" />
                                                                            <span>Mẹo du lịch</span>
                                                                        </div>
                                                                            <p className="text-slate-600 leading-relaxed text-2xs">
                                                                                Bạn có thể bấm &quot;Thêm vào lịch trình&quot; để tự tay sắp xếp thứ tự và giờ giấc ghé thăm {place.name} cùng danh sách các vật dụng cần mang theo.
                                                                            </p>
                                                                        </div>
                                                                </aside>
            </div>

                                                        {/* Modal Xem Ảnh Toàn Màn Hình (Fullscreen Lightbox) */}
                                                        {isLightboxOpen && currentImg && (
                                                            <div
                                                                className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6 select-none"
                                                                onClick={() => setIsLightboxOpen(false)}
                                                            >
                                                                <div className="flex items-center justify-between text-white z-30 w-full max-w-7xl mx-auto pb-2">
                                                                    <div>
                                                                        <h3 className="text-base sm:text-lg font-bold line-clamp-1">{place.name}</h3>
                                                                        {hasMultipleImages && (
                                <p className="text-xs text-slate-300">
                                    Ảnh {currentImageIndex + 1} / {place.images.length}
                                </p>
                            )}
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-xs text-slate-400 hidden sm:inline">Nhấn ESC để đóng</span>
                            <button
                                type="button"
                                onClick={() => setIsLightboxOpen(false)}
                                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                                aria-label="Đóng toàn màn hình"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                    </div>

                                                                    <div
                                                                        className="relative flex-1 w-full max-w-7xl mx-auto flex items-center justify-center my-auto min-h-0"
                                                                        onClick={(e) => e.stopPropagation()}
                                                                    >
                                                                        <div className="relative w-full h-[70vh] sm:h-[75vh] lg:h-[80vh] flex items-center justify-center">
                                                                            <Image
                                                                                src={currentImg}
                                                                                alt={`${place.name} - ảnh toàn màn hình ${currentImageIndex + 1}`}
                                                                                fill
                                                                                sizes="100vw"
                                                                                className="object-contain"
                                                                                priority
                                                                            />
                                                                        </div>

                                                                        {hasMultipleImages && (
                                                                            <>
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={handlePrevImage}
                                                                                    aria-label="Ảnh trước"
                                                                                    className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-md transition-all shadow-xl cursor-pointer border border-white/10"
                                                                                >
                                                                                    <ChevronLeft className="w-7 h-7" />
                                                                                </button>
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={handleNextImage}
                                                                                    aria-label="Ảnh tiếp theo"
                                                                                    className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-md transition-all shadow-xl cursor-pointer border border-white/10"
                                                                                >
                                                                                    <ChevronRight className="w-7 h-7" />
                                                                                </button>
                                                                            </>
                                                                        )}
                                                                    </div>

                                                                    {hasMultipleImages && (
                                                                        <div
                                                                            className="flex justify-center items-center gap-2 overflow-x-auto py-2 z-30 max-w-4xl mx-auto scrollbar-none"
                                                                            onClick={(e) => e.stopPropagation()}
                                                                        >
                                                                            {place.images.map((imgUrl, idx) => (
                                                                                <button
                                                                                    key={idx}
                                                                                    type="button"
                                                                                    onClick={() => setCurrentImageIndex(idx)}
                                                                                    className={`relative w-16 h-12 sm:w-20 sm:h-14 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${currentImageIndex === idx
                                                                                            ? 'border-[#006971] ring-2 ring-[#006971]/60 scale-105 opacity-100'
                                                                                            : 'border-transparent opacity-50 hover:opacity-90'
                                                                                        }`}
                                                                                >
                                                                                    <Image
                                                                                        src={imgUrl}
                                                                                        alt={`Thumbnail ${idx + 1}`}
                                                                                        fill
                                                                                        sizes="80px"
                                                                                        className="object-cover"
                                                                                    />
                                                                                </button>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>
            )}
                                                            </section>
                                                        );
}
