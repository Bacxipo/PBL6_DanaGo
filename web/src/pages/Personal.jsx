'use client';

import { useState } from 'react';
import { User, Calendar, Map, Settings } from 'lucide-react';
import SettingInfo from '../components/layout/SettingInfo';
import FavoritePlace from '../components/layout/FavoritePlace';
import PersonalPage from '../components/layout/PersonalPage';
import ItineraryDetail from '../components/layout/ItineraryDetail';

export default function Personal() {
    const [activeButton, setActiveButton] = useState('personalpage');

    const getButtonClass = (key) => {
        const isActive = activeButton === key;
        return `w-full p-3 rounded-xl flex items-center gap-x-3 transition-all duration-200 font-semibold text-sm cursor-pointer ${
            isActive
                ? 'bg-[#006971] text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-[#006971]'
        }`;
    };

    return (
        <section className='w-full flex gap-8 max-w-7xl mx-auto py-8 px-4'>
            {/* Sidebar Menu */}
            <div className='flex flex-col gap-3 p-4 bg-white rounded-2xl shadow-sm border border-gray-100 w-1/4 h-fit shrink-0'>
                <button 
                    className={getButtonClass('personalpage')}
                    onClick={() => setActiveButton('personalpage')}
                >
                    <User className='w-5 h-5'/>
                    <span>Trang cá nhân</span>
                </button>

                <button 
                    className={getButtonClass('itinerary')}     
                    onClick={() => setActiveButton('itinerary')}
                >
                    <Calendar className='w-5 h-5'/>
                    <span>Lịch trình của tôi</span>
                </button>

                <button 
                    className={getButtonClass('favoritePlaces')}
                    onClick={() => setActiveButton('favoritePlaces')}
                >
                    <Map className='w-5 h-5'/>
                    <span>Địa điểm yêu thích</span>
                </button>

                <button 
                    className={getButtonClass('accountSettings')}
                    onClick={() => setActiveButton('accountSettings')}
                >
                    <Settings className='w-5 h-5'/>
                    <span>Cài đặt tài khoản</span>
                </button>
            </div>

            {/* Main Content View */}
            <div className='w-3/4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 min-h-[500px]'>
                {activeButton === 'personalpage' && <PersonalPage />}
                {activeButton === 'itinerary' && <ItineraryDetail />}
                {activeButton === 'favoritePlaces' && <FavoritePlace />}
                {activeButton === 'accountSettings' && <SettingInfo />}
            </div>
        </section>
    );
}