'use client';

import React, { useState } from 'react';
import CreatePostBox from '@/components/comon/community/CreatePostBox';
import CreatePostModal from '@/components/comon/community/CreatePostModal';
import CommunityFeed from '@/components/comon/community/CommunityFeed';
import { initialPosts } from '@/database/data';
export default function Community() {
  const [posts, setPosts] = useState(initialPosts);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddPost = (newPost) => {
    setPosts([newPost, ...posts]);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 py-8 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Community Header */}
        <div className="space-y-1 mb-6">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Cộng đồng DanaGo
          </h1>
          <p className="text-slate-500 font-medium text-base">
            Chia sẻ hành trình, khám phá những bí mật địa phương.
          </p>
        </div>

        {/* Create Post Inline Box */}
        <CreatePostBox onOpenModal={() => setIsModalOpen(true)} />

        {/* Feed List */}
        <CommunityFeed posts={posts} />

        {/* Create Post Modal */}
        <CreatePostModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onAddPost={handleAddPost}
        />
      </div>
    </div>
  );
}
