'use client';

import React, { useState } from 'react';
import { User, MoreVertical, Heart, MessageCircle, Share2, MapPin } from 'lucide-react';

export default function StandardPostCard({ post }) {
  const [isLiked, setIsLiked] = useState(post?.isLiked || false);
  const [likesCount, setLikesCount] = useState(post?.likes || 0);

  const toggleLike = () => {
    if (isLiked) {
      setIsLiked(false);
      setLikesCount((prev) => Math.max(0, prev - 1));
    } else {
      setIsLiked(true);
      setLikesCount((prev) => prev + 1);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-slate-100 space-y-4 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 text-slate-400 flex items-center justify-center overflow-hidden shrink-0">
            <User className="w-6 h-6" />
          </div>
          <div>
            <span className="font-bold text-slate-900 text-base block">{post?.user?.name || 'abc'}</span>
            <span className="text-xs text-slate-400 font-normal">{post?.date || 'Vừa xong'}</span>
          </div>
        </div>

        <button type="button" className="text-slate-400 hover:text-slate-600 p-1 rounded-full cursor-pointer">
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>

      {/* Body Content */}
      <p className="text-slate-800 text-base font-normal leading-relaxed">
        {post?.content}
      </p>

      {/* Location Badge if provided */}
      {post?.location && (
        <div className="inline-flex items-center gap-1.5 bg-rose-50 border border-rose-100 text-rose-700 px-3 py-1 rounded-full text-xs font-semibold">
          <MapPin className="w-3.5 h-3.5 text-rose-500" />
          <span>{post.location}</span>
        </div>
      )}

      {/* Like counter */}
      {likesCount > 0 && (
        <div className="px-1 text-xs text-slate-500 font-medium pt-1">
          {likesCount} yêu thích
        </div>
      )}

      {/* Actions */}
      <div className="border-t border-slate-100 pt-3 flex items-center justify-around text-slate-600 font-medium text-sm">
        <button
          type="button"
          onClick={toggleLike}
          className={`flex items-center gap-2 hover:text-rose-500 transition-colors cursor-pointer py-1 px-3 rounded-lg hover:bg-slate-50 ${
            isLiked ? 'text-rose-500 font-semibold' : ''
          }`}
        >
          <Heart className={`w-5 h-5 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
          <span>Thích</span>
        </button>

        <button
          type="button"
          className="flex items-center gap-2 hover:text-teal-600 transition-colors cursor-pointer py-1 px-3 rounded-lg hover:bg-slate-50"
        >
          <MessageCircle className="w-5 h-5" />
          <span>Bình luận</span>
        </button>

        <button
          type="button"
          className="flex items-center gap-2 hover:text-teal-600 transition-colors cursor-pointer py-1 px-3 rounded-lg hover:bg-slate-50"
        >
          <Share2 className="w-5 h-5" />
          <span>Chia sẻ</span>
        </button>
      </div>
    </div>
  );
}
