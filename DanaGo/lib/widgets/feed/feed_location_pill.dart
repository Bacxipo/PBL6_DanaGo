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
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(20),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
        decoration: BoxDecoration(
          color: const Color(0xFFEFF5F5),
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
                style: const TextStyle(
                  fontFamily: 'Be Vietnam Pro',
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                  color: AppColors.primary,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ),
            const SizedBox(width: 4),
            const Icon(
              Icons.arrow_forward_ios_rounded,
              size: 10,
              color: AppColors.primary,
            ),
          ],
        ),
      ),
    );
  }
}

