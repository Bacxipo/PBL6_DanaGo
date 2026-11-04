'use client';

import { useState } from 'react';
import { Star, Send, Image as ImageIcon, X, Plus, Loader2 } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function ReviewForm({ destinationId, onSuccess }) {
    const [rating, setRating] = useState(5);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [images, setImages] = useState([]);
    const [imageUrlInput, setImageUrlInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);

    // Thêm link ảnh vào danh sách
    const handleAddImage = () => {
        if (!imageUrlInput.trim()) return;
        if (images.length >= 5) {
            setError('Bạn chỉ được đính kèm tối đa 5 ảnh.');
            return;
        }
        setImages([...images, imageUrlInput.trim()]);
        setImageUrlInput('');
        setError(null);
    };

    // Xóa ảnh đã chọn khỏi danh sách xem trước
    const handleRemoveImage = (index) => {
        setImages(images.filter((_, idx) => idx !== index));
    };

    // Gửi đánh giá lên Backend
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccessMsg(null);

        // Lấy token từ localStorage (hoặc cookie)
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') || localStorage.getItem('accessToken') : null;
        if (!token) {
            setError('Vui lòng đăng nhập để gửi đánh giá.');
            return;
        }

        if (!comment.trim()) {
            setError('Vui lòng nhập nội dung đánh giá của bạn.');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/community/reviews`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    destinationId: Number(destinationId),
                    rating,
                    comment,
                    images: images.length > 0 ? images : undefined,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Không thể gửi đánh giá.');
            }

            setSuccessMsg('Đánh giá của bạn đã được gửi thành công và đang chờ Admin duyệt!');
            setComment('');
            setImages([]);
            setRating(5);

            if (onSuccess) onSuccess();
        } catch (err) {
            setError(err.message || 'Đã có lỗi xảy ra.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs space-y-4">
            <h4 className="font-bold text-gray-800 text-lg">Viết đánh giá của bạn</h4>

            {/* Thông báo lỗi / thành công */}
            {error && <p className="text-sm text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200">{error}</p>}
            {successMsg && <p className="text-sm text-green-700 bg-green-50 p-2.5 rounded-lg border border-green-200">{successMsg}</p>}

            {/* Chọn số sao tương tác */}
            <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Mức độ hài lòng</label>
                <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            className="p-1 transition-transform hover:scale-110 focus:outline-hidden cursor-pointer"
                        >
                            <Star
                                size={24}
                                className={
                                    (hoverRating || rating) >= star
                                        ? 'text-amber-400 fill-amber-400'
                                        : 'text-gray-300'
                                }
                            />
                        </button>
                    ))}
                    <span className="text-xs font-bold text-gray-700 ml-2">
                        {rating === 5 && 'Tuyệt vời (5/5)'}
                        {rating === 4 && 'Rất tốt (4/5)'}
                        {rating === 3 && 'Bình thường (3/5)'}
                        {rating === 2 && 'Chưa hài lòng (2/5)'}
                        {rating === 1 && 'Tệ (1/5)'}
                    </span>
                </div>
            </div>

            {/* Ô nhập bình luận */}
            <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Nội dung đánh giá</label>
                <textarea
                    rows={3}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Chia sẻ trải nghiệm thực tế của bạn về cảnh quan, dịch vụ, giá cả..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#006971]/30 focus:border-[#006971] text-sm resize-none"
                />
            </div>

            {/* Khu vực THÊM HÌNH ẢNH */}
            <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-600">Hình ảnh trải nghiệm (Tối đa 5 ảnh)</label>
                
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <ImageIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="url"
                            value={imageUrlInput}
                            onChange={(e) => setImageUrlInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddImage())}
                            placeholder="Dán đường link ảnh (URL)..."
                            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-[#006971]/30 focus:border-[#006971]"
                        />
                    </div>
                    <button
                        type="button"
                        onClick={handleAddImage}
                        className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                        <Plus className="w-3.5 h-3.5" /> Thêm ảnh
                    </button>
                </div>

                {/* Danh sách ảnh xem trước (Thumbnails) */}
                {images.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                        {images.map((imgUrl, index) => (
                            <div key={index} className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200 group shadow-xs">
                                <img src={imgUrl} alt={`Ảnh ${index + 1}`} className="w-full h-full object-cover" />
                                <button
                                    type="button"
                                    onClick={() => handleRemoveImage(index)}
                                    className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-red-600 text-white rounded-full transition-colors cursor-pointer"
                                    title="Xóa ảnh này"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Nút gửi đánh giá */}
            <div className="pt-2">
                <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#006971] hover:bg-[#005258] disabled:bg-gray-400 text-white rounded-lg font-semibold text-sm transition-colors shadow-xs cursor-pointer"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" /> Đang gửi...
                        </>
                    ) : (
                        <>
                            <Send size={15} /> Gửi đánh giá
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}