'use client';
import Image from 'next/image';
import Link from 'next/link';
import { Mail, Lock } from 'lucide-react';
import imgLogin from '@/assets/images/imgLogin.jpg';
import { useRouter } from 'next/navigation'; 
export default function Login() {
  const router = useRouter();

  const handleSumit = (e) => {
    e.preventDefault();
    // Add login logic here
    router.push('/interests');
  }



  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-xl flex flex-col md:flex-row overflow-hidden border border-gray-100">        
        <div className="relative w-full md:w-1/2 min-h-[350px] md:min-h-[550px] hidden md:block">
          <Image
            src={imgLogin}
            alt="Khám phá vẻ đẹp đích thực"
            fill
            priority
            className="object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          
          <h3 className="absolute bottom-8 left-8 text-white text-2xl font-bold max-w-xs leading-snug">
            Khám phá vẻ đẹp đích thực
          </h3>
        </div>

        {/* Cột phải: Form Đăng nhập */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Đăng nhập</h2>
            <p className="text-sm text-gray-500 mt-1">Chào mừng bạn đến với DanaGO</p>
          </div>

          <form className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5 ml-1">
                Tên đăng nhập hoặc email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Nhập email hoặc tên đăng nhập"
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#006971] focus:border-transparent transition-all"
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
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#006971] focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div className="text-right">
              <Link href="/forgot-password" className="text-xs text-[#006971] font-semibold hover:underline">
                Quên mật khẩu?
              </Link>
            </div>

            <button
              onClick={handleSumit}
              type="submit"
              className="w-full bg-[#006971] hover:bg-[#00555a] text-white font-semibold py-3 rounded-full text-sm transition-colors shadow-md mt-2"
            >
              Đăng nhập
            </button>
          </form>

          <div className="text-center my-6">
            <span className="text-xs text-gray-400">Hoặc tiếp tục</span>
          </div>

          <button
            type="button"
            className="w-full flex items-center justify-center gap-3 border border-gray-300 py-2.5 rounded-full text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
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