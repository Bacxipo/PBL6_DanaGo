'use client';

import { useState } from "react";
import PlaceCard from "./PlaceCard";
import Pagination from "../ui/Pagination";

export default function PlaceList({ places = [], placesPerPage = 9 }) {
    const [currentPage, setCurrentPage] = useState(1);
    const [prevPlaces, setPrevPlaces] = useState(places);

    // Khi danh sách places thay đổi (lọc danh mục, quận...) thì quay về trang 1
    if (places !== prevPlaces) {
        setPrevPlaces(places);
        setCurrentPage(1);
    }

    // Tổng số trang
    const totalPages = Math.ceil(places.length / placesPerPage);

    // Vị trí bắt đầu
    const startIndex = (currentPage - 1) * placesPerPage;

    // Danh sách địa điểm của trang hiện tại
    const currentPlaces = places.slice(
        startIndex,
        startIndex + placesPerPage
    );

    return (
        <div className="w-full flex flex-col">
            {/* Khung hiển thị các thẻ địa điểm (Destination Cards Frame) */}
            <div className="w-full pb-6">
                {currentPlaces.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                        {currentPlaces.map((place) => (
                            <PlaceCard
                                key={place.id}
                                id={place.id}
                                name={place.name}
                                img={place.img}
                                des={place.des}
                                stars={place.stars}
                                price={place.priceDisplay ?? place.price}
                                category={place.category}
                                address={place.address}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex items-center justify-center min-h-[350px] text-center bg-white rounded-2xl border border-gray-100 p-8">
                        <h3 className="text-xl font-bold text-gray-700">
                            Không tìm thấy dữ liệu điểm đến phù hợp
                        </h3>
                    </div>
                )}
            </div>

            {/* Khung phân trang TÁCH BIỆT hoàn toàn khỏi khung cards */}
            {totalPages > 1 && (
                <div className="shrink-0 pt-4 border-t border-gray-200 mt-2">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        setCurrentPage={setCurrentPage}
                    />
                </div>
            )}
        </div>
    );
}
