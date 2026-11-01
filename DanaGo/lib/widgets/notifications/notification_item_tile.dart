import 'package:flutter/material.dart';
import 'package:smarttrip/models/notification_item.dart';
import 'package:smarttrip/theme/app_colors.dart';

class NotificationItemTile extends StatelessWidget {
  final NotificationItem item;
  final VoidCallback onTap;
  final VoidCallback onDelete;

  const NotificationItemTile({
    super.key,
    required this.item,
    required this.onTap,
    required this.onDelete,
  });

  @override
  Widget build(BuildContext context) {
    return Dismissible(
      key: Key(item.id),
      direction: DismissDirection.endToStart,
      background: Container(
        color: AppColors.error,
        alignment: Alignment.centerRight,
        padding: const EdgeInsets.only(right: 20),
        child: const Icon(Icons.delete_outline_rounded, color: Colors.white, size: 24),
      ),
      onDismissed: (_) => onDelete(),
      child: Material(
        color: item.isRead ? Colors.transparent : AppColors.primaryLight.withValues(alpha: 0.35),
        child: InkWell(
          onTap: onTap,
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Leading Icon / Avatar
                _buildLeading(),
                const SizedBox(width: 12),

                // Content
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Expanded(
                            child: Text(
                              item.title,
                              style: TextStyle(
                                fontFamily: 'Be Vietnam Pro',
                                fontSize: 14,
                                fontWeight: item.isRead ? FontWeight.w600 : FontWeight.w700,
                                color: AppColors.textPrimary,
                              ),
                            ),
                          ),
                          if (!item.isRead) ...[
                            const SizedBox(width: 6),
                            Container(
                              width: 8,
                              height: 8,
                              decoration: const BoxDecoration(
                                color: AppColors.secondary,
                                shape: BoxShape.circle,
                              ),
                            ),
                          ],
                        ],
                      ),
                      const SizedBox(height: 4),
                      Text(
                        item.body,
                        style: TextStyle(
                          fontFamily: 'Be Vietnam Pro',
                          fontSize: 13,
                          color: item.isRead ? AppColors.textTertiary : AppColors.textSecondary,
                          height: 1.4,
                        ),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        item.timeAgo,
                        style: const TextStyle(
                          fontFamily: 'Be Vietnam Pro',
                          fontSize: 11,
                          color: AppColors.neutral,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildLeading() {
    if (item.avatarUrl != null) {
      return Stack(
        clipBehavior: Clip.none,
        children: [
          CircleAvatar(
            radius: 22,
            backgroundImage: NetworkImage(item.avatarUrl!),
            onBackgroundImageError: (_, __) {},
            backgroundColor: AppColors.bgSecondary,
          ),
          Positioned(
            right: -2,
            bottom: -2,
            child: Container(
              padding: const EdgeInsets.all(2),
              decoration: const BoxDecoration(
                color: Colors.white,
                shape: BoxShape.circle,
              ),
              child: _buildTypeBadgeIcon(item.type, size: 14),
            ),
          ),
        ],
      );
    }

    return Container(
      width: 44,
      height: 44,
      decoration: BoxDecoration(
        color: _getTypeBgColor(item.type),
        shape: BoxShape.circle,
      ),
      child: _buildTypeIcon(item.type),
    );
  }

  Widget _buildTypeBadgeIcon(NotificationType type, {double size = 16}) {
    IconData icon;
    Color color;

    switch (type) {
      case NotificationType.community:
        icon = Icons.favorite_rounded;
        color = AppColors.secondary;
        break;
      case NotificationType.itinerary:
        icon = Icons.calendar_today_rounded;
        color = AppColors.primary;
        break;
      case NotificationType.promo:
        icon = Icons.local_fire_department_rounded;
        color = Colors.orange;
        break;
      case NotificationType.system:
        icon = Icons.notifications_rounded;
        color = AppColors.info;
        break;
    }

    return Icon(icon, size: size, color: color);
  }

  Widget _buildTypeIcon(NotificationType type) {
    IconData icon;
    Color color;

    switch (type) {
      case NotificationType.community:
        icon = Icons.chat_bubble_rounded;
        color = AppColors.secondary;
        break;
      case NotificationType.itinerary:
        icon = Icons.map_rounded;
        color = AppColors.primary;
        break;
      case NotificationType.promo:
        icon = Icons.campaign_rounded;
        color = Colors.orange;
        break;
      case NotificationType.system:
        icon = Icons.info_outline_rounded;
        color = AppColors.info;
        break;
    }

    return Center(child: Icon(icon, size: 22, color: color));
  }

  Color _getTypeBgColor(NotificationType type) {
    switch (type) {
      case NotificationType.community:
        return const Color(0xFFFFECE6);
      case NotificationType.itinerary:
        return AppColors.primaryLight;
      case NotificationType.promo:
        return const Color(0xFFFEF3C7);
      case NotificationType.system:
        return const Color(0xFFE0F2FE);
    }
  }
}

