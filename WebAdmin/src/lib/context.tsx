'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';
import { api, ApiError, authApi, setUnauthorizedHandler, tokenStorage } from '@/lib/api';
import { canAccessAdmin, type User } from '@/lib/types';
import { LoadingState } from '@/components/ui';
import { useApi } from '@/lib/utils';

// ───────── Thông báo (toast) ─────────
type ToastKind = 'success' | 'error';
interface ToastItem {
  id: number;
  kind: ToastKind;
  message: string;
}

const ToastContext = createContext<((kind: ToastKind, message: string) => void) | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: number) => setItems((xs) => xs.filter((x) => x.id !== id)), []);

  const show = useCallback(
    (kind: ToastKind, message: string) => {
      const id = Date.now() + Math.random();
      setItems((xs) => [...xs, { id, kind, message }]);
      setTimeout(() => dismiss(id), kind === 'error' ? 6000 : 3000);
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div className="fixed bottom-4 right-4 z-[60] space-y-2 w-80 max-w-[calc(100vw-2rem)]" role="status" aria-live="polite">
        {items.map((t) => (
          <div
            key={t.id}
            className={`flex items-start gap-2.5 p-3 rounded-xl shadow-lg border text-xs font-semibold bg-white ${
              t.kind === 'success' ? 'border-emerald-200 text-emerald-800' : 'border-rose-200 text-rose-700'
            }`}
          >
            {t.kind === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span className="flex-1 whitespace-pre-line">{t.message}</span>
            <button onClick={() => dismiss(t.id)} className="text-gray-400 hover:text-gray-700 cursor-pointer" aria-label="Đóng">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const show = useContext(ToastContext);
  if (!show) throw new Error('useToast phải nằm trong ToastProvider');
  return {
    success: (message: string) => show('success', message),
    error: (message: string) => show('error', message)
  };
}

// Chạy một thao tác ghi (tạo/sửa/xóa/duyệt): giữ trạng thái busy, báo toast thành công/lỗi.
// Trả về true nếu thành công để nơi gọi đóng modal.
export function useAction() {
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  const run = async (action: () => Promise<unknown>, successMessage?: string) => {
    setBusy(true);
    try {
      await action();
      if (successMessage) toast.success(successMessage);
      return true;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Đã có lỗi xảy ra.');
      return false;
    } finally {
      setBusy(false);
    }
  };

  return { run, busy };
}

// ───────── Phiên đăng nhập ─────────
interface AuthState {
  user: User | null;
  ready: boolean; // đã kiểm tra xong token lưu sẵn
  login: (emailOrUsername: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  const logout = useCallback(() => {
    tokenStorage.clear();
    setUser(null);
    router.replace('/login');
  }, [router]);

  // Khôi phục phiên từ thông tin lưu lúc đăng nhập; token hết hạn sẽ bị API trả 401 và tự đăng xuất
  useEffect(() => {
    setUnauthorizedHandler(logout);
    const saved = tokenStorage.getUser();
    if (tokenStorage.get() && saved && canAccessAdmin(saved.role)) setUser(saved);
    else tokenStorage.clear();
    setReady(true);
    return () => setUnauthorizedHandler(null);
  }, [logout]);

  const login = useCallback(async (emailOrUsername: string, password: string) => {
    const res = await authApi.login(emailOrUsername, password);
    if (!canAccessAdmin(res.user.role)) {
      throw new ApiError(403, 'Tài khoản này không có quyền truy cập cổng quản trị (chỉ dành cho ADMIN và STAFF).');
    }
    tokenStorage.set(res.accessToken, res.user);
    setUser(res.user);
  }, []);

  return <AuthContext.Provider value={{ user, ready, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth phải nằm trong AuthProvider');
  return ctx;
}

// Bọc các trang cần đăng nhập
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, ready } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (ready && !user) router.replace('/login');
  }, [ready, user, router]);

  if (!ready || !user) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#e6f4f2]">
        <LoadingState label="Đang kiểm tra phiên đăng nhập..." />
      </div>
    );
  }
  return <>{children}</>;
}

// ───────── Số nội dung chờ duyệt (badge sidebar, chuông thông báo) ─────────
interface PendingCounts {
  reviews: number;
  destinations: number;
  feedPosts: number;
  events: number;
}

interface PendingState {
  counts: PendingCounts;
  moderation: number; // đánh giá + địa điểm + bài đăng chờ duyệt (badge "Kiểm duyệt")
  refresh: () => void; // gọi sau mỗi lần duyệt / từ chối
}

const PendingContext = createContext<PendingState | null>(null);

const countPending = (path: string) =>
  api.get<unknown[]>(path, { status: 'PENDING' }).then((xs) => xs.length, () => 0);

export function PendingProvider({ children }: { children: React.ReactNode }) {
  const { data, reload } = useApi<PendingCounts>(async () => {
    const [reviews, destinations, feedPosts, events] = await Promise.all([
      countPending('/community/reviews/manage'),
      countPending('/destinations'),
      countPending('/feed/posts'),
      countPending('/events')
    ]);
    return { reviews, destinations, feedPosts, events };
  });

  const counts = data ?? { reviews: 0, destinations: 0, feedPosts: 0, events: 0 };
  return <PendingContext.Provider value={{ counts, moderation: counts.reviews + counts.destinations + counts.feedPosts, refresh: reload }}>{children}</PendingContext.Provider>;
}

export function usePending() {
  const ctx = useContext(PendingContext);
  if (!ctx) throw new Error('usePending phải nằm trong PendingProvider');
  return ctx;
}
