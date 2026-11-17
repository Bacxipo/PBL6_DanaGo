import 'package:flutter/material.dart';
import 'package:smarttrip/models/map_place_item.dart';
import 'package:smarttrip/models/search_result_item.dart';
import 'package:smarttrip/theme/app_colors.dart';
import 'package:smarttrip/widgets/search/search_result_card.dart';

class MapDraggableSheet extends StatelessWidget {
  final List<MapPlaceItem> places;
  final ValueChanged<SearchResultItem> onPlaceTap;
  final bool isAiActive;
  final bool isAiLoading;
  final String aiActiveQuery;
  final VoidCallback? onClearAi;

  const MapDraggableSheet({
    super.key,
    required this.places,
    required this.onPlaceTap,
    this.isAiActive = false,
    this.isAiLoading = false,
    this.aiActiveQuery = '',
    this.onClearAi,
  });

  Widget _buildHeader(bool isDark) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Center(
          child: Container(
            width: 40,
            height: 4,
            margin: const EdgeInsets.only(bottom: 12),
            decoration: BoxDecoration(
              color: isDark ? Colors.white24 : AppColors.border,
              borderRadius: BorderRadius.circular(2),
            ),
          ),
        ),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      if (isAiActive) ...[
                        const Icon(
                          Icons.auto_awesome,
                          size: 17,
                          color: AppColors.primary,
                        ),
                        const SizedBox(width: 6),
                      ],
                      Flexible(
                        child: Text(
                          isAiActive
                              ? 'Gợi ý thông minh bằng AI'
                              : 'Tìm kiếm gần bạn',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color:
                                isDark ? Colors.white : AppColors.textPrimary,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 2),
                  Text(
                    isAiLoading
                        ? 'AI đang phân tích trải nghiệm phù hợp...'
                        : isAiActive
                            ? 'Tìm thấy ${places.length} điểm đến phù hợp với "$aiActiveQuery"'
                            : 'Hiển thị ${places.length} địa điểm xung quanh bạn',
                    style: const TextStyle(
                      fontSize: 12,
                      color: AppColors.textTertiary,
                    ),
                  ),
                ],
              ),
            ),
            if (isAiActive && onClearAi != null)
              TextButton(
                onPressed: onClearAi,
                child: const Text(
                  'Xem tất cả',
                  style: TextStyle(
                    color: AppColors.primary,
                    fontWeight: FontWeight.bold,
                    fontSize: 13,
                  ),
                ),
              ),
          ],
        ),
        const SizedBox(height: 14),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final int itemCount =
        (isAiLoading || places.isEmpty) ? 2 : places.length + 1;

    return DraggableScrollableSheet(
      initialChildSize: 0.40,
      minChildSize: 0.18,
      maxChildSize: 0.85,
      builder: (context, scrollController) {
        return Container(
          decoration: BoxDecoration(
            color: AppColors.surfaceGrouped(context),
            borderRadius: const BorderRadius.vertical(top: Radius.circular(26)),
            border: Border(
              top: BorderSide(
                color: AppColors.hairlineBorder(context),
                width: 0.9,
              ),
            ),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: isDark ? 0.34 : 0.10),
                blurRadius: 20,
                offset: const Offset(0, -4),
              ),
            ],
          ),
          child: ListView.builder(
            controller: scrollController,
            padding: const EdgeInsets.fromLTRB(16, 10, 16, 112),
            itemCount: itemCount,
            itemBuilder: (context, index) {
              if (index == 0) {
                return _buildHeader(isDark);
              }
              if (isAiLoading) {
                return const Padding(
                  padding: EdgeInsets.symmetric(vertical: 36),
                  child: Center(
                    child: CircularProgressIndicator(color: AppColors.primary),
                  ),
                );
              }
              if (places.isEmpty) {
                return Padding(
                  padding: const EdgeInsets.symmetric(vertical: 32),
                  child: Center(
                    child: Column(
                      children: [
                        Icon(
                          Icons.explore_off_outlined,
                          size: 46,
                          color: AppColors.primary.withValues(alpha: 0.35),
                        ),
                        const SizedBox(height: 8),
                        const Text(
                          'Không tìm thấy địa điểm phù hợp',
                          style: TextStyle(
                            fontSize: 14,
                            color: AppColors.textTertiary,
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              }
              final mapPlace = places[index - 1];
              return SearchResultCard(
                item: mapPlace.item,
                onTap: () => onPlaceTap(mapPlace.item),
              );
            },
          ),
        );
      },
    );
  }
}
