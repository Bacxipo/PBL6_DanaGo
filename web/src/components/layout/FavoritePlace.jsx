'use client';

import { placesData } from '../../database/data.js';
import PlaceList from '../comon/place/PlaceList.jsx';

export default function FavoritePlace() {
    return (
        <div className='flex flex-col gap-4'>
            <h4 className='font-bold text-lg text-gray-800'>Địa điểm yêu thích</h4>
            <p className='text-gray-600 text-sm'>Những góc nhỏ Đà Nẵng bạn đã lưu lại cho chuyến đi sắp tới</p>
            <div className='mt-2'>
                <PlaceList places={placesData} />
            </div>
        </div>
    );
}