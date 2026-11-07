'use client';

import React, { useEffect, useState } from 'react';

import ExperiencePostForm from './ExperiencePostForm';
import NewPlacePostForm from './NewPlacePostForm';
import CreatePostHeader from './CreatePostHeader';
import PostAuthorInfo from './PostAuthorInfo';
import PostTypeSelector from './PostTypeSelector';
import PostImagePicker from './PostImagePicker';

import { createFeedPost, getFeedCategories, getMyProfile } from '@/lib/feed-api';

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

  const [postType, setPostType] = useState('trai-nghiem');
  const [content, setContent] = useState('');

  const [files, setFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState([]);
  const [categoryError, setCategoryError] = useState('');
  const [profile, setProfile] = useState(null);
  const [profileStatus, setProfileStatus] = useState('loading');
  const [placeData, setPlaceData] = useState({
    ...INITIAL_PLACE_DATA,
  });

  useEffect(() => {
    if (!isOpen) return;
    let active = true;

    async function loadProfile() {
      setProfile(null);
      setProfileStatus('loading');
      const token = sessionStorage.getItem('accessToken');
      if (!token) {
        setProfileStatus('signed-out');
        return;
      }
      try {
        const user = await getMyProfile(token);
        if (!active || token !== sessionStorage.getItem('accessToken')) return;
        setProfile(user);
        setProfileStatus('ready');
      } catch {
        if (active) setProfileStatus('error');
      }
    }

    loadProfile();
    return () => { active = false; };
  }, [isOpen]);

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

  const handleRemoveImage = (index) => {
    setFiles((prev) => prev.filter((_, fileIndex) => fileIndex !== index));
    setError('');
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
      const post = await createFeedPost(
        {
          content: postContent,
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
        files,
        token,
      );

      setContent('');
      setFiles([]);
      setPlaceData({ ...INITIAL_PLACE_DATA });


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
        <CreatePostHeader onClose={onClose} />
        <div className="space-y-3">
          <PostAuthorInfo profile={profile} profileStatus={profileStatus} postType={postType} />
          <PostTypeSelector postType={postType} onChange={setPostType} disabled={isSubmitting} />
        </div>

        {postType === 'dia-diem-moi' ? (
          <NewPlacePostForm
            placeData={placeData}
            onChangeField={handlePlaceFieldChange}
            categories={categories}
            files={files}
            onRemoveImage={handleRemoveImage}
            isSubmitting={isSubmitting}
          />
        ) : (
          <ExperiencePostForm
            postType={postType}
            content={content}
            onChangeContent={setContent}
            files={files}
            onRemoveImage={handleRemoveImage}
            isSubmitting={isSubmitting}
          />
        )}
        <PostImagePicker
          files={files}
          onFilesChange={setFiles}
          onRemoveImage={handleRemoveImage}
          onError={setError}
          disabled={isSubmitting}
          showPreview={false}
        >
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
        </PostImagePicker>

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
