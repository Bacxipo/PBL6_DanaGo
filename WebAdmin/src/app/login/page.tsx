'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Compass, Lock, User as UserIcon, ArrowRight, ShieldCheck, Sparkles, ExternalLink } from 'lucide-react';
import { useAuth } from '@/lib/context';

const WEB_USER_URL = process.env.NEXT_PUBLIC_WEB_USER_URL || 'http://localhost:3000';

export default function LoginPage() {
  const router = useRouter();
  const { user, ready, login } = useAuth();
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Đã đăng nhập thì vào thẳng dashboard
  useEffect(() => {
    if (ready && user) router.replace('/dashboard');
  }, [ready, user, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(emailOrUsername.trim(), password);
      router.replace('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đăng nhập thất bại.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full pl-10 pr-4 py-2.5 text-sm bg-[#e6f4f2] border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-[#006971] focus:ring-2 focus:ring-[#006971]/20 transition-all font-medium';

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-[#e6f4f2]">
      <div className="md:w-1/2 bg-gradient-to-br from-[#005258] via-[#006971] to-[#0f172a] p-8 md:p-14 text-white flex flex-col justify-between relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-96 h-96 rounded-full bg-[#38bdf8]/20 blur-3xl pointer-events-none"></div>
        <div className="absolute -left-20 -bottom-20 w-96 h-96 rounded-full bg-[#FFB347]/15 blur-3xl pointer-events-none"></div>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg">
            <Compass className="w-7 h-7 text-[#FFB347]" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">DaNaGo</h1>
            <span className="text-xs uppercase tracking-widest text-[#e6f4f2] font-bold">Smart Tourism Platform</span>
          </div>
        </div>

        <div className="my-12 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-[#FFB347] border border-white/15 mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Cổng Quản Trị Hệ Thống PBL6
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold leading-tight">Quản Trị Vận Hành & Trải Nghiệm Du Lịch Thông Minh</h2>
          <p className="mt-4 text-sm text-gray-200 leading-relaxed">
            Kiểm duyệt điểm đến, quản lý sự kiện, đối tác và theo dõi xu hướng lập lịch trình của du khách tại thành phố Đà Nẵng.
          </p>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-300 pt-4 border-t border-white/15">
          <span>Học phần PBL6 - ĐH Bách Khoa ĐN</span>
          <span>Phiên bản 1.0.0</span>
        </div>
      </div>

      <div className="md:w-1/2 flex items-center justify-center p-6 md:p-14">
        <div className="w-full max-w-md bg-white p-8 md:p-10 rounded-3xl shadow-xl shadow-[#006971]/5 border border-[#e2e8f0]">
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-[#e6f4f2] text-[#006971] flex items-center justify-center mx-auto mb-3">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-black text-gray-900">Đăng nhập Cổng Quản Trị</h3>
            <p className="text-xs text-gray-500 mt-1.5">Dành riêng cho Quản trị viên (ADMIN) và Nhân viên kiểm duyệt (STAFF)</p>
          </div>

          {error && (
            <div role="alert" className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700 whitespace-pre-line">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <label className="block">
              <span className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Email hoặc tên đăng nhập</span>
              <span className="relative block">
                <UserIcon className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  autoComplete="username"
                  value={emailOrUsername}
                  onChange={(e) => setEmailOrUsername(e.target.value)}
                  placeholder="admin@danago.vn"
                  required
                  className={inputClass}
                />
              </span>
            </label>

            <label className="block">
              <span className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Mật khẩu</span>
              <span className="relative block">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className={inputClass}
                />
              </span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-[#006971] hover:bg-[#005258] text-white font-bold text-sm shadow-md shadow-[#006971]/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-70 mt-6"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Đăng nhập</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <a
              href={WEB_USER_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-[#006971] transition-colors"
            >
              <span>Quay lại Cổng Du Khách (Web End-User)</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
