'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Loader2, AlertCircle, Image as ImageIcon } from 'lucide-react';
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

                const hasImg = data.images && data.images.length > 0 && data.images[0]?.imageUrl;

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
                    img: hasImg ? data.images[0].imageUrl : null,
                });
            } catch (err) {
                console.error('Lỗi khi tải chi tiết điểm đến:', err);
                setError(err.message || 'Không thể tải thông tin điểm đến.');
            } finally {
                setLoading(false);
            }
        };

        fetchDetail();
    }, [id]);

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

    return (
        <section className="w-full max-w-7xl mx-auto space-y-6 pb-12 flex flex-col">
            <Link
                href="/explore"
                className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-[#006971] transition-colors"
            >
                <ArrowLeft className="w-4 h-4" /> Quay lại
            </Link>
            <div className="flex w-full">
                <div className="w-2/3 flex flex-col">
                    <div className="relative w-full h-[400px] rounded-xl overflow-hidden bg-gray-100">
                        {place.img ? (
                            <Image
                                src={place.img}
                                alt={place.name}
                                fill
                                sizes="(max-width: 1200px) 100vw, 800px"
                                className="object-cover rounded-xl"
                                priority
                            />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50 border border-gray-200 rounded-xl select-none">
                                <div className="w-16 h-16 rounded-full bg-gray-200/60 flex items-center justify-center text-gray-400 mb-2">
                                    <ImageIcon className="w-8 h-8 stroke-[1.5]" />
                                </div>
                                <p className="text-sm font-medium text-gray-500">Chưa có hình ảnh cho điểm đến này</p>
                            </div>
                        )}
                    </div>
                    <p className="text-[#006971] font-bold mt-2 text-sm">{place.category}</p>
                </div>
                <PlaceAction time={place.time} price={place.priceDisplay} move={place.move} />
            </div>
            <div className="w-2/3 flex flex-col gap-3">
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
                <div className="w-2/3 flex flex-col gap-6 mt-6">
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