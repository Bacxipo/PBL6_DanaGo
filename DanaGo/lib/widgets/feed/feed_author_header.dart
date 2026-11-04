import 'package:flutter/material.dart';
import 'package:smarttrip/models/feed_post_model.dart';
import 'package:smarttrip/screens/user_profile_posts_screen.dart';
import 'package:smarttrip/theme/app_colors.dart';

class FeedAuthorHeader extends StatelessWidget {
  final FeedPostModel post;
  final VoidCallback? onMorePressed;

  const FeedAuthorHeader({
    super.key,
    required this.post,
    this.onMorePressed,
  });

  void _navigateToAuthorProfile(BuildContext context) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => UserProfilePostsScreen(
          authorName: post.authorName,
          authorAvatar: post.authorAvatar,
          isVerified: post.isVerified,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        // Avatar with verified badge
        GestureDetector(
          onTap: () => _navigateToAuthorProfile(context),
          child: Stack(
            clipBehavior: Clip.none,
            children: [
              ClipOval(
                child: Image.network(
                  post.authorAvatar,
                  width: 40,
                  height: 40,
                  fit: BoxFit.cover,
                  errorBuilder: (_, __, ___) => Container(
                    width: 40,
                    height: 40,
                    color: AppColors.primaryLight,
                    child: const Icon(Icons.person, color: AppColors.primary, size: 22),
                  ),
                ),
              ),
              if (post.isVerified)
                Positioned(
                  right: -2,
                  bottom: -2,
                  child: Container(
                    padding: const EdgeInsets.all(2),
                    decoration: const BoxDecoration(
                      color: AppColors.primary,
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(
                      Icons.check,
                      size: 10,
                      color: Colors.white,
                    ),
                  ),
                ),
            ],
          ),
        ),
        const SizedBox(width: 12),
        // Author Name & Time
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Flexible(
                    child: GestureDetector(
                      onTap: () => _navigateToAuthorProfile(context),
                      child: Text(
                        post.authorName,
                        style: const TextStyle(
                          fontFamily: 'Be Vietnam Pro',
                          fontSize: 15,
                          fontWeight: FontWeight.w700,
                          color: AppColors.textPrimary,
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ),
                  if (post.type != PostType.experience) ...[
                    const SizedBox(width: 6),
                    _buildTypeBadge(post.type),
                  ],
                ],
              ),
              const SizedBox(height: 2),
              Row(
                children: [
                  Text(
                    post.timeAgo,
                    style: const TextStyle(
                      fontFamily: 'Be Vietnam Pro',
                      fontSize: 12,
                      fontWeight: FontWeight.w400,
                      color: AppColors.neutral,
                    ),
                  ),
                  const SizedBox(width: 4),
                  const Text(
                    '•',
                    style: TextStyle(
                      fontSize: 12,
                      color: AppColors.neutral,
                    ),
                  ),
                  const SizedBox(width: 4),
                  const Icon(
                    Icons.public_rounded,
                    size: 12,
                    color: AppColors.neutral,
                  ),
                ],
              ),
            ],
          ),
        ),
        // More options button
        IconButton(
          icon: const Icon(Icons.more_horiz_rounded, color: AppColors.neutral),
          onPressed: onMorePressed ??
              () {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('Tùy chọn bài viết'),
                    duration: Duration(seconds: 1),
                  ),
                );
              },
          visualDensity: VisualDensity.compact,
          splashRadius: 20,
        ),
      ],
    );
  }

  Widget _buildTypeBadge(PostType type) {
    final String label;
    final Color color;
    final Color bgColor;

    switch (type) {
      case PostType.question:
        label = 'Hỏi đáp';
        color = const Color(0xFF0284C7);
        bgColor = const Color(0xFFE0F2FE);
        break;
      case PostType.newPlace:
        label = 'Địa điểm mới';
        color = const Color(0xFF059669);
        bgColor = const Color(0xFFD1FAE5);
        break;
      default:
        return const SizedBox.shrink();
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(4),
      ),
      child: Text(
        label,
        style: TextStyle(
          fontFamily: 'Be Vietnam Pro',
          fontSize: 10,
          fontWeight: FontWeight.w600,
          color: color,
        ),
      ),
    );
  }
}

