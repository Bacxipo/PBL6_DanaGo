import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:smarttrip/theme/app_colors.dart';

/// Authentic Apple Account / iOS Settings Profile Header:
/// Clean grouped canvas, centered elevated avatar with camera badge,
/// crisp Apple display typography, zero boxy full-bleed color banner.
class ProfileHeader extends StatelessWidget {
  final Map<String, dynamic> user;
  final VoidCallback? onEditAvatar;
  final VoidCallback? onSettingsTap;

  const ProfileHeader({
    super.key,
    required this.user,
    this.onEditAvatar,
    this.onSettingsTap,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final accent = AppColors.accentOf(context);

    return Container(
      padding: EdgeInsets.only(
        top: MediaQuery.of(context).padding.top + 12,
        left: 20,
        right: 20,
        bottom: 12,
      ),
      child: Column(
        children: [
          // Apple Large Title top bar
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Tài khoản',
                style: TextStyle(
                  fontFamily: 'Be Vietnam Pro',
                  fontSize: 30,
                  fontWeight: FontWeight.w800,
                  letterSpacing: -0.6,
                  color: AppColors.labelPrimary(context),
                ),
              ),
              InkWell(
                onTap: onSettingsTap ?? () {},
                borderRadius: BorderRadius.circular(22),
                child: Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    color: AppColors.surfaceGrouped(context),
                    shape: BoxShape.circle,
                    border: Border.all(
                      color: AppColors.hairlineBorder(context),
                      width: 0.9,
                    ),
                  ),
                  child: Icon(
                    Icons.edit_outlined,
                    size: 19,
                    color: accent,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 18),

          // Centered Apple Account Avatar Card
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 22),
            decoration: BoxDecoration(
              color: AppColors.surfaceGrouped(context),
              borderRadius: BorderRadius.circular(24),
              border: Border.all(
                color: AppColors.hairlineBorder(context),
                width: 0.85,
              ),
            ),
            child: Column(
              children: [
                Stack(
                  children: [
                    Container(
                      width: 92,
                      height: 92,
                      padding: const EdgeInsets.all(3),
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        gradient: LinearGradient(
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                          colors: [
                            accent.withValues(alpha: 0.7),
                            AppColors.secondary.withValues(alpha: 0.7),
                          ],
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(
                              alpha: isDark ? 0.3 : 0.08,
                            ),
                            blurRadius: 16,
                            offset: const Offset(0, 6),
                          ),
                        ],
                      ),
                      child: Container(
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: AppColors.surfaceGrouped(context),
                        ),
                        padding: const EdgeInsets.all(2),
                        child: ClipOval(child: _buildAvatar(user['avatar'])),
                      ),
                    ),
                    Positioned(
                      bottom: 0,
                      right: 0,
                      child: GestureDetector(
                        onTap: onEditAvatar,
                        child: Container(
                          padding: const EdgeInsets.all(7),
                          decoration: BoxDecoration(
                            color: AppColors.primary,
                            shape: BoxShape.circle,
                            border: Border.all(
                              color: AppColors.surfaceGrouped(context),
                              width: 2.2,
                            ),
                          ),
                          child: const Icon(
                            Icons.camera_alt_rounded,
                            size: 14,
                            color: Colors.white,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 14),

                Text(
                  user['name'] ?? 'Chưa cập nhật',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontFamily: 'Be Vietnam Pro',
                    fontSize: 22,
                    fontWeight: FontWeight.w800,
                    letterSpacing: -0.4,
                    color: AppColors.labelPrimary(context),
                  ),
                ),
                const SizedBox(height: 3),

                Text(
                  user['email'] ?? '',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontFamily: 'Be Vietnam Pro',
                    fontSize: 13.5,
                    color: AppColors.labelSecondary(context),
                  ),
                ),
                if (user['bio'] != null &&
                    user['bio'].toString().trim().isNotEmpty) ...[
                  const SizedBox(height: 8),
                  Text(
                    user['bio'].toString(),
                    textAlign: TextAlign.center,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                      fontFamily: 'Be Vietnam Pro',
                      fontSize: 13,
                      height: 1.4,
                      color: AppColors.labelSecondary(context),
                    ),
                  ),
                ],
                const SizedBox(height: 12),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 5,
                  ),
                  decoration: BoxDecoration(
                    color: AppColors.surfaceTertiary(context),
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: Text(
                    'Thành viên từ ${user['joinDate'] ?? ''}',
                    style: TextStyle(
                      fontFamily: 'Be Vietnam Pro',
                      fontSize: 11.5,
                      fontWeight: FontWeight.w600,
                      color: AppColors.labelSecondary(context),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAvatar(dynamic avatar) {
    final avatarStr = avatar?.toString() ?? '';
    if (avatarStr.isNotEmpty) {
      if (avatarStr.startsWith('http')) {
        return Image.network(
          avatarStr,
          cacheWidth: 200,
          fit: BoxFit.cover,
          errorBuilder: (_, _, _) => SvgPicture.asset(
            'assets/images/default-avatar.svg',
            fit: BoxFit.cover,
          ),
        );
      }
      if (avatarStr.endsWith('.svg')) {
        return SvgPicture.asset(avatarStr, fit: BoxFit.cover);
      }
      return Image.asset(avatarStr, fit: BoxFit.cover);
    }
    return SvgPicture.asset(
      'assets/images/default-avatar.svg',
      fit: BoxFit.cover,
    );
  }
}
