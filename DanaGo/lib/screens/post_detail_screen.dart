import 'package:flutter/material.dart';
import 'package:smarttrip/models/feed_post_model.dart';
import 'package:smarttrip/services/feed_service.dart';
import 'package:smarttrip/theme/app_colors.dart';
import 'package:smarttrip/widgets/feed/feed_comment_sheet.dart';
import 'package:smarttrip/widgets/feed/feed_post_card.dart';

class PostDetailScreen extends StatefulWidget {
  final int postId;
  final bool openCommentsOnLoad;

  const PostDetailScreen({
    super.key,
    required this.postId,
    this.openCommentsOnLoad = false,
  });

  @override
  State<PostDetailScreen> createState() => _PostDetailScreenState();
}

class _PostDetailScreenState extends State<PostDetailScreen> {
  FeedPostModel? _post;
  bool _isLoading = true;
  bool _openedComments = false;

  @override
  void initState() {
    super.initState();
    _loadPost();
  }

  Future<void> _loadPost() async {
    setState(() => _isLoading = true);
    final post = await FeedService.instance.getPostById(widget.postId);
    if (!mounted) return;
    setState(() {
      _post = post;
      _isLoading = false;
    });

    if (post != null && widget.openCommentsOnLoad && !_openedComments) {
      _openedComments = true;
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (!mounted || _post == null) return;
        FeedCommentSheet.show(
          context,
          post: _post!,
          onCommentAdded: (_) {
            if (mounted) setState(() {});
          },
        );
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
          'Chi tiết bài viết',
          style: TextStyle(
            fontFamily: 'Be Vietnam Pro',
            fontSize: 17,
            fontWeight: FontWeight.w700,
            color: isDark ? Colors.white : AppColors.textPrimary,
          ),
        ),
        centerTitle: true,
      ),
      body: _isLoading
          ? const Center(
              child: CircularProgressIndicator(color: AppColors.primary),
            )
          : _post == null
              ? Center(
                  child: Padding(
                    padding: const EdgeInsets.all(24),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          Icons.article_outlined,
                          size: 56,
                          color: AppColors.primary.withValues(alpha: 0.35),
                        ),
                        const SizedBox(height: 12),
                        Text(
                          'Bài viết không còn tồn tại hoặc đã bị ẩn',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            fontFamily: 'Be Vietnam Pro',
                            fontSize: 15,
                            fontWeight: FontWeight.w600,
                            color: isDark
                                ? Colors.white70
                                : AppColors.textSecondary,
                          ),
                        ),
                      ],
                    ),
                  ),
                )
              : RefreshIndicator(
                  onRefresh: _loadPost,
                  color: AppColors.primary,
                  child: SingleChildScrollView(
                    physics: const AlwaysScrollableScrollPhysics(
                      parent: BouncingScrollPhysics(),
                    ),
                    padding: const EdgeInsets.fromLTRB(16, 12, 16, 28),
                    child: FeedPostCard(
                      post: _post!,
                      onPostUpdated: () {
                        if (mounted) setState(() {});
                      },
                    ),
                  ),
                ),
    );
  }
}
