'use client';

import React from 'react';


import StandardPostCard from './StandardPostCard';

export default function CommunityFeed({ posts, currentUserId, onDeleted, onUpdated, }) {
  if (!posts || posts.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-teal-200 bg-teal-50/40 p-10 text-center text-sm leading-7 text-slate-500">
        Chưa có bài viết nào trong cộng đồng. Hãy là người đầu tiên đăng bài!
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => {

        return <StandardPostCard
          key={post.id}
          post={post}
          currentUserId={currentUserId}
          onDeleted={onDeleted}
          onUpdated={onUpdated} />;
      })}
    </div>
  );
}
