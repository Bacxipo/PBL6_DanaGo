// Lọc địa điểm
export function filterPlaces(places, filter) {
    return places.filter((item) => {

        // Danh mục
        const choseCategory =
            filter.category === "Tất cả" ||
            item.category === filter.category;

        // Khu vực
        const choseAddress =
            filter.address === "Tất cả quận" ||
            item.address === filter.address;

        // Giá tối thiểu
        const choseMinPrice =
            filter.minPrice === "" ||
            Number(item.price) >= Number(filter.minPrice);

        // Giá tối đa
        const choseMaxPrice =
            filter.maxPrice === "" ||
            Number(item.price) <= Number(filter.maxPrice);

        // Đánh giá
        const choseRating =
            filter.ratings.length === 0 ||
            filter.ratings.includes(Number(item.stars));

        return (
            choseCategory &&
            choseAddress &&
            choseMinPrice &&
            choseMaxPrice &&
            choseRating
        );
    });
}


// Xử lý chọn / bỏ chọn rating
export function toggleRating(ratings, rating) {
    if (ratings.includes(rating)) {
        return ratings.filter((item) => item !== rating);
    }

    return [...ratings, rating];
}


// Giá trị filter mặc định
export const defaultFilter = {
    category: "Tất cả",
    address: "Tất cả quận",
    minPrice: "",
    maxPrice: "",
    ratings: [],
};

