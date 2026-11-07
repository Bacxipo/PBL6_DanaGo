import 'package:flutter/material.dart';
import 'package:smarttrip/models/review_item.dart';
import 'package:smarttrip/theme/app_colors.dart';

class DetailReviewsSection extends StatelessWidget {
  final List<ReviewItemModel> reviews;
  final VoidCallback onSeeAll;
  final VoidCallback onWriteReview;
  const DetailReviewsSection({
    super.key,
    required this.reviews,
    required this.onSeeAll,
    required this.onWriteReview,
  });
  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Column(
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Đánh giá nổi bật',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: isDark ? Colors.white : AppColors.textPrimary,
              ),
            ),
            Row(
              children: [
                // Nút Viết đánh giá
                GestureDetector(
                  onTap: onWriteReview,
                  child: Text(
                    '+ Viết đánh giá',
                    style: TextStyle(
                      color: isDark ? const Color(0xFF2DD4BF) : AppColors.primary,
                      fontWeight: FontWeight.bold,
                      fontSize: 14,
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                // Nút Xem tất cả
                GestureDetector(
                  onTap: onSeeAll,
                  child: const Text(
                    'Xem tất cả',
                    style: TextStyle(color: AppColors.textTertiary, fontSize: 13),
                  ),
                ),
              ],
            ),
          ],
        ),
        const SizedBox(height: 12),
        ListView.separated(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: reviews.length,
          separatorBuilder: (_, __) => const SizedBox(height: 12),
          itemBuilder: (context, index) {
            final review = reviews[index];
            return Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Theme.of(context).cardColor,
                borderRadius: BorderRadius.circular(16),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: isDark ? 0.2 : 0.03),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      CircleAvatar(
                        radius: 18,
                        backgroundImage: NetworkImage(review.avatarUrl),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              review.userName,
                              style: TextStyle(
                                fontWeight: FontWeight.bold,
                                fontSize: 14,
                                color: isDark ? Colors.white : AppColors.textPrimary,
                              ),
                            ),
                            Text(
                              review.timeAgo,
                              style: const TextStyle(
                                color: AppColors.textHint,
                                fontSize: 12,
                              ),
                            ),
                          ],
                        ),
                      ),
                      Row(
                        children: [
                          const Icon(Icons.star, color: AppColors.starActive, size: 16),
                          const SizedBox(width: 4),
                          Text(
                            review.rating.toStringAsFixed(1),
                            style: TextStyle(
                              fontWeight: FontWeight.bold,
                              fontSize: 13,
                              color: isDark ? Colors.white : Colors.black87,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  Text(
                    review.comment,
                    style: TextStyle(
                      fontSize: 13,
                      color: isDark ? Colors.white70 : AppColors.textSecondary,
                      height: 1.4,
                    ),
                  ),
                ],
              ),
            );
          },
        ),
      ],
    );
  }
}
