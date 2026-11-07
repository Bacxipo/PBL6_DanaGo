import 'package:flutter/material.dart';
import 'package:smarttrip/models/map_place_item.dart';
import 'package:smarttrip/models/search_result_item.dart';
import 'package:smarttrip/theme/app_colors.dart';
import 'package:smarttrip/widgets/search/search_result_card.dart';

class MapDraggableSheet extends StatelessWidget {
  final List<MapPlaceItem> places;
  final ValueChanged<SearchResultItem> onPlaceTap;

  const MapDraggableSheet({
    super.key,
    required this.places,
    required this.onPlaceTap,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return DraggableScrollableSheet(
      initialChildSize: 0.40,
      minChildSize: 0.18,
      maxChildSize: 0.85,
      builder: (context, scrollController) {
        return Container(
          decoration: BoxDecoration(
            color: Theme.of(context).cardColor,
            borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: isDark ? 0.3 : 0.12),
                blurRadius: 12,
                spreadRadius: 2,
              ),
            ],
          ),
          child: ListView(
            controller: scrollController,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
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
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Tìm kiếm gần bạn',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: isDark ? Colors.white : AppColors.textPrimary,
                        ),
                      ),
                      const SizedBox(height: 2),
                      const Text(
                        'Hiển thị các địa điểm xung quanh bạn',
                        style: TextStyle(
                          fontSize: 12,
                          color: AppColors.textTertiary,
                        ),
                      ),
                    ],
                  ),
                  TextButton(
                    onPressed: () {},
                    child: const Text(
                      'Xem danh sách',
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
              ...places.map(
                (mapPlace) => SearchResultCard(
                  item: mapPlace.item,
                  onTap: () => onPlaceTap(mapPlace.item),
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}
