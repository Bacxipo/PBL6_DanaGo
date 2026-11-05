'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle2 } from 'lucide-react';
import ItineraryListView from '../comon/itinerary/ItineraryListView';
import ItineraryEditorView from '../comon/itinerary/ItineraryEditorView';
import CreateItineraryModal from '../comon/itinerary/CreateItineraryModal';
import PlaceDetailModal from '../comon/place/PlaceDetailModal';
import ConfirmLeaveModal from '../comon/itinerary/ConfirmLeaveModal';

import { sampleItineraries, quickSearchPlacesData } from '@/database/data';
import { saveItineraryFull, updateChecklistItemApi, deleteChecklistItemApi } from '@/lib/itinerary-api';

const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const STORAGE_KEY = 'danago_itineraries';

// Helper tính danh sách các ngày
const calculateDaysList = (startDateStr, endDateStr, daysMap = {}) => {
    if (!startDateStr || !endDateStr) return [];
    const start = new Date(startDateStr);
    const end = new Date(endDateStr);
    const diffTime = Math.max(0, end - start);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const result = [];
    for (let i = 1; i <= diffDays; i++) {
        const d = new Date(start);
        d.setDate(d.getDate() + (i - 1));
        const dayFormatted = `${d.getDate()}/${d.getMonth() + 1}`;
        const count = daysMap[i] ? daysMap[i].length : 0;
        result.push({
            id: i,
            title: `Ngày ${i} (${dayFormatted})`,
            count: count,
            date: d.toISOString().split('T')[0],
        });
    }
    return result;
};

// Map category string to filter type
const mapCategoryToType = (cat = '') => {
    const lower = cat.toLowerCase();
    if (lower.includes('ẩm thực') || lower.includes('ăn uống') || lower.includes('nhà hàng') || lower.includes('quán')) {
        return 'food';
    }
    if (lower.includes('thắng cảnh') || lower.includes('tham quan') || lower.includes('biển') || lower.includes('núi') || lower.includes('di tích')) {
        return 'sightseeing';
    }
    return 'sightseeing';
};

