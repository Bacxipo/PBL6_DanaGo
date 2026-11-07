import 'package:flutter/material.dart';
import 'package:smarttrip/models/destination_item.dart';
import 'package:smarttrip/screens/Detail_place_screen.dart';
import 'package:smarttrip/screens/search_screen.dart';
import 'package:smarttrip/screens/user_profile_posts_screen.dart';
import 'package:smarttrip/theme/app_colors.dart';
import 'package:smarttrip/widgets/home/category_selector.dart';
import 'package:smarttrip/widgets/home/destination_tile.dart';
import 'package:smarttrip/widgets/home/featured_card.dart';
import 'package:smarttrip/widgets/home/home_search_bar.dart';

class HomeScreen extends StatefulWidget {
  final VoidCallback? onSearchTap;

  const HomeScreen({super.key, this.onSearchTap});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _selectCategoryIndex = 0;

  final List<String> _categories = [
    "Tất cả",
    "Biển",
    "Ẩm thực",
    "Di tích",
    "Trekking",
    "Cafe",
  ];

  // Map of categories to specific destination items
  final Map<String, List<DestinationItem>> _categoryPlaces = {
    "Biển": [
      const DestinationItem(
        id: 'beach_1',
        title: 'Biển Mỹ Khê',
        category: 'BÃI BIỂN',
        imageUrl: 'https://i.postimg.cc/nc0h9BLx/mykhe.jpg',
        rating: 4.9,
        tag: 'Miễn phí',
        address: 'Đường Võ Nguyên Giáp, Phước Mỹ',
        description: 'Một trong sáu bãi biển quyến rũ nhất hành tinh do tạp chí Forbes bình chọn.',
      ),
      const DestinationItem(
        id: 'beach_2',
        title: 'Bãi biển Non Nước',
        category: 'BÃI BIỂN',
        imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500',
        rating: 4.8,
        tag: 'Miễn phí',
        address: 'Hòa Hải, Ngũ Hành Sơn',
        description: 'Bãi cát trắng mịn trải dài 5km dưới chân núi Ngũ Hành Sơn huyền thoại.',
      ),
      const DestinationItem(
        id: 'beach_3',
        title: 'Bãi Rạng Sơn Trà',
        category: 'BÃI BIỂN',
        imageUrl: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=500',
        rating: 4.7,
        tag: 'Hoang sơ',
        address: 'Bán đảo Sơn Trà, Thọ Quang',
        description: 'Bãi đá hoang sơ ngắm bình minh và lặn ngắm san hô tự nhiên tuyệt đẹp.',
      ),
    ],
    "Ẩm thực": [
      const DestinationItem(
        id: 'food_1',
        title: 'Mì Quảng Bà Vị',
        category: 'ẨM THỰC',
        imageUrl: 'https://i.postimg.cc/Jz04N0sF/myquang.jpg',
        rating: 4.8,
        tag: 'Đặc sản',
        address: '166 Lê Đình Dương, Hải Châu',
        description: 'Thương hiệu mì Quảng trứ danh với nước lèo đậm đà và bánh tráng mè nướng giòn.',
      ),
      const DestinationItem(
        id: 'food_2',
        title: 'Quán Hải Sản Bé Mặn',
        category: 'ẨM THỰC',
        imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500',
        rating: 4.7,
        tag: 'Tươi sống',
        address: 'Lô 11 Võ Nguyên Giáp, Mân Thái',
        description: 'Hải sản tươi sống chọn tại bể, nêm nếm đậm chất miền Trung thơm ngon.',
      ),
      const DestinationItem(
        id: 'food_3',
        title: 'Bánh xèo Bà Dưỡng',
        category: 'ẨM THỰC',
        imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500',
        rating: 4.9,
        tag: 'Nổi tiếng',
        address: 'K280/23 Hoàng Diệu, Hải Châu',
        description: 'Bánh xèo giòn rụm ăn cùng nước chấm gan bùi béo đặc trưng không nơi nào có.',
      ),
    ],
    "Di tích": [
      const DestinationItem(
        id: 'heritage_1',
        title: 'Bảo tàng Điêu khắc Chăm',
        category: 'DI TÍCH',
        imageUrl: 'https://i.postimg.cc/MKdpfVpF/baotang.jpg',
        rating: 4.7,
        tag: 'Bảo tàng',
        address: 'Số 2 đường 2 Tháng 9, Hải Châu',
        description: 'Nơi lưu giữ bộ sưu tập hiện vật nghệ thuật điêu khắc Champa quy mô nhất thế giới.',
      ),
      const DestinationItem(
        id: 'heritage_2',
        title: 'Danh thắng Ngũ Hành Sơn',
        category: 'DI TÍCH',
        imageUrl: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=500',
        rating: 4.8,
        tag: 'Di tích quốc gia',
        address: '81 Huyền Trân Công Chúa, Ngũ Hành Sơn',
        description: 'Quần thể 5 ngọn núi đá vôi với hệ thống hang động Huyền Không, động Âm Phủ huyền bí.',
      ),
      const DestinationItem(
        id: 'heritage_3',
        title: 'Chùa Linh Ứng Bãi Bụt',
        category: 'DI TÍCH',
        imageUrl: 'https://images.unsplash.com/photo-1548013146-72479768bbaa?w=500',
        rating: 4.9,
        tag: 'Tâm linh',
        address: 'Bán đảo Sơn Trà, Thọ Quang',
        description: 'Ngôi chùa linh thiêng với tượng Phật Bà Quan Âm cao 67m hướng mắt ra biển đông.',
      ),
    ],
    "Trekking": [
      const DestinationItem(
        id: 'trek_1',
        title: 'Đỉnh Bàn Cờ Sơn Trà',
        category: 'TREKKING',
        imageUrl: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=500',
        rating: 4.9,
        tag: 'Ngắm cảnh',
        address: 'Bán đảo Sơn Trà',
        description: 'Điểm cao nhất bán đảo Sơn Trà với tượng Đế Thích đánh cờ và tầm nhìn toàn cảnh Đà Nẵng.',
      ),
      const DestinationItem(
        id: 'trek_2',
        title: 'Cung đường Đèo Hải Vân',
        category: 'TREKKING',
        imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=500',
        rating: 4.8,
        tag: 'Thiên hạ đệ nhất hùng quan',
        address: 'Ranh giới Đà Nẵng - Thừa Thiên Huế',
        description: 'Cung đèo uốn lượn hùng vĩ giữa mây trời và biển cả, điểm trekking và phượt nổi tiếng.',
      ),
    ],
    "Cafe": [
      const DestinationItem(
        id: 'cafe_1',
        title: 'Cà phê Sơn Trà Marina',
        category: 'CAFE',
        imageUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=500',
        rating: 4.8,
        tag: 'View Vịnh Biển',
        address: 'Bến du thuyền Sơn Trà',
        description: 'Quán cà phê phong cách Santorini với tông trắng xanh ngắm trọn vẹn vịnh Đà Nẵng.',
      ),
      const DestinationItem(
        id: 'cafe_2',
        title: 'Trình Cà Phê',
        category: 'CAFE',
        imageUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=500',
        rating: 4.7,
        tag: 'Cà phê bơ',
        address: '34/4 Nguyễn Hữu Thọ, Hải Châu',
        description: 'Không gian vườn xanh mát, nổi tiếng với món cà phê bơ đặc sản béo ngậy.',
      ),
    ],
  };

