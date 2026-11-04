import 'package:flutter/material.dart';
import 'package:smarttrip/screens/edit_profile_screen.dart';
import 'package:smarttrip/screens/favorites_screen.dart';
import 'package:smarttrip/screens/itinerary_screen.dart';
import 'package:smarttrip/screens/login_screen.dart';
import 'package:smarttrip/screens/my_reviews_screen.dart';
import 'package:smarttrip/screens/notifications_screen.dart';
import 'package:smarttrip/screens/user_profile_posts_screen.dart';
import 'package:smarttrip/theme/app_colors.dart';
import 'package:smarttrip/widgets/profile/profile_header.dart';
import 'package:smarttrip/widgets/profile/profile_menu_section.dart';
import 'package:smarttrip/widgets/profile/profile_stats_pill.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  // Sample user data
  final Map<String, dynamic> _user = {
    'name': 'Nguyễn Văn A',
    'email': 'nguyenvana@gmail.com',
    'phone': '0901 234 567',
    'bio': 'Yêu du lịch, thích khám phá văn hóa & ẩm thực Đà Nẵng',
    'avatar': 'https://i.postimg.cc/tC24nW4N/avt1.jpg',
    'joinDate': 'Tháng 10, 2026',
    'tripsCount': 12,
    'reviewsCount': 28,
    'favoritesCount': 45,
  };

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

  void _navigateToFavorites() {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => const FavoritesScreen()),
    );
  }

  void _navigateToMyReviews() {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => const MyReviewsScreen()),
    );
  }

  void _navigateToItinerary() {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => const ItineraryScreen()),
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
          authorName: _user['name'] ?? 'Nguyễn Văn A',
          authorAvatar: _user['avatar'] ?? 'https://i.postimg.cc/X7QYBdY8/avt2.jpg',
          isVerified: true,
          isCurrentUser: true,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bgPrimary,
      body: CustomScrollView(
        physics: const BouncingScrollPhysics(),
        slivers: [
          // ─── Header with Avatar ────────────────────────────────────
          SliverToBoxAdapter(
            child: ProfileHeader(
              user: _user,
              onEditAvatar: _navigateToEditProfile,
              onSettingsTap: _navigateToEditProfile,
            ),
          ),

          // ─── Stats Pill ───────────────────────────────────────────
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
          SliverToBoxAdapter(
            child: _buildSectionLabel('Tài khoản'),
          ),
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
          SliverToBoxAdapter(
            child: _buildSectionLabel('Cài đặt'),
          ),
          SliverToBoxAdapter(
            child: ProfileMenuSection(
              items: [
                ProfileMenuItem(
                  icon: Icons.notifications_none_rounded,
                  title: 'Thông báo',
                  subtitle: 'Quản lý thông báo',
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
                ProfileMenuItem(
                  icon: Icons.dark_mode_outlined,
                  title: 'Giao diện',
                  subtitle: 'Sáng',
                  onTap: () {},
                ),
                ProfileMenuItem(
                  icon: Icons.shield_outlined,
                  title: 'Bảo mật & Quyền riêng tư',
                  onTap: () {},
                ),
              ],
            ),
          ),

          // ─── Other Section ────────────────────────────────────────
          SliverToBoxAdapter(
            child: _buildSectionLabel('Khác'),
          ),
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
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 10),
      child: Text(
        label,
        style: const TextStyle(
          fontFamily: 'Be Vietnam Pro',
          fontSize: 14,
          fontWeight: FontWeight.w600,
          color: AppColors.textTertiary,
          letterSpacing: 0.5,
        ),
      ),
    );
  }

  void _showLogoutDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text(
          'Đăng xuất',
          style: TextStyle(fontFamily: 'Be Vietnam Pro', fontWeight: FontWeight.w700),
        ),
        content: const Text(
          'Bạn có chắc chắn muốn đăng xuất khỏi tài khoản không?',
          style: TextStyle(fontFamily: 'Be Vietnam Pro', color: AppColors.textSecondary),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text(
              'Hủy',
              style: TextStyle(fontFamily: 'Be Vietnam Pro', color: AppColors.textTertiary),
            ),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              Navigator.pushAndRemoveUntil(
                context,
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
            child: const Text(
              'Đăng xuất',
              style: TextStyle(fontFamily: 'Be Vietnam Pro', fontWeight: FontWeight.w600),
            ),
          ),
        ],
      ),
    );
  }
}
