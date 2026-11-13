import 'package:flutter/material.dart';
import 'package:smarttrip/models/feed_post_model.dart';
import 'package:smarttrip/screens/create_post_screen.dart';
import 'package:smarttrip/theme/app_colors.dart';
import 'package:smarttrip/widgets/feed/feed_post_card.dart';
import 'package:smarttrip/widgets/user_profile/user_profile_empty_posts.dart';
import 'package:smarttrip/widgets/user_profile/user_profile_header.dart';

class UserProfilePostsScreen extends StatefulWidget {
  final String authorName;
  final String authorAvatar;
  final bool isVerified;
  final List<FeedPostModel>? initialPosts;
  final bool isCurrentUser;

  const UserProfilePostsScreen({
    super.key,
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
  late List<FeedPostModel> _userPosts;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);

    if (widget.initialPosts != null) {
      _userPosts = List.from(widget.initialPosts!);
    } else {
      // Find matching posts by author or generate demo posts
      final allMock = FeedPostModel.getMockPosts();
      final matched = allMock
          .where((p) => p.authorName.toLowerCase() == widget.authorName.toLowerCase())
          .toList();
      _userPosts = matched;
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
          widget.authorName,
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
                SnackBar(content: Text('Chia sẻ trang cá nhân của ${widget.authorName}')),
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
                authorName: widget.authorName,
                authorAvatar: widget.authorAvatar,
                isVerified: widget.isVerified,
                postsCount: _userPosts.length,
                isCurrentUser: widget.isCurrentUser,
              ),
            ),
            SliverPersistentHeader(
              pinned: true,
              delegate: _TabBarDelegate(
                TabBar(
                  controller: _tabController,
                  indicatorColor: AppColors.primary,
                  indicatorWeight: 3,
                  labelColor: AppColors.primary,
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
                      return FeedPostCard(post: _userPosts[index]);
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
              child: const Icon(Icons.image_not_supported, color: AppColors.textHint),
            ),
          ),
        );
      },
    );
  }

  Widget _buildQuestionsList() {
    final questions = _userPosts.where((p) => p.type == PostType.question).toList();
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
        return FeedPostCard(post: questions[index]);
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
  Widget build(BuildContext context, double shrinkOffset, bool overlapsContent) {
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
