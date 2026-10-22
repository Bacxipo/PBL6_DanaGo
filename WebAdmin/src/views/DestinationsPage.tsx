'use client';

import React, { useMemo, useState } from 'react';
import Header from '@/components/Header';
import { Modal, Field, ModalActions, inputClass, PageHeading, searchInputClass, selectClass, StatusBadge, AsyncContent } from '@/components/ui';
import { useApi, upsertById, removeById, orUndefined } from '@/lib/utils';
import { useAction, usePending } from '@/lib/context';
import { CONTENT_STATUS_LABEL, CONTENT_STATUSES, DISTRICTS, type ContentStatus, type Destination, type DestinationInput } from '@/lib/types';
import { Search, MapPin, Edit, Trash2, Star, Compass, CheckCircle2, ImageOff } from 'lucide-react';
import { destinationApi } from '@/lib/api';

const emptyForm = { name: '', description: '', district: DISTRICTS[0], addressUrl: '', latitude: '', longitude: '', ticketPrice: 'Miễn phí', openHours: '', status: 'APPROVED' as ContentStatus };
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
  status: d.status
});

const toInput = (f: FormState): DestinationInput => ({
  name: f.name.trim(),
  district: f.district,
  description: orUndefined(f.description),
  addressUrl: orUndefined(f.addressUrl),
  latitude: f.latitude ? Number(f.latitude) : undefined,
  longitude: f.longitude ? Number(f.longitude) : undefined,
  ticketPrice: orUndefined(f.ticketPrice),
  openHours: orUndefined(f.openHours)
});

