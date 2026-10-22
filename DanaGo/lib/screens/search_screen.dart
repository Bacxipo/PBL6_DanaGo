import 'package:flutter/material.dart';
import 'package:smarttrip/widgets/search/search_filter_bottom_sheet.dart';
import 'package:smarttrip/widgets/search/search_filter_chip.dart';
import 'package:smarttrip/widgets/search/search_result_card.dart';
import '../models/search_result_item.dart';
import '../models/search_filter_model.dart';
import 'detail_place_screen.dart';

class SearchScreen extends StatefulWidget {
  final String initialQuery;

  const SearchScreen({super.key, this.initialQuery = ''});

  @override
  State<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
  late final TextEditingController _searchCtrl;
  SearchFilterModel _currentFilter = const SearchFilterModel();
  final Set<String> _activeChips = {'Gần tôi', 'Đang mở cửa'};
  List<SearchResultItem> _displayedResults = [];

  @override
  void initState() {
    super.initState();
    _searchCtrl = TextEditingController(text: widget.initialQuery);
    _applyFiltersAndSearch();
  }

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  void _applyFiltersAndSearch() {
    final query = _searchCtrl.text.toLowerCase().trim();

    setState(() {
      _displayedResults = SearchResultItem.mockList.where((item) {
        final matchesQuery =
            query.isEmpty ||
            item.title.toLowerCase().contains(query) ||
            item.address.toLowerCase().contains(query);

        final matchesCategory =
            _currentFilter.category == 'Tất cả' ||
            item.badge.toLowerCase().contains(
              _currentFilter.category.toLowerCase(),
            );

        bool matchesRating = true;
        if (_currentFilter.minRating == '4.0') {
          matchesRating = item.rating >= 4.0;
        } else if (_currentFilter.minRating == '4.5') {
          matchesRating = item.rating >= 4.5;
        }

        bool matchesChips = true;
        if (_activeChips.contains('Đang mở cửa') &&
            item.tagLabel != null &&
            !item.tagLabel!.contains('Đang mở cửa') &&
            !item.tagLabel!.contains('Mở')) {
          matchesChips = false;
        }

        if (_activeChips.contains('Đánh giá 4.5+') && item.rating < 4.5) {
          matchesChips = false;
        }

        return matchesQuery && matchesCategory && matchesRating && matchesChips;
      }).toList();
    });
  }

  void _openFilterBottomSheet() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => SearchFilterBottomSheet(
        initialFilter: _currentFilter,
        onApply: (newFilter) {
          _currentFilter = newFilter;
          _applyFiltersAndSearch();
        },
      ),
    );
  }

  void _toggleQuickChip(String chipLabel) {
    if (_activeChips.contains(chipLabel)) {
      _activeChips.remove(chipLabel);
    } else {
      _activeChips.add(chipLabel);
    }
    _applyFiltersAndSearch();
  }

  void _toggleFavorite(SearchResultItem targetItem) {
    setState(() {
      final index = _displayedResults.indexWhere(
        (it) => it.id == targetItem.id,
      );
      if (index != -1) {
        final oldItem = _displayedResults[index];
        _displayedResults[index] = SearchResultItem(
          id: oldItem.id,
          title: oldItem.title,
          imageUrl: oldItem.imageUrl,
          badge: oldItem.badge,
          badgeColor: oldItem.badgeColor,
          address: oldItem.address,
          rating: oldItem.rating,
          reviewCount: oldItem.reviewCount,
          distance: oldItem.distance,
          tagLabel: oldItem.tagLabel,
          tagColor: oldItem.tagColor,
          isFavorite: !oldItem.isFavorite,
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Color(0xFF374151)),
          onPressed: () => Navigator.pop(context),
        ),
        titleSpacing: 0,
        title: Row(
          children: [
            Expanded(
              child: Container(
                height: 42,
                decoration: BoxDecoration(
                  color: const Color(0xFFF3F4F6),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: TextField(
                  controller: _searchCtrl,
                  autofocus: false,
                  style: const TextStyle(fontSize: 14),
                  decoration: InputDecoration(
                    prefixIcon: const Icon(
                      Icons.search,
                      color: Color(0xFF9CA3AF),
                      size: 20,
                    ),
                    suffixIcon: _searchCtrl.text.isNotEmpty
                        ? IconButton(
                            icon: const Icon(
                              Icons.cancel,
                              color: Color(0xFF9CA3AF),
                              size: 18,
                            ),
                            onPressed: () {
                              _searchCtrl.clear();
                              _applyFiltersAndSearch();
                            },
                          )
                        : null,
                    hintText: 'Bãi biển Mỹ Khê',
                    hintStyle: const TextStyle(
                      color: Color(0xFF9CA3AF),
                      fontSize: 14,
                    ),
                    border: InputBorder.none,
                    contentPadding: const EdgeInsets.symmetric(vertical: 11),
                  ),
                  onChanged: (val) => _applyFiltersAndSearch(),
                ),
              ),
            ),
            const SizedBox(width: 8),
            Stack(
              clipBehavior: Clip.none,
              children: [
                Container(
                  decoration: BoxDecoration(
                    color: const Color(0xFFF3F4F6),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: IconButton(
                    icon: const Icon(
                      Icons.tune_rounded,
                      color: Color(0xFF374151),
                      size: 22,
                    ),
                    onPressed: _openFilterBottomSheet,
                  ),
                ),
                if (_currentFilter.activeFilterCount > 0)
                  Positioned(
                    top: -4,
                    right: -4,
                    child: Container(
                      width: 18,
                      height: 18,
                      decoration: const BoxDecoration(
                        color: Color(0xFFEA580C),
                        shape: BoxShape.circle,
                      ),
                      alignment: Alignment.center,
                      child: Text(
                        '${_currentFilter.activeFilterCount}',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ),
              ],
            ),
            const SizedBox(width: 12),
          ],
        ),
      ),
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SizedBox(height: 12),
          SearchFilterChips(
            chips: SearchFilterModel.quickFilters,
            activeChips: _activeChips,
            onToggle: _toggleQuickChip,
          ),
          const SizedBox(height: 14),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: RichText(
              text: TextSpan(
                style: const TextStyle(fontSize: 14, color: Color(0xFF6B7280)),
                children: [
                  const TextSpan(text: 'Tìm thấy '),
                  TextSpan(
                    text: '${_displayedResults.length}',
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF0F766E),
                    ),
                  ),
                  const TextSpan(text: ' địa điểm'),
                ],
              ),
            ),
          ),
          const SizedBox(height: 8),
          Expanded(
            child: _displayedResults.isEmpty
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: const [
                        Icon(
                          Icons.search_off_rounded,
                          size: 64,
                          color: Color(0xFFD1D5DB),
                        ),
                        SizedBox(height: 12),
                        Text(
                          'Không tìm thấy địa điểm phù hợp',
                          style: TextStyle(
                            color: Color(0xFF6B7280),
                            fontSize: 15,
                          ),
                        ),
                      ],
                    ),
                  )
                : ListView.builder(
                    padding: const EdgeInsets.only(bottom: 24),
                    itemCount: _displayedResults.length,
                    itemBuilder: (context, index) {
                      final place = _displayedResults[index];
                      return SearchResultCard(
                        item: place,
                        onTap: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (ctx) => DetailPlaceScreen(
                                item: place.toDestinationItem(),
                              ),
                            ),
                          );
                        },
                        onFavoriteToggle: () => _toggleFavorite(place),
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }
}
