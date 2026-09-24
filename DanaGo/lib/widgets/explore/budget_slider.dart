import 'package:flutter/material.dart';
import 'package:smarttrip/theme/app_colors.dart';

class BudgetSlider extends StatelessWidget {
  final double budget;
  final ValueChanged<double> onChanged;

  const BudgetSlider({
    super.key,
    required this.budget,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            const Icon(
              Icons.account_balance_wallet_outlined,
              color: AppColors.primary,
              size: 22,
            ),
            const SizedBox(width: 8),
            const Text(
              'Ngân sách dự kiến : ',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: Colors.black,
              ),
            ),
            Text(
              '${budget.toInt()} Tr VNĐ',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: AppColors.primary,
              ),
            ),
          ],
        ),
        const SizedBox(height: 8),
        SliderTheme(
          data: SliderTheme.of(context).copyWith(
            activeTrackColor: AppColors.primary,
            inactiveTrackColor: const Color(0xFFE5E7EB),
            thumbColor: AppColors.primary,
            overlayColor: AppColors.primary.withValues(alpha: 0.12),
            trackHeight: 6,
          ),
          child: Slider(
            value: budget,
            min: 1,
            max: 20,
            divisions: 20,
            onChanged: onChanged,
          ),
        ),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: List.generate(7, (i) {
            final isCurrent = budget.toInt() == (i + 1);
            return Text(
              '${i + 1}',
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.bold,
                color: isCurrent ? AppColors.primary : const Color(0xFF9CA3AF),
              ),
            );
          }),
        ),
      ],
    );
  }
}
