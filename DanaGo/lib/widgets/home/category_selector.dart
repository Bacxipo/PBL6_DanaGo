import 'package:flutter/material.dart';
import 'package:smarttrip/theme/app_colors.dart';

// Thanh chọn danh mục cuộn ngang với icon trực quan
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
    if (lower.contains('tất cả')) {
      return Icons.explore_rounded;
    }
    if (lower.contains('biển')) {
      return Icons.beach_access_rounded;
    }
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

    return SizedBox(
      height: 42,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        physics: const BouncingScrollPhysics(),
        itemCount: categories.length,
        itemBuilder: (context, index) {
          final bool isSelected = selectedIndex == index;
          final catName = categories[index];
          final icon = _getCategoryIcon(catName);

          return Padding(
            padding: const EdgeInsets.only(right: 10),
            child: Material(
              color: Colors.transparent,
              child: InkWell(
                onTap: () => onSelect(index),
                borderRadius: BorderRadius.circular(22),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 250),
                  curve: Curves.easeOutCubic,
                  padding: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 8,
                  ),
                  decoration: BoxDecoration(
                    color: isSelected
                        ? AppColors.primary
                        : (isDark ? const Color(0xFF1E293B) : Colors.white),
                    borderRadius: BorderRadius.circular(22),
                    border: Border.all(
                      color: isSelected
                          ? AppColors.primary
                          : (isDark ? Colors.white12 : AppColors.border),
                      width: 1,
                    ),
                    boxShadow: isSelected
                        ? [
                            BoxShadow(
                              color: AppColors.primary.withValues(alpha: 0.25),
                              blurRadius: 8,
                              offset: const Offset(0, 3),
                            ),
                          ]
                        : [
                            BoxShadow(
                              color: Colors.black.withValues(
                                alpha: isDark ? 0.2 : 0.02,
                              ),
                              blurRadius: 4,
                              offset: const Offset(0, 1),
                            ),
                          ],
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        icon,
                        size: 16,
                        color: isSelected ? Colors.white : AppColors.primary,
                      ),
                      const SizedBox(width: 6),
                      Text(
                        catName,
                        style: TextStyle(
                          fontFamily: 'Be Vietnam Pro',
                          color: isSelected
                              ? Colors.white
                              : (isDark
                                    ? Colors.grey.shade200
                                    : AppColors.textPrimary),
                          fontWeight: isSelected
                              ? FontWeight.w700
                              : FontWeight.w500,
                          fontSize: 13,
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
