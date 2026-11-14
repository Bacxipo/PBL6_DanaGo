import 'package:flutter/material.dart';
import 'package:smarttrip/models/destination_item.dart';
import 'package:smarttrip/screens/Detail_place_screen.dart';
import 'package:smarttrip/screens/lodging_screen.dart';
import 'package:smarttrip/screens/user_profile_posts_screen.dart';
import 'package:smarttrip/services/auth_service.dart';
import 'package:smarttrip/services/destination_service.dart';
import 'package:smarttrip/theme/app_colors.dart';
import 'package:smarttrip/widgets/home/category_selector.dart';
import 'package:smarttrip/widgets/home/destination_tile.dart';
import 'package:smarttrip/widgets/home/featured_card.dart';
import 'package:smarttrip/widgets/home/home_search_bar.dart';
import 'package:geolocator/geolocator.dart';

class HomeScreen extends StatefulWidget {
  final VoidCallback? onSearchTap;

  const HomeScreen({super.key, this.onSearchTap});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _selectCategoryIndex = 0;
  String? _avatarUrl;
  String? _customFilterTitle;
  List<Map<String, dynamic>> _categories = [
    {'id': 0, 'name': 'Tất cả'},
  ];

  final Map<String, int> _categoryIdMap = {
    'Biển': 1,
    'Ẩm thực': 2,
    'Di tích': 3,
    'Trekking': 4,
    'Cafe': 5,
  };
  List<DestinationItem> _featuredPlaces = [];
  List<DestinationItem> _allPlaces = [];
  List<DestinationItem> _recommendedPlaces = [];
  List<DestinationItem> _nearbyPlaces = [];
  List<DestinationItem> _categoryFilteredPlaces = [];

  bool _isLoading = true;
  bool _isCategoryLoading = false;

  @override
  void initState() {
    super.initState();
    _loadAvatar();
    _loadHomeData();
  }

