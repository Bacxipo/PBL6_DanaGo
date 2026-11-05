'use client';

import { useState, useRef } from 'react';
import { Star, Send, X, Loader2, UploadCloud } from 'lucide-react';
import { uploadReviewImage, createReview } from '@/lib/review-api';

export default function ReviewForm({ destinationId, onSuccess }) {
    const fileInputRef = useRef(null);

    const [rating, setRating] = useState(5);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    
    // Lưu các File thực tế được chọn từ máy
    const [selectedFiles, setSelectedFiles] = useState([]);
    // Lưu URL xem trước (blob) để hiển thị lên màn hình
    const [previewUrls, setPreviewUrls] = useState([]);
    
    const [loading, setLoading] = useState(false);
    const [uploadingStatus, setUploadingStatus] = useState('');
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);

    // Xử lý khi người dùng chọn ảnh từ File Explorer hoặc Thư viện điện thoại
    const handleFileChange = (e) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;

        if (selectedFiles.length + files.length > 5) {
            setError('Bạn chỉ được chọn tối đa 5 bức ảnh.');
            return;
        }

        for (const file of files) {
            if (file.size > 5 * 1024 * 1024) {
                setError(`File ${file.name} vượt quá 5MB. Vui lòng chọn ảnh nhỏ hơn.`);
                return;
            }
        }

        setError(null);

        // Tạo URL xem trước tức thì
        const newPreviews = files.map((file) => URL.createObjectURL(file));

        setSelectedFiles((prev) => [...prev, ...files]);
        setPreviewUrls((prev) => [...prev, ...newPreviews]);

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Xóa ảnh đã chọn
    const handleRemoveImage = (index) => {
        URL.revokeObjectURL(previewUrls[index]);
        setSelectedFiles((prev) => prev.filter((_, idx) => idx !== index));
        setPreviewUrls((prev) => prev.filter((_, idx) => idx !== index));
    };

    // Gửi bài đánh giá
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccessMsg(null);
        // Lấy token đăng nhập
        const token = typeof window !== 'undefined'
            ? sessionStorage.getItem('accessToken') || localStorage.getItem('token') || localStorage.getItem('accessToken')
            : null;
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
         setUploadingStatus('Đang gửi đánh giá và tải ảnh lên...');

         // Đóng gói các trường và file ảnh vào FormData
         const formData = new FormData();
         formData.append('destinationId', destinationId);
         formData.append('rating', rating);
         if (comment.trim()) {
             formData.append('comment', comment.trim());
         }

         for (const file of selectedFiles) {
             formData.append('images', file);
         }
         await createReview(formData, token);
         setSuccessMsg('Đánh giá của bạn đã được gửi thành công!');
         setComment('');
         setSelectedFiles([]);
         setPreviewUrls([]);
         setRating(5);
         if (onSuccess) onSuccess();
         } catch (err) {
             setError(err.message || 'Đã có lỗi xảy ra.');
         } finally {
             setLoading(false);
             setUploadingStatus('');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs space-y-4">
            <h4 className="font-bold text-gray-800 text-lg">Viết đánh giá của bạn</h4>

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

            {/* KHU VỰC CHỌN ẢNH TỪ MÁY TÍNH / ĐIỆN THOẠI */}
            <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-600">
                    Hình ảnh thực tế (Tối đa 5 ảnh, dung lượng dưới 5MB/ảnh)
                </label>

                {/* Thẻ input file ẩn */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                />

                {/* Nút bấm mở File Explorer / Thư viện ảnh */}
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={selectedFiles.length >= 5}
                    className="w-full py-3 px-4 border-2 border-dashed border-gray-300 hover:border-[#006971] rounded-xl flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-[#006971] transition-all bg-gray-50/50 hover:bg-gray-50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <UploadCloud className="w-5 h-5 text-[#006971]" />
                    <span className="font-medium">
                        {selectedFiles.length >= 5
                            ? 'Đã chọn đủ tối đa 5 ảnh'
                            : 'Nhấn vào đây để tải ảnh từ máy tính hoặc thư viện điện thoại'}
                    </span>
                </button>

                {/* Danh sách ảnh xem trước (Thumbnails) */}
                {previewUrls.length > 0 && (
                    <div className="flex flex-wrap gap-2.5 pt-2">
                        {previewUrls.map((url, index) => (
                            <div key={index} className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200 shadow-xs group">
                                <img src={url} alt={`Ảnh xem trước ${index + 1}`} className="w-full h-full object-cover" />
                                <button
                                    type="button"
                                    onClick={() => handleRemoveImage(index)}
                                    className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-red-600 text-white rounded-full transition-colors cursor-pointer"
                                    title="Xóa ảnh này"
                                >
                                    <X className="w-3.5 h-3.5" />
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
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>{uploadingStatus || 'Đang xử lý...'}</span>
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