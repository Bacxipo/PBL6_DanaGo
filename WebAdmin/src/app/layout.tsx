import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider, ToastProvider } from '@/lib/context';

export const metadata: Metadata = {
  title: 'DaNaGo - Cổng Quản Trị Hệ Thống',
  description: 'Hệ thống hỗ trợ du lịch thông minh Đà Nẵng - Cổng Quản Trị'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className="bg-[#e6f4f2] text-[#171d1d] antialiased">
        <ToastProvider>
          <AuthProvider>{children}</AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
