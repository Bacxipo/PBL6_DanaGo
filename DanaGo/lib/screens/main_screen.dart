import 'dart:async';
import 'package:flutter/material.dart';
import 'package:smarttrip/screens/home_screen.dart';
import 'package:smarttrip/screens/explore_map_screen.dart';
import 'package:smarttrip/screens/itinerary_screen.dart';
import 'package:smarttrip/screens/feed_screen.dart';
import 'package:smarttrip/screens/profile_screen.dart';
import 'package:smarttrip/screens/suggest_itinerary_screen.dart';
import 'package:smarttrip/services/notification_service.dart';
import 'package:smarttrip/widgets/home/custom_bottom_nav_bar.dart';

class MainScreen extends StatefulWidget {
  final int initialIndex;
  final bool initialExploreAiMode;

  const MainScreen({
    super.key,
    this.initialIndex = 0,
    this.initialExploreAiMode = false,
  });

  @override
  State<MainScreen> createState() => _MainScreenState();
}

class _MainScreenState extends State<MainScreen> with WidgetsBindingObserver {
  late int _currentIndex;
  late final List<Widget> _pages;
  Timer? _notifTimer;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _currentIndex = widget.initialIndex;
    _pages = [
      HomeScreen(
        onSearchTap: () {
          setState(() {
            _currentIndex = 1; // Chuyển sang Tab Khám phá (ExploreMapScreen)
          });
        },
      ),
      ExploreMapScreen(initialAiMode: widget.initialExploreAiMode),
      const ItineraryScreen(),
      const FeedScreen(),
      const SuggestItineraryScreen(),
      const ProfileScreen(),
    ];

    NotificationService.instance.refreshUnreadCount();
    _notifTimer = Timer.periodic(const Duration(seconds: 15), (_) {
      NotificationService.instance.refreshUnreadCount();
    });
  }

  @override
  void dispose() {
    _notifTimer?.cancel();
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) {
      NotificationService.instance.refreshUnreadCount();
    }
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
            NotificationService.instance.refreshUnreadCount();
          },
        ),
      ),
    );
  }
}
