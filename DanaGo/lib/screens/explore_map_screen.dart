import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:smarttrip/models/map_place_item.dart';
import 'package:smarttrip/models/search_filter_model.dart';
import 'package:smarttrip/models/search_result_item.dart';
import 'package:smarttrip/screens/detail_place_screen.dart';
import 'package:smarttrip/theme/app_colors.dart';
import 'package:smarttrip/widgets/home/custom_bottom_nav_bar.dart';
import 'package:smarttrip/widgets/search/search_filter_bottom_sheet.dart';
import 'package:smarttrip/widgets/explore_map/map_pin_marker.dart';
import 'package:smarttrip/widgets/explore_map/map_search_header.dart';
import 'package:smarttrip/widgets/explore_map/map_preview_sheet.dart';
import 'package:smarttrip/widgets/explore_map/map_draggable_sheet.dart';
import 'package:geolocator/geolocator.dart';

class ExploreMapScreen extends StatefulWidget {
  const ExploreMapScreen({super.key});

  @override
  State<ExploreMapScreen> createState() => _ExploreMapScreenState();
}

class _ExploreMapScreenState extends State<ExploreMapScreen> {
  int _currentIndex = 1;
  final TextEditingController _searchCtrl = TextEditingController();
  final MapController _mapController = MapController();
  SearchFilterModel _currentFilter = const SearchFilterModel();
  final Set<String> _activeChips = {'Gần tôi', 'Đang mở cửa'};
  SearchResultItem? _selectedPlace;
  LatLng? _myLocation;
  bool _isLoadingLocation = false;