export default function ItineraryDetail({ isStandalone = false }) {
    // 1. Dữ liệu lịch trình lưu trữ lâu dài
    const [itineraries, setItineraries] = useState(() => {
        if (typeof window !== 'undefined') {
            try {
                const saved = localStorage.getItem(STORAGE_KEY);
                if (saved) {
                    const parsed = JSON.parse(saved);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        return parsed;
                    }
                }
            } catch (e) {
                console.warn('Lỗi đọc lịch trình từ localStorage:', e);
            }
        }
        return sampleItineraries;
    });

    const [selectedItineraryId, setSelectedItineraryId] = useState(null);
    const [workingItinerary, setWorkingItinerary] = useState(null);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [activeDay, setActiveDay] = useState(1);

    // Modals
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingItinerary, setEditingItinerary] = useState(null);
    const [inspectingPlace, setInspectingPlace] = useState(null);
    const [isConfirmLeaveOpen, setIsConfirmLeaveOpen] = useState(false);

    // Toast message thông báo lưu
    const [toastMessage, setToastMessage] = useState('');

    // Dữ liệu tìm kiếm nhanh từ backend
    const [searchPlaces, setSearchPlaces] = useState(quickSearchPlacesData);

    // Lưu vào localStorage khi itineraries thay đổi
    useEffect(() => {
        if (typeof window !== 'undefined') {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(itineraries));
            } catch (e) {
                console.error('Lỗi khi lưu lịch trình vào localStorage:', e);
            }
        }
    }, [itineraries]);

    // Tự động tắt Toast sau 3 giây
    useEffect(() => {
        if (toastMessage) {
            const timer = setTimeout(() => setToastMessage(''), 3000);
            return () => clearTimeout(timer);
        }
    }, [toastMessage]);

    // Tải danh sách địa điểm thật từ Backend API
    useEffect(() => {
        const loadRealDestinations = async () => {
            try {
                const res = await fetch(`${BACKEND_API_URL}/destinations?limit=300`);
                if (res.ok) {
                    const list = await res.json();
                    if (Array.isArray(list) && list.length > 0) {
                        const mapped = list.map((item) => {
                            let imgUrl = 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=600&q=80';
                            if (item.images && item.images.length > 0) {
                                imgUrl = typeof item.images[0] === 'string' ? item.images[0] : item.images[0]?.imageUrl || imgUrl;
                            }
                            return {
                                id: item.id,
                                name: item.name,
                                rating: item.avgRating ? Number(item.avgRating).toFixed(1) : '4.8',
                                reviews: '100+',
                                category: item.categoryName || 'Địa điểm du lịch',
                                categoryType: mapCategoryToType(item.categoryName),
                                address: item.district ? `${item.district}, Đà Nẵng` : 'Đà Nẵng',
                                district: item.district || '',
                                ticketPrice: item.ticketPrice || 'Miễn phí',
                                openHours: item.openHours || '',
                                des: item.description || '',
                                infor: item.description || '',
                                img: imgUrl,
                            };
                        });
                        setSearchPlaces(mapped);
                    }
                }
            } catch (err) {
                console.warn('Sử dụng dữ liệu tìm kiếm địa điểm mẫu:', err);
            }
        };

        loadRealDestinations();
    }, []);

    // Khi chọn một lịch trình để xem/chỉnh sửa
    const handleSelectItinerary = (id) => {
        const target = itineraries.find((it) => it.id === id);
        if (target) {
            setSelectedItineraryId(id);
            setWorkingItinerary(JSON.parse(JSON.stringify(target))); // Deep clone
            setHasUnsavedChanges(false);
            setActiveDay(1);
        }
    };

    // NÚT LƯU LỊCH TRÌNH VÀ CHECKLIST VÀO DATABASE
    const handleSaveCurrentItinerary = async () => {
        if (!workingItinerary) return;

        // Cập nhật State cục bộ & localStorage
        setItineraries((prev) =>
            prev.map((it) => (it.id === workingItinerary.id ? workingItinerary : it))
        );
        setHasUnsavedChanges(false);
        setToastMessage('Đã lưu toàn bộ lịch trình và checklist thành công!');

        // Gửi lưu trực tiếp vào PostgreSQL (bảng itinerary, itinerary_item, checklist_item)
        try {
            const savedDb = await saveItineraryFull(workingItinerary);
            if (savedDb && savedDb.id) {
                console.log('Lịch trình và checklist đã được đồng bộ với CSDL PostgreSQL ID:', savedDb.id);
            }
        } catch (err) {
            console.warn('Đồng bộ backend DB thất bại (dữ liệu đã an toàn ở local):', err);
        }
    };

    // Khi bấm "Quay lại danh sách": Kiểm tra xem có thay đổi chưa lưu không
    const handleRequestBackToList = () => {
        if (hasUnsavedChanges) {
            setIsConfirmLeaveOpen(true);
        } else {
            setSelectedItineraryId(null);
            setWorkingItinerary(null);
        }
    };

    // Xử lý xác nhận: Lưu & Quay lại
    const handleConfirmSaveAndLeave = () => {
        handleSaveCurrentItinerary();
        setIsConfirmLeaveOpen(false);
        setSelectedItineraryId(null);
        setWorkingItinerary(null);
    };

    // Xử lý xác nhận: Bỏ qua không lưu & Quay lại
    const handleConfirmDiscardAndLeave = () => {
        setIsConfirmLeaveOpen(false);
        setHasUnsavedChanges(false);
        setSelectedItineraryId(null);
        setWorkingItinerary(null);
    };

    // Tạo mới hoặc sửa thông tin lịch trình (Tên, ngày đi/về, mô tả)
    const handleSaveItineraryModal = (data) => {
        if (editingItinerary) {
            // Cập nhật thông tin lịch trình đang sửa
            const updated = {
                ...workingItinerary,
                title: data.title,
                startDate: data.startDate,
                endDate: data.endDate,
                description: data.description,
            };
            setWorkingItinerary(updated);
            setHasUnsavedChanges(true);
            setEditingItinerary(null);
        } else {
            // Tạo mới hoàn toàn
            const newId = Date.now();
            const newItinerary = {
                id: newId,
                title: data.title,
                startDate: data.startDate,
                endDate: data.endDate,
                description: data.description || 'Lịch trình du lịch mới tạo.',
                coverImg: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
                days: { 1: [] },
            };
            setItineraries((prev) => [newItinerary, ...prev]);
            setSelectedItineraryId(newId);
            setWorkingItinerary(JSON.parse(JSON.stringify(newItinerary)));
            setHasUnsavedChanges(false);
            setActiveDay(1);
        }
    };

    // Xóa một lịch trình khỏi danh sách
    const handleDeleteItinerary = (id, e) => {
        e.stopPropagation();
        if (confirm('Bạn có chắc chắn muốn xóa lịch trình này?')) {
            setItineraries((prev) => prev.filter((it) => it.id !== id));
            if (selectedItineraryId === id) {
                setSelectedItineraryId(null);
                setWorkingItinerary(null);
                setHasUnsavedChanges(false);
            }
        }
    };

    // Xóa một hoạt động trong ngày đang chọn
    const handleDeletePlace = (dayId, itemId) => {
        if (!workingItinerary) return;
        const dayPlaces = workingItinerary.days?.[dayId] || [];
        const updated = dayPlaces.filter((p) => p.id !== itemId);

        setWorkingItinerary({
            ...workingItinerary,
            days: {
                ...workingItinerary.days,
                [dayId]: updated,
            },
        });
        setHasUnsavedChanges(true);
    };

    // Chỉnh sửa giờ bắt đầu của một hoạt động
    const handleUpdateTime = (dayId, itemId, newTime) => {
        if (!workingItinerary) return;
        const dayPlaces = workingItinerary.days?.[dayId] || [];
        const updated = dayPlaces.map((p) => (p.id === itemId ? { ...p, time: newTime } : p));
        updated.sort((a, b) => (a.time || '').localeCompare(b.time || ''));

        setWorkingItinerary({
            ...workingItinerary,
            days: {
                ...workingItinerary.days,
                [dayId]: updated,
            },
        });
        setHasUnsavedChanges(true);
    };

    // Thêm địa điểm tham quan vào ngày đang chọn
    const handleAddPlaceToItinerary = (place, targetDayId, startTime = '08:00') => {
        if (!workingItinerary) return;
        const newPlaceItem = {
            id: Date.now(),
            placeId: place.id,
            destinationId: place.id,
            type: 'destination',
            name: place.name,
            location: place.address || place.location || 'Đà Nẵng',
            time: startTime,
            tag: place.category || 'Địa điểm tham quan',
            img: place.img || '',
            checklists: [],
        };

        const currentDayPlaces = workingItinerary.days?.[targetDayId] || [];
        const updated = [...currentDayPlaces, newPlaceItem];
        updated.sort((a, b) => (a.time || '').localeCompare(b.time || ''));

        setWorkingItinerary({
            ...workingItinerary,
            days: {
                ...workingItinerary.days,
                [targetDayId]: updated,
            },
        });
        setHasUnsavedChanges(true);
        setActiveDay(targetDayId);
    };

    // Thêm hoạt động tùy chỉnh (Di chuyển, Nghỉ ngơi, Ăn uống, Hoạt động khác)
    const handleAddCustomActivity = (activityData, targetDayId) => {
        if (!workingItinerary) return;

        const currentDayPlaces = workingItinerary.days?.[targetDayId] || [];
        const updated = [...currentDayPlaces, { ...activityData, checklists: activityData.checklists || [] }];
        updated.sort((a, b) => (a.time || '').localeCompare(b.time || ''));

        setWorkingItinerary({
            ...workingItinerary,
            days: {
                ...workingItinerary.days,
                [targetDayId]: updated,
            },
        });
        setHasUnsavedChanges(true);
    };

    // ================= XỬ LÝ CHECKLIST THEO HOẠT ĐỘNG =================

    // 1. Bật/Tắt đã đem vật dụng (Toggle isChecked)
    const handleToggleChecklist = (dayId, activityId, checklistId) => {
        if (!workingItinerary) return;
        const dayPlaces = workingItinerary.days?.[dayId] || [];
        let toggledVal = false;

        const updated = dayPlaces.map((p) => {
            if (p.id === activityId) {
                const chks = (p.checklists || []).map((c) => {
                    if (c.id === checklistId) {
                        toggledVal = !c.isChecked;
                        return { ...c, isChecked: !c.isChecked };
                    }
                    return c;
                });
                return { ...p, checklists: chks };
            }
            return p;
        });

        setWorkingItinerary({
            ...workingItinerary,
            days: {
                ...workingItinerary.days,
                [dayId]: updated,
            },
        });
        setHasUnsavedChanges(true);

        // Nếu ID là số nguyên của DB (dưới 1 tỷ), cập nhật thẳng lên DB
        if (typeof checklistId === 'number' && checklistId < 1000000000) {
            updateChecklistItemApi(checklistId, { isChecked: toggledVal });
        }
    };

    // 2. Thêm vật dụng mới vào hoạt động
    const handleAddChecklist = (dayId, activityId, itemName) => {
        if (!workingItinerary || !itemName.trim()) return;
        const dayPlaces = workingItinerary.days?.[dayId] || [];
        const newChkId = Date.now();

        const updated = dayPlaces.map((p) => {
            if (p.id === activityId) {
                const chks = p.checklists ? [...p.checklists] : [];
                chks.push({
                    id: newChkId,
                    itemName: itemName.trim(),
                    isChecked: false,
                });
                return { ...p, checklists: chks };
            }
            return p;
        });

        setWorkingItinerary({
            ...workingItinerary,
            days: {
                ...workingItinerary.days,
                [dayId]: updated,
            },
        });
        setHasUnsavedChanges(true);
    };

    // 3. Xóa vật dụng khỏi hoạt động
    const handleDeleteChecklist = (dayId, activityId, checklistId) => {
        if (!workingItinerary) return;
        const dayPlaces = workingItinerary.days?.[dayId] || [];

        const updated = dayPlaces.map((p) => {
            if (p.id === activityId) {
                const chks = (p.checklists || []).filter((c) => c.id !== checklistId);
                return { ...p, checklists: chks };
            }
            return p;
        });

        setWorkingItinerary({
            ...workingItinerary,
            days: {
                ...workingItinerary.days,
                [dayId]: updated,
            },
        });
        setHasUnsavedChanges(true);

        if (typeof checklistId === 'number' && checklistId < 1000000000) {
            deleteChecklistItemApi(checklistId);
        }
    };

    const daysList = workingItinerary
        ? calculateDaysList(workingItinerary.startDate, workingItinerary.endDate, workingItinerary.days)
        : [];
    const activeDayPlaces = workingItinerary ? workingItinerary.days?.[activeDay] || [] : [];

    return (
        <div className={isStandalone ? 'w-full max-w-7xl mx-auto' : 'w-full'}>
            {/* TOAST THÔNG BÁO LƯU THÀNH CÔNG */}
            {toastMessage && (
                <div className="fixed top-20 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-emerald-600 text-white rounded-2xl shadow-xl animate-in fade-in slide-in-from-top-4 duration-300">
                    <CheckCircle2 className="w-5 h-5 text-emerald-200" />
                    <span className="text-xs font-bold">{toastMessage}</span>
                </div>
            )}

            {/* View 1: Danh sách các lịch trình */}
            {!workingItinerary ? (
                <ItineraryListView
                    itineraries={itineraries}
                    onSelectItinerary={handleSelectItinerary}
                    onCreateClick={() => {
                        setEditingItinerary(null);
                        setIsCreateModalOpen(true);
                    }}
                    onDeleteItinerary={handleDeleteItinerary}
                    calculateDaysList={calculateDaysList}
                />
            ) : (
                /* View 2: Biên tập Dòng thời gian dạng Cây kèm Checklist */
                <ItineraryEditorView
                    currentItinerary={workingItinerary}
                    daysList={daysList}
                    activeDay={activeDay}
                    setActiveDay={setActiveDay}
                    activeDayPlaces={activeDayPlaces}
                    quickSearchPlacesData={searchPlaces}
                    hasUnsavedChanges={hasUnsavedChanges}
                    onSave={handleSaveCurrentItinerary}
                    onBackToList={handleRequestBackToList}
                    onEditInfo={() => {
                        setEditingItinerary(workingItinerary);
                        setIsCreateModalOpen(true);
                    }}
                    onDeletePlace={handleDeletePlace}
                    onUpdateTime={handleUpdateTime}
                    onAddPlace={handleAddPlaceToItinerary}
                    onAddCustomActivity={handleAddCustomActivity}
                    onToggleChecklist={handleToggleChecklist}
                    onAddChecklist={handleAddChecklist}
                    onDeleteChecklist={handleDeleteChecklist}
                />
            )}

            {/* Modal Tạo/Sửa thông tin lịch trình */}
            <CreateItineraryModal
                isOpen={isCreateModalOpen}
                onClose={() => {
                    setIsCreateModalOpen(false);
                    setEditingItinerary(null);
                }}
                onSave={handleSaveItineraryModal}
                initialData={editingItinerary}
            />

            {/* Modal Chi tiết địa điểm */}
            <PlaceDetailModal
                isOpen={!!inspectingPlace}
                place={inspectingPlace}
                onClose={() => setInspectingPlace(null)}
                daysList={daysList}
                activeDayId={activeDay}
                onAddPlace={handleAddPlaceToItinerary}
            />

            {/* Modal Xác nhận lưu khi bấm Quay lại */}
            <ConfirmLeaveModal
                isOpen={isConfirmLeaveOpen}
                onClose={() => setIsConfirmLeaveOpen(false)}
                onSaveAndLeave={handleConfirmSaveAndLeave}
                onDiscardAndLeave={handleConfirmDiscardAndLeave}
            />
        </div>
    );
}
