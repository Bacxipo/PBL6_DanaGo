'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import imgHeader from '@/assets/images/hoppy.jpg';
import { getDestinationCategories } from '@/lib/destination-api';
import { getMyPreferences, saveMyPreferences } from '@/lib/preference-api';


export default function Interests() {
  const [selected, setSelected] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const busy = useRef(false);
  const router = useRouter();

  useEffect(() => {
    let active = true;
    const token = sessionStorage.getItem('accessToken');
    if (!token) { router.replace('/login'); return; }
    async function load() {
      setLoading(true);
      setError('');
      try {
        const [items, preferences] = await Promise.all([getDestinationCategories(), getMyPreferences(token)]);
        if (active) {
          setCategories(items);
          setSelected(preferences.categoryIds);
          if (!items.length) setError('Chưa có danh mục sở thích. Vui lòng thử lại sau.');
        }
      } catch (cause) {
        if (active) setError(cause.message);
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, [router, reloadKey]);

  async function handleComplete() {
    if (busy.current || loading || !selected.length) return;
    const token = sessionStorage.getItem('accessToken');
    if (!token) { router.replace('/login'); return; }
    busy.current = true;
    setSaving(true);
    setError('');
    try {
      await saveMyPreferences(selected, token);
      if (token === sessionStorage.getItem('accessToken')) router.replace('/');
    } catch (cause) { setError(cause.message); }
    finally { busy.current = false; setSaving(false); }
  }

  const toggleInterest = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-xl flex flex-col md:flex-row overflow-hidden border border-gray-100">

        {/* Cột trái: Danh sách sở thích */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Thứ bạn quan tâm là gì ?</h2>
            <p className="text-xs text-gray-500 mt-1">Hãy chia sẻ nó với chúng tôi và mọi người</p>
          </div>

          {/* List các nút bấm sở thích */}
          {loading ? <p role="status">Đang tải...</p> :
            <div className="flex flex-wrap gap-2 mb-5">
              {categories.map((item) => <button key={item.id} type="button"
                disabled={saving} aria-pressed={selected.includes(item.id)}
                onClick={() => toggleInterest(item.id)}
                className={`rounded-full px-4 py-2 text-sm ${selected.includes(item.id) ? 'bg-[#006971] text-white' : 'bg-teal-50 text-[#006971]'}`}>
                {item.name}
              </button>)}
            </div>}
          <p className="text-xs text-gray-500 mb-3">Chọn ít nhất một thứ để tiếp tục.</p>
          {error && <div role="alert" className="text-sm text-red-600 mb-3">{error}
            <button type="button" disabled={saving} onClick={() => setReloadKey((value) => value + 1)} className="ml-2 underline">Thử lại</button>
          </div>}

          {/* Nút Hoàn tất */}
          <button
            type="button"
            onClick={handleComplete}
            disabled={loading || saving || !selected.length}
            className="w-full bg-[#006971] hover:bg-[#00555a] text-white font-semibold py-3 rounded-full text-sm transition-colors shadow-md"
          >
            {saving ? 'Đang lưu...' : 'Hoàn tất'}
          </button>
        </div>

        {/* Cột phải: Ảnh Welcome to Da Nang */}
        <div className="relative w-full md:w-1/2 min-h-[350px] md:min-h-[550px] hidden md:block">
          <Image src={imgHeader} alt="Welcome to Da Nang" fill priority className="object-cover object-left" sizes="(max-width: 768px) 100vw, 50vw" />
        </div>

      </div>
    </div>
  );
}