  // Hàm xin quyền và lấy tọa độ GPS thực tế
  Future<void> _getCurrentLocation() async {
    setState(() => _isLoadingLocation = true); // Bật trạng thái đang lấy GPS

    try {
      // 1. Kiểm tra xem điện thoại có đang bật định vị (GPS) không
      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Vui lòng bật định vị GPS trên điện thoại!'),
            ),
          );
        }
        return;
      }

      // 2. Kiểm tra quyền truy cập vị trí
      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission =
            await Geolocator.requestPermission(); // Hiện hộp thoại xin quyền
        if (permission == LocationPermission.denied) {
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text('Ứng dụng bị từ chối quyền truy cập vị trí'),
              ),
            );
          }
          return;
        }
      }

      if (permission == LocationPermission.deniedForever) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text(
                'Quyền vị trí bị chặn vĩnh viễn, hãy bật trong Cài đặt',
              ),
            ),
          );
        }
        return;
      }

      // 3. Lấy vị trí thực tế với độ chính xác cao
      Position position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
      );

      // 4. Lưu lại tọa độ và cho bản đồ bay đến vị trí người dùng
      final userLatLng = LatLng(position.latitude, position.longitude);
      setState(() {
        _myLocation = userLatLng;
      });

      // Camera bản đồ bay mượt mà về vị trí của bạn
      _mapController.move(userLatLng, 15.5);
    } catch (e) {
      debugPrint('Lỗi GPS: $e');
    } finally {
      if (mounted) {
        setState(() => _isLoadingLocation = false); // Tắt trạng thái loading
      }
    }
  }

  final List<MapPlaceItem> _mapPlaces = [
    MapPlaceItem(
      location: const LatLng(16.0825, 108.2478),
      item: const SearchResultItem(
        id: 'place_02',
        title: 'Hải Sản Bé Mặn',
        imageUrl:
            'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500',
        badge: 'Nhà hàng địa phương',
        badgeColor: Color(0xFFE0F2F1),
        address: 'Lô 11 Võ Nguyên Giáp, Mân Thái',
        rating: 4.6,
        reviewCount: 128,
        distance: '0.3 km',
        tagLabel: 'Đang mở cửa',
        tagColor: AppColors.primary,
        isFavorite: false,
      ),
    ),
    MapPlaceItem(
      location: const LatLng(16.0650, 108.2320),
      item: const SearchResultItem(
        id: 'place_03',
        title: 'The Light Cafe',
        imageUrl:
            'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=500',
        badge: 'Quán Cafe',
        badgeColor: Color(0xFFE0F2F1),
        address: 'Trần Hưng Đạo, Sơn Trà',
        rating: 4.9,
        reviewCount: 84,
        distance: '0.8 km',
        tagLabel: 'Đang mở cửa',
        tagColor: AppColors.primary,
        isFavorite: false,
      ),
    ),
    MapPlaceItem(
      location: const LatLng(16.0594, 108.2486),
      item: const SearchResultItem(
        id: 'place_01',
        title: 'Biển Mỹ Khê',
        imageUrl:
            'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500',
        badge: 'Biển',
        badgeColor: Color(0xFFE0F2F1),
        address: 'Võ Nguyên Giáp, Phước Mỹ',
        rating: 4.8,
        reviewCount: 1200,
        distance: '1.5 km',
        tagLabel: 'Miễn phí',
        tagColor: AppColors.primary,
        isFavorite: true,
      ),
    ),
  ];

  @override
  void dispose() {
    _searchCtrl.dispose();
    _mapController.dispose();
    super.dispose();
  }

  List<MapPlaceItem> get _filteredPlaces {
    return _mapPlaces.where((mapPlace) {
      final item = mapPlace.item;
      if (_activeChips.contains('Đánh giá 4.5+') && item.rating < 4.5) {
        return false;
      }
      return true;
    }).toList();
  }

  void _onMarkerTap(MapPlaceItem mapPlace) {
    setState(() => _selectedPlace = mapPlace.item);
    _mapController.move(mapPlace.location, 15.0);
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (ctx) => MapPreviewSheet(
        item: mapPlace.item,
        onViewDetail: () {
          Navigator.pop(ctx);
          _navigateToDetail(mapPlace.item);
        },
      ),
    );
  }

  void _navigateToDetail(SearchResultItem item) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (ctx) => DetailPlaceScreen(item: item.toDestinationItem()),
      ),
    );
  }

  @override
  void initState() {
    super.initState();
    _getCurrentLocation();
  }

  void _openFilterBottomSheet() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => SearchFilterBottomSheet(
        initialFilter: _currentFilter,
        onApply: (newFilter) => setState(() => _currentFilter = newFilter),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: Stack(
        children: [
          // Nút bấm định vị nổi trên bản đồ
          Positioned.fill(
            child: FlutterMap(
              mapController: _mapController,
              options: const MapOptions(
                initialCenter: LatLng(16.0680, 108.2430),
                initialZoom: 13.8,
                minZoom: 10.0,
                maxZoom: 18.0,
              ),
              children: [
                TileLayer(
                  urlTemplate:
                      'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
                  subdomains: const ['a', 'b'],
                  userAgentPackageName: 'com.smarttrip.app',
                ),
                MarkerLayer(
                  markers: [
                    if (_myLocation != null)
                      Marker(
                        point: _myLocation!,
                        width: 44,
                        height: 44,
                        child: Center(
                          child: Container(
                            width: 22,
                            height: 22,
                            decoration: BoxDecoration(
                              color: const Color(
                                0xFF0284C7,
                              ), // Xanh dương GPS chuẩn Google Maps
                              shape: BoxShape.circle,
                              border: Border.all(
                                color: Colors.white,
                                width: 3,
                              ), // Viền trắng nổi
                              boxShadow: [
                                BoxShadow(
                                  color: const Color(
                                    0xFF0284C7,
                                  ).withOpacity(0.4),
                                  blurRadius: 10,
                                  spreadRadius:
                                      4, // Vòng hào quang phát sáng lan tỏa
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                    ..._filteredPlaces.map((mapPlace) {
                      final isSelected = _selectedPlace?.id == mapPlace.item.id;
                      return Marker(
                        point: mapPlace.location,
                        width: 130,
                        height: 55,
                        child: GestureDetector(
                          onTap: () => _onMarkerTap(mapPlace),
                          child: MapPinMarker(
                            label: mapPlace.item.title,
                            isSelected: isSelected,
                          ),
                        ),
                      );
                    }).toList(),
                  ],
                ),
              ],
            ),
          ),
          Positioned(
            right: 16,
            bottom: 220, // Nằm ngay trên mép bảng danh sách kéo
            child: GestureDetector(
              onTap:
                  _getCurrentLocation, // Bấm vào để dò lại vị trí và kéo camera về
              child: Container(
                width: 46,
                height: 46,
                decoration: BoxDecoration(
                  color: Colors.white,
                  shape: BoxShape.circle,
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.12),
                      blurRadius: 10,
                      offset: const Offset(0, 3),
                    ),
                  ],
                ),
                child: _isLoadingLocation
                    ? const Padding(
                        padding: EdgeInsets.all(12),
                        child: CircularProgressIndicator(strokeWidth: 2.5),
                      )
                    : const Icon(
                        Icons.my_location_rounded,
                        color: AppColors.primary,
                        size: 24,
                      ),
              ),
            ),
          ),
          Positioned(
            top: 0,
            left: 0,
            right: 0,
            child: MapSearchHeader(
              controller: _searchCtrl,
              onFilterTap: _openFilterBottomSheet,
              activeChips: _activeChips,
              onChipToggle: (label) {
                setState(() {
                  _activeChips.contains(label)
                      ? _activeChips.remove(label)
                      : _activeChips.add(label);
                });
              },
            ),
          ),
          MapDraggableSheet(
            places: _filteredPlaces,
            onPlaceTap: _navigateToDetail,
          ),
        ],
      ),
    );
  }
}
