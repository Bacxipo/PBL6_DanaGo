import 'package:flutter/material.dart';
import 'package:smarttrip/theme/app_colors.dart';

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
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      margin: const EdgeInsets.fromLTRB(20, 16, 20, 12),
      padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 12),
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
        borderRadius: BorderRadius.circular(30), // Bo tròn dạng viên thuốc
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: isDark ? 0.2 : 0.06),
            blurRadius: 16,
            spreadRadius: 1,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Row(
        children: [
          _buildStatItem(
            context: context,
            count: '$tripsCount',
            label: 'Lịch trình',
            icon: Icons.map_rounded,
            color: AppColors.primary,
            onTap: onTripsTap,
          ),
          _buildDividerVertical(isDark),
          _buildStatItem(
            context: context,
            count: '$reviewsCount',
            label: 'Đánh giá',
            icon: Icons.star_rounded,
            color: AppColors.accentLight,
            onTap: onReviewsTap,
          ),
          _buildDividerVertical(isDark),
          _buildStatItem(
            context: context,
            count: '$favoritesCount',
            label: 'Yêu thích',
            icon: Icons.favorite_rounded,
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
    required IconData icon,
    required Color color,
    VoidCallback? onTap,
  }) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Expanded(
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(20),
        child: Column(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(icon, size: 20, color: color),
            ),
            const SizedBox(height: 8),
            Text(
              count,
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: isDark ? Colors.white : AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: 2),
            Text(
              label,
              style: TextStyle(
                fontSize: 12,
                color: isDark ? const Color(0xFF94A3B8) : AppColors.textTertiary,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDividerVertical(bool isDark) {
    return Container(
      width: 1,
      height: 42,
      color: isDark ? const Color(0xFF334155) : AppColors.divider,
    );
  }
}

