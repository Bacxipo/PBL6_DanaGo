import { useEffect, useState } from "react";
import PlaceCard from "./PlaceCard";
import Pagination from "./Pagination";

export default function PlaceList({ places }) {
    const [currentPage, setCurrentPage] = useState(1);

    // Số địa điểm mỗi trang
    const placesPerPage = 6;

    // Tổng số trang
    const totalPages = Math.ceil(places.length / placesPerPage);

    // Vị trí bắt đầu
    const startIndex = (currentPage - 1) * placesPerPage;

    // Danh sách địa điểm của trang hiện tại
    const currentPlaces = places.slice(
        startIndex,
        startIndex + placesPerPage
    );

    // Khi danh sách places thay đổi thì quay về trang 1
    useEffect(() => {
        setCurrentPage(1);
    }, [places]);

    return (
        <>
            {currentPlaces.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
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

                    {totalPages > 1 && (
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            setCurrentPage={setCurrentPage}
                        />
                    )}
                </>
            ) : (
                <div className="flex items-center justify-center min-h-[400px] text-center">
                    <h3 className="text-xl font-bold text-gray-700">
                        Không tìm thấy dữ liệu
                    </h3>
                </div>
            )}
        </>
    );
}

