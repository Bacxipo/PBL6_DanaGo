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
    switch (category.toLowerCase()) {
      case 'tất cả':
        return Icons.explore_rounded;
      case 'biển':
        return Icons.beach_access_rounded;
      case 'ẩm thực':
        return Icons.restaurant_rounded;
      case 'di tích':
        return Icons.museum_rounded;
      case 'trekking':
        return Icons.hiking_rounded;
      case 'cafe':
        return Icons.local_cafe_rounded;
      case 'mua sắm':
        return Icons.shopping_bag_rounded;
      case 'khu du lịch':
        return Icons.attractions_rounded;
      default:
        return Icons.place_rounded;
    }
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
                              color: Colors.black.withValues(alpha: isDark ? 0.2 : 0.02),
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
                              : (isDark ? Colors.grey.shade200 : AppColors.textPrimary),
                          fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
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
