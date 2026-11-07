import 'package:flutter/material.dart';
import 'package:smarttrip/theme/app_colors.dart';

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
      icon: Icons.calendar_month_outlined,
      activeIcon: Icons.calendar_month_rounded,
      label: 'Lịch trình',
    ),
    NavItemData(
      icon: Icons.message_outlined,
      activeIcon: Icons.message_outlined,
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
    return Container(
      margin: const EdgeInsets.only(left: 10, right: 10, bottom: 20),
      padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 6),
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
        borderRadius: BorderRadius.circular(30), // Bo tròn
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.08),
            blurRadius: 20,
            spreadRadius: 2,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: List.generate(_items.length, (index) {
          final isSelected = currentIndex == index;
          final item = _items[index];
          return GestureDetector(
            onTap: () => onTap(index),
            behavior: HitTestBehavior.opaque,
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 280),
              curve: Curves.easeOutCubic,
              padding: EdgeInsets.symmetric(
                horizontal: isSelected ? 14 : 10,
                vertical: 8,
              ),
              decoration: BoxDecoration(
                color: isSelected ? AppColors.primary : Colors.transparent,
                borderRadius: BorderRadius.circular(20),
                boxShadow: isSelected
                    ? [
                        BoxShadow(
                          color: AppColors.primary.withValues(alpha: 0.35),
                          blurRadius: 10,
                          offset: const Offset(0, 4),
                        ),
                      ]
                    : [],
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  AnimatedScale(
                    scale: isSelected ? 1.1 : 1.0,
                    duration: const Duration(milliseconds: 200),
                    child: Icon(
                      isSelected ? item.activeIcon : item.icon,
                      color: isSelected
                          ? Colors.white
                          : const Color(0xFF9CA3AF),
                      size: 20,
                    ),
                  ),
                  if (isSelected) ...[
                    const SizedBox(width: 6),
                    AnimatedOpacity(
                      opacity: isSelected ? 1.0 : 0.0,
                      duration: const Duration(milliseconds: 200),
                      child: Text(
                        item.label,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ],
                ],
              ),
            ),
          );
        }),
      ),
    );
  }
}
