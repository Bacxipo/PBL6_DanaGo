import 'package:flutter/material.dart';

//ô tìm kiếm + ảnh đại diện
class HomeSearchBar extends StatelessWidget {
  final TextEditingController? controller;
  final ValueChanged<String>? onChanged;
  const HomeSearchBar({super.key, this.controller, this.onChanged});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: Container(
            height: 48,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(24),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.5),
                  blurRadius: 10,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Row(
              children: [
                const Icon(Icons.search, color: Colors.black, size: 22),
                const SizedBox(width: 10),
                Expanded(
                  child: TextField(
                    controller: controller,
                    onChanged: onChanged,
                    decoration: const InputDecoration(
                      hintText: 'Bạn muốn đi đâu?',
                      hintStyle: TextStyle(color: Colors.black, fontSize: 14),
                      border: InputBorder.none,
                      isDense: true,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(width: 8),
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
              'https://scontent.fdad3-6.fna.fbcdn.net/v/t39.30808-6/475869510_1945477732641527_8457676487602526743_n.jpg?stp=dst-jpg_tt6&cstp=mx720x720&ctp=s720x720&_nc_cat=100&ccb=1-7&_nc_sid=6ee11a&_nc_eui2=AeFwmeAxoswBsJP7wUJk9hxRhm1P7_Zy_TqGbU_v9nL9OjooryUVG3pdxFwkQ0kB0HOF47fbnqBEEJpQ_H_gtR16&_nc_ohc=kBz6zBfiO4kQ7kNvwG4ja2m&_nc_oc=Adom37Y80mYIPiIcGtGDVDK4IFB-IfQk5Kk5Rmmy8huJUG4MwuWfES7nPlyxG2lXMgGrOrsTgYqMLRalAl6qKcqn&_nc_zt=23&_nc_ht=scontent.fdad3-6.fna&_nc_gid=8j-ZLTICei_YsIHB_TiKog&_nc_ss=782a8&oh=00_AQJ1BECOiawejRHhxto-91evOeJs5Vft5snvCYDRdZfHNQ&oe=6AB07C46',
              fit: BoxFit.cover,
            ),
          ),
        ),
      ],
    );
  }
}
