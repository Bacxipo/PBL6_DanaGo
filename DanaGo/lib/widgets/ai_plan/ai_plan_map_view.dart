import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:smarttrip/models/ai_plan_model.dart';
import 'package:smarttrip/models/destination_item.dart';
import 'package:smarttrip/theme/app_colors.dart';

class AiPlanMapView extends StatefulWidget {
  final AiPlanResult? plan;
  final List<DestinationItem> selectedPlaces;
  final AiPlanLodging? selectedLodging;
  final int? activeDay;
  final ValueChanged<int?>? onActiveDayChange;

  const AiPlanMapView({
    super.key,
    this.plan,
    this.selectedPlaces = const [],
    this.selectedLodging,
    this.activeDay,
    this.onActiveDayChange,
  });

  @override
  State<AiPlanMapView> createState() => _AiPlanMapViewState();
}

class _AiPlanMapViewState extends State<AiPlanMapView> {
  final MapController _mapController = MapController();
  int _internalActiveDay = 0; // 0 = all days
  AiPlanItem? _selectedItem;
  DestinationItem? _selectedPrePlace;
  AiPlanLodging? _selectedPreLodging;

  static const List<Color> _dayColors = [
    Color(0xFF006971), // Teal
    Color(0xFFD97706), // Amber
    Color(0xFF7C3AED), // Purple
    Color(0xFFDB2777), // Pink
    Color(0xFF2563EB), // Blue
    Color(0xFF059669), // Emerald
    Color(0xFFDC2626), // Red
  ];

