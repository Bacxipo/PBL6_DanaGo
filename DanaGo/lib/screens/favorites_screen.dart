import 'package:flutter/material.dart';
import 'package:smarttrip/models/destination_item.dart';
import 'package:smarttrip/screens/detail_place_screen.dart';
import 'package:smarttrip/theme/app_colors.dart';
import 'package:smarttrip/widgets/favorites/favorite_empty_state.dart';
import 'package:smarttrip/widgets/favorites/favorite_place_card.dart';

class FavoritesScreen extends StatefulWidget {
  const FavoritesScreen({super.key});

  @override
  State<FavoritesScreen> createState() => _FavoritesScreenState();
}

class _FavoritesScreenState extends State<FavoritesScreen> {
  final TextEditingController _searchCtrl = TextEditingController();
  late List<DestinationItem> _favorites;
  String _selectedCategory = 'Tất cả';

  final List<String> _categories = [
    'Tất cả',
    'BIỂU TƯỢNG',
    'KHU DU LỊCH',
    'ẨM THỰC',
    'BÃI BIỂN',
    'DI TÍCH',
    'MUA SẮM',
  ];

  @override
  void initState() {
    super.initState();
    // Initialize mock favorite items
    _favorites = [
      ...DestinationItem.featuredItems,
      ...DestinationItem.recommendedItems,
      ...DestinationItem.nearbyItems,
    ];
  }

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  List<DestinationItem> get _filteredFavorites {
    final query = _searchCtrl.text.trim().toLowerCase();
    return _favorites.where((item) {
      final matchesQuery = query.isEmpty ||
          item.title.toLowerCase().contains(query) ||
          (item.address ?? '').toLowerCase().contains(query);

      final matchesCategory = _selectedCategory == 'Tất cả' ||
          item.category.toUpperCase() == _selectedCategory.toUpperCase();

      return matchesQuery && matchesCategory;
    }).toList();
  }

  void _removeFavorite(DestinationItem item, int index) {
    setState(() {
      _favorites.remove(item);
    });

    ScaffoldMessenger.of(context).clearSnackBars();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Đã bỏ lưu "${item.title}"'),
        action: SnackBarAction(
          label: 'Hoàn tác',
          textColor: AppColors.accent,
          onPressed: () {
            setState(() {
              _favorites.insert(index.clamp(0, _favorites.length), item);
            });
          },
        ),
        duration: const Duration(seconds: 3),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final list = _filteredFavorites;
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      appBar: AppBar(
        backgroundColor: Theme.of(context).cardColor,
        elevation: 0,
        leading: IconButton(
          icon: Icon(
            Icons.arrow_back_ios_new_rounded,
            color: isDark ? Colors.white : AppColors.textPrimary,
            size: 20,
          ),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          'Địa điểm yêu thích',
          style: TextStyle(
            fontFamily: 'Be Vietnam Pro',
            fontSize: 18,
            fontWeight: FontWeight.w700,
            color: isDark ? Colors.white : AppColors.textPrimary,
          ),
        ),
        centerTitle: true,
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(1),
          child: Container(
            color: isDark ? Colors.white12 : AppColors.divider,
            height: 1,
          ),
        ),
      ),
      body: Column(
        children: [
          // Search & Filter Header Container
          Container(
            color: Theme.of(context).cardColor,
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Search Input
                Container(
                  height: 44,
                  decoration: BoxDecoration(
                    color: isDark ? const Color(0xFF0F172A) : AppColors.bgSecondary,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: TextField(
                    controller: _searchCtrl,
                    onChanged: (_) => setState(() {}),
                    textInputAction: TextInputAction.search,
                    style: TextStyle(
                      color: isDark ? Colors.white : AppColors.textPrimary,
                      fontSize: 13,
                    ),
                    decoration: InputDecoration(
                      hintText: 'Tìm kiếm trong mục yêu thích...',
                      hintStyle: const TextStyle(
                        fontFamily: 'Be Vietnam Pro',
                        fontSize: 13,
                        color: AppColors.textHint,
                      ),
                      prefixIcon: const Icon(
                        Icons.search_rounded,
                        color: AppColors.neutral,
                        size: 20,
                      ),
                      suffixIcon: _searchCtrl.text.isNotEmpty
                          ? GestureDetector(
                              onTap: () {
                                _searchCtrl.clear();
                                setState(() {});
                              },
                              child: const Icon(
                                Icons.clear_rounded,
                                color: AppColors.neutral,
                                size: 18,
                              ),
                            )
                          : null,
                      border: InputBorder.none,
                      contentPadding: const EdgeInsets.symmetric(vertical: 12),
                    ),
                  ),
                ),
                const SizedBox(height: 12),

                // Category Filter Chips
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  physics: const BouncingScrollPhysics(),
                  child: Row(
                    children: _categories.map((cat) {
                      final isSelected = _selectedCategory == cat;
                      return Padding(
                        padding: const EdgeInsets.only(right: 8),
                        child: ChoiceChip(
                          label: Text(cat),
                          selected: isSelected,
                          onSelected: (selected) {
                            if (selected) {
                              setState(() {
                                _selectedCategory = cat;
                              });
                            }
                          },
                          labelStyle: TextStyle(
                            fontFamily: 'Be Vietnam Pro',
                            fontSize: 12,
                            fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
                            color: isSelected
                                ? Colors.white
                                : (isDark ? Colors.grey.shade300 : AppColors.textSecondary),
                          ),
                          selectedColor: AppColors.primary,
                          backgroundColor: isDark ? const Color(0xFF0F172A) : AppColors.bgSecondary,
                          side: BorderSide.none,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(20),
                          ),
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        ),
                      );
                    }).toList(),
                  ),
                ),
              ],
            ),
          ),

          // Count indicator
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 6),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  '${list.length} địa điểm đã lưu',
                  style: const TextStyle(
                    fontFamily: 'Be Vietnam Pro',
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: AppColors.textTertiary,
                  ),
                ),
              ],
            ),
          ),

          // Content List or Empty State
          Expanded(
            child: list.isEmpty
                ? FavoriteEmptyState(
                    onExploreTap: () => Navigator.pop(context),
                  )
                : ListView.builder(
                    padding: const EdgeInsets.only(top: 4, bottom: 24),
                    physics: const BouncingScrollPhysics(),
                    itemCount: list.length,
                    itemBuilder: (context, index) {
                      final item = list[index];
                      return FavoritePlaceCard(
                        item: item,
                        onTap: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => DetailPlaceScreen(item: item),
                            ),
                          );
                        },
                        onRemoveFavorite: () => _removeFavorite(item, index),
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }
}

