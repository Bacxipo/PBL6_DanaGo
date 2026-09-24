import 'package:flutter/material.dart';
import 'package:smarttrip/theme/app_colors.dart';

class DurationSlider extends StatelessWidget {
  final double days;
  final ValueChanged<double> onChanged;
  const DurationSlider({
    super.key,
    required this.days,
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
              Icons.calendar_month_outlined,
              color: AppColors.primary,
              size: 22,
            ),
            const SizedBox(width: 8),
            const Text(
              'Số ngày lưu trú : ',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: Colors.black,
              ),
            ),
            Text(
              '${days.toInt()} ngày',
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
            value: days,
            min: 1,
            max: 7,
            divisions: 6,
            onChanged: onChanged,
          ),
        ),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: List.generate(7, (i) {
            final isCurrent = days.toInt() == (i + 1);
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
