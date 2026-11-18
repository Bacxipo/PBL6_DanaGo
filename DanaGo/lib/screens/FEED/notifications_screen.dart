import 'package:flutter/material.dart';
import 'package:smarttrip/models/notification_item.dart';
import 'package:smarttrip/screens/HOME/event_detail_screen.dart';
import 'package:smarttrip/screens/HOME/events_screen.dart';
import 'package:smarttrip/screens/Itinerary/itinerary_detail_screen.dart';
import 'package:smarttrip/screens/HOME/main_screen.dart';
import 'package:smarttrip/screens/FEED/post_detail_screen.dart';
import 'package:smarttrip/screens/PROFILE/user_profile_posts_screen.dart';
import 'package:smarttrip/services/auth_service.dart';
import 'package:smarttrip/services/event_service.dart';
import 'package:smarttrip/services/itinerary_service.dart';
import 'package:smarttrip/services/notification_service.dart';
import 'package:smarttrip/theme/app_colors.dart';
import 'package:smarttrip/widgets/notifications/notification_item_tile.dart';

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  List<NotificationItem> _notifications = [];
  bool _isLoading = true;
  int? _userId;
  String _selectedFilter = 'Tất cả';

  final List<String> _filters = [
    'Tất cả',
    'Chưa đọc',
    'Sự kiện',
    'Cộng đồng',
    'Lịch trình',
  ];

  @override
  void initState() {
    super.initState();
    _loadNotifications();
  }

  Future<void> _loadNotifications() async {
    setState(() => _isLoading = true);
    try {
      final profile = await AuthService.instance.getProfile();
      if (profile != null && profile['id'] != null) {
        _userId = (profile['id'] as num).toInt();
      }
      final items = await NotificationService.instance.getNotifications(
        userId: _userId,
      );
      if (mounted) {
        setState(() {
          _notifications = items;
          _isLoading = false;
        });
      }
    } catch (_) {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  List<NotificationItem> get _filteredList {
    return _notifications.where((n) {
      if (_selectedFilter == 'Chưa đọc') return !n.isRead;
      if (_selectedFilter == 'Sự kiện') {
        return n.type == NotificationType.promo;
      }
      if (_selectedFilter == 'Cộng đồng') {
        return n.type == NotificationType.community;
      }
      if (_selectedFilter == 'Lịch trình') {
        return n.type == NotificationType.itinerary;
      }
      return true;
    }).toList();
  }

  void _markAllAsRead() async {
    setState(() {
      for (var n in _notifications) {
        n.isRead = true;
      }
    });
    await NotificationService.instance.markAllAsRead(userId: _userId);
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Đã đánh dấu đọc tất cả thông báo'),
        duration: Duration(seconds: 2),
      ),
    );
  }

  Future<void> _handleNotificationTap(NotificationItem item) async {
    if (!item.isRead) {
      setState(() {
        item.isRead = true;
      });
      NotificationService.instance.markAsRead(item.id);
    }

    final refType = item.referenceType;
    final refId = item.referenceId;

    // 1. Sự kiện (EVENT hoặc loại promo)
    if (refType == 'EVENT' || item.type == NotificationType.promo) {
      if (refId != null) {
        final ev = await EventService.instance.getEventById(refId);
        if (!mounted) return;
        if (ev != null) {
          Navigator.push(
            context,
            MaterialPageRoute(builder: (_) => EventDetailScreen(event: ev)),
          );
          return;
        }
      } else {
        // Fallback cho thông báo sự kiện cũ chưa có referenceId: thử khớp theo tên sự kiện
        final prefix = 'Sự kiện mới:';
        if (item.title.startsWith(prefix)) {
          final targetName = item.title
              .substring(prefix.length)
              .trim()
              .toLowerCase();
          final allEvents = await EventService.instance.getEvents();
          if (!mounted) return;
          for (final ev in allEvents) {
            if (ev.name.trim().toLowerCase() == targetName) {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => EventDetailScreen(event: ev)),
              );
              return;
            }
          }
        }
      }
      if (!mounted) return;
      Navigator.push(
        context,
        MaterialPageRoute(builder: (_) => const EventsScreen()),
      );
      return;
    }

    // 2. Bài viết (POST: thích, bình luận, duyệt/từ chối bài viết)
    if (refType == 'POST' && refId != null) {
      final isCommentNotif = item.title.toLowerCase().contains('bình luận');
      if (!mounted) return;
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (_) => PostDetailScreen(
            postId: refId,
            openCommentsOnLoad: isCommentNotif,
          ),
        ),
      );
      return;
    }

    // 3. Người dùng (USER: người theo dõi mới)
    if (refType == 'USER' && refId != null) {
      final user = await AuthService.instance.getPublicProfile(refId);
      if (!mounted) return;
      final name = (user?['fullName'] ?? user?['username'] ?? 'Người dùng')
          .toString();
      final rawAvatar = user?['avatarUrl']?.toString();
      final avatar = (rawAvatar != null && rawAvatar.isNotEmpty)
          ? rawAvatar
          : 'assets/images/default-avatar.svg';
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (_) => UserProfilePostsScreen(
            authorId: refId,
            authorName: name,
            authorAvatar: avatar,
          ),
        ),
      );
      return;
    }

    // 4. Lịch trình (ITINERARY)
    if (refType == 'ITINERARY' || item.type == NotificationType.itinerary) {
      if (refId != null) {
        final it = await ItineraryService.instance.getItineraryById(refId);
        if (!mounted) return;
        if (it != null) {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (_) => ItineraryDetailScreen(itinerary: it),
            ),
          );
          return;
        }
      }
      if (!mounted) return;
      Navigator.pushAndRemoveUntil(
        context,
        MaterialPageRoute(builder: (_) => const MainScreen(initialIndex: 2)),
        (route) => false,
      );
      return;
    }

    // 5. Fallback cho thông báo Cộng đồng cũ chưa có referenceId
    if (item.type == NotificationType.community) {
      final lowerTitle = item.title.toLowerCase();
      if (lowerTitle.contains('duyệt') || lowerTitle.contains('từ chối')) {
        final me = await AuthService.instance.getProfile();
        if (!mounted) return;
        final rawAvatar = me?['avatarUrl']?.toString();
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (_) => UserProfilePostsScreen(
              authorName: (me?['fullName'] ?? 'Bạn').toString(),
              authorAvatar: (rawAvatar != null && rawAvatar.isNotEmpty)
                  ? rawAvatar
                  : 'assets/images/default-avatar.svg',
              isVerified: true,
              isCurrentUser: true,
            ),
          ),
        );
        return;
      }
      if (!mounted) return;
      Navigator.pushAndRemoveUntil(
        context,
        MaterialPageRoute(builder: (_) => const MainScreen(initialIndex: 3)),
        (route) => false,
      );
      return;
    }
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
            onPressed: _notifications.isEmpty ? null : _markAllAsRead,
            child: Text(
              'Đọc tất cả',
              style: TextStyle(
                fontFamily: 'Be Vietnam Pro',
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: _notifications.isEmpty ? Colors.grey : AppColors.primary,
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
            child: _isLoading
                ? const Center(
                    child: CircularProgressIndicator(color: AppColors.primary),
                  )
                : RefreshIndicator(
                    onRefresh: _loadNotifications,
                    color: AppColors.primary,
                    child: list.isEmpty
                        ? ListView(
                            physics: const AlwaysScrollableScrollPhysics(
                              parent: BouncingScrollPhysics(),
                            ),
                            children: [
                              SizedBox(
                                height:
                                    MediaQuery.of(context).size.height * 0.25,
                              ),
                              Center(
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
                              ),
                            ],
                          )
                        : ListView.builder(
                            physics: const AlwaysScrollableScrollPhysics(
                              parent: BouncingScrollPhysics(),
                            ),
                            itemCount: groups.keys.length,
                            itemBuilder: (context, groupIndex) {
                              final groupTitle = groups.keys.elementAt(
                                groupIndex,
                              );
                              final itemsInGroup = groups[groupTitle]!;

                              return Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Container(
                                    width: double.infinity,
                                    color: isDark
                                        ? const Color(0xFF0F172A)
                                        : AppColors.bgSecondary.withValues(
                                            alpha: 0.5,
                                          ),
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
                                      onTap: () => _handleNotificationTap(item),
                                      onDelete: () {
                                        final wasUnread = !item.isRead;
                                        setState(() {
                                          _notifications.removeWhere(
                                            (n) => n.id == item.id,
                                          );
                                        });
                                        NotificationService.instance
                                            .deleteNotification(
                                              item.id,
                                              wasUnread: wasUnread,
                                            );
                                      },
                                    );
                                  }),
                                ],
                              );
                            },
                          ),
                  ),
          ),
        ],
      ),
    );
  }
}
