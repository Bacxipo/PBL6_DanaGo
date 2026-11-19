import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:smarttrip/models/destination_item.dart';
import 'package:smarttrip/screens/detail_place_screen.dart';
import 'package:smarttrip/services/favorite_service.dart';
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
  State<FeedDestinationLinkCard> createState() =>
      _FeedDestinationLinkCardState();
}

class _FeedDestinationLinkCardState extends State<FeedDestinationLinkCard> {
  bool _isToggling = false;

  Future<void> _toggleFavorite() async {
    if (_isToggling) return;
    final destId = widget.destination.id;
    if (destId.isEmpty) return;

    HapticFeedback.selectionClick();
    setState(() => _isToggling = true);

    final isNowFav = await FavoriteService.instance.toggleFavorite(destId);
    if (!mounted) return;
    setState(() => _isToggling = false);
    widget.onSaveChanged?.call(isNowFav);

    ScaffoldMessenger.of(context).hideCurrentSnackBar();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          isNowFav
              ? 'Đã lưu "${widget.destination.title}" vào địa điểm yêu thích!'
              : 'Đã bỏ "${widget.destination.title}" khỏi địa điểm yêu thích.',
          style: const TextStyle(fontFamily: 'Be Vietnam Pro', fontSize: 13),
        ),
        backgroundColor: isNowFav ? AppColors.primary : const Color(0xFF334155),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
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
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: AppColors.hairlineBorder(context),
          width: 0.9,
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
          borderRadius: BorderRadius.circular(14),
          child: Padding(
            padding: const EdgeInsets.all(10),
            child: Row(
              children: [
                // Thumbnail 48x48
                ClipRRect(
                  borderRadius: BorderRadius.circular(10),
                  child: dest.imageUrl.isNotEmpty
                      ? Image.network(
                          dest.imageUrl,
                          width: 48,
                          height: 48,
                          cacheWidth: 120,
                          fit: BoxFit.cover,
                          errorBuilder: (_, _, _) => Container(
                            width: 48,
                            height: 48,
                            color: AppColors.surfaceTertiary(context),
                            child: const Icon(
                              Icons.place_rounded,
                              color: AppColors.textHint,
                              size: 22,
                            ),
                          ),
                        )
                      : Container(
                          width: 48,
                          height: 48,
                          color: AppColors.surfaceTertiary(context),
                          child: const Icon(
                            Icons.place_rounded,
                            color: AppColors.textHint,
                            size: 22,
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
                          fontSize: 13.5,
                          fontWeight: FontWeight.w700,
                          color: AppColors.labelPrimary(context),
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
                            style: TextStyle(
                              fontFamily: 'Be Vietnam Pro',
                              fontSize: 11.5,
                              fontWeight: FontWeight.w700,
                              color: AppColors.labelPrimary(context),
                            ),
                          ),
                          if (tag.isNotEmpty) ...[
                            const SizedBox(width: 4),
                            const Text(
                              '•',
                              style: TextStyle(
                                fontSize: 11,
                                color: AppColors.neutral,
                              ),
                            ),
                            const SizedBox(width: 4),
                            Flexible(
                              child: Text(
                                tag,
                                style: TextStyle(
                                  fontFamily: 'Be Vietnam Pro',
                                  fontSize: 11.5,
                                  fontWeight: FontWeight.w500,
                                  color: AppColors.labelSecondary(context),
                                ),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                          ],
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 8),
                // Heart Button: Lưu vào Địa điểm yêu thích (đồng bộ realtime FavoriteService)
                ListenableBuilder(
                  listenable: FavoriteService.instance,
                  builder: (context, _) {
                    final isFav = FavoriteService.instance.isFavorite(dest.id);
                    return Semantics(
                      button: true,
                      label: isFav
                          ? 'Bỏ khỏi địa điểm yêu thích'
                          : 'Lưu vào địa điểm yêu thích',
                      child: InkWell(
                        onTap: _toggleFavorite,
                        borderRadius: BorderRadius.circular(22),
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 200),
                          width: 40,
                          height: 40,
                          decoration: BoxDecoration(
                            color: isFav
                                ? AppColors.error.withValues(alpha: 0.12)
                                : AppColors.surfaceGrouped(context),
                            shape: BoxShape.circle,
                            border: Border.all(
                              color: isFav
                                  ? AppColors.error.withValues(alpha: 0.35)
                                  : AppColors.hairlineBorder(context),
                              width: 0.9,
                            ),
                          ),
                          child: Center(
                            child: _isToggling
                                ? const SizedBox(
                                    width: 16,
                                    height: 16,
                                    child: CircularProgressIndicator(
                                      strokeWidth: 2,
                                      color: AppColors.error,
                                    ),
                                  )
                                : Icon(
                                    isFav
                                        ? Icons.favorite_rounded
                                        : Icons.favorite_border_rounded,
                                    size: 20,
                                    color: isFav
                                        ? AppColors.error
                                        : AppColors.labelSecondary(context),
                                  ),
                          ),
                        ),
                      ),
                    );
                  },
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
