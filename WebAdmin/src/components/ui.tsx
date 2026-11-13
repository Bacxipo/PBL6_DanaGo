import React from 'react';
import { AlertTriangle, Camera, CheckCircle2, Clock, Coffee, Inbox, Landmark, Mountain, Plus, RotateCw, ShoppingBag, Sparkles, Tag, Trees, Utensils, Waves, X, XCircle, type LucideIcon } from 'lucide-react';
import { CONTENT_STATUS_LABEL, CONTENT_STATUSES, type ContentStatus } from '@/lib/types';

// ───────── Class dùng chung cho ô tìm kiếm / chọn ─────────
export const searchInputClass = 'w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-[#e2e8f0] bg-white focus:border-[#006971] focus:ring-1 focus:ring-[#006971] outline-none';
export const selectClass = 'text-xs px-3 py-2 border border-[#e2e8f0] rounded-xl bg-white focus:border-[#006971] outline-none';

// ───────── Tiêu đề trang + nút thao tác chính ─────────
export function PageHeading({ title, description, actionLabel, onAction }: { title: string; description?: string; actionLabel?: string; onAction?: () => void }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 className="text-xl font-black text-gray-900">{title}</h2>
        {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
      </div>
      {actionLabel && onAction && (
        <button onClick={onAction} className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#006971] hover:bg-[#005258] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-[#006971]/20 cursor-pointer shrink-0">
          <Plus className="w-4 h-4" />
          {actionLabel}
        </button>
      )}
    </div>
  );
}

// ───────── Trạng thái đang tải / lỗi / rỗng ─────────
export function LoadingState({ label = 'Đang tải dữ liệu...' }: { label?: string }) {
  return (
    <div className="py-14 flex flex-col items-center gap-3 text-gray-400">
      <div className="w-7 h-7 border-2 border-[#006971] border-t-transparent rounded-full animate-spin" />
      <p className="text-xs font-semibold">{label}</p>
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="bg-white rounded-2xl border border-rose-200 p-8 text-center">
      <AlertTriangle className="w-10 h-10 mx-auto text-rose-400 mb-3" />
      <p className="text-sm font-semibold text-gray-800 whitespace-pre-line">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#e2e8f0] text-xs font-bold text-[#006971] hover:bg-[#e6f4f2] cursor-pointer">
          <RotateCw className="w-3.5 h-3.5" /> Thử lại
        </button>
      )}
    </div>
  );
}

export function EmptyState({ icon: Icon = Inbox, title }: { icon?: LucideIcon; title: string }) {
  return (
    <div className="bg-white rounded-2xl border border-[#e2e8f0] p-12 text-center text-gray-500">
      <Icon className="w-12 h-12 mx-auto text-[#006971]/40 mb-3" />
      <p className="font-semibold text-gray-700">{title}</p>
    </div>
  );
}

// Bọc phần nội dung phụ thuộc dữ liệu: lỗi -> đang tải -> nội dung
export function AsyncContent<T>({ loading, error, data, onRetry, children }: { loading: boolean; error: string | null; data: T | null; onRetry?: () => void; children: (data: T) => React.ReactNode }) {
  if (error) return <ErrorState message={error} onRetry={onRetry} />;
  if (data == null) return loading ? <LoadingState /> : null;
  return <>{children(data)}</>;
}

// ───────── Trạng thái duyệt ─────────
const STATUS_STYLE: Record<ContentStatus, { className: string; icon: LucideIcon }> = {
  PENDING: { className: 'bg-amber-50 text-amber-700 border-amber-200', icon: Clock },
  APPROVED: { className: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
  REJECTED: { className: 'bg-gray-100 text-gray-600 border-gray-200', icon: XCircle }
};

export function StatusBadge({ status, size = 'sm' }: { status: ContentStatus; size?: 'xs' | 'sm' }) {
  const { className, icon: Icon } = STATUS_STYLE[status];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-bold border whitespace-nowrap ${className} ${size === 'xs' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'}`}>
      <Icon className="w-3 h-3" /> {CONTENT_STATUS_LABEL[status]}
    </span>
  );
}

// Nút lọc theo trạng thái duyệt
export function StatusFilter({ value, onChange }: { value: ContentStatus; onChange: (s: ContentStatus) => void }) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {CONTENT_STATUSES.map((s) => (
        <button
          key={s}
          onClick={() => onChange(s)}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${value === s ? 'bg-[#006971] text-white shadow-sm' : 'bg-white border border-[#e2e8f0] text-gray-600 hover:bg-gray-50'}`}
        >
          {CONTENT_STATUS_LABEL[s]}
        </button>
      ))}
    </div>
  );
}

// ───────── Hộp thoại (modal) và các phần của form ─────────
interface ModalProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  maxWidth?: string;
  onClose: () => void;
  children: React.ReactNode;
}

export function Modal({ title, subtitle, icon: Icon, maxWidth = 'max-w-lg', onClose, children }: ModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className={`bg-white rounded-2xl ${maxWidth} w-full max-h-[90vh] flex flex-col shadow-xl border border-[#e2e8f0] overflow-hidden`}>
        <div className="p-5 border-b border-[#e2e8f0] flex items-center justify-between bg-[#e6f4f2]">
          <div className="flex items-center gap-2.5">
            {Icon && <Icon className="w-5 h-5 text-[#006971]" />}
            <div>
              <h3 className="text-base font-bold text-gray-900">{title}</h3>
              {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
            </div>
          </div>
          <button onClick={onClose} aria-label="Đóng" className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-white transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  );
}

export const inputClass =
  'w-full text-xs px-3.5 py-2.5 border border-[#e2e8f0] rounded-xl bg-white focus:outline-none focus:border-[#006971] focus:ring-1 focus:ring-[#006971]';

export function Field({ label, required, children, className = '' }: { label: string; required?: boolean; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="block text-xs font-semibold text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      {children}
    </label>
  );
}

export function ModalActions({ onCancel, submitLabel, busy, danger }: { onCancel: () => void; submitLabel: string; busy?: boolean; danger?: boolean }) {
  return (
    <div className="pt-4 mt-2 border-t border-[#e2e8f0] flex justify-end gap-2">
      <button type="button" onClick={onCancel} className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer">
        Hủy bỏ
      </button>
      <button
        type="submit"
        disabled={busy}
        className={`px-4 py-2 text-xs font-bold text-white rounded-xl transition-colors cursor-pointer shadow-xs disabled:opacity-60 disabled:cursor-wait ${danger ? 'bg-rose-600 hover:bg-rose-700' : 'bg-[#006971] hover:bg-[#005258]'}`}
      >
        {busy ? 'Đang lưu...' : submitLabel}
      </button>
    </div>
  );
}

// ───────── Icon danh mục (category.icon_url lưu tên icon; giá trị lạ hiện icon mặc định) ─────────
export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  sparkles: Sparkles,
  waves: Waves,
  landmark: Landmark,
  utensils: Utensils,
  trees: Trees,
  mountain: Mountain,
  'shopping-bag': ShoppingBag,
  coffee: Coffee,
  camera: Camera
};

export function CategoryIcon({ name, className }: { name?: string | null; className?: string }) {
  const Icon = (name && CATEGORY_ICONS[name]) || Tag;
  return <Icon className={className} />;
}
