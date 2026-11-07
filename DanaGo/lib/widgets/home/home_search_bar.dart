import 'package:flutter/material.dart';
import 'package:smarttrip/theme/app_colors.dart';

class HomeSearchBar extends StatelessWidget {
  final VoidCallback? onTap;
  final VoidCallback? onAvatarTap;

  const HomeSearchBar({
    super.key,
    this.onTap,
    this.onAvatarTap,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Row(
      children: [
        Expanded(
          child: GestureDetector(
            onTap: onTap,
            child: Container(
              height: 48,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              decoration: BoxDecoration(
                color: Theme.of(context).cardColor,
                borderRadius: BorderRadius.circular(24),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: isDark ? 0.2 : 0.08),
                    blurRadius: 10,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Row(
                children: const [
                  Icon(Icons.search, color: AppColors.textTertiary, size: 22),
                  SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      'Bạn muốn đi đâu?',
                      style: TextStyle(
                        fontFamily: 'Be Vietnam Pro',
                        color: AppColors.textHint,
                        fontSize: 14,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
        const SizedBox(width: 12),
        GestureDetector(
          onTap: onAvatarTap,
          child: Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              border: Border.all(color: Colors.white, width: 2),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.08),
                  blurRadius: 8,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: ClipOval(
              child: Image.network(
                'https://i.postimg.cc/tC24nW4N/avt1.jpg',
                fit: BoxFit.cover,
                errorBuilder: (ctx, err, _) => Container(
                  color: AppColors.border,
                  child: const Icon(Icons.person, color: AppColors.textHint),
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }
}
