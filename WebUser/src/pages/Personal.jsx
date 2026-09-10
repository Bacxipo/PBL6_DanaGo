import {useState} from 'react';
import {User,Calendar,Map,Settings} from 'lucide-react';
import SettingInfo from '../components/layout/SettingInfo';
import FavoritePlace from '../components/layout/FavoritePlace';
import PersonalPage from '../components/layout/PersonalPage';
import ItineraryDetail from '../components/layout/ItineraryDetail';
export default function Personal(){
    const [activeButton, setActiveButton] = useState('personalpage');

    return(
        <section className = 'w-full flex gap-6 space-y-12 gap-x-10 max-w-7xl mx-auto py-12'>
            <div className = 'flex flex-col gap-6 p-2 rounded-sm/4 shadow-xl/20 w-1/4 h-fit'>
                <button 
                    className={`p-2 rounded-sm flex gap-x-1 items-center ${activeButton === 'userInfo' ? 'text-[#006971] font-bold ' : 'bg-gray-200 text-gray-600'}`}
                    onClick={() => setActiveButton('personalpage')}
                >
                    <User className ='w-5 h-5'/>
                    Trang cá nhân
                </button>
                <button 
                    className={`p-2 rounded-sm flex gap-x-1 items-center ${activeButton === 'itinerary' ? 'text-[#006971] font-bold ' : 'bg-gray-200 text-gray-600'}`}     
                    onClick={() => setActiveButton('itinerary')}
                >
                    <Calendar className ='w-5 h-5'/>
                    Lịch trình của tôi
                </button>
                <button 
                    className={`p-2 rounded-sm flex gap-x-1 items-center ${activeButton === 'favoritePlaces' ? 'text-[#006971] font-bold ' : 'bg-gray-200 text-gray-600'}`}
                    onClick={() => setActiveButton('favoritePlaces')}
                >
                    <Map className ='w-5 h-5'/>
                    Địa điểm yêu thích
                </button>
                <button 
                    className={`p-2 rounded-sm flex gap-x-1 items-center ${activeButton === 'accountSettings' ? 'text-[#006971] font-bold ' : 'bg-gray-200 text-gray-600'}`}
                    onClick={() => setActiveButton('accountSettings')}
                >
                    <Settings className ='w-5 h-5'/>
                    Cài đặt tài khoản
                </button>
            </div>
            <div className = 'w-3/4'>
                {activeButton === 'personalpage' && <PersonalPage/>}
                {activeButton === 'accountSettings' && <SettingInfo />}
                {activeButton === 'favoritePlaces' && <FavoritePlace />}
                {activeButton === 'itinerary' && <ItineraryDetail/>}
            </div>
        </section>
    );
}