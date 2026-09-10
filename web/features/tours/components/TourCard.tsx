import React from 'react';
import { Tour } from '../services/tour.api';

interface TourCardProps {
  tour: Tour;
}

export const TourCard: React.FC<TourCardProps> = ({ tour }) => {
  return (
    <div className="border rounded-lg p-4 shadow-sm hover:shadow-md transition">
      <h3 className="text-lg font-bold">{tour.title}</h3>
      <p className="text-sm text-gray-500">Địa điểm: {tour.location}</p>
      <p className="text-base font-semibold text-blue-600 mt-2">
        {tour.price.toLocaleString('vi-VN')} VNĐ
      </p>
    </div>
  );
};