  void _navigateToDetail(DestinationItem item) {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (context) => DetailPlaceScreen(item: item)),
    );
  }

  void _navigateToUserProfile() {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => const UserProfilePostsScreen(
          authorName: 'Nguyễn Văn A',
          authorAvatar: 'https://i.postimg.cc/tC24nW4N/avt1.jpg',
          isVerified: true,
          isCurrentUser: true,
        ),
      ),
    );
  }

  void _navigateToSearch({String? category}) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => SearchScreen(initialQuery: category ?? ''),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final selectedCategory = _categories[_selectCategoryIndex];
    final bool isAll = _selectCategoryIndex == 0;
    final filteredPlaces = _categoryPlaces[selectedCategory] ?? [];

    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: const Text(
          'DanaGo',
          style: TextStyle(
            fontFamily: 'Be Vietnam Pro',
            fontSize: 20,
            fontWeight: FontWeight.w800,
            color: AppColors.primary,
          ),
        ),
        centerTitle: true,
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          physics: const BouncingScrollPhysics(),
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Search bar with Avatar shortcut
              HomeSearchBar(
                onTap: () {
                  if (widget.onSearchTap != null) {
                    widget.onSearchTap!();
                  } else {
                    _navigateToSearch();
                  }
                },
                onAvatarTap: _navigateToUserProfile,
              ),
              const SizedBox(height: 20),

              // Category Selector with live interaction
              CategorySelector(
                categories: _categories,
                selectedIndex: _selectCategoryIndex,
                onSelect: (index) {
                  setState(() {
                    _selectCategoryIndex = index;
                  });
                },
              ),
              const SizedBox(height: 24),

              // Dynamic content based on selected category
              if (isAll) ...[
                // Section 1: Featured Carousel
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Nổi bật tại Đà Nẵng',
                      style: TextStyle(
                        fontFamily: 'Be Vietnam Pro',
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        color: isDark ? Colors.white : AppColors.textPrimary,
                      ),
                    ),
                    GestureDetector(
                      onTap: () => _navigateToSearch(),
                      child: const Text(
                        'Xem tất cả',
                        style: TextStyle(
                          fontFamily: 'Be Vietnam Pro',
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          color: AppColors.primary,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 14),
                SizedBox(
                  height: 180,
                  child: ListView.builder(
                    scrollDirection: Axis.horizontal,
                    physics: const BouncingScrollPhysics(),
                    itemCount: DestinationItem.featuredItems.length,
                    itemBuilder: (context, index) {
                      final item = DestinationItem.featuredItems[index];
                      return FeaturedCard(
                        item: item,
                        onTap: () => _navigateToDetail(item),
                      );
                    },
                  ),
                ),
                const SizedBox(height: 24),

                // Section 2: Recommended
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Gợi ý cho bạn',
                      style: TextStyle(
                        fontFamily: 'Be Vietnam Pro',
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        color: isDark ? Colors.white : AppColors.textPrimary,
                      ),
                    ),
                    GestureDetector(
                      onTap: () => _navigateToSearch(),
                      child: const Text(
                        'Xem tất cả',
                        style: TextStyle(
                          fontFamily: 'Be Vietnam Pro',
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          color: AppColors.primary,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 14),
                Column(
                  children: DestinationItem.recommendedItems.map((item) {
                    return DestinationTile(
                      item: item,
                      onTap: () => _navigateToDetail(item),
                    );
                  }).toList(),
                ),
                const SizedBox(height: 20),

                // Section 3: Nearby
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Gần bạn',
                      style: TextStyle(
                        fontFamily: 'Be Vietnam Pro',
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        color: isDark ? Colors.white : AppColors.textPrimary,
                      ),
                    ),
                    GestureDetector(
                      onTap: () => _navigateToSearch(),
                      child: const Text(
                        'Xem tất cả',
                        style: TextStyle(
                          fontFamily: 'Be Vietnam Pro',
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          color: AppColors.primary,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 14),
                Column(
                  children: DestinationItem.nearbyItems.map((item) {
                    return DestinationTile(
                      item: item,
                      onTap: () => _navigateToDetail(item),
                    );
                  }).toList(),
                ),
              ] else ...[
                // Filtered View for specific category
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Danh mục: $selectedCategory',
                          style: const TextStyle(
                            fontFamily: 'Be Vietnam Pro',
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                            color: AppColors.textPrimary,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          '${filteredPlaces.length} địa điểm hấp dẫn tại Đà Nẵng',
                          style: const TextStyle(
                            fontFamily: 'Be Vietnam Pro',
                            fontSize: 13,
                            color: AppColors.textTertiary,
                          ),
                        ),
                      ],
                    ),
                    // Reset to all button
                    TextButton.icon(
                      onPressed: () {
                        setState(() {
                          _selectCategoryIndex = 0;
                        });
                      },
                      icon: const Icon(Icons.close_rounded, size: 16, color: AppColors.neutral),
                      label: const Text(
                        'Tất cả',
                        style: TextStyle(
                          fontFamily: 'Be Vietnam Pro',
                          fontSize: 12,
                          color: AppColors.neutral,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      style: TextButton.styleFrom(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        backgroundColor: AppColors.bgSecondary,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),

                // List of filtered places
                if (filteredPlaces.isEmpty)
                  Container(
                    padding: const EdgeInsets.symmetric(vertical: 40),
                    alignment: Alignment.center,
                    child: Column(
                      children: [
                        const Icon(Icons.explore_off_outlined, size: 48, color: AppColors.textHint),
                        const SizedBox(height: 12),
                        Text(
                          'Chưa có địa điểm nào trong mục $selectedCategory',
                          style: const TextStyle(
                            fontFamily: 'Be Vietnam Pro',
                            fontSize: 14,
                            color: AppColors.textTertiary,
                          ),
                        ),
                      ],
                    ),
                  )
                else
                  Column(
                    children: filteredPlaces.map((item) {
                      return DestinationTile(
                        item: item,
                        onTap: () => _navigateToDetail(item),
                      );
                    }).toList(),
                  ),
              ],
              const SizedBox(height: 30),
            ],
          ),
        ),
      ),
    );
  }
}
