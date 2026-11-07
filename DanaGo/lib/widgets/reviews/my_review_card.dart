import 'package:flutter/material.dart';
import 'package:smarttrip/models/user_review_model.dart';
import 'package:smarttrip/theme/app_colors.dart';

class MyReviewCard extends StatelessWidget {
  final UserReviewModel review;
  final VoidCallback onTapPlace;
  final VoidCallback onEdit;
  final VoidCallback onDelete;

  const MyReviewCard({
    super.key,
    required this.review,
    required this.onTapPlace,
    required this.onEdit,
    required this.onDelete,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: isDark ? 0.2 : 0.04),
            blurRadius: 10,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header: Place info + Pop-up menu
          Row(
            children: [
              GestureDetector(
                onTap: onTapPlace,
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(10),
                  child: Image.network(
                    review.placeImageUrl,
                    width: 44,
                    height: 44,
                    fit: BoxFit.cover,
                    errorBuilder: (_, __, ___) => Container(
                      width: 44,
                      height: 44,
                      color: AppColors.bgSecondary,
                      child: const Icon(
                        Icons.landscape_rounded,
                        color: AppColors.textHint,
                        size: 20,
                      ),
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: GestureDetector(
                  onTap: onTapPlace,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        review.placeTitle,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(
                          fontFamily: 'Be Vietnam Pro',
                          fontSize: 15,
                          fontWeight: FontWeight.w700,
                          color: isDark ? Colors.white : AppColors.textPrimary,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        review.placeCategory,
                        style: const TextStyle(
                          fontFamily: 'Be Vietnam Pro',
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                          color: AppColors.primary,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              PopupMenuButton<String>(
                icon: const Icon(Icons.more_vert_rounded, color: AppColors.neutral, size: 20),
                onSelected: (value) {
                  if (value == 'edit') {
                    onEdit();
                  } else if (value == 'delete') {
                    onDelete();
                  }
                },
                itemBuilder: (context) => [
                  const PopupMenuItem(
                    value: 'edit',
                    child: Row(
                      children: [
                        Icon(Icons.edit_outlined, size: 18, color: AppColors.textPrimary),
                        SizedBox(width: 8),
                        Text(
                          'Chỉnh sửa',
                          style: TextStyle(fontFamily: 'Be Vietnam Pro', fontSize: 13),
                        ),
                      ],
                    ),
                  ),
                  const PopupMenuItem(
                    value: 'delete',
                    child: Row(
                      children: [
                        Icon(Icons.delete_outline_rounded, size: 18, color: AppColors.error),
                        SizedBox(width: 8),
                        Text(
                          'Xóa đánh giá',
                          style: TextStyle(
                            fontFamily: 'Be Vietnam Pro',
                            fontSize: 13,
                            color: AppColors.error,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ],
          ),

          const SizedBox(height: 12),
          const Divider(height: 1, color: AppColors.borderLight),
          const SizedBox(height: 12),

          // Rating stars & Time
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: List.generate(5, (index) {
                  return Icon(
                    index < review.rating.floor()
                        ? Icons.star_rounded
                        : (index < review.rating
                            ? Icons.star_half_rounded
                            : Icons.star_outline_rounded),
                    color: AppColors.starActive,
                    size: 18,
                  );
                }),
              ),
              Text(
                review.timeAgo,
                style: const TextStyle(
                  fontFamily: 'Be Vietnam Pro',
                  fontSize: 12,
                  color: AppColors.textHint,
                ),
              ),
            ],
          ),

          const SizedBox(height: 10),

          // Review Content
          Text(
            review.content,
            style: TextStyle(
              fontFamily: 'Be Vietnam Pro',
              fontSize: 14,
              color: isDark ? Colors.white70 : AppColors.textSecondary,
              height: 1.5,
            ),
          ),

          // Photo thumbnails if available
          if (review.photos.isNotEmpty) ...[
            const SizedBox(height: 12),
            SizedBox(
              height: 70,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                physics: const BouncingScrollPhysics(),
                itemCount: review.photos.length,
                separatorBuilder: (_, __) => const SizedBox(width: 8),
                itemBuilder: (context, photoIndex) {
                  return ClipRRect(
                    borderRadius: BorderRadius.circular(8),
                    child: Image.network(
                      review.photos[photoIndex],
                      width: 70,
                      height: 70,
                      fit: BoxFit.cover,
                      errorBuilder: (_, __, ___) => Container(
                        width: 70,
                        height: 70,
                        color: AppColors.bgSecondary,
                        child: const Icon(Icons.image_not_supported_outlined, color: AppColors.textHint),
                      ),
                    ),
                  );
                },
              ),
            ),
          ],

          const SizedBox(height: 12),

          // Footer: Helpful votes indicator
          Row(
            children: [
              const Icon(
                Icons.thumb_up_alt_outlined,
                size: 15,
                color: AppColors.neutral,
              ),
              const SizedBox(width: 6),
              Text(
                '${review.helpfulCount} người thấy hữu ích',
                style: const TextStyle(
                  fontFamily: 'Be Vietnam Pro',
                  fontSize: 12,
                  color: AppColors.neutral,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

