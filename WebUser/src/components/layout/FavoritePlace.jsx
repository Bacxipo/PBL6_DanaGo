import {placesData} from '../../database/data.js';
import PlaceList from '../comon/PlaceList.jsx';
export default function FavoritePlace(){
    return(
        <div className='flex flex-col gap-4'>
            <h4 className = 'font-bold text-lg'>Địa điểm yêu thích</h4>
            <p className='text-gray-600'>Những góc nhỏ Đà nẵng bạn đã lưu lại cho chuyến đi sắp tới</p>
            <PlaceList places={placesData}/>
        </div>
    );
}