'use client';

import React, { useEffect, useState } from 'react';
import CreatePostBox from '@/components/comon/community/CreatePostBox';
import CreatePostModal from '@/components/comon/community/CreatePostModal';
import CommunityFeed from '@/components/comon/community/CommunityFeed';

import { getFeedPosts } from '@/lib/feed-api';
export default function Community() {
  const [posts, setPosts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(true);
  const [feedError, setFeedError] = useState('');


  const handleAddPost = () => {
    setNotice('Đăng bài thành công. Bài viết đang chờ duyệt.');
  };
  useEffect(() => {
    let active = true;

    async function loadPosts() {
      try {
        const token = sessionStorage.getItem('accessToken');
        const data = await getFeedPosts(token);

        if (!active) return;

        setPosts(
          data.map((post) => ({
            ...post,
            user: {
              ...post.user,
              name: post.user.fullName || post.user.username,
              avatar: post.user.avatarUrl,
            },
            images: post.images.map((image) => image.imageUrl),
            likes: post._count.likes,
            commentsCount: post._count.comments,
            location: post.destination?.name,
            date: new Date(post.createdAt).toLocaleDateString('vi-VN'),
          })),
        );
      } catch (error) {
        if (active) {
          setFeedError(
            error instanceof Error
              ? error.message
              : 'Không thể tải bài viết.',
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadPosts();

    return () => {
      active = false;
    };
  }, []);


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

        {notice && (
          <p
            role="status"
            className="rounded-xl bg-teal-50 p-3 text-teal-800"
          >
            {notice}
          </p>
        )}
        {/* Feed List */}
        {loading ? (
          <p>Đang tải bài viết...</p>
        ) : feedError ? (
          <p role="alert" className="text-red-600">
            {feedError}
          </p>
        ) : (
          <CommunityFeed posts={posts} />
        )}

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
