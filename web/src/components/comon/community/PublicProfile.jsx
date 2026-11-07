'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getPublicProfile, getUserFeedPosts } from '@/lib/feed-api';
import { mapFeedPost } from '@/lib/feed-utils';
import UserAvatar from '@/components/comon/ui/UserAvatar';
import StandardPostCard from './StandardPostCard';

export default function PublicProfile({ userId }) {
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setError('');
      setProfile(null);
      setPosts([]);
      try {
        const token = sessionStorage.getItem('accessToken');
        const [user, data] = await Promise.all([
          getPublicProfile(userId),
          getUserFeedPosts(userId, token),
        ]);
        if (!active) return;
        setProfile(user);
        setPosts(data.map(mapFeedPost));
      } catch (cause) {
        if (active) setError(cause instanceof Error ? cause.message : 'Không thể tải trang cá nhân.');
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    window.addEventListener('auth-changed', load);
    return () => {
      active = false;
      window.removeEventListener('auth-changed', load);
    };
  }, [userId, reloadKey]);

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-8">
      {loading ? <p role="status">Đang tải trang cá nhân...</p> : error ? (
        <div role="alert" className="text-red-600">
          <p>{error}</p>
          <button type="button" onClick={() => setReloadKey((value) => value + 1)} className="mt-2 underline">Thử lại</button>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-6">
            <UserAvatar user={profile} size={80} />
            <div className="min-w-0">
              <h1 className="text-2xl font-bold text-gray-900">{profile?.fullName || profile?.username}</h1>
              <p className="mt-2 text-sm text-gray-500">{posts.length} bài viết</p>
              {profile?.bio && <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed text-gray-700">{profile.bio}</p>}
            </div>
          </div>
          {posts.length === 0 ? (
            <p className="py-12 text-center text-gray-500">Tài khoản này chưa có bài viết công khai.</p>
          ) : posts.map((post) => <StandardPostCard key={post.id} post={post} />)}
        </>
      )}
    </div>
  );
}
