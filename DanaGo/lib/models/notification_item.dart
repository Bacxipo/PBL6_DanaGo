enum NotificationType {
  community, // Tương tác bài viết, bình luận, like
  itinerary, // Nhắc nhở lịch trình, gợi ý thời tiết
  system,    // Cập nhật hệ thống, chào mừng
  promo,     // Ưu đãi, sự kiện du lịch
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

  NotificationItem({
    required this.id,
    required this.type,
    required this.title,
    required this.body,
    required this.timeAgo,
    this.groupDate = 'Hôm nay',
    this.isRead = false,
    this.avatarUrl,
  });

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
      body: 'Bạn có chuyến ghé thăm "Cầu Rồng" và xem phun lửa lúc 21:00 tối nay. Đừng quên mang máy ảnh!',
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
      body: 'Lịch trình bắn pháo hoa và các điểm ngắm đẹp nhất dọc sông Hàn đã được cập nhật.',
      timeAgo: '2 ngày trước',
      groupDate: 'Tuần này',
      isRead: true,
    ),
    NotificationItem(
      id: 'notif_5',
      type: NotificationType.system,
      title: 'Chào mừng bạn đến với DanaGo!',
      body: 'Khám phá ngay các địa điểm du lịch, ẩm thực và lên lịch trình thông minh cùng chúng tôi.',
      timeAgo: '5 ngày trước',
      groupDate: 'Trước đó',
      isRead: true,
    ),
  ];
}

