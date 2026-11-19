import 'dart:async';
import 'package:flutter/material.dart';
import 'package:smarttrip/screens/HOME/home_screen.dart';
import 'package:smarttrip/screens/Itinerary/explore_map_screen.dart';
import 'package:smarttrip/screens/Itinerary/itinerary_screen.dart';
import 'package:smarttrip/screens/FEED/feed_screen.dart';
import 'package:smarttrip/screens/PROFILE/profile_screen.dart';
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
  final List<Widget?> _pages = List<Widget?>.filled(6, null);
  Timer? _notifTimer;

  Widget _buildPage(int index) {
    switch (index) {
      case 0:
        return HomeScreen(onSearchTap: () => _switchTab(1));
      case 1:
        return ExploreMapScreen(initialAiMode: widget.initialExploreAiMode);
      case 2:
        return const ItineraryScreen();
      case 3:
        return const FeedScreen();
      case 4:
        return const SuggestItineraryScreen();
      case 5:
        return const ProfileScreen();
      default:
        return const SizedBox.shrink();
    }
  }

  void _ensureTabBuilt(int index) {
    if (index >= 0 && index < _pages.length && _pages[index] == null) {
      _pages[index] = _buildPage(index);
    }
  }

  void _switchTab(int index) {
    setState(() {
      _ensureTabBuilt(index);
      _currentIndex = index;
    });
    if (index == 3 || index == 5) {
      NotificationService.instance.refreshUnreadCount();
    }
  }

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _currentIndex = widget.initialIndex.clamp(0, _pages.length - 1);
    // Chỉ khởi tạo duy nhất tab đang mở ban đầu (lazy-load các tab khác khi bấm)
    _ensureTabBuilt(_currentIndex);

    NotificationService.instance.refreshUnreadCount();
    _notifTimer = Timer.periodic(const Duration(seconds: 30), (_) {
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
      extendBody: true,
      body: IndexedStack(
        index: _currentIndex,
        children: _pages.map((p) => p ?? const SizedBox.shrink()).toList(),
      ),
      bottomNavigationBar: CustomBottomNavBar(
        currentIndex: _currentIndex,
        onTap: _switchTab,
      ),
    );
  }
}
