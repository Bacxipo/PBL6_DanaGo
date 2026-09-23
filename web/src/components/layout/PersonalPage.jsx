'use client';
import Image from 'next/image';
import { Plus, Grid3X3 } from "lucide-react";

export default function PersonalPage() {
    return (
        <div className="flex flex-col">
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 pb-4">
                <h3 className="text-xl font-bold text-gray-800">
                    Trang cá nhân
                </h3>
                <Plus size={24} className='cursor-pointer text-[#006971] hover:scale-110 transition-transform' />
            </div>

            <div className="flex items-center gap-4 px-4 py-6">
                <div className='rounded-full w-24 h-24 overflow-hidden shrink-0 border-2 border-[#006971]/20'>
                    <Image src="https://png.pngtree.com/png-clipart/20190920/original/pngtree-user-flat-character-avatar-png-png-image_4643588.jpg" alt="avatar" width={96} height={96} className="w-full h-full rounded-full object-cover"/>
                </div>
                <div className="flex flex-col gap-1">
                    <h2 className="text-2xl font-bold text-gray-800">Người dùng Smart Trip</h2>
                    <span className="text-sm text-gray-500 font-medium">0 bài viết</span>
                </div>
            </div>

            <div className="flex flex-col items-center justify-center py-20 gap-3 border-t border-gray-100 mt-4">
                <div className="bg-gray-100 p-6 rounded-full">
                    <Grid3X3 size={48} className="text-gray-400"/>
                </div>
                <p className="text-base font-semibold text-gray-600">Chưa có bài viết nào</p>
            </div>
        </div>
    );
}