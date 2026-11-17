import 'package:flutter/material.dart';
import 'package:smarttrip/theme/app_colors.dart';

class UserProfileEmptyPosts extends StatelessWidget {
  final bool isCurrentUser;
  final VoidCallback? onCreatePost;

  const UserProfileEmptyPosts({
    super.key,
    this.isCurrentUser = false,
    this.onCreatePost,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 48),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 90,
              height: 90,
              decoration: BoxDecoration(
                color: isDark
                    ? AppColors.primary.withValues(alpha: 0.2)
                    : AppColors.primaryLight.withValues(alpha: 0.6),
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.post_add_rounded,
                size: 44,
                color: AppColors.primary,
              ),
            ),
            const SizedBox(height: 20),
            Text(
              'Chưa có bài viết nào',
              style: TextStyle(
                fontFamily: 'Be Vietnam Pro',
                fontSize: 18,
                fontWeight: FontWeight.w700,
                color: isDark ? Colors.white : AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              isCurrentUser
                  ? 'Bạn chưa chia sẻ bài viết nào. Hãy chia sẻ trải nghiệm du lịch đầu tiên của bạn tại Đà Nẵng!'
                  : 'Tác giả này chưa đăng tải trải nghiệm hoặc bài viết nào trên cộng đồng DanaGo.',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontFamily: 'Be Vietnam Pro',
                fontSize: 13,
                color: isDark
                    ? const Color(0xFF94A3B8)
                    : AppColors.textTertiary,
                height: 1.5,
              ),
            ),
            if (isCurrentUser && onCreatePost != null) ...[
              const SizedBox(height: 20),
              ElevatedButton.icon(
                onPressed: onCreatePost,
                icon: const Icon(Icons.edit_note_rounded, size: 20),
                label: const Text(
                  'Tạo bài viết đầu tiên',
                  style: TextStyle(
                    fontFamily: 'Be Vietnam Pro',
                    fontWeight: FontWeight.w600,
                    fontSize: 14,
                  ),
                ),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(
                    horizontal: 20,
                    vertical: 12,
                  ),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  elevation: 0,
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
