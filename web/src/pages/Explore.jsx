'use client';

import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Rating from '../components/comon/ui/Rating';
import PlaceList from "../components/comon/place/PlaceList";
import PlaceCardSkeleton from '../components/home/PlaceCardSkeleton';
import { RefreshCw, AlertCircle, Search, X } from 'lucide-react';
import { getRawDestinations, getDestinationCategories, normalizeDestinationCard } from "@/lib/destination-api";

import { searchPlaces } from '@/utils/filterPlace';

export default function Explore() {
    const searchParams = useSearchParams();
    const initialQuery = searchParams.get('search') || '';
    const initialCategory = searchParams.get('category') || 'Tất cả';

    const [destinations, setDestinations] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Bộ lọc
    const [searchTerm, setSearchTerm] = useState(initialQuery);
    const [category, setCategory] = useState(initialCategory);
    const [address, setAddress] = useState("Tất cả quận");
    const [minRating, setMinRating] = useState(0);

    // Cập nhật searchTerm khi URL query param thay đổi (ví dụ navigate từ trang Home)
    useEffect(() => {
        const queryFromUrl = searchParams.get('search');
        if (queryFromUrl !== null) {
            setSearchTerm(queryFromUrl);
        }
        const categoryFromUrl = searchParams.get('category');
        if (categoryFromUrl !== null) {
            setCategory(categoryFromUrl);
        }
    }, [searchParams]);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [destData, catData] = await Promise.all([
                getRawDestinations({ status: 'APPROVED' }),
                getDestinationCategories(),
            ]);
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
        return destinations.map(normalizeDestinationCard);
    }, [destinations]);

    // Áp dụng bộ lọc (bao gồm tìm kiếm theo tên địa điểm)
    const filteredPlaces = useMemo(() => {
        return searchPlaces(mappedPlaces, searchTerm).filter((item) => {
            const matchCategory = category === "Tất cả" || item.category === category;
            const matchAddress = address === "Tất cả quận" || item.address === address;
            const matchRating = minRating === 0 || item.stars >= minRating;
            return matchCategory && matchAddress && matchRating;
        });
    }, [mappedPlaces, searchTerm, category, address, minRating]);

    const handleClearFilter = () => {
        setSearchTerm("");
        setCategory("Tất cả");
        setAddress("Tất cả quận");
        setMinRating(0);
    };

    return (
        <section className="dana-content-page w-full flex flex-col lg:flex-row gap-6 px-4 sm:px-6 lg:px-8 py-6">
            {/* Cột Bộ Lọc Bên Trái */}
            <aside className="w-full lg:w-72 shrink-0 h-fit lg:sticky lg:top-24 flex flex-col bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80">
                <div className="flex items-center justify-between mb-5">
                    <h3 className="font-bold text-gray-800">Bộ lọc</h3>
                    <button
                        type="button"
                        onClick={handleClearFilter}
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
                            className={`cursor-pointer px-3 py-2 rounded-xl text-xs text-center transition-all ${category === "Tất cả"
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
                                className={`cursor-pointer px-3 py-2 rounded-xl text-xs text-center transition-all truncate ${category === cat.name
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
                        className="w-full bg-[#f7fafa] border border-slate-200/80 rounded-xl px-3 py-2 text-sm outline-none cursor-pointer focus:border-[#006971]"
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

            {/* Cột Danh Sách Địa Điểm Bên Phải */}
            <div className="flex-1 min-w-0 flex flex-col">
                {/* Thanh tìm kiếm theo tên và số lượng kết quả */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 shrink-0">
                    {/* Ô tìm kiếm theo tên địa điểm */}
                    <div className="w-full sm:flex-1 sm:max-w-xl">
                        <label htmlFor="destination-search" className="block mb-2 text-sm font-semibold text-gray-800">
                            Tìm kiếm địa điểm
                        </label>
                        <div className="relative">
                            <Search aria-hidden="true" className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#006971] pointer-events-none" />
                            <input
                                id="destination-search"
                                type="text"
                                autoComplete="off"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Tìm kiếm theo tên địa điểm (Bà Nà, Mỹ Khê, Sơn Trà...)..."
                                className="w-full pl-11 pr-11 py-3 bg-white border border-slate-200 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:border-[#006971] focus:ring-2 focus:ring-[#006971]/20 transition-all shadow-xs"
                            />
                            {searchTerm && (
                                <button
                                    type="button"
                                    onClick={() => setSearchTerm("")}
                                    aria-label="Xóa từ khóa tìm kiếm"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer p-0.5 rounded-full hover:bg-gray-100 transition-colors"
                                    title="Xóa từ khóa tìm kiếm"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <span role="status" className="text-gray-800 font-bold text-sm whitespace-nowrap">
                            {loading ? 'Đang tải dữ liệu...' : `Tìm thấy ${filteredPlaces.length} điểm đến`}
                        </span>
                        {category !== "Tất cả" && (
                            <span className="text-xs font-semibold px-3 py-1 bg-[#E2F5F6] text-[#007C83] rounded-full border border-[#007C83]/20 whitespace-nowrap">
                                Danh mục: {category}
                            </span>
                        )}
                    </div>
                </div>

                <div className="w-full flex flex-col">
                    {loading ? (
                        <PlaceCardSkeleton label="Đang tải danh sách điểm đến…" />
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
