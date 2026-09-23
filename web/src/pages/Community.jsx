'use client';

import React, { useState } from 'react';
import CreatePostBox from '@/components/comon/community/CreatePostBox';
import CreatePostModal from '@/components/comon/community/CreatePostModal';
import CommunityFeed from '@/components/comon/community/CommunityFeed';

const initialPosts = [
  {
    id: 1,
    type: 'passport',
    user: {
      name: 'Nhat Minh',
      avatar: null
    },
    date: '20/08/2026',
    content: 'Một dấu mốc mới trên hành trình của tôi: Ngu Hanh Son, Đà Nẵng ✈',
    passport: {
      destination: 'Ngu Hanh Son, Đà Nẵng',
      startDate: '20/08/2026',
      duration: '31 ngày • 30 đêm',
      serialNumber: '# SP-2026-303436',
      code: 'P<<SPNGUHANHSON<<DANANG<<<<<<SP2026303436',
      stampCity: 'ĐÀ NẴNG',
      stampDate: '20/08/2026'
    },
    likes: 0,
    isLiked: false
  },
  {
    id: 2,
    type: 'article',
    user: {
      name: 'Hihi Hehe',
      avatar: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=150&q=80'
    },
    date: '10/08/2026',
    content: 'Mình vừa đọc câu chuyện văn hóa rất hay: "Làng chiếu Cẩm Nê – Làng nghề truyền thống nổi tiếng Đà Nẵng" trên SoulViet. Cùng khám phá nét đẹp di sản Việt Nam nhé!',
    article: {
      title: 'Làng chiếu Cẩm Nê – Làng nghề truyền thống nổi tiếng Đà Nẵng',
      category: 'CÂU CHUYỆN DI SẢN',
      location: 'Làng chiếu Cẩm Nê',
      image: 'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?w=400&q=80',
      linkText: 'Đọc câu chuyện →'
    },
    likes: 1,
    isLiked: true
  }
];

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
