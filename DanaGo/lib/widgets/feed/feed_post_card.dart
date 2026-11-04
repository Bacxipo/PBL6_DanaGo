import 'package:flutter/material.dart';
import 'package:smarttrip/models/feed_post_model.dart';
import 'package:smarttrip/screens/detail_place_screen.dart';
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

  const FeedPostCard({
    super.key,
    required this.post,
    this.onPostUpdated,
  });

  @override
  State<FeedPostCard> createState() => _FeedPostCardState();
}

class _FeedPostCardState extends State<FeedPostCard> {
  void _handleLike() {
    setState(() {
      widget.post.isLiked = !widget.post.isLiked;
      widget.post.likes += widget.post.isLiked ? 1 : -1;
    });
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
          builder: (_) => DetailPlaceScreen(item: widget.post.linkedDestination!),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final post = widget.post;

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // 1. Author Header
          FeedAuthorHeader(post: post),

          // 2. Location Pill (if present)
          if (post.locationName != null && post.locationName!.isNotEmpty) ...[
            const SizedBox(height: 10),
            FeedLocationPill(
              locationName: post.locationName!,
              onTap: _navigateToDestination,
            ),
          ],

          // 3. Question / New Place Title (if present)
          if (post.title != null && post.title!.isNotEmpty && post.type != PostType.experience) ...[
            const SizedBox(height: 10),
            Text(
              post.title!,
              style: const TextStyle(
                fontFamily: 'Be Vietnam Pro',
                fontSize: 16,
                fontWeight: FontWeight.w700,
                color: AppColors.textPrimary,
                height: 1.35,
              ),
            ),
          ],

          // 4. Post Body Text
          const SizedBox(height: 10),
          _buildRichContent(post.content),

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
          const Divider(height: 16, thickness: 0.8, color: AppColors.borderLight),
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

  Widget _buildRichContent(String content) {
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
            color: isHashtag ? AppColors.primary : AppColors.textPrimary,
            fontWeight: isHashtag ? FontWeight.w600 : FontWeight.w400,
          ),
        ),
      );
    }

    return RichText(text: TextSpan(children: spans));
  }
}

