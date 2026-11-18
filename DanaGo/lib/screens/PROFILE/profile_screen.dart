import 'package:flutter/material.dart';
import 'package:smarttrip/services/google_auth_service.dart';
import 'package:smarttrip/screens/PROFILE/edit_profile_screen.dart';
import 'package:smarttrip/screens/PROFILE/favorites_screen.dart';
import 'package:smarttrip/screens/HOME/login_screen.dart';
import 'package:smarttrip/screens/HOME/main_screen.dart';
import 'package:smarttrip/screens/PROFILE/my_reviews_screen.dart';
import 'package:smarttrip/screens/FEED/notifications_screen.dart';
import 'package:smarttrip/screens/PROFILE/user_profile_posts_screen.dart';
import 'package:smarttrip/services/review_service.dart';
import 'package:smarttrip/theme/app_colors.dart';
import 'package:smarttrip/widgets/profile/profile_header.dart';
import 'package:smarttrip/widgets/profile/profile_menu_section.dart';
import 'package:smarttrip/widgets/profile/profile_stats_pill.dart';
import 'package:smarttrip/theme/theme_controller.dart';
import 'package:smarttrip/services/auth_service.dart';
import 'package:smarttrip/services/favorite_service.dart';
import 'package:smarttrip/services/itinerary_service.dart';
import 'package:smarttrip/services/notification_service.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  final Map<String, dynamic> _user = {
    'name': 'Đang tải',
    'email': '...',
    'phone': '...',
    'bio': '...',
    'avatar': 'assets/images/default-avatar.svg',
    'joinDate': '...',
    'tripsCount': 0,
    'reviewsCount': 0,
    'favoritesCount': 0,
  };
  @override
  void initState() {
    super.initState();
    _loadUserProfile();
    FavoriteService.instance.addListener(_onStatsChanged);
    ReviewService.instance.addListener(_onStatsChanged);
    ItineraryService.instance.addListener(_onStatsChanged);
  }

  @override
  void dispose() {
    FavoriteService.instance.removeListener(_onStatsChanged);
    ReviewService.instance.removeListener(_onStatsChanged);
    ItineraryService.instance.removeListener(_onStatsChanged);
    super.dispose();
  }

  void _onStatsChanged() {
    if (mounted) {
      setState(() {
        _user['favoritesCount'] = FavoriteService.instance.favoriteCount;
        _user['reviewsCount'] = ReviewService.instance.myReviewsCount;
        _user['tripsCount'] = ItineraryService.instance.myItinerariesCount;
      });
    }
  }

  Future<void> _loadUserProfile() async {
    final results = await Future.wait<dynamic>([
      AuthService.instance.getProfile(),
      FavoriteService.instance.getFavorites(),
      ReviewService.instance.getMyReviews(),
    ]);
    final profile = results[0] as Map<String, dynamic>?;
    final userId = (profile?['id'] as num?)?.toInt();
    if (userId != null) {
      await Future.wait([
        ItineraryService.instance.getUserItineraries(userId),
        NotificationService.instance.refreshUnreadCount(userId: userId),
      ]);
    }
    if (mounted) {
      setState(() {
        if (profile != null) {
          if (profile['fullName'] != null) {
            _user['name'] = profile['fullName'];
          }
          if (profile['email'] != null) {
            _user['email'] = profile['email'];
          }
          _user['phone'] = (profile['phoneNumber'] as String?) ?? '';
          if (profile['avatarUrl'] != null &&
              (profile['avatarUrl'] as String).isNotEmpty) {
            _user['avatar'] = profile['avatarUrl'];
          } else {
            _user['avatar'] = 'assets/images/default-avatar.svg';
          }
          if (profile['bio'] != null) {
            _user['bio'] = profile['bio'];
          }
          if (profile['createdAt'] != null) {
            try {
              final dt = DateTime.parse(profile['createdAt'] as String);
              const months = [
                '',
                'Tháng 1',
                'Tháng 2',
                'Tháng 3',
                'Tháng 4',
                'Tháng 5',
                'Tháng 6',
                'Tháng 7',
                'Tháng 8',
                'Tháng 9',
                'Tháng 10',
                'Tháng 11',
                'Tháng 12',
              ];
              _user['joinDate'] = '${months[dt.month]}, ${dt.year}';
            } catch (_) {
              _user['joinDate'] = profile['createdAt'];
            }
          }
        }
        _user['favoritesCount'] = FavoriteService.instance.favoriteCount;
        _user['reviewsCount'] = ReviewService.instance.myReviewsCount;
        _user['tripsCount'] = ItineraryService.instance.myItinerariesCount;
      });
    }
  }

  void _navigateToEditProfile() async {
    final result = await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => EditProfileScreen(userData: _user),
      ),
    );
    if (result != null && result is Map<String, dynamic>) {
      setState(() {
        _user.addAll(result);
      });
    }
  }

  void _navigateToFavorites() async {
    await Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => const FavoritesScreen()),
    );
    if (mounted) {
      setState(() {
        _user['favoritesCount'] = FavoriteService.instance.favoriteCount;
      });
    }
  }

  void _navigateToMyReviews() {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => const MyReviewsScreen()),
    );
  }

  void _navigateToItinerary() {
    Navigator.pushAndRemoveUntil(
      context,
      MaterialPageRoute(builder: (_) => const MainScreen(initialIndex: 2)),
      (route) => false,
    );
  }

  void _navigateToNotifications() {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => const NotificationsScreen()),
    );
  }

  void _navigateToPublicProfile() {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => UserProfilePostsScreen(
          authorName: _user['name'] ?? 'Bạn',
          authorAvatar: _user['avatar'] ?? 'assets/images/default-avatar.svg',
          isVerified: true,
          isCurrentUser: true,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      body: CustomScrollView(
        physics: const BouncingScrollPhysics(),
        slivers: [
          SliverToBoxAdapter(
            child: ProfileHeader(
              user: _user,
              onEditAvatar: _navigateToEditProfile,
              onSettingsTap: _navigateToEditProfile,
            ),
          ),
          SliverToBoxAdapter(
            child: ProfileStatsPill(
              tripsCount: _user['tripsCount'] ?? 0,
              reviewsCount: _user['reviewsCount'] ?? 0,
              favoritesCount: _user['favoritesCount'] ?? 0,
              onTripsTap: _navigateToItinerary,
              onReviewsTap: _navigateToMyReviews,
              onFavoritesTap: _navigateToFavorites,
            ),
          ),

          // ─── Account Section ──────────────────────────────────────
          SliverToBoxAdapter(child: _buildSectionLabel('Tài khoản')),
          SliverToBoxAdapter(
            child: ProfileMenuSection(
              items: [
                ProfileMenuItem(
                  icon: Icons.person_outline_rounded,
                  title: 'Chỉnh sửa hồ sơ',
                  subtitle: 'Cập nhật thông tin cá nhân',
                  onTap: _navigateToEditProfile,
                ),
                ProfileMenuItem(
                  icon: Icons.badge_outlined,
                  title: 'Trang cá nhân của tôi',
                  subtitle: 'Xem trang công khai & bài viết đã đăng',
                  onTap: _navigateToPublicProfile,
                ),
                ProfileMenuItem(
                  icon: Icons.favorite_outline_rounded,
                  title: 'Địa điểm yêu thích',
                  subtitle: '${_user['favoritesCount']} địa điểm đã lưu',
                  onTap: _navigateToFavorites,
                ),
                ProfileMenuItem(
                  icon: Icons.star_outline_rounded,
                  title: 'Đánh giá của tôi',
                  subtitle: '${_user['reviewsCount']} đánh giá đã đăng',
                  onTap: _navigateToMyReviews,
                ),
                ProfileMenuItem(
                  icon: Icons.map_outlined,
                  title: 'Lịch trình đã lưu',
                  subtitle: '${_user['tripsCount']} chuyến đi đã tạo',
                  onTap: _navigateToItinerary,
                ),
              ],
            ),
          ),
          // ─── Settings Section ─────────────────────────────────────
          SliverToBoxAdapter(child: _buildSectionLabel('Cài đặt')),
          ValueListenableBuilder<ThemeMode>(
            valueListenable: ThemeController.themeMode,
            builder: (context, mode, _) {
              final isDark = mode == ThemeMode.dark;
              return SliverToBoxAdapter(
                child: ProfileMenuSection(
                  items: [
                    ProfileMenuItem(
                      icon: Icons.notifications_none_rounded,
                      title: 'Thông báo',
                      subtitle: 'Quản lý thông báo',
                      trailing: ListenableBuilder(
                        listenable: NotificationService.instance,
                        builder: (context, _) {
                          final unread =
                              NotificationService.instance.unreadCount;
                          if (unread <= 0) {
                            return const Icon(
                              Icons.chevron_right_rounded,
                              color: AppColors.textTertiary,
                            );
                          }
                          return Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 8,
                              vertical: 3,
                            ),
                            decoration: BoxDecoration(
                              color: AppColors.error,
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Text(
                              unread > 99 ? '99+' : '$unread',
                              style: const TextStyle(
                                fontFamily: 'Be Vietnam Pro',
                                fontSize: 11,
                                fontWeight: FontWeight.w700,
                                color: Colors.white,
                              ),
                            ),
                          );
                        },
                      ),
                      onTap: _navigateToNotifications,
                    ),
                    ProfileMenuItem(
                      icon: Icons.language_rounded,
                      title: 'Ngôn ngữ',
                      subtitle: 'Tiếng Việt',
                      trailing: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 10,
                          vertical: 4,
                        ),
                        decoration: BoxDecoration(
                          color: AppColors.primaryLight,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: const Text(
                          'VI',
                          style: TextStyle(
                            fontFamily: 'Be Vietnam Pro',
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                            color: AppColors.primary,
                          ),
                        ),
                      ),
                      onTap: () {},
                    ),
                    // 🔥 Mục Chế độ tối chuẩn kiểu ProfileMenuItem:
                    ProfileMenuItem(
                      icon: isDark
                          ? Icons.dark_mode_rounded
                          : Icons.light_mode_rounded,
                      title: 'Chế độ tối',
                      subtitle: isDark
                          ? 'Đang bật giao diện tối'
                          : 'Đang dùng giao diện sáng',
                      trailing: Switch(
                        value: isDark,
                        activeThumbColor: AppColors.primary,
                        onChanged: (val) {
                          ThemeController.toggleTheme(val);
                        },
                      ),
                      onTap: () {
                        ThemeController.toggleTheme(!isDark);
                      },
                    ),
                    ProfileMenuItem(
                      icon: Icons.shield_outlined,
                      title: 'Bảo mật & Quyền riêng tư',
                      onTap: () {},
                    ),
                  ],
                ),
              );
            },
          ),
          // ─── Other Section ────────────────────────────────────────
          SliverToBoxAdapter(child: _buildSectionLabel('Khác')),
          SliverToBoxAdapter(
            child: ProfileMenuSection(
              items: [
                ProfileMenuItem(
                  icon: Icons.help_outline_rounded,
                  title: 'Trợ giúp & Hỗ trợ',
                  onTap: () {},
                ),
                ProfileMenuItem(
                  icon: Icons.info_outline_rounded,
                  title: 'Về DanaGo',
                  subtitle: 'Phiên bản 1.0.0',
                  onTap: () {},
                ),
              ],
            ),
          ),

          // ─── Logout Button ────────────────────────────────────────
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(20, 20, 20, 40),
              child: Material(
                color: Colors.transparent,
                child: InkWell(
                  onTap: _showLogoutDialog,
                  borderRadius: BorderRadius.circular(16),
                  child: Container(
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    decoration: BoxDecoration(
                      border: Border.all(
                        color: AppColors.error.withValues(alpha: 0.3),
                      ),
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: const Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.logout_rounded,
                          color: AppColors.error,
                          size: 20,
                        ),
                        SizedBox(width: 8),
                        Text(
                          'Đăng xuất',
                          style: TextStyle(
                            fontFamily: 'Be Vietnam Pro',
                            fontSize: 15,
                            fontWeight: FontWeight.w600,
                            color: AppColors.error,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ),

          const SliverToBoxAdapter(child: SizedBox(height: 100)),
        ],
      ),
    );
  }

  Widget _buildSectionLabel(String label) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 10),
      child: Text(
        label,
        style: TextStyle(
          fontFamily: 'Be Vietnam Pro',
          fontSize: 14,
          fontWeight: FontWeight.w600,
          color: isDark ? const Color(0xFF94A3B8) : AppColors.textTertiary,
          letterSpacing: 0.5,
        ),
      ),
    );
  }

  void _showLogoutDialog() {
    bool isLoggingOut = false;

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (dialogContext) => StatefulBuilder(
        builder: (dialogContext, setDialogState) => AlertDialog(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(20),
          ),
          title: const Text(
            'Đăng xuất',
            style: TextStyle(
              fontFamily: 'Be Vietnam Pro',
              fontWeight: FontWeight.w700,
            ),
          ),
          content: const Text(
            'Bạn có chắc chắn muốn đăng xuất khỏi tài khoản không?',
            style: TextStyle(
              fontFamily: 'Be Vietnam Pro',
              color: AppColors.textSecondary,
            ),
          ),
          actions: [
            TextButton(
              onPressed: isLoggingOut
                  ? null
                  : () => Navigator.pop(dialogContext),
              child: const Text(
                'Hủy',
                style: TextStyle(
                  fontFamily: 'Be Vietnam Pro',
                  color: AppColors.textTertiary,
                ),
              ),
            ),
            ElevatedButton(
              onPressed: isLoggingOut
                  ? null
                  : () async {
                      setDialogState(() => isLoggingOut = true);
                      try {
                        await AuthService.instance.logout();
                      } catch (_) {}
                      try {
                        await GoogleAuthService.instance.signOut();
                      } catch (_) {}

                      if (!mounted) return;
                      Navigator.of(
                        context,
                        rootNavigator: true,
                      ).pushAndRemoveUntil(
                        MaterialPageRoute(builder: (_) => const LoginScreen()),
                        (route) => false,
                      );
                    },
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.error,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              child: isLoggingOut
                  ? const SizedBox(
                      width: 18,
                      height: 18,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: Colors.white,
                      ),
                    )
                  : const Text(
                      'Đăng xuất',
                      style: TextStyle(
                        fontFamily: 'Be Vietnam Pro',
                        fontWeight: FontWeight.w600,
                      ),
                    ),
            ),
          ],
        ),
      ),
    );
  }
}
