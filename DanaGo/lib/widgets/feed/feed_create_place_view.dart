import 'package:flutter/material.dart';
import 'package:smarttrip/theme/app_colors.dart';

class FeedCreatePlaceView extends StatefulWidget {
  final TextEditingController nameController;
  final TextEditingController descController;
  final Function(Map<String, dynamic> data)? onDataChanged;

  const FeedCreatePlaceView({
    super.key,
    required this.nameController,
    required this.descController,
    this.onDataChanged,
  });

  @override
  State<FeedCreatePlaceView> createState() => _FeedCreatePlaceViewState();
}

class _FeedCreatePlaceViewState extends State<FeedCreatePlaceView> {
  int _selectedCategoryIndex = 0;
  String _selectedDistrict = 'Quận Hải Châu';
  late final TextEditingController _addressController;
  late final TextEditingController _openTimeController;
  late final TextEditingController _closeTimeController;
  late final TextEditingController _minPriceController;
  late final TextEditingController _maxPriceController;
  late final TextEditingController _phoneController;
  late final TextEditingController _linkController;
  bool _isFree = false;

  final List<String> _districts = const [
    'Quận Hải Châu',
    'Quận Sơn Trà',
    'Quận Ngũ Hành Sơn',
    'Quận Cẩm Lệ',
    'Quận Thanh Khê',
    'Quận Liên Chiểu',
    'Huyện Hòa Vang',
  ];

  final List<Map<String, String>> _placeCategories = const [
    {'emoji': '☕', 'title': 'Quán Cà Phê'},
    {'emoji': '🍜', 'title': 'Ẩm thực & Quán ăn'},
    {'emoji': '🏖️', 'title': 'Check-in biển'},
    {'emoji': '🏨', 'title': 'Homestay / Khách sạn'},
    {'emoji': '🛍️', 'title': 'Mua sắm & Đặc sản'},
  ];

  @override
  void initState() {
    super.initState();
    _addressController = TextEditingController();
    _openTimeController = TextEditingController(text: '07:00');
    _closeTimeController = TextEditingController(text: '22:30');
    _minPriceController = TextEditingController(text: '25.000');
    _maxPriceController = TextEditingController(text: '65.000');
    _phoneController = TextEditingController();
    _linkController = TextEditingController();
  }

