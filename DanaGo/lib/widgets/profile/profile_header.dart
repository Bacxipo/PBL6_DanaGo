import 'package:flutter/material.dart';
import 'package:smarttrip/theme/app_colors.dart';
import 'package:flutter_svg/flutter_svg.dart';

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
    return Container(
      padding: EdgeInsets.only(
        top: MediaQuery.of(context).padding.top + 16,
        left: 20,
        right: 20,
        bottom: 20,
      ),
      decoration: BoxDecoration(
        borderRadius: const BorderRadius.vertical(bottom: Radius.circular(28)),
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            AppColors.primary,
            AppColors.primary.withValues(alpha: 0.85),
          ],
        ),
      ),
      child: Column(
        children: [
          // App bar row
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Hồ sơ',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
              IconButton(
                onPressed: onSettingsTap ?? () {},
                icon: const Icon(Icons.settings_outlined, color: Colors.white),
              ),
            ],
          ),
          const SizedBox(height: 20),

          // Avatar
          Stack(
            children: [
              Container(
                width: 90,
                height: 90,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: AppColors.primaryLight,
                  border: Border.all(color: Colors.white, width: 3),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.15),
                      blurRadius: 12,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: ClipOval(child: _buildAvatar(user['avatar'])),
              ),
              Positioned(
                bottom: 0,
                right: 0,
                child: GestureDetector(
                  onTap: onEditAvatar,
                  child: Container(
                    padding: const EdgeInsets.all(6),
                    decoration: BoxDecoration(
                      color: AppColors.accent,
                      shape: BoxShape.circle,
                      border: Border.all(color: Colors.white, width: 2),
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

          // Name
          Text(
            user['name'] ?? 'Chưa cập nhật',
            style: const TextStyle(
              fontSize: 22,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
          const SizedBox(height: 4),

          // Email
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                Icons.email_outlined,
                size: 14,
                color: Colors.white.withValues(alpha: 0.7),
              ),
              const SizedBox(width: 6),
              Text(
                user['email'] ?? '',
                style: TextStyle(
                  fontSize: 13,
                  color: Colors.white.withValues(alpha: 0.85),
                ),
              ),
            ],
          ),
          const SizedBox(height: 4),

          // Bio
          if (user['bio'] != null)
            Text(
              user['bio'],
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 13,
                color: Colors.white.withValues(alpha: 0.7),
                fontStyle: FontStyle.italic,
              ),
            ),
          const SizedBox(height: 6),

          // Join date
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Text(
              'Tham gia từ ${user['joinDate'] ?? ''}',
              style: TextStyle(
                fontSize: 11,
                color: Colors.white.withValues(alpha: 0.8),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAvatar(dynamic avatar) {
    if (avatar is String && avatar.isNotEmpty) {
      if (avatar.startsWith('http')) {
        return Image.network(
          avatar,
          fit: BoxFit.cover,
          errorBuilder: (_, __, ___) => SvgPicture.asset(
            'assets/images/default-avatar.svg',
            fit: BoxFit.cover,
          ),
        );
      }
      if (avatar.endsWith('.svg')) {
        return SvgPicture.asset(avatar, fit: BoxFit.cover);
      }
      return Image.asset(avatar, fit: BoxFit.cover);
    }
    return SvgPicture.asset(
      'assets/images/default-avatar.svg',
      fit: BoxFit.cover,
    );
  }
}
