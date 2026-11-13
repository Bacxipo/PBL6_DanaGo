import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:smarttrip/models/map_place_item.dart';
import 'package:smarttrip/models/search_filter_model.dart';
import 'package:smarttrip/models/search_result_item.dart';
import 'package:smarttrip/screens/detail_place_screen.dart';
import 'package:smarttrip/theme/app_colors.dart';
import 'package:smarttrip/widgets/search/search_filter_bottom_sheet.dart';
import 'package:smarttrip/widgets/explore_map/map_pin_marker.dart';
import 'package:smarttrip/widgets/explore_map/map_search_header.dart';
import 'package:smarttrip/widgets/explore_map/map_preview_sheet.dart';
import 'package:smarttrip/widgets/explore_map/map_draggable_sheet.dart';
import 'package:smarttrip/services/destination_service.dart';
import 'package:geolocator/geolocator.dart';

class ExploreMapScreen extends StatefulWidget {
  const ExploreMapScreen({super.key});

  @override
  State<ExploreMapScreen> createState() => _ExploreMapScreenState();
}

class _ExploreMapScreenState extends State<ExploreMapScreen> {
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

  List<MapPlaceItem> _mapPlaces = [];
  Future<void> _loadMapPlaces() async {
    final destinations = await DestinationService.instance.getAll();
    final items = <MapPlaceItem>[];
    for (final d in destinations) {
      final lat = d.latitude ?? 16.0614;
      final lng = d.longitude ?? 108.2272;
      items.add(
        MapPlaceItem(
          location: LatLng(lat, lng),
          item: SearchResultItem.fromDestination(d),
        ),
      );
    }
    if (mounted) {
      setState(() {
        _mapPlaces = items;
      });
    }
  }

  @override
  void dispose() {
    _searchCtrl.dispose();
    _mapController.dispose();
    super.dispose();
  }

  bool _matchesSearchQuery(SearchResultItem item, String query) {
    if (query.isEmpty) return true;
    final title = item.title.toLowerCase();
    final addr = item.address.toLowerCase();
    final badge = item.badge.toLowerCase();
    final desc = (item.originalDestination?.description ?? '').toLowerCase();
    if (title.contains(query) ||
        addr.contains(query) ||
        badge.contains(query) ||
        desc.contains(query)) {
      return true;
    }
    if ((query.contains('quán ăn') ||
            query.contains('nhà hàng') ||
            query.contains('đồ ăn') ||
            query.contains('ăn uống')) &&
        badge.contains('ẩm thực')) {
      return true;
    }
    if ((query.contains('cafe') ||
            query.contains('coffee') ||
            query.contains('quán nước') ||
            query.contains('trà')) &&
        badge.contains('cà phê')) {
      return true;
    }
    if ((query.contains('khách sạn') ||
            query.contains('homestay') ||
            query.contains('resort') ||
            query.contains('nhà nghỉ')) &&
        badge.contains('lưu trú')) {
      return true;
    }
    return false;
  }

  bool _matchesCategoryFilter(String badge, String filterCategory) {
    if (filterCategory == 'Tất cả') return true;
    final b = badge.toLowerCase();
    switch (filterCategory) {
      case 'Thiên nhiên':
        return b.contains('thiên nhiên') ||
            b.contains('thắng cảnh') ||
            b.contains('danh lam') ||
            b.contains('bãi biển');
      case 'Ăn uống':
        return b.contains('ăn uống') ||
            b.contains('ẩm thực') ||
            b.contains('đặc sản') ||
            b.contains('cà phê') ||
            b.contains('tiệm trà');
      case 'Văn hóa':
        return b.contains('văn hóa') ||
            b.contains('di tích') ||
            b.contains('lịch sử') ||
            b.contains('lễ hội');
      case 'Vui chơi':
        return b.contains('vui chơi') ||
            b.contains('giải trí') ||
            b.contains('mua sắm') ||
            b.contains('chợ đêm');
      default:
        return b.contains(filterCategory.toLowerCase());
    }
  }

  List<MapPlaceItem> get _filteredPlaces {
    final query = _searchCtrl.text.trim().toLowerCase();
    return _mapPlaces.where((mapPlace) {
      final item = mapPlace.item;
      if (!_matchesSearchQuery(item, query)) {
        return false;
      }
      if (!_matchesCategoryFilter(item.badge, _currentFilter.category)) {
        return false;
      }
      if (_currentFilter.area != 'Tất cả quận/huyện' &&
          !item.address.toLowerCase().contains(
            _currentFilter.area.toLowerCase(),
          )) {
        return false;
      }
      if (_currentFilter.minRating != 'any') {
        final minRate = double.tryParse(_currentFilter.minRating) ?? 0.0;
        if (item.rating < minRate) return false;
      }
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
    _loadMapPlaces();
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
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      body: Stack(
        children: [
          // Nút bấm định vị nổi trên bản đồ
          Positioned.fill(
            child: FlutterMap(
              mapController: _mapController,
              options: MapOptions(
                initialCenter: const LatLng(16.0680, 108.2430),
                initialZoom: 13.8,
                minZoom: 10.0,
                maxZoom: 18.0,
                backgroundColor: isDark
                    ? const Color(0xFF0F172A)
                    : const Color(0xFFE2E8F0),
              ),
              children: [
                TileLayer(
                  urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                  userAgentPackageName: 'com.smarttrip.app',
                  tileBuilder: isDark
                      ? (context, tileWidget, tile) => ColorFiltered(
                          colorFilter: const ColorFilter.matrix(<double>[
                            -0.15, -0.45, -0.05, 0, 165, // R
                            -0.15, -0.45, -0.05, 0, 175, // G
                            -0.15, -0.45, -0.05, 0, 195, // B
                            0.00, 0.00, 0.00, 1, 0, // A
                          ]),
                          child: tileWidget,
                        )
                      : null,
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
                              color: AppColors
                                  .info, // Xanh dương GPS chuẩn Google Maps
                              shape: BoxShape.circle,
                              border: Border.all(
                                color: Colors.white,
                                width: 3,
                              ), // Viền trắng nổi
                              boxShadow: [
                                BoxShadow(
                                  color: AppColors.info.withValues(alpha: 0.4),
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
                  color: Theme.of(context).cardColor,
                  shape: BoxShape.circle,
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(
                        alpha: isDark ? 0.3 : 0.12,
                      ),
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
              onSearchChanged: (_) => setState(() {}),
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
