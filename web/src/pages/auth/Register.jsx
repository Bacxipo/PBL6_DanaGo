'use client';
import Image from 'next/image';
import Link from 'next/link';
import { User, AtSign, Mail, Lock } from 'lucide-react';
import imgRegister from '@/assets/images/register.jpg';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { apiRequest } from '@/lib/feed-api';
import { startGoogleLogin } from '@/lib/google-auth';

export default function Register() {
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setError('');

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }
    if (password.length < 6) {
      setError('Mật khẩu phải chứa ít nhất 6 ký tự.');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await apiRequest('/identity/auth/register', {
        method: 'POST',
        body: {
          username: username.trim(),
          fullName: fullName.trim(),
          email: email.trim(),
          password,
        },
      });

      sessionStorage.setItem('accessToken', result.accessToken);
      window.dispatchEvent(new Event('auth-changed'));

      router.replace('/interests');
    } catch (err) {
      setError(err.message);
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

        {/* Cột trái: Form Đăng ký */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-[#163438]">Đăng ký tài khoản</h2>
            <p className="text-xs text-gray-500 mt-1">Nhập thông tin bên dưới để tạo tài khoản</p>
          </div>

          <form className="space-y-3.5" onSubmit={handleSubmit}>
            {/* Họ và tên */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1 ml-1">Họ và tên</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  required
                  placeholder="Nhập họ và tên"
                  className="w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#006971]"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
            </div>

            {/* Tên đăng nhập */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1 ml-1">Tên đăng nhập</label>
              <div className="relative">
                <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  required
                  placeholder="Nhập tên đăng nhập"
                  className="w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#006971]"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1 ml-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  required
                  placeholder="Nhập địa chỉ email"
                  className="w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#006971]"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Mật khẩu */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1 ml-1">Mật khẩu</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="Nhập mật khẩu (ít nhất 6 ký tự)"
                  className="w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#006971]"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {/* Xác nhận mật khẩu */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1 ml-1">Xác nhận mật khẩu</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  required
                  placeholder="Nhập lại mật khẩu"
                  className="w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#006971]"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            {error && <p role="alert" className="text-red-600 text-xs whitespace-pre-line">{error}</p>}

            {/* Nút Đăng ký */}
            <button
              disabled={isSubmitting}
              type="submit"
              className="w-full bg-[#006971] hover:bg-[#00555a] text-white font-semibold py-2.5 rounded-full text-sm transition-colors shadow-md mt-2 disabled:opacity-60"
            >
              {isSubmitting ? 'Đang tạo tài khoản...' : 'Đăng ký'}
            </button>
          </form>

          <div className="text-center my-4">
            <span className="text-xs text-gray-400">Hoặc tiếp tục</span>
          </div>

          {/* Đăng ký Google */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-3 border border-slate-200 py-2.5 rounded-full text-sm font-semibold text-gray-700 hover:bg-[#f7fafa] transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            Đăng ký bằng Google
          </button>

          <p className="text-center text-xs text-gray-600 mt-4">
            Đã có tài khoản?{' '}
            <Link href="/login" className="text-[#006971] font-bold hover:underline">
              Đăng nhập
            </Link>
          </p>
        </div>

        {/* Cột phải: Ảnh Cầu Vàng */}
        <div className="relative w-full md:w-1/2 min-h-[350px] md:min-h-[550px] hidden md:block">
          <Image src={imgRegister} alt="Đăng ký" fill priority className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#073d46]/85 via-black/20 to-transparent" />
          <h3 className="absolute bottom-8 left-8 text-white text-2xl font-bold max-w-xs leading-snug">
            Bắt đầu hành trình của bạn
          </h3>
        </div>

      </div>
    </div>
  );
}
