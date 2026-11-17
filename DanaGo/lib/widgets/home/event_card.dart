import 'package:flutter/material.dart';
import 'package:smarttrip/models/event_item.dart';
import 'package:smarttrip/theme/app_colors.dart';

class EventCard extends StatelessWidget {
  final EventItem event;
  final VoidCallback onTap;
  final double? width;

  const EventCard({
    super.key,
    required this.event,
    required this.onTap,
    this.width,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: width,
        margin: width != null
            ? const EdgeInsets.only(right: 14)
            : const EdgeInsets.only(bottom: 14),
        decoration: BoxDecoration(
          color: Theme.of(context).cardColor,
          borderRadius: BorderRadius.circular(18),
          border: Border.all(
            color: isDark
                ? Colors.white.withValues(alpha: 0.08)
                : Colors.grey.shade200,
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: isDark ? 0.22 : 0.05),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(18),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              // Cover image + badge
              SizedBox(
                height: width != null ? 132 : 168,
                width: double.infinity,
                child: Stack(
                  fit: StackFit.expand,
                  children: [
                    if (event.coverImage.isNotEmpty)
                      Image.network(
                        event.coverImage,
                        fit: BoxFit.cover,
                        errorBuilder: (_, __, ___) => _placeholderCover(),
                      )
                    else
                      _placeholderCover(),
                    Positioned(
                      top: 10,
                      left: 10,
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 9,
                          vertical: 4,
                        ),
                        decoration: BoxDecoration(
                          color: event.badgeColor,
                          borderRadius: BorderRadius.circular(8),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withValues(alpha: 0.18),
                              blurRadius: 6,
                              offset: const Offset(0, 2),
                            ),
                          ],
                        ),
                        child: Text(
                          event.badgeLabel,
                          style: const TextStyle(
                            fontFamily: 'Be Vietnam Pro',
                            fontSize: 11,
                            fontWeight: FontWeight.w700,
                            color: Colors.white,
                          ),
                        ),
                      ),
                    ),
                    if (event.isFavorited)
                      Positioned(
                        top: 10,
                        right: 10,
                        child: Container(
                          padding: const EdgeInsets.all(5),
                          decoration: BoxDecoration(
                            color: Colors.black.withValues(alpha: 0.4),
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(
                            Icons.favorite_rounded,
                            size: 14,
                            color: Colors.redAccent,
                          ),
                        ),
                      ),
                  ],
                ),
              ),
              Padding(
                padding: const EdgeInsets.all(12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      event.name,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                        fontFamily: 'Be Vietnam Pro',
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                        height: 1.3,
                        color: isDark ? Colors.white : AppColors.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 8),
                    _metaRow(
                      Icons.calendar_today_rounded,
                      AppColors.primary,
                      event.formattedDateRange,
                      isDark,
                    ),
                    const SizedBox(height: 4),
                    _metaRow(
                      Icons.location_on_outlined,
                      const Color(0xFFF43F5E),
                      event.locationText,
                      isDark,
                    ),
                    const SizedBox(height: 4),
                    _metaRow(
                      Icons.confirmation_number_outlined,
                      isDark ? Colors.white60 : AppColors.textTertiary,
                      event.formattedPrice,
                      isDark,
                      isBold: true,
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _placeholderCover() {
    return Container(
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [Color(0xFFE6F4F2), Color(0xFFCFE9E6)],
        ),
      ),
      child: Center(
        child: Icon(
          Icons.celebration_rounded,
          size: 40,
          color: AppColors.primary.withValues(alpha: 0.45),
        ),
      ),
    );
  }

  Widget _metaRow(
    IconData icon,
    Color iconColor,
    String text,
    bool isDark, {
    bool isBold = false,
  }) {
    return Row(
      children: [
        Icon(icon, size: 13, color: iconColor),
        const SizedBox(width: 6),
        Expanded(
          child: Text(
            text,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: TextStyle(
              fontFamily: 'Be Vietnam Pro',
              fontSize: 12,
              fontWeight: isBold ? FontWeight.w700 : FontWeight.w500,
              color: isBold
                  ? (isDark ? Colors.white : AppColors.textPrimary)
                  : (isDark ? Colors.white70 : AppColors.textSecondary),
            ),
          ),
        ),
      ],
    );
  }
}
