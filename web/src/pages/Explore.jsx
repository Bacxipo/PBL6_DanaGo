'use client';

import { useState, useEffect, useMemo } from "react";
import Rating from '../components/comon/ui/Rating';
import PlaceList from "../components/comon/place/PlaceList";
import { Loader2, RefreshCw, AlertCircle } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function Explore() {
    const [destinations, setDestinations] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Bộ lọc
    const [category, setCategory] = useState("Tất cả");
    const [address, setAddress] = useState("Tất cả quận");
    const [minRating, setMinRating] = useState(0);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            // 1. Lấy danh sách điểm đến đã duyệt
            const destRes = await fetch(`${API_BASE_URL}/destinations?status=APPROVED`);
            if (!destRes.ok) throw new Error(`Lỗi tải điểm đến: ${destRes.status}`);
            const destData = await destRes.json();

            // 2. Lấy danh mục từ API
            let catData = [];
            try {
                const catRes = await fetch(`${API_BASE_URL}/destinations/categories`);
                if (catRes.ok) {
                    catData = await catRes.json();
                }
            } catch {
                // Fallback nếu route categories chưa có
            }

            setDestinations(destData);
            setCategories(catData);
        } catch (err) {
            console.error('Lỗi khi gọi API destinations:', err);
            setError(err.message || 'Không thể kết nối đến máy chủ API.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Danh sách các quận/huyện duy nhất lấy từ dữ liệu thực tế
    const districtsList = useMemo(() => {
        const unique = new Set(
            destinations
                .map((d) => d.district?.trim())
                .filter(Boolean)
        );
        return ["Tất cả quận", ...Array.from(unique).sort((a, b) => a.localeCompare(b, 'vi'))];
    }, [destinations]);

    // Chuẩn hóa danh sách điểm đến sang format PlaceCard cần
    const mappedPlaces = useMemo(() => {
        return destinations.map((item) => {
            const hasImg = item.images && item.images.length > 0 && item.images[0]?.imageUrl;

            return {
                id: item.id,
                name: item.name,
                img: hasImg ? item.images[0].imageUrl : null,
                des: item.description || "Điểm đến hấp dẫn tại Đà Nẵng và miền Trung.",
                stars: item.avgRating ? Number(item.avgRating) : 5,
                price: item.ticketPrice || "Miễn phí",
                priceDisplay: item.ticketPrice || "Miễn phí",
                category: item.categoryName || "Địa điểm",
                address: item.district || "Đà Nẵng",
            };
        });
    }, [destinations]);

    // Áp dụng bộ lọc
    const filteredPlaces = useMemo(() => {
        return mappedPlaces.filter((item) => {
            const matchCategory = category === "Tất cả" || item.category === category;
            const matchAddress = address === "Tất cả quận" || item.address === address;
            const matchRating = minRating === 0 || item.stars >= minRating;
            return matchCategory && matchAddress && matchRating;
        });
    }, [mappedPlaces, category, address, minRating]);

    return (
        <section className="w-full flex flex-col lg:flex-row gap-6 px-4 sm:px-6 lg:px-8 py-6">
            {/* Cột Bộ Lọc Bên Trái */}
            <aside className="w-full lg:w-72 shrink-0 h-fit lg:sticky lg:top-24 flex flex-col bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-5">
                    <h3 className="font-bold text-gray-800">Bộ lọc</h3>
                    <button
                        type="button"
                        onClick={() => {
                            setCategory("Tất cả");
                            setAddress("Tất cả quận");
                            setMinRating(0);
                        }}
                        className="text-sm text-[#006971] font-bold hover:text-orange-500 cursor-pointer transition-colors"
                    >
                        Xóa lọc
                    </button>
                </div>

                {/* Danh mục */}
                <div>
                    <span className="text-sm font-bold text-gray-800 mb-3 block">Danh mục</span>
                    <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1 scrollbar-thin">
                        <button
                            type="button"
                            onClick={() => setCategory("Tất cả")}
                            className={`cursor-pointer px-3 py-2 rounded-xl text-xs text-center transition-all ${
                                category === "Tất cả"
                                    ? "bg-[#007C83] text-white font-bold shadow-sm"
                                    : "bg-[#E2F5F6] text-[#007C83] hover:bg-[#d0f0f2]"
                            }`}
                        >
                            Tất cả
                        </button>
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                type="button"
                                onClick={() => setCategory(cat.name)}
                                className={`cursor-pointer px-3 py-2 rounded-xl text-xs text-center transition-all truncate ${
                                    category === cat.name
                                        ? "bg-[#007C83] text-white font-bold shadow-sm"
                                        : "bg-[#E2F5F6] text-[#007C83] hover:bg-[#d0f0f2]"
                                }`}
                                title={cat.name}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Đánh giá */}
                <div className="mt-5">
                    <span className="text-sm font-bold text-gray-800 mb-3 block">Đánh giá tối thiểu</span>
                    <div className="space-y-2">
                        {[
                            { label: "Tất cả đánh giá", val: 0 },
                            { label: "5 sao", val: 5 },
                            { label: "Từ 4 sao trở lên", val: 4 },
                            { label: "Từ 3 sao trở lên", val: 3 },
                        ].map((r) => (
                            <label
                                key={r.val}
                                className="flex items-center gap-3 cursor-pointer group text-xs text-gray-700"
                            >
                                <input
                                    type="radio"
                                    name="ratingFilter"
                                    checked={minRating === r.val}
                                    onChange={() => setMinRating(r.val)}
                                    className="w-4 h-4 accent-[#006971] cursor-pointer"
                                />
                                {r.val > 0 ? <Rating rating={String(r.val)} /> : r.label}
                            </label>
                        ))}
                    </div>
                </div>

                {/* Khu vực */}
                <div className="mt-5">
                    <span className="text-sm font-bold text-gray-800 mb-3 block">Khu vực / Quận</span>
                    <select
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none cursor-pointer focus:border-[#006971]"
                    >
                        {districtsList.map((dist, idx) => (
                            <option key={idx} value={dist}>
                                {dist}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex justify-center mt-6">
                    <button
                        type="button"
                        onClick={fetchData}
                        className="flex items-center justify-center gap-2 bg-[#006971] w-full p-2.5 rounded-xl font-bold text-white cursor-pointer hover:bg-[#00555c] transition-colors"
                    >
                        <RefreshCw className="w-4 h-4" /> Làm mới dữ liệu
                    </button>
                </div>
            </aside>

            {/* Cột Danh Sách Địa Điểm Bên Phải - Mở rộng hết chiều ngang trang */}
            <div className="flex-1 min-w-0 flex flex-col">
                <div className="flex items-center justify-between pb-4 shrink-0">
                    <span className="text-gray-800 font-bold text-base">
                        {loading ? 'Đang tải dữ liệu...' : `Tìm thấy ${filteredPlaces.length} điểm đến`}
                    </span>
                    {category !== "Tất cả" && (
                        <span className="text-xs font-semibold px-3 py-1 bg-[#E2F5F6] text-[#007C83] rounded-full border border-[#007C83]/20">
                            Danh mục: {category}
                        </span>
                    )}
                </div>

                <div className="w-full flex flex-col">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center flex-1 gap-3 text-gray-500 min-h-[400px]">
                            <Loader2 className="w-8 h-8 animate-spin text-[#006971]" />
                            <p className="text-sm font-medium">Đang tải danh sách điểm đến từ API...</p>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center flex-1 gap-3 text-red-500 min-h-[400px]">
                            <AlertCircle className="w-10 h-10" />
                            <p className="text-base font-bold">{error}</p>
                            <button
                                type="button"
                                onClick={fetchData}
                                className="px-4 py-2 bg-[#006971] text-white rounded-lg text-sm font-semibold hover:bg-[#00555c] transition-colors cursor-pointer"
                            >
                                Thử lại
                            </button>
                        </div>
                    ) : (
                        <PlaceList places={filteredPlaces} placesPerPage={9} />
                    )}
                </div>
            </div>
        </section>
    );
}