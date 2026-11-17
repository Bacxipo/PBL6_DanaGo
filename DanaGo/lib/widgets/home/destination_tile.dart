import 'package:flutter/material.dart';
import 'package:smarttrip/models/destination_item.dart';
import 'package:smarttrip/theme/app_colors.dart';

/// Apple App Store / iOS Inset-Grouped List Row.
/// Pass `grouped: true` inside an Apple grouped card container for seamless
/// indented hairline dividers; `grouped: false` renders as a standalone card.
class DestinationTile extends StatelessWidget {
  final DestinationItem item;
  final VoidCallback? onTap;
  final bool grouped;
  final bool showDivider;

  const DestinationTile({
    super.key,
    required this.item,
    this.onTap,
    this.grouped = false,
    this.showDivider = false,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final accent = AppColors.accentOf(context);
    final metaTag = item.distance ?? item.tag;

    final rowContent = InkWell(
      onTap: onTap,
      borderRadius: grouped ? BorderRadius.zero : BorderRadius.circular(20),
      child: Padding(
        padding: EdgeInsets.symmetric(
          horizontal: grouped ? 14 : 12,
          vertical: grouped ? 12 : 11,
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(14),
              child: item.imageUrl.isNotEmpty
                  ? Image.network(
                      item.imageUrl,
                      width: 66,
                      height: 66,
                      cacheWidth: 180,
                      fit: BoxFit.cover,
                      errorBuilder: (_, _, _) => Container(
                        width: 66,
                        height: 66,
                        color: AppColors.surfaceTertiary(context),
                        child: const Icon(
                          Icons.image_not_supported_outlined,
                          color: AppColors.textHint,
                        ),
                      ),
                    )
                  : Container(
                      width: 66,
                      height: 66,
                      color: AppColors.surfaceTertiary(context),
                      child: const Icon(
                        Icons.image_outlined,
                        color: AppColors.textHint,
                      ),
                    ),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    item.title,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                      fontFamily: 'Be Vietnam Pro',
                      fontSize: 15.5,
                      height: 1.22,
                      letterSpacing: -0.25,
                      fontWeight: FontWeight.w700,
                      color: AppColors.labelPrimary(context),
                    ),
                  ),
                  const SizedBox(height: 3),
                  Text(
                    item.category,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                      fontFamily: 'Be Vietnam Pro',
                      fontSize: 12.5,
                      fontWeight: FontWeight.w500,
                      color: AppColors.labelSecondary(context),
                    ),
                  ),
                  const SizedBox(height: 5),
                  Row(
                    children: [
                      const Icon(
                        Icons.star_rounded,
                        color: AppColors.starActive,
                        size: 14,
                      ),
                      const SizedBox(width: 3),
                      Text(
                        item.rating.toStringAsFixed(1),
                        style: TextStyle(
                          fontFamily: 'Be Vietnam Pro',
                          fontSize: 12,
                          fontWeight: FontWeight.w700,
                          color: AppColors.labelPrimary(context),
                        ),
                      ),
                      if (metaTag.isNotEmpty) ...[
                        const SizedBox(width: 8),
                        Flexible(
                          child: Text(
                            '• $metaTag',
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: TextStyle(
                              fontFamily: 'Be Vietnam Pro',
                              fontSize: 12,
                              fontWeight: FontWeight.w500,
                              color: accent,
                            ),
                          ),
                        ),
                      ],
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(width: 8),
            // Apple App Store pill CTA button ("Xem")
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                color: isDark
                    ? Colors.white.withValues(alpha: 0.10)
                    : AppColors.primary.withValues(alpha: 0.10),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Text(
                'Xem',
                style: TextStyle(
                  fontFamily: 'Be Vietnam Pro',
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                  color: accent,
                ),
              ),
            ),
          ],
        ),
      ),
    );

    if (grouped) {
      return Column(
        children: [
          rowContent,
          if (showDivider)
            Padding(
              padding: const EdgeInsets.only(left: 94),
              child: Divider(
                height: 0.6,
                thickness: 0.6,
                color: AppColors.hairlineBorder(context),
              ),
            ),
        ],
      );
    }

    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Material(
        color: AppColors.surfaceGrouped(context),
        borderRadius: BorderRadius.circular(20),
        child: Container(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(20),
            border: Border.all(
              color: AppColors.hairlineBorder(context),
              width: 0.85,
            ),
          ),
          child: rowContent,
        ),
      ),
    );
  }
}
