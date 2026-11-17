import 'package:flutter/material.dart';
import 'package:smarttrip/models/feed_post_model.dart';
import 'package:smarttrip/screens/detail_place_screen.dart';
import 'package:smarttrip/services/auth_service.dart';
import 'package:smarttrip/services/feed_service.dart';
import 'package:smarttrip/theme/app_colors.dart';
import 'package:smarttrip/widgets/feed/feed_action_bar.dart';
import 'package:smarttrip/widgets/feed/feed_author_header.dart';
import 'package:smarttrip/widgets/feed/feed_comment_sheet.dart';
import 'package:smarttrip/widgets/feed/feed_destination_link_card.dart';
import 'package:smarttrip/widgets/feed/feed_image_gallery.dart';
import 'package:smarttrip/widgets/feed/feed_location_pill.dart';

class FeedPostCard extends StatefulWidget {
  final FeedPostModel post;
  final VoidCallback? onPostUpdated;
  final VoidCallback? onPostDeleted;

  const FeedPostCard({
    super.key,
    required this.post,
    this.onPostUpdated,
    this.onPostDeleted,
  });

  @override
  State<FeedPostCard> createState() => _FeedPostCardState();
}

class _FeedPostCardState extends State<FeedPostCard> {
  void _handleLike() async {
    setState(() {
      widget.post.isLiked = !widget.post.isLiked;
      widget.post.likes += widget.post.isLiked ? 1 : -1;
    });
    await FeedService.instance.toggleLike(widget.post.id);
    widget.onPostUpdated?.call();
  }

