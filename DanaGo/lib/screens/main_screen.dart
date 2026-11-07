import 'package:flutter/material.dart';
import 'package:smarttrip/screens/home_screen.dart';
import 'package:smarttrip/screens/explore_map_screen.dart';
import 'package:smarttrip/screens/itinerary_screen.dart';
import 'package:smarttrip/screens/feed_screen.dart';
import 'package:smarttrip/screens/profile_screen.dart';
import 'package:smarttrip/screens/suggest_itinerary_screen.dart';
import 'package:smarttrip/theme/app_colors.dart';
import 'package:smarttrip/widgets/home/custom_bottom_nav_bar.dart';

class MainScreen extends StatefulWidget {
  final int initialIndex;
  const MainScreen({super.key, this.initialIndex = 0});

  @override
  State<MainScreen> createState() => _MainScreenState();
}

class _MainScreenState extends State<MainScreen> {
  late int _currentIndex;
  late final List<Widget> _pages;

  @override
  void initState() {
    super.initState();
    _currentIndex = widget.initialIndex;
    _pages = [
      HomeScreen(
        onSearchTap: () {
          setState(() {
            _currentIndex = 1; // Chuyển sang Tab Khám phá (ExploreMapScreen)
          });
        },
      ),
      const ExploreMapScreen(),
      const ItineraryScreen(),
      const FeedScreen(),
      const SuggestItineraryScreen(),
      const ProfileScreen(),
    ];
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      backgroundColor: theme.scaffoldBackgroundColor,
      body: IndexedStack(index: _currentIndex, children: _pages),
      bottomNavigationBar: Container(
        color: theme.scaffoldBackgroundColor,
        child: CustomBottomNavBar(
          currentIndex: _currentIndex,
          onTap: (index) {
            setState(() {
              _currentIndex = index;
            });
          },
        ),
      ),
    );
  }
}
