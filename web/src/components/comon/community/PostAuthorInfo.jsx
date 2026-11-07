'use client';

import { Store, Sparkles, HelpCircle } from 'lucide-react';
import UserAvatar from '@/components/comon/ui/UserAvatar';

export default function PostAuthorInfo({ profile, profileStatus, postType }) {
  return (
    <div className="flex items-center gap-3">
      <UserAvatar user={profile} />

      <div className="flex items-center gap-2">
        <span className="font-bold text-gray-900 text-base">
          {profile?.fullName || profile?.username || (
            profileStatus === 'loading' ? 'Đang tải tài khoản...' :
              profileStatus === 'signed-out' ? 'Chưa đăng nhập' : 'Không tải được tài khoản'
          )}
        </span>

        {postType === 'trai-nghiem' && (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-teal-50 text-[#006971] px-2 py-0.5 rounded-full border border-teal-100">
            <Sparkles size={11} />
            Trải nghiệm
          </span>
        )}

        {postType === 'hoi-dap' && (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200">
            <HelpCircle size={11} />
            Hỏi đáp
          </span>
        )}

        {postType === 'dia-diem-moi' && (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
            <Store size={11} />
            Địa điểm mới
          </span>
        )}
      </div>
    </div>

  );
}