export default function DestinationsPage() {
  const { data, loading, error, reload, setData } = useApi(destinationApi.listAll);
  const { refresh } = usePending();
  const { run, busy } = useAction();

  const [search, setSearch] = useState('');
  const [district, setDistrict] = useState('ALL');
  const [status, setStatus] = useState<ContentStatus | 'ALL'>('ALL');
  const [editing, setEditing] = useState<Destination | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return (data ?? []).filter(
      (d) => (district === 'ALL' || d.district === district) && (status === 'ALL' || d.status === status) && (d.name.toLowerCase().includes(q) || (d.description ?? '').toLowerCase().includes(q))
    );
  }, [data, search, district, status]);

  const upsert = (saved: Destination) => setData((xs) => upsertById(xs, saved));

  const openForm = (d: Destination | null) => {
    setEditing(d);
    setForm(d ? toForm(d) : emptyForm);
    setFormOpen(true);
  };

  const approve = (d: Destination) =>
    run(async () => {
      upsert(await destinationApi.setStatus(d.id, 'APPROVED'));
      refresh();
    }, `Đã duyệt "${d.name}".`);

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
      if (!editing) return upsert(await destinationApi.create(toInput(form)));
      let saved = await destinationApi.update(editing.id, toInput(form));
      if (form.status !== editing.status) {
        saved = await destinationApi.setStatus(editing.id, form.status);
        refresh();
      }
      upsert(saved);
    }, editing ? 'Đã cập nhật điểm đến.' : 'Đã thêm điểm đến.');
    if (ok) setFormOpen(false);
  };

  const set = (patch: Partial<FormState>) => setForm((f) => ({ ...f, ...patch }));

  return (
    <div className="flex-1 flex flex-col">
      <Header title="Quản Lý Điểm Đến" breadcrumb="Điểm đến du lịch" />

      <div className="p-6 md:p-8 space-y-6 max-w-7xl w-full mx-auto">
        <PageHeading title="Điểm Đến Du Lịch" description="Điểm đến do quản trị viên thêm được duyệt ngay; đề xuất từ du khách cần kiểm duyệt" actionLabel="Thêm Điểm Đến Mới" onAction={() => openForm(null)} />

        <div className="flex flex-wrap items-center gap-3 bg-white p-4 rounded-2xl border border-[#e2e8f0] shadow-xs">
          <div className="relative min-w-[220px] flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm theo tên, mô tả..." className={searchInputClass} />
          </div>
          <select value={district} onChange={(e) => setDistrict(e.target.value)} className={selectClass} aria-label="Lọc quận/huyện">
            <option value="ALL">Tất cả quận/huyện</option>
            {DISTRICTS.map((d) => <option key={d}>{d}</option>)}
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value as ContentStatus | 'ALL')} className={selectClass} aria-label="Lọc trạng thái">
            <option value="ALL">Tất cả trạng thái</option>
            {CONTENT_STATUSES.map((s) => <option key={s} value={s}>{CONTENT_STATUS_LABEL[s]}</option>)}
          </select>
        </div>

        <AsyncContent loading={loading} error={error} data={data} onRetry={reload}>
          {(all) => (
            <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#e6f4f2] border-b border-[#e2e8f0] text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                      <th className="py-3.5 pl-4">Điểm đến</th>
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
                      <tr><td colSpan={7} className="py-8 text-center text-gray-400 font-medium">Không có điểm đến nào phù hợp.</td></tr>
                    ) : (
                      filtered.map((d) => (
                        <tr key={d.id} className="hover:bg-[#e6f4f2]/70 transition-colors">
                          <td className="py-3 pl-4">
                            <div className="flex items-center gap-3">
                              {d.images?.[0] ? (
                                <img src={d.images[0]} alt="" className="w-12 h-12 rounded-xl object-cover shrink-0 border border-gray-200" />
                              ) : (
                                <div className="w-12 h-12 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0"><ImageOff className="w-4 h-4 text-gray-400" /></div>
                              )}
                              <div className="min-w-0">
                                <p className="font-bold text-gray-900 text-sm">{d.name}</p>
                                {d.addressUrl && (
                                  <a href={d.addressUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-0.5 text-[11px] text-[#006971] hover:underline">
                                    <MapPin className="w-3 h-3" /> Xem bản đồ
                                  </a>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-3 font-semibold text-gray-700 whitespace-nowrap">{d.district}</td>
                          <td className="py-3 px-3 text-gray-600">{d.openHours ?? '—'}</td>
                          <td className="py-3 px-3 font-bold text-gray-900">{d.ticketPrice ?? '—'}</td>
                          <td className="py-3 px-3">
                            <span className="flex items-center gap-1 font-bold text-gray-900"><Star className="w-3.5 h-3.5 fill-[#FFB347] text-[#FFB347]" />{d.avgRating.toFixed(1)}</span>
                          </td>
                          <td className="py-3 px-3"><StatusBadge status={d.status} size="xs" /></td>
                          <td className="py-3 pr-4">
                            <div className="flex items-center justify-end gap-1.5">
                              {d.status === 'PENDING' && (
                                <button onClick={() => approve(d)} disabled={busy} title="Duyệt" className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg cursor-pointer disabled:opacity-50"><CheckCircle2 className="w-4 h-4" /></button>
                              )}
                              <button onClick={() => openForm(d)} title="Chỉnh sửa" className="p-1.5 text-gray-500 hover:text-[#006971] hover:bg-[#e6f4f2] rounded-lg cursor-pointer"><Edit className="w-4 h-4" /></button>
                              <button onClick={() => remove(d)} disabled={busy} title="Xóa" className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer disabled:opacity-50"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <p className="p-4 border-t border-gray-100 text-xs text-gray-500">Hiển thị <b>{filtered.length}</b> trên tổng số <b>{all.length}</b> điểm đến</p>
            </div>
          )}
        </AsyncContent>
      </div>

      {formOpen && (
        <Modal title={editing ? 'Chỉnh Sửa Điểm Đến' : 'Thêm Điểm Đến Mới'} icon={MapPin} maxWidth="max-w-2xl" onClose={() => setFormOpen(false)}>
          <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Tên điểm đến" required className="md:col-span-2">
                <input type="text" required maxLength={150} value={form.name} onChange={(e) => set({ name: e.target.value })} placeholder="VD: Cầu Rồng, Bà Nà Hills..." className={inputClass} />
              </Field>
              <Field label="Quận / Huyện" required>
                <select value={form.district} onChange={(e) => set({ district: e.target.value })} className={inputClass}>
                  {DISTRICTS.map((d) => <option key={d}>{d}</option>)}
                </select>
              </Field>
              {editing && (
                <Field label="Trạng thái">
                  <select value={form.status} onChange={(e) => set({ status: e.target.value as ContentStatus })} className={inputClass}>
                    {CONTENT_STATUSES.map((s) => <option key={s} value={s}>{CONTENT_STATUS_LABEL[s]}</option>)}
                  </select>
                </Field>
              )}
              <Field label="Link Google Maps" className="md:col-span-2">
                <input type="url" value={form.addressUrl} onChange={(e) => set({ addressUrl: e.target.value })} placeholder="https://maps.google.com/?q=..." className={inputClass} />
              </Field>

              <div className="md:col-span-2 p-3.5 rounded-xl bg-[#e6f4f2]/50 border border-[#006971]/20">
                <span className="font-bold text-xs text-[#006971] flex items-center gap-1.5 mb-2"><Compass className="w-4 h-4" /> Tọa độ GPS (dùng cho bản đồ & chỉ đường)</span>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Vĩ độ"><input type="number" step="any" min={-90} max={90} value={form.latitude} onChange={(e) => set({ latitude: e.target.value })} placeholder="16.0611" className={`${inputClass} font-mono`} /></Field>
                  <Field label="Kinh độ"><input type="number" step="any" min={-180} max={180} value={form.longitude} onChange={(e) => set({ longitude: e.target.value })} placeholder="108.2251" className={`${inputClass} font-mono`} /></Field>
                </div>
              </div>

              <Field label="Giờ mở cửa"><input type="text" maxLength={100} value={form.openHours} onChange={(e) => set({ openHours: e.target.value })} placeholder="07:30 - 21:00 hoặc Mở cả ngày" className={inputClass} /></Field>
              <Field label="Giá vé"><input type="text" maxLength={150} value={form.ticketPrice} onChange={(e) => set({ ticketPrice: e.target.value })} placeholder="Miễn phí / 900.000đ" className={inputClass} /></Field>
              <Field label="Mô tả" className="md:col-span-2"><textarea rows={3} value={form.description} onChange={(e) => set({ description: e.target.value })} className={inputClass} /></Field>
            </div>
            <ModalActions onCancel={() => setFormOpen(false)} submitLabel={editing ? 'Cập Nhật' : 'Lưu Điểm Đến'} busy={busy} />
          </form>
        </Modal>
      )}
    </div>
  );
}
