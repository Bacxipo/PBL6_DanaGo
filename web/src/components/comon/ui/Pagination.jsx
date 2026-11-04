'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ currentPage, totalPages, setCurrentPage }) {
    if (totalPages <= 1) return null;

    // Tính toán các trang cần hiển thị thông minh với dấu ba chấm ...
    const getPageNumbers = () => {
        if (totalPages <= 7) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }

        if (currentPage <= 4) {
            return [1, 2, 3, 4, 5, '...', totalPages];
        }

        if (currentPage >= totalPages - 3) {
            return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
        }

        return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
    };

    const pages = getPageNumbers();

    return (
        <nav
            aria-label="Pagination"
            className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 py-3 px-4 bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/80"
        >
            <div className="text-xs sm:text-sm text-gray-500 font-medium">
                Trang <span className="font-bold text-[#006971]">{currentPage}</span> / <span className="font-bold text-gray-700">{totalPages}</span>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2">
                {/* Nút Trước */}
                <button
                    type="button"
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-2xs cursor-pointer"
                >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">Trước</span>
                </button>

                {/* Các nút số trang */}
                <div className="flex items-center gap-1 sm:gap-1.5">
                    {pages.map((page, index) => {
                        if (page === '...') {
                            return (
                                <span
                                    key={`dots-${index}`}
                                    className="w-8 sm:w-10 h-10 flex items-center justify-center text-gray-400 font-bold select-none text-sm"
                                >
                                    •••
                                </span>
                            );
                        }

                        const isActive = currentPage === page;

                        return (
                            <button
                                key={`page-${page}`}
                                type="button"
                                onClick={() => setCurrentPage(page)}
                                aria-current={isActive ? 'page' : undefined}
                                className={`min-w-10 h-10 px-2 sm:min-w-11 sm:h-11 rounded-xl text-sm font-bold flex items-center justify-center transition-all cursor-pointer ${
                                    isActive
                                        ? 'bg-[#006971] text-white shadow-md shadow-[#006971]/20 scale-105'
                                        : 'bg-white text-gray-700 border border-gray-200 hover:bg-[#E2F5F6] hover:text-[#006971] hover:border-[#006971]/30 shadow-2xs'
                                }`}
                            >
                                {page}
                            </button>
                        );
                    })}
                </div>

                {/* Nút Sau */}
                <button
                    type="button"
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-2xs cursor-pointer"
                >
                    <span className="hidden sm:inline">Sau</span>
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </nav>
    );
}