  int get _currentActiveDay => widget.activeDay ?? _internalActiveDay;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _fitBounds();
    });
  }

  @override
  void didUpdateWidget(covariant AiPlanMapView oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.plan != oldWidget.plan ||
        widget.selectedPlaces.length != oldWidget.selectedPlaces.length ||
        widget.selectedLodging != oldWidget.selectedLodging ||
        widget.activeDay != oldWidget.activeDay) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        _fitBounds();
      });
    }
  }

  void _onDaySelect(int day) {
    setState(() {
      _internalActiveDay = day;
      _selectedItem = null;
    });
    if (widget.onActiveDayChange != null) {
      widget.onActiveDayChange!(day == 0 ? null : day);
    }
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _fitBounds();
    });
  }

  List<LatLng> _collectAllPoints() {
    final points = <LatLng>[];
    if (widget.plan != null && widget.plan!.days.isNotEmpty) {
      final daysToInclude = _currentActiveDay == 0
          ? widget.plan!.days
          : widget.plan!.days.where((d) => d.day == _currentActiveDay);

      for (var d in daysToInclude) {
        for (var it in d.items) {
          if (it.latitude != null && it.longitude != null) {
            points.add(LatLng(it.latitude!, it.longitude!));
          }
        }
      }
    } else {
      for (var p in widget.selectedPlaces) {
        if (p.latitude != null && p.longitude != null) {
          points.add(LatLng(p.latitude!, p.longitude!));
        }
      }
      if (widget.selectedLodging != null &&
          widget.selectedLodging!.latitude != null &&
          widget.selectedLodging!.longitude != null) {
        points.add(LatLng(
          widget.selectedLodging!.latitude!,
          widget.selectedLodging!.longitude!,
        ));
      }
    }
    return points;
  }

  void _fitBounds() {
    final points = _collectAllPoints();
    if (points.isEmpty) {
      _mapController.move(const LatLng(16.0544, 108.2022), 11.5);
      return;
    }
    if (points.length == 1) {
      _mapController.move(points.first, 14.5);
      return;
    }

    double minLat = points.first.latitude;
    double maxLat = points.first.latitude;
    double minLng = points.first.longitude;
    double maxLng = points.first.longitude;

    for (var pt in points) {
      if (pt.latitude < minLat) minLat = pt.latitude;
      if (pt.latitude > maxLat) maxLat = pt.latitude;
      if (pt.longitude < minLng) minLng = pt.longitude;
      if (pt.longitude > maxLng) maxLng = pt.longitude;
    }

    final bounds = LatLngBounds(
      LatLng(minLat, minLng),
      LatLng(maxLat, maxLng),
    );

    _mapController.fitCamera(
      CameraFit.bounds(
        bounds: bounds,
        padding: const EdgeInsets.all(40),
        maxZoom: 15.0,
      ),
    );
  }

  String _formatVND(int amount) {
    final str = amount.toString();
    final buffer = StringBuffer();
    int count = 0;
    for (int i = str.length - 1; i >= 0; i--) {
      buffer.write(str[i]);
      count++;
      if (count % 3 == 0 && i > 0) {
        buffer.write('.');
      }
    }
    return '${buffer.toString().split('').reversed.join()} đ';
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    final markers = <Marker>[];
    final polylines = <Polyline>[];

    if (widget.plan != null && widget.plan!.days.isNotEmpty) {
      final daysToRender = _currentActiveDay == 0
          ? widget.plan!.days
          : widget.plan!.days.where((d) => d.day == _currentActiveDay);

      for (var d in daysToRender) {
        final dayColor = _dayColors[(d.day - 1) % _dayColors.length];
        final dayPoints = <LatLng>[];

        for (int idx = 0; idx < d.items.length; idx++) {
          final it = d.items[idx];
          if (it.latitude == null || it.longitude == null) continue;

          final pt = LatLng(it.latitude!, it.longitude!);
          dayPoints.add(pt);

          String iconChar = '${idx + 1}';
          if (it.type == 'breakfast' || it.type == 'lunch' || it.type == 'dinner') {
            iconChar = '🍽️';
          } else if (it.type == 'checkin' || it.type == 'checkout' || it.type == 'return') {
            iconChar = '🏨';
          }

          final isSelected = _selectedItem?.id == it.id && _selectedItem?.name == it.name;

          markers.add(
            Marker(
              point: pt,
              width: isSelected ? 44 : 36,
              height: isSelected ? 44 : 36,
              child: GestureDetector(
                onTap: () {
                  setState(() {
                    _selectedItem = it;
                    _selectedPrePlace = null;
                    _selectedPreLodging = null;
                  });
                  _mapController.move(pt, 14.5);
                },
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  decoration: BoxDecoration(
                    color: dayColor,
                    shape: BoxShape.circle,
                    border: Border.all(
                      color: isSelected ? Colors.amberAccent : Colors.white,
                      width: isSelected ? 3 : 2,
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.25),
                        blurRadius: isSelected ? 8 : 4,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: Center(
                    child: Text(
                      iconChar,
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: (iconChar == '🍽️' || iconChar == '🏨') ? 14 : 12,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ),
              ),
            ),
          );
        }

        if (dayPoints.length > 1) {
          polylines.add(
            Polyline(
              points: dayPoints,
              color: dayColor.withValues(alpha: 0.8),
              strokeWidth: 4.0,
            ),
          );
        }
      }
    } else {
      // Khi chưa có plan: hiển thị selected places & selected lodging
      for (int i = 0; i < widget.selectedPlaces.length; i++) {
        final p = widget.selectedPlaces[i];
        if (p.latitude != null && p.longitude != null) {
          final pt = LatLng(p.latitude!, p.longitude!);
          final isSelected = _selectedPrePlace?.id == p.id;
          markers.add(
            Marker(
              point: pt,
              width: 36,
              height: 36,
              child: GestureDetector(
                onTap: () {
                  setState(() {
                    _selectedPrePlace = p;
                    _selectedPreLodging = null;
                    _selectedItem = null;
                  });
                  _mapController.move(pt, 14.5);
                },
                child: Container(
                  decoration: BoxDecoration(
                    color: AppColors.primary,
                    shape: BoxShape.circle,
                    border: Border.all(
                      color: isSelected ? Colors.amber : Colors.white,
                      width: 2.5,
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.2),
                        blurRadius: 4,
                      ),
                    ],
                  ),
                  child: Center(
                    child: Text(
                      '${i + 1}',
                      style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                        fontSize: 12,
                      ),
                    ),
                  ),
                ),
              ),
            ),
          );
        }
      }

      if (widget.selectedLodging != null &&
          widget.selectedLodging!.latitude != null &&
          widget.selectedLodging!.longitude != null) {
        final lo = widget.selectedLodging!;
        final pt = LatLng(lo.latitude!, lo.longitude!);
        final isSelected = _selectedPreLodging?.id == lo.id;
        markers.add(
          Marker(
            point: pt,
            width: 40,
            height: 40,
            child: GestureDetector(
              onTap: () {
                setState(() {
                  _selectedPreLodging = lo;
                  _selectedPrePlace = null;
                  _selectedItem = null;
                });
                _mapController.move(pt, 14.5);
              },
              child: Container(
                decoration: BoxDecoration(
                  color: Colors.purple,
                  shape: BoxShape.circle,
                  border: Border.all(
                    color: isSelected ? Colors.amber : Colors.white,
                    width: 2.5,
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.25),
                      blurRadius: 5,
                    ),
                  ],
                ),
                child: const Center(
                  child: Text('🏨', style: TextStyle(fontSize: 16)),
                ),
              ),
            ),
          ),
        );
      }
    }

    return Stack(
      children: [
        // Flutter Map
        ClipRRect(
          borderRadius: BorderRadius.circular(24),
          child: FlutterMap(
            mapController: _mapController,
            options: MapOptions(
              initialCenter: const LatLng(16.0544, 108.2022),
              initialZoom: 11.5,
              minZoom: 8.0,
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
              if (polylines.isNotEmpty) PolylineLayer(polylines: polylines),
              if (markers.isNotEmpty) MarkerLayer(markers: markers),
            ],
          ),
        ),

        // Day Filter Chips Row (if plan exists)
        if (widget.plan != null && widget.plan!.days.isNotEmpty)
          Positioned(
            top: 12,
            left: 12,
            right: 12,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
              decoration: BoxDecoration(
                color: (isDark ? Colors.grey[900] : Colors.white)!.withValues(alpha: 0.92),
                borderRadius: BorderRadius.circular(20),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.08),
                    blurRadius: 10,
                  ),
                ],
              ),
              child: SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: [
                    _buildDayChip(
                      label: 'Tất cả các ngày',
                      isSelected: _currentActiveDay == 0,
                      color: AppColors.primary,
                      onTap: () => _onDaySelect(0),
                    ),
                    const SizedBox(width: 6),
                    ...widget.plan!.days.map((d) {
                      final dayColor = _dayColors[(d.day - 1) % _dayColors.length];
                      return Padding(
                        padding: const EdgeInsets.only(right: 6),
                        child: _buildDayChip(
                          label: 'Ngày ${d.day}',
                          isSelected: _currentActiveDay == d.day,
                          color: dayColor,
                          onTap: () => _onDaySelect(d.day),
                        ),
                      );
                    }),
                  ],
                ),
              ),
            ),
          ),

        // Fit bounds button (Camera reset)
        Positioned(
          right: 12,
          bottom: (_selectedItem != null || _selectedPrePlace != null || _selectedPreLodging != null)
              ? 140
              : 16,
          child: FloatingActionButton.small(
            heroTag: 'map_fit_bounds_btn',
            backgroundColor: isDark ? Colors.grey[850] : Colors.white,
            foregroundColor: AppColors.primary,
            elevation: 3,
            onPressed: _fitBounds,
            child: const Icon(Icons.crop_free_rounded),
          ),
        ),

        // Bottom Selected Place Card
        if (_selectedItem != null)
          Positioned(
            left: 16,
            right: 16,
            bottom: 16,
            child: _buildItemCard(_selectedItem!, isDark),
          )
        else if (_selectedPrePlace != null)
          Positioned(
            left: 16,
            right: 16,
            bottom: 16,
            child: _buildPrePlaceCard(_selectedPrePlace!, isDark),
          )
        else if (_selectedPreLodging != null)
          Positioned(
            left: 16,
            right: 16,
            bottom: 16,
            child: _buildPreLodgingCard(_selectedPreLodging!, isDark),
          ),
      ],
    );
  }

  Widget _buildDayChip({
    required String label,
    required bool isSelected,
    required Color color,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 150),
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
        decoration: BoxDecoration(
          color: isSelected ? color : Colors.transparent,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: isSelected ? color : Colors.grey.withValues(alpha: 0.3),
            width: 1,
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 11,
            fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
            color: isSelected ? Colors.white : Colors.grey[700],
          ),
        ),
      ),
    );
  }

  Widget _buildItemCard(AiPlanItem item, bool isDark) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: isDark ? Colors.grey[850] : Colors.white,
        borderRadius: BorderRadius.circular(18),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.12),
            blurRadius: 16,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: AppColors.primary.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Center(
              child: Text(
                (item.type == 'breakfast' || item.type == 'lunch' || item.type == 'dinner')
                    ? '🍽️'
                    : (item.type == 'checkin' || item.type == 'checkout' || item.type == 'return')
                        ? '🏨'
                        : '📍',
                style: const TextStyle(fontSize: 20),
              ),
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Row(
                  children: [
                    if (item.start != null) ...[
                      Text(
                        '${item.start} - ${item.end ?? ''}',
                        style: const TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                          color: AppColors.primary,
                        ),
                      ),
                      const SizedBox(width: 6),
                    ],
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1.5),
                      decoration: BoxDecoration(
                        color: Colors.grey.withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Text(
                        item.label ?? item.type,
                        style: const TextStyle(fontSize: 9, fontWeight: FontWeight.w600),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 2),
                Text(
                  item.name,
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                if (item.district != null && item.district!.isNotEmpty)
                  Text(
                    '📍 ${item.district}',
                    style: TextStyle(fontSize: 11, color: Colors.grey[500]),
                  ),
                if (item.priceExcluded && item.description != null && item.description!.isNotEmpty)
                  Padding(
                    padding: const EdgeInsets.only(top: 2),
                    child: Text(
                      item.description!,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(fontSize: 10, color: Colors.grey[600]),
                    ),
                  ),
              ],
            ),
          ),
          if (item.priceExcluded)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
              decoration: BoxDecoration(
                color: Colors.deepOrange.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(6),
              ),
              child: const Text(
                'Tùy món ăn',
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.bold,
                  color: Colors.deepOrange,
                ),
              ),
            )
          else if (item.priceEst > 0)
            Text(
              _formatVND(item.priceEst),
              style: const TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.bold,
                color: Colors.deepOrange,
              ),
            )
          else
            Text(
              'Miễn phí',
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w600,
                color: Colors.green[700],
              ),
            ),
          IconButton(
            icon: const Icon(Icons.close, size: 16),
            onPressed: () => setState(() => _selectedItem = null),
          ),
        ],
      ),
    );
  }

  Widget _buildPrePlaceCard(DestinationItem item, bool isDark) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: isDark ? Colors.grey[850] : Colors.white,
        borderRadius: BorderRadius.circular(18),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.12),
            blurRadius: 16,
          ),
        ],
      ),
      child: Row(
        children: [
          const Icon(Icons.place_rounded, color: AppColors.primary, size: 28),
          const SizedBox(width: 8),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                const Text(
                  'Điểm tham quan đã chọn',
                  style: TextStyle(fontSize: 10, color: AppColors.primary, fontWeight: FontWeight.bold),
                ),
                Text(
                  item.title,
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                if (item.address != null)
                  Text(item.address!, style: TextStyle(fontSize: 11, color: Colors.grey[500])),
              ],
            ),
          ),
          IconButton(
            icon: const Icon(Icons.close, size: 16),
            onPressed: () => setState(() => _selectedPrePlace = null),
          ),
        ],
      ),
    );
  }

  Widget _buildPreLodgingCard(AiPlanLodging lo, bool isDark) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: isDark ? Colors.grey[850] : Colors.white,
        borderRadius: BorderRadius.circular(18),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.12),
            blurRadius: 16,
          ),
        ],
      ),
      child: Row(
        children: [
          const Icon(Icons.hotel_rounded, color: Colors.purple, size: 28),
          const SizedBox(width: 8),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                const Text(
                  'Nơi nghỉ đã chọn',
                  style: TextStyle(fontSize: 10, color: Colors.purple, fontWeight: FontWeight.bold),
                ),
                Text(
                  lo.name,
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                Text(
                  '${_formatVND(lo.pricePerNight)} / đêm',
                  style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.deepOrange),
                ),
              ],
            ),
          ),
          IconButton(
            icon: const Icon(Icons.close, size: 16),
            onPressed: () => setState(() => _selectedPreLodging = null),
          ),
        ],
      ),
    );
  }
}
