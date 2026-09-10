'use client';

export default function SettingInfo() {
    return (
        <div className='flex flex-col'>
            <h3 className="text-lg font-semibold text-gray-800">Thông tin cá nhân</h3>
            <form className='flex flex-col'>
                <div className='flex gap-6 p-3'>
                    <div className='rounded-full w-32 h-32 overflow-hidden shrink-0'>
                        <img src="https://png.pngtree.com/png-clipart/20190920/original/pngtree-user-flat-character-avatar-png-png-image_4643588.jpg" alt="Avatar" className="w-full h-full object-cover"/>
                    </div>
                    <div className='grid grid-cols-2 gap-4 mb-5 w-full'>
                        <label className='flex flex-col gap-1 text-sm font-medium text-gray-700'>
                            <span>Họ và tên:</span>
                            <input type="text" placeholder="Nhập họ và tên" className="w-full p-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 outline-none focus:border-[#006971]"/>
                        </label>
                        <label className='flex flex-col gap-1 text-sm font-medium text-gray-700'>
                            <span>Email:</span>
                            <input type="email" placeholder="Nhập email" className="w-full p-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 outline-none focus:border-[#006971]"/>
                        </label>
                        <label className='flex flex-col gap-1 text-sm font-medium text-gray-700'>
                            <span>Số điện thoại:</span>
                            <input type="tel" placeholder="Nhập số điện thoại" className="w-full p-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 outline-none focus:border-[#006971]"/>
                        </label>
                        <label className='flex flex-col gap-1 text-sm font-medium text-gray-700'>
                            <span>Quốc gia:</span>
                            <input type="text" placeholder="Nhập quốc gia" className="w-full p-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 outline-none focus:border-[#006971]"/>
                        </label>
                    </div>
                </div>
                <div className='flex flex-col gap-1 text-sm font-medium text-gray-700 mt-2'>
                    <span>Giới thiệu bản thân</span>
                    <textarea rows={3} placeholder="Nhập giới thiệu bản thân" className="w-full p-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 outline-none focus:border-[#006971]"></textarea>
                </div>
                <div className="flex gap-4 mt-6 justify-end">
                    <button type="reset" className="px-5 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl font-semibold text-sm transition-colors cursor-pointer">
                        Hủy
                    </button>
                    <button type="submit" className="px-5 py-2.5 bg-[#006971] hover:bg-[#005258] text-white rounded-xl font-semibold text-sm transition-colors cursor-pointer">
                        Lưu thay đổi
                    </button>
                </div>
            </form>
            
            <hr className="my-8 border-gray-100" />

            <h3 className="text-lg font-semibold text-gray-800">Thay đổi mật khẩu</h3>
            <form className='flex flex-col mt-4'>
                <div className='flex flex-col gap-4'>
                    <label className='flex flex-col gap-1 text-sm font-medium text-gray-700'>
                        <span>Mật khẩu hiện tại:</span>
                        <input type="password" placeholder="Nhập mật khẩu hiện tại" className="w-full p-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 outline-none focus:border-[#006971]"/>
                    </label>
                    <label className='flex flex-col gap-1 text-sm font-medium text-gray-700'>
                        <span>Mật khẩu mới:</span>
                        <input type="password" placeholder="Nhập mật khẩu mới" className="w-full p-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 outline-none focus:border-[#006971]"/>
                    </label>
                    <label className='flex flex-col gap-1 text-sm font-medium text-gray-700'>
                        <span>Xác nhận mật khẩu mới:</span>
                        <input type="password" placeholder="Xác nhận mật khẩu mới" className="w-full p-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 outline-none focus:border-[#006971]"/>
                    </label>
                </div>
                <div className="flex gap-4 mt-6 justify-end">
                    <button type="reset" className="px-5 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl font-semibold text-sm transition-colors cursor-pointer">
                        Hủy
                    </button>
                    <button type="submit" className="px-5 py-2.5 bg-[#006971] hover:bg-[#005258] text-white rounded-xl font-semibold text-sm transition-colors cursor-pointer">
                        Lưu thay đổi
                    </button>
                </div>
            </form>
        </div>
    );
}
