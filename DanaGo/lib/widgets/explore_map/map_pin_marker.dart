import 'package:flutter/material.dart';
import 'package:smarttrip/theme/app_colors.dart';

class MapPinMarker extends StatelessWidget {
  final String label;
  final bool isSelected;

  const MapPinMarker({super.key, required this.label, this.isSelected = false});

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
          decoration: BoxDecoration(
            color: isSelected ? AppColors.primary : Colors.white,
            borderRadius: BorderRadius.circular(12),
            boxShadow: const [
              BoxShadow(
                color: Colors.black26,
                blurRadius: 6,
                offset: Offset(0, 2),
              ),
            ],
          ),
          child: Text(
            label,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: TextStyle(
              fontSize: 10,
              fontWeight: FontWeight.bold,
              color: isSelected ? Colors.white : const Color(0xFF111827),
            ),
          ),
        ),
        Icon(
          Icons.location_on,
          color: isSelected ? AppColors.primary : const Color(0xFFEF4444),
          size: isSelected ? 30 : 26,
        ),
      ],
    );
  }
}
