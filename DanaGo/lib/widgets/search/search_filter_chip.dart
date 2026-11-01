import 'package:flutter/material.dart';
import 'package:smarttrip/theme/app_colors.dart';

class SearchFilterChips extends StatelessWidget {
  final List<String> chips;
  final Set<String> activeChips;
  final ValueChanged<String> onToggle;

  const SearchFilterChips({
    super.key,
    required this.chips,
    required this.activeChips,
    required this.onToggle,
  });

  IconData? _getChipIcon(String label) {
    if (label.contains('Gần tôi')) return Icons.navigation_rounded;
    if (label.contains('Đang mở cửa')) return Icons.access_time_rounded;
    if (label.contains('Đánh giá')) return Icons.star_rounded;
    return null;
  }

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 38,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 16),
        itemCount: chips.length,
        itemBuilder: (context, index) {
          final String label = chips[index];
          final bool isActive = activeChips.contains(label);
          final IconData? icon = _getChipIcon(label);

          return Padding(
            padding: const EdgeInsets.only(right: 8),
            child: GestureDetector(
              onTap: () => onToggle(label),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 200),
                padding: const EdgeInsets.symmetric(
                  horizontal: 14,
                  vertical: 8,
                ),
                decoration: BoxDecoration(
                  color: isActive ? AppColors.primary : Colors.white,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(
                    color: isActive
                        ? AppColors.primary
                        : const Color(0xFFE5E7EB),
                  ),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    if (icon != null) ...[
                      Icon(
                        icon,
                        size: 14,
                        color: isActive
                            ? Colors.white
                            : (label.contains('Đánh giá')
                                  ? Colors.amber
                                  : const Color(0xFF6B7280)),
                      ),
                      const SizedBox(width: 5),
                    ],
                    Text(
                      label,
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: isActive
                            ? Colors.white
                            : const Color(0xFF374151),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}
