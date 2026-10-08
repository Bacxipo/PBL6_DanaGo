import Image from 'next/image';
import Link from 'next/link';
import { Mail } from 'lucide-react';
import imgForget from '@/assets/images/forget.jpg';

export default function ForgotPassword() {
  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-xl flex flex-col md:flex-row overflow-hidden border border-gray-100">
        
        {/* Cột trái: Ảnh Chùa Linh Ứng */}
        <div className="relative w-full md:w-1/2 min-h-[350px] md:min-h-[500px] hidden md:block">
          <Image src={imgForget} alt="Quên mật khẩu" fill priority className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <h3 className="absolute bottom-8 left-8 text-white text-2xl font-bold leading-snug">
            Quên mật khẩu
          </h3>
        </div>

        {/* Cột phải: Form nhập email */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Quên mật khẩu</h2>
            <p className="text-xs text-gray-500 mt-2 max-w-xs mx-auto">
              Nhập email và chúng tôi sẽ gửi liên kết đặt lại mật khẩu
            </p>
          </div>

          <form className="space-y-6">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5 ml-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  placeholder="Nhập địa chỉ email"
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#006971]"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#006971] hover:bg-[#00555a] text-white font-semibold py-3 rounded-full text-sm transition-colors shadow-md"
            >
              Gửi
            </button>
          </form>

          <div className="text-right mt-4">
            <Link href="/login" className="text-xs text-[#006971] font-bold hover:underline">
              Quay lại đăng nhập
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}