import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:smarttrip/models/itinerary_model.dart';
import 'package:smarttrip/screens/suggest_itinerary_screen.dart';
import 'package:smarttrip/theme/app_colors.dart';
import 'package:smarttrip/widgets/itinerary/itinerary_bottom_bar.dart';
import 'package:smarttrip/widgets/itinerary/itinerary_day_tab_bar.dart';
import 'package:smarttrip/widgets/itinerary/itinerary_timeline_item.dart';
import 'package:smarttrip/widgets/itinerary/checklist_bottom_sheet.dart';
import 'explore_map_screen.dart';
import 'main_screen.dart';

class ItineraryDetailScreen extends StatefulWidget {
  final Itinerary itinerary;

  const ItineraryDetailScreen({super.key, required this.itinerary});

  @override
  State<ItineraryDetailScreen> createState() => _ItineraryDetailScreenState();
}

class _ItineraryDetailScreenState extends State<ItineraryDetailScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  int _selectedDay = 0;
  bool _isSaved = true;
  void _saveItinerary() {
    setState(() {
      _isSaved = true; // Chuyển trạng thái về Đã lưu
    });
    HapticFeedback.lightImpact();
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('✅ Đã lưu toàn bộ thay đổi lịch trình!'),
        backgroundColor: AppColors.primary,
        behavior: SnackBarBehavior.floating,
        duration: Duration(seconds: 2),
      ),
    );
  }

  @override
  void initState() {
    super.initState();
    final dayCount = widget.itinerary.days.isEmpty
        ? 1
        : widget.itinerary.days.length;
    _tabController = TabController(length: dayCount, vsync: this);
    _tabController.addListener(() {
      setState(() => _selectedDay = _tabController.index);
    });
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final it = widget.itinerary;
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      body: NestedScrollView(
        headerSliverBuilder: (context, innerBoxIsScrolled) => [
          _buildSliverAppBar(it, innerBoxIsScrolled),
        ],
        body: it.days.isEmpty
            ? _buildEmptyDays()
            : Column(
                children: [
                  ItineraryDayTabBar(
                    itinerary: it,
                    selectedDay: _selectedDay,
                    onDaySelect: (index) {
                      _tabController.animateTo(index);
                    },
                  ),
                  Expanded(
                    child: TabBarView(
                      controller: _tabController,
                      children: it.days.map((day) {
                        return _buildDayContent(day, isDark);
                      }).toList(),
                    ),
                  ),
                ],
              ),
      ),
      bottomNavigationBar: ItineraryBottomBar(
        onAutoSave: _saveItinerary,
        onAddPlace: () {
          Navigator.pushAndRemoveUntil(
            context,
            MaterialPageRoute(
              builder: (_) => const MainScreen(initialIndex: 4),
            ),
            (route) => false,
          );
        },
      ),
    );
  }

  Widget _buildSliverAppBar(Itinerary it, bool innerBoxIsScrolled) {
    return SliverAppBar(
      expandedHeight: 280,
      pinned: true,
      backgroundColor: AppColors.primary,

      // 1. Nút Quay về
      leading: GestureDetector(
        onTap: () => Navigator.pop(context),
        child: Container(
          margin: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: Colors.black26,
            borderRadius: BorderRadius.circular(12),
          ),
          child: const Icon(Icons.arrow_back_rounded, color: Colors.white),
        ),
      ),
      actions: [
        // --- NÚT CHECKLIST ---
        GestureDetector(
          onTap: () {
            showModalBottomSheet(
              context: context,
              isScrollControlled: true,
              backgroundColor: Colors.transparent,
              builder: (ctx) => const ChecklistBottomSheet(),
            );
          },
          child: Container(
            margin: const EdgeInsets.symmetric(vertical: 10, horizontal: 4),
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: Colors.grey.shade300),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.04),
                  blurRadius: 4,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: const Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(
                  Icons.check_box_outlined,
                  size: 15,
                  color: AppColors.primary,
                ),
                SizedBox(width: 5),
                Text(
                  'Checklist',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF1E293B),
                  ),
                ),
              ],
            ),
          ),
        ),
        // --- NÚT ĐÃ LƯU
        GestureDetector(
          onTap: _saveItinerary,
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 250),
            margin: const EdgeInsets.only(
              top: 10,
              bottom: 10,
              left: 4,
              right: 14,
            ),
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: _isSaved ? const Color(0xFFECFDF5) : AppColors.primary,
              borderRadius: BorderRadius.circular(10),
              border: Border.all(
                color: _isSaved ? const Color(0xFFA7F3D0) : AppColors.primary,
              ),
              boxShadow: _isSaved
                  ? []
                  : [
                      BoxShadow(
                        color: AppColors.primary.withValues(alpha: 0.3),
                        blurRadius: 6,
                        offset: const Offset(0, 2),
                      ),
                    ],
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(
                  _isSaved ? Icons.check_rounded : Icons.save_rounded,
                  size: 15,
                  color: _isSaved ? const Color(0xFF047857) : Colors.white,
                ),
                const SizedBox(width: 4),
                Text(
                  _isSaved ? 'Đã lưu' : 'Lưu',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    color: _isSaved ? const Color(0xFF047857) : Colors.white,
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
      flexibleSpace: FlexibleSpaceBar(
        background: Stack(
          fit: StackFit.expand,
          children: [
            Image.network(
              it.coverImage,
              fit: BoxFit.cover,
              errorBuilder: (_, _, _) => Container(color: AppColors.primary),
            ),
            Container(
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [Colors.black26, Colors.black87],
                  stops: [0.4, 1.0],
                ),
              ),
            ),
            Positioned(
              bottom: 16,
              left: 16,
              right: 16,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Status badge
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 5,
                    ),
                    decoration: BoxDecoration(
                      color: it.statusColor,
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(it.statusIcon, color: Colors.white, size: 13),
                        const SizedBox(width: 5),
                        Text(
                          it.statusLabel,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      const Icon(
                        Icons.calendar_today_rounded,
                        color: Colors.white70,
                        size: 13,
                      ),
                      const SizedBox(width: 5),
                      Text(
                        it.dateRange,
                        style: const TextStyle(
                          color: Colors.white70,
                          fontSize: 13,
                        ),
                      ),
                      const SizedBox(width: 16),
                      const Icon(
                        Icons.place_rounded,
                        color: Colors.white70,
                        size: 13,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        '${it.placeCount} điểm đến',
                        style: const TextStyle(
                          color: Colors.white70,
                          fontSize: 13,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Text(
                    it.title,
                    style: const TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(height: 8),
                  // Info chips
                  Row(
                    children: [
                      if (it.costPerPerson > 0)
                        _infoChip(
                          Icons.account_balance_wallet_rounded,
                          '~${_formatCurrency(it.costPerPerson)}/người',
                        ),
                      if (it.temperature.isNotEmpty) ...[
                        const SizedBox(width: 8),
                        _infoChip(Icons.wb_sunny_rounded, it.temperature),
                      ],
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _infoChip(IconData icon, String label) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.2),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.white30),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, color: Colors.white, size: 13),
          const SizedBox(width: 5),
          Text(
            label,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 12,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDayContent(ItineraryDay day, bool isDark) {
    return ListView.builder(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 100),
      itemCount: day.places.length + 2,
      itemBuilder: (context, index) {
        if (index == 0) {
          return Padding(
            padding: const EdgeInsets.only(bottom: 8),
            child: Text(
              '${day.label}: ${_getDayTitle(day)} — ${day.places.length} điểm',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: isDark ? Colors.white : AppColors.textPrimary,
              ),
            ),
          );
        }
        if (index == day.places.length + 1) {
          return _buildAddPlaceButton(day);
        }
        final placeIndex = index - 1;
        return ItineraryTimelineItem(
          place: day.places[placeIndex],
          index: placeIndex,
          total: day.places.length,
          onTap: () {},
        );
      },
    );
  }

  String _getDayTitle(ItineraryDay day) {
    if (day.places.isNotEmpty) {
      return '${day.places.first.name.split(' ').take(3).join(' ')}...';
    }
    return '';
  }

  Widget _buildAddPlaceButton(ItineraryDay day) {
    return Center(
      child: OutlinedButton.icon(
        onPressed: () {
          Navigator.pushAndRemoveUntil(
            context,
            MaterialPageRoute(
              builder: (_) => const MainScreen(initialIndex: 1),
            ),
            (route) => false,
          );
        },
        icon: const Icon(
          Icons.add_location_alt_outlined,
          size: 18,
          color: AppColors.primary,
        ),
        label: Text(
          'Thêm điểm đến vào ${day.label}',
          style: const TextStyle(
            fontWeight: FontWeight.bold,
            color: AppColors.primary,
          ),
        ),
        style: OutlinedButton.styleFrom(
          side: const BorderSide(color: AppColors.primary),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        ),
      ),
    );
  }

  Widget _buildEmptyDays() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.calendar_today_outlined,
            size: 60,
            color: AppColors.primary.withValues(alpha: 0.3),
          ),
          const SizedBox(height: 12),
          const Text(
            'Chưa có lịch trình chi tiết',
            style: TextStyle(fontSize: 16, color: AppColors.textTertiary),
          ),
        ],
      ),
    );
  }

  String _formatCurrency(double amount) {
    if (amount >= 1000000) {
      return '${(amount / 1000000).toStringAsFixed(1)}Tr';
    }
    return '${(amount / 1000).toStringAsFixed(0)}K';
  }
}
