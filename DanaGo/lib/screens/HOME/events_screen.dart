import 'package:flutter/material.dart';
import 'package:smarttrip/models/event_item.dart';
import 'package:smarttrip/screens/HOME/event_detail_screen.dart';
import 'package:smarttrip/services/event_service.dart';
import 'package:smarttrip/theme/app_colors.dart';
import 'package:smarttrip/widgets/home/event_card.dart';

class EventsScreen extends StatefulWidget {
  const EventsScreen({super.key});

  @override
  State<EventsScreen> createState() => _EventsScreenState();
}

class _EventsScreenState extends State<EventsScreen> {
  final TextEditingController _searchCtrl = TextEditingController();
  List<EventItem> _events = [];
  bool _isLoading = true;
  String _selectedFilter = 'all'; // all | happening | upcoming | ended

  @override
  void initState() {
    super.initState();
    _loadEvents();
  }

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  Future<void> _loadEvents() async {
    setState(() => _isLoading = true);
    final list = await EventService.instance.getEvents();
    list.sort((a, b) {
      int order(EventTimelineStatus s) {
        switch (s) {
          case EventTimelineStatus.happening:
            return 0;
          case EventTimelineStatus.upcoming:
            return 1;
          case EventTimelineStatus.ended:
            return 2;
        }
      }

      final cmp = order(a.timelineStatus).compareTo(order(b.timelineStatus));
      if (cmp != 0) return cmp;
      return a.startDate.compareTo(b.startDate);
    });
    if (mounted) {
      setState(() {
        _events = list;
        _isLoading = false;
      });
    }
  }

  List<EventItem> get _filteredEvents {
    final q = _searchCtrl.text.trim().toLowerCase();
    return _events.where((ev) {
      if (_selectedFilter == 'happening' &&
          ev.timelineStatus != EventTimelineStatus.happening) {
        return false;
      }
      if (_selectedFilter == 'upcoming' &&
          ev.timelineStatus != EventTimelineStatus.upcoming) {
        return false;
      }
      if (_selectedFilter == 'ended' &&
          ev.timelineStatus != EventTimelineStatus.ended) {
        return false;
      }
      if (q.isNotEmpty) {
        final matchesName = ev.name.toLowerCase().contains(q);
        final matchesLoc = ev.locationText.toLowerCase().contains(q);
        if (!matchesName && !matchesLoc) return false;
      }
      return true;
    }).toList();
  }

  Future<void> _openDetail(EventItem event) async {
    final updated = await Navigator.push<EventItem>(
      context,
      MaterialPageRoute(builder: (_) => EventDetailScreen(event: event)),
    );
    if (updated != null && mounted) {
      setState(() {
        final idx = _events.indexWhere((e) => e.id == updated.id);
        if (idx != -1) _events[idx] = updated;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final filtered = _filteredEvents;

    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Text(
          'Sự kiện & Lễ hội',
          style: TextStyle(
            fontFamily: 'Be Vietnam Pro',
            fontSize: 18,
            fontWeight: FontWeight.w800,
            color: isDark ? Colors.white : AppColors.textPrimary,
          ),
        ),
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 4, 16, 10),
            child: TextField(
              controller: _searchCtrl,
              onChanged: (_) => setState(() {}),
              style: TextStyle(
                fontFamily: 'Be Vietnam Pro',
                fontSize: 14,
                color: isDark ? Colors.white : AppColors.textPrimary,
              ),
              decoration: InputDecoration(
                hintText: 'Tìm tên sự kiện, địa điểm...',
                hintStyle: TextStyle(
                  fontFamily: 'Be Vietnam Pro',
                  fontSize: 13,
                  color: isDark ? Colors.white54 : AppColors.textHint,
                ),
                prefixIcon: const Icon(
                  Icons.search_rounded,
                  color: AppColors.primary,
                ),
                suffixIcon: _searchCtrl.text.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.close_rounded, size: 18),
                        onPressed: () {
                          _searchCtrl.clear();
                          setState(() {});
                        },
                      )
                    : null,
                filled: true,
                fillColor: Theme.of(context).cardColor,
                contentPadding: const EdgeInsets.symmetric(vertical: 12),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(14),
                  borderSide: BorderSide(
                    color: isDark
                        ? Colors.white.withValues(alpha: 0.08)
                        : Colors.grey.shade200,
                  ),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(14),
                  borderSide: BorderSide(
                    color: isDark
                        ? Colors.white.withValues(alpha: 0.08)
                        : Colors.grey.shade200,
                  ),
                ),
              ),
            ),
          ),
          SizedBox(
            height: 40,
            child: ListView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              children: [
                _filterChip('all', 'Tất cả', isDark),
                _filterChip('happening', 'Đang diễn ra', isDark),
                _filterChip('upcoming', 'Sắp diễn ra', isDark),
                _filterChip('ended', 'Đã kết thúc', isDark),
              ],
            ),
          ),
          const SizedBox(height: 10),
          Expanded(
            child: _isLoading
                ? const Center(
                    child: CircularProgressIndicator(color: AppColors.primary),
                  )
                : RefreshIndicator(
                    onRefresh: _loadEvents,
                    color: AppColors.primary,
                    child: filtered.isEmpty
                        ? ListView(
                            physics: const AlwaysScrollableScrollPhysics(),
                            children: [
                              SizedBox(
                                height:
                                    MediaQuery.of(context).size.height * 0.45,
                                child: Center(
                                  child: Column(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      Icon(
                                        Icons.event_busy_rounded,
                                        size: 56,
                                        color: AppColors.primary.withValues(
                                          alpha: 0.35,
                                        ),
                                      ),
                                      const SizedBox(height: 12),
                                      Text(
                                        'Chưa có sự kiện nào phù hợp',
                                        style: TextStyle(
                                          fontFamily: 'Be Vietnam Pro',
                                          fontSize: 15,
                                          fontWeight: FontWeight.w600,
                                          color: isDark
                                              ? Colors.white70
                                              : AppColors.textSecondary,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            ],
                          )
                        : ListView.builder(
                            physics: const AlwaysScrollableScrollPhysics(
                              parent: BouncingScrollPhysics(),
                            ),
                            padding: const EdgeInsets.fromLTRB(16, 4, 16, 24),
                            itemCount: filtered.length,
                            itemBuilder: (_, idx) => EventCard(
                              event: filtered[idx],
                              onTap: () => _openDetail(filtered[idx]),
                            ),
                          ),
                  ),
          ),
        ],
      ),
    );
  }

  Widget _filterChip(String key, String label, bool isDark) {
    final selected = _selectedFilter == key;
    return GestureDetector(
      onTap: () => setState(() => _selectedFilter = key),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        margin: const EdgeInsets.only(right: 8),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        decoration: BoxDecoration(
          color: selected
              ? AppColors.primary
              : (isDark ? const Color(0xFF1E293B) : Colors.white),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: selected
                ? AppColors.primary
                : (isDark ? Colors.white12 : Colors.grey.shade200),
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontFamily: 'Be Vietnam Pro',
            fontSize: 12,
            fontWeight: FontWeight.w600,
            color: selected
                ? Colors.white
                : (isDark ? Colors.white70 : AppColors.textSecondary),
          ),
        ),
      ),
    );
  }
}
