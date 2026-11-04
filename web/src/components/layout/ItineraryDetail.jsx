'use client';

import React, { useState } from 'react';
import ItineraryListView from '../comon/itinerary/ItineraryListView';
import ItineraryEditorView from '../comon/itinerary/ItineraryEditorView';
import CreateItineraryModal from '../comon/itinerary/CreateItineraryModal';
import PlaceDetailModal from '../comon/place/PlaceDetailModal';

import { sampleItineraries, quickSearchPlacesData } from '@/database/data';

// Utility helper to calculate day tabs list from start & end dates
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
            date: d.toISOString().split('T')[0]
        });
    }
    return result;
};

export default function ItineraryDetail() {
    const [itineraries, setItineraries] = useState(sampleItineraries);
    const [selectedItineraryId, setSelectedItineraryId] = useState(null);
    const [activeDay, setActiveDay] = useState(1);

    // Modals
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingItinerary, setEditingItinerary] = useState(null);
    const [inspectingPlace, setInspectingPlace] = useState(null);

    // Current selected itinerary
    const currentItinerary = itineraries.find(it => it.id === selectedItineraryId);

    // Create or Edit Itinerary submit
    const handleSaveItinerary = (data) => {
        if (editingItinerary) {
            // Update existing
            setItineraries(prev => prev.map(it => {
                if (it.id === editingItinerary.id) {
                    return {
                        ...it,
                        ...data,
                    };
                }
                return it;
            }));
            setEditingItinerary(null);
        } else {
            // Create new
            const newId = Date.now();
            const newItinerary = {
                id: newId,
                title: data.title,
                startDate: data.startDate,
                endDate: data.endDate,
                description: data.description || 'Lịch trình du lịch mới tạo.',
                coverImg: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
                days: { 1: [] }
            };
            setItineraries(prev => [newItinerary, ...prev]);
            setSelectedItineraryId(newId);
            setActiveDay(1);
        }
    };

    // Delete Itinerary from list
    const handleDeleteItinerary = (id, e) => {
        e.stopPropagation();
        if (confirm('Bạn có chắc chắn muốn xóa lịch trình này?')) {
            setItineraries(prev => prev.filter(it => it.id !== id));
            if (selectedItineraryId === id) {
                setSelectedItineraryId(null);
            }
        }
    };

    // Delete place from active day
    const handleDeletePlace = (dayId, placeId) => {
        if (!currentItinerary) return;
        setItineraries(prev => prev.map(it => {
            if (it.id === currentItinerary.id) {
                const dayPlaces = it.days[dayId] || [];
                return {
                    ...it,
                    days: {
                        ...it.days,
                        [dayId]: dayPlaces.filter(p => p.id !== placeId)
                    }
                };
            }
            return it;
        }));
    };

    // Update start time for place in active day
    const handleUpdateTime = (dayId, placeId, newTime) => {
        if (!currentItinerary) return;
        setItineraries(prev => prev.map(it => {
            if (it.id === currentItinerary.id) {
                const dayPlaces = it.days[dayId] || [];
                return {
                    ...it,
                    days: {
                        ...it.days,
                        [dayId]: dayPlaces.map(p => p.id === placeId ? { ...p, time: newTime } : p)
                    }
                };
            }
            return it;
        }));
    };

    // Add place to specific day with start time
    const handleAddPlaceToItinerary = (place, targetDayId, startTime = '08:00') => {
        if (!currentItinerary) return;
        const newPlaceItem = {
            id: Date.now(),
            placeId: place.id,
            name: place.name,
            location: place.address || 'Đà Nẵng',
            time: startTime,
            tag: place.category || 'Địa điểm',
            img: place.img || '',
        };

        setItineraries(prev => prev.map(it => {
            if (it.id === currentItinerary.id) {
                const currentDayPlaces = it.days[targetDayId] || [];
                return {
                    ...it,
                    days: {
                        ...it.days,
                        [targetDayId]: [...currentDayPlaces, newPlaceItem]
                    }
                };
            }
            return it;
        }));

        setActiveDay(targetDayId);
    };

    // Quick add from sidebar directly to current active day
    const handleQuickAdd = (place) => {
        handleAddPlaceToItinerary(place, activeDay, '08:00');
    };

    const daysList = currentItinerary
        ? calculateDaysList(currentItinerary.startDate, currentItinerary.endDate, currentItinerary.days)
        : [];
    const activeDayPlaces = currentItinerary ? (currentItinerary.days[activeDay] || []) : [];

    return (
        <>
            {/* View 1: List of Itineraries */}
            {!currentItinerary ? (
                <ItineraryListView
                    itineraries={itineraries}
                    onSelectItinerary={(id) => {
                        setSelectedItineraryId(id);
                        setActiveDay(1);
                    }}
                    onCreateClick={() => {
                        setEditingItinerary(null);
                        setIsCreateModalOpen(true);
                    }}
                    onDeleteItinerary={handleDeleteItinerary}
                    calculateDaysList={calculateDaysList}
                />
            ) : (
                /* View 2: Itinerary Detail & Editor */
                <ItineraryEditorView
                    currentItinerary={currentItinerary}
                    daysList={daysList}
                    activeDay={activeDay}
                    setActiveDay={setActiveDay}
                    activeDayPlaces={activeDayPlaces}
                    quickSearchPlacesData={quickSearchPlacesData}
                    onBackToList={() => setSelectedItineraryId(null)}
                    onEditInfo={() => {
                        setEditingItinerary(currentItinerary);
                        setIsCreateModalOpen(true);
                    }}
                    onDeletePlace={handleDeletePlace}
                    onUpdateTime={handleUpdateTime}
                    onQuickAdd={handleQuickAdd}
                    onSelectPlace={(place) => setInspectingPlace(place)}
                />
            )}

            {/* Modal Edit/Create Itinerary */}
            <CreateItineraryModal
                isOpen={isCreateModalOpen}
                onClose={() => {
                    setIsCreateModalOpen(false);
                    setEditingItinerary(null);
                }}
                onSave={handleSaveItinerary}
                initialData={editingItinerary}
            />

            {/* Modal Detail Place */}
            <PlaceDetailModal
                isOpen={!!inspectingPlace}
                place={inspectingPlace}
                onClose={() => setInspectingPlace(null)}
                daysList={daysList}
                activeDayId={activeDay}
                onAddPlace={handleAddPlaceToItinerary}
            />
        </>
    );
}