  Future<void> _loadHomeData() async {
    setState(() => _isLoading = true);
    try {
      final categoriesFromDb = await DestinationService.instance
          .getCategories();
      final featured = await DestinationService.instance.getFeature(limit: 6);
      final recommended = await DestinationService.instance.getRecommended(
        limit: 6,
      );
      double? lat;
      double? lng;
      try {
        final pos = await Geolocator.getLastKnownPosition();
        if (pos != null) {
          lat = pos.latitude;
          lng = pos.longitude;
        }
      } catch (_) {}
      final nearby = await DestinationService.instance.getNearby(
        lat: lat,
        lng: lng,
        limit: 6,
      );
      if (mounted) {
        setState(() {
          if (categoriesFromDb.isNotEmpty) {
            _categories = [
              {'id': 0, 'name': 'Tất cả'},
              ...categoriesFromDb,
            ];
          }
          _featuredPlaces = featured;
          _recommendedPlaces = recommended;
          _nearbyPlaces = nearby;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  void _showAllFeatured() {
    setState(() {
      _customFilterTitle = 'Nổi bật tại Đà Nẵng';
      _categoryFilteredPlaces = _featuredPlaces;
      _selectCategoryIndex = -1; // Bỏ chọn chip danh mục
    });
  }

  // Bấm "Xem tất cả" mục Gợi ý cho bạn
  void _showAllRecommended() {
    setState(() {
      _customFilterTitle = 'Gợi ý cho bạn';
      _categoryFilteredPlaces = _recommendedPlaces;
      _selectCategoryIndex = -1;
    });
  }

  // Bấm "Xem tất cả" mục Gần bạn
  void _showAllNearby() {
    setState(() {
      _customFilterTitle = 'Địa điểm gần bạn';
      _categoryFilteredPlaces = _nearbyPlaces;
      _selectCategoryIndex = -1;
    });
  }

  Future<void> _onCategorySelected(int index) async {
    setState(() {
      _selectCategoryIndex = index;
      _customFilterTitle = null;
    });
    final selectedCat = _categories[index];
    final int catId = selectedCat['id'] as int;
    if (catId == 0) return;
    setState(() => _isCategoryLoading = true);
    final places = await DestinationService.instance.getAll(categoryId: catId);
    if (mounted) {
      setState(() {
        _categoryFilteredPlaces = places;
        _isCategoryLoading = false;
      });
    }
  }

  Future<void> _loadAvatar() async {
    final profile = await AuthService.instance.getProfile();
    if (profile != null && mounted) {
      final url = profile['avatarUrl'] as String?;
      setState(() {
        _avatarUrl = (url != null && url.isNotEmpty) ? url : null;
      });
    }
  }

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

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bool isAll = _selectCategoryIndex == 0 && _customFilterTitle == null;
    final String selectedCategoryName =
        _customFilterTitle ??
        (_categories.isNotEmpty &&
                _selectCategoryIndex >= 0 &&
                _selectCategoryIndex < _categories.length
            ? (_categories[_selectCategoryIndex]['name'] as String? ?? '')
            : '');
    final String headerLabel = _customFilterTitle != null
        ? 'Bộ sưu tập'
        : 'Danh mục';
    final filteredPlaces = _categoryFilteredPlaces;

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
        centerTitle: false,
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 16, top: 8, bottom: 8),
            child: InkWell(
              borderRadius: BorderRadius.circular(20),
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => const LodgingScreen(),
                  ),
                );
              },
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: AppColors.primary.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(
                    color: AppColors.primary.withValues(alpha: 0.35),
                  ),
                ),
                child: const Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(
                      Icons.hotel_rounded,
                      size: 16,
                      color: AppColors.primary,
                    ),
                    SizedBox(width: 6),
                    Text(
                      'Nơi lưu trú',
                      style: TextStyle(
                        fontFamily: 'Be Vietnam Pro',
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
                        color: AppColors.primary,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
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
                  }
                },
                onAvatarTap: _navigateToUserProfile,
                avatarUrl: _avatarUrl,
              ),
              const SizedBox(height: 20),
              CategorySelector(
                categories: _categories
                    .map((c) => c['name'] as String)
                    .toList(),
                selectedIndex: _selectCategoryIndex,
                onSelect: _onCategorySelected,
              ),
              const SizedBox(height: 24),
              if (isAll) ...[
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
                      onTap: () => _showAllFeatured(),
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
                    itemCount: _featuredPlaces.length,
                    itemBuilder: (context, index) {
                      final item = _featuredPlaces[index];
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
                      onTap: () => _showAllRecommended(),
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
                  children: _recommendedPlaces.take(3).map((item) {
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
                      onTap: () => _showAllNearby(),
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
                  children: _nearbyPlaces.take(3).map((item) {
                    return DestinationTile(
                      item: item,
                      onTap: () => _navigateToDetail(item),
                    );
                  }).toList(),
                ),
              ] else ...[
                const SizedBox(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    // Bọc Expanded để chữ dài tự động co gọn, không đè nút bên phải
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            '${headerLabel}',
                            style: TextStyle(
                              fontFamily: 'Be Vietnam Pro',
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                              color: isDark
                                  ? Colors.white60
                                  : AppColors.textTertiary,
                              letterSpacing: 0.5,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            selectedCategoryName,
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                            style: TextStyle(
                              fontFamily: 'Be Vietnam Pro',
                              fontSize: 20, // Tên danh mục to và đậm rõ ràng
                              fontWeight: FontWeight.bold,
                              height: 1.25,
                              color: isDark
                                  ? Colors.white
                                  : AppColors.textPrimary,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            '${filteredPlaces.length} địa điểm hấp dẫn tại Đà Nẵng',
                            style: TextStyle(
                              fontFamily: 'Be Vietnam Pro',
                              fontSize: 13,
                              color: isDark
                                  ? Colors.white70
                                  : AppColors.textTertiary,
                            ),
                          ),
                          const SizedBox(height: 4),
                        ],
                      ),
                    ),
                    const SizedBox(width: 12),
                    // Nút "Tất cả"
                    TextButton.icon(
                      onPressed: () {
                        setState(() {
                          _selectCategoryIndex = 0;
                          _customFilterTitle = null;
                        });
                      },
                      icon: Icon(
                        Icons.close_rounded,
                        size: 16,
                        color: isDark ? Colors.white70 : AppColors.neutral,
                      ),
                      label: Text(
                        'Tất cả',
                        style: TextStyle(
                          fontFamily: 'Be Vietnam Pro',
                          fontSize: 12,
                          color: isDark ? Colors.white70 : AppColors.neutral,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      style: TextButton.styleFrom(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 10,
                          vertical: 4,
                        ),
                        backgroundColor: isDark
                            ? const Color(0xFF1E293B)
                            : AppColors.bgSecondary,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16),
                        ),
                      ),
                    ),
                  ],
                ),
                // List of filtered places
                if (filteredPlaces.isEmpty)
                  Container(
                    padding: const EdgeInsets.symmetric(vertical: 40),
                    alignment: Alignment.center,
                    child: Column(
                      children: [
                        const Icon(
                          Icons.explore_off_outlined,
                          size: 48,
                          color: AppColors.textHint,
                        ),
                        const SizedBox(height: 12),
                        Text(
                          'Chưa có địa điểm nào trong mục $selectedCategoryName',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            fontFamily: 'Be Vietnam Pro',
                            fontSize: 14,
                            color: isDark
                                ? Colors.white70
                                : AppColors.textTertiary,
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