  void _handleBookmark() {
    setState(() {
      widget.post.isSaved = !widget.post.isSaved;
    });
    ScaffoldMessenger.of(context).hideCurrentSnackBar();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          widget.post.isSaved
              ? 'Đã lưu bài viết vào mục yêu thích'
              : 'Đã bỏ lưu bài viết',
          style: const TextStyle(fontFamily: 'Be Vietnam Pro', fontSize: 13),
        ),
        backgroundColor: AppColors.primary,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        duration: const Duration(seconds: 1),
      ),
    );
    widget.onPostUpdated?.call();
  }

  void _handleOpenComments() {
    FeedCommentSheet.show(
      context,
      post: widget.post,
      onCommentAdded: (newComment) {
        setState(() {});
        widget.onPostUpdated?.call();
      },
    );
  }

  void _navigateToDestination() {
    if (widget.post.linkedDestination != null) {
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (_) =>
              DetailPlaceScreen(item: widget.post.linkedDestination!),
        ),
      );
    }
  }

  Future<void> _handleMorePressed() async {
    final profile = await AuthService.instance.getProfile();
    final myId = (profile?['id'] as num?)?.toInt();
    final isOwner =
        myId != null &&
        widget.post.authorId != null &&
        widget.post.authorId == myId;

    // Bài viết của người khác: ấn ... không làm gì
    if (!isOwner || !mounted) return;
    final isDark = Theme.of(context).brightness == Brightness.dark;

    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (sheetCtx) => Container(
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
        decoration: BoxDecoration(
          color: Theme.of(context).cardColor,
          borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
        ),
        child: SafeArea(
          top: false,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 40,
                height: 4,
                margin: const EdgeInsets.only(bottom: 14),
                decoration: BoxDecoration(
                  color: isDark ? Colors.white24 : AppColors.border,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              ListTile(
                leading: const Icon(
                  Icons.edit_outlined,
                  color: AppColors.primary,
                ),
                title: const Text(
                  'Chỉnh sửa bài viết',
                  style: TextStyle(
                    fontFamily: 'Be Vietnam Pro',
                    fontWeight: FontWeight.w600,
                  ),
                ),
                onTap: () {
                  Navigator.pop(sheetCtx);
                  _showEditPostSheet();
                },
              ),
              ListTile(
                leading: const Icon(
                  Icons.delete_outline_rounded,
                  color: AppColors.error,
                ),
                title: const Text(
                  'Xóa bài viết',
                  style: TextStyle(
                    fontFamily: 'Be Vietnam Pro',
                    fontWeight: FontWeight.w600,
                    color: AppColors.error,
                  ),
                ),
                onTap: () {
                  Navigator.pop(sheetCtx);
                  _confirmDeletePost();
                },
              ),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _showEditPostSheet() async {
    final controller = TextEditingController(text: widget.post.content);
    bool isSaving = false;
    String? errorMsg;

    await showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (sheetCtx) {
        final isDark = Theme.of(context).brightness == Brightness.dark;
        return StatefulBuilder(
          builder: (sheetCtx, setSheetState) => Container(
            padding: EdgeInsets.fromLTRB(
              20,
              16,
              20,
              MediaQuery.of(sheetCtx).viewInsets.bottom + 20,
            ),
            decoration: BoxDecoration(
              color: Theme.of(context).cardColor,
              borderRadius: const BorderRadius.vertical(
                top: Radius.circular(24),
              ),
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Chỉnh sửa bài viết',
                      style: TextStyle(
                        fontFamily: 'Be Vietnam Pro',
                        fontSize: 18,
                        fontWeight: FontWeight.w700,
                        color: isDark ? Colors.white : AppColors.textPrimary,
                      ),
                    ),
                    IconButton(
                      onPressed: isSaving ? null : () => Navigator.pop(sheetCtx),
                      icon: const Icon(Icons.close_rounded),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                TextField(
                  controller: controller,
                  maxLines: 6,
                  minLines: 4,
                  autofocus: true,
                  style: TextStyle(
                    fontFamily: 'Be Vietnam Pro',
                    fontSize: 14,
                    color: isDark ? Colors.white : AppColors.textPrimary,
                  ),
                  decoration: InputDecoration(
                    hintText: 'Nhập nội dung bài viết...',
                    filled: true,
                    fillColor: isDark
                        ? const Color(0xFF0F172A)
                        : const Color(0xFFF8FAFC),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(14),
                      borderSide: BorderSide(
                        color: isDark ? Colors.white12 : Colors.grey.shade200,
                      ),
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(14),
                      borderSide: BorderSide(
                        color: isDark ? Colors.white12 : Colors.grey.shade200,
                      ),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(14),
                      borderSide: const BorderSide(color: AppColors.primary),
                    ),
                  ),
                ),
                if (errorMsg != null) ...[
                  const SizedBox(height: 8),
                  Text(
                    errorMsg!,
                    style: const TextStyle(
                      fontSize: 12,
                      color: AppColors.error,
                    ),
                  ),
                ],
                const SizedBox(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    TextButton(
                      onPressed: isSaving ? null : () => Navigator.pop(sheetCtx),
                      child: const Text(
                        'Hủy',
                        style: TextStyle(
                          fontFamily: 'Be Vietnam Pro',
                          color: AppColors.textTertiary,
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    ElevatedButton(
                      onPressed: isSaving
                          ? null
                          : () async {
                              final text = controller.text.trim();
                              if (text.isEmpty) {
                                setSheetState(
                                  () => errorMsg = 'Nội dung bài viết không được để trống.',
                                );
                                return;
                              }
                              setSheetState(() {
                                isSaving = true;
                                errorMsg = null;
                              });
                              final updated = await FeedService.instance
                                  .updatePost(widget.post.id, text);
                              if (!sheetCtx.mounted) return;
                              if (updated != null) {
                                Navigator.pop(sheetCtx);
                                if (mounted) {
                                  setState(() {
                                    widget.post.content = updated.content;
                                  });
                                  widget.onPostUpdated?.call();
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    const SnackBar(
                                      content: Text('Đã cập nhật bài viết'),
                                      backgroundColor: AppColors.primary,
                                      duration: Duration(seconds: 2),
                                    ),
                                  );
                                }
                              } else {
                                setSheetState(() {
                                  isSaving = false;
                                  errorMsg = 'Không thể cập nhật bài viết. Vui lòng thử lại.';
                                });
                              }
                            },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      child: isSaving
                          ? const SizedBox(
                              width: 18,
                              height: 18,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                color: Colors.white,
                              ),
                            )
                          : const Text(
                              'Lưu thay đổi',
                              style: TextStyle(
                                fontFamily: 'Be Vietnam Pro',
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        );
      },
    );
    controller.dispose();
  }

  Future<void> _confirmDeletePost() async {
    bool isDeleting = false;
    await showDialog(
      context: context,
      builder: (dialogCtx) => StatefulBuilder(
        builder: (dialogCtx, setDialogState) => AlertDialog(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(18),
          ),
          title: const Text(
            'Xóa bài viết',
            style: TextStyle(
              fontFamily: 'Be Vietnam Pro',
              fontWeight: FontWeight.w700,
            ),
          ),
          content: const Text(
            'Bạn có chắc chắn muốn xóa bài viết này không? Hành động này không thể hoàn tác.',
            style: TextStyle(fontFamily: 'Be Vietnam Pro'),
          ),
          actions: [
            TextButton(
              onPressed: isDeleting ? null : () => Navigator.pop(dialogCtx),
              child: const Text('Hủy'),
            ),
            ElevatedButton(
              onPressed: isDeleting
                  ? null
                  : () async {
                      setDialogState(() => isDeleting = true);
                      final ok = await FeedService.instance.deletePost(
                        widget.post.id,
                      );
                      if (!dialogCtx.mounted) return;
                      Navigator.pop(dialogCtx);
                      if (!mounted) return;
                      if (ok) {
                        widget.onPostDeleted?.call();
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text('Đã xóa bài viết'),
                            duration: Duration(seconds: 2),
                          ),
                        );
                      } else {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text('Không thể xóa bài viết. Vui lòng thử lại.'),
                            backgroundColor: AppColors.error,
                          ),
                        );
                      }
                    },
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.error,
                foregroundColor: Colors.white,
              ),
              child: isDeleting
                  ? const SizedBox(
                      width: 16,
                      height: 16,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: Colors.white,
                      ),
                    )
                  : const Text('Xóa'),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final post = widget.post;
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 7),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surfaceGrouped(context),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: AppColors.hairlineBorder(context),
          width: 0.85,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // 1. Author Header
          FeedAuthorHeader(
            post: post,
            onMorePressed: _handleMorePressed,
          ),

          // 2. Location Pill (if present)
          if (post.locationName != null && post.locationName!.isNotEmpty) ...[
            const SizedBox(height: 10),
            FeedLocationPill(
              locationName: post.locationName!,
              onTap: _navigateToDestination,
            ),
          ],

          // 3. Question / New Place Title (if present)
          if (post.title != null &&
              post.title!.isNotEmpty &&
              post.type != PostType.experience) ...[
            const SizedBox(height: 10),
            Text(
              post.title!,
              style: TextStyle(
                fontFamily: 'Be Vietnam Pro',
                fontSize: 16,
                fontWeight: FontWeight.w700,
                color: isDark ? Colors.white : AppColors.textPrimary,
                height: 1.35,
              ),
            ),
          ],

          // 4. Post Body Text
          const SizedBox(height: 10),
          _buildRichContent(post.content, isDark),

          // 5. Image Gallery
          if (post.images.isNotEmpty) ...[
            const SizedBox(height: 12),
            FeedImageGallery(
              images: post.images,
              isCollageBanner: post.isCollageBanner,
              bannerHighlightTitle: post.bannerHighlightTitle,
              bannerPriceTag: post.bannerPriceTag,
              bannerExtraImagesText: post.bannerExtraImagesText,
            ),
          ],

          // 6. Linked Destination Widget
          if (post.linkedDestination != null) ...[
            const SizedBox(height: 12),
            FeedDestinationLinkCard(
              destination: post.linkedDestination!,
              ratingText: post.rating?.toStringAsFixed(1),
              priceOrTagText: post.costEstimate ?? post.linkedDestination?.tag,
              initialSaved: post.linkedDestination?.id == 'dest_sontra',
            ),
          ],

          // 7. Action Bar (Like, Comment, Share, Bookmark)
          const SizedBox(height: 8),
          const Divider(
            height: 16,
            thickness: 0.8,
            color: AppColors.borderLight,
          ),
          FeedActionBar(
            likesCount: post.likes,
            commentsCount: post.commentsCount,
            isLiked: post.isLiked,
            isBookmarked: post.isSaved,
            onLikePressed: _handleLike,
            onCommentPressed: _handleOpenComments,
            onBookmarkPressed: _handleBookmark,
          ),
        ],
      ),
    );
  }

  Widget _buildRichContent(String content, bool isDark) {
    // Highlight hashtags with primary teal
    final words = content.split(' ');
    final spans = <TextSpan>[];

    for (var i = 0; i < words.length; i++) {
      final word = words[i];
      final isHashtag = word.startsWith('#');

      spans.add(
        TextSpan(
          text: '$word ',
          style: TextStyle(
            fontFamily: 'Be Vietnam Pro',
            fontSize: 14,
            height: 1.45,
            color: isHashtag
                ? (isDark ? const Color(0xFF2DD4BF) : AppColors.primary)
                : (isDark ? Colors.white70 : AppColors.textPrimary),
            fontWeight: isHashtag ? FontWeight.w600 : FontWeight.w400,
          ),
        ),
      );
    }

    return RichText(text: TextSpan(children: spans));
  }
}
