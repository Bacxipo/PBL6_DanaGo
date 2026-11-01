import 'package:flutter/material.dart';
import 'package:smarttrip/screens/home_screen.dart';
import 'package:smarttrip/screens/explore_map_screen.dart';
import 'package:smarttrip/widgets/home/custom_bottom_nav_bar.dart';

class MainScreen extends StatefulWidget {
  const MainScreen({super.key});

  @override
  State<MainScreen> createState() => _MainScreenState();
}

class _MainScreenState extends State<MainScreen> {
  int _currentIndex = 0;

  final List<Widget> _pages = const [
    HomeScreen(),
    ExploreMapScreen(),
    Center(child: Text('Lịch trình')),
    Center(child: Text('Bảng tin')),
    Center(child: Text('Cá nhân')),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(index: _currentIndex, children: _pages),
      bottomNavigationBar: CustomBottomNavBar(
        currentIndex: _currentIndex,
        onTap: (index) {
          setState(() {
            _currentIndex = index;
          });
        },
      ),
    );
  }
}
