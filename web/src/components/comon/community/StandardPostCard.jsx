'use client';

import React, { useState } from 'react';
import { User, MoreVertical, Heart, MessageCircle, Store, HelpCircle } from 'lucide-react';
import Image from 'next/image';

import ContentPost from './ContentPost';
import NewPlacePost from './NewPlacePost';
import PostCommentSection from './PostCommentSection';

export default function StandardPostCard({ post }) {
  const [isLiked, setIsLiked] = useState(post?.isLiked || false);
  const [likesCount, setLikesCount] = useState(post?.likes || 0);
  
  const [showComments, setShowComments] = useState(false);

  const postType = post?.postType || post?.type || 'trai-nghiem';

  const toggleLike = () => {
    if (isLiked) {
      setIsLiked(false);
      setLikesCount((prev) => Math.max(0, prev - 1));
    } else {
      setIsLiked(true);
      setLikesCount((prev) => prev + 1);
    }
  };

  const renderAvatar = () => {
    if (post?.user?.avatar) {
      return (
        <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 shrink-0">
          <Image
            src={post.user.avatar}
            alt={post.user.name || 'User'}
            width={40}
            height={40}
            className="w-full h-full object-cover"
          />
        </div>
      );
    }
    return (
      <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 text-slate-400 flex items-center justify-center shrink-0">
        <User className="w-6 h-6" />
      </div>
    );
  };

  return (
    <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 space-y-4 mb-6 transition hover:shadow-md">
      
      {/* ================= 1. HEADER ================= */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {renderAvatar()}
          <div>
            <h4 className="font-bold text-gray-900 text-base leading-tight">
              {post?.user?.name || 'abc_user'}
            </h4>
            <span className="text-xs text-gray-400 font-normal">
              {post?.date || 'Vừa xong'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {postType === 'trai-nghiem' && (
            <span className="text-xs font-semibold text-[#006971]">
              Chia sẻ cảm xúc
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

          <button type="button" className="text-gray-400 hover:text-gray-600 p-1 rounded-full cursor-pointer">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

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
          onClick={() => setShowComments(!showComments)}
          className="hover:underline hover:text-[#006971] cursor-pointer"
        >
          {post?.commentsCount || 1} bình luận
        </button>
      </div>

      {/* ================= 4. HÀNG NÚT HÀNH ĐỘNG ================= */}
      <div className="border-t border-gray-100 pt-3 flex items-center justify-around text-gray-600 font-semibold text-sm">
        <button
          type="button"
          onClick={toggleLike}
          className={`flex items-center gap-2 hover:text-rose-500 transition cursor-pointer py-1.5 px-4 rounded-xl hover:bg-rose-50/50 ${
            isLiked ? 'text-rose-500 font-bold' : ''
          }`}
        >
          <Heart className={`w-5 h-5 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
          <span>Thích</span>
        </button>

        {/*3. Bấm nút Bình luận sẽ toggle ẩn/hiện bình luận bên dưới */}
        <button
          type="button"
          onClick={() => setShowComments(!showComments)}
          className={`flex items-center gap-2 transition cursor-pointer py-1.5 px-4 rounded-xl ${
            showComments 
              ? 'text-[#006971] bg-teal-50/60 font-bold' 
              : 'hover:text-[#006971] hover:bg-teal-50/50'
          }`}
        >
          <MessageCircle className="w-5 h-5" />
          <span>Bình luận</span>
        </button>
      </div>

      {/* ================= 5. KHUNG BÌNH LUẬN HIỂN THỊ PHÍA DƯỚI BÀI VIẾT ================= */}
      {showComments && (
        <PostCommentSection post={post} />
      )}

    </div>
  );
}