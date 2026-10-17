'use client';

import React from 'react';


import StandardPostCard from './StandardPostCard';

export default function CommunityFeed({ posts }) {
  if (!posts || posts.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-8 text-center border border-slate-100 text-slate-400 font-medium">
        Chưa có bài viết nào trong cộng đồng. Hãy là người đầu tiên đăng bài!
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => {
        
        return <StandardPostCard key={post.id} post={post} />;
      })}
    </div>
  );
}
