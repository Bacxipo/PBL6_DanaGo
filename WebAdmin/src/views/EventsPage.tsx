'use client';

import React, { useMemo, useState } from 'react';
import Header from '@/components/Header';
import { Modal, Field, ModalActions, inputClass, PageHeading, searchInputClass, selectClass, StatusBadge, AsyncContent, EmptyState } from '@/components/ui';
import { useApi, upsertById, removeById, formatDate, orUndefined, splitLines, todayIso } from '@/lib/utils';
import { useAction, usePending } from '@/lib/context';
import { CONTENT_STATUS_LABEL, CONTENT_STATUSES, getTimeline, TIMELINE_LABEL, type ContentStatus, type EventItem, type EventTimeline } from '@/lib/types';
import { Calendar, Search, MapPin, Edit, Trash2, ImageOff, Ticket, CheckCircle2, XCircle } from 'lucide-react';
import { destinationApi, eventApi } from '@/lib/api';

const TIMELINE_STYLE: Record<EventTimeline, string> = {
  HAPPENING: 'bg-emerald-500 text-white',
  UPCOMING: 'bg-amber-500 text-white',
  ENDED: 'bg-gray-500 text-white'
};
const TIMELINE_ORDER: Record<EventTimeline, number> = { HAPPENING: 0, UPCOMING: 1, ENDED: 2 };

const emptyForm = () => ({ name: '', description: '', destinationId: '', locationNote: '', startDate: todayIso(), endDate: todayIso(), ticketPrice: '0', imageUrls: '' });
type FormState = ReturnType<typeof emptyForm>;

