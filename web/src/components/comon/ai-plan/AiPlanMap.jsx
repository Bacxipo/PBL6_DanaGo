'use client';

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

// Màu sắc cho các ngày
const DAY_COLORS = ['#006971', '#d97706', '#7c3aed', '#db2777', '#2563eb', '#059669', '#dc2626'];

export default function AiPlanMap({
    plan = null,
    selectedPlaces = [],
    selectedLodgings = [],
    activeDay = null, // null = all days
    onMarkerClick = null,
}) {
    const mapContainerRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markersLayerRef = useRef(null);
    const routesLayerRef = useRef(null);

    // Khởi tạo bản đồ Leaflet
    useEffect(() => {
        if (!mapContainerRef.current) return;

        if (!mapInstanceRef.current) {
            // Tọa độ trung tâm Đà Nẵng
            const map = L.map(mapContainerRef.current, {
                center: [16.0544, 108.2022],
                zoom: 11,
                zoomControl: true,
            });

            // Sử dụng CartoDB Voyager tiles (màu sắc trong sáng, nhẹ nhàng giống Mapbox)
            L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
                maxZoom: 19,
                subdomains: 'abcd',
            }).addTo(map);

            const markersLayer = L.layerGroup().addTo(map);
            const routesLayer = L.layerGroup().addTo(map);

            mapInstanceRef.current = map;
            markersLayerRef.current = markersLayer;
            routesLayerRef.current = routesLayer;
        }

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, []);

    // Cập nhật Markers và Routes khi plan, selectedPlaces hoặc selectedLodgings thay đổi
    useEffect(() => {
        const map = mapInstanceRef.current;
        const markersLayer = markersLayerRef.current;
        const routesLayer = routesLayerRef.current;
        if (!map || !markersLayer || !routesLayer) return;

        markersLayer.clearLayers();
        routesLayer.clearLayers();

        const allLatLngs = [];

        // HÀM TẠO ICON MARKER TÙY BIẾN
        const createMarkerIcon = (label, bgHex, iconChar = '') => {
            return L.divIcon({
                className: 'custom-ai-map-marker',
                html: `
                    <div style="background-color: ${bgHex};" class="w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white text-xs font-bold transition-transform hover:scale-110 cursor-pointer">
                        ${iconChar || label}
                    </div>
                `,
                iconSize: [32, 32],
                iconAnchor: [16, 16],
                popupAnchor: [0, -16],
            });
        };

        // 1. NẾU ĐÃ CÓ KẾT QUẢ LỊCH TRÌNH TỪ AI (PLAN)
        if (plan && plan.days && plan.days.length > 0) {
            const daysToRender = activeDay
                ? plan.days.filter((d) => d.day === activeDay)
                : plan.days;

            daysToRender.forEach((d) => {
                const dayColor = DAY_COLORS[(d.day - 1) % DAY_COLORS.length];
                const dayPoints = [];

                // Vẽ các điểm dừng trong ngày
                (d.items || []).forEach((item, idx) => {
                    if (typeof item.latitude === 'number' && typeof item.longitude === 'number') {
                        const latLng = [item.latitude, item.longitude];
                        allLatLngs.push(latLng);
                        dayPoints.push(latLng);

                        let iconChar = `${idx + 1}`;
                        if (item.type === 'breakfast' || item.type === 'lunch' || item.type === 'dinner') {
                            iconChar = '🍽️';
                        } else if (item.type === 'checkin' || item.type === 'checkout' || item.type === 'return') {
                            iconChar = '🏨';
                        }

                        const marker = L.marker(latLng, {
                            icon: createMarkerIcon(idx + 1, dayColor, iconChar),
                        });

                        const popupHtml = `
                            <div class="p-1 font-sans text-xs space-y-1 min-w-[180px]">
                                <div class="flex items-center justify-between gap-2 border-b pb-1">
                                    <span style="color: ${dayColor};" class="font-bold uppercase tracking-wider">Ngày ${d.day} • ${item.start || ''}</span>
                                    <span class="px-1.5 py-0.5 rounded text-2xs bg-gray-100 text-gray-700 font-semibold">${item.label || item.type}</span>
                                </div>
                                <div class="font-bold text-gray-900 text-sm leading-tight">${item.name}</div>
                                ${item.district ? `<div class="text-gray-500 text-2xs">📍 ${item.district}, ${item.region || ''}</div>` : ''}
                                ${item.price_est > 0 ? `<div class="text-amber-600 font-semibold text-2xs">💰 ~${item.price_est.toLocaleString('vi-VN')} đ</div>` : ''}
                            </div>
                        `;

                        marker.bindPopup(popupHtml);
                        markersLayer.addLayer(marker);
                    }
                });

                // Vẽ polyline nối các chặng trong ngày
                if (dayPoints.length > 1) {
                    const polyline = L.polyline(dayPoints, {
                        color: dayColor,
                        weight: 4,
                        opacity: 0.75,
                        dashArray: '6, 8',
                    });
                    routesLayer.addLayer(polyline);
                }
            });
        } else {
            // 2. KHI CHƯA CÓ LỊCH TRÌNH AI: HIỂN THỊ CÁC ĐỊA ĐIỂM VÀ NƠI NGHỈ NGƯỜI DÙNG ĐÃ CHỌN
            selectedPlaces.forEach((p, idx) => {
                if (typeof p.latitude === 'number' && typeof p.longitude === 'number') {
                    const latLng = [p.latitude, p.longitude];
                    allLatLngs.push(latLng);

                    const marker = L.marker(latLng, {
                        icon: createMarkerIcon(idx + 1, '#006971', '📍'),
                    });

                    marker.bindPopup(`
                        <div class="p-1 font-sans text-xs space-y-1 min-w-[160px]">
                            <div class="text-[#006971] font-bold">Điểm tham quan đã chọn</div>
                            <div class="font-bold text-gray-900 text-sm">${p.name}</div>
                            <div class="text-gray-500 text-2xs">📍 ${p.district || ''}</div>
                        </div>
                    `);
                    markersLayer.addLayer(marker);
                }
            });

            selectedLodgings.forEach((lo) => {
                if (typeof lo.latitude === 'number' && typeof lo.longitude === 'number') {
                    const latLng = [lo.latitude, lo.longitude];
                    allLatLngs.push(latLng);

                    const marker = L.marker(latLng, {
                        icon: createMarkerIcon('', '#7c3aed', '🏨'),
                    });

                    marker.bindPopup(`
                        <div class="p-1 font-sans text-xs space-y-1 min-w-[160px]">
                            <div class="text-purple-600 font-bold">Nơi nghỉ đã chọn</div>
                            <div class="font-bold text-gray-900 text-sm">${lo.name}</div>
                            <div class="text-amber-600 font-semibold text-2xs">💰 ${Number(lo.price_per_night || 0).toLocaleString('vi-VN')} đ/đêm</div>
                        </div>
                    `);
                    markersLayer.addLayer(marker);
                }
            });
        }

        // Tự động căn chỉnh khung hình vừa vặn tất cả các điểm
        if (allLatLngs.length > 0) {
            const bounds = L.latLngBounds(allLatLngs);
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
        } else {
            map.setView([16.0544, 108.2022], 11);
        }
    }, [plan, selectedPlaces, selectedLodgings, activeDay]);

    return (
        <div className="relative w-full h-full min-h-[500px] lg:min-h-full rounded-2xl overflow-hidden shadow-inner border border-gray-200">
            {/* Vùng chứa bản đồ */}
            <div ref={mapContainerRef} className="w-full h-full min-h-[500px]" style={{ zIndex: 1 }} />

            {/* Chú giải góc dưới bản đồ (Map Legend) */}
            <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-md px-3 py-2 rounded-xl shadow-md border border-gray-200 text-2xs font-sans text-gray-700 space-y-1 pointer-events-auto" style={{ zIndex: 400 }}>
                <div className="font-bold text-gray-900 border-b pb-0.5 mb-1">Chú thích bản đồ</div>
                <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#006971]"></span>
                    <span>Điểm tham quan / Trải nghiệm</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                    <span>Ẩm thực (Sáng/Trưa/Tối)</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span>
                    <span>Nơi nghỉ / Khách sạn / Villa</span>
                </div>
            </div>
        </div>
    );
}

