'use client';

import React, { useMemo, useState, useRef } from 'react';
import Header from '@/components/Header';
import {
  Modal,
  Field,
  ModalActions,
  inputClass,
  PageHeading,
  searchInputClass,
  selectClass,
  StatusBadge,
  AsyncContent,
} from '@/components/ui';
import { useApi, upsertById, removeById, orUndefined, getImageUrl, getImageId, formatVND } from '@/lib/utils';
import Pagination from '@/components/Pagination';
import { useAction, usePending } from '@/lib/context';
import {
  CONTENT_STATUS_LABEL,
  CONTENT_STATUSES,
  DISTRICTS,
  LODGING_TYPES,
  type ContentStatus,
  type Lodging,
  type LodgingInput,
  type DestinationImage,
} from '@/lib/types';
import {
  Search,
  MapPin,
  Hotel,
  Edit,
  Trash2,
  Star,
  Compass,
  CheckCircle2,
  ImageOff,
  Upload,
  X,
  ImageIcon,
  Users,
  ArrowUp,
  ArrowDown,
  Check,
} from 'lucide-react';
import { lodgingApi } from '@/lib/api';

const emptyForm = {
  name: '',
  type: LODGING_TYPES[0],
  district: DISTRICTS[0],
  pricePerNight: '800000',
  maxGuests: '2',
  checkin: '14:00',
  checkout: '12:00',
  avgRating: '4.5',
  latitude: '16.0611',
  longitude: '108.2435',
  addressUrl: '',
  website: '',
  description: '',
  status: 'APPROVED' as ContentStatus,
  amenityIds: [] as number[],
};
type FormState = typeof emptyForm;

const toForm = (l: Lodging): FormState => ({
  name: l.name,
  type: l.type || LODGING_TYPES[0],
  district: l.district || DISTRICTS[0],
  pricePerNight: String(l.pricePerNight ?? 800000),
  maxGuests: String(l.maxGuests ?? 2),
  checkin: l.checkin || '14:00',
  checkout: l.checkout || '12:00',
  avgRating: String(l.avgRating ?? 4.5),
  latitude: l.latitude?.toString() ?? '16.0611',
  longitude: l.longitude?.toString() ?? '108.2435',
  addressUrl: l.addressUrl ?? '',
  website: l.website ?? '',
  description: l.description ?? '',
  status: (l.status as ContentStatus) || 'APPROVED',
  amenityIds: l.amenityIds ? [...l.amenityIds] : [],
});

const toInput = (f: FormState): LodgingInput => ({
  name: f.name.trim(),
  type: f.type,
  district: f.district,
  pricePerNight: Number(f.pricePerNight) || 0,
  maxGuests: Number(f.maxGuests) || 2,
  checkin: f.checkin || '14:00',
  checkout: f.checkout || '12:00',
  avgRating: f.avgRating ? Number(f.avgRating) : 4.5,
  latitude: f.latitude ? Number(f.latitude) : undefined,
  longitude: f.longitude ? Number(f.longitude) : undefined,
  addressUrl: orUndefined(f.addressUrl),
  website: orUndefined(f.website),
  description: orUndefined(f.description),
  status: f.status,
  amenityIds: f.amenityIds,
});

interface PendingUploadFile {
  file: File;
  previewUrl: string;
}

const PAGE_SIZE = 20; // số nơi lưu trú mỗi trang

