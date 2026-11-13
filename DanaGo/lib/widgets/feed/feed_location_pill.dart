import 'package:flutter/material.dart';
import 'package:smarttrip/theme/app_colors.dart';

class FeedLocationPill extends StatelessWidget {
  final String locationName;
  final VoidCallback? onTap;

  const FeedLocationPill({
    super.key,
    required this.locationName,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(20),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
        decoration: BoxDecoration(
          color: isDark ? const Color(0xFF0F172A) : const Color(0xFFEFF5F5),
          borderRadius: BorderRadius.circular(20),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(
              Icons.location_on_rounded,
              size: 14,
              color: AppColors.accent,
            ),
            const SizedBox(width: 4),
            Flexible(
              child: Text(
                locationName,
                style: TextStyle(
                  fontFamily: 'Be Vietnam Pro',
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                  color: isDark ? const Color(0xFF2DD4BF) : AppColors.primary,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ),
            const SizedBox(width: 4),
            Icon(
              Icons.arrow_forward_ios_rounded,
              size: 10,
              color: isDark ? const Color(0xFF2DD4BF) : AppColors.primary,
            ),
          ],
        ),
      ),
    );
  }
}

