import 'package:flutter/material.dart';
import 'package:smarttrip/theme/app_colors.dart';

class ItineraryBottomBar extends StatelessWidget {
  final VoidCallback? onAutoSave;
  final VoidCallback? onAddPlace;

  const ItineraryBottomBar({
    super.key,
    this.onAutoSave,
    this.onAddPlace,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
      decoration: const BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black12,
            blurRadius: 10,
            offset: Offset(0, -3),
          ),
        ],
      ),
      child: Row(
        children: [
          Expanded(
            child: OutlinedButton.icon(
              onPressed: onAutoSave ?? () {},
              icon: const Icon(
                Icons.auto_awesome,
                size: 18,
                color: AppColors.primary,
              ),
              label: const Text(
                'Lưu tự động',
                style: TextStyle(color: AppColors.primary),
              ),
              style: OutlinedButton.styleFrom(
                side: const BorderSide(color: AppColors.primary),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(14),
                ),
                padding: const EdgeInsets.symmetric(vertical: 14),
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: ElevatedButton.icon(
              onPressed: onAddPlace ?? () {},
              icon: const Icon(Icons.add_location_alt_rounded, size: 18),
              label: const Text('Thêm địa điểm'),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                foregroundColor: Colors.white,
                elevation: 0,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(14),
                ),
                padding: const EdgeInsets.symmetric(vertical: 14),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

