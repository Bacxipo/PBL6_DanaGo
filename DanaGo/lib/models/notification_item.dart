enum NotificationType {
  community, // Tương tác bài viết, bình luận, like
  itinerary, // Nhắc nhở lịch trình, gợi ý thời tiết
  system, // Cập nhật hệ thống, chào mừng
  promo, // Ưu đãi, sự kiện du lịch
}

class NotificationItem {
  final String id;
  final NotificationType type;
  final String title;
  final String body;
  final String timeAgo;
  final String? groupDate; // 'Hôm nay', 'Tuần này', 'Trước đó'
  bool isRead;
  final String? avatarUrl;
  final String? referenceType; // 'EVENT', 'POST', 'USER', 'ITINERARY'
  final int? referenceId;

  NotificationItem({
    required this.id,
    required this.type,
    required this.title,
    required this.body,
    required this.timeAgo,
    this.groupDate = 'Hôm nay',
    this.isRead = false,
    this.avatarUrl,
    this.referenceType,
    this.referenceId,
  });

  factory NotificationItem.fromJson(Map<String, dynamic> json) {
    final rawType = (json['type'] ?? '').toString().toUpperCase();
    NotificationType type;
    if (rawType.contains('ITINERARY')) {
      type = NotificationType.itinerary;
    } else if (rawType.contains('PROMO') || rawType == 'PROMOTION') {
      type = NotificationType.promo;
    } else if (rawType.contains('COMMUNITY') ||
        rawType.contains('POST') ||
        rawType.contains('COMMENT') ||
        rawType.contains('LIKE')) {
      type = NotificationType.community;
    } else {
      type = NotificationType.system;
    }

    final createdAtStr = json['createdAt'] as String?;
    DateTime? dt;
    if (createdAtStr != null) {
      dt = DateTime.tryParse(createdAtStr)?.toLocal();
    }
    final now = DateTime.now();
    String timeAgo = 'Vừa xong';
    String groupDate = 'Hôm nay';

    if (dt != null) {
      final diff = now.difference(dt);
      if (diff.inSeconds < 60) {
        timeAgo = 'Vừa xong';
      } else if (diff.inMinutes < 60) {
        timeAgo = '${diff.inMinutes} phút trước';
      } else if (diff.inHours < 24 && dt.day == now.day) {
        timeAgo = '${diff.inHours} giờ trước';
      } else if (diff.inDays <= 1 ||
          (now.day - dt.day == 1 && diff.inHours < 48)) {
        timeAgo = 'Hôm qua';
      } else if (diff.inDays < 7) {
        timeAgo = '${diff.inDays} ngày trước';
      } else {
        timeAgo =
            '${dt.day.toString().padLeft(2, '0')}/${dt.month.toString().padLeft(2, '0')}/${dt.year}';
      }

      if (dt.year == now.year && dt.month == now.month && dt.day == now.day) {
        groupDate = 'Hôm nay';
      } else if (diff.inDays < 7) {
        groupDate = 'Tuần này';
      } else {
        groupDate = 'Trước đó';
      }
    }

    final rawRefType =
        (json['referenceType'] ?? json['reference_type'])?.toString().toUpperCase();
    final rawRefId = json['referenceId'] ?? json['reference_id'];
    final parsedRefId = rawRefId is num
        ? rawRefId.toInt()
        : int.tryParse(rawRefId?.toString() ?? '');

    return NotificationItem(
      id: json['id']?.toString() ?? '',
      type: type,
      title: json['title'] ?? 'Thông báo',
      body: json['content'] ?? json['body'] ?? '',
      timeAgo: timeAgo,
      groupDate: groupDate,
      isRead: json['isRead'] as bool? ?? false,
      avatarUrl: json['avatarUrl'] as String?,
      referenceType: rawRefType,
      referenceId: parsedRefId,
    );
  }

  static final List<NotificationItem> mockNotifications = [
    NotificationItem(
      id: 'notif_1',
      type: NotificationType.community,
      title: 'Hải Đăng đã thích bài viết của bạn',
      body: '"Top 5 quán cà phê ngắm hoàng hôn đỉnh chóp tại bán đảo Sơn Trà"',
      timeAgo: '10 phút trước',
      groupDate: 'Hôm nay',
      isRead: false,
      avatarUrl: 'https://i.postimg.cc/X7QYBdY8/avt2.jpg',
    ),
    NotificationItem(
      id: 'notif_2',
      type: NotificationType.itinerary,
      title: 'Nhắc nhở lịch trình hôm nay',
      body:
          'Bạn có chuyến ghé thăm "Cầu Rồng" và xem phun lửa lúc 21:00 tối nay. Đừng quên mang máy ảnh!',
      timeAgo: '2 giờ trước',
      groupDate: 'Hôm nay',
      isRead: false,
    ),
    NotificationItem(
      id: 'notif_3',
      type: NotificationType.community,
      title: 'Linh Nguyễn đã bình luận',
      body: '"Quán mì Quảng này ngon lắm, cảm ơn bạn đã gợi ý nha!"',
      timeAgo: '5 giờ trước',
      groupDate: 'Hôm nay',
      isRead: true,
      avatarUrl: 'https://i.postimg.cc/tC24nW4N/avt1.jpg',
    ),
    NotificationItem(
      id: 'notif_4',
      type: NotificationType.promo,
      title: 'Lễ hội Pháo hoa Quốc tế DIFF 2026',
      body:
          'Lịch trình bắn pháo hoa và các điểm ngắm đẹp nhất dọc sông Hàn đã được cập nhật.',
      timeAgo: '2 ngày trước',
      groupDate: 'Tuần này',
      isRead: true,
    ),
    NotificationItem(
      id: 'notif_5',
      type: NotificationType.system,
      title: 'Chào mừng bạn đến với DanaGo!',
      body:
          'Khám phá ngay các địa điểm du lịch, ẩm thực và lên lịch trình thông minh cùng chúng tôi.',
      timeAgo: '5 ngày trước',
      groupDate: 'Trước đó',
      isRead: true,
    ),
  ];
}
