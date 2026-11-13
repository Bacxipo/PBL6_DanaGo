import 'package:flutter/material.dart';
import 'package:smarttrip/theme/app_colors.dart';

class AIFilterSection extends StatelessWidget {
  final String selectedRegion;
  final List<String> regions;
  final ValueChanged<String?> onRegionChanged;

  final Set<String> selectedInterests;
  final List<Map<String, dynamic>> interestGroups;
  final Function(String, bool) onInterestToggled;

  final double budget; // Đơn vị: Triệu VNĐ (ví dụ 1.5, 5.0)
  final ValueChanged<double> onBudgetChanged;

  final VoidCallback onReset;
  final VoidCallback onApply;

  const AIFilterSection({
    super.key,
    required this.selectedRegion,
    required this.regions,
    required this.onRegionChanged,
    required this.selectedInterests,
    required this.interestGroups,
    required this.onInterestToggled,
    required this.budget,
    required this.onBudgetChanged,
    required this.onReset,
    required this.onApply,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      margin: const EdgeInsets.fromLTRB(16, 4, 16, 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: isDark ? Colors.white12 : Colors.grey.shade200,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: isDark ? 0.2 : 0.03),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Tiêu đề & Nút đặt lại (Reset)
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  const Icon(
                    Icons.tune_rounded,
                    size: 18,
                    color: AppColors.primary,
                  ),
                  const SizedBox(width: 8),
                  Text(
                    'Bộ lọc & Yêu cầu ưu tiên',
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 14,
                      color: isDark ? Colors.white : AppColors.textPrimary,
                    ),
                  ),
                ],
              ),
              GestureDetector(
                onTap: onReset,
                child: const Row(
                  children: [
                    Icon(Icons.refresh_rounded, size: 14, color: Colors.grey),
                    SizedBox(width: 4),
                    Text(
                      'Đặt lại',
                      style: TextStyle(fontSize: 12, color: Colors.grey),
                    ),
                  ],
                ),
              ),
            ],
          ),
          Divider(
            height: 20,
            color: isDark ? Colors.white12 : AppColors.divider,
          ),
          // 1. CHỌN KHU VỰC ƯU TIÊN
          Text(
            'Khu vực ưu tiên',
            style: TextStyle(
              fontWeight: FontWeight.bold,
              fontSize: 13,
              color: isDark ? Colors.white : AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14),
            decoration: BoxDecoration(
              color: isDark ? const Color(0xFF0F172A) : Colors.grey.shade50,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: isDark ? Colors.white12 : Colors.grey.shade200,
              ),
            ),
            child: DropdownButtonHideUnderline(
              child: DropdownButton<String>(
                value: selectedRegion,
                isExpanded: true,
                dropdownColor: isDark ? const Color(0xFF1E293B) : Colors.white,
                icon: const Icon(
                  Icons.keyboard_arrow_down_rounded,
                  color: AppColors.primary,
                ),
                items: regions.map((r) {
                  return DropdownMenuItem(
                    value: r,
                    child: Text(
                      r,
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w500,
                        color: isDark ? Colors.white : AppColors.textPrimary,
                      ),
                    ),
                  );
                }).toList(),
                onChanged: onRegionChanged,
              ),
            ),
          ),
          const SizedBox(height: 16),

          // ==========================================
          // 2. NGÂN SÁCH DỰ KIẾN (SLIDER)
          // ==========================================
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Ngân sách mỗi người',
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 13,
                  color: isDark ? Colors.white : AppColors.textPrimary,
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 10,
                  vertical: 3,
                ),
                decoration: BoxDecoration(
                  color: AppColors.primary.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  budget >= 20
                      ? '20Tr+ VNĐ'
                      : '${budget.toStringAsFixed(1)} Triệu VNĐ',
                  style: const TextStyle(
                    color: AppColors.primary,
                    fontWeight: FontWeight.bold,
                    fontSize: 12,
                  ),
                ),
              ),
            ],
          ),
          SliderTheme(
            data: SliderTheme.of(context).copyWith(
              activeTrackColor: AppColors.primary,
              inactiveTrackColor: isDark
                  ? Colors.white12
                  : Colors.grey.shade200,
              thumbColor: AppColors.primary,
              trackHeight: 4,
            ),
            child: Slider(
              value: budget,
              min: 0.5,
              max: 20.0,
              divisions: 39,
              onChanged: onBudgetChanged,
            ),
          ),
          const SizedBox(height: 12),

          // ==========================================
          // 3. 5 NHÓM SỞ THÍCH CHUẨN AI (CHIPS)
          // ==========================================
          Text(
            'Nhóm sở thích của bạn',
            style: TextStyle(
              fontWeight: FontWeight.bold,
              fontSize: 13,
              color: isDark ? Colors.white : AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: interestGroups.map((group) {
              final name = group['name'] as String;
              final icon = group['icon'] as IconData;
              final isSel = selectedInterests.contains(name);

              return FilterChip(
                avatar: Icon(
                  icon,
                  size: 15,
                  color: isSel
                      ? Colors.white
                      : (isDark
                            ? Colors.grey.shade400
                            : AppColors.textSecondary),
                ),
                label: Text(
                  name,
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: isSel ? FontWeight.bold : FontWeight.normal,
                    color: isSel
                        ? Colors.white
                        : (isDark
                              ? Colors.grey.shade200
                              : AppColors.textPrimary),
                  ),
                ),
                selected: isSel,
                selectedColor: AppColors.primary,
                backgroundColor: isDark
                    ? const Color(0xFF0F172A)
                    : Colors.grey.shade50,
                showCheckmark: false,
                side: BorderSide(
                  color: isSel
                      ? AppColors.primary
                      : (isDark ? Colors.white12 : Colors.grey.shade200),
                ),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                onSelected: (val) => onInterestToggled(name, val),
              );
            }).toList(),
          ),
          const SizedBox(height: 16),

          // Nút áp dụng bộ lọc
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: onApply,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(14),
                ),
                padding: const EdgeInsets.symmetric(vertical: 12),
              ),
              child: const Text(
                'Áp dụng bộ lọc',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
