import 'package:flutter/material.dart';
import 'package:smarttrip/models/feed_post_model.dart';

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

  void _openViewer(BuildContext context, int initialIndex) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => _FullScreenImageViewer(
          images: images,
          initialIndex: initialIndex,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (images.isEmpty) return const SizedBox.shrink();

    final count = images.length;
    Widget grid;

    if (count == 1) {
      grid = _buildSingle(context, 0);
    } else if (count == 2) {
      grid = _buildTwo(context);
    } else if (count == 3) {
      grid = _buildThree(context);
    } else if (count == 4) {
      grid = _buildFour(context);
    } else {
      grid = _buildFiveOrMore(context);
    }

    return ClipRRect(
      borderRadius: BorderRadius.circular(14),
      child: grid,
    );
  }

  // 1 ảnh full
  Widget _buildSingle(BuildContext context, int index) {
    return AspectRatio(
      aspectRatio: 16 / 9,
      child: _buildTile(context, index),
    );
  }

  // 2 ảnh song song
  Widget _buildTwo(BuildContext context) {
    return SizedBox(
      height: 220,
      child: Row(
        children: [
          Expanded(child: _buildTile(context, 0)),
          const SizedBox(width: 4),
          Expanded(child: _buildTile(context, 1)),
        ],
      ),
    );
  }

  // 3 ảnh: 1 lớn bên trái, 2 nhỏ bên phải
  Widget _buildThree(BuildContext context) {
    return SizedBox(
      height: 240,
      child: Row(
        children: [
          Expanded(flex: 2, child: _buildTile(context, 0)),
          const SizedBox(width: 4),
          Expanded(
            flex: 1,
            child: Column(
              children: [
                Expanded(child: _buildTile(context, 1)),
                const SizedBox(height: 4),
                Expanded(child: _buildTile(context, 2)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // 4 ảnh: lưới 2x2
  Widget _buildFour(BuildContext context) {
    return SizedBox(
      height: 240,
      child: Column(
        children: [
          Expanded(
            child: Row(
              children: [
                Expanded(child: _buildTile(context, 0)),
                const SizedBox(width: 4),
                Expanded(child: _buildTile(context, 1)),
              ],
            ),
          ),
          const SizedBox(height: 4),
          Expanded(
            child: Row(
              children: [
                Expanded(child: _buildTile(context, 2)),
                const SizedBox(width: 4),
                Expanded(child: _buildTile(context, 3)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // 5+ ảnh: Cột trái 2 ảnh, cột phải 3 ảnh (ảnh cuối có overlay +N)
  Widget _buildFiveOrMore(BuildContext context) {
    final remaining = images.length - 5;
    return SizedBox(
      height: 280,
      child: Row(
        children: [
          // Cột trái: 2 ảnh
          Expanded(
            flex: 1,
            child: Column(
              children: [
                Expanded(child: _buildTile(context, 0)),
                const SizedBox(height: 4),
                Expanded(child: _buildTile(context, 1)),
              ],
            ),
          ),
          const SizedBox(width: 4),
          // Cột phải: 3 ảnh
          Expanded(
            flex: 1,
            child: Column(
              children: [
                Expanded(child: _buildTile(context, 2)),
                const SizedBox(height: 4),
                Expanded(child: _buildTile(context, 3)),
                const SizedBox(height: 4),
                Expanded(
                  child: Stack(
                    fit: StackFit.expand,
                    children: [
                      _buildTile(context, 4),
                      if (remaining > 0)
                        GestureDetector(
                          onTap: () => _openViewer(context, 4),
                          child: Container(
                            color: Colors.black.withValues(alpha: 0.55),
                            alignment: Alignment.center,
                            child: Text(
                              '+$remaining',
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 22,
                                fontWeight: FontWeight.bold,
                                fontFamily: 'Be Vietnam Pro',
                              ),
                            ),
                          ),
                        ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTile(BuildContext context, int index) {
    return GestureDetector(
      onTap: () => _openViewer(context, index),
      child: Image.network(
        images[index].imageUrl,
        fit: BoxFit.cover,
        width: double.infinity,
        height: double.infinity,
        errorBuilder: (_, __, ___) => Container(
          color: Colors.grey.shade300,
          child: const Icon(Icons.broken_image, color: Colors.grey),
        ),
      ),
    );
  }
}

// Màn hình xem ảnh toàn màn hình có chuyển ảnh và mũi tên trái/phải
class _FullScreenImageViewer extends StatefulWidget {
  final List<PostImageItem> images;
  final int initialIndex;

  const _FullScreenImageViewer({
    required this.images,
    required this.initialIndex,
  });

  @override
  State<_FullScreenImageViewer> createState() => _FullScreenImageViewerState();
}

class _FullScreenImageViewerState extends State<_FullScreenImageViewer> {
  late PageController _pageController;
  late int _currentIndex;

  @override
  void initState() {
    super.initState();
    _currentIndex = widget.initialIndex;
    _pageController = PageController(initialPage: widget.initialIndex);
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        fit: StackFit.expand,
        children: [
          // PageView vuốt xem ảnh
          PageView.builder(
            controller: _pageController,
            itemCount: widget.images.length,
            onPageChanged: (i) => setState(() => _currentIndex = i),
            itemBuilder: (context, index) {
              return InteractiveViewer(
                minScale: 0.8,
                maxScale: 3.5,
                child: Center(
                  child: Image.network(
                    widget.images[index].imageUrl,
                    fit: BoxFit.contain,
                  ),
                ),
              );
            },
          ),

          // Header: Nút Đóng & Bộ đếm số ảnh
          Positioned(
            top: 40,
            left: 16,
            right: 16,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                IconButton(
                  icon: const Icon(Icons.close_rounded, color: Colors.white, size: 28),
                  onPressed: () => Navigator.pop(context),
                ),
                Text(
                  '${_currentIndex + 1} / ${widget.images.length}',
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                    fontFamily: 'Be Vietnam Pro',
                  ),
                ),
                const SizedBox(width: 48), // Cân bằng với icon nút đóng
              ],
            ),
          ),

          // Mũi tên chuyển ảnh sang trái
          if (_currentIndex > 0)
            Positioned(
              left: 12,
              top: 0,
              bottom: 0,
              child: Center(
                child: IconButton(
                  style: IconButton.styleFrom(
                    backgroundColor: Colors.black.withValues(alpha: 0.5),
                  ),
                  icon: const Icon(Icons.arrow_back_ios_new_rounded, color: Colors.white, size: 22),
                  onPressed: () {
                    _pageController.previousPage(
                      duration: const Duration(milliseconds: 250),
                      curve: Curves.easeInOut,
                    );
                  },
                ),
              ),
            ),

          // Mũi tên chuyển ảnh sang phải
          if (_currentIndex < widget.images.length - 1)
            Positioned(
              right: 12,
              top: 0,
              bottom: 0,
              child: Center(
                child: IconButton(
                  style: IconButton.styleFrom(
                    backgroundColor: Colors.black.withValues(alpha: 0.5),
                  ),
                  icon: const Icon(Icons.arrow_forward_ios_rounded, color: Colors.white, size: 22),
                  onPressed: () {
                    _pageController.nextPage(
                      duration: const Duration(milliseconds: 250),
                      curve: Curves.easeInOut,
                    );
                  },
                ),
              ),
            ),
        ],
      ),
    );
  }
}
