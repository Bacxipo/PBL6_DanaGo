'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Grid3X3, Plus } from 'lucide-react';
import UserAvatar from '@/components/comon/ui/UserAvatar';
import { getMyFeedPosts, getMyProfile } from '@/lib/feed-api';
import { mapFeedPost, updatePostInList } from '@/lib/feed-utils';
import StandardPostCard from '../community/StandardPostCard';

export default function PersonalPage() {
    const [posts, setPosts] = useState([]);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [loggedIn, setLoggedIn] = useState(false);
    const [reloadKey, setReloadKey] = useState(0);

    useEffect(() => {
        let active = true;
        async function loadPosts() {
            setLoading(true);
            setError('');
            setPosts([]);
            setProfile(null);
            const token = sessionStorage.getItem('accessToken');
            setLoggedIn(Boolean(token));
            if (!token) {
                setLoading(false);
                return;
            }
            try {
                const [data, user] = await Promise.all([
                    getMyFeedPosts(token),
                    getMyProfile(token),
                ]);
                if (!active) return;
                setProfile(user);
                setPosts(data.map(mapFeedPost));
            } catch (cause) {
                if (active) setError(cause instanceof Error ? cause.message : 'Không thể tải bài viết.');
            } finally {
                if (active) setLoading(false);
            }
        }
        loadPosts();
        const onAuthChanged = () => setReloadKey((value) => value + 1);
        window.addEventListener('auth-changed', onAuthChanged);
        return () => {
            active = false;
            window.removeEventListener('auth-changed', onAuthChanged);
        };
    }, [reloadKey]);

    return (
        <div className="flex flex-col">
            <div className="flex items-center justify-between px-4 pb-4 border-b border-gray-100">
                <h3 className="text-xl font-bold text-gray-800">Trang cá nhân</h3>
                <Link href="/community" aria-label="Đăng bài viết" className="text-[#006971]">
                    <Plus size={24} />
                </Link>
            </div>
            <div className="flex items-center gap-4 px-4 py-6">
                <div className="rounded-full w-20 h-20 bg-teal-50 flex items-center justify-center text-[#006971] shrink-0">
                    <UserAvatar user={profile} size={80} />
                </div>
                <div className="min-w-0">
                    <h2 className="text-2xl font-bold text-gray-800">{profile?.fullName || profile?.username || (loading ? '...' : 'Trang cá nhân')}</h2>
                    {profile?.bio && (
                        <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed text-gray-700">{profile.bio}</p>
                    )}
                    {!loading && !error && loggedIn && (
                        <span className="text-sm text-gray-500">{posts.length} bài viết</span>
                    )}
                </div>
            </div>
            <div className="border-t border-gray-100 pt-5" aria-busy={loading}>
                {loading ? (
                    <p role="status">Đang tải bài viết...</p>
                ) : !loggedIn ? (
                    <p>Vui lòng <Link href="/login" className="text-[#006971] underline">đăng nhập</Link> để xem bài viết của bạn.</p>
                ) : error ? (
                    <div role="alert" className="text-red-600">
                        <p>{error}</p>
                        <button type="button" onClick={() => setReloadKey((value) => value + 1)} className="mt-2 underline cursor-pointer">Thử lại</button>
                    </div>
                ) : posts.length === 0 ? (
                    <div className="flex flex-col items-center py-16 gap-3 text-gray-500">
                        <Grid3X3 size={48} />
                        <p>Bạn chưa có bài viết nào.</p>
                        <Link href="/community" className="text-[#006971] underline">Đăng bài viết đầu tiên</Link>
                    </div>
                ) : (
                    posts.map((post) => (
                        <StandardPostCard
                            key={post.id}
                            post={post}
                            currentUserId={profile?.id}
                            onDeleted={(postId) => {
                                setPosts((previous) =>
                                    previous.filter((item) => item.id !== postId)
                                );
                            }}
                            onUpdated={(updatedPost) => {
                                setPosts((previous) =>
                                    updatePostInList(previous, updatedPost)
                                );
                            }}
                        />
                    ))
                )}
            </div>
        </div>
    );
}


