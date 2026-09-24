import 'package:flutter/material.dart';
import 'package:smarttrip/theme/app_colors.dart';

class DetailInfoGrid extends StatelessWidget {
  final String address;
  final String openHours;
  final String priceTag;
  final VoidCallback onOpenMap;

  const DetailInfoGrid({
    super.key,
    required this.address,
    required this.openHours,
    required this.priceTag,
    required this.onOpenMap,
  });

  @override
  Widget build(BuildContext context) {
    return GridView.count(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisCount: 2,
      childAspectRatio: 2.0,
      crossAxisSpacing: 12,
      mainAxisSpacing: 12,
      children: [
        _buildInfoCard(
          icon: Icons.location_on_outlined,
          title: 'ĐỊA CHỈ',
          content: address,
        ),
        _buildInfoCard(
          icon: Icons.access_time_outlined,
          title: 'GIỜ MỞ CỬA',
          content: openHours,
        ),
        _buildInfoCard(
          icon: Icons.confirmation_number_outlined,
          title: 'GIÁ VÉ',
          content: priceTag,
        ),
        _buildInfoCard(
          icon: Icons.near_me_outlined,
          title: 'BẢN ĐỒ',
          content: 'Xem đường đi',
          isLink: true,
          onTap: onOpenMap,
        ),
      ],
    );
  }

  Widget _buildInfoCard({
    required IconData icon,
    required String title,
    required String content,
    bool isLink = false,
    VoidCallback? onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: AppColors.primary.withValues(alpha: 0.05),
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.03),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(6),
                  decoration: BoxDecoration(
                    color: AppColors.primary.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Icon(icon, color: AppColors.primary, size: 20),
                ),
                const SizedBox(width: 10),
                Text(
                  title,
                  style: const TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w600,
                    color: Color(0xff9ca3af),
                    letterSpacing: 0.5,
                  ),
                ),
                const SizedBox(height: 2),
              ],
            ),
            const SizedBox(height: 2),
            Text(
              content,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.bold,
                color: isLink ? AppColors.primary : Colors.black87,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
