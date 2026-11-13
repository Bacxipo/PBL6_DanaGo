import 'package:flutter/material.dart';
import 'package:smarttrip/models/lodging_item.dart';
import 'package:smarttrip/services/lodging_service.dart';
import 'package:smarttrip/theme/app_colors.dart';

class LodgingScreen extends StatefulWidget {
  const LodgingScreen({super.key});

  @override
  State<LodgingScreen> createState() => _LodgingScreenState();
}

class _LodgingScreenState extends State<LodgingScreen> {
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();
  final TextEditingController _searchController = TextEditingController();

  List<LodgingItem> _allLodgings = [];
  List<AmenityItem> _amenities = [];
  bool _isLoading = true;

  // Bộ lọc bên trái
  String _selectedType = 'Tất cả';
  int _selectedGuests = 0; // 0 = Bất kỳ, 1..15
  String _selectedRegion = 'Tất cả';
  String _selectedDistrict = 'Tất cả';
  double _maxPrice = 5000000;
  final Set<int> _selectedAmenityIds = {};
  bool _showAmenitiesDropdown = false;

  static const List<Map<String, String>> _typeOptions = [
    {'value': 'Tất cả', 'label': 'Tất cả loại hình'},
    {'value': 'Hotel', 'label': 'Khách sạn (Hotel)'},
    {'value': 'Homestay', 'label': 'Homestay'},
    {'value': 'Resort', 'label': 'Khu nghỉ dưỡng (Resort)'},
    {'value': 'Villa', 'label': 'Biệt thự (Villa)'},
    {'value': 'Apartment', 'label': 'Căn hộ (Apartment)'},
    {'value': 'Hostel', 'label': 'Nhà nghỉ / Hostel'},
  ];

  static const List<int> _guestOptions = [0, 1, 2, 4, 6, 8];

  static const Map<String, List<String>> _regionDistrictMap = {
    'Đà Nẵng nội thành': [
      'Hải Châu',
      'Sơn Trà',
      'Ngũ Hành Sơn',
      'Thanh Khê',
      'Liên Chiểu',
      'Cẩm Lệ',
    ],
    'Bán đảo Sơn Trà': ['Sơn Trà'],
    'Ngũ Hành Sơn': ['Ngũ Hành Sơn'],
    'Hòa Vang - Bà Nà': ['Hòa Vang', 'Bà Nà'],
    'Hội An - Điện Bàn': ['Hội An', 'Điện Bàn'],
  };