export default function LodgingsPage() {
  const { data, loading, error, reload, setData } = useApi(lodgingApi.listAll);
  const { data: amenitiesData } = useApi(lodgingApi.getAmenities);
  const amenities = amenitiesData ?? [];

  const { refresh } = usePending();
  const { run, busy } = useAction();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [district, setDistrict] = useState('ALL');
  const [status, setStatus] = useState<ContentStatus | 'ALL'>('ALL');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);

  const [editing, setEditing] = useState<Lodging | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);

  // Quản lý ảnh trong form (upload vào bucket lodgings_image)
  const [existingImages, setExistingImages] = useState<(string | DestinationImage)[]>([]);
  const [pendingFiles, setPendingFiles] = useState<PendingUploadFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return (data ?? [])
      .filter(
        (l) =>
          (typeFilter === 'ALL' || l.type === typeFilter) &&
          (district === 'ALL' || l.district === district) &&
          (status === 'ALL' || l.status === status) &&
          (l.name.toLowerCase().includes(q) ||
            (l.description ?? '').toLowerCase().includes(q) ||
            (l.district ?? '').toLowerCase().includes(q))
      )
      .sort((a, b) => (sortOrder === 'asc' ? a.id - b.id : b.id - a.id));
  }, [data, search, typeFilter, district, status, sortOrder]);

  // Phân trang (không để trang hiện tại vượt quá tổng số trang khi lọc ra ít kết quả hơn)
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const paged = filtered.slice(pageStart, pageStart + PAGE_SIZE);

  const upsert = (saved: Lodging) => setData((xs) => upsertById(xs, saved));

  const cleanupPendingFiles = () => {
    pendingFiles.forEach((p) => URL.revokeObjectURL(p.previewUrl));
    setPendingFiles([]);
  };

  const openForm = (l: Lodging | null) => {
    cleanupPendingFiles();
    setEditing(l);
    setForm(l ? toForm(l) : emptyForm);
    setExistingImages(l?.images ? [...l.images] : []);
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
      alert(`Bạn chỉ có thể chọn thêm tối đa ${Math.max(0, totalAllowed)} ảnh.`);
    }

    for (const file of files.slice(0, Math.max(0, totalAllowed))) {
      if (!allowedTypes.includes(file.type)) {
        alert(`File "${file.name}" không đúng định dạng. Chỉ chấp nhận JPG, PNG, WebP, GIF.`);
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert(`Ảnh "${file.name}" vượt quá giới hạn 5MB của bucket lodgings_image.`);
        continue;
      }
      validFiles.push({
        file,
        previewUrl: URL.createObjectURL(file),
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
    if (!window.confirm('Bạn có chắc muốn xóa ảnh này khỏi nơi lưu trú?')) return;

    if (imgId) {
      await run(async () => {
        await lodgingApi.deleteImage(imgId);
        setExistingImages((prev) => prev.filter((x) => getImageId(x) !== imgId));
        if (editing) {
          const updatedImages = (editing.images ?? []).filter((x) => getImageId(x) !== imgId);
          setEditing({ ...editing, images: updatedImages });
          upsert({ ...editing, images: updatedImages });
        }
      }, 'Đã xóa ảnh khỏi bucket lodgings_image.');
    }
  };

  const toggleAmenityId = (id: number) => {
    setForm((prev) => ({
      ...prev,
      amenityIds: prev.amenityIds.includes(id)
        ? prev.amenityIds.filter((x) => x !== id)
        : [...prev.amenityIds, id],
    }));
  };

  const approve = (l: Lodging) =>
    run(async () => {
      upsert(await lodgingApi.setStatus(l.id, 'APPROVED'));
      refresh();
    }, `Đã duyệt "${l.name}".`);

  const remove = (l: Lodging) => {
    if (!window.confirm(`Xóa nơi lưu trú "${l.name}"?`)) return;
    run(async () => {
      await lodgingApi.remove(l.id);
      setData((xs) => removeById(xs, l.id));
      refresh();
    }, 'Đã xóa nơi lưu trú.');
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await run(async () => {
      let saved: Lodging;
      if (!editing) {
        saved = await lodgingApi.create(toInput(form));
      } else {
        saved = await lodgingApi.update(editing.id, toInput(form));
      }

      if (pendingFiles.length > 0) {
        const filesToUpload = pendingFiles.map((p) => p.file);
        const uploadedImages = await lodgingApi.uploadImages(saved.id, filesToUpload);
        saved.images = [...(saved.images ?? []), ...uploadedImages];
      }

      upsert(saved);
    }, editing ? 'Đã cập nhật nơi lưu trú và hình ảnh.' : 'Đã thêm nơi lưu trú mới thành công.');

    if (ok) closeForm();
  };

  const set = (patch: Partial<FormState>) => setForm((f) => ({ ...f, ...patch }));

  return (
    <div className="flex-1 flex flex-col">
      <Header title="Quản Lý Nơi Lưu Trú" breadcrumb="Khách sạn, Resort, Villa & Homestay" />

      <div className="p-6 md:p-8 space-y-6 max-w-7xl w-full mx-auto">
        <PageHeading
          title="Nơi Lưu Trú (Lodging)"
          description="Quản lý danh sách khách sạn, resort, villa, homestay và tải ảnh lên bucket lodgings_image"
          actionLabel="Thêm Nơi Lưu Trú"
          onAction={() => openForm(null)}
        />

        <div className="flex flex-wrap items-center gap-3 bg-white p-4 rounded-2xl border border-[#e2e8f0] shadow-xs">
          <div className="relative min-w-[220px] flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Tìm theo tên khách sạn, mô tả, khu vực..."
              className={searchInputClass}
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
            className={selectClass}
            aria-label="Lọc loại nơi ở"
          >
            <option value="ALL">Tất cả loại nơi ở</option>
            {LODGING_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          <select
            value={district}
            onChange={(e) => { setDistrict(e.target.value); setPage(1); }}
            className={selectClass}
            aria-label="Lọc quận/huyện"
          >
            <option value="ALL">Tất cả quận/huyện</option>
            {DISTRICTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
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
                      <th className="py-3.5 px-3">Nơi lưu trú</th>
                      <th className="py-3.5 px-3">Loại</th>
                      <th className="py-3.5 px-3">Khu vực</th>
                      <th className="py-3.5 px-3">Sức chứa</th>
                      <th className="py-3.5 px-3">Giá / Đêm</th>
                      <th className="py-3.5 px-3">Đánh giá</th>
                      <th className="py-3.5 px-3">Trạng thái</th>
                      <th className="py-3.5 pr-4 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-xs">
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="py-8 text-center text-gray-400 font-medium">
                          Không có nơi lưu trú nào phù hợp.
                        </td>
                      </tr>
                    ) : (
                      paged.map((l) => {
                        const firstImgUrl = getImageUrl(l.images?.[0]);
                        const imageCount = l.images?.length ?? 0;

                        return (
                          <tr key={l.id} className="hover:bg-[#e6f4f2]/70 transition-colors">
                            <td className="py-3 pl-4 font-mono font-bold text-gray-600 whitespace-nowrap">
                              #{l.id}
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
                                  <p className="font-bold text-gray-900 text-sm">{l.name}</p>
                                  <p className="text-[11px] text-gray-500 truncate max-w-[260px]">
                                    {(l.amenities ?? []).slice(0, 4).join(', ') || l.description || '—'}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-3 whitespace-nowrap">
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#e6f4f2] text-[#006971]">
                                <Hotel className="w-3 h-3" /> {l.type}
                              </span>
                            </td>
                            <td className="py-3 px-3 font-semibold text-gray-700 whitespace-nowrap">
                              {l.district || '—'}
                            </td>
                            <td className="py-3 px-3 whitespace-nowrap text-gray-700 font-semibold">
                              <span className="inline-flex items-center gap-1">
                                <Users className="w-3.5 h-3.5 text-purple-600" /> {l.maxGuests} khách
                              </span>
                            </td>
                            <td className="py-3 px-3 font-bold text-[#006971] whitespace-nowrap">
                              {formatVND(l.pricePerNight)}
                            </td>
                            <td className="py-3 px-3">
                              <span className="flex items-center gap-1 font-bold text-gray-900">
                                <Star className="w-3.5 h-3.5 fill-[#FFB347] text-[#FFB347]" />
                                {Number(l.avgRating ?? 4.5).toFixed(1)}
                              </span>
                            </td>
                            <td className="py-3 px-3">
                              <StatusBadge status={l.status} size="xs" />
                            </td>
                            <td className="py-3 pr-4">
                              <div className="flex items-center justify-end gap-1.5">
                                {l.status === 'PENDING' && (
                                  <button
                                    onClick={() => approve(l)}
                                    disabled={busy}
                                    title="Duyệt"
                                    className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg cursor-pointer"
                                  >
                                    <CheckCircle2 className="w-4 h-4" />
                                  </button>
                                )}
                                <button
                                  onClick={() => openForm(l)}
                                  title="Chỉnh sửa & Tải ảnh"
                                  className="p-1.5 text-gray-500 hover:text-[#006971] hover:bg-[#e6f4f2] rounded-lg cursor-pointer"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => remove(l)}
                                  disabled={busy}
                                  title="Xóa"
                                  className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
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
                    <>Không có nơi lưu trú nào</>
                  ) : (
                    <>
                      Hiển thị <b>{pageStart + 1}–{pageStart + paged.length}</b> trong <b>{filtered.length}</b> nơi lưu trú phù hợp (tổng <b>{all.length}</b>, {PAGE_SIZE} nơi/trang)
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
          title={editing ? 'Chỉnh Sửa Nơi Lưu Trú & Hình Ảnh' : 'Thêm Nơi Lưu Trú Mới'}
          icon={Hotel}
          maxWidth="max-w-3xl"
          onClose={closeForm}
        >
          <form onSubmit={submit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Tên nơi lưu trú" required className="md:col-span-2">
                <input
                  type="text"
                  required
                  maxLength={200}
                  value={form.name}
                  onChange={(e) => set({ name: e.target.value })}
                  placeholder="VD: Saha Casa Boutique Hotel Da Nang..."
                  className={inputClass}
                />
              </Field>

              <Field label="Loại nơi ở" required>
                <select
                  value={form.type}
                  onChange={(e) => set({ type: e.target.value })}
                  className={inputClass}
                >
                  {LODGING_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Quận / Huyện" required>
                <select
                  value={form.district}
                  onChange={(e) => set({ district: e.target.value })}
                  className={inputClass}
                >
                  {DISTRICTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Giá phòng / đêm (VND)" required>
                <input
                  type="number"
                  required
                  min={0}
                  step={10000}
                  value={form.pricePerNight}
                  onChange={(e) => set({ pricePerNight: e.target.value })}
                  className={inputClass}
                />
              </Field>

              <Field label="Sức chứa tối đa (Số người)" required>
                <input
                  type="number"
                  required
                  min={1}
                  max={50}
                  value={form.maxGuests}
                  onChange={(e) => set({ maxGuests: e.target.value })}
                  className={inputClass}
                />
              </Field>

              <Field label="Giờ nhận phòng (Check-in)">
                <input
                  type="text"
                  value={form.checkin}
                  onChange={(e) => set({ checkin: e.target.value })}
                  placeholder="14:00"
                  className={inputClass}
                />
              </Field>

              <Field label="Giờ trả phòng (Check-out)">
                <input
                  type="text"
                  value={form.checkout}
                  onChange={(e) => set({ checkout: e.target.value })}
                  placeholder="12:00"
                  className={inputClass}
                />
              </Field>

              <Field label="Điểm đánh giá (0 - 5)">
                <input
                  type="number"
                  step="0.1"
                  min={0}
                  max={5}
                  value={form.avgRating}
                  onChange={(e) => set({ avgRating: e.target.value })}
                  className={inputClass}
                />
              </Field>

              <Field label="Trạng thái kiểm duyệt">
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

              <Field label="Link Google Maps" className="md:col-span-2">
                <input
                  type="url"
                  value={form.addressUrl}
                  onChange={(e) => set({ addressUrl: e.target.value })}
                  placeholder="https://www.google.com/maps/search/?api=1&query=..."
                  className={inputClass}
                />
              </Field>

              <div className="md:col-span-2 p-3.5 rounded-xl bg-[#e6f4f2]/50 border border-[#006971]/20">
                <span className="font-bold text-xs text-[#006971] flex items-center gap-1.5 mb-2">
                  <Compass className="w-4 h-4" /> Tọa độ GPS
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Vĩ độ (Latitude)">
                    <input
                      type="number"
                      step="any"
                      value={form.latitude}
                      onChange={(e) => set({ latitude: e.target.value })}
                      className={`${inputClass} font-mono`}
                    />
                  </Field>
                  <Field label="Kinh độ (Longitude)">
                    <input
                      type="number"
                      step="any"
                      value={form.longitude}
                      onChange={(e) => set({ longitude: e.target.value })}
                      className={`${inputClass} font-mono`}
                    />
                  </Field>
                </div>
              </div>

              <Field label="Mô tả chi tiết" className="md:col-span-2">
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => set({ description: e.target.value })}
                  placeholder="Giới thiệu về không gian, vị trí và điểm nổi bật của nơi lưu trú..."
                  className={inputClass}
                />
              </Field>

              {/* Tiện ích đi kèm */}
              {amenities.length > 0 && (
                <div className="md:col-span-2 space-y-2">
                  <span className="block text-xs font-bold text-gray-700">
                    Tiện ích nơi lưu trú ({form.amenityIds.length} đã chọn)
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-40 overflow-y-auto p-2.5 bg-gray-50 rounded-xl border border-gray-200">
                    {amenities.map((am) => {
                      const checked = form.amenityIds.includes(am.id);
                      return (
                        <button
                          key={am.id}
                          type="button"
                          onClick={() => toggleAmenityId(am.id)}
                          className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold flex items-center justify-between cursor-pointer transition-all ${
                            checked
                              ? 'border-[#006971] bg-[#e6f4f2] text-[#006971]'
                              : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          <span className="truncate">{am.nameVi}</span>
                          {checked && <Check className="w-3.5 h-3.5 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Khu vực tải ảnh lên bucket lodgings_image */}
            <div className="pt-4 border-t border-[#e2e8f0] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-[#006971]" /> Hình ảnh nơi lưu trú (Bucket: lodgings_image)
                  </h4>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Ảnh tải lên sẽ được lưu trực tiếp vào Supabase Storage bucket <b>lodgings_image</b> (Tối đa 5MB/ảnh)
                  </p>
                </div>
                <span className="text-xs font-semibold text-gray-500">
                  {existingImages.length + pendingFiles.length} / 10 ảnh
                </span>
              </div>

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
                      Bấm để chọn ảnh từ máy tính <span className="text-[#006971]">tải lên bucket lodgings_image</span>
                    </p>
                    <p className="text-[10px] text-gray-500 mt-0.5">
                      Định dạng JPG, PNG, WebP (Tối đa 5MB mỗi ảnh)
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
              submitLabel={editing ? 'Lưu Thay Đổi & Tải Ảnh' : 'Tạo Nơi Lưu Trú & Tải Ảnh'}
              busy={busy}
            />
          </form>
        </Modal>
      )}
    </div>
  );
}
