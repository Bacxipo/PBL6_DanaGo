'use client';

import React, { useEffect, useState } from 'react';
import CreatePostBox from '@/components/comon/community/CreatePostBox';
import CreatePostModal from '@/components/comon/community/CreatePostModal';
import CommunityFeed from '@/components/comon/community/CommunityFeed';

import { getFeedPosts, getMyProfile } from '@/lib/feed-api';
import { mapFeedPost, updatePostInList } from '@/lib/feed-utils';

export default function Community() {
  const [posts, setPosts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(true);
  const [feedError, setFeedError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

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

        setPosts(data.map(mapFeedPost));
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
    async function loadCurrentUser() {
      const token = sessionStorage.getItem('accessToken');

      if (!token) {
        if (active) setCurrentUser(null);
        return;
      }

      try {
        const user = await getMyProfile(token);

        if (active && token === sessionStorage.getItem('accessToken')) {
          setCurrentUser(user);
        }
      } catch {
        if (active) {
          setCurrentUser(null);
        }
      }
    }
    loadPosts();
    loadCurrentUser();
    window.addEventListener('auth-changed', loadCurrentUser);
    return () => {
      active = false;
      window.removeEventListener('auth-changed', loadCurrentUser);
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
        <CreatePostBox currentUser={currentUser} onOpenModal={() => setIsModalOpen(true)} />

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
          <CommunityFeed
            posts={posts}
            currentUserId={currentUser?.id}
            onUpdated={(updatedPost) => {
              setPosts((previous) =>
                updatePostInList(previous, updatedPost)
                  .filter((post) => post.status === 'APPROVED')
              );
              setNotice('Đã cập nhật bài viết. Bài đang chờ duyệt lại.');
            }}
            onDeleted={(postId) => {
              setPosts((previous) =>
                previous.filter((item) => item.id !== postId)
              );
            }}
          />
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
