import 'package:flutter/material.dart';
import 'package:smarttrip/models/notification_item.dart';
import 'package:smarttrip/theme/app_colors.dart';
import 'package:smarttrip/widgets/notifications/notification_item_tile.dart';

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  late List<NotificationItem> _notifications;
  String _selectedFilter = 'Tất cả';

  final List<String> _filters = [
    'Tất cả',
    'Chưa đọc',
    'Cộng đồng',
    'Lịch trình',
  ];

  @override
  void initState() {
    super.initState();
    _notifications = List.from(NotificationItem.mockNotifications);
  }

  List<NotificationItem> get _filteredList {
    return _notifications.where((n) {
      if (_selectedFilter == 'Chưa đọc') return !n.isRead;
      if (_selectedFilter == 'Cộng đồng')
        return n.type == NotificationType.community;
      if (_selectedFilter == 'Lịch trình')
        return n.type == NotificationType.itinerary;
      return true;
    }).toList();
  }

  void _markAllAsRead() {
    setState(() {
      for (var n in _notifications) {
        n.isRead = true;
      }
    });
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Đã đánh dấu đọc tất cả thông báo'),
        duration: Duration(seconds: 2),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final list = _filteredList;
    final isDark = Theme.of(context).brightness == Brightness.dark;

    // Group items by groupDate
    final groups = <String, List<NotificationItem>>{};
    for (var item in list) {
      final grp = item.groupDate ?? 'Thông báo';
      groups.putIfAbsent(grp, () => []).add(item);
    }

    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      appBar: AppBar(
        backgroundColor: Theme.of(context).cardColor,
        elevation: 0,
        leading: IconButton(
          icon: Icon(
            Icons.arrow_back_ios_new_rounded,
            color: isDark ? Colors.white : AppColors.textPrimary,
            size: 20,
          ),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          'Thông báo',
          style: TextStyle(
            fontFamily: 'Be Vietnam Pro',
            fontSize: 18,
            fontWeight: FontWeight.w700,
            color: isDark ? Colors.white : AppColors.textPrimary,
          ),
        ),
        centerTitle: true,
        actions: [
          TextButton(
            onPressed: _markAllAsRead,
            child: const Text(
              'Đọc tất cả',
              style: TextStyle(
                fontFamily: 'Be Vietnam Pro',
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: AppColors.primary,
              ),
            ),
          ),
        ],
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(1),
          child: Container(
            color: isDark ? Colors.white12 : AppColors.divider,
            height: 1,
          ),
        ),
      ),
      body: Column(
        children: [
          // Filter Chips
          Container(
            color: Theme.of(context).cardColor,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              physics: const BouncingScrollPhysics(),
              child: Row(
                children: _filters.map((f) {
                  final isSelected = _selectedFilter == f;
                  return Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: ChoiceChip(
                      label: Text(f),
                      selected: isSelected,
                      onSelected: (selected) {
                        if (selected) {
                          setState(() {
                            _selectedFilter = f;
                          });
                        }
                      },
                      labelStyle: TextStyle(
                        fontFamily: 'Be Vietnam Pro',
                        fontSize: 12,
                        fontWeight: isSelected
                            ? FontWeight.w600
                            : FontWeight.w400,
                        color: isSelected
                            ? Colors.white
                            : (isDark
                                  ? Colors.grey.shade300
                                  : AppColors.textSecondary),
                      ),
                      selectedColor: AppColors.primary,
                      backgroundColor: isDark
                          ? const Color(0xFF0F172A)
                          : AppColors.bgSecondary,
                      side: BorderSide.none,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(20),
                      ),
                      padding: const EdgeInsets.symmetric(
                        horizontal: 10,
                        vertical: 4,
                      ),
                    ),
                  );
                }).toList(),
              ),
            ),
          ),
          Divider(
            height: 1,
            color: isDark ? Colors.white12 : AppColors.borderLight,
          ),

          // Notification List
          Expanded(
            child: list.isEmpty
                ? Center(
                    child: Padding(
                      padding: const EdgeInsets.all(32),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Container(
                            width: 80,
                            height: 80,
                            decoration: BoxDecoration(
                              color: AppColors.primaryLight,
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(
                              Icons.notifications_off_outlined,
                              size: 40,
                              color: AppColors.primary,
                            ),
                          ),
                          const SizedBox(height: 16),
                          Text(
                            'Không có thông báo mới',
                            style: TextStyle(
                              fontFamily: 'Be Vietnam Pro',
                              fontSize: 16,
                              fontWeight: FontWeight.w700,
                              color: isDark
                                  ? Colors.white
                                  : AppColors.textPrimary,
                            ),
                          ),
                          const SizedBox(height: 8),
                          const Text(
                            'Bạn đã xem hết tất cả thông báo trong mục này.',
                            textAlign: TextAlign.center,
                            style: TextStyle(
                              fontFamily: 'Be Vietnam Pro',
                              fontSize: 13,
                              color: AppColors.textTertiary,
                            ),
                          ),
                        ],
                      ),
                    ),
                  )
                : ListView.builder(
                    physics: const BouncingScrollPhysics(),
                    itemCount: groups.keys.length,
                    itemBuilder: (context, groupIndex) {
                      final groupTitle = groups.keys.elementAt(groupIndex);
                      final itemsInGroup = groups[groupTitle]!;

                      return Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Container(
                            width: double.infinity,
                            color: isDark
                                ? const Color(0xFF0F172A)
                                : AppColors.bgSecondary.withValues(alpha: 0.5),
                            padding: const EdgeInsets.symmetric(
                              horizontal: 16,
                              vertical: 8,
                            ),
                            child: Text(
                              groupTitle,
                              style: const TextStyle(
                                fontFamily: 'Be Vietnam Pro',
                                fontSize: 12,
                                fontWeight: FontWeight.w700,
                                color: AppColors.neutral,
                              ),
                            ),
                          ),
                          ...itemsInGroup.map((item) {
                            return NotificationItemTile(
                              item: item,
                              onTap: () {
                                setState(() {
                                  item.isRead = true;
                                });
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(
                                    content: Text(
                                      'Xem chi tiết: ${item.title}',
                                    ),
                                    duration: const Duration(seconds: 1),
                                  ),
                                );
                              },
                              onDelete: () {
                                setState(() {
                                  _notifications.removeWhere(
                                    (n) => n.id == item.id,
                                  );
                                });
                              },
                            );
                          }),
                        ],
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }
}
