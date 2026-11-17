import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:smarttrip/theme/app_colors.dart';

class ProfileMenuItem {
  final IconData icon;
  final String title;
  final String? subtitle;
  final Widget? trailing;
  final VoidCallback onTap;
  final Color? iconBgColor;

  const ProfileMenuItem({
    required this.icon,
    required this.title,
    this.subtitle,
    this.trailing,
    required this.onTap,
    this.iconBgColor,
  });
}

/// Authentic Apple iOS Settings Inset-Grouped List Section:
/// Colorful 32x32 iOS squircle icon badges + crisp indented hairline separators.
class ProfileMenuSection extends StatelessWidget {
  final List<ProfileMenuItem> items;

  const ProfileMenuSection({super.key, required this.items});

  Color _defaultBadgeColor(IconData icon) {
    if (icon == Icons.favorite_outline_rounded || icon == Icons.favorite) {
      return const Color(0xFFFF3B30); // Apple System Red
    }
    if (icon == Icons.map_outlined || icon == Icons.calendar_month_rounded) {
      return const Color(0xFF007A85); // DanaGo Teal
    }
    if (icon == Icons.star_outline_rounded || icon == Icons.star_rounded) {
      return const Color(0xFFFF9500); // Apple System Orange
    }
    if (icon == Icons.notifications_none_rounded) {
      return const Color(0xFFFF3B30); // Apple Notification Red
    }
    if (icon == Icons.language_rounded) {
      return const Color(0xFF007AFF); // Apple System Blue
    }
    if (icon == Icons.dark_mode_outlined) {
      return const Color(0xFF5856D6); // Apple System Indigo
    }
    if (icon == Icons.lock_outline_rounded) {
      return const Color(0xFF34C759); // Apple System Green
    }
    if (icon == Icons.article_outlined) {
      return const Color(0xFF0284C7);
    }
    return const Color(0xFF64748B);
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 20),
      decoration: BoxDecoration(
        color: AppColors.surfaceGrouped(context),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: AppColors.hairlineBorder(context),
          width: 0.85,
        ),
      ),
      child: Column(
        children: items.asMap().entries.map((entry) {
          final index = entry.key;
          final item = entry.value;
          final isLast = index == items.length - 1;
          final badgeColor = item.iconBgColor ?? _defaultBadgeColor(item.icon);

          return Column(
            children: [
              Material(
                color: Colors.transparent,
                child: InkWell(
                  onTap: () {
                    HapticFeedback.selectionClick();
                    item.onTap();
                  },
                  borderRadius: BorderRadius.vertical(
                    top: index == 0 ? const Radius.circular(20) : Radius.zero,
                    bottom: isLast ? const Radius.circular(20) : Radius.zero,
                  ),
                  child: Padding(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 14,
                      vertical: 12,
                    ),
                    child: Row(
                      children: [
                        // Authentic iOS Settings 32x32 colorful squircle icon badge
                        Container(
                          width: 32,
                          height: 32,
                          decoration: BoxDecoration(
                            color: badgeColor,
                            borderRadius: BorderRadius.circular(9),
                          ),
                          child: Icon(
                            item.icon,
                            size: 18,
                            color: Colors.white,
                          ),
                        ),
                        const SizedBox(width: 14),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                item.title,
                                style: TextStyle(
                                  fontFamily: 'Be Vietnam Pro',
                                  fontSize: 15,
                                  fontWeight: FontWeight.w600,
                                  letterSpacing: -0.15,
                                  color: AppColors.labelPrimary(context),
                                ),
                              ),
                              if (item.subtitle != null) ...[
                                const SizedBox(height: 1.5),
                                Text(
                                  item.subtitle!,
                                  style: TextStyle(
                                    fontFamily: 'Be Vietnam Pro',
                                    fontSize: 12,
                                    color: AppColors.labelSecondary(context),
                                  ),
                                ),
                              ],
                            ],
                          ),
                        ),
                        if (item.trailing != null)
                          item.trailing!
                        else
                          Icon(
                            Icons.chevron_right_rounded,
                            size: 20,
                            color: AppColors.labelSecondary(context).withValues(
                              alpha: 0.6,
                            ),
                          ),
                      ],
                    ),
                  ),
                ),
              ),
              if (!isLast)
                Padding(
                  padding: const EdgeInsets.only(left: 60),
                  child: Divider(
                    height: 0.6,
                    thickness: 0.6,
                    color: AppColors.hairlineBorder(context),
                  ),
                ),
            ],
          );
        }).toList(),
      ),
    );
  }
}