  @override
  void dispose() {
    _addressController.dispose();
    _openTimeController.dispose();
    _closeTimeController.dispose();
    _minPriceController.dispose();
    _maxPriceController.dispose();
    _phoneController.dispose();
    _linkController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return ListView(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      children: [
        // 1. Tên địa điểm mới (*)
        _buildSectionHeader('Tên địa điểm mới', isRequired: true),
        const SizedBox(height: 6),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
          decoration: BoxDecoration(
            color: Theme.of(context).cardColor,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(
              color: isDark ? Colors.white10 : AppColors.borderLight,
            ),
          ),
          child: TextField(
            controller: widget.nameController,
            decoration: const InputDecoration(
              hintText: 'VD: Tiệm Cà Phê Rừng Dừa Cẩm Lệ, Bánh Mì Bà Lan...',
              hintStyle: TextStyle(
                fontFamily: 'Be Vietnam Pro',
                fontSize: 13,
                color: AppColors.textHint,
              ),
              border: InputBorder.none,
            ),
            style: TextStyle(
              fontFamily: 'Be Vietnam Pro',
              fontSize: 14,
              fontWeight: FontWeight.w700,
              color: isDark ? Colors.white : AppColors.textPrimary,
            ),
          ),
        ),
        const Padding(
          padding: EdgeInsets.only(top: 4, left: 4),
          child: Text(
            'Nhập tên chuẩn bảng hiệu để du khách dễ nhận diện khi tới nơi.',
            style: TextStyle(
              fontFamily: 'Be Vietnam Pro',
              fontSize: 11,
              color: AppColors.neutral,
            ),
          ),
        ),
        const SizedBox(height: 16),

        // 2. Danh mục địa điểm (*)
        _buildSectionHeader('Danh mục địa điểm', isRequired: true),
        const SizedBox(height: 8),
        SizedBox(
          height: 38,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            itemCount: _placeCategories.length,
            separatorBuilder: (context, index) => const SizedBox(width: 8),
            itemBuilder: (context, index) {
              final item = _placeCategories[index];
              final isSelected = _selectedCategoryIndex == index;

              return GestureDetector(
                onTap: () {
                  setState(() {
                    _selectedCategoryIndex = index;
                  });
                },
                child: Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 8,
                  ),
                  decoration: BoxDecoration(
                    color: isSelected
                        ? AppColors.primary
                        : const Color(0xFFEFF5F5),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(
                      color: isSelected
                          ? AppColors.primary
                          : AppColors.primary.withValues(alpha: 0.15),
                    ),
                  ),
                  child: Row(
                    children: [
                      Text(item['emoji']!, style: const TextStyle(fontSize: 13)),
                      const SizedBox(width: 6),
                      Text(
                        item['title']!,
                        style: TextStyle(
                          fontFamily: 'Be Vietnam Pro',
                          fontSize: 12,
                          fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                          color: isSelected ? Colors.white : AppColors.textPrimary,
                        ),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ),
        const SizedBox(height: 16),

        // 3. Vị trí & Địa chỉ (*)
        _buildSectionHeader('Vị trí & Địa chỉ', isRequired: true),
        const SizedBox(height: 8),
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: Theme.of(context).cardColor,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: isDark ? Colors.white10 : AppColors.borderLight,
            ),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // District Dropdown
              const Text(
                'Quận / Huyện Đà Nẵng',
                style: TextStyle(
                  fontFamily: 'Be Vietnam Pro',
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: AppColors.textSecondary,
                ),
              ),
              const SizedBox(height: 6),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12),
                decoration: BoxDecoration(
                  color: const Color(0xFFF8FAFC),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: AppColors.borderLight),
                ),
                child: DropdownButtonHideUnderline(
                  child: DropdownButton<String>(
                    value: _selectedDistrict,
                    isExpanded: true,
                    items: _districts
                        .map(
                          (d) => DropdownMenuItem(
                            value: d,
                            child: Text(
                              d,
                              style: const TextStyle(
                                fontFamily: 'Be Vietnam Pro',
                                fontSize: 13,
                              ),
                            ),
                          ),
                        )
                        .toList(),
                    onChanged: (val) {
                      if (val != null) setState(() => _selectedDistrict = val);
                    },
                  ),
                ),
              ),
              const SizedBox(height: 12),
              // Detailed Address
              const Text(
                'Địa chỉ chi tiết',
                style: TextStyle(
                  fontFamily: 'Be Vietnam Pro',
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: AppColors.textSecondary,
                ),
              ),
              const SizedBox(height: 6),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12),
                decoration: BoxDecoration(
                  color: const Color(0xFFF8FAFC),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: AppColors.borderLight),
                ),
                child: TextField(
                  controller: _addressController,
                  decoration: const InputDecoration(
                    hintText: 'Số nhà, ngõ/hẻm, tên đường, phường...',
                    hintStyle: TextStyle(
                      fontFamily: 'Be Vietnam Pro',
                      fontSize: 12,
                      color: AppColors.textHint,
                    ),
                    border: InputBorder.none,
                    isDense: true,
                    contentPadding: EdgeInsets.symmetric(vertical: 10),
                  ),
                  style: const TextStyle(fontFamily: 'Be Vietnam Pro', fontSize: 13),
                ),
              ),
              const SizedBox(height: 12),
              // GPS buttons
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text('Đã nhận diện tọa độ GPS hiện tại'),
                            duration: Duration(seconds: 1),
                          ),
                        );
                      },
                      icon: const Icon(Icons.my_location_rounded, size: 16),
                      label: const Text(
                        'Lấy GPS hiện tại',
                        style: TextStyle(
                          fontFamily: 'Be Vietnam Pro',
                          fontSize: 11.5,
                        ),
                      ),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: AppColors.primary,
                        side: const BorderSide(color: AppColors.primary),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: () {},
                      icon: const Icon(Icons.map_outlined, size: 16),
                      label: const Text(
                        'Ghim bản đồ',
                        style: TextStyle(
                          fontFamily: 'Be Vietnam Pro',
                          fontSize: 11.5,
                        ),
                      ),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: AppColors.accent,
                        side: const BorderSide(color: AppColors.accent),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),

        // 4. Giờ mở cửa & Chi phí
        _buildSectionHeader('Giờ mở cửa & Chi phí'),
        const SizedBox(height: 8),
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: Theme.of(context).cardColor,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: isDark ? Colors.white10 : AppColors.borderLight,
            ),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Mở cửa',
                          style: TextStyle(
                            fontFamily: 'Be Vietnam Pro',
                            fontSize: 11,
                            color: AppColors.neutral,
                          ),
                        ),
                        const SizedBox(height: 4),
                        _buildSmallInput(_openTimeController),
                      ],
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Đóng cửa',
                          style: TextStyle(
                            fontFamily: 'Be Vietnam Pro',
                            fontSize: 11,
                            color: AppColors.neutral,
                          ),
                        ),
                        const SizedBox(height: 4),
                        _buildSmallInput(_closeTimeController),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Khoảng giá tham khảo (VNĐ)',
                    style: TextStyle(
                      fontFamily: 'Be Vietnam Pro',
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  Row(
                    children: [
                      Checkbox(
                        value: _isFree,
                        onChanged: (val) => setState(() => _isFree = val ?? false),
                        visualDensity: VisualDensity.compact,
                        activeColor: AppColors.primary,
                      ),
                      const Text(
                        'Miễn phí vé',
                        style: TextStyle(
                          fontFamily: 'Be Vietnam Pro',
                          fontSize: 11,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
              if (!_isFree) ...[
                Row(
                  children: [
                    Expanded(child: _buildSmallInput(_minPriceController, prefix: 'Từ: ')),
                    const SizedBox(width: 12),
                    Expanded(child: _buildSmallInput(_maxPriceController, prefix: 'Đến: ')),
                  ],
                ),
              ],
            ],
          ),
        ),
        const SizedBox(height: 16),

        // 5. Ảnh thực tế (*)
        _buildSectionHeader('Ảnh thực tế', isRequired: true),
        const SizedBox(height: 8),
        Row(
          children: [
            _buildAddPhotoBox('Mặt tiền quán'),
            const SizedBox(width: 10),
            _buildAddPhotoBox('Không gian / Menu'),
          ],
        ),
        const SizedBox(height: 16),

        // 6. Mô tả địa điểm
        _buildSectionHeader('Mô tả & Cảm xúc cá nhân'),
        const SizedBox(height: 8),
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: Theme.of(context).cardColor,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(
              color: isDark ? Colors.white10 : AppColors.borderLight,
            ),
          ),
          child: TextField(
            controller: widget.descController,
            maxLines: 4,
            decoration: const InputDecoration(
              hintText:
                  'Chia sẻ kinh nghiệm, món ngon nhất định phải thử, góc chụp ảnh đẹp...',
              hintStyle: TextStyle(
                fontFamily: 'Be Vietnam Pro',
                fontSize: 13,
                color: AppColors.textHint,
              ),
              border: InputBorder.none,
            ),
            style: const TextStyle(fontFamily: 'Be Vietnam Pro', fontSize: 13.5),
          ),
        ),
        const SizedBox(height: 24),
      ],
    );
  }

  Widget _buildSectionHeader(String title, {bool isRequired = false}) {
    return Row(
      children: [
        Text(
          title,
          style: const TextStyle(
            fontFamily: 'Be Vietnam Pro',
            fontSize: 13,
            fontWeight: FontWeight.w700,
            color: AppColors.textPrimary,
          ),
        ),
        if (isRequired)
          const Text(' *', style: TextStyle(color: Colors.red, fontWeight: FontWeight.bold)),
      ],
    );
  }

  Widget _buildSmallInput(TextEditingController controller, {String? prefix}) {
    return Container(
      height: 38,
      padding: const EdgeInsets.symmetric(horizontal: 10),
      decoration: BoxDecoration(
        color: const Color(0xFFF8FAFC),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: AppColors.borderLight),
      ),
      child: TextField(
        controller: controller,
        decoration: InputDecoration(
          prefixText: prefix,
          prefixStyle: const TextStyle(
            fontFamily: 'Be Vietnam Pro',
            fontSize: 12,
            color: AppColors.neutral,
          ),
          border: InputBorder.none,
          isDense: true,
          contentPadding: const EdgeInsets.symmetric(vertical: 9),
        ),
        style: const TextStyle(
          fontFamily: 'Be Vietnam Pro',
          fontSize: 12.5,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }

  Widget _buildAddPhotoBox(String label) {
    return Expanded(
      child: Container(
        height: 85,
        decoration: BoxDecoration(
          color: const Color(0xFFF8FAFC),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: AppColors.primary.withValues(alpha: 0.3),
          ),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.add_a_photo_outlined, size: 22, color: AppColors.primary),
            const SizedBox(height: 4),
            Text(
              label,
              style: const TextStyle(
                fontFamily: 'Be Vietnam Pro',
                fontSize: 11,
                color: AppColors.primary,
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
