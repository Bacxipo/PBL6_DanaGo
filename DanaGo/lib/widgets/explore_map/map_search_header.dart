import 'package:flutter/material.dart';
import 'package:smarttrip/models/search_filter_model.dart';
import 'package:smarttrip/theme/app_colors.dart';
import 'package:smarttrip/widgets/search/search_filter_chip.dart';

class MapSearchHeader extends StatelessWidget {
  final TextEditingController controller;
  final VoidCallback onFilterTap;
  final Set<String> activeChips;
  final ValueChanged<String> onChipToggle;
  final ValueChanged<String>? onSearchChanged;

  const MapSearchHeader({
    super.key,
    required this.controller,
    required this.onFilterTap,
    required this.activeChips,
    required this.onChipToggle,
    this.onSearchChanged,
  });

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const SizedBox(height: 8),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Container(
              height: 48,
              padding: const EdgeInsets.symmetric(horizontal: 14),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(24),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.08),
                    blurRadius: 15,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Row(
                children: [
                  const Icon(Icons.search, color: AppColors.primary, size: 22),
                  const SizedBox(width: 10),
                  Expanded(
                    child: TextField(
                      controller: controller,
                      onChanged: onSearchChanged,
                      style: const TextStyle(fontSize: 14),
                      decoration: const InputDecoration(
                        hintText: 'Bạn muốn đi đâu ở Đà Nẵng?',
                        hintStyle: TextStyle(
                          color: Color(0xFF9CA3AF),
                          fontSize: 14,
                        ),
                        border: InputBorder.none,
                      ),
                    ),
                  ),
                  Container(
                    height: 20,
                    width: 1,
                    color: const Color(0xFFE5E7EB),
                  ),
                  const SizedBox(width: 6),
                  IconButton(
                    onPressed: onFilterTap,
                    icon: const Icon(
                      Icons.tune_rounded,
                      color: Color(0xFF6B7280),
                      size: 20,
                    ),
                    padding: EdgeInsets.zero,
                    constraints: const BoxConstraints(),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 12),
          SearchFilterChips(
            chips: SearchFilterModel.quickFilters,
            activeChips: activeChips,
            onToggle: onChipToggle,
          ),
        ],
      ),
    );
  }
}
