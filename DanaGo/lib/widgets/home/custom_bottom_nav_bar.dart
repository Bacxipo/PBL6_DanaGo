import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:smarttrip/services/notification_service.dart';
import 'package:smarttrip/theme/app_colors.dart';
import 'package:smarttrip/widgets/common/liquid_glass_surface.dart';

class NavItemData {
  final IconData icon;
  final IconData activeIcon;
  final String label;
  const NavItemData({
    required this.icon,
    required this.activeIcon,
    required this.label,
  });
}

/// iOS 26 Floating Liquid Glass Dock:
/// - True frosted translucent pill floating over content
/// - Elevated specular glass lens behind the active tab
/// - Stacked Apple Tab Bar icon + compact crisp label on every tab
class CustomBottomNavBar extends StatelessWidget {
  final int currentIndex;
  final ValueChanged<int> onTap;

  const CustomBottomNavBar({
    super.key,
    required this.currentIndex,
    required this.onTap,
  });

  static const List<NavItemData> _items = [
    NavItemData(
      icon: Icons.home_outlined,
      activeIcon: Icons.home_rounded,
      label: 'Trang chủ',
    ),
    NavItemData(
      icon: Icons.explore_outlined,
      activeIcon: Icons.explore_rounded,
      label: 'Khám phá',
    ),
    NavItemData(
      icon: Icons.calendar_today_outlined,
      activeIcon: Icons.calendar_month_rounded,
      label: 'Lịch trình',
    ),
    NavItemData(
      icon: Icons.forum_outlined,
      activeIcon: Icons.forum_rounded,
      label: 'Bảng tin',
    ),
    NavItemData(
      icon: Icons.auto_awesome_outlined,
      activeIcon: Icons.auto_awesome_rounded,
      label: 'AI Plan',
    ),
    NavItemData(
      icon: Icons.person_outline_rounded,
      activeIcon: Icons.person_rounded,
      label: 'Cá nhân',
    ),
  ];

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final activeAccent = AppColors.accentOf(context);
    final inactiveColor = isDark
        ? Colors.white.withValues(alpha: 0.62)
        : const Color(0xFF475569);
    final bottomInset = MediaQuery.of(context).padding.bottom;

    return Padding(
      padding: EdgeInsets.fromLTRB(
        10,
        0,
        10,
        bottomInset > 0 ? bottomInset + 6 : 12,
      ),
      child: ListenableBuilder(
        listenable: NotificationService.instance,
        builder: (context, _) {
          final unreadCount = NotificationService.instance.unreadCount;
          return LiquidGlassSurface(
            borderRadius: BorderRadius.circular(32),
            padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 5),
            child: Row(
              children: List.generate(_items.length, (index) {
                final isSelected = currentIndex == index;
                final item = _items[index];
                final showFeedBadge = index == 3 && unreadCount > 0;

                return Expanded(
                  child: Semantics(
                    button: true,
                    selected: isSelected,
                    label: item.label,
                    child: GestureDetector(
                      onTap: () {
                        if (!isSelected) {
                          HapticFeedback.selectionClick();
                        }
                        onTap(index);
                      },
                      behavior: HitTestBehavior.opaque,
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 220),
                        curve: Curves.easeOutCubic,
                        height: 52,
                        decoration: BoxDecoration(
                          color: isSelected
                              ? (isDark
                                  ? Colors.white.withValues(alpha: 0.16)
                                  : Colors.white.withValues(alpha: 0.90))
                              : Colors.transparent,
                          borderRadius: BorderRadius.circular(26),
                          border: isSelected
                              ? Border.all(
                                  color: isDark
                                      ? Colors.white.withValues(alpha: 0.22)
                                      : Colors.white,
                                  width: 0.9,
                                )
                              : null,
                          boxShadow: isSelected
                              ? [
                                  BoxShadow(
                                    color: Colors.black.withValues(
                                      alpha: isDark ? 0.28 : 0.08,
                                    ),
                                    blurRadius: 10,
                                    offset: const Offset(0, 3),
                                  ),
                                ]
                              : null,
                        ),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Stack(
                              clipBehavior: Clip.none,
                              children: [
                                Icon(
                                  isSelected ? item.activeIcon : item.icon,
                                  color: isSelected
                                      ? activeAccent
                                      : inactiveColor,
                                  size: isSelected ? 22 : 20,
                                ),
                                if (showFeedBadge)
                                  Positioned(
                                    right: -5,
                                    top: -3,
                                    child: Container(
                                      width: 8,
                                      height: 8,
                                      decoration: BoxDecoration(
                                        color: AppColors.error,
                                        shape: BoxShape.circle,
                                        border: Border.all(
                                          color: isDark
                                              ? const Color(0xFF131C26)
                                              : Colors.white,
                                          width: 1.4,
                                        ),
                                      ),
                                    ),
                                  ),
                              ],
                            ),
                            const SizedBox(height: 2.5),
                            Text(
                              item.label,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: TextStyle(
                                fontFamily: 'Be Vietnam Pro',
                                color:
                                    isSelected ? activeAccent : inactiveColor,
                                fontSize: 9.5,
                                fontWeight: isSelected
                                    ? FontWeight.w700
                                    : FontWeight.w500,
                                letterSpacing: -0.1,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                );
              }),
            ),
          );
        },
      ),
    );
  }
}