  @override
  void initState() {
    super.initState();
    _loadInitialData();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _loadInitialData() async {
    setState(() => _isLoading = true);
    final results = await Future.wait([
      LodgingService.instance.getLodgings(),
      LodgingService.instance.getAmenities(),
    ]);
    if (!mounted) return;
    setState(() {
      _allLodgings = results[0] as List<LodgingItem>;
      _amenities = results[1] as List<AmenityItem>;
      _isLoading = false;
    });
  }

  List<String> get _availableDistricts {
    final set = <String>{'Tất cả'};
    for (final l in _allLodgings) {
      if (l.district.trim().isNotEmpty) {
        set.add(l.district.trim());
      }
    }
    return set.toList();
  }

  List<LodgingItem> get _filteredLodgings {
    final q = _searchController.text.trim().toLowerCase();
    return _allLodgings.where((item) {
      if (q.isNotEmpty) {
        final matchName = item.name.toLowerCase().contains(q);
        final matchDist = item.district.toLowerCase().contains(q);
        final matchDesc = (item.description ?? '').toLowerCase().contains(q);
        if (!matchName && !matchDist && !matchDesc) return false;
      }
      if (_selectedType != 'Tất cả' &&
          item.type.toLowerCase() != _selectedType.toLowerCase()) {
        return false;
      }
      if (_selectedGuests > 0 && (item.maxGuests ?? 2) < _selectedGuests) {
        return false;
      }
      if (_selectedRegion != 'Tất cả') {
        final allowed = _regionDistrictMap[_selectedRegion] ?? [];
        final distLower = item.district.toLowerCase();
        final matched =
            allowed.any((d) => distLower.contains(d.toLowerCase()));
        if (!matched) return false;
      }
      if (_selectedDistrict != 'Tất cả' &&
          !item.district
              .toLowerCase()
              .contains(_selectedDistrict.toLowerCase())) {
        return false;
      }
      if (_maxPrice < 5000000 && item.pricePerNight > _maxPrice) {
        return false;
      }
      if (_selectedAmenityIds.isNotEmpty) {
        final itemAmenityIds = item.amenities.map((a) => a.id).toSet();
        for (final reqId in _selectedAmenityIds) {
          if (!itemAmenityIds.contains(reqId)) return false;
        }
      }
      return true;
    }).toList();
  }

  int get _activeFilterCount {
    int count = 0;
    if (_selectedType != 'Tất cả') count++;
    if (_selectedGuests > 0) count++;
    if (_selectedRegion != 'Tất cả') count++;
    if (_selectedDistrict != 'Tất cả') count++;
    if (_maxPrice < 5000000) count++;
    count += _selectedAmenityIds.length;
    return count;
  }

  void _resetFilters() {
    setState(() {
      _searchController.clear();
      _selectedType = 'Tất cả';
      _selectedGuests = 0;
      _selectedRegion = 'Tất cả';
      _selectedDistrict = 'Tất cả';
      _maxPrice = 5000000;
      _selectedAmenityIds.clear();
    });
  }

  String _formatVnd(double amount) {
    final s = amount.round().toString();
    final reg = RegExp(r'\B(?=(\d{3})+(?!\d))');
    return '${s.replaceAllMapped(reg, (m) => '.')}đ';
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final filtered = _filteredLodgings;

    return Scaffold(
      key: _scaffoldKey,
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      drawer: _buildFilterDrawer(isDark),
      appBar: AppBar(
        backgroundColor: isDark ? const Color(0xFF1A202C) : Colors.white,
        elevation: 0.5,
        leading: IconButton(
          icon: Icon(
            Icons.arrow_back_ios_new_rounded,
            size: 18,
            color: isDark ? Colors.white : AppColors.textPrimary,
          ),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          'Nơi lưu trú Đà Nẵng',
          style: TextStyle(
            fontFamily: 'Be Vietnam Pro',
            fontSize: 17,
            fontWeight: FontWeight.w800,
            color: isDark ? Colors.white : AppColors.textPrimary,
          ),
        ),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 12),
            child: InkWell(
              borderRadius: BorderRadius.circular(12),
              onTap: () => _scaffoldKey.currentState?.openDrawer(),
              child: Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
                decoration: BoxDecoration(
                  color: AppColors.primary.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: AppColors.primary.withValues(alpha: 0.35),
                  ),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(
                      Icons.tune_rounded,
                      size: 16,
                      color: AppColors.primary,
                    ),
                    const SizedBox(width: 5),
                    Text(
                      _activeFilterCount > 0
                          ? 'Bộ lọc ($_activeFilterCount)'
                          : 'Bộ lọc',
                      style: const TextStyle(
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
      body: Column(
        children: [
          // Thanh tìm kiếm + nút mở bộ lọc bên trái
          Container(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
            color: isDark ? const Color(0xFF1A202C) : Colors.white,
            child: Column(
              children: [
                Row(
                  children: [
                    InkWell(
                      onTap: () => _scaffoldKey.currentState?.openDrawer(),
                      borderRadius: BorderRadius.circular(12),
                      child: Container(
                        padding: const EdgeInsets.all(11),
                        decoration: BoxDecoration(
                          color: AppColors.primary,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: const Icon(
                          Icons.filter_list_rounded,
                          color: Colors.white,
                          size: 20,
                        ),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: TextField(
                        controller: _searchController,
                        onChanged: (_) => setState(() {}),
                        decoration: InputDecoration(
                          hintText: 'Tìm tên khách sạn, homestay, khu vực...',
                          hintStyle: const TextStyle(
                            fontFamily: 'Be Vietnam Pro',
                            fontSize: 13,
                          ),
                          prefixIcon:
                              const Icon(Icons.search_rounded, size: 19),
                          suffixIcon: _searchController.text.isNotEmpty
                              ? IconButton(
                                  icon: const Icon(Icons.close, size: 17),
                                  onPressed: () {
                                    _searchController.clear();
                                    setState(() {});
                                  },
                                )
                              : null,
                          contentPadding: const EdgeInsets.symmetric(
                            horizontal: 14,
                            vertical: 10,
                          ),
                          filled: true,
                          fillColor: isDark
                              ? const Color(0xFF2D3748)
                              : const Color(0xFFF1F5F9),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: BorderSide.none,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                // Chip lọc nhanh loại nơi ở
                SizedBox(
                  height: 34,
                  child: ListView.separated(
                    scrollDirection: Axis.horizontal,
                    itemCount: _typeOptions.length,
                    separatorBuilder: (_, __) => const SizedBox(width: 8),
                    itemBuilder: (context, idx) {
                      final opt = _typeOptions[idx];
                      final isSelected = _selectedType == opt['value'];
                      return ChoiceChip(
                        label: Text(
                          opt['label']!,
                          style: TextStyle(
                            fontFamily: 'Be Vietnam Pro',
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                            color: isSelected
                                ? Colors.white
                                : (isDark
                                    ? Colors.white70
                                    : AppColors.textPrimary),
                          ),
                        ),
                        selected: isSelected,
                        selectedColor: AppColors.primary,
                        onSelected: (_) {
                          setState(() => _selectedType = opt['value']!);
                        },
                      );
                    },
                  ),
                ),
              ],
            ),
          ),

          // Dòng thống kê kết quả
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 10, 16, 6),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Tìm thấy ${filtered.length} nơi lưu trú phù hợp',
                  style: TextStyle(
                    fontFamily: 'Be Vietnam Pro',
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: isDark ? Colors.white70 : Colors.blueGrey.shade700,
                  ),
                ),
                if (_activeFilterCount > 0)
                  GestureDetector(
                    onTap: _resetFilters,
                    child: const Text(
                      'Xóa bộ lọc',
                      style: TextStyle(
                        fontFamily: 'Be Vietnam Pro',
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
                        color: Colors.redAccent,
                      ),
                    ),
                  ),
              ],
            ),
          ),

          // Danh sách nơi lưu trú
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : filtered.isEmpty
                    ? Center(
                        child: Padding(
                          padding: const EdgeInsets.all(24),
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(
                                Icons.hotel_outlined,
                                size: 54,
                                color: Colors.grey.shade400,
                              ),
                              const SizedBox(height: 12),
                              const Text(
                                'Không tìm thấy nơi lưu trú phù hợp với bộ lọc.',
                                textAlign: TextAlign.center,
                                style: TextStyle(
                                  fontFamily: 'Be Vietnam Pro',
                                  fontSize: 14,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                              const SizedBox(height: 10),
                              ElevatedButton.icon(
                                onPressed: _resetFilters,
                                icon: const Icon(Icons.refresh, size: 16),
                                label: const Text('Đặt lại bộ lọc'),
                              ),
                            ],
                          ),
                        ),
                      )
                    : RefreshIndicator(
                        onRefresh: _loadInitialData,
                        child: ListView.separated(
                          padding: const EdgeInsets.fromLTRB(16, 6, 16, 24),
                          itemCount: filtered.length,
                          separatorBuilder: (_, __) =>
                              const SizedBox(height: 14),
                          itemBuilder: (context, index) {
                            final item = filtered[index];
                            return _buildLodgingCard(item, isDark);
                          },
                        ),
                      ),
          ),
        ],
      ),
    );
  }

  /// Thanh bộ lọc bên trái (Drawer) gồm: Số người, Tiện ích, Loại nơi ở, Khu vực
  Widget _buildFilterDrawer(bool isDark) {
    return Drawer(
      width: MediaQuery.of(context).size.width * 0.84,
      backgroundColor: isDark ? const Color(0xFF1A202C) : Colors.white,
      child: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header của bộ lọc bên trái
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
              decoration: BoxDecoration(
                border: Border(
                  bottom: BorderSide(
                    color: isDark ? Colors.white12 : Colors.grey.shade200,
                  ),
                ),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Row(
                    children: [
                      Icon(
                        Icons.filter_alt_rounded,
                        color: AppColors.primary,
                        size: 20,
                      ),
                      SizedBox(width: 8),
                      Text(
                        'Bộ lọc nơi lưu trú',
                        style: TextStyle(
                          fontFamily: 'Be Vietnam Pro',
                          fontSize: 16,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                    ],
                  ),
                  TextButton(
                    onPressed: _resetFilters,
                    child: const Text(
                      'Đặt lại',
                      style: TextStyle(
                        fontFamily: 'Be Vietnam Pro',
                        fontSize: 13,
                        fontWeight: FontWeight.w700,
                        color: Colors.redAccent,
                      ),
                    ),
                  ),
                ],
              ),
            ),

            // Nội dung bộ lọc
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(18),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // 1. LOẠI NƠI Ở
                    _buildSectionTitle('🏨 Loại nơi ở'),
                    const SizedBox(height: 8),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: _typeOptions.map((opt) {
                        final selected = _selectedType == opt['value'];
                        return ChoiceChip(
                          label: Text(
                            opt['label']!,
                            style: TextStyle(
                              fontFamily: 'Be Vietnam Pro',
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                              color: selected
                                  ? Colors.white
                                  : (isDark
                                      ? Colors.white70
                                      : AppColors.textPrimary),
                            ),
                          ),
                          selected: selected,
                          selectedColor: AppColors.primary,
                          onSelected: (_) =>
                              setState(() => _selectedType = opt['value']!),
                        );
                      }).toList(),
                    ),

                    const SizedBox(height: 20),

                    // 2. SỐ NGƯỜI (1 - 15 người: kéo hoặc chọn)
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        _buildSectionTitle('👥 Sức chứa (1 - 15 người)'),
                        Text(
                          _selectedGuests == 0
                              ? 'Tất cả'
                              : 'Từ $_selectedGuests người',
                          style: const TextStyle(
                            fontFamily: 'Be Vietnam Pro',
                            fontSize: 12,
                            fontWeight: FontWeight.w700,
                            color: AppColors.primary,
                          ),
                        ),
                      ],
                    ),
                    Row(
                      children: [
                        Expanded(
                          child: Slider(
                            value: _selectedGuests.toDouble(),
                            min: 0,
                            max: 15,
                            divisions: 15,
                            activeColor: AppColors.primary,
                            onChanged: (val) =>
                                setState(() => _selectedGuests = val.round()),
                          ),
                        ),
                        DropdownButton<int>(
                          value: _selectedGuests,
                          underline: const SizedBox(),
                          items: [
                            const DropdownMenuItem(
                              value: 0,
                              child: Text('Tất cả', style: TextStyle(fontSize: 12)),
                            ),
                            ...List.generate(
                              15,
                              (i) => DropdownMenuItem(
                                value: i + 1,
                                child: Text(
                                  '${i + 1} người',
                                  style: const TextStyle(fontSize: 12),
                                ),
                              ),
                            ),
                          ],
                          onChanged: (val) =>
                              setState(() => _selectedGuests = val ?? 0),
                        ),
                      ],
                    ),

                    const SizedBox(height: 20),

                    // 3. KHU VỰC & QUẬN HUYỆN
                    _buildSectionTitle('📍 Khu vực'),
                    const SizedBox(height: 8),
                    DropdownButtonFormField<String>(
                      initialValue: _selectedRegion,
                      decoration: InputDecoration(
                        contentPadding: const EdgeInsets.symmetric(
                          horizontal: 12,
                          vertical: 10,
                        ),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(10),
                        ),
                      ),
                      items: [
                        const DropdownMenuItem(
                          value: 'Tất cả',
                          child: Text('Tất cả khu vực'),
                        ),
                        ..._regionDistrictMap.keys.map(
                          (r) => DropdownMenuItem(value: r, child: Text(r)),
                        ),
                      ],
                      onChanged: (val) {
                        setState(() => _selectedRegion = val ?? 'Tất cả');
                      },
                    ),
                    const SizedBox(height: 12),
                    _buildSectionTitle('🗺️ Quận / Huyện chi tiết'),
                    const SizedBox(height: 8),
                    DropdownButtonFormField<String>(
                      initialValue:
                          _availableDistricts.contains(_selectedDistrict)
                              ? _selectedDistrict
                              : 'Tất cả',
                      decoration: InputDecoration(
                        contentPadding: const EdgeInsets.symmetric(
                          horizontal: 12,
                          vertical: 10,
                        ),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(10),
                        ),
                      ),
                      items: _availableDistricts
                          .map(
                            (d) => DropdownMenuItem(
                              value: d,
                              child:
                                  Text(d == 'Tất cả' ? 'Tất cả quận/huyện' : d),
                            ),
                          )
                          .toList(),
                      onChanged: (val) {
                        setState(() => _selectedDistrict = val ?? 'Tất cả');
                      },
                    ),

                    const SizedBox(height: 20),

                    // 4. MỨC GIÁ TỐI ĐA / ĐÊM
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        _buildSectionTitle('💰 Giá tối đa / đêm'),
                        Text(
                          _maxPrice >= 5000000
                              ? 'Không giới hạn'
                              : _formatVnd(_maxPrice),
                          style: const TextStyle(
                            fontFamily: 'Be Vietnam Pro',
                            fontSize: 12,
                            fontWeight: FontWeight.w700,
                            color: AppColors.primary,
                          ),
                        ),
                      ],
                    ),
                    Slider(
                      value: _maxPrice,
                      min: 200000,
                      max: 5000000,
                      divisions: 24,
                      activeColor: AppColors.primary,
                      onChanged: (val) => setState(() => _maxPrice = val),
                    ),

