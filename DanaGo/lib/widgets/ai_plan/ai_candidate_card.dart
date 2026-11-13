import 'package:flutter/material.dart';
import 'package:smarttrip/models/ai_candidate_model.dart';
import 'package:smarttrip/theme/app_colors.dart';

class AICandidateCard extends StatelessWidget {
  final AICandidatePlace place;
  final bool isSelected;
  final VoidCallback onToggleSelect;

  const AICandidateCard({
    super.key,
    required this.place,
    required this.isSelected,
    required this.onToggleSelect,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final matchPercent = (place.matchScore * 100).toInt();

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isSelected
              ? AppColors.primary
              : (isDark ? Colors.white10 : Colors.grey.shade200),
          width: isSelected ? 2 : 1,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: isDark ? 0.2 : 0.03),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        children: [
          ClipRRect(
            borderRadius: const BorderRadius.horizontal(
              left: Radius.circular(15),
            ),
            child: Image.network(
              place.imageUrl ??
                  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
              width: 105,
              height: 105,
              fit: BoxFit.cover,
              errorBuilder: (_, __, ___) => Container(
                width: 105,
                height: 105,
                color: Colors.grey.shade200,
                child: const Icon(Icons.image_outlined, color: Colors.grey),
              ),
            ),
          ),
          Expanded(
            child: Padding(
              padding: const EdgeInsets.all(10),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 6,
                      vertical: 2,
                    ),
                    decoration: BoxDecoration(
                      color: Colors.amber.shade50,
                      borderRadius: BorderRadius.circular(6),
                      border: Border.all(color: Colors.amber.shade200),
                    ),
                    child: Text(
                      '✨ $matchPercent% phù hợp',
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                        color: Colors.amber.shade900,
                      ),
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    place.name,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 14,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      const Icon(
                        Icons.star_rounded,
                        size: 15,
                        color: Colors.amber,
                      ),
                      const SizedBox(width: 3),
                      Text(
                        '${place.avgRating}',
                        style: const TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(width: 6),
                      Text(
                        '• ${place.district}',
                        style: TextStyle(
                          fontSize: 11,
                          color: Colors.grey.shade600,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 2),
                  Text(
                    place.ticketPrice,
                    style: const TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      color: AppColors.primary,
                    ),
                  ),
                ],
              ),
            ),
          ),
          IconButton(
            onPressed: onToggleSelect,
            icon: Icon(
              isSelected
                  ? Icons.check_circle_rounded
                  : Icons.add_circle_outline_rounded,
              color: isSelected ? AppColors.primary : Colors.grey.shade400,
              size: 26,
            ),
          ),
        ],
      ),
    );
  }
}
