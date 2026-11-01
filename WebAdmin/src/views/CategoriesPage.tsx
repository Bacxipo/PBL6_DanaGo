'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import { AsyncContent, CATEGORY_ICONS, CategoryIcon, EmptyState, Field, Modal, ModalActions, PageHeading, inputClass } from '@/components/ui';
import { useApi, isMissingApi, removeById, upsertById } from '@/lib/utils';
import { useAction } from '@/lib/context';
import { categoryApi } from '@/lib/api';
import type { Category } from '@/lib/types';
import { Edit, Tags, Trash2 } from 'lucide-react';

const ICON_KEYS = Object.keys(CATEGORY_ICONS);

export default function CategoriesPage() {
  const { data, error, loading, reload, setData } = useApi(categoryApi.list);
  const { run, busy } = useAction();

  const [editing, setEditing] = useState<Category | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [name, setName] = useState('');
  const [iconUrl, setIconUrl] = useState(ICON_KEYS[0]);

  // Backend chưa có API: vẫn hiện đủ giao diện, danh sách trống
  const missing = isMissingApi(error);
  const categories = data ?? [];

  const openForm = (c: Category | null) => {
    setEditing(c);
    setName(c?.name ?? '');
    setIconUrl(c?.iconUrl ?? ICON_KEYS[0]);
    setFormOpen(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const input = { name: name.trim(), iconUrl };
    const ok = await run(async () => {
      const saved = editing ? await categoryApi.update(editing.id, input) : await categoryApi.create(input);
      setData((xs) => upsertById(xs, saved));
    }, editing ? 'Đã cập nhật danh mục.' : 'Đã thêm danh mục.');
    if (ok) setFormOpen(false);
  };

  const remove = (c: Category) => {
    if (!window.confirm(`Xóa danh mục "${c.name}"?`)) return;
    run(async () => {
      await categoryApi.remove(c.id); // backend chặn xóa khi còn điểm đến thuộc danh mục
      setData((xs) => removeById(xs, c.id));
    }, 'Đã xóa danh mục.');
  };

  return (
    <div className="flex-1 flex flex-col">
      <Header title="Danh Mục Điểm Đến" breadcrumb="Danh mục" />

      <div className="p-6 md:p-8 space-y-6 max-w-7xl w-full mx-auto">
        <PageHeading title="Danh Mục Phân Loại" description="Dùng để phân loại điểm đến và làm sở thích du lịch của du khách" actionLabel="Thêm Danh Mục" onAction={() => openForm(null)} />


        <AsyncContent loading={loading} error={missing ? null : error} data={missing ? [] : data} onRetry={reload}>
          {() =>
            categories.length === 0 ? (
              <EmptyState icon={Tags} title="Chưa có danh mục nào" />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((c) => (
                  <div key={c.id} className="bg-white p-5 rounded-2xl border border-[#e2e8f0] shadow-xs hover:border-[#006971]/40 transition-all flex items-center justify-between">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-[#e6f4f2] text-[#006971] flex items-center justify-center shrink-0">
                        <CategoryIcon name={c.iconUrl} className="w-6 h-6" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-gray-900 text-sm truncate">{c.name}</h3>
                        <p className="text-xs text-gray-500">{c.destinationCount} điểm đến</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => openForm(c)} title="Chỉnh sửa" className="p-1.5 text-gray-500 hover:text-[#006971] hover:bg-[#e6f4f2] rounded-lg transition-colors cursor-pointer"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => remove(c)} disabled={busy} title="Xóa" className="p-1.5 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer disabled:opacity-50"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
            )
          }
        </AsyncContent>
      </div>

      {formOpen && (
        <Modal title={editing ? 'Sửa Danh Mục' : 'Thêm Danh Mục'} icon={Tags} maxWidth="max-w-md" onClose={() => setFormOpen(false)}>
          <form onSubmit={submit} className="space-y-4">
            <Field label="Tên danh mục" required>
              <input type="text" required maxLength={50} value={name} onChange={(e) => setName(e.target.value)} placeholder="VD: Mua sắm" className={inputClass} />
            </Field>
            <Field label="Biểu tượng">
              <div className="grid grid-cols-5 gap-2">
                {ICON_KEYS.map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setIconUrl(key)}
                    title={key}
                    className={`h-11 rounded-xl border flex items-center justify-center transition-colors cursor-pointer ${iconUrl === key ? 'bg-[#006971] text-white border-[#006971]' : 'border-[#e2e8f0] text-gray-500 hover:bg-[#e6f4f2] hover:text-[#006971]'}`}
                  >
                    <CategoryIcon name={key} className="w-5 h-5" />
                  </button>
                ))}
              </div>
            </Field>
            <ModalActions onCancel={() => setFormOpen(false)} submitLabel={editing ? 'Lưu Thay Đổi' : 'Tạo Danh Mục'} busy={busy} />
          </form>
        </Modal>
      )}
    </div>
  );
}
