'use client';

import React from 'react';
import ItineraryHeader from './ItineraryHeader';
import DayTabsNav from './DayTabsNav';
import ItineraryCard from './ItineraryCard';
import DayColumnEmpty from './DayColumnEmpty';
import QuickSearchSidebar from './QuickSearchSidebar';

export default function ItineraryEditorView({
    currentItinerary,
    daysList = [],
    activeDay,
    setActiveDay,
    activeDayPlaces = [],
    quickSearchPlacesData = [],
    onBackToList,
    onEditInfo,
    onDeletePlace,
    onUpdateTime,
    onQuickAdd,
    onSelectPlace
}) {
    if (!currentItinerary) return null;

    return (
        <div className="w-full bg-slate-50/50 p-4 sm:p-6 rounded-2xl min-h-screen space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Itinerary Details & Days */}
                <div className="lg:col-span-2 space-y-6">
                    <ItineraryHeader
                        title={currentItinerary.title}
                        startDate={currentItinerary.startDate}
                        endDate={currentItinerary.endDate}
                        onBackToList={onBackToList}
                        onEditInfo={onEditInfo}
                        onAddLocation={() => {
                            // Focus or scroll to quick search sidebar
                        }}
                    />

                    {/* Day Navigation Tabs */}
                    <DayTabsNav
                        days={daysList}
                        activeDay={activeDay}
                        onSelectDay={setActiveDay}
                    />

                    {/* Active Day Places Grid */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold text-slate-800 text-base">
                                Danh sách địa điểm {daysList.find(d => d.id === activeDay)?.title || `Ngày ${activeDay}`}
                            </h3>
                            <span className="text-xs text-slate-500 font-medium">
                                {activeDayPlaces.length} địa điểm
                            </span>
                        </div>

                        {activeDayPlaces.length === 0 ? (
                            <DayColumnEmpty
                                onExplore={() => {
                                    // Scroll to quick search
                                }}
                            />
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {activeDayPlaces.map((item) => (
                                    <ItineraryCard
                                        key={item.id}
                                        item={item}
                                        onDelete={(id) => onDeletePlace(activeDay, id)}
                                        onUpdateTime={(id, newTime) => onUpdateTime(activeDay, id, newTime)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Quick Search Sidebar */}
                <div>
                    <QuickSearchSidebar
                        places={quickSearchPlacesData}
                        onAddPlace={onQuickAdd}
                        onSelectPlace={onSelectPlace}
                    />
                </div>
            </div>
        </div>
    );
}
