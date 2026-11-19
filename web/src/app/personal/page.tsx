import { Suspense } from 'react';
import Personal from '@/pages/Personal';

export default function PersonalPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-7xl px-4 py-12 text-center text-slate-500">Đang tải trang cá nhân...</div>}>
      <Personal />
    </Suspense>
  );
}
