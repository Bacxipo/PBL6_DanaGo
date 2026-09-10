import 'package:flutter/material.dart';
import 'package:smarttrip/models/destination_item.dart';
import 'package:smarttrip/theme/app_colors.dart';
import 'package:smarttrip/widgets/category_selector.dart';
import 'package:smarttrip/widgets/custom_buttom_nav_bar.dart';
import 'package:smarttrip/widgets/destination_tile.dart';
import 'package:smarttrip/widgets/featured_card.dart';
import 'package:smarttrip/widgets/home_search_bar.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _currentIndex = 0;
  int _selectCatagoryIndex = 0;
  final List<String> _categories = [
    "Tất cả",
    "Biển",
    "Ẩm thực",
    "Di tích",
    "Trekking",
    "Cafe",
  ];
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Color(0xfff8fafc),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        title: const Text(
          'DanaGo',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: AppColors.primary,
          ),
        ),
        centerTitle: true,
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const HomeSearchBar(),
              const SizedBox(height: 20),
              CategorySelector(
                categories: _categories,
                selectedIndex: _selectCatagoryIndex,
                onSelect: (index) {
                  setState(() {
                    _selectCatagoryIndex = index;
                  });
                },
              ),
              const SizedBox(height: 24),
              const Text(
                'Nổi bật tại Đà Nẵng',
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: Colors.black,
                ),
              ),
              const SizedBox(height: 14),
              SizedBox(
                height: 175,
                child: ListView.builder(
                  scrollDirection: Axis.horizontal,
                  itemCount: DestinationItem.featuredItems.length,
                  itemBuilder: (context, index) {
                    final item = DestinationItem.featuredItems[index];
                    return FeaturedCard(
                      item: item,
                      onTap: () {
                        // Chi tiết địa điểm
                      },
                    );
                  },
                ),
              ),
              const SizedBox(height: 24),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Gợi ý cho bạn',
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      color: Colors.black,
                    ),
                  ),
                  GestureDetector(
                    onTap: () {},
                    child: const Text(
                      'Xem tất cả',
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: AppColors.primary,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 20),
              Column(
                children: DestinationItem.recommendedItems.map((item) {
                  return DestinationTile(item: item, onTap: () {});
                }).toList(),
              ),
              const SizedBox(height: 20),
              const Text(
                'Gần bạn',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: Colors.black,
                ),
              ),
              const SizedBox(height: 14),
              Column(
                children: DestinationItem.nearbyItems.map((item) {
                  return DestinationTile(item: item, onTap: () {});
                }).toList(),
              ),
              const SizedBox(height: 20),
            ],
          ),
        ),
      ),
      bottomNavigationBar: CustomButtomNavBar(
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
