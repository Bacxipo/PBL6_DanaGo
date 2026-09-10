import { Plus, BookOpen, Grid3X3 } from "lucide-react";

export default function PersonalPage() {
    return (
        <div className="flex flex-col">
            <div className="flex items-center justify-between px-8 py-4">
                <h3 className="text-xl font-bold">
                    Trang cá nhân
                </h3>
                <Plus size={24} className ='cursor-pointer' />
            </div>

            <div className="flex items-center gap-2 px-8 py-5">
                <div className ='rounded-full w-32 h-32 overflow-hidden'>
                    <img src="https://png.pngtree.com/png-clipart/20190920/original/pngtree-user-flat-character-avatar-png-png-image_4643588.jpg" alt="avatar" className="w-40 h-40 rounded-full object-cover"/>
                </div>
                <div className="flex flex-col gap-2">
                    <h2 className="text-2xl font-bold">abc</h2>
                    <span>0 bài viết</span>
                </div>
            </div>

            <div className="flex flex-col items-center justify-center py-32 gap-3">
                <div className="bg-gray-100 p-8 rounded-full">
                    <Grid3X3 size={55} className="text-gray-300"/>
                </div>
                <p className="text-xl font-semibold">Chưa có bài viết nào</p>
            </div>

        </div>
    );
}