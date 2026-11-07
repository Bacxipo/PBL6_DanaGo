'use client';
import { useEffect, useState } from 'react';
import AvatarEditor from '@/components/comon/account/AvatarEditor';
import ChangePasswordForm from '@/components/comon/account/ChangePasswordForm';
import { getMyProfile, getFeedCategories, updateMyProfile } from '@/lib/feed-api';
import { getMyPreferences } from '@/lib/preference-api';
export default function SettingInfo() {
    const [form, setForm] = useState({
        fullName: '',
        phoneNumber: '',
        bio: '',
    });

    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState('');
    const [saveMessage, setSaveMessage] = useState('');
    const [profile, setProfile] = useState(null);
    const [categories, setCategories] = useState([]);
    const [categoryIds, setCategoryIds] = useState([]);
    const [savedCategoryIds, setSavedCategoryIds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [reloadKey, setReloadKey] = useState(0);
    useEffect(() => {
        let active = true;
        let generation = 0;
        async function load() {
            const request = ++generation;
            const token = sessionStorage.getItem('accessToken');
            setProfile(null);
            setLoading(true);
            setSaveError('');
            setForm({ fullName: '', phoneNumber: '', bio: '' });
            setCategoryIds([]);
            if (!token) {
                setSaveError('Vui lòng đăng nhập để xem thông tin tài khoản.');
                setLoading(false);
                return;
            }
            try {
                const [user, options, preferences] = await Promise.all([getMyProfile(token), getFeedCategories(), getMyPreferences(token)]);
                if (!active || request !== generation || token !== sessionStorage.getItem('accessToken')) return;
                setProfile(user);
                setForm({ fullName: user.fullName || '', phoneNumber: user.phoneNumber || '', bio: user.bio || '' });
                setCategories(options);
                setCategoryIds(preferences.categoryIds);
                setSavedCategoryIds(preferences.categoryIds);
            } catch (error) {
                if (active && request === generation) setSaveError(error instanceof Error ? error.message : 'Không tải được thông tin tài khoản.');
            } finally {
                if (active && request === generation) setLoading(false);
            }
        }
        load();
        const onAuthChanged = (event) => { if (event.detail?.type !== 'avatar') load(); };
        window.addEventListener('auth-changed', onAuthChanged);
        return () => {
            active = false;
            window.removeEventListener('auth-changed', onAuthChanged);
        };
    }, [reloadKey]);

    function handleCancel() {
        setForm({ fullName: profile?.fullName || '', phoneNumber: profile?.phoneNumber || '', bio: profile?.bio || '' });
        setCategoryIds(savedCategoryIds);
        setSaveError('');
        setSaveMessage('');
    }

    async function handleSave(event) {
        event.preventDefault();
        if (isSaving || loading || !profile) return;
        const token = sessionStorage.getItem('accessToken');
        if (!token) { setSaveError('Vui lòng đăng nhập để cập nhật thông tin.'); return; }
        setIsSaving(true);
        setSaveError('');
        setSaveMessage('');
        try {
            const updated = await updateMyProfile({ ...form, fullName: form.fullName.trim(), categoryIds }, token);
            if (token !== sessionStorage.getItem('accessToken')) return;
            setProfile(updated);
            setForm({ fullName: updated.fullName || '', phoneNumber: updated.phoneNumber || '', bio: updated.bio || '' });
            setSavedCategoryIds([...categoryIds]);
            window.dispatchEvent(new Event('auth-changed'));
            setSaveMessage('Đã lưu thông tin cá nhân.');
        } catch (error) {
            if (token === sessionStorage.getItem('accessToken')) setSaveError(error instanceof Error ? error.message : 'Không thể lưu thông tin.');
        } finally {
            setIsSaving(false);
        }
    }
    return (
        <div className='flex flex-col'>
            <h3 className="text-lg font-semibold text-gray-800">Thông tin cá nhân</h3>
            {loading && <p role="status">Đang tải thông tin...</p>}
            <form onSubmit={handleSave} className='flex flex-col'>
                <fieldset disabled={loading || isSaving || !profile} className="min-w-0">
                    <div className='flex flex-col gap-6 p-3 sm:flex-row'>
                        <AvatarEditor key={profile?.id || 'signed-out'} profile={profile} onSaved={(updated) => setProfile((previous) => ({ ...previous, avatarUrl: updated.avatarUrl }))} />
                        <div className='grid min-w-0 grid-cols-1 gap-4 mb-5 w-full md:grid-cols-2'>
                            <label className='flex flex-col gap-1 text-sm font-medium text-gray-700'>
                                <span>Họ và tên:</span>
                                <input type="text" required maxLength={100} value={form.fullName} onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))} placeholder="Nhập họ và tên" className="w-full p-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 outline-none focus:border-[#006971]" />
                            </label>
                            <label className='flex flex-col gap-1 text-sm font-medium text-gray-700'>
                                <span>Email:</span>
                                <input type="email" readOnly value={profile?.email || ''} className="w-full p-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 bg-gray-50" />
                            </label>
                            <label className='flex flex-col gap-1 text-sm font-medium text-gray-700'>
                                <span>Số điện thoại:</span>
                                <input type="tel" inputMode="numeric" pattern="[0-9]{10}" minLength={10} maxLength={10} title="Số điện thoại phải gồm đúng 10 chữ số" value={form.phoneNumber} onChange={(e) => setForm((prev) => ({ ...prev, phoneNumber: e.target.value }))} placeholder="Nhập số điện thoại (10 số)" className="w-full p-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 outline-none focus:border-[#006971]" />
                            </label>
                        </div>
                    </div>
                    <fieldset className="mb-5 min-w-0 text-sm text-gray-700">
                        <legend className="mb-2 font-medium">Sở thích du lịch</legend>
                        <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-3">
                            <div className="mb-3 flex items-center justify-between gap-3 text-xs text-gray-500">
                                <span>Có thể chọn nhiều sở thích</span>
                                <span aria-live="polite" className="shrink-0 font-medium text-[#006971]">Đã chọn {categoryIds.length}</span>
                            </div>
                            <div className="flex max-h-48 flex-wrap gap-2 overflow-y-auto p-1">
                                {categories.map((category) => {
                                    const selected = categoryIds.includes(category.id);
                                    return (
                                        <label key={category.id} className="group relative max-w-full cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="peer sr-only"
                                                checked={selected}
                                                onChange={(e) => setCategoryIds((prev) => e.target.checked ? [...prev, category.id] : prev.filter((id) => id !== category.id))}
                                            />
                                            <span className="inline-flex max-w-full items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-2 text-xs leading-relaxed transition group-hover:border-[#006971]/50 peer-checked:border-[#006971] peer-checked:bg-[#006971] peer-checked:text-white peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[#006971] peer-disabled:cursor-not-allowed peer-disabled:opacity-50">
                                                {selected && <span aria-hidden="true">✓</span>}
                                                {category.name}
                                            </span>
                                        </label>
                                    );
                                })}
                                {!loading && categories.length === 0 && <p className="text-xs text-gray-500">Chưa có danh mục sở thích.</p>}
                            </div>
                        </div>
                    </fieldset>
                    <div className='flex flex-col gap-1 text-sm font-medium text-gray-700 mt-2'>
                        <span>Giới thiệu bản thân</span>
                        <textarea rows={3} maxLength={1000} value={form.bio} onChange={(e) => setForm((prev) => ({ ...prev, bio: e.target.value }))} placeholder="Nhập giới thiệu bản thân" className="w-full p-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 outline-none focus:border-[#006971]" />
                    </div>
                    <div className="flex gap-4 mt-6 justify-end">
                        <button type="button" onClick={handleCancel} className="px-5 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl font-semibold text-sm transition-colors cursor-pointer">
                            Hủy
                        </button>
                        <button type="submit" disabled={!form.fullName.trim()} className="px-5 py-2.5 bg-[#006971] hover:bg-[#005258] text-white rounded-xl font-semibold text-sm transition-colors cursor-pointer disabled:opacity-50">
                            {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
                        </button>
                    </div>
                </fieldset>
                {saveError && <p role="alert" className="mt-3 text-sm text-red-600">{saveError}</p>}
                {saveMessage && <p role="status" className="mt-3 text-sm text-green-700">{saveMessage}</p>}
                {!loading && !profile && <button type="button" onClick={() => setReloadKey((value) => value + 1)} className="text-sm text-[#006971] underline">Thử lại</button>}
            </form>

            <hr className="my-8 border-gray-100" />
            <ChangePasswordForm key={profile?.id || 'signed-out'} profile={profile} loading={loading} />
        </div>
    );
}
