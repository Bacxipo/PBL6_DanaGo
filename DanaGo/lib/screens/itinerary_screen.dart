import 'package:flutter/material.dart';
import 'package:smarttrip/models/itinerary_model.dart';
import 'package:smarttrip/theme/app_colors.dart';
import 'package:smarttrip/widgets/itinerary/itinerary_card.dart';
import 'itinerary_detail_screen.dart';
import 'package:smarttrip/widgets/itinerary/create_itinerary_sheet.dart';

class ItineraryScreen extends StatefulWidget {
  const ItineraryScreen({super.key});

  @override
  State<ItineraryScreen> createState() => _ItineraryScreenState();
}

class _ItineraryScreenState extends State<ItineraryScreen>
    with SingleTickerProviderStateMixin {
  int _selectedFilter = 0;
  late AnimationController _fabController;
  late Animation<double> _fabAnimation;
  List<Itinerary> _myIntineraries = List.from(Itinerary.sampleList);

  final List<String> _filters = [
    'Tất cả',
    'Đang diễn ra',
    'Sắp tới',
    'Đã hoàn thành',
  ];

  final List<ItineraryStatus?> _filterStatuses = [
    null,
    ItineraryStatus.ongoing,
    ItineraryStatus.upcoming,
    ItineraryStatus.completed,
  ];

  @override
  void initState() {
    super.initState();
    _fabController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 600),
    );
    _fabAnimation = CurvedAnimation(
      parent: _fabController,
      curve: Curves.elasticOut,
    );
    _fabController.forward();
  }

  @override
  void dispose() {
    _fabController.dispose();
    super.dispose();
  }

  List<Itinerary> get _filteredList {
    final status = _filterStatuses[_selectedFilter];
    if (status == null) return _myIntineraries;
    return Itinerary.sampleList.where((e) => e.status == status).toList();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildHeader(isDark),
            _buildFilterTabs(isDark),
            Expanded(
              child: _filteredList.isEmpty
                  ? _buildEmptyState()
                  : ListView.builder(
                      padding: const EdgeInsets.fromLTRB(16, 8, 16, 100),
                      itemCount: _filteredList.length,
                      itemBuilder: (context, index) {
                        return ItineraryCard(
                          itinerary: _filteredList[index],
                          onTap: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (_) => ItineraryDetailScreen(
                                  itinerary: _filteredList[index],
                                ),
                              ),
                            );
                          },
                        );
                      },
                    ),
            ),
          ],
        ),
      ),
      floatingActionButton: ScaleTransition(
        scale: _fabAnimation,
        child: FloatingActionButton(
          heroTag: 'itinerary_fab',
          onPressed: () async {
            // 1. Mở modal và chờ người dùng nhập xong
            final data = await showModalBottomSheet<Map<String, dynamic>>(
              context: context,
              isScrollControlled: true,
              backgroundColor: Colors.transparent,
              builder: (ctx) => const CreateItinerarySheet(),
            );
            // 2. Nếu người dùng bấm "Tạo lịch trình" (data != null)
            if (data != null && mounted) {
              final newItinerary = Itinerary(
                id: DateTime.now().millisecondsSinceEpoch.toString(),
                title: data['title'],
                coverImage:
                    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
                dateRange: '${data['startDate']} – ${data['endDate']}',
                placeCount: 0,
                status: ItineraryStatus.upcoming,
                days: [
                  const ItineraryDay(
                    date: 'Khởi hành',
                    label: 'Ngày 1',
                    places: [],
                  ),
                ],
              );
              // Thêm vào danh sách lịch trình
              setState(() {
                _myIntineraries.insert(0, newItinerary);
              });
              // 3. 🔥 MỞ NGAY MÀN HÌNH CHI TIẾT CỦA LỊCH TRÌNH VỪA TẠO
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (_) =>
                      ItineraryDetailScreen(itinerary: newItinerary),
                ),
              );
            }
          },
          backgroundColor: AppColors.primary,
          elevation: 6,
          child: const Icon(Icons.add, color: Colors.white, size: 28),
        ),
      ),
    );
  }

  Widget _buildHeader(bool isDark) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 20, 20, 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Lịch trình của tôi',
                style: TextStyle(
                  fontSize: 26,
                  fontWeight: FontWeight.bold,
                  color: isDark ? Colors.white : AppColors.textPrimary,
                ),
              ),
              Text(
                '${Itinerary.sampleList.length} lịch trình',
                style: const TextStyle(
                  fontSize: 13,
                  color: AppColors.textTertiary,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildFilterTabs(bool isDark) {
    return Container(
      height: 44,
      margin: const EdgeInsets.only(bottom: 8),
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 16),
        itemCount: _filters.length,
        itemBuilder: (context, index) {
          final isSelected = _selectedFilter == index;
          return GestureDetector(
            onTap: () => setState(() => _selectedFilter = index),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 250),
              margin: const EdgeInsets.only(right: 8),
              padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 8),
              decoration: BoxDecoration(
                color: isSelected
                    ? AppColors.primary
                    : (isDark ? const Color(0xFF1E293B) : Colors.white),
                borderRadius: BorderRadius.circular(22),
                boxShadow: [
                  if (isSelected)
                    BoxShadow(
                      color: AppColors.primary.withValues(alpha: 0.3),
                      blurRadius: 8,
                      offset: const Offset(0, 3),
                    ),
                ],
              ),
              child: Text(
                _filters[index],
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: isSelected
                      ? Colors.white
                      : (isDark
                            ? Colors.grey.shade400
                            : AppColors.textTertiary),
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.map_outlined,
            size: 80,
            color: AppColors.primary.withValues(alpha: 0.3),
          ),
          const SizedBox(height: 16),
          const Text(
            'Chưa có lịch trình nào',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: AppColors.textSecondary,
            ),
          ),
          const SizedBox(height: 8),
          const Text(
            'Nhấn + để tạo lịch trình mới',
            style: TextStyle(fontSize: 14, color: AppColors.textHint),
          ),
        ],
      ),
    );
  }
}
