import 'package:flutter/material.dart';
import 'package:smarttrip/theme/app_colors.dart';

class FeedActionBar extends StatelessWidget {
  final int likesCount;
  final int commentsCount;
  final bool isLiked;
  final bool isBookmarked;
  final VoidCallback? onLikePressed;
  final VoidCallback? onCommentPressed;
  final VoidCallback? onSharePressed;
  final VoidCallback? onBookmarkPressed;

  const FeedActionBar({
    super.key,
    required this.likesCount,
    required this.commentsCount,
    this.isLiked = false,
    this.isBookmarked = false,
    this.onLikePressed,
    this.onCommentPressed,
    this.onSharePressed,
    this.onBookmarkPressed,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(top: 8),
      child: Row(
        children: [
          // Like Button
          InkWell(
            onTap: onLikePressed,
            borderRadius: BorderRadius.circular(16),
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 4),
              child: Row(
                children: [
                  Icon(
                    isLiked ? Icons.favorite_rounded : Icons.favorite_border_rounded,
                    size: 20,
                    color: isLiked ? const Color(0xFFEF4444) : AppColors.textSecondary,
                  ),
                  const SizedBox(width: 6),
                  Text(
                    '$likesCount',
                    style: TextStyle(
                      fontFamily: 'Be Vietnam Pro',
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                      color: isLiked ? const Color(0xFFEF4444) : AppColors.textSecondary,
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(width: 16),
          // Comment Button
          InkWell(
            onTap: onCommentPressed,
            borderRadius: BorderRadius.circular(16),
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 4),
              child: Row(
                children: [
                  const Icon(
                    Icons.chat_bubble_outline_rounded,
                    size: 19,
                    color: AppColors.textSecondary,
                  ),
                  const SizedBox(width: 6),
                  Text(
                    '$commentsCount',
                    style: const TextStyle(
                      fontFamily: 'Be Vietnam Pro',
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                      color: AppColors.textSecondary,
                    ),
                  ),
                ],
              ),
            ),
          ),
          const Spacer(),
          // Share Button
          IconButton(
            icon: const Icon(Icons.share_outlined, size: 20, color: AppColors.textSecondary),
            onPressed: onSharePressed ??
                () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('Đã sao chép liên kết bài viết'),
                      duration: Duration(seconds: 1),
                    ),
                  );
                },
            visualDensity: VisualDensity.compact,
            splashRadius: 20,
          ),
          // Bookmark Button
          IconButton(
            icon: Icon(
              isBookmarked ? Icons.bookmark_rounded : Icons.bookmark_border_rounded,
              size: 20,
              color: isBookmarked ? AppColors.primary : AppColors.textSecondary,
            ),
            onPressed: onBookmarkPressed,
            visualDensity: VisualDensity.compact,
            splashRadius: 20,
          ),
        ],
      ),
    );
  }
}

