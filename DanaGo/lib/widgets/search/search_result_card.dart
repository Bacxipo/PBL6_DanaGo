import 'package:flutter/material.dart';
import 'package:smarttrip/models/search_result_item.dart';
import 'package:smarttrip/theme/app_colors.dart';

class SearchResultCard extends StatelessWidget {
  final SearchResultItem item;
  final VoidCallback? onTap;
  final VoidCallback? onFavoriteToggle;

  const SearchResultCard({
    super.key,
    required this.item,
    this.onTap,
    this.onFavoriteToggle,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: Theme.of(context).cardColor,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: isDark ? 0.2 : 0.04),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Ảnh điểm đến sạch sẽ, không còn badge đè lên góc ảnh
            ClipRRect(
              borderRadius: BorderRadius.circular(12),
              child: Image.network(
                item.imageUrl,
                width: 95,
                height: 95,
                fit: BoxFit.cover,
                errorBuilder: (ctx, err, _) => Container(
                  width: 95,
                  height: 95,
                  color: isDark
                      ? const Color(0xFF0F172A)
                      : AppColors.bgSecondary,
                  child: const Icon(
                    Icons.broken_image,
                    color: AppColors.textHint,
                    size: 28,
                  ),
                ),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(
                        child: Text(
                          item.title,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.bold,
                            color: isDark
                                ? Colors.white
                                : AppColors.textPrimary,
                          ),
                        ),
                      ),
                      GestureDetector(
                        onTap: onFavoriteToggle,
                        child: Icon(
                          item.isFavorite
                              ? Icons.favorite
                              : Icons.favorite_border_rounded,
                          color: item.isFavorite
                              ? Colors.red
                              : AppColors.textHint,
                          size: 18,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      const Icon(
                        Icons.location_on_outlined,
                        color: AppColors.textHint,
                        size: 13,
                      ),
                      const SizedBox(width: 2),
                      Expanded(
                        child: Text(
                          item.address,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                            fontSize: 12,
                            color: AppColors.textTertiary,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Row(
                    children: [
                      const Icon(
                        Icons.star_rounded,
                        color: AppColors.starActive,
                        size: 15,
                      ),
                      const SizedBox(width: 3),
                      Text(
                        '${item.rating}',
                        style: const TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: AppColors.textPrimary,
                        ),
                      ),
                      const SizedBox(width: 8),
                      const Icon(
                        Icons.near_me_rounded,
                        color: AppColors.textHint,
                        size: 13,
                      ),
                      const SizedBox(width: 2),
                      Text(
                        item.distance,
                        style: const TextStyle(
                          fontSize: 12,
                          color: AppColors.textTertiary,
                        ),
                      ),
                    ],
                  ),
                  // Thời gian mở cửa / Trạng thái
                  if (item.tagLabel != null) ...[
                    const SizedBox(height: 6),
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 8,
                        vertical: 3,
                      ),
                      decoration: BoxDecoration(
                        color: AppColors.primaryLight,
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        item.tagLabel!,
                        style: const TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                          color: AppColors.primary,
                        ),
                      ),
                    ),
                  ],
                  // Thẻ danh mục (Hải sản tươi, Biển & Đảo, View Vịnh Biển...) đẩy xuống dưới Thời gian mở cửa
                  if (item.badge.isNotEmpty) ...[
                    const SizedBox(height: 4),
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 8,
                        vertical: 3,
                      ),
                      decoration: BoxDecoration(
                        color: item.badgeColor.withValues(alpha: 0.12),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        item.badge,
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                          color: item.badgeColor,
                        ),
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _formatReviewCount(int count) {
    if (count >= 1000) {
      return '${(count / 1000).toStringAsFixed(1)}k';
    }
    return '$count';
  }
}
