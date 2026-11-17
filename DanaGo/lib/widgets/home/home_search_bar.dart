import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:smarttrip/theme/app_colors.dart';

class HomeSearchBar extends StatelessWidget {
  final VoidCallback? onTap;
  final VoidCallback? onAvatarTap;
  final String? avatarUrl;

  const HomeSearchBar({
    super.key,
    this.onTap,
    this.onAvatarTap,
    this.avatarUrl,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Row(
      children: [
        Expanded(
          child: Semantics(
            button: true,
            label: 'Tìm kiếm địa điểm tại Đà Nẵng',
            child: Material(
              color: Colors.transparent,
              child: InkWell(
                onTap: () {
                  HapticFeedback.selectionClick();
                  onTap?.call();
                },
                borderRadius: BorderRadius.circular(16),
                child: Container(
                  height: 48,
                  padding: const EdgeInsets.symmetric(horizontal: 14),
                  decoration: BoxDecoration(
                    color: AppColors.surfaceGrouped(context),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(
                      color: AppColors.hairlineBorder(context),
                      width: 0.9,
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(
                          alpha: isDark ? 0.18 : 0.04,
                        ),
                        blurRadius: 12,
                        offset: const Offset(0, 3),
                      ),
                    ],
                  ),
                  child: Row(
                    children: [
                      Icon(
                        Icons.search_rounded,
                        color: AppColors.labelSecondary(context),
                        size: 21,
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Text(
                          'Bạn muốn đi đâu ở Đà Nẵng?',
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: TextStyle(
                            fontFamily: 'Be Vietnam Pro',
                            color: AppColors.labelSecondary(context),
                            fontSize: 14.5,
                            fontWeight: FontWeight.w400,
                          ),
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 4,
                        ),
                        decoration: BoxDecoration(
                          color: AppColors.accentOf(context).withValues(
                            alpha: isDark ? 0.16 : 0.10,
                          ),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(
                              Icons.auto_awesome,
                              size: 12,
                              color: AppColors.accentOf(context),
                            ),
                            const SizedBox(width: 3),
                            Text(
                              'AI',
                              style: TextStyle(
                                fontFamily: 'Be Vietnam Pro',
                                fontSize: 11,
                                fontWeight: FontWeight.w700,
                                color: AppColors.accentOf(context),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ),
        const SizedBox(width: 12),
        Semantics(
          button: true,
          label: 'Trang cá nhân của bạn',
          child: GestureDetector(
            onTap: () {
              HapticFeedback.selectionClick();
              onAvatarTap?.call();
            },
            child: Container(
              width: 46,
              height: 46,
              padding: const EdgeInsets.all(2),
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: AppColors.surfaceGrouped(context),
                border: Border.all(
                  color: AppColors.hairlineBorder(context),
                  width: 1,
                ),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: isDark ? 0.2 : 0.05),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: ClipOval(child: _buildAvatar()),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildAvatar() {
    if (avatarUrl != null && avatarUrl!.isNotEmpty) {
      if (avatarUrl!.startsWith('http')) {
        return Image.network(
          avatarUrl!,
          cacheWidth: 120,
          fit: BoxFit.cover,
          errorBuilder: (_, _, _) => SvgPicture.asset(
            'assets/images/default-avatar.svg',
            fit: BoxFit.cover,
          ),
        );
      }
      if (avatarUrl!.endsWith('.svg')) {
        return SvgPicture.asset(avatarUrl!, fit: BoxFit.cover);
      }
      return Image.asset(avatarUrl!, fit: BoxFit.cover);
    }
    return SvgPicture.asset(
      'assets/images/default-avatar.svg',
      fit: BoxFit.cover,
    );
  }
}
