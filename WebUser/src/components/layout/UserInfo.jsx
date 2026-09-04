export default function UserInfo(){
    return(
        <div className='flex flex-col'>
            <h3>Thông tin cá nhân</h3>
            <form className= 'flex flex-col '>
                <div className = 'flex gap-6'>
                    <div className = 'rounded-full w-32 h-32 overflow-hidden'>
                        <img src="https://png.pngtree.com/png-clipart/20190920/original/pngtree-user-flat-character-avatar-png-png-image_4643588.jpg" alt="" className="w-full h-full object-cover"/>
                    </div>
                    <div className = 'grid grid-cols-2 gap-4 mb-5'>
                        <label>
                            <span>Họ và tên:</span>
                            <input type="text" placeholder="Nhập họ và tên" className="w-full p-2 text-sm text-gray-800 outline-none placeholder-gray-500"/>
                        </label>
                        <label>
                            <span>Email:</span>
                            <input type="email" placeholder="Nhập email" className="w-full p-2 text-sm text-gray-800 outline-none placeholder-gray-500"/>
                        </label>
                        <label>
                            <span>Số điện thoại:</span>
                            <input type="tel" placeholder="Nhập số điện thoại" className="w-full p-2 text-sm text-gray-800 outline-none placeholder-gray-500"/>
                        </label>
                        <label>
                            <span>Quốc gia:</span>
                            <input type="text" placeholder="Nhập quốc gia" className="w-full p-2 text-sm text-gray-800 outline-none placeholder-gray-500"/>
                        </label>
                    </div>
                </div>
                <div>
                    <span>Giới thiệu bản thân</span>
                    <textarea placeholder="Nhập giới thiệu bản thân" className="w-full p-2 text-sm text-gray-800 outline-none placeholder-gray-500"></textarea>
                </div>
                <div className="flex gap-4 mt-4 justify-end">
                    <button type="reset" className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-md font-semibold text-sm transition-colors">
                        Hủy
                    </button>
                    <button type="submit" className="px-4 py-2 bg-[#006971] hover:bg-[#005258] text-white rounded-md font-semibold text-sm transition-colors">
                        Lưu thay đổi
                    </button>
                </div>
            </form>
        </div>
    );
}