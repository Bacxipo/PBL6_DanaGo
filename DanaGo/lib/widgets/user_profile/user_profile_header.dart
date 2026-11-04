import 'package:flutter/material.dart';
import 'package:smarttrip/theme/app_colors.dart';

class UserProfileHeader extends StatefulWidget {
  final String authorName;
  final String authorAvatar;
  final bool isVerified;
  final String bio;
  final String joinDate;
  final int postsCount;
  final int followersCount;
  final int followingCount;
  final int likesCount;
  final bool isCurrentUser;

  const UserProfileHeader({
    super.key,
    required this.authorName,
    required this.authorAvatar,
    this.isVerified = false,
    this.bio = 'Yêu du lịch, thích khám phá văn hóa & ẩm thực Đà Nẵng',
    this.joinDate = 'Tham gia từ 2026',
    this.postsCount = 0,
    this.followersCount = 342,
    this.followingCount = 120,
    this.likesCount = 1450,
    this.isCurrentUser = false,
  });

  @override
  State<UserProfileHeader> createState() => _UserProfileHeaderState();
}

class _UserProfileHeaderState extends State<UserProfileHeader> {
  bool _isFollowing = false;

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.white,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Banner Image / Gradient
          Container(
            height: 120,
            width: double.infinity,
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  Color(0xFF006971),
                  Color(0xFF2DD4BF),
                  Color(0xFFFFB347),
                ],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
            ),
          ),

          // Avatar & Action Buttons Row
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                // Avatar (translated up to overlap the banner)
                Transform.translate(
                  offset: const Offset(0, -36),
                  child: Stack(
                    clipBehavior: Clip.none,
                    children: [
                      Container(
                        padding: const EdgeInsets.all(3),
                        decoration: const BoxDecoration(
                          color: Colors.white,
                          shape: BoxShape.circle,
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black12,
                              blurRadius: 8,
                              offset: Offset(0, 3),
                            ),
                          ],
                        ),
                        child: ClipOval(
                          child: Image.network(
                            widget.authorAvatar,
                            width: 76,
                            height: 76,
                            fit: BoxFit.cover,
                            errorBuilder: (_, __, ___) => Container(
                              width: 76,
                              height: 76,
                              color: AppColors.primaryLight,
                              child: const Icon(
                                Icons.person,
                                color: AppColors.primary,
                                size: 38,
                              ),
                            ),
                          ),
                        ),
                      ),
                      if (widget.isVerified)
                        Positioned(
                          right: 2,
                          bottom: 4,
                          child: Container(
                            padding: const EdgeInsets.all(3),
                            decoration: const BoxDecoration(
                              color: AppColors.primary,
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(
                              Icons.check,
                              size: 12,
                              color: Colors.white,
                            ),
                          ),
                        ),
                    ],
                  ),
                ),

                const Spacer(),

                // Action Buttons on the right
                Padding(
                  padding: const EdgeInsets.only(bottom: 6),
                  child: widget.isCurrentUser
                      ? OutlinedButton(
                          onPressed: () {},
                          style: OutlinedButton.styleFrom(
                            backgroundColor: Colors.white,
                            foregroundColor: AppColors.textPrimary,
                            side: const BorderSide(color: AppColors.border),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(20),
                            ),
                            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                          ),
                          child: const Text(
                            'Chỉnh sửa',
                            style: TextStyle(
                              fontFamily: 'Be Vietnam Pro',
                              fontWeight: FontWeight.w600,
                              fontSize: 13,
                            ),
                          ),
                        )
                      : Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            ElevatedButton(
                              onPressed: () {
                                setState(() {
                                  _isFollowing = !_isFollowing;
                                });
                              },
                              style: ElevatedButton.styleFrom(
                                backgroundColor:
                                    _isFollowing ? AppColors.bgSecondary : AppColors.primary,
                                foregroundColor:
                                    _isFollowing ? AppColors.textPrimary : Colors.white,
                                elevation: 0,
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(20),
                                ),
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 16,
                                  vertical: 8,
                                ),
                              ),
                              child: Text(
                                _isFollowing ? 'Đang theo dõi' : 'Theo dõi',
                                style: const TextStyle(
                                  fontFamily: 'Be Vietnam Pro',
                                  fontWeight: FontWeight.w600,
                                  fontSize: 13,
                                ),
                              ),
                            ),
                            const SizedBox(width: 8),
                            Container(
                              decoration: BoxDecoration(
                                color: Colors.white,
                                shape: BoxShape.circle,
                                border: Border.all(color: AppColors.border),
                              ),
                              child: IconButton(
                                icon: const Icon(
                                  Icons.chat_bubble_outline_rounded,
                                  size: 18,
                                  color: AppColors.textPrimary,
                                ),
                                onPressed: () {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    SnackBar(content: Text('Mở tin nhắn với ${widget.authorName}')),
                                  );
                                },
                                visualDensity: VisualDensity.compact,
                              ),
                            ),
                          ],
                        ),
                ),
              ],
            ),
          ),

          // User details (Name, Badge, Bio, Location)
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Flexible(
                      child: Text(
                        widget.authorName,
                        style: const TextStyle(
                          fontFamily: 'Be Vietnam Pro',
                          fontSize: 19,
                          fontWeight: FontWeight.w700,
                          color: AppColors.textPrimary,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    const SizedBox(width: 6),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: AppColors.primaryLight,
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: const Text(
                        'Thành viên',
                        style: TextStyle(
                          fontFamily: 'Be Vietnam Pro',
                          fontSize: 10,
                          fontWeight: FontWeight.w600,
                          color: AppColors.primary,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                Text(
                  widget.bio,
                  style: const TextStyle(
                    fontFamily: 'Be Vietnam Pro',
                    fontSize: 13,
                    color: AppColors.textSecondary,
                    height: 1.4,
                  ),
                ),
                const SizedBox(height: 8),
                Wrap(
                  spacing: 12,
                  runSpacing: 4,
                  children: [
                    Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(
                          Icons.location_on_outlined,
                          size: 14,
                          color: AppColors.neutral,
                        ),
                        const SizedBox(width: 4),
                        const Text(
                          'Đà Nẵng',
                          style: TextStyle(
                            fontFamily: 'Be Vietnam Pro',
                            fontSize: 12,
                            color: AppColors.neutral,
                          ),
                        ),
                      ],
                    ),
                    Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(
                          Icons.calendar_today_outlined,
                          size: 13,
                          color: AppColors.neutral,
                        ),
                        const SizedBox(width: 4),
                        Text(
                          widget.joinDate,
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
              ],
            ),
          ),

          // Stats Bar (Expanded items with responsive dividers)
          Container(
            padding: const EdgeInsets.symmetric(vertical: 12),
            decoration: const BoxDecoration(
              border: Border(
                top: BorderSide(color: AppColors.borderLight),
                bottom: BorderSide(color: AppColors.borderLight),
              ),
            ),
            child: Row(
              children: [
                _buildStatItem('Bài viết', widget.postsCount.toString()),
                _buildDivider(),
                _buildStatItem('Theo dõi', widget.followersCount.toString()),
                _buildDivider(),
                _buildStatItem('Đang theo dõi', widget.followingCount.toString()),
                _buildDivider(),
                _buildStatItem('Lượt thích', widget.likesCount.toString()),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatItem(String label, String value) {
    return Expanded(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            value,
            style: const TextStyle(
              fontFamily: 'Be Vietnam Pro',
              fontSize: 15,
              fontWeight: FontWeight.w700,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            label,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(
              fontFamily: 'Be Vietnam Pro',
              fontSize: 11,
              color: AppColors.textTertiary,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDivider() {
    return Container(
      height: 20,
      width: 1,
      color: AppColors.border,
    );
  }
}
