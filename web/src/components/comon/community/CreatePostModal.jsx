'use client';

import React, { useEffect, useRef, useState } from 'react';
import { User, X, Image as ImageIcon, MapPin, Store, Sparkles, HelpCircle } from 'lucide-react';

import ExperiencePostForm from './ExperiencePostForm';
import NewPlacePostForm from './NewPlacePostForm';

import { createFeedPost, getFeedCategories, uploadFeedImage } from '@/lib/feed-api';

const INITIAL_PLACE_DATA = {
  placeName: '',
  district: '',
  categoryId: '',
  addressUrl: '',
  openTime: '07:00',
  closeTime: '22:30',
  isFree: false,
  priceFrom: '25.000',
  priceTo: '65.000',
  description: '',
};
export default function CreatePostModal({ isOpen, onClose, onAddPost }) {
  const fileInputRef = useRef(null);

  const [postType, setPostType] = useState('trai-nghiem');
  const [content, setContent] = useState('');

  const [files, setFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState([]);
  const [categoryError, setCategoryError] = useState('');
  const [placeData, setPlaceData] = useState({
    ...INITIAL_PLACE_DATA,
  });

  useEffect(() => {
    if (!isOpen) return;

    let active = true;

    getFeedCategories()
      .then((data) => {
        if (active) {
          setCategories(data);
          setCategoryError('');
        }
      })
      .catch(() => {
        if (active) {
          setCategoryError('Không tải được danh mục. Bạn có thể bỏ trống hoặc mở lại cửa sổ để thử lại.');
        }
      });

    return () => {
      active = false;
    };
  }, [isOpen]);



  const handlePlaceFieldChange = (field, value) => {
    setPlaceData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    setError('');

    const token = sessionStorage.getItem('accessToken');

    if (!token) {
      setError('Vui lòng đăng nhập trước khi đăng bài.');
      return;
    }

    const isNewDestination = postType === 'dia-diem-moi';

    const postContent = isNewDestination
      ? placeData.description.trim()
      : content.trim();

    if (!postContent) {
      setError(
        isNewDestination
          ? 'Vui lòng nhập mô tả địa điểm.'
          : 'Vui lòng nhập nội dung bài viết.',
      );
      return;
    }

    if (isNewDestination) {
      if (!placeData.placeName.trim()) {
        setError('Vui lòng nhập tên địa điểm.');
        return;
      }

      if (!placeData.district.trim()) {
        setError('Vui lòng nhập quận/huyện.');
        return;
      }

      if (!files.length) {
        setError('Vui lòng chọn ít nhất một ảnh thực tế.');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const images = [];

      for (const file of files) {
        images.push(await uploadFeedImage(file, token));
      }

      const post = await createFeedPost(
        {
          content: postContent,
          images,
          postType: isNewDestination
            ? 'NEW_DESTINATION'
            : postType === 'hoi-dap'
              ? 'QUESTION'
              : 'NORMAL',

          ...(isNewDestination
            ? {
              proposal: {
                name: placeData.placeName.trim(),
                district: placeData.district.trim(),
                description: placeData.description.trim(),
                categoryId: placeData.categoryId
                  ? Number(placeData.categoryId)
                  : undefined,
                addressUrl:
                  placeData.addressUrl.trim() || undefined,
                ticketPrice: placeData.isFree
                  ? 'Miễn phí'
                  : `Khoảng giá: ${placeData.priceFrom} - ${placeData.priceTo}đ`,
                openHours:
                  `${placeData.openTime} - ${placeData.closeTime}`,
              },
            }
            : {}),
        },
        token,
      );

      setContent('');
      setFiles([]);
      setPlaceData({ ...INITIAL_PLACE_DATA });

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      onAddPost?.(post);
      onClose();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Đăng bài thất bại.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div
        className="bg-white rounded-3xl p-6 shadow-2xl max-w-lg w-full relative space-y-5 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 p-1 hover:bg-gray-100 rounded-full transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <h3 className="text-lg font-bold text-gray-900">
            Tạo bài viết mới
          </h3>
        </div>

        {/* User profile & Tags */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-100 border border-gray-500 text-slate-400 flex items-center justify-center shrink-0 overflow-hidden group-hover:border-teal-500 transition-colors">
              <User className="w-6 h-6" />
            </div>

            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-900 text-base">abc_user</span>

              {postType === 'trai-nghiem' && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-teal-50 text-[#006971] px-2 py-0.5 rounded-full border border-teal-100">
                  <Sparkles size={11} />
                  Trải nghiệm
                </span>
              )}

              {postType === 'hoi-dap' && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200">
                  <HelpCircle size={11} />
                  Hỏi đáp
                </span>
              )}

              {postType === 'dia-diem-moi' && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
                  <Store size={11} />
                  Địa điểm mới
                </span>
              )}
            </div>
          </div>

          {/* 3 Nút chọn loại */}
          <div className="flex items-center gap-2">
            <button
              disabled={isSubmitting}
              type="button"
              onClick={() => setPostType('trai-nghiem')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${postType === 'trai-nghiem'
                ? 'bg-[#006971] text-white shadow-xs'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
            >
              Trải nghiệm
            </button>

            <button
              disabled={isSubmitting}
              type="button"
              onClick={() => setPostType('hoi-dap')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${postType === 'hoi-dap'
                ? 'bg-[#006971] text-white shadow-xs'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
            >
              Hỏi đáp
            </button>

            <button
              disabled={isSubmitting}
              type="button"
              onClick={() => setPostType('dia-diem-moi')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${postType === 'dia-diem-moi'
                ? 'bg-[#006971] text-white shadow-xs'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
            >
              Địa điểm mới
            </button>
          </div>
        </div>

        {postType === 'dia-diem-moi' ? (
          <NewPlacePostForm
            placeData={placeData}
            onChangeField={handlePlaceFieldChange}
            categories={categories}
          />
        ) : (
          <ExperiencePostForm
            postType={postType}
            content={content}
            onChangeContent={setContent}
          />
        )}
        {/* phần chọn ảnh tại đây */}
        <input
          ref={fileInputRef}
          hidden
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          disabled={isSubmitting}
          onChange={(e) => {
            const selected = Array.from(e.target.files || []);

            if (selected.length > 5) {
              setError('Chỉ được chọn tối đa 5 ảnh.');
              e.target.value = '';
              return;
            }

            if (
              selected.some(
                (file) =>
                  !['image/jpeg', 'image/png', 'image/webp'].includes(file.type) ||
                  file.size > 5 * 1024 * 1024,
              )
            ) {
              setError('Ảnh phải là JPG, PNG hoặc WebP, tối đa 5MB mỗi ảnh.');
              e.target.value = '';
              return;
            }

            setError('');
            setFiles(selected);
          }}
        />

        <p className="text-sm text-gray-500">
          Đã chọn {files.length}/5 ảnh
        </p>

        {postType === 'dia-diem-moi' && categoryError && (
          <p role="alert" className="text-sm text-amber-700">
            {categoryError}
          </p>
        )}

        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}

        {/* Attachment Toolbar */}
        <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
          <span className="text-xs sm:text-sm font-semibold text-gray-800">
            Thêm vào bài viết của bạn
          </span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              title="Thêm ảnh"
              aria-label="Chọn ảnh cho bài viết"
              disabled={isSubmitting}
              onClick={() => fileInputRef.current?.click()}
              className="text-[#00a896] hover:opacity-80 p-1 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ImageIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Nút Đăng */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={
            isSubmitting ||
            (
              postType === 'dia-diem-moi'
                ? !placeData.placeName.trim() ||
                !placeData.district.trim() ||
                !placeData.description.trim() ||
                files.length === 0
                : !content.trim()
            )
          }
          className="w-full py-3 bg-[#006971] hover:bg-[#00555c] text-white font-bold rounded-full text-sm transition cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Đang đăng...' : 'Đăng'}
        </button>
      </div>
    </div>
  );
}
