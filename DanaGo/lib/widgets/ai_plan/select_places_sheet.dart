import 'package:flutter/material.dart';
import 'package:smarttrip/models/destination_item.dart';
import 'package:smarttrip/services/destination_service.dart';
import 'package:smarttrip/theme/app_colors.dart';

class SelectPlacesSheet extends StatefulWidget {
  final List<DestinationItem> initialSelected;

  const SelectPlacesSheet({
    super.key,
    required this.initialSelected,
  });

  @override
  State<SelectPlacesSheet> createState() => _SelectPlacesSheetState();
}

class _SelectPlacesSheetState extends State<SelectPlacesSheet> {
  final TextEditingController _searchCtrl = TextEditingController();
  List<DestinationItem> _allPlaces = [];
  final Set<String> _selectedIds = {};
  final Map<String, DestinationItem> _selectedMap = {};
  String _selectedCategory = 'ALL';
  List<String> _categories = ['ALL'];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    for (var p in widget.initialSelected) {
      _selectedIds.add(p.id);
      _selectedMap[p.id] = p;
    }
    _loadPlaces();
  }

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  Future<void> _loadPlaces() async {
    setState(() => _isLoading = true);
    try {
      final list = await DestinationService.instance.getAll();
      final cats = <String>{'ALL'};
      for (var item in list) {
        if (item.category.isNotEmpty) {
          cats.add(item.category);
        }
      }
      if (mounted) {
        setState(() {
          _allPlaces = list;
          _categories = cats.toList();
          _isLoading = false;
        });
      }
    } catch (_) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  List<DestinationItem> get _filteredPlaces {
    final query = _searchCtrl.text.trim().toLowerCase();
    return _allPlaces.where((p) {
      final matchQuery = query.isEmpty ||
          p.title.toLowerCase().contains(query) ||
          (p.address != null && p.address!.toLowerCase().contains(query));
      final matchCategory =
          _selectedCategory == 'ALL' || p.category == _selectedCategory;
      return matchQuery && matchCategory;
    }).toList();
  }

  void _toggleSelect(DestinationItem item) {
    setState(() {
      if (_selectedIds.contains(item.id)) {
        _selectedIds.remove(item.id);
        _selectedMap.remove(item.id);
      } else {
        _selectedIds.add(item.id);
        _selectedMap[item.id] = item;
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Container(
      height: MediaQuery.of(context).size.height * 0.85,
      decoration: BoxDecoration(
        color: theme.scaffoldBackgroundColor,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
      ),
      child: Column(
        children: [
          // Drag handle
          Container(
            margin: const EdgeInsets.only(top: 12, bottom: 8),
            width: 44,
            height: 4,
            decoration: BoxDecoration(
              color: Colors.grey.withValues(alpha: 0.3),
              borderRadius: BorderRadius.circular(2),
            ),
          ),

          // Header
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Chọn Điểm Tham Quan Mong Muốn',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        'AI sẽ ưu tiên sắp xếp các điểm bạn chọn vào lịch trình',
                        style: TextStyle(
                          fontSize: 12,
                          color: isDark ? Colors.grey[400] : Colors.grey[600],
                        ),
                      ),
                    ],
                  ),
                ),
                IconButton(
                  onPressed: () => Navigator.pop(context),
                  icon: const Icon(Icons.close_rounded),
                  tooltip: 'Đóng',
                ),
              ],
            ),
          ),

          // Search Box
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 4, 16, 8),
            child: TextField(
              controller: _searchCtrl,
              onChanged: (_) => setState(() {}),
              decoration: InputDecoration(
                hintText: 'Tìm kiếm điểm đến theo tên, quận huyện...',
                hintStyle: const TextStyle(fontSize: 13, color: Colors.grey),
                prefixIcon: const Icon(Icons.search, size: 20, color: AppColors.primary),
                suffixIcon: _searchCtrl.text.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear, size: 18),
                        onPressed: () {
                          _searchCtrl.clear();
                          setState(() {});
                        },
                      )
                    : null,
                filled: true,
                fillColor: isDark ? Colors.grey[900] : Colors.grey[100],
                contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(16),
                  borderSide: BorderSide.none,
                ),
              ),
            ),
          ),

          // Category Chips
          if (_categories.length > 1)
            SizedBox(
              height: 38,
              child: ListView.separated(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                scrollDirection: Axis.horizontal,
                itemCount: _categories.length,
                separatorBuilder: (_, __) => const SizedBox(width: 8),
                itemBuilder: (context, i) {
                  final cat = _categories[i];
                  final isSelected = cat == _selectedCategory;
                  return ChoiceChip(
                    label: Text(
                      cat == 'ALL' ? 'Tất cả' : cat,
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                        color: isSelected ? Colors.white : (isDark ? Colors.grey[300] : Colors.black87),
                      ),
                    ),
                    selected: isSelected,
                    selectedColor: AppColors.primary,
                    backgroundColor: isDark ? Colors.grey[800] : Colors.grey[200],
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                    side: BorderSide.none,
                    onSelected: (_) => setState(() => _selectedCategory = cat),
                  );
                },
              ),
            ),

          const SizedBox(height: 8),

          // Places List
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : _filteredPlaces.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.search_off_rounded, size: 48, color: Colors.grey[400]),
                            const SizedBox(height: 8),
                            Text(
                              'Không tìm thấy địa điểm phù hợp',
                              style: TextStyle(color: Colors.grey[500], fontSize: 13),
                            ),
                          ],
                        ),
                      )
                    : ListView.builder(
                        padding: const EdgeInsets.fromLTRB(16, 4, 16, 16),
                        itemCount: _filteredPlaces.length,
                        itemBuilder: (context, idx) {
                          final item = _filteredPlaces[idx];
                          final isSelected = _selectedIds.contains(item.id);

                          return Container(
                            margin: const EdgeInsets.only(bottom: 10),
                            decoration: BoxDecoration(
                              color: isDark ? Colors.grey[850] : Colors.white,
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(
                                color: isSelected
                                    ? AppColors.primary
                                    : (isDark ? Colors.grey[800]! : Colors.grey[200]!),
                                width: isSelected ? 1.5 : 1,
                              ),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.black.withValues(alpha: 0.03),
                                  blurRadius: 8,
                                  offset: const Offset(0, 2),
                                ),
                              ],
                            ),
                            child: InkWell(
                              borderRadius: BorderRadius.circular(16),
                              onTap: () => _toggleSelect(item),
                              child: Padding(
                                padding: const EdgeInsets.all(10),
                                child: Row(
                                  children: [
                                    // Thumbnail
                                    ClipRRect(
                                      borderRadius: BorderRadius.circular(12),
                                      child: Container(
                                        width: 64,
                                        height: 64,
                                        color: Colors.grey[200],
                                        child: item.imageUrl.isNotEmpty
                                            ? Image.network(
                                                item.imageUrl,
                                                fit: BoxFit.cover,
                                                errorBuilder: (_, __, ___) => const Icon(
                                                  Icons.image_outlined,
                                                  color: Colors.grey,
                                                ),
                                              )
                                            : const Icon(Icons.place_outlined, color: Colors.grey),
                                      ),
                                    ),
                                    const SizedBox(width: 12),

                                    // Content
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Text(
                                            item.title,
                                            style: const TextStyle(
                                              fontSize: 14,
                                              fontWeight: FontWeight.bold,
                                            ),
                                            maxLines: 1,
                                            overflow: TextOverflow.ellipsis,
                                          ),
                                          const SizedBox(height: 4),
                                          Row(
                                            children: [
                                              if (item.address != null && item.address!.isNotEmpty) ...[
                                                Icon(
                                                  Icons.location_on_rounded,
                                                  size: 13,
                                                  color: Colors.grey[500],
                                                ),
                                                const SizedBox(width: 2),
                                                Flexible(
                                                  child: Text(
                                                    item.address!,
                                                    style: TextStyle(
                                                      fontSize: 11,
                                                      color: Colors.grey[500],
                                                    ),
                                                    maxLines: 1,
                                                    overflow: TextOverflow.ellipsis,
                                                  ),
                                                ),
                                                const SizedBox(width: 8),
                                              ],
                                              if (item.rating > 0) ...[
                                                const Icon(
                                                  Icons.star_rounded,
                                                  size: 13,
                                                  color: Colors.amber,
                                                ),
                                                const SizedBox(width: 2),
                                                Text(
                                                  item.rating.toStringAsFixed(1),
                                                  style: const TextStyle(
                                                    fontSize: 11,
                                                    fontWeight: FontWeight.bold,
                                                  ),
                                                ),
                                              ],
                                            ],
                                          ),
                                          const SizedBox(height: 4),
                                          Container(
                                            padding: const EdgeInsets.symmetric(
                                              horizontal: 6,
                                              vertical: 2,
                                            ),
                                            decoration: BoxDecoration(
                                              color: AppColors.primary.withValues(alpha: 0.1),
                                              borderRadius: BorderRadius.circular(6),
                                            ),
                                            child: Text(
                                              item.tag,
                                              style: const TextStyle(
                                                fontSize: 10,
                                                fontWeight: FontWeight.w600,
                                                color: AppColors.primary,
                                              ),
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),

                                    // Checkbox indicator
                                    Checkbox(
                                      value: isSelected,
                                      activeColor: AppColors.primary,
                                      shape: RoundedRectangleBorder(
                                        borderRadius: BorderRadius.circular(6),
                                      ),
                                      onChanged: (_) => _toggleSelect(item),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          );
                        },
                      ),
          ),

          // Bottom Confirmation Bar
          Container(
            padding: const EdgeInsets.fromLTRB(20, 12, 20, 24),
            decoration: BoxDecoration(
              color: isDark ? Colors.grey[900] : Colors.white,
              border: Border(top: BorderSide(color: isDark ? Colors.grey[800]! : Colors.grey[200]!)),
            ),
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        'Đã chọn ${_selectedIds.length} địa điểm',
                        style: const TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      Text(
                        'Sẽ được AI ưu tiên vào lịch trình',
                        style: TextStyle(
                          fontSize: 11,
                          color: isDark ? Colors.grey[400] : Colors.grey[600],
                        ),
                      ),
                    ],
                  ),
                ),
                ElevatedButton(
                  onPressed: () {
                    final selectedList = _selectedMap.values.toList();
                    Navigator.pop(context, selectedList);
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                    ),
                    padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                  ),
                  child: Text(
                    'Xác nhận (${_selectedIds.length})',
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

