import 'package:flutter/material.dart';
import 'package:smarttrip/services/auth_service.dart';
import 'package:smarttrip/screens/PROFILE/edit_profile_screen.dart';
import 'package:smarttrip/models/feed_post_model.dart';
import 'package:smarttrip/screens/FEED/create_post_screen.dart';
import 'package:smarttrip/theme/app_colors.dart';
import 'package:smarttrip/widgets/feed/feed_post_card.dart';
import 'package:smarttrip/widgets/user_profile/user_profile_empty_posts.dart';
import 'package:smarttrip/widgets/user_profile/user_profile_header.dart';
import 'package:smarttrip/services/feed_service.dart';

class UserProfilePostsScreen extends StatefulWidget {
  final int? authorId;
  final String authorName;
  final String authorAvatar;
  final bool isVerified;
  final List<FeedPostModel>? initialPosts;
  final bool isCurrentUser;

  const UserProfilePostsScreen({
    super.key,
    this.authorId,
    required this.authorName,
    required this.authorAvatar,
    this.isVerified = false,
    this.initialPosts,
    this.isCurrentUser = false,
  });

  @override
  State<UserProfilePostsScreen> createState() => _UserProfilePostsScreenState();
}

class _UserProfilePostsScreenState extends State<UserProfilePostsScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  List<FeedPostModel> _userPosts = [];
  String? _authorAvatar;
  String _authorName = '';
  String _authorEmail = '';
  String _authorPhone = '';
  String _authorBio = 'Yêu du lịch, thích khám phá văn hóa & ẩm thực Đà Nẵng';
  String _joinDate = 'Tham gia từ 2026';
  int _followersCount = 0;
  int _followingCount = 0;
  bool _isFollowing = false;
  int get _totalLikes => _userPosts.fold(0, (sum, p) => sum + p.likes);

  @override
  void initState() {
    super.initState();
    _authorName = widget.authorName;
    _authorAvatar = widget.authorAvatar;
    _tabController = TabController(length: 3, vsync: this);
    _loadUserPosts();
  }

  Future<void> _loadUserPosts() async {
    if (widget.isCurrentUser) {
      final profile = await AuthService.instance.getProfile();
      if (profile != null && mounted) {
        setState(() {
          _authorName = profile['fullName'] ?? widget.authorName;
          _authorAvatar = profile['avatarUrl'] ?? widget.authorAvatar;
          _authorEmail = profile['email'] as String? ?? '';
          _authorPhone = profile['phoneNumber'] as String? ?? '';
          _followersCount = (profile['followersCount'] as num?)?.toInt() ?? 0;
          _followingCount = (profile['followingCount'] as num?)?.toInt() ?? 0;
          if (profile['bio'] != null && (profile['bio'] as String).isNotEmpty) {
            _authorBio = profile['bio'];
          }
          if (profile['createdAt'] != null) {
            try {
              final dt = DateTime.parse(profile['createdAt']);
              _joinDate = 'Tham gia từ tháng ${dt.month}, ${dt.year}';
            } catch (_) {}
          }
        });
      }
    } else {
      _authorName = widget.authorName;
      _authorAvatar = widget.authorAvatar;
      if (widget.authorId != null) {
        final stats = await AuthService.instance.getFollowStats(
          widget.authorId!,
        );
        if (stats != null && mounted) {
          setState(() {
            _followersCount = (stats['followersCount'] as num?)?.toInt() ?? 0;
            _followingCount = (stats['followingCount'] as num?)?.toInt() ?? 0;
            _isFollowing = stats['isFollowing'] as bool? ?? false;
          });
        }
      }
    }

    final posts = widget.isCurrentUser
        ? await FeedService.instance.getMyPosts()
        : (await FeedService.instance.getPosts())
              .where(
                (p) =>
                    p.authorName.toLowerCase() ==
                    widget.authorName.toLowerCase(),
              )
              .toList();
    if (mounted) setState(() => _userPosts = posts);
  }

  void _toggleFollow() async {
    if (widget.authorId == null) return;
    final res = await AuthService.instance.toggleFollow(widget.authorId!);
    if (res != null && mounted) {
      setState(() {
        _isFollowing = res['isFollowing'] as bool? ?? !_isFollowing;
        _followersCount =
            (res['followersCount'] as num?)?.toInt() ?? _followersCount;
      });
    }
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  void _navigateToCreatePost() async {
    final result = await Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => const CreatePostScreen()),
    );
    if (result != null && result is FeedPostModel) {
      setState(() {
        _userPosts.insert(0, result);
      });
    }
  }

  void _navigateToEditProfile() async {
    final result = await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => EditProfileScreen(
          userData: {
            'name': _authorName.isNotEmpty ? _authorName : widget.authorName,
            'email': _authorEmail,
            'phone': _authorPhone,
            'avatar': _authorAvatar ?? widget.authorAvatar,
            'bio': _authorBio,
          },
        ),
      ),
    );
    if (result != null) {
      _loadUserPosts();
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      appBar: AppBar(
        backgroundColor: Theme.of(context).cardColor,
        elevation: 0,
        leading: IconButton(
          icon: Icon(
            Icons.arrow_back_ios_new_rounded,
            color: isDark ? Colors.white : AppColors.textPrimary,
            size: 20,
          ),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          _authorName.isNotEmpty ? _authorName : widget.authorName,
          style: TextStyle(
            fontFamily: 'Be Vietnam Pro',
            fontSize: 18,
            fontWeight: FontWeight.w700,
            color: isDark ? Colors.white : AppColors.textPrimary,
          ),
        ),
        centerTitle: true,
        actions: [
          IconButton(
            icon: Icon(
              Icons.share_outlined,
              color: isDark ? Colors.white : AppColors.textPrimary,
              size: 20,
            ),
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text(
                    'Chia sẻ trang cá nhân của ${widget.authorName}',
                  ),
                ),
              );
            },
          ),
        ],
      ),
      body: NestedScrollView(
        headerSliverBuilder: (context, innerBoxIsScrolled) {
          return [
            SliverToBoxAdapter(
              child: UserProfileHeader(
                authorName: _authorName.isEmpty
                    ? widget.authorName
                    : _authorName,
                authorAvatar: _authorAvatar ?? widget.authorAvatar,
                bio: _authorBio,
                joinDate: _joinDate,
                isVerified: widget.isVerified,
                postsCount: _userPosts.length,
                likesCount: _totalLikes,
                followersCount: _followersCount,
                followingCount: _followingCount,
                isCurrentUser: widget.isCurrentUser,
                isFollowing: _isFollowing,
                onFollowToggle: _toggleFollow,
                onEditProfile: _navigateToEditProfile,
              ),
            ),
            SliverPersistentHeader(
              pinned: true,
              delegate: _TabBarDelegate(
                TabBar(
                  controller: _tabController,
                  indicatorColor: AppColors.primary,
                  indicatorWeight: 3,
                  labelColor: isDark ? Colors.white : AppColors.primary,
                  unselectedLabelColor: AppColors.neutral,
                  labelStyle: const TextStyle(
                    fontFamily: 'Be Vietnam Pro',
                    fontWeight: FontWeight.w700,
                    fontSize: 14,
                  ),
                  unselectedLabelStyle: const TextStyle(
                    fontFamily: 'Be Vietnam Pro',
                    fontWeight: FontWeight.w500,
                    fontSize: 14,
                  ),
                  tabs: [
                    Tab(text: 'Bài viết (${_userPosts.length})'),
                    const Tab(text: 'Hình ảnh'),
                    const Tab(text: 'Hỏi đáp'),
                  ],
                ),
              ),
            ),
          ];
        },
        body: TabBarView(
          controller: _tabController,
          children: [
            // Tab 1: Posts (havepost or none)
            _userPosts.isEmpty
                ? SingleChildScrollView(
                    physics: const AlwaysScrollableScrollPhysics(),
                    child: UserProfileEmptyPosts(
                      isCurrentUser: widget.isCurrentUser,
                      onCreatePost: _navigateToCreatePost,
                    ),
                  )
                : ListView.builder(
                    padding: const EdgeInsets.only(top: 8, bottom: 24),
                    physics: const AlwaysScrollableScrollPhysics(),
                    itemCount: _userPosts.length,
                    itemBuilder: (context, index) {
                      final post = _userPosts[index];
                      return FeedPostCard(
                        key: ValueKey(post.id),
                        post: post,
                        onPostUpdated: () => setState(() {}),
                        onPostDeleted: () {
                          setState(() {
                            _userPosts.removeWhere((p) => p.id == post.id);
                          });
                        },
                      );
                    },
                  ),

            // Tab 2: Photos Grid
            _buildPhotosGrid(),

            // Tab 3: Q&A
            _buildQuestionsList(),
          ],
        ),
      ),
    );
  }

  Widget _buildPhotosGrid() {
    final allImages = _userPosts.expand((p) => p.images).toList();
    if (allImages.isEmpty) {
      return const SingleChildScrollView(
        physics: AlwaysScrollableScrollPhysics(),
        child: Padding(
          padding: EdgeInsets.symmetric(vertical: 60),
          child: Center(
            child: Text(
              'Chưa có hình ảnh nào được tải lên',
              style: TextStyle(
                fontFamily: 'Be Vietnam Pro',
                fontSize: 14,
                color: AppColors.textTertiary,
              ),
            ),
          ),
        ),
      );
    }

    return GridView.builder(
      padding: const EdgeInsets.all(12),
      physics: const AlwaysScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 3,
        crossAxisSpacing: 8,
        mainAxisSpacing: 8,
      ),
      itemCount: allImages.length,
      itemBuilder: (context, index) {
        return ClipRRect(
          borderRadius: BorderRadius.circular(8),
          child: Image.network(
            allImages[index].imageUrl,
            fit: BoxFit.cover,
            errorBuilder: (_, __, ___) => Container(
              color: AppColors.bgSecondary,
              child: const Icon(
                Icons.image_not_supported,
                color: AppColors.textHint,
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _buildQuestionsList() {
    final questions = _userPosts
        .where((p) => p.type == PostType.question)
        .toList();
    if (questions.isEmpty) {
      return const SingleChildScrollView(
        physics: AlwaysScrollableScrollPhysics(),
        child: Padding(
          padding: EdgeInsets.symmetric(vertical: 60),
          child: Center(
            child: Text(
              'Chưa có câu hỏi nào từ tác giả này',
              style: TextStyle(
                fontFamily: 'Be Vietnam Pro',
                fontSize: 14,
                color: AppColors.textTertiary,
              ),
            ),
          ),
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.only(top: 8, bottom: 24),
      physics: const AlwaysScrollableScrollPhysics(),
      itemCount: questions.length,
      itemBuilder: (context, index) {
        final post = questions[index];
        return FeedPostCard(
          key: ValueKey(post.id),
          post: post,
          onPostUpdated: () => setState(() {}),
          onPostDeleted: () {
            setState(() {
              _userPosts.removeWhere((p) => p.id == post.id);
            });
          },
        );
      },
    );
  }
}

class _TabBarDelegate extends SliverPersistentHeaderDelegate {
  final TabBar tabBar;

  _TabBarDelegate(this.tabBar);

  @override
  double get minExtent => tabBar.preferredSize.height + 1.0;
  @override
  double get maxExtent => tabBar.preferredSize.height + 1.0;

  @override
  Widget build(
    BuildContext context,
    double shrinkOffset,
    bool overlapsContent,
  ) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      color: Theme.of(context).cardColor,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          tabBar,
          Container(
            color: isDark ? Colors.white12 : AppColors.divider,
            height: 1.0,
          ),
        ],
      ),
    );
  }

  @override
  bool shouldRebuild(_TabBarDelegate oldDelegate) => false;
}
