'use client';

import { useEffect, useState } from 'react';
import { UserCheck, UserPlus } from 'lucide-react';
import { getFollowStats, getMyProfile, getPublicProfile, getUserFeedPosts, toggleFollow } from '@/lib/feed-api';
import { mapFeedPost } from '@/lib/feed-utils';
import UserAvatar from '@/components/comon/ui/UserAvatar';
import StandardPostCard from './StandardPostCard';

export default function PublicProfile({ userId }) {
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [followStats, setFollowStats] = useState({ followersCount: 0, followingCount: 0, isFollowing: false });
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [isFollowSubmitting, setIsFollowSubmitting] = useState(false);
  const [followError, setFollowError] = useState('');
  const totalLikes = posts.reduce((total, post) => total + Number(post.likes || 0), 0);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setError('');
      setFollowError('');
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
        setFollowStats((previous) => ({ ...previous, followersCount: user.followersCount ?? 0, followingCount: user.followingCount ?? 0 }));

        if (token) {
          const [stats, currentUser] = await Promise.all([
            getFollowStats(userId, token).catch(() => null),
            getMyProfile(token).catch(() => null),
          ]);
          if (!active) return;
          if (stats) setFollowStats(stats);
          setIsOwnProfile(Number(currentUser?.id) === Number(userId));
        } else {
          setIsOwnProfile(false);
        }
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

  const handleFollowToggle = async () => {
    const token = sessionStorage.getItem('accessToken');
    if (!token) {
      setFollowError('Vui lòng đăng nhập để theo dõi người dùng.');
      return;
    }
    setFollowError('');
    setIsFollowSubmitting(true);
    try {
      const result = await toggleFollow(userId, token);
      setFollowStats((previous) => ({ ...previous, isFollowing: result.isFollowing, followersCount: result.followersCount }));
    } catch (cause) {
      setFollowError(cause instanceof Error ? cause.message : 'Không thể cập nhật trạng thái theo dõi.');
    } finally {
      setIsFollowSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-8">
      {loading ? <p role="status">Đang tải trang cá nhân...</p> : error ? (
        <div role="alert" className="text-red-600">
          <p>{error}</p>
          <button type="button" onClick={() => setReloadKey((value) => value + 1)} className="mt-2 underline">Thử lại</button>
        </div>
      ) : (
        <>
          <div className="flex items-start gap-4 rounded-2xl border border-gray-100 bg-white p-6">
            <UserAvatar user={profile} size={80} />
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-bold text-gray-900">{profile?.fullName || profile?.username}</h1>
              <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-500">
                <span>{posts.length} bài viết</span>
                <span>{followStats.followersCount} người theo dõi</span>
                <span>{followStats.followingCount} đang theo dõi</span>
                <span>{totalLikes} lượt thích</span>
              </div>
              {profile?.bio && <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed text-gray-700">{profile.bio}</p>}
            </div>
            {!isOwnProfile && (
              <button type="button" onClick={handleFollowToggle} disabled={isFollowSubmitting} className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${followStats.isFollowing ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : 'bg-[#006971] text-white hover:bg-[#00545a]'}`}>
                {followStats.isFollowing ? <UserCheck size={16} /> : <UserPlus size={16} />}
                {isFollowSubmitting ? 'Đang cập nhật...' : followStats.isFollowing ? 'Đang theo dõi' : 'Theo dõi'}
              </button>
            )}
          </div>
          {followError && <p role="alert" className="text-sm text-red-600">{followError}</p>}
          {posts.length === 0 ? <p className="py-12 text-center text-gray-500">Tài khoản này chưa có bài viết công khai.</p> : posts.map((post) => <StandardPostCard key={post.id} post={post} />)}
        </>
      )}
    </div>
  );
}
