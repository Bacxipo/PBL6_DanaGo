import 'package:flutter/material.dart';

class DetailImageHeader extends StatefulWidget {
  final List<String> images;
  final bool isFavorite;
  final VoidCallback onFavoriteToggle;
  final VoidCallback onShare;
  const DetailImageHeader({
    super.key,
    required this.images,
    required this.isFavorite,
    required this.onFavoriteToggle,
    required this.onShare,
  });

  @override
  State<DetailImageHeader> createState() => _DetailImageHeaderState();
}

class _DetailImageHeaderState extends State<DetailImageHeader> {
  int _currentIndex = 0;
  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        //Images
        SizedBox(
          height: 320,
          child: PageView.builder(
            itemCount: widget.images.isNotEmpty ? widget.images.length : 1,
            onPageChanged: (index) {
              setState(() {
                _currentIndex = index;
              });
            },
            itemBuilder: (context, index) {
              final imageUrl = widget.images.isNotEmpty
                  ? widget.images[index]
                  : 'https://via.placeholder.com/600x400';
              return Image.network(
                imageUrl,
                width: double.infinity,
                height: 320,
                fit: BoxFit.cover,
                errorBuilder: (_, _, _) => Container(
                  color: Colors.grey[300],
                  child: const Icon(Icons.image_not_supported, size: 50),
                ),
              );
            },
          ),
        ),
        Positioned(
          top: 0,
          left: 0,
          right: 0,
          height: 100,
          child: Container(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [
                  Colors.black.withValues(alpha: 0.5),
                  Colors.transparent,
                ],
              ),
            ),
          ),
        ),
        // Back
        Positioned(
          top: MediaQuery.of(context).padding.top + 10,
          left: 16,
          child: CircleAvatar(
            backgroundColor: Colors.white.withValues(alpha: 0.9),
            radius: 20,
            child: IconButton(
              onPressed: () => Navigator.pop(context),
              icon: const Icon(Icons.arrow_back, color: Colors.black, size: 20),
            ),
          ),
        ),
        // share and love
        Positioned(
          top: MediaQuery.of(context).padding.top + 10,
          right: 16,
          child: Row(
            children: [
              CircleAvatar(
                backgroundColor: Colors.white.withValues(alpha: 0.9),
                radius: 20,
                child: IconButton(
                  onPressed: widget.onShare,
                  icon: const Icon(
                    Icons.share_outlined,
                    color: Colors.black,
                    size: 20,
                  ),
                ),
              ),
              const SizedBox(width: 10),
              CircleAvatar(
                backgroundColor: Colors.white.withValues(alpha: 0.9),
                radius: 20,
                child: IconButton(
                  onPressed: widget.onFavoriteToggle,
                  icon: Icon(
                    widget.isFavorite ? Icons.favorite : Icons.favorite_border,
                    color: widget.isFavorite ? Colors.red : Colors.black,
                    size: 20,
                  ),
                ),
              ),
            ],
          ),
        ),
        // dots
        Positioned(
          bottom: 16,
          right: 16,
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: List.generate(
              widget.images.length > 1 ? widget.images.length : 4,
              (index) => Container(
                margin: const EdgeInsets.only(left: 6),
                width: _currentIndex == index ? 8 : 6,
                height: _currentIndex == index ? 8 : 6,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: _currentIndex == index
                      ? Colors.white
                      : Colors.white.withValues(alpha: 0.5),
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }
}
