import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:smarttrip/theme/app_colors.dart';

/// Apple Health / Account 3-column grouped metrics bar
class ProfileStatsPill extends StatelessWidget {
  final int tripsCount;
  final int reviewsCount;
  final int favoritesCount;
  final VoidCallback? onTripsTap;
  final VoidCallback? onReviewsTap;
  final VoidCallback? onFavoritesTap;

  const ProfileStatsPill({
    super.key,
    required this.tripsCount,
    required this.reviewsCount,
    required this.favoritesCount,
    this.onTripsTap,
    this.onReviewsTap,
    this.onFavoritesTap,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.fromLTRB(20, 6, 20, 10),
      padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 8),
      decoration: BoxDecoration(
        color: AppColors.surfaceGrouped(context),
        borderRadius: BorderRadius.circular(22),
        border: Border.all(
          color: AppColors.hairlineBorder(context),
          width: 0.85,
        ),
      ),
      child: Row(
        children: [
          _buildStatItem(
            context: context,
            count: '$tripsCount',
            label: 'Lịch trình',
            color: AppColors.accentOf(context),
            onTap: onTripsTap,
          ),
          _buildDividerVertical(context),
          _buildStatItem(
            context: context,
            count: '$reviewsCount',
            label: 'Đánh giá',
            color: AppColors.starActive,
            onTap: onReviewsTap,
          ),
          _buildDividerVertical(context),
          _buildStatItem(
            context: context,
            count: '$favoritesCount',
            label: 'Yêu thích',
            color: AppColors.error,
            onTap: onFavoritesTap,
          ),
        ],
      ),
    );
  }

  Widget _buildStatItem({
    required BuildContext context,
    required String count,
    required String label,
    required Color color,
    VoidCallback? onTap,
  }) {
    return Expanded(
      child: InkWell(
        onTap: () {
          HapticFeedback.selectionClick();
          onTap?.call();
        },
        borderRadius: BorderRadius.circular(14),
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 4),
          child: Column(
            children: [
              Text(
                count,
                style: TextStyle(
                  fontFamily: 'Be Vietnam Pro',
                  fontSize: 22,
                  fontWeight: FontWeight.w800,
                  letterSpacing: -0.5,
                  color: color,
                ),
              ),
              const SizedBox(height: 3),
              Text(
                label,
                style: TextStyle(
                  fontFamily: 'Be Vietnam Pro',
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: AppColors.labelSecondary(context),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildDividerVertical(BuildContext context) {
    return Container(
      width: 0.7,
      height: 34,
      color: AppColors.hairlineBorder(context),
    );
  }
}
