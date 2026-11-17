import 'package:flutter/foundation.dart';
import 'package:smarttrip/models/notification_item.dart';
import 'package:smarttrip/services/api_client.dart';

class NotificationService extends ChangeNotifier {
  NotificationService._();
  static final NotificationService instance = NotificationService._();

  int _unreadCount = 0;
  int get unreadCount => _unreadCount;

  void clear() {
    if (_unreadCount != 0) {
      _unreadCount = 0;
      notifyListeners();
    }
  }

  /// Lấy danh sách thông báo của người dùng (từ API /notifications/user/:userId hoặc /notifications/me)
  Future<List<NotificationItem>> getNotifications({int? userId}) async {
    try {
      if (userId == null) {
        final token = await ApiClient.instance.token;
        if (token == null || token.isEmpty) {
          clear();
          return [];
        }
      }
      final endpoint = userId != null
          ? '/notifications/user/$userId'
          : '/notifications/me';
      final res = await ApiClient.instance.get(endpoint);
      if (res is List) {
        final list = res
            .whereType<Map<String, dynamic>>()
            .map(NotificationItem.fromJson)
            .toList();
        _unreadCount = list.where((n) => !n.isRead).length;
        notifyListeners();
        return list;
      }
      return [];
    } catch (_) {
      return [];
    }
  }

  Future<void> refreshUnreadCount({int? userId}) async {
    await getNotifications(userId: userId);
  }

  /// Đánh dấu 1 thông báo là đã đọc
  Future<bool> markAsRead(String id) async {
    try {
      final res = await ApiClient.instance.patch('/notifications/$id/read');
      if (res != null && _unreadCount > 0) {
        _unreadCount--;
        notifyListeners();
      }
      return res != null;
    } catch (_) {
      return false;
    }
  }

  /// Đánh dấu tất cả thông báo là đã đọc
  Future<bool> markAllAsRead({int? userId}) async {
    try {
      final endpoint = userId != null
          ? '/notifications/user/$userId/read-all'
          : '/notifications/read-all';
      final res = await ApiClient.instance.patch(endpoint);
      if (res != null) {
        _unreadCount = 0;
        notifyListeners();
      }
      return res != null;
    } catch (_) {
      return false;
    }
  }

  /// Xóa 1 thông báo
  Future<bool> deleteNotification(String id, {bool wasUnread = false}) async {
    try {
      final res = await ApiClient.instance.delete('/notifications/$id');
      if (res != null && wasUnread && _unreadCount > 0) {
        _unreadCount--;
        notifyListeners();
      }
      return res != null;
    } catch (_) {
      return false;
    }
  }
}
