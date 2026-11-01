import 'package:flutter/material.dart';
import 'package:smarttrip/models/itinerary_model.dart';
import 'package:smarttrip/theme/app_colors.dart';

class ItineraryDayTabBar extends StatelessWidget {
  final Itinerary itinerary;
  final int selectedDay;
  final ValueChanged<int> onDaySelect;

  const ItineraryDayTabBar({
    super.key,
    required this.itinerary,
    required this.selectedDay,
    required this.onDaySelect,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.white,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Lịch trình chi tiết',
                style: TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.bold,
                  color: AppColors.textPrimary,
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 10,
                  vertical: 4,
                ),
                decoration: BoxDecoration(
                  color: AppColors.success.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(
                      Icons.auto_awesome,
                      size: 12,
                      color: AppColors.success,
                    ),
                    SizedBox(width: 4),
                    Text(
                      'AI tự động lúc 10:24',
                      style: TextStyle(
                        fontSize: 11,
                        color: AppColors.success,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          SizedBox(
            height: 40,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              itemCount: itinerary.days.length,
              itemBuilder: (context, index) {
                final day = itinerary.days[index];
                final isSelected = selectedDay == index;
                return GestureDetector(
                  onTap: () => onDaySelect(index),
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 250),
                    margin: const EdgeInsets.only(right: 8),
                    padding: const EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 8,
                    ),
                    decoration: BoxDecoration(
                      color: isSelected ? AppColors.primary : AppColors.bgSecondary,
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      '${day.label} (${day.date})',
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: isSelected
                            ? Colors.white
                            : AppColors.textTertiary,
                      ),
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

