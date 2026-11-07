import 'package:flutter/material.dart';
import 'package:smarttrip/models/feed_post_model.dart';
import 'package:smarttrip/theme/app_colors.dart';

class FeedImageGallery extends StatelessWidget {
  final List<PostImageItem> images;
  final bool isCollageBanner;
  final String? bannerHighlightTitle;
  final String? bannerPriceTag;
  final String? bannerExtraImagesText;

  const FeedImageGallery({
    super.key,
    required this.images,
    this.isCollageBanner = false,
    this.bannerHighlightTitle,
    this.bannerPriceTag,
    this.bannerExtraImagesText,
  });

  @override
  Widget build(BuildContext context) {
    if (images.isEmpty) return const SizedBox.shrink();

    if (isCollageBanner) {
      return _buildCollageBanner(context);
    }

    if (images.length == 2) {
      return _buildTwoImageGrid(context);
    }

    return _buildSingleImage(context);
  }

  Widget _buildTwoImageGrid(BuildContext context) {
    return SizedBox(
      height: 192,
      child: Row(
        children: [
          Expanded(child: _buildImageTile(images[0])),
          const SizedBox(width: 8),
          Expanded(child: _buildImageTile(images[1])),
        ],
      ),
    );
  }

  Widget _buildImageTile(PostImageItem item) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(12),
      child: Stack(
        fit: StackFit.expand,
        children: [
          Image.network(
            item.imageUrl,
            fit: BoxFit.cover,
            errorBuilder: (context, error, stackTrace) => Container(
              color: Colors.grey.shade200,
              child: const Icon(Icons.broken_image, color: Colors.grey),
            ),
          ),
          // Subtle dark gradient at bottom for text readability
          if (item.caption != null && item.caption!.isNotEmpty) ...[
            Positioned(
              bottom: 8,
              left: 8,
              right: 8,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: const Color(0xFF1A2E35).withValues(alpha: 0.65),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  item.caption!,
                  style: const TextStyle(
                    fontFamily: 'Be Vietnam Pro',
                    fontSize: 11,
                    fontWeight: FontWeight.w500,
                    color: Colors.white,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildCollageBanner(BuildContext context) {
    final heroImage = images.first.imageUrl;

    return Container(
      height: 208,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(12),
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(12),
        child: Stack(
          fit: StackFit.expand,
          children: [
            Image.network(
              heroImage,
              fit: BoxFit.cover,
              errorBuilder: (context, error, stackTrace) => Container(
                color: Colors.grey.shade200,
                child: const Icon(Icons.broken_image, color: Colors.grey),
              ),
            ),
            // Gradient scrim
            Positioned.fill(
              child: DecoratedBox(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                    colors: [
                      Colors.transparent,
                      Colors.black.withValues(alpha: 0.15),
                      Colors.black.withValues(alpha: 0.75),
                    ],
                    stops: const [0.4, 0.7, 1.0],
                  ),
                ),
              ),
            ),
            // Top Right Extra Images Count Badge
            if (bannerExtraImagesText != null)
              Positioned(
                top: 10,
                right: 10,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                  decoration: BoxDecoration(
                    color: const Color(0xFF1A2E35).withValues(alpha: 0.7),
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(
                        Icons.photo_library_rounded,
                        size: 14,
                        color: AppColors.accentLight,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        bannerExtraImagesText!,
                        style: const TextStyle(
                          fontFamily: 'Be Vietnam Pro',
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: Colors.white,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            // Bottom Information Overlay
            if (bannerHighlightTitle != null || bannerPriceTag != null)
              Positioned(
                left: 12,
                right: 12,
                bottom: 12,
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    if (bannerHighlightTitle != null)
                      Expanded(
                        child: Row(
                          children: [
                            const Icon(
                              Icons.restaurant_menu_rounded,
                              size: 16,
                              color: AppColors.accentLight,
                            ),
                            const SizedBox(width: 6),
                            Expanded(
                              child: Text(
                                bannerHighlightTitle!,
                                style: const TextStyle(
                                  fontFamily: 'Be Vietnam Pro',
                                  fontSize: 13,
                                  fontWeight: FontWeight.w700,
                                  color: Color(0xFFE0F7F8),
                                ),
                                maxLines: 2,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                          ],
                        ),
                      ),
                    if (bannerPriceTag != null) ...[
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                        decoration: BoxDecoration(
                          color: AppColors.accent.withValues(alpha: 0.95),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          bannerPriceTag!,
                          style: const TextStyle(
                            fontFamily: 'Be Vietnam Pro',
                            fontSize: 12,
                            fontWeight: FontWeight.w700,
                            color: Colors.white,
                          ),
                        ),
                      ),
                    ],
                  ],
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildSingleImage(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(12),
      child: Image.network(
        images.first.imageUrl,
        height: 190,
        width: double.infinity,
        fit: BoxFit.cover,
        errorBuilder: (context, error, stackTrace) => Container(
          height: 190,
          color: Colors.grey.shade200,
          child: const Icon(Icons.broken_image, color: Colors.grey),
        ),
      ),
    );
  }
}
