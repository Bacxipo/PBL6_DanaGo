'use client';

import React, { useMemo, useState, useRef } from 'react';
import Header from '@/components/Header';
import { Modal, Field, ModalActions, inputClass, PageHeading, searchInputClass, selectClass, StatusBadge, AsyncContent } from '@/components/ui';
import { useApi, upsertById, removeById, orUndefined, getImageUrl, getImageId, normalizeSearch } from '@/lib/utils';
import Pagination from '@/components/Pagination';
import { useAction, usePending } from '@/lib/context';
import { CONTENT_STATUS_LABEL, CONTENT_STATUSES, DISTRICTS, type ContentStatus, type Destination, type DestinationInput, type DestinationImage } from '@/lib/types';
import { Search, MapPin, Edit, Trash2, Star, Compass, CheckCircle2, ImageOff, Upload, X, ImageIcon, Tag, ArrowUp, ArrowDown } from 'lucide-react';
import { destinationApi, categoryApi } from '@/lib/api';

const emptyForm = {
  name: '',
  description: '',
  district: DISTRICTS[0],
  addressUrl: '',
  latitude: '',
  longitude: '',
  ticketPrice: 'Miễn phí',
  openHours: '',
  categoryId: '',
  status: 'APPROVED' as ContentStatus
};
type FormState = typeof emptyForm;

const toForm = (d: Destination): FormState => ({
  name: d.name,
  description: d.description ?? '',
  district: d.district,
  addressUrl: d.addressUrl ?? '',
  latitude: d.latitude?.toString() ?? '',
  longitude: d.longitude?.toString() ?? '',
  ticketPrice: d.ticketPrice ?? '',
  openHours: d.openHours ?? '',
  categoryId: d.categoryId ? String(d.categoryId) : '',
  status: d.status
});

const toInput = (f: FormState): DestinationInput => ({
  name: f.name.trim(),
  district: f.district,
  description: orUndefined(f.description),
  addressUrl: orUndefined(f.addressUrl),
  latitude: f.latitude ? Number(f.latitude) : undefined,
  longitude: f.longitude ? Number(f.longitude) : undefined,
  categoryId: f.categoryId ? Number(f.categoryId) : undefined,
  ticketPrice: orUndefined(f.ticketPrice),
  openHours: orUndefined(f.openHours)
});

interface PendingUploadFile {
  file: File;
  previewUrl: string;
}

const PAGE_SIZE = 20; // số điểm đến mỗi trang
// Trang chủ du khách chỉ lấy tối đa chừng này địa điểm nổi bật (xem web/src/pages/Home.jsx: getFeaturedDestinations(6))
const HOME_FEATURED_LIMIT = 6;