                    const SizedBox(height: 14),

                    // 5. TIỆN ÍCH (Xổ xuống để chọn)
                    _buildSectionTitle(
                      '✨ Tiện ích đi kèm (${_selectedAmenityIds.length})',
                    ),
                    const SizedBox(height: 8),
                    InkWell(
                      borderRadius: BorderRadius.circular(10),
                      onTap: () => setState(
                        () => _showAmenitiesDropdown = !_showAmenitiesDropdown,
                      ),
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 12,
                          vertical: 11,
                        ),
                        decoration: BoxDecoration(
                          border: Border.all(
                            color: _showAmenitiesDropdown
                                ? AppColors.primary
                                : Colors.grey.shade400,
                          ),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Expanded(
                              child: Text(
                                _selectedAmenityIds.isEmpty
                                    ? 'Tất cả tiện ích (Bấm để chọn)'
                                    : 'Đã chọn ${_selectedAmenityIds.length} tiện ích',
                                overflow: TextOverflow.ellipsis,
                                style: const TextStyle(
                                  fontFamily: 'Be Vietnam Pro',
                                  fontSize: 12,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ),
                            Icon(
                              _showAmenitiesDropdown
                                  ? Icons.keyboard_arrow_up_rounded
                                  : Icons.keyboard_arrow_down_rounded,
                              size: 20,
                            ),
                          ],
                        ),
                      ),
                    ),
                    if (_showAmenitiesDropdown) ...[
                      const SizedBox(height: 10),
                      if (_amenities.isEmpty)
                        const Text(
                          'Chưa có danh sách tiện ích',
                          style: TextStyle(fontSize: 12, color: Colors.grey),
                        )
                      else
                        Wrap(
                          spacing: 8,
                          runSpacing: 8,
                          children: _amenities.map((amenity) {
                            final checked =
                                _selectedAmenityIds.contains(amenity.id);
                            return FilterChip(
                              label: Text(
                                amenity.name,
                                style: TextStyle(
                                  fontFamily: 'Be Vietnam Pro',
                                  fontSize: 12,
                                  fontWeight: FontWeight.w600,
                                  color: checked
                                      ? Colors.white
                                      : (isDark
                                          ? Colors.white70
                                          : AppColors.textPrimary),
                                ),
                              ),
                              selected: checked,
                              selectedColor: AppColors.primary,
                              checkmarkColor: Colors.white,
                              onSelected: (val) {
                                setState(() {
                                  if (val) {
                                    _selectedAmenityIds.add(amenity.id);
                                  } else {
                                    _selectedAmenityIds.remove(amenity.id);
                                  }
                                });
                              },
                            );
                          }).toList(),
                        ),
                    ],
                  ],
                ),
              ),
            ),

            // Nút Áp dụng
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                border: Border(
                  top: BorderSide(
                    color: isDark ? Colors.white12 : Colors.grey.shade200,
                  ),
                ),
              ),
              child: SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 13),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  onPressed: () => Navigator.pop(context),
                  child: Text(
                    'Xem ${_filteredLodgings.length} nơi lưu trú',
                    style: const TextStyle(
                      fontFamily: 'Be Vietnam Pro',
                      fontSize: 14,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Text(
      title,
      style: const TextStyle(
        fontFamily: 'Be Vietnam Pro',
        fontSize: 13,
        fontWeight: FontWeight.w700,
      ),
    );
  }

  Widget _buildLodgingCard(LodgingItem item, bool isDark) {
    return GestureDetector(
      onTap: () => _showLodgingDetailSheet(item, isDark),
      child: Container(
        decoration: BoxDecoration(
          color: isDark ? const Color(0xFF1E293B) : Colors.white,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.06),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        clipBehavior: Clip.antiAlias,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Ảnh bìa + Badge loại nơi ở + Rating
            Stack(
              children: [
                SizedBox(
                  height: 175,
                  width: double.infinity,
                  child: Image.network(
                    item.thumbnailUrl,
                    fit: BoxFit.cover,
                    errorBuilder: (_, __, ___) => Container(
                      color: Colors.blueGrey.shade100,
                      child: const Center(
                        child: Icon(
                          Icons.hotel_rounded,
                          size: 44,
                          color: Colors.blueGrey,
                        ),
                      ),
                    ),
                  ),
                ),
                Positioned(
                  top: 10,
                  left: 10,
                  child: Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                    decoration: BoxDecoration(
                      color: Colors.black.withValues(alpha: 0.65),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      item.type,
                      style: const TextStyle(
                        fontFamily: 'Be Vietnam Pro',
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                        color: Colors.white,
                      ),
                    ),
                  ),
                ),
                Positioned(
                  top: 10,
                  right: 10,
                  child: Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: Colors.amber.shade600,
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.star_rounded,
                            size: 14, color: Colors.white),
                        const SizedBox(width: 3),
                        Text(
                          item.avgRating.toStringAsFixed(1),
                          style: const TextStyle(
                            fontFamily: 'Be Vietnam Pro',
                            fontSize: 11,
                            fontWeight: FontWeight.w800,
                            color: Colors.white,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),

            Padding(
              padding: const EdgeInsets.all(14),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    item.name,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontFamily: 'Be Vietnam Pro',
                      fontSize: 15,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                  const SizedBox(height: 5),
                  Row(
                    children: [
                      const Icon(
                        Icons.location_on_outlined,
                        size: 14,
                        color: AppColors.primary,
                      ),
                      const SizedBox(width: 4),
                      Expanded(
                        child: Text(
                          item.district,
                          style: TextStyle(
                            fontFamily: 'Be Vietnam Pro',
                            fontSize: 12,
                            color: isDark
                                ? Colors.white70
                                : Colors.blueGrey.shade600,
                          ),
                        ),
                      ),
                      if (item.maxGuests != null) ...[
                        const Icon(
                          Icons.people_outline_rounded,
                          size: 14,
                          color: Colors.teal,
                        ),
                        const SizedBox(width: 4),
                        Text(
                          'Tối đa ${item.maxGuests} khách',
                          style: const TextStyle(
                            fontFamily: 'Be Vietnam Pro',
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                            color: Colors.teal,
                          ),
                        ),
                      ],
                    ],
                  ),
                  if (item.amenities.isNotEmpty) ...[
                    const SizedBox(height: 8),
                    Wrap(
                      spacing: 6,
                      runSpacing: 6,
                      children: item.amenities.take(4).map((a) {
                        return Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 8,
                            vertical: 3,
                          ),
                          decoration: BoxDecoration(
                            color: AppColors.primary.withValues(alpha: 0.1),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            a.name,
                            style: const TextStyle(
                              fontFamily: 'Be Vietnam Pro',
                              fontSize: 11,
                              fontWeight: FontWeight.w600,
                              color: AppColors.primary,
                            ),
                          ),
                        );
                      }).toList(),
                    ),
                  ],
                  const SizedBox(height: 10),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Giá mỗi đêm',
                            style: TextStyle(
                              fontFamily: 'Be Vietnam Pro',
                              fontSize: 11,
                              color: Colors.grey,
                            ),
                          ),
                          Text(
                            '${_formatVnd(item.pricePerNight)} / đêm',
                            style: const TextStyle(
                              fontFamily: 'Be Vietnam Pro',
                              fontSize: 15,
                              fontWeight: FontWeight.w800,
                              color: AppColors.primary,
                            ),
                          ),
                        ],
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 12,
                          vertical: 7,
                        ),
                        decoration: BoxDecoration(
                          color: AppColors.primary,
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: const Text(
                          'Xem chi tiết',
                          style: TextStyle(
                            fontFamily: 'Be Vietnam Pro',
                            fontSize: 12,
                            fontWeight: FontWeight.w700,
                            color: Colors.white,
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showLodgingDetailSheet(LodgingItem item, bool isDark) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: isDark ? const Color(0xFF1A202C) : Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (context) {
        return DraggableScrollableSheet(
          expand: false,
          initialChildSize: 0.78,
          maxChildSize: 0.92,
          minChildSize: 0.5,
          builder: (context, scrollController) {
            return SingleChildScrollView(
              controller: scrollController,
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Center(
                    child: Container(
                      width: 44,
                      height: 4,
                      margin: const EdgeInsets.only(bottom: 16),
                      decoration: BoxDecoration(
                        color: Colors.grey.shade400,
                        borderRadius: BorderRadius.circular(4),
                      ),
                    ),
                  ),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(16),
                    child: SizedBox(
                      height: 210,
                      width: double.infinity,
                      child: item.images.length > 1
                          ? PageView.builder(
                              itemCount: item.images.length,
                              itemBuilder: (context, i) => Image.network(
                                item.images[i].imageUrl,
                                fit: BoxFit.cover,
                              ),
                            )
                          : Image.network(
                              item.thumbnailUrl,
                              fit: BoxFit.cover,
                            ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 10,
                          vertical: 4,
                        ),
                        decoration: BoxDecoration(
                          color: AppColors.primary.withValues(alpha: 0.12),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Text(
                          item.type,
                          style: const TextStyle(
                            fontFamily: 'Be Vietnam Pro',
                            fontSize: 12,
                            fontWeight: FontWeight.w700,
                            color: AppColors.primary,
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      const Icon(Icons.star_rounded,
                          size: 16, color: Colors.amber),
                      const SizedBox(width: 3),
                      Text(
                        '${item.avgRating.toStringAsFixed(1)} / 5.0',
                        style: const TextStyle(
                          fontFamily: 'Be Vietnam Pro',
                          fontSize: 13,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  Text(
                    item.name,
                    style: const TextStyle(
                      fontFamily: 'Be Vietnam Pro',
                      fontSize: 19,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    '📍 Khu vực: ${item.district} • 👥 Tối đa: ${item.maxGuests ?? 2} khách',
                    style: TextStyle(
                      fontFamily: 'Be Vietnam Pro',
                      fontSize: 13,
                      color:
                          isDark ? Colors.white70 : Colors.blueGrey.shade700,
                    ),
                  ),
                  if (item.checkin != null || item.checkout != null) ...[
                    const SizedBox(height: 6),
                    Text(
                      '🕒 Check-in: ${item.checkin ?? '14:00'} | Check-out: ${item.checkout ?? '12:00'}',
                      style: TextStyle(
                        fontFamily: 'Be Vietnam Pro',
                        fontSize: 12,
                        color:
                            isDark ? Colors.white60 : Colors.blueGrey.shade600,
                      ),
                    ),
                  ],
                  const SizedBox(height: 14),
                  Text(
                    '${_formatVnd(item.pricePerNight)} / đêm',
                    style: const TextStyle(
                      fontFamily: 'Be Vietnam Pro',
                      fontSize: 18,
                      fontWeight: FontWeight.w800,
                      color: AppColors.primary,
                    ),
                  ),
                  if (item.description != null &&
                      item.description!.trim().isNotEmpty) ...[
                    const SizedBox(height: 14),
                    const Text(
                      'Giới thiệu',
                      style: TextStyle(
                        fontFamily: 'Be Vietnam Pro',
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      item.description!,
                      style: TextStyle(
                        fontFamily: 'Be Vietnam Pro',
                        fontSize: 13,
                        height: 1.5,
                        color:
                            isDark ? Colors.white70 : Colors.blueGrey.shade800,
                      ),
                    ),
                  ],
                  if (item.amenities.isNotEmpty) ...[
                    const SizedBox(height: 16),
                    const Text(
                      'Tiện ích nổi bật',
                      style: TextStyle(
                        fontFamily: 'Be Vietnam Pro',
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: item.amenities.map((a) {
                        return Chip(
                          label: Text(
                            a.name,
                            style: const TextStyle(
                              fontFamily: 'Be Vietnam Pro',
                              fontSize: 12,
                            ),
                          ),
                        );
                      }).toList(),
                    ),
                  ],
                ],
              ),
            );
          },
        );
      },
    );
  }
}

