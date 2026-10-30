'use client';

import React, { useEffect, useState } from 'react';
import { getFeedComments, createFeedComment } from '@/lib/feed-api';
import { User } from 'lucide-react';
import Image from 'next/image';

function mapComment(comment) {
  return {
    id: comment.id,
    user: {
      name: comment.user.fullName || comment.user.username,
      avatar: comment.user.avatarUrl,
    },
    text: comment.content,
    timeAgo: new Date(comment.createdAt).toLocaleString('vi-VN'),
  };
}

export default function PostCommentSection({ post, onCommentAdded, }) {
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  const [loadError, setLoadError] = useState('');
  const [sendError, setSendError] = useState('');


  const handleSendComment = async (event) => {
    event.preventDefault();

    const content = commentText.trim();

    if (!content || isSending || loading || loadError) return;

    setSendError('');

    const token = sessionStorage.getItem('accessToken');

    if (!token) {
      setSendError('Bạn cần đăng nhập để bình luận.');
      return;
    }

    setIsSending(true);

    try {
      const savedComment = await createFeedComment(
        post.id,
        content,
        token
      );

      setComments((previous) => [
        ...previous,
        mapComment(savedComment),
      ]);

      setCommentText('');
      onCommentAdded?.();
    } catch (error) {
      setSendError(
        error instanceof Error
          ? error.message
          : 'Không thể gửi bình luận.'
      );
    } finally {
      setIsSending(false);
    }
  };

  useEffect(() => {
    let active = true;

    async function loadComments() {
      setLoading(true);
      setLoadError('');

      try {
        const data = await getFeedComments(post.id);

        if (active) {
          setComments(data.map(mapComment));
        }
      } catch (error) {
        if (active) {
          setLoadError(
            error instanceof Error
              ? error.message
              : 'Không thể tải bình luận.'
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadComments();

    return () => {
      active = false;
    };
  }, [post.id]);

  return (
    <div className="pt-3 border-t border-gray-100 space-y-3">
      {loading && <p>Đang tải bình luận...</p>}
      {loadError && (
        <p role="alert" className="text-sm text-red-600">
          {loadError}
        </p>
      )}
      {/* 1. Danh sách bình luận (Giới hạn độ cao max-h-60 có thanh cuộn) */}
      <div className="max-h-60 overflow-y-auto space-y-3 pr-1.5 scrollbar-thin">
        {comments.map((cmt) => (
          <div key={cmt.id} className="flex items-start gap-2.5">
            {/* Avatar người bình luận */}
            <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200 shrink-0 mt-0.5">
              {cmt?.user?.avatar ? (
                <Image
                  src={cmt.user.avatar}
                  alt={cmt.user.name}
                  width={32}
                  height={32}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400">
                  <User size={14} />
                </div>
              )}
            </div>

            {/* Khung nội dung bình luận */}
            <div className="flex-1 bg-gray-50/80 hover:bg-gray-50 p-2.5 rounded-2xl border border-gray-100 transition">
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-900 text-xs">
                  {cmt.user.name}
                </span>
                <span className="text-[10px] text-gray-400 font-normal">
                  {cmt.timeAgo || '1 ngày'}
                </span>
              </div>
              <p className="text-gray-700 text-xs leading-relaxed mt-1 font-normal">
                {cmt.text}
              </p>
            </div>
          </div>
        ))}

        {!loading && !loadError && comments.length === 0 && (
          <p className="text-center text-sm text-gray-400">
            Chưa có bình luận nào. Hãy là người đầu tiên bình luận!
          </p>
        )}
      </div>

      {/* 2. Ô nhập bình luận & Nút Đăng ở bên cạnh */}
      <form
        onSubmit={handleSendComment}
        className="flex items-center gap-2 pt-2 border-t border-gray-50"
      >
        {/* Avatar của bạn */}
        <div className="w-8 h-8 rounded-full border border-gray-200 shrink-0 bg-slate-100 flex items-center justify-center text-slate-400">
          <User size={18} />
        </div>

        {/* Ô input */}
        <input
          type="text"
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          disabled={isSending}
          placeholder="Thêm bình luận..."
          className="flex-1 px-4 py-2 text-xs rounded-full border border-gray-200 bg-gray-50/70 focus:bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#006971] transition"
        />

        {/* Nút Đăng ở bên cạnh */}
        <button
          type="submit"
          disabled={
            !commentText.trim() ||
            isSending ||
            loading ||
            Boolean(loadError)
          }
          className="..."
        >
          {isSending ? 'Đang gửi...' : 'Đăng'}
        </button>
      </form>
      {sendError && (
        <p role="alert" className="text-sm text-red-600">
          {sendError}
        </p>
      )}
    </div>
  );
}