export default function EventsPage() {
  const { data, loading, error, reload, setData } = useApi(eventApi.listAll);
  const { data: destinations } = useApi(destinationApi.listAll);
  const { refresh } = usePending();
  const { run, busy } = useAction();

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<ContentStatus | 'ALL'>('ALL');
  const [editing, setEditing] = useState<EventItem | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);

  const approvedDestinations = useMemo(() => (destinations ?? []).filter((d) => d.status === 'APPROVED'), [destinations]);

  const rows = useMemo(() => {
    const q = search.toLowerCase();
    return (data ?? [])
      .filter((ev) => (status === 'ALL' || ev.status === status) && (ev.name.toLowerCase().includes(q) || (ev.locationNote ?? '').toLowerCase().includes(q) || (ev.destination?.name ?? '').toLowerCase().includes(q)))
      .map((ev) => ({ ev, timeline: getTimeline(ev) }))
      .sort((a, b) => TIMELINE_ORDER[a.timeline] - TIMELINE_ORDER[b.timeline] || a.ev.startDate.localeCompare(b.ev.startDate));
  }, [data, search, status]);

  const upsert = (saved: EventItem) => setData((xs) => upsertById(xs, saved));

  const openForm = (ev: EventItem | null) => {
    setEditing(ev);
    setForm(
      ev
        ? { name: ev.name, description: ev.description ?? '', destinationId: ev.destinationId?.toString() ?? '', locationNote: ev.locationNote ?? '', startDate: ev.startDate.slice(0, 10), endDate: ev.endDate.slice(0, 10), ticketPrice: String(Number(ev.ticketPrice)), imageUrls: '' }
        : emptyForm()
    );
    setFormOpen(true);
  };

  const setEventStatus = (ev: EventItem, next: ContentStatus) =>
    run(async () => {
      upsert(await eventApi.setStatus(ev.id, next));
      refresh();
    }, next === 'APPROVED' ? `Đã duyệt "${ev.name}".` : `Đã từ chối "${ev.name}".`);

  const remove = (ev: EventItem) => {
    if (!window.confirm(`Xóa sự kiện "${ev.name}"?`)) return;
    run(async () => {
      await eventApi.remove(ev.id);
      setData((xs) => removeById(xs, ev.id));
      refresh();
    }, 'Đã xóa sự kiện.');
  };

  // DB (event) yêu cầu có địa điểm: điểm đến hoặc ghi chú
  const noLocation = !form.destinationId && !form.locationNote.trim();
  const badDates = form.endDate < form.startDate;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (noLocation || badDates) return;
    const input = {
      name: form.name.trim(),
      description: orUndefined(form.description),
      destinationId: form.destinationId ? Number(form.destinationId) : undefined,
      locationNote: orUndefined(form.locationNote),
      startDate: form.startDate,
      endDate: form.endDate,
      ticketPrice: Number(form.ticketPrice) || 0
    };
    const ok = await run(async () => {
      // Backend chỉ nhận ảnh khi tạo mới
      upsert(editing ? await eventApi.update(editing.id, input) : await eventApi.create({ ...input, images: splitLines(form.imageUrls) }));
      refresh();
    }, editing ? 'Đã cập nhật sự kiện.' : 'Đã thêm sự kiện.');
    if (ok) setFormOpen(false);
  };

  const set = (patch: Partial<FormState>) => setForm((f) => ({ ...f, ...patch }));

  return (
    <div className="flex-1 flex flex-col">
      <Header title="Sự Kiện & Lễ Hội" breadcrumb="Lịch sự kiện Đà Nẵng" />

      <div className="p-6 md:p-8 space-y-6 max-w-7xl w-full mx-auto">
        <PageHeading title="Sự Kiện & Lễ Hội Thành Phố" description="Sự kiện đã duyệt được gợi ý vào lịch trình khi ngày đi của du khách trùng thời gian diễn ra" actionLabel="Thêm Sự Kiện Mới" onAction={() => openForm(null)} />

        <div className="flex flex-wrap items-center gap-3 bg-white p-4 rounded-2xl border border-[#e2e8f0] shadow-xs">
          <div className="relative min-w-[220px] flex-1 md:max-w-sm">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input type="search" placeholder="Tìm sự kiện, địa điểm..." value={search} onChange={(e) => setSearch(e.target.value)} className={searchInputClass} />
          </div>
          <select value={status} onChange={(e) => setStatus(e.target.value as ContentStatus | 'ALL')} className={selectClass} aria-label="Lọc trạng thái duyệt">
            <option value="ALL">Mọi trạng thái duyệt</option>
            {CONTENT_STATUSES.map((s) => <option key={s} value={s}>{CONTENT_STATUS_LABEL[s]}</option>)}
          </select>
        </div>

        <AsyncContent loading={loading} error={error} data={data} onRetry={reload}>
          {() =>
            rows.length === 0 ? (
              <EmptyState icon={Calendar} title="Không có sự kiện nào phù hợp" />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rows.map(({ ev, timeline }) => (
                  <div key={ev.id} className={`bg-white rounded-2xl border overflow-hidden shadow-xs hover:border-[#006971]/40 transition-all flex flex-col ${ev.status === 'PENDING' ? 'border-amber-300' : 'border-[#e2e8f0]'} ${timeline === 'ENDED' || ev.status === 'REJECTED' ? 'opacity-75' : ''}`}>
                    <div className="relative h-44 bg-gray-100">
                      {ev.images[0] ? <img src={ev.images[0].imageUrl} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><ImageOff className="w-8 h-8 text-gray-300" /></div>}
                      <span className={`absolute top-3 right-3 px-2.5 py-1 text-[11px] font-bold rounded-lg shadow-xs ${TIMELINE_STYLE[timeline]}`}>{TIMELINE_LABEL[timeline]}</span>
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-extrabold text-base text-gray-900 line-clamp-2">{ev.name}</h3>
                          <StatusBadge status={ev.status} size="xs" />
                        </div>
                        {ev.description && <p className="text-xs text-gray-500 line-clamp-2">{ev.description}</p>}
                        <div className="space-y-1.5 pt-2 text-xs text-gray-600">
                          <p className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5 text-[#006971] shrink-0" />{formatDate(ev.startDate)} — {formatDate(ev.endDate)}</p>
                          <p className="flex items-start gap-2">
                            <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                            <span>{ev.destination && <b className="text-[#006971]">{ev.destination.name}</b>}{ev.destination && ev.locationNote && ' · '}{ev.locationNote}</span>
                          </p>
                          <p className="flex items-center gap-2"><Ticket className="w-3.5 h-3.5 text-gray-400" /><b className="text-gray-800">{Number(ev.ticketPrice) === 0 ? 'Miễn phí' : `${Number(ev.ticketPrice).toLocaleString('vi-VN')} đ`}</b></p>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-[#e2e8f0] flex items-center justify-between gap-2">
                        {ev.status === 'PENDING' ? (
                          <div className="flex gap-1.5">
                            <button disabled={busy} onClick={() => setEventStatus(ev, 'APPROVED')} className="px-2.5 py-1.5 bg-[#006971] hover:bg-[#005258] text-white rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer disabled:opacity-60"><CheckCircle2 className="w-3.5 h-3.5" /> Duyệt</button>
                            <button disabled={busy} onClick={() => setEventStatus(ev, 'REJECTED')} className="px-2.5 py-1.5 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer disabled:opacity-60"><XCircle className="w-3.5 h-3.5" /> Từ chối</button>
                          </div>
                        ) : <span />}
                        <div className="flex gap-1">
                          <button onClick={() => openForm(ev)} title="Chỉnh sửa" className="p-2 text-gray-500 hover:text-[#006971] hover:bg-[#f1f5f9] rounded-lg cursor-pointer"><Edit className="w-4 h-4" /></button>
                          <button onClick={() => remove(ev)} disabled={busy} title="Xóa" className="p-2 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer disabled:opacity-50"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          }
        </AsyncContent>
      </div>

      {formOpen && (
        <Modal title={editing ? 'Chỉnh Sửa Sự Kiện' : 'Thêm Sự Kiện Mới'} icon={Calendar} maxWidth="max-w-xl" onClose={() => setFormOpen(false)}>
          <form onSubmit={submit} className="space-y-3">
            <Field label="Tên sự kiện / lễ hội" required>
              <input type="text" required maxLength={150} value={form.name} onChange={(e) => set({ name: e.target.value })} placeholder="VD: Lễ hội Pháo hoa Quốc tế Đà Nẵng" className={inputClass} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Ngày bắt đầu" required><input type="date" required value={form.startDate} onChange={(e) => set({ startDate: e.target.value })} className={inputClass} /></Field>
              <Field label="Ngày kết thúc" required><input type="date" required min={form.startDate} value={form.endDate} onChange={(e) => set({ endDate: e.target.value })} className={`${inputClass} ${badDates ? 'border-rose-400' : ''}`} /></Field>
            </div>
            <div className={`p-3 rounded-xl border space-y-3 ${noLocation ? 'bg-rose-50/50 border-rose-200' : 'bg-[#e6f4f2]/50 border-[#006971]/20'}`}>
              <p className="text-xs font-bold text-[#006971]">Địa điểm tổ chức (chọn điểm đến, ghi chú, hoặc cả hai)</p>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Tại điểm đến có sẵn">
                  <select value={form.destinationId} onChange={(e) => set({ destinationId: e.target.value })} className={inputClass}>
                    <option value="">— Không gắn —</option>
                    {approvedDestinations.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </Field>
                <Field label="Ghi chú địa điểm"><input type="text" maxLength={255} value={form.locationNote} onChange={(e) => set({ locationNote: e.target.value })} placeholder="VD: Công viên Biển Đông" className={inputClass} /></Field>
              </div>
              {noLocation && <p className="text-[11px] text-rose-600">Cần chọn điểm đến hoặc nhập ghi chú địa điểm.</p>}
            </div>
            <Field label="Giá vé (VNĐ, 0 = miễn phí)"><input type="number" min={0} value={form.ticketPrice} onChange={(e) => set({ ticketPrice: e.target.value })} className={inputClass} /></Field>
            {!editing && (
              <Field label="Ảnh (mỗi dòng 1 URL, ảnh đầu là ảnh bìa)"><textarea rows={2} value={form.imageUrls} onChange={(e) => set({ imageUrls: e.target.value })} placeholder="https://images.unsplash.com/..." className={`${inputClass} font-mono`} /></Field>
            )}
            <Field label="Mô tả chi tiết"><textarea rows={3} value={form.description} onChange={(e) => set({ description: e.target.value })} className={inputClass} /></Field>
            <ModalActions onCancel={() => setFormOpen(false)} submitLabel={editing ? 'Cập Nhật' : 'Tạo Sự Kiện'} busy={busy} />
          </form>
        </Modal>
      )}
    </div>
  );
}
