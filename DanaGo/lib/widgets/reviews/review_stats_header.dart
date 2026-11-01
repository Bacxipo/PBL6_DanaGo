import 'package:flutter/material.dart';
import 'package:smarttrip/theme/app_colors.dart';

class ReviewStatsHeader extends StatelessWidget {
  final double averageRating;
  final int totalReviews;
  final int totalHelpful;

  const ReviewStatsHeader({
    super.key,
    required this.averageRating,
    required this.totalReviews,
    required this.totalHelpful,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [
            AppColors.primary,
            Color(0xFF0D9488),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: AppColors.primary.withValues(alpha: 0.25),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          // Average Rating
          Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(
                    Icons.star_rounded,
                    color: AppColors.starActive,
                    size: 26,
                  ),
                  const SizedBox(width: 4),
                  Text(
                    averageRating.toStringAsFixed(1),
                    style: const TextStyle(
                      fontFamily: 'Be Vietnam Pro',
                      fontSize: 22,
                      fontWeight: FontWeight.w800,
                      color: Colors.white,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 4),
              const Text(
                'Điểm trung bình',
                style: TextStyle(
                  fontFamily: 'Be Vietnam Pro',
                  fontSize: 12,
                  color: Colors.white70,
                ),
              ),
            ],
          ),

          Container(
            height: 36,
            width: 1,
            color: Colors.white.withValues(alpha: 0.2),
          ),

          // Total Reviews
          Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                '$totalReviews',
                style: const TextStyle(
                  fontFamily: 'Be Vietnam Pro',
                  fontSize: 22,
                  fontWeight: FontWeight.w800,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 4),
              const Text(
                'Đánh giá đã viết',
                style: TextStyle(
                  fontFamily: 'Be Vietnam Pro',
                  fontSize: 12,
                  color: Colors.white70,
                ),
              ),
            ],
          ),

          Container(
            height: 36,
            width: 1,
            color: Colors.white.withValues(alpha: 0.2),
          ),

          // Helpful count
          Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                '$totalHelpful',
                style: const TextStyle(
                  fontFamily: 'Be Vietnam Pro',
                  fontSize: 22,
                  fontWeight: FontWeight.w800,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 4),
              const Text(
                'Lượt hữu ích',
                style: TextStyle(
                  fontFamily: 'Be Vietnam Pro',
                  fontSize: 12,
                  color: Colors.white70,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

