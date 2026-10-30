import { Suspense } from 'react';
import Explore from '@/pages/Explore';

export default function ExplorePage() {
  return (
    <Suspense fallback={<div className="w-full min-h-[400px] flex items-center justify-center text-gray-500">Đang tải trang khám phá...</div>}>
      <Explore />
    </Suspense>
  );
}