export default function DestinationsPage() {
  const { data, loading, error, reload, setData } = useApi(destinationApi.listAll);
  const { data: categoriesData } = useApi(categoryApi.list);
  const categories = categoriesData ?? [];

  const { refresh } = usePending();
  const { run, busy } = useAction();

  const [search, setSearch] = useState('');
  const [district, setDistrict] = useState('ALL');
  const [status, setStatus] = useState<ContentStatus | 'ALL'>('ALL');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<Destination | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);

  // Quản lý ảnh trong form
  const [existingImages, setExistingImages] = useState<(string | DestinationImage)[]>([]);
  const [pendingFiles, setPendingFiles] = useState<PendingUploadFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const q = normalizeSearch(search);
    return (data ?? [])
      .filter(
        (d) =>
          (district === 'ALL' || d.district === district) &&
          (status === 'ALL' || d.status === status) &&
          (!featuredOnly || d.isFeatured) &&
          (normalizeSearch(d.name).includes(q) || normalizeSearch(d.description ?? '').includes(q))
      )
      .sort((a, b) => (sortOrder === 'asc' ? a.id - b.id : b.id - a.id));
  }, [data, search, district, status, featuredOnly, sortOrder]);

  // Phân trang (không để trang hiện tại vượt quá tổng số trang khi lọc ra ít kết quả hơn)
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const paged = filtered.slice(pageStart, pageStart + PAGE_SIZE);
  const featuredCount = (data ?? []).filter((d) => d.isFeatured && d.status === 'APPROVED').length;

  const upsert = (saved: Destination) => setData((xs) => upsertById(xs, saved));

  const cleanupPendingFiles = () => {
    pendingFiles.forEach((p) => URL.revokeObjectURL(p.previewUrl));
    setPendingFiles([]);
  };

  const openForm = (d: Destination | null) => {
    cleanupPendingFiles();
    setEditing(d);
    setForm(d ? toForm(d) : emptyForm);
    setExistingImages(d?.images ? [...d.images] : []);
    setFormOpen(true);
  };

  const closeForm = () => {
    cleanupPendingFiles();
    setFormOpen(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/gif'];
    const validFiles: PendingUploadFile[] = [];

    const totalAllowed = 10 - (existingImages.length + pendingFiles.length);
    if (files.length > totalAllowed) {
      alert(`Bạn chỉ có thể chọn thêm tối đa ${Math.max(0, totalAllowed)} ảnh (tối đa 10 ảnh cho mỗi điểm đến).`);
    }

    for (const file of files.slice(0, Math.max(0, totalAllowed))) {
      if (!allowedTypes.includes(file.type)) {
        alert(`File "${file.name}" không đúng định dạng. Chỉ chấp nhận ảnh JPG, PNG, WebP, GIF.`);
        continue;
      }
      if (file.size > 10 * 1024 * 1024) {
        alert(`Ảnh "${file.name}" vượt quá dung lượng tối đa 10MB.`);
        continue;
      }
      validFiles.push({
        file,
        previewUrl: URL.createObjectURL(file)
      });
    }

    setPendingFiles((prev) => [...prev, ...validFiles]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removePendingFile = (index: number) => {
    setPendingFiles((prev) => {
      URL.revokeObjectURL(prev[index].previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  };

  const deleteExistingImage = async (img: string | DestinationImage) => {
    const imgId = getImageId(img);
    if (!window.confirm('Bạn có chắc muốn xóa ảnh này khỏi điểm đến?')) return;

    if (imgId) {
      await run(async () => {
        await destinationApi.deleteImage(imgId);
        setExistingImages((prev) => prev.filter((x) => getImageId(x) !== imgId));
        if (editing) {
          const updatedImages = (editing.images ?? []).filter((x) => getImageId(x) !== imgId);
          setEditing({ ...editing, images: updatedImages });
          upsert({ ...editing, images: updatedImages });
        }
      }, 'Đã xóa ảnh thành công.');
    } else {
      // Dữ liệu mẫu chuỗi URL
      const imgUrl = getImageUrl(img);
      setExistingImages((prev) => prev.filter((x) => getImageUrl(x) !== imgUrl));
      if (editing) {
        const updatedImages = (editing.images ?? []).filter((x) => getImageUrl(x) !== imgUrl);
        setEditing({ ...editing, images: updatedImages });
        upsert({ ...editing, images: updatedImages });
      }
    }
  };

  const approve = (d: Destination) =>
    run(async () => {
      upsert(await destinationApi.setStatus(d.id, 'APPROVED'));
      refresh();
    }, `Đã duyệt "${d.name}".`);

  // Bật/tắt "nổi bật" (hiện ở trang chủ du khách)
  const toggleFeatured = (d: Destination) =>
    run(async () => {
      upsert(await destinationApi.setFeatured(d.id, !d.isFeatured));
    }, d.isFeatured ? `Đã bỏ nổi bật "${d.name}".` : `Đã đặt "${d.name}" làm điểm đến nổi bật.`);

  const remove = (d: Destination) => {
    if (!window.confirm(`Xóa "${d.name}"? Các dữ liệu liên quan (ảnh, đánh giá, đối tác) cũng bị xóa.`)) return;
    run(async () => {
      await destinationApi.remove(d.id);
      setData((xs) => removeById(xs, d.id));
      refresh();
    }, 'Đã xóa điểm đến.');
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await run(async () => {
      let saved: Destination;
      if (!editing) {
        saved = await destinationApi.create(toInput(form));
      } else {
        saved = await destinationApi.update(editing.id, toInput(form));
        if (form.status !== editing.status) {
          saved = await destinationApi.setStatus(editing.id, form.status);
          refresh();
        }
      }

      // Upload ảnh mới nếu có
      if (pendingFiles.length > 0) {
        const filesToUpload = pendingFiles.map((p) => p.file);
        const uploadedImages = await destinationApi.uploadImages(saved.id, filesToUpload);
        saved.images = [...(saved.images ?? []), ...uploadedImages];
      }

      upsert(saved);
    }, editing ? 'Đã cập nhật điểm đến và hình ảnh.' : 'Đã thêm điểm đến và tải ảnh lên thành công.');

    if (ok) closeForm();
  };

  const set = (patch: Partial<FormState>) => setForm((f) => ({ ...f, ...patch }));

  return (
    <div className="flex-1 flex flex-col">
      <Header title="Quản Lý Điểm Đến" breadcrumb="Điểm đến du lịch" />

      <div className="p-6 md:p-8 space-y-6 max-w-7xl w-full mx-auto">
        <PageHeading
          title="Điểm Đến Du Lịch"
          description="Điểm đến do quản trị viên thêm được duyệt ngay; đề xuất từ du khách cần kiểm duyệt"
          actionLabel="Thêm Điểm Đến Mới"
          onAction={() => openForm(null)}
        />

        <div className="flex flex-wrap items-center gap-3 bg-white p-4 rounded-2xl border border-[#e2e8f0] shadow-xs">
          <div className="relative min-w-[220px] flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Tìm theo tên, mô tả..."
              className={searchInputClass}
            />
          </div>
          <select value={district} onChange={(e) => { setDistrict(e.target.value); setPage(1); }} className={selectClass} aria-label="Lọc quận/huyện">
            <option value="ALL">Tất cả quận/huyện</option>
            {DISTRICTS.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value as ContentStatus | 'ALL'); setPage(1); }}
            className={selectClass}
            aria-label="Lọc trạng thái"
          >
            <option value="ALL">Tất cả trạng thái</option>
            {CONTENT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {CONTENT_STATUS_LABEL[s]}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => { setFeaturedOnly((v) => !v); setPage(1); }}
            aria-pressed={featuredOnly}
            title={`Trang chủ du khách hiển thị tối đa ${HOME_FEATURED_LIMIT} điểm đến nổi bật (ưu tiên điểm đánh giá cao hơn)`}
            className={`inline-flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl border font-semibold transition-colors cursor-pointer ${
              featuredOnly ? 'bg-[#FFB347]/20 border-[#FFB347] text-[#a43c12]' : 'bg-white border-[#e2e8f0] text-gray-600 hover:border-[#FFB347]'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${featuredOnly ? 'fill-[#FFB347] text-[#FFB347]' : 'text-gray-400'}`} />
            Nổi bật
            <span className={`px-1.5 rounded-full text-[10px] font-bold ${featuredCount > HOME_FEATURED_LIMIT ? 'bg-rose-100 text-rose-700' : 'bg-gray-100 text-gray-600'}`}>
              {featuredCount}/{HOME_FEATURED_LIMIT}
            </span>
          </button>
        </div>

        <AsyncContent loading={loading} error={error} data={data} onRetry={reload}>
          {(all) => (
            <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#e6f4f2] border-b border-[#e2e8f0] text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                      <th
                        onClick={() => setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
                        className="py-3.5 pl-4 w-16 cursor-pointer hover:bg-[#d0eae6] transition-colors select-none"
                        title="Bấm để đổi chiều sắp xếp theo ID"
                      >
                        <div className="flex items-center gap-1 text-gray-700">
                          <span>ID</span>
                          {sortOrder === 'asc' ? (
                            <ArrowUp className="w-3.5 h-3.5 text-[#006971]" />
                          ) : (
                            <ArrowDown className="w-3.5 h-3.5 text-[#006971]" />
                          )}
                        </div>
                      </th>
                      <th className="py-3.5 px-3">Điểm đến</th>
                      <th className="py-3.5 px-3">Danh mục</th>
                      <th className="py-3.5 px-3">Quận / Huyện</th>
                      <th className="py-3.5 px-3">Giờ mở cửa</th>
                      <th className="py-3.5 px-3">Giá vé</th>
                      <th className="py-3.5 px-3">Đánh giá</th>
                      <th className="py-3.5 px-3">Trạng thái</th>
                      <th className="py-3.5 pr-4 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-xs">
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="py-8 text-center text-gray-400 font-medium">
                          Không có điểm đến nào phù hợp.
                        </td>
                      </tr>
                    ) : (
                      paged.map((d) => {
                        const firstImgUrl = getImageUrl(d.images?.[0]);
                        const catName = d.categoryName || categories.find((c) => c.id === d.categoryId)?.name;
                        const imageCount = d.images?.length ?? 0;

                        return (
                          <tr key={d.id} className="hover:bg-[#e6f4f2]/70 transition-colors">
                            <td className="py-3 pl-4 font-mono font-bold text-gray-600 whitespace-nowrap">
                              #{d.id}
                            </td>
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-3">
                                <div className="relative shrink-0">
                                  {firstImgUrl ? (
                                    <img
                                      src={firstImgUrl}
                                      alt=""
                                      className="w-12 h-12 rounded-xl object-cover border border-gray-200"
                                    />
                                  ) : (
                                    <div className="w-12 h-12 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400">
                                      <ImageOff className="w-4 h-4" />
                                    </div>
                                  )}
                                  {imageCount > 1 && (
                                    <span className="absolute -bottom-1 -right-1 bg-black/70 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full">
                                      +{imageCount - 1}
                                    </span>
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <p className="font-bold text-gray-900 text-sm flex items-center gap-1.5 flex-wrap">
                                    {d.name}
                                    {d.isFeatured && (
                                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-[#FFB347]/20 text-[#a43c12] text-[10px] font-bold">
                                        <Star className="w-2.5 h-2.5 fill-[#FFB347] text-[#FFB347]" /> Nổi bật
                                      </span>
                                    )}
                                  </p>
                                  {d.addressUrl && (
                                    <a
                                      href={d.addressUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="inline-flex items-center gap-0.5 text-[11px] text-[#006971] hover:underline"
                                    >
                                      <MapPin className="w-3 h-3" /> Xem bản đồ
                                    </a>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-3 whitespace-nowrap">
                              {catName ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#e6f4f2] text-[#006971]">
                                  <Tag className="w-3 h-3" /> {catName}
                                </span>
                              ) : (
                                <span className="text-gray-400">—</span>
                              )}
                            </td>
                            <td className="py-3 px-3 font-semibold text-gray-700 whitespace-nowrap">{d.district}</td>
                            <td className="py-3 px-3 text-gray-600">{d.openHours ?? '—'}</td>
                            <td className="py-3 px-3 font-bold text-gray-900">{d.ticketPrice ?? '—'}</td>
                            <td className="py-3 px-3">
                              <span className="flex items-center gap-1 font-bold text-gray-900">
                                <Star className="w-3.5 h-3.5 fill-[#FFB347] text-[#FFB347]" />
                                {d.avgRating.toFixed(1)}
                              </span>
                            </td>
                            <td className="py-3 px-3">
                              <StatusBadge status={d.status} size="xs" />
                            </td>
                            <td className="py-3 pr-4">
                              <div className="flex items-center justify-end gap-1.5">
                                {d.status === 'PENDING' && (
                                  <button
                                    onClick={() => approve(d)}
                                    disabled={busy}
                                    title="Duyệt"
                                    className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg cursor-pointer disabled:opacity-50"
                                  >
                                    <CheckCircle2 className="w-4 h-4" />
                                  </button>
                                )}
                                <button
                                  onClick={() => toggleFeatured(d)}
                                  disabled={busy || (d.status !== 'APPROVED' && !d.isFeatured)}
                                  title={
                                    d.isFeatured
                                      ? 'Bỏ khỏi danh sách nổi bật'
                                      : d.status === 'APPROVED'
                                        ? 'Đặt làm điểm đến nổi bật (hiện ở trang chủ)'
                                        : 'Chỉ điểm đến đã duyệt mới đặt được nổi bật'
                                  }
                                  aria-pressed={!!d.isFeatured}
                                  className="p-1.5 text-gray-400 hover:text-[#a43c12] hover:bg-[#FFB347]/15 rounded-lg cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                  <Star className={`w-4 h-4 ${d.isFeatured ? 'fill-[#FFB347] text-[#FFB347]' : ''}`} />
                                </button>
                                <button
                                  onClick={() => openForm(d)}
                                  title="Chỉnh sửa & Quản lý ảnh"
                                  className="p-1.5 text-gray-500 hover:text-[#006971] hover:bg-[#e6f4f2] rounded-lg cursor-pointer"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => remove(d)}
                                  disabled={busy}
                                  title="Xóa"
                                  className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer disabled:opacity-50"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
              <div className="p-4 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-3">
                <p className="text-xs text-gray-500">
                  {filtered.length === 0 ? (
                    <>Không có điểm đến nào</>
                  ) : (
                    <>
                      Hiển thị <b>{pageStart + 1}–{pageStart + paged.length}</b> trong <b>{filtered.length}</b> điểm đến phù hợp (tổng <b>{all.length}</b>, {PAGE_SIZE} điểm đến/trang)
                    </>
                  )}
                </p>
                <Pagination page={currentPage} totalPages={totalPages} onChange={setPage} />
              </div>
            </div>
          )}
        </AsyncContent>
      </div>

      {formOpen && (
        <Modal
          title={editing ? 'Chỉnh Sửa Điểm Đến & Hình Ảnh' : 'Thêm Điểm Đến Mới'}
          icon={MapPin}
          maxWidth="max-w-3xl"
          onClose={closeForm}
        >
          <form onSubmit={submit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Tên điểm đến" required className="md:col-span-2">
                <input
                  type="text"
                  required
                  maxLength={150}
                  value={form.name}
                  onChange={(e) => set({ name: e.target.value })}
                  placeholder="VD: Cầu Rồng, Bà Nà Hills, Bán đảo Sơn Trà..."
                  className={inputClass}
                />
              </Field>

              <Field label="Quận / Huyện" required>
                <select value={form.district} onChange={(e) => set({ district: e.target.value })} className={inputClass}>
                  {DISTRICTS.map((d) => (
                    <option key={d}>{d}</option>
                  ))}
                </select>
              </Field>

              <Field label="Danh mục điểm đến">
                <select value={form.categoryId} onChange={(e) => set({ categoryId: e.target.value })} className={inputClass}>
                  <option value="">-- Chọn danh mục --</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </Field>

              {editing && (
                <Field label="Trạng thái kiểm duyệt" className="md:col-span-2">
                  <select
                    value={form.status}
                    onChange={(e) => set({ status: e.target.value as ContentStatus })}
                    className={inputClass}
                  >
                    {CONTENT_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {CONTENT_STATUS_LABEL[s]}
                      </option>
                    ))}
                  </select>
                </Field>
              )}

              <Field label="Link Google Maps" className="md:col-span-2">
                <input
                  type="url"
                  value={form.addressUrl}
                  onChange={(e) => set({ addressUrl: e.target.value })}
                  placeholder="https://maps.google.com/?q=..."
                  className={inputClass}
                />
              </Field>

              <div className="md:col-span-2 p-3.5 rounded-xl bg-[#e6f4f2]/50 border border-[#006971]/20">
                <span className="font-bold text-xs text-[#006971] flex items-center gap-1.5 mb-2">
                  <Compass className="w-4 h-4" /> Tọa độ GPS (dùng cho bản đồ & chỉ đường)
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Vĩ độ (Latitude)">
                    <input
                      type="number"
                      step="any"
                      min={-90}
                      max={90}
                      value={form.latitude}
                      onChange={(e) => set({ latitude: e.target.value })}
                      placeholder="16.0611"
                      className={`${inputClass} font-mono`}
                    />
                  </Field>
                  <Field label="Kinh độ (Longitude)">
                    <input
                      type="number"
                      step="any"
                      min={-180}
                      max={180}
                      value={form.longitude}
                      onChange={(e) => set({ longitude: e.target.value })}
                      placeholder="108.2251"
                      className={`${inputClass} font-mono`}
                    />
                  </Field>
                </div>
              </div>

              <Field label="Giờ mở cửa">
                <input
                  type="text"
                  maxLength={100}
                  value={form.openHours}
                  onChange={(e) => set({ openHours: e.target.value })}
                  placeholder="07:30 - 21:00 hoặc Mở cả ngày"
                  className={inputClass}
                />
              </Field>

              <Field label="Giá vé">
                <input
                  type="text"
                  maxLength={150}
                  value={form.ticketPrice}
                  onChange={(e) => set({ ticketPrice: e.target.value })}
                  placeholder="Miễn phí hoặc 900.000đ"
                  className={inputClass}
                />
              </Field>

              <Field label="Mô tả chi tiết" className="md:col-span-2">
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => set({ description: e.target.value })}
                  placeholder="Giới thiệu về cảnh đẹp, trải nghiệm hấp dẫn tại điểm đến..."
                  className={inputClass}
                />
              </Field>
            </div>

            {/* ───────── KHU VỰC QUẢN LÝ VÀ TẢI ẢNH (Supabase Storage) ───────── */}
            <div className="pt-4 border-t border-[#e2e8f0] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-[#006971]" /> Hình ảnh điểm đến (Tối đa 10 ảnh)
                  </h4>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Ảnh tải lên từ máy tính sẽ được lưu trực tiếp vào Supabase Storage (JPG, PNG, WebP)
                  </p>
                </div>
                <span className="text-xs font-semibold text-gray-500">
                  {existingImages.length + pendingFiles.length} / 10 ảnh
                </span>
              </div>

              {/* Danh sách ảnh hiện có (nếu đang sửa) */}
              {existingImages.length > 0 && (
                <div>
                  <p className="text-[11px] font-bold text-gray-700 mb-2">Ảnh đã lưu:</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                    {existingImages.map((img, idx) => {
                      const url = getImageUrl(img);
                      return (
                        <div
                          key={idx}
                          className="group relative aspect-square rounded-xl overflow-hidden border border-gray-200 bg-gray-50 shadow-xs"
                        >
                          <img src={url} alt="" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => deleteExistingImage(img)}
                            className="absolute top-1.5 right-1.5 p-1 rounded-lg bg-black/60 text-white hover:bg-red-600 transition-colors cursor-pointer"
                            title="Xóa ảnh này"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Danh sách ảnh mới chuẩn bị tải lên */}
              {pendingFiles.length > 0 && (
                <div>
                  <p className="text-[11px] font-bold text-emerald-700 mb-2">Ảnh mới chuẩn bị tải lên:</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                    {pendingFiles.map((p, idx) => (
                      <div
                        key={idx}
                        className="group relative aspect-square rounded-xl overflow-hidden border-2 border-emerald-500/50 bg-emerald-50/20 shadow-xs"
                      >
                        <img src={p.previewUrl} alt="" className="w-full h-full object-cover" />
                        <span className="absolute bottom-1 left-1 right-1 bg-black/70 text-white text-[9px] px-1 py-0.5 rounded truncate">
                          {p.file.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => removePendingFile(idx)}
                          className="absolute top-1.5 right-1.5 p-1 rounded-lg bg-black/60 text-white hover:bg-rose-600 transition-colors cursor-pointer"
                          title="Hủy ảnh này"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Ô bấm chọn hoặc kéo thả tải ảnh */}
              {existingImages.length + pendingFiles.length < 10 && (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-[#006971]/30 hover:border-[#006971] bg-[#e6f4f2]/30 hover:bg-[#e6f4f2]/60 rounded-2xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2"
                >
                  <div className="w-10 h-10 rounded-full bg-[#006971]/10 text-[#006971] flex items-center justify-center">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-800">
                      Bấm để chọn ảnh từ máy tính <span className="text-[#006971]">hoặc kéo thả vào đây</span>
                    </p>
                    <p className="text-[10px] text-gray-500 mt-0.5">
                      Định dạng JPG, PNG, WebP (Tối đa 10MB mỗi ảnh)
                    </p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp,image/jpg"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              )}
            </div>

            <ModalActions
              onCancel={closeForm}
              submitLabel={editing ? 'Lưu Thay Đổi & Tải Ảnh' : 'Tạo Điểm Đến & Tải Ảnh'}
              busy={busy}
            />
          </form>
        </Modal>
      )}
    </div>
  );
}
