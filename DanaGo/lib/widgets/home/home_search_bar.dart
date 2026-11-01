import 'package:flutter/material.dart';

class HomeSearchBar extends StatelessWidget {
  final VoidCallback? onTap;

  const HomeSearchBar({super.key, this.onTap});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: GestureDetector(
            onTap: onTap,
            child: Container(
              height: 48,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(24),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.08),
                    blurRadius: 10,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Row(
                children: const [
                  Icon(Icons.search, color: Color(0xFF6B7280), size: 22),
                  SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      'Bạn muốn đi đâu?',
                      style: TextStyle(color: Color(0xFF9CA3AF), fontSize: 14),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
        const SizedBox(width: 12),
        Container(
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
                color: const Color(0xFFE5E7EB),
                child: const Icon(Icons.person, color: Color(0xFF9CA3AF)),
              ),
            ),
          ),
        ),
      ],
    );
  }
}
