import 'package:flutter/material.dart';
import 'package:smarttrip/models/destination_item.dart';
import 'package:smarttrip/screens/detail_place_screen.dart';
import 'package:smarttrip/theme/app_colors.dart';

class FeedDestinationLinkCard extends StatefulWidget {
  final DestinationItem destination;
  final String? ratingText;
  final String? priceOrTagText;
  final bool initialSaved;
  final ValueChanged<bool>? onSaveChanged;

  const FeedDestinationLinkCard({
    super.key,
    required this.destination,
    this.ratingText,
    this.priceOrTagText,
    this.initialSaved = false,
    this.onSaveChanged,
  });

  @override
  State<FeedDestinationLinkCard> createState() => _FeedDestinationLinkCardState();
}

class _FeedDestinationLinkCardState extends State<FeedDestinationLinkCard> {
  late bool _isSaved;

  @override
  void initState() {
    super.initState();
    _isSaved = widget.initialSaved;
  }

  void _toggleSave() {
    setState(() {
      _isSaved = !_isSaved;
    });
    widget.onSaveChanged?.call(_isSaved);

    ScaffoldMessenger.of(context).hideCurrentSnackBar();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          _isSaved
              ? 'Đã lưu "${widget.destination.title}" vào lịch trình cá nhân!'
              : 'Đã xóa "${widget.destination.title}" khỏi lịch trình lưu.',
          style: const TextStyle(fontFamily: 'Be Vietnam Pro', fontSize: 13),
        ),
        backgroundColor: AppColors.primary,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        duration: const Duration(seconds: 2),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final dest = widget.destination;
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final rating = widget.ratingText ?? dest.rating.toStringAsFixed(1);
    final tag = widget.priceOrTagText ?? dest.tag;

    return Container(
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF0F172A) : const Color(0xFFEFF5F5),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: isDark ? Colors.white10 : AppColors.primary.withValues(alpha: 0.08),
        ),
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: () {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (_) => DetailPlaceScreen(item: dest),
              ),
            );
          },
          borderRadius: BorderRadius.circular(12),
          child: Padding(
            padding: const EdgeInsets.all(10),
            child: Row(
              children: [
                // Thumbnail 48x48
                ClipRRect(
                  borderRadius: BorderRadius.circular(8),
                  child: Image.network(
                    dest.imageUrl,
                    width: 48,
                    height: 48,
                    fit: BoxFit.cover,
                    errorBuilder: (context, error, stackTrace) => Container(
                      width: 48,
                      height: 48,
                      color: Colors.grey.shade300,
                      child: const Icon(Icons.place, color: Colors.grey, size: 24),
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                // Info Column
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        dest.title,
                        style: TextStyle(
                          fontFamily: 'Be Vietnam Pro',
                          fontSize: 13,
                          fontWeight: FontWeight.w700,
                          color: isDark ? Colors.white : AppColors.textPrimary,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 3),
                      Row(
                        children: [
                          const Icon(
                            Icons.star_rounded,
                            size: 14,
                            color: AppColors.starActive,
                          ),
                          const SizedBox(width: 2),
                          Text(
                            rating,
                            style: const TextStyle(
                              fontFamily: 'Be Vietnam Pro',
                              fontSize: 11,
                              fontWeight: FontWeight.w700,
                              color: AppColors.textPrimary,
                            ),
                          ),
                          const SizedBox(width: 4),
                          const Text(
                            '•',
                            style: TextStyle(fontSize: 11, color: AppColors.neutral),
                          ),
                          const SizedBox(width: 4),
                          Flexible(
                            child: Text(
                              tag,
                              style: const TextStyle(
                                fontFamily: 'Be Vietnam Pro',
                                fontSize: 11,
                                fontWeight: FontWeight.w500,
                                color: AppColors.neutral,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 8),
                // Action: Save to Itinerary Button
                InkWell(
                  onTap: _toggleSave,
                  borderRadius: BorderRadius.circular(8),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
                    decoration: BoxDecoration(
                      color: _isSaved ? AppColors.primary : Colors.white,
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(
                        color: AppColors.primary.withValues(alpha: 0.3),
                      ),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          _isSaved ? Icons.bookmark_rounded : Icons.bookmark_add_outlined,
                          size: 14,
                          color: _isSaved ? Colors.white : AppColors.primary,
                        ),
                        const SizedBox(width: 4),
                        Text(
                          _isSaved ? 'Đã lưu' : 'Lưu lịch trình',
                          style: TextStyle(
                            fontFamily: 'Be Vietnam Pro',
                            fontSize: 11,
                            fontWeight: FontWeight.w700,
                            color: _isSaved ? Colors.white : AppColors.primary,
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
      ),
    );
  }
}
