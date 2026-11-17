import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:smarttrip/theme/app_colors.dart';

// Thanh chọn danh mục cuộn ngang phong cách Apple HIG (clean pill + hairline border + haptic)
class CategorySelector extends StatelessWidget {
  final List<String> categories;
  final int selectedIndex;
  final ValueChanged<int> onSelect;

  const CategorySelector({
    super.key,
    required this.categories,
    required this.selectedIndex,
    required this.onSelect,
  });

  IconData _getCategoryIcon(String category) {
    final lower = category.toLowerCase();
    if (lower.contains('tất cả')) return Icons.explore_rounded;
    if (lower.contains('biển')) return Icons.beach_access_rounded;
    if (lower.contains('ẩm thực') ||
        lower.contains('quán ăn') ||
        lower.contains('nhà hàng')) {
      return Icons.restaurant_rounded;
    }
    if (lower.contains('cà phê') ||
        lower.contains('tiệm trà') ||
        lower.contains('cafe')) {
      return Icons.local_cafe_rounded;
    }
    if (lower.contains('bảo tàng') || lower.contains('nghệ thuật')) {
      return Icons.museum_rounded;
    }
    if (lower.contains('di tích') || lower.contains('lịch sử')) {
      return Icons.account_balance_rounded;
    }
    if (lower.contains('check-in') ||
        lower.contains('kiến trúc') ||
        lower.contains('danh thắng')) {
      return Icons.photo_camera_rounded;
    }
    if (lower.contains('cắm trại') ||
        lower.contains('trekking') ||
        lower.contains('leo núi')) {
      return Icons.hiking_rounded;
    }
    if (lower.contains('vui chơi') ||
        lower.contains('nghỉ dưỡng') ||
        lower.contains('khu du lịch')) {
      return Icons.attractions_rounded;
    }
    if (lower.contains('làng nghề') || lower.contains('truyền thống')) {
      return Icons.palette_rounded;
    }
    if (lower.contains('phố cổ') || lower.contains('đô thị')) {
      return Icons.location_city_rounded;
    }
    if (lower.contains('mua sắm') || lower.contains('chợ')) {
      return Icons.shopping_bag_rounded;
    }
    return Icons.place_rounded;
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final activeColor = AppColors.primary;

    return SizedBox(
      height: 40,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        physics: const BouncingScrollPhysics(),
        itemCount: categories.length,
        itemBuilder: (context, index) {
          final bool isSelected = selectedIndex == index;
          final catName = categories[index];
          final icon = _getCategoryIcon(catName);

          return Padding(
            padding: const EdgeInsets.only(right: 8),
            child: Semantics(
              button: true,
              selected: isSelected,
              label: catName,
              child: InkWell(
                onTap: () {
                  HapticFeedback.selectionClick();
                  onSelect(index);
                },
                borderRadius: BorderRadius.circular(20),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 220),
                  curve: Curves.easeOutCubic,
                  padding: const EdgeInsets.symmetric(
                    horizontal: 14,
                    vertical: 8,
                  ),
                  decoration: BoxDecoration(
                    color: isSelected
                        ? activeColor
                        : AppColors.surfaceGrouped(context),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(
                      color: isSelected
                          ? activeColor
                          : AppColors.hairlineBorder(context),
                      width: 0.9,
                    ),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        icon,
                        size: 16,
                        color: isSelected
                            ? Colors.white
                            : AppColors.accentOf(context),
                      ),
                      const SizedBox(width: 6),
                      Text(
                        catName,
                        style: TextStyle(
                          fontFamily: 'Be Vietnam Pro',
                          fontSize: 13,
                          fontWeight: isSelected
                              ? FontWeight.w700
                              : FontWeight.w500,
                          color: isSelected
                              ? Colors.white
                              : (isDark
                                  ? Colors.white.withValues(alpha: 0.9)
                                  : AppColors.textPrimary),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}
