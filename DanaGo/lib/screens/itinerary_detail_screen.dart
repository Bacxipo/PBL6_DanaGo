import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:smarttrip/models/itinerary_model.dart';
import 'package:smarttrip/theme/app_colors.dart';
import 'package:smarttrip/widgets/itinerary/itinerary_bottom_bar.dart';
import 'package:smarttrip/widgets/itinerary/itinerary_day_tab_bar.dart';
import 'package:smarttrip/widgets/itinerary/itinerary_timeline_item.dart';

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

    return Scaffold(
      backgroundColor: AppColors.bgPrimary,
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
                        return _buildDayContent(day);
                      }).toList(),
                    ),
                  ),
                ],
              ),
      ),
      bottomNavigationBar: const ItineraryBottomBar(),
    );
  }

  Widget _buildSliverAppBar(Itinerary it, bool innerBoxIsScrolled) {
    return SliverAppBar(
      expandedHeight: 280,
      pinned: true,
      backgroundColor: AppColors.primary,
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
        GestureDetector(
          onTap: () {
            setState(() => _isSaved = !_isSaved);
            HapticFeedback.lightImpact();
          },
          child: Container(
            margin: const EdgeInsets.all(8),
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: Colors.black26,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(
              _isSaved ? Icons.bookmark_rounded : Icons.bookmark_border_rounded,
              color: Colors.white,
              size: 20,
            ),
          ),
        ),
        GestureDetector(
          onTap: () {},
          child: Container(
            margin: const EdgeInsets.only(right: 12, top: 8, bottom: 8),
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: Colors.black26,
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Icon(
              Icons.share_rounded,
              color: Colors.white,
              size: 20,
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
                  // Date range
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

  Widget _buildDayContent(ItineraryDay day) {
    return ListView.builder(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 100),
      itemCount: day.places.length + 2,
      itemBuilder: (context, index) {
        if (index == 0) {
          return Padding(
            padding: const EdgeInsets.only(bottom: 8),
            child: Text(
              '${day.label}: ${_getDayTitle(day)} — ${day.places.length} điểm',
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: AppColors.textPrimary,
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
    return Container(
      margin: const EdgeInsets.only(left: 44, top: 4, bottom: 16),
      child: OutlinedButton.icon(
        onPressed: () {},
        icon: const Icon(Icons.add_circle_outline, size: 18),
        label: Text('Thêm điểm đến vào ${day.label}'),
        style: OutlinedButton.styleFrom(
          foregroundColor: AppColors.primary,
          side: const BorderSide(color: AppColors.primary, width: 1.5),
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
            style: TextStyle(
              fontSize: 16,
              color: AppColors.textTertiary,
            ),
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
