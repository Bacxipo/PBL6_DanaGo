import 'package:flutter/material.dart';
import 'package:smarttrip/models/feed_post_model.dart';
import 'package:smarttrip/screens/create_post_screen.dart';
import 'package:smarttrip/screens/notifications_screen.dart';
import 'package:smarttrip/screens/user_profile_posts_screen.dart';
import 'package:smarttrip/theme/app_colors.dart';
import 'package:smarttrip/widgets/feed/feed_post_card.dart';

class FeedScreen extends StatefulWidget {
  const FeedScreen({super.key});

  @override
  State<FeedScreen> createState() => _FeedScreenState();
}

class _FeedScreenState extends State<FeedScreen> {
  late List<FeedPostModel> _posts;
  final ScrollController _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    _posts = FeedPostModel.getMockPosts();
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  Future<void> _handleRefresh() async {
    await Future.delayed(const Duration(milliseconds: 600));
    setState(() {
      _posts = FeedPostModel.getMockPosts();
    });
  }

  Future<void> _openCreatePost() async {
    final newPost = await Navigator.push<FeedPostModel>(
      context,
      MaterialPageRoute(builder: (_) => const CreatePostScreen()),
    );

    if (newPost != null) {
      setState(() {
        _posts.insert(0, newPost);
      });
      _scrollController.animateTo(
        0,
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeOut,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: _handleRefresh,
          color: AppColors.primary,
          child: CustomScrollView(
            controller: _scrollController,
            slivers: [
              // 1. Feed Page Header with Title & Notification Bell
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 8,
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        crossAxisAlignment: CrossAxisAlignment.center,
                        children: [
                          const Text(
                            'Bảng tin',
                            style: TextStyle(
                              fontFamily: 'Be Vietnam Pro',
                              fontSize: 26,
                              fontWeight: FontWeight.w800,
                              color: AppColors.primary,
                            ),
                          ),
                          IconButton(
                            icon: const Icon(
                              Icons.notifications_none_rounded,
                              color: AppColors.primary,
                              size: 26,
                            ),
                            onPressed: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (_) => const NotificationsScreen(),
                                ),
                              );
                            },
                          ),
                        ],
                      ),
                      const SizedBox(height: 10),
                      // Quick Share / Compose Card
                      InkWell(
                        onTap: _openCreatePost,
                        borderRadius: BorderRadius.circular(16),
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 14,
                            vertical: 12,
                          ),
                          decoration: BoxDecoration(
                            color: Theme.of(context).cardColor,
                            borderRadius: BorderRadius.circular(16),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withValues(alpha: isDark ? 0.2 : 0.03),
                                blurRadius: 8,
                                offset: const Offset(0, 2),
                              ),
                            ],
                          ),
                          child: Row(
                            children: [
                              GestureDetector(
                                onTap: () {
                                  Navigator.push(
                                    context,
                                    MaterialPageRoute(
                                      builder: (_) => const UserProfilePostsScreen(
                                        authorName: 'Nguyễn Văn A',
                                        authorAvatar:
                                            'https://i.postimg.cc/tC24nW4N/avt1.jpg',
                                        isVerified: true,
                                        isCurrentUser: true,
                                      ),
                                    ),
                                  );
                                },
                                child: ClipOval(
                                  child: Image.network(
                                    'https://i.postimg.cc/tC24nW4N/avt1.jpg',
                                    width: 36,
                                    height: 36,
                                    fit: BoxFit.cover,
                                    errorBuilder: (_, __, ___) => Container(
                                      width: 36,
                                      height: 36,
                                      color: AppColors.primaryLight,
                                      child: const Icon(
                                        Icons.person,
                                        color: AppColors.primary,
                                        size: 20,
                                      ),
                                    ),
                                  ),
                                ),
                              ),
                              const SizedBox(width: 12),
                              const Expanded(
                                child: Text(
                                  'Lưu lại khoảnh khắc mới nhất của bạn nào!',
                                  style: TextStyle(
                                    fontFamily: 'Be Vietnam Pro',
                                    fontSize: 13,
                                    color: AppColors.textHint,
                                  ),
                                ),
                              ),
                              Container(
                                padding: const EdgeInsets.all(6),
                                decoration: BoxDecoration(
                                  color: AppColors.primaryLight,
                                  borderRadius: BorderRadius.circular(10),
                                ),
                                child: const Icon(
                                  Icons.edit_note_rounded,
                                  size: 20,
                                  color: AppColors.primary,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              // 2. Post Feed List
              SliverList(
                delegate: SliverChildBuilderDelegate((context, index) {
                  final post = _posts[index];
                  return FeedPostCard(
                    key: ValueKey(post.id),
                    post: post,
                    onPostUpdated: () => setState(() {}),
                  );
                }, childCount: _posts.length),
              ),

              // Bottom padding for scroll clearance above bottom nav bar
              const SliverToBoxAdapter(child: SizedBox(height: 80)),
            ],
          ),
        ),
      ),
      // Floating Action Button "Viết bài"
      floatingActionButton: FloatingActionButton.extended(
        heroTag: 'feed_fab',
        onPressed: _openCreatePost,
        backgroundColor: AppColors.primary,
        elevation: 3,
        icon: const Icon(Icons.edit_outlined, size: 18, color: Colors.white),
        label: const Text(
          'Viết bài',
          style: TextStyle(
            fontFamily: 'Be Vietnam Pro',
            fontSize: 13,
            fontWeight: FontWeight.w700,
            color: Colors.white,
          ),
        ),
      ),
    );
  }
}
