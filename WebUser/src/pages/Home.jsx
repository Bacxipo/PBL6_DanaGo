import Catalog from '../components/comon/Catalog';
import PlaceCard from '../components/comon/PlaceCard';

import heroImg from '../assets/images/cr.jpg';
import { Link } from 'react-router-dom';
import { categoriesData,placesData,districtsData } from '../database/data';

export default function Home() {
    return (
        <section className="w-full space-y-12 pb-8">
            {/* Hero Section */}
            <div 
                className="w-full h-[450px] md:h-[500px] bg-cover bg-center rounded-2xl flex items-center justify-center text-white shadow-md relative overflow-hidden"
                style={{ backgroundImage: `url(${heroImg})` }}
            >
                <div className="bg-black/50 p-8 md:p-12 rounded-2xl text-center mx-4 backdrop-blur-xs">
                    <h1 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">Khám Phá Đà Nẵng Cùng Smart Trip</h1>
                    <div className="flex flex-col sm:flex-row justify-center items-center gap-3">
                        <input 
                            type="text" 
                            placeholder="Bạn muốn đến đâu ở Đà Nẵng?" 
                            className="w-full sm:w-[320px] bg-white text-gray-800 placeholder-gray-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#006971]" 
                        />
                        <button 
                            type="submit" 
                            className="w-full sm:w-auto bg-[#006971] hover:bg-[#005258] text-white px-6 py-3 rounded-xl font-bold text-sm transition-colors cursor-pointer"
                        >
                            Tìm kiếm
                        </button>
                    </div>
                </div>
            </div>

            {/* Catalog Section */}
            <div className="w-full max-w-7xl mx-auto px-2">
                <h2 className="text-black font-bold text-2xl md:text-3xl mb-6">Khám phá theo danh mục</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6">
                    {categoriesData.map((item)=>(
                        <Catalog name={item.name} img = {item.img}/>
                    ))}
                </div>
            </div>

            {/* Featured Places Section */}
            <div className="w-full max-w-7xl mx-auto px-2">
                <h2 className="text-black font-bold text-2xl md:text-3xl mb-6">Địa điểm nổi tiếng</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                    {placesData.map((place) => (
                        <PlaceCard 
                            key={place.id}
                            id={place.id}
                            name={place.name}
                            img={place.img}
                            des={place.des}
                            stars={place.stars}
                            price={place.priceDisplay}
                            category={place.category}
                            address={place.address}
                        />
                    ))}
                </div>
            </div>

            {/* Banner Lập lịch trình */}
            <div className='flex flex-wrap gap-4 bg-[#006971] rounded-2xl p-8 md:p-10 items-center justify-between shadow-sm'>
                <div className='flex flex-col space-y-2'>
                    <h2 className='font-bold text-2xl md:text-3xl text-white'>Lập lịch trình thông minh chỉ trong 1 phút</h2>
                    <p className='text-cyan-100 text-sm md:text-base'>Để chúng tôi gợi ý hành trình hoàn hảo dựa trên sở thích và ngân sách của bạn</p>
                </div>
                <div>
                    <Link to="/explore" className='inline-flex items-center justify-center px-6 py-3 bg-white text-[#006971] hover:bg-gray-200 font-bold rounded-xl transition-colors shadow-md'>
                        Bắt đầu ngay
                    </Link>
                </div>
            </div>
        </section>
    );
}