import 'package:flutter/material.dart';
import 'package:smarttrip/theme/app_colors.dart';

class DetailAboutSection extends StatefulWidget {
  final String description;
  const DetailAboutSection({super.key, required this.description});

  @override
  State<DetailAboutSection> createState() => _DetailAboutSectionState();
}

class _DetailAboutSectionState extends State<DetailAboutSection> {
  bool isExpanded = false;
  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Về địa điểm này',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 8),
        Text(
          widget.description,
          maxLines: isExpanded ? null : 3,
          overflow: isExpanded ? TextOverflow.visible : TextOverflow.ellipsis,
          style: const TextStyle(
            fontSize: 14,
            color: Color(0xff4b5563),
            height: 1.5,
          ),
        ),
        const SizedBox(height: 4),
        GestureDetector(
          onTap: () {
            setState(() {
              isExpanded = !isExpanded;
            });
          },
          child: Text(
            isExpanded ? 'Thu gọn' : 'Xem thêm',
            style: const TextStyle(
              color: AppColors.primary,
              fontWeight: FontWeight.bold,
              fontSize: 14,
            ),
          ),
        ),
      ],
    );
  }
}
