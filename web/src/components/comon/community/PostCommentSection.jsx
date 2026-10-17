'use client';

import React, { useState } from 'react';
import { User } from 'lucide-react';
import Image from 'next/image';

const currentUser = {
  name: 'abc_user',
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&q=80'
};

export default function PostCommentSection({ post }) {
  const [commentText, setCommentText] = useState('');
  
  // Dữ liệu bình luận mẫu
  const [comments, setComments] = useState(post?.comments || [
    {
      id: 1,
      user: {
        name: 'nChuc_',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&q=80'
      },
      text: 'Bạn có thể cho tôi biết nó ở đâu không ?',
      timeAgo: '1 ngày'
    }
  ]);

  const handleSendComment = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const newComment = {
      id: Date.now(),
      user: {
        name: currentUser.name,
        avatar: currentUser.avatar
      },
      text: commentText.trim(),
      timeAgo: 'Vừa xong'
    };

    setComments([...comments, newComment]);
    setCommentText('');
  };

  return (
    <div className="pt-3 border-t border-gray-100 space-y-3">
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

        {comments.length === 0 && (
          <div className="text-center py-4 text-xs text-gray-400">
            Chưa có bình luận nào. Hãy là người đầu tiên bình luận!
          </div>
        )}
      </div>

      {/* 2. Ô nhập bình luận & Nút Đăng ở bên cạnh */}
      <form 
        onSubmit={handleSendComment}
        className="flex items-center gap-2 pt-2 border-t border-gray-50"
      >
        {/* Avatar của bạn */}
        <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200 shrink-0">
          <Image
            src={currentUser.avatar}
            alt={currentUser.name}
            width={32}
            height={32}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Ô input */}
        <input
          type="text"
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Thêm bình luận..."
          className="flex-1 px-4 py-2 text-xs rounded-full border border-gray-200 bg-gray-50/70 focus:bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#006971] transition"
        />

        {/* Nút Đăng ở bên cạnh */}
        <button
          type="submit"
          disabled={!commentText.trim()}
          className="text-xs font-bold text-[#006971] hover:text-[#004e54] px-3 py-2 rounded-full transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0"
        >
          Đăng
        </button>
      </form>
    </div>
  );
}