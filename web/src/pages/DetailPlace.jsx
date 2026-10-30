'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Loader2, AlertCircle, Image as ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import PlaceAction from '../components/comon/place/PlaceAction';
import PlaceMap from '../components/comon/place/PlaceMap';
import { reviews } from '../database/data';
import PlaceReview from '../components/comon/review/PlaceReview';
import ReviewForm from '../components/comon/review/ReviewForm';
import { useEffect, useState } from 'react';
import Image from 'next/image';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function DetailPlace({ id: propId }) {
    const params = useParams();
    const id = propId || params?.id;

    const [place, setPlace] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            window.scrollTo(0, 0);
        }

        if (!id) return;

        const fetchDetail = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(`${API_BASE_URL}/destinations/${id}`);
                if (!res.ok) {
                    throw new Error(`Không tìm thấy điểm đến (Mã lỗi: ${res.status})`);
                }
                const data = await res.json();

                // Lấy toàn bộ danh sách URL ảnh
                let imagesList = [];
                if (data.images && Array.isArray(data.images) && data.images.length > 0) {
                    imagesList = data.images
                        .map((img) => (typeof img === 'string' ? img : img?.imageUrl))
                        .filter(Boolean);
                } else if (data.img) {
                    imagesList = [typeof data.img === 'string' ? data.img : data.img?.src].filter(Boolean);
                }

                // Chuẩn hóa map URL thành embed url nếu cần
                let embedMap = data.addressUrl;
                if (!embedMap || !embedMap.includes('embed')) {
                    embedMap = `https://maps.google.com/maps?q=${encodeURIComponent(
                        (data.name || '') + ' ' + (data.district || '') + ' Đà Nẵng'
                    )}&output=embed`;
                }

                setPlace({
                    id: data.id,
                    name: data.name,
                    category: data.categoryName || 'Địa điểm du lịch',
                    des: data.description || 'Điểm đến hấp dẫn tại Đà Nẵng.',
                    infor: data.description || 'Chưa có thông tin chi tiết bổ sung.',
                    time: data.openHours || '08:00 - 18:00',
                    priceDisplay: data.ticketPrice || 'Miễn phí',
                    move: 'Xe máy, ô tô, taxi',
                    mapUrl: embedMap,
                    images: imagesList,
                    img: imagesList[0] || null,
                });
                setCurrentImageIndex(0);
            } catch (err) {
                console.error('Lỗi khi tải chi tiết điểm đến:', err);
                setError(err.message || 'Không thể tải thông tin điểm đến.');
            } finally {
                setLoading(false);
            }
        };

        fetchDetail();
    }, [id]);

    const handlePrevImage = (e) => {
        e.stopPropagation();
        if (!place?.images?.length) return;
        setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : place.images.length - 1));
    };

    const handleNextImage = (e) => {
        e.stopPropagation();
        if (!place?.images?.length) return;
        setCurrentImageIndex((prev) => (prev < place.images.length - 1 ? prev + 1 : 0));
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 text-gray-500 py-20">
                <Loader2 className="w-8 h-8 animate-spin text-[#006971]" />
                <p className="text-sm font-medium">Đang tải chi tiết điểm đến...</p>
            </div>
        );
    }

    if (error || !place) {
        return (
            <div className="text-center py-20 flex flex-col items-center gap-4">
                <AlertCircle className="w-12 h-12 text-red-500" />
                <h2 className="text-2xl font-bold text-gray-700">
                    {error || 'Không tìm thấy địa điểm!'}
                </h2>
                <Link
                    href="/explore"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#006971] text-white rounded-lg font-semibold hover:bg-[#00555c] transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" /> Quay lại danh sách khám phá
                </Link>
            </div>
        );
    }

    const currentImg = place.images?.[currentImageIndex] || place.img;
    const hasMultipleImages = place.images && place.images.length > 1;

    return (
        <section className="w-full max-w-7xl mx-auto space-y-6 pb-12 flex flex-col">
            <Link
                href="/explore"
                className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-[#006971] transition-colors"
            >
                <ArrowLeft className="w-4 h-4" /> Quay lại
            </Link>

            <div className="flex flex-col lg:flex-row gap-6 w-full">
                {/* Khu vực hiển thị Slider hình ảnh */}
                <div className="w-full lg:w-2/3 flex flex-col">
                    <div className="relative w-full h-[400px] rounded-xl overflow-hidden bg-gray-100 group select-none shadow-xs">
                        {currentImg ? (
                            <>
                                <Image
                                    src={currentImg}
                                    alt={`${place.name} - ảnh ${currentImageIndex + 1}`}
                                    fill
                                    sizes="(max-width: 1200px) 100vw, 800px"
                                    className="object-cover rounded-xl transition-all duration-300"
                                    priority
                                />

                                {/* Nút điều hướng qua lại (Prev / Next) */}
                                {hasMultipleImages && (
                                    <>
                                        <button
                                            type="button"
                                            onClick={handlePrevImage}
                                            aria-label="Ảnh trước"
                                            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs transition-all shadow-md cursor-pointer opacity-80 group-hover:opacity-100"
                                        >
                                            <ChevronLeft className="w-6 h-6" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleNextImage}
                                            aria-label="Ảnh tiếp theo"
                                            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs transition-all shadow-md cursor-pointer opacity-80 group-hover:opacity-100"
                                        >
                                            <ChevronRight className="w-6 h-6" />
                                        </button>

                                        {/* Badge đếm số ảnh: ví dụ 1 / 4 */}
                                        <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-xs text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                                            {currentImageIndex + 1} / {place.images.length}
                                        </div>

                                        {/* Dots điều hướng ở đáy ảnh */}
                                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/30 backdrop-blur-xs px-2.5 py-1 rounded-full">
                                            {place.images.map((_, idx) => (
                                                <button
                                                    key={idx}
                                                    type="button"
                                                    onClick={() => setCurrentImageIndex(idx)}
                                                    className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                                                        currentImageIndex === idx ? 'bg-white w-4' : 'bg-white/50 hover:bg-white/80'
                                                    }`}
                                                    aria-label={`Xem ảnh ${idx + 1}`}
                                                />
                                            ))}
                                        </div>
                                    </>
                                )}
                            </>
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50 border border-gray-200 rounded-xl select-none">
                                <div className="w-16 h-16 rounded-full bg-gray-200/60 flex items-center justify-center text-gray-400 mb-2">
                                    <ImageIcon className="w-8 h-8 stroke-[1.5]" />
                                </div>
                                <p className="text-sm font-medium text-gray-500">Chưa có hình ảnh cho điểm đến này</p>
                            </div>
                        )}
                    </div>

                    {/* Dải ảnh nhỏ xem trước (Thumbnail Strip) nếu có từ 2 ảnh trở lên */}
                    {hasMultipleImages && (
                        <div className="flex gap-2.5 overflow-x-auto py-3 scrollbar-thin scrollbar-thumb-gray-300">
                            {place.images.map((imgUrl, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => setCurrentImageIndex(idx)}
                                    className={`relative w-20 h-14 rounded-lg overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                                        currentImageIndex === idx
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

                    <p className="text-[#006971] font-bold mt-2 text-sm">{place.category}</p>
                </div>

                <div className="w-full lg:w-1/3">
                    <PlaceAction time={place.time} price={place.priceDisplay} move={place.move} />
                </div>
            </div>

            <div className="w-full lg:w-2/3 flex flex-col gap-3">
                <h2 className="text-2xl font-bold text-gray-800">{place.name}</h2>
                <p className="text-gray-600 mt-2">{place.des}</p>
                <div className="items-center gap-2 mt-3 p-3 bg-gray-50 rounded-xl">
                    <span className="font-bold text-gray-800 block mb-1">Về địa điểm này</span>
                    <p className="text-gray-600 leading-relaxed">{place.infor}</p>
                </div>
            </div>

            <div>
                <PlaceMap mapUrl={place.mapUrl} />
            </div>

            <div className="w-full flex flex-col gap-3">
                <div className="w-full lg:w-2/3 flex flex-col gap-6 mt-6">
                    <ReviewForm />
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
