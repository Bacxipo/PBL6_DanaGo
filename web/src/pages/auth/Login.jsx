'use client';
import Image from 'next/image';
import Link from 'next/link';
import { Mail, Lock } from 'lucide-react';
import imgLogin from '@/assets/images/imgLogin.jpg';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { apiRequest } from '@/lib/feed-api';
import { startGoogleLogin } from '@/lib/google-auth';
import { getPostLoginPath } from '@/lib/preference-api';
export default function Login() {

  const router = useRouter();

  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSumit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setError('');
    setIsSubmitting(true);

    try {
      const result = await apiRequest('/identity/auth/login', {
        method: 'POST',
        body: { emailOrUsername, password },
      });

      sessionStorage.setItem('accessToken', result.accessToken);
      window.dispatchEvent(new Event('auth-changed'));

      router.replace(await getPostLoginPath(result.accessToken));
    } catch (error) {
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };



  const handleGoogleLogin = async () => {
    if (isSubmitting) return;
    setError('');
    setIsSubmitting(true);
    try {
      await startGoogleLogin();
    } catch (error) {
      setError(error.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="dana-form-page min-h-[calc(100vh-140px)] flex items-center justify-center p-4 py-10 bg-[#f7fafa]">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-[0_16px_60px_-24px_rgba(0,105,113,0.25)] flex flex-col md:flex-row overflow-hidden border border-teal-100/70">
        <div className="relative w-full md:w-1/2 min-h-[350px] md:min-h-[550px] hidden md:block">
          <Image
            src={imgLogin}
            alt="Khám phá vẻ đẹp đích thực"
            fill
            priority
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-[#073d46]/85 via-black/20 to-transparent" />

          <h3 className="absolute bottom-8 left-8 text-white text-2xl font-bold max-w-xs leading-snug">
            Khám phá vẻ đẹp đích thực
          </h3>
        </div>

        {/* Cột phải: Form Đăng nhập */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-[#163438]">Đăng nhập</h2>
            <p className="text-sm text-gray-500 mt-1">Chào mừng bạn đến với DanaGO</p>
          </div>

          <form className="space-y-4" onSubmit={handleSumit}>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5 ml-1">
                Tên đăng nhập hoặc email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Nhập email hoặc tên đăng nhập"
                  className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#006971] focus:border-transparent transition-all"
                  value={emailOrUsername}
                  onChange={(e) => setEmailOrUsername(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5 ml-1">
                Mật khẩu
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  placeholder="Nhập mật khẩu"
                  className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#006971] focus:border-transparent transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="text-right">
              <Link href="/forgot-password" className="text-xs text-[#006971] font-semibold hover:underline">
                Quên mật khẩu?
              </Link>
            </div>

            <button
              disabled={isSubmitting}
              type="submit"
              className="w-full bg-[#006971] hover:bg-[#00555a] text-white font-semibold py-3 rounded-full text-sm transition-colors shadow-md mt-2"
            >
              Đăng nhập
            </button>
            {error && <p role="alert" className="text-red-600">{error}</p>}
          </form>

          <div className="text-center my-6">
            <span className="text-xs text-gray-400">Hoặc tiếp tục</span>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-3 border border-slate-200 py-2.5 rounded-full text-sm font-semibold text-gray-700 hover:bg-[#f7fafa] transition-colors shadow-sm"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            Đăng nhập bằng Google
          </button>

          <p className="text-center text-xs text-gray-600 mt-6">
            Chưa có tài khoản?{' '}
            <Link href="/register" className="text-[#006971] font-bold hover:underline">
              Đăng ký ngay
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
