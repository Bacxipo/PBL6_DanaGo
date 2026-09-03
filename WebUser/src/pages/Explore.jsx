import { useState } from "react";
import Rating from '../components/comon/Rating';
import PlaceCard from '../components/comon/PlaceCard';
import { categoriesData, placesData, districtsData } from '../database/data';

export default function Explore() {
    const [category, setCategory] = useState("Tất cả");
    const [address,setAddress] = useState("Tất cả quận");
    const filterPlace = placesData.filter((item)=>{
        const choseCategory = category === "Tất cả" || item.category === category;
        const choseAddress = address === "Tất cả quận" || item.address === address;
        return choseCategory && choseAddress;
    })

    return (
        <section className="w-full space-y-12 pb-8 flex gap-6">
            <aside className="w-1/4 h-fit flex flex-col bg-white rounded-2xl p-5 shadow-xl/20 border border-gray-300 overflow-hidden">
                <div className="flex items-center justify-between mb-5">
                    <h3 className="font-bold text-gray-800">
                        Bộ lọc
                    </h3>
                    <button
                        type="button"
                        onClick={() => {
                            setCategory("Tất cả");
                            setAddress("Tất cả quận");
                        }}
                        className="text-sm text-[#006971] font-bold hover:text-orange-500 cursor-pointer">
                        Xóa lọc
                    </button>
                </div>

                <div>
                    <span className="text-sm font-bold text-gray-800 mb-3 block">Danh mục</span>
                    <div className="grid grid-cols-2 gap-2">
                        {categoriesData.map((item) => (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => setCategory(item.name)}
                                className={`cursor-pointer px-4 py-2 rounded-xl text-sm text-center transition-all ${
                                    category === item.name 
                                        ? "bg-[#007C83] text-white font-bold shadow-sm" 
                                        : "bg-[#E2F5F6] text-[#007C83] hover:bg-[#d0f0f2]"
                                }`} 
                            >
                                {item.name}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mt-5">
                    <span className="text-sm font-bold text-gray-800 mb-3 block">Khoảng giá</span>
                    <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center border border-gray-200 rounded-xl px-3 bg-gray-50 focus-within:border-[#006971] focus-within:ring-1 focus-within:ring-[#006971] transition">
                            <span className="text-xs text-gray-600">đ</span>
                            <input type="number" placeholder="Từ" className="w-full bg-transparent p-2 text-sm text-gray-800 outline-none placeholder-gray-500"/>
                        </div>
                        <div className="flex items-center border border-gray-200 rounded-xl px-3 bg-gray-50 focus-within:border-[#006971] focus-within:ring-1 focus-within:ring-[#006971] transition">
                            <span className="text-xs text-gray-600">đ</span>
                            <input type="number" placeholder="Đến" className="w-full p-2 text-sm text-gray-800 outline-none placeholder-gray-500"/>
                        </div>
                    </div>
                </div>

                <div className="mt-5">
                    <span className="text-sm font-bold text-gray-800 mb-3 block">Đánh giá</span>
                    <div className="space-y-3">
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <input type="checkbox" className="w-4 h-4 accent-[#006971] cursor-pointer"/>
                            <Rating rating="5"/>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <input type="checkbox" className="w-4 h-4 accent-[#006971] cursor-pointer"/>
                            <Rating rating="4"/>
                        </label>
                    </div>
                </div>

                <div className="mt-5">
                    <span className="text-sm font-bold text-gray-800 mb-3 block">Khu vực</span>
                    <div>
                        <select
                            value = {address}
                            onChange={(e)=> setAddress(e.target.value)} 
                            className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none cursor-pointer">
                            {districtsData.map((item) => (
                                <option key={item.id} value={item.name}>{item.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="flex justify-center mt-6">
                    <button type="submit" className="bg-[#006971] w-full p-2.5 rounded-xl font-bold text-white cursor-pointer hover:bg-[#00555c] transition-colors">Áp dụng</button>
                </div>
            </aside>
            <div className = 'flex flex-col gap-y-4 font-bold'>
                <span>Tìm thấy {filterPlace.length} kết quả</span>
                <div className="w-full h-[calc(100vh-150px)] overflow-y-auto pr-2">
                    {filterPlace.length > 0 ?  
                        (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {filterPlace.map((item) => (
                                <PlaceCard
                                    key={item.id}
                                    id={item.id}
                                    name={item.name}
                                    img={item.img}
                                    des={item.des}
                                    stars={item.stars}
                                    price={item.priceDisplay}
                                    category={item.category}
                                    address={item.address}
                                />      
                            ))} 
                        </div>
                        ):
                        (
                            <div className="flex items-center justify-center h-full min-h-[400px] text-center">
                                <h3 className="text-xl font-bold text-gray-700 mb-2">Không tìm thấy dữ liệu</h3>
                            </div>
                        )
                    }        
                </div>
            </div>
        </section>
    );
}