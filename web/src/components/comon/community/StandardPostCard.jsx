'use client';

import React, { useEffect, useState } from 'react';
import { MoreVertical, Heart, MessageCircle, Store, HelpCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import ContentPost from './ContentPost';
import NewPlacePost from './NewPlacePost';
import PostCommentSection from './PostCommentSection';
import EditPostForm from './EditPostForm';
import UserAvatar from '@/components/comon/ui/UserAvatar';

import { toggleFeedLike, deleteFeedPost, updateFeedPost, } from '@/lib/feed-api';

export default function StandardPostCard({ post, currentUserId, onDeleted, onUpdated }) {
  const router = useRouter();
  const [isLiked, setIsLiked] = useState(post?.isLiked || false);
  const [likesCount, setLikesCount] = useState(post?.likes || 0);

  const [isLiking, setIsLiking] = useState(false);
  const [likeError, setLikeError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(null);

  useEffect(() => {
    const syncAuth = () => {
      setIsLoggedIn(Boolean(sessionStorage.getItem('accessToken')));
      setLikeError('');
    };
    syncAuth();
    window.addEventListener('auth-changed', syncAuth);
    return () => window.removeEventListener('auth-changed', syncAuth);
  }, []);

  const [commentsCount, setCommentsCount] = useState(
    post?.commentsCount ?? 0
  );

  const [isDeleting, setIsDeleting] = useState(false);
  const [actionError, setActionError] = useState('');

  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const isOwner = currentUserId === post.userId;
  const canInteract = post.status === 'APPROVED';
  const statusBadge = {
    PENDING: { label: 'Chờ duyệt', color: 'bg-amber-50 text-amber-700' },
    APPROVED: { label: 'Đã duyệt', color: 'bg-emerald-50 text-emerald-700' },
    REJECTED: { label: 'Bị từ chối', color: 'bg-red-50 text-red-700' },
  }[post.status];

  const [showComments, setShowComments] = useState(false);

  const toggleComments = () => {
    if (!canInteract) return;
    setLikeError('');
    setShowComments((previous) => !previous);
  };

  const rawPostType = post?.postType || post?.type || 'trai-nghiem';

  const postType = {
    NORMAL: 'trai-nghiem',
    QUESTION: 'hoi-dap',
    NEW_DESTINATION: 'dia-diem-moi',
  }[rawPostType] || rawPostType;

  const toggleLike = async () => {
    if (isLiking || !canInteract) return;

    setLikeError('');

    const token = sessionStorage.getItem('accessToken');

    if (!token) {
      setIsLoggedIn(false);
      router.push('/login');
      return;
    }

    setIsLiking(true);

    try {
      const result = await toggleFeedLike(post.id, token);

      if (result.liked !== isLiked) {
        setLikesCount((previous) =>
          Math.max(0, previous + (result.liked ? 1 : -1))
        );
      }

      setIsLiked(result.liked);
    } catch (error) {
      setLikeError(
        error instanceof Error
          ? error.message
          : 'Không thể cập nhật lượt thích.'
      );
    } finally {
      setIsLiking(false);
    }
  };

  const renderAvatar = () => (
    <UserAvatar user={{ avatarUrl: post?.user?.avatar, fullName: post?.user?.name }} size={40} />
  );

  const handleDelete = async () => {
    if (isDeleting) return;

    const confirmed = window.confirm(
      'Bạn có chắc muốn xóa bài viết này?'
    );

    if (!confirmed) return;

    setActionError('');

    const token = sessionStorage.getItem('accessToken');

    if (!token) {
      setActionError('Bạn cần đăng nhập.');
      return;
    }

    setIsDeleting(true);

    try {
      await deleteFeedPost(post.id, token);
      onDeleted?.(post.id);
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : 'Không thể xóa bài viết.'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const openEdit = () => {
    setEditContent(post.content);
    setActionError('');
    setIsEditing(true);
  };

  const handleSave = async (event) => {
    event.preventDefault();

    const content = editContent.trim();

    if (!content || isSaving || isDeleting) return;

    setActionError('');

    const token = sessionStorage.getItem('accessToken');

    if (!token) {
      setActionError('Bạn cần đăng nhập để chỉnh sửa bài viết.');
      return;
    }

    setIsSaving(true);

    try {
      const updatedPost = await updateFeedPost(
        post.id,
        content,
        token
      );

      onUpdated?.(updatedPost);
      setIsEditing(false);
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : 'Không thể cập nhật bài viết.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mb-6 space-y-4 rounded-3xl border border-slate-200/70 bg-white p-5 shadow-[0_4px_24px_-16px_rgba(7,61,70,0.2)] transition-shadow hover:shadow-md">

      {/* ================= 1. HEADER ================= */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Link href={`/personal/${post.userId}`} aria-label={`Xem trang cá nhân của ${post?.user?.name || 'tác giả'}`}>
            {renderAvatar()}
          </Link>
          <div>
            <h4 className="font-bold text-gray-900 text-base leading-tight">
              <Link href={`/personal/${post.userId}`} className="hover:text-[#006971] hover:underline">
                {post?.user?.name || 'Người dùng'}
              </Link>
            </h4>
            <span className="text-xs text-gray-400 font-normal">
              {post?.date || 'Vừa xong'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isOwner && statusBadge && (
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusBadge.color}`}>
              {statusBadge.label}
            </span>
          )}
          {postType === 'trai-nghiem' && (
            <span className="text-xs font-semibold text-[#006971]">
              Trải nghiệm
            </span>
          )}

          {postType === 'hoi-dap' && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-amber-50 text-amber-700 px-2.5 py-0.5 rounded-full border border-amber-200">
              <HelpCircle size={12} />
              Hỏi đáp
            </span>
          )}

          {postType === 'dia-diem-moi' && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-200">
              <Store size={12} />
              Địa điểm mới
            </span>
          )}

          {isOwner && (
            <details className="relative">
              <summary
                aria-label="Tùy chọn bài viết"
                className="list-none cursor-pointer p-1 text-gray-400 hover:text-gray-600"
              >
                <MoreVertical className="w-4 h-4" />
              </summary>

              <div className="absolute right-0 top-full z-20 mt-2 w-48 rounded-xl border border-gray-100 bg-white p-1 shadow-lg">
                <button
                  type="button"
                  onClick={openEdit}
                  disabled={isDeleting || isSaving}
                  className="w-full rounded-lg px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Chỉnh sửa bài viết
                </button>

                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting || isSaving}
                  className="w-full rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  {isDeleting ? 'Đang xóa...' : 'Xóa bài viết'}
                </button>
              </div>
            </details>
          )}
        </div>
      </div>

      {actionError && !isEditing && (
        <p role="alert" className="text-sm text-red-600">
          {actionError}
        </p>
      )}

      {isEditing && (
        <EditPostForm
          images={post.images}
          postId={post.id}
          content={editContent}
          onContentChange={setEditContent}
          onSubmit={handleSave}
          onCancel={() => {
            setIsEditing(false);
            setActionError('');
          }}
          isSaving={isSaving}
          isDeleting={isDeleting}
          error={actionError}
        />
      )}

      {/* ================= 2. NỘI DUNG ================= */}
      {postType === 'dia-diem-moi' ? (
        <NewPlacePost post={post} />
      ) : (
        <ContentPost post={post} />
      )}

      {/* ================= 3. THỐNG KÊ (YÊU THÍCH - BÌNH LUẬN) ================= */}
      <div className="flex items-center justify-between text-xs text-gray-500 font-medium px-1 pt-1">
        <span>{likesCount} yêu thích</span>
        <button
          type="button"
          onClick={toggleComments}
          disabled={!canInteract}
          className="hover:underline hover:text-[#006971] cursor-pointer"
        >
          {commentsCount} bình luận
        </button>
      </div>

      {/* ================= 4. HÀNG NÚT HÀNH ĐỘNG ================= */}
      <div className="border-t border-gray-100 pt-3 flex items-center justify-around text-gray-600 font-semibold text-sm">
        <button
          type="button"
          disabled={isLiking || !canInteract}
          aria-pressed={isLiked}
          onClick={toggleLike}
          className={`flex items-center gap-2 enabled:hover:text-rose-500 transition cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 py-1.5 px-4 rounded-xl enabled:hover:bg-rose-50/50 ${isLiked ? 'text-rose-500 font-bold' : ''
            }`}
        >
          <Heart className={`w-5 h-5 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
          <span>Thích</span>
        </button>

        {/*3. Bấm nút Bình luận sẽ toggle ẩn/hiện bình luận bên dưới */}
        <button
          type="button"
          disabled={!canInteract}
          onClick={toggleComments}
          className={`flex items-center gap-2 transition cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 py-1.5 px-4 rounded-xl ${showComments
            ? 'text-[#006971] bg-teal-50/60 font-bold'
            : 'hover:text-[#006971] hover:bg-teal-50/50'
            }`}
        >
          <MessageCircle className="w-5 h-5" />
          <span>Bình luận</span>
        </button>
      </div>
      {!canInteract && (
        <p className="text-sm text-gray-500">
          Chỉ có thể thích và bình luận khi bài viết được duyệt.
        </p>
      )}
      {canInteract && isLoggedIn && likeError && (
        <p role="alert" className="text-sm text-red-600">{likeError}</p>
      )}
      {/* ================= 5. KHUNG BÌNH LUẬN HIỂN THỊ PHÍA DƯỚI BÀI VIẾT ================= */}
      {canInteract && showComments && (
        <PostCommentSection
          post={post}
          onCommentAdded={() =>
            setCommentsCount((previous) => previous + 1)
          }
        />
      )}

    </div>
  );
}
