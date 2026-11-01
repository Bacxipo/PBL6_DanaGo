import 'package:flutter/material.dart';
import 'package:smarttrip/models/search_filter_model.dart';
import 'package:smarttrip/theme/app_colors.dart';

class SearchFilterBottomSheet extends StatefulWidget {
  final SearchFilterModel initialFilter;
  final ValueChanged<SearchFilterModel> onApply;

  const SearchFilterBottomSheet({
    super.key,
    required this.initialFilter,
    required this.onApply,
  });
  @override
  State<SearchFilterBottomSheet> createState() =>
      _SearchFilterBottomSheetState();
}

class _SearchFilterBottomSheetState extends State<SearchFilterBottomSheet> {
  late String _selectedCategory;
  late TextEditingController _priceFromCtrl;
  late TextEditingController _priceToCtrl;
  late String _selectedArea;
  late String _minRating;

  @override
  void initState() {
    super.initState();
    _selectedCategory = widget.initialFilter.category;
    _priceFromCtrl = TextEditingController(
      text: widget.initialFilter.priceFrom ?? '',
    );
    _priceToCtrl = TextEditingController(
      text: widget.initialFilter.priceTo ?? '',
    );
    _selectedArea = SearchFilterModel.areas.first;
    _minRating = widget.initialFilter.minRating;
  }

  @override
  void dispose() {
    _priceFromCtrl.dispose();
    _priceToCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      padding: const EdgeInsets.fromLTRB(20, 12, 20, 24),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Center(
            child: Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: const Color(0xffe5e7eb),
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Bộ lọc',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: Colors.black,
                ),
              ),
              GestureDetector(
                onTap: () => Navigator.pop(context),
                child: Container(
                  padding: const EdgeInsets.all(6),
                  decoration: BoxDecoration(
                    color: const Color(0xfff3f4f6),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Icon(Icons.close, size: 18, color: Colors.black),
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          const Text(
            'DANH MỤC',
            style: TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.bold,
              color: Colors.black,
            ),
          ),
          const SizedBox(height: 10),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: SearchFilterModel.categories.map((cat) {
              final bool isSelected = _selectedCategory == cat;
              return GestureDetector(
                onTap: () => setState(() => _selectedCategory = cat),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  padding: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 18,
                  ),
                  decoration: BoxDecoration(
                    color: isSelected
                        ? AppColors.primary
                        : const Color(0xffe0f7f8),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    cat,
                    style: TextStyle(
                      color: isSelected ? Colors.white : AppColors.primary,
                      fontWeight: FontWeight.w600,
                      fontSize: 13,
                    ),
                  ),
                ),
              );
            }).toList(),
          ),
          const SizedBox(height: 20),
          const Text(
            'KHOẢNG GIÁ',
            style: TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.bold,
              color: Colors.black,
              letterSpacing: 0.8,
            ),
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              Expanded(
                child: _buildPriceField(controller: _priceFromCtrl, hint: 'từ'),
              ),
              const SizedBox(width: 20),
              Expanded(
                child: _buildPriceField(controller: _priceToCtrl, hint: 'đến'),
              ),
            ],
          ),
          const SizedBox(height: 20),
          const Text(
            'KHU VỰC',
            style: TextStyle(
              color: Colors.black,
              fontSize: 15,
              fontWeight: FontWeight.bold,
              letterSpacing: 0.8,
            ),
          ),
          const SizedBox(height: 10),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
            decoration: BoxDecoration(
              color: Color(0xfff9fafb),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: const Color(0xffe5e7eb)),
            ),
            child: DropdownButtonHideUnderline(
              child: DropdownButton<String>(
                value: _selectedArea,
                isExpanded: true,
                icon: const Icon(
                  Icons.keyboard_arrow_down_rounded,
                  color: Colors.black,
                ),
                items: SearchFilterModel.areas
                    .map(
                      (area) => DropdownMenuItem(
                        value: area,
                        child: Text(
                          area,
                          style: const TextStyle(
                            fontSize: 14,
                            color: Color(0xff374151),
                          ),
                        ),
                      ),
                    )
                    .toList(),
                onChanged: (val) {
                  if (val != null) setState(() => _selectedArea = val);
                },
              ),
            ),
          ),
          const SizedBox(height: 20),
          const Text(
            'ĐÁNH GIÁ TỐI THIỂU',
            style: TextStyle(
              color: Colors.black,
              fontSize: 15,
              fontWeight: FontWeight.bold,
              letterSpacing: 0.8,
            ),
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              _buildRatingChip('Bất kỳ', 'any'),
              const SizedBox(width: 12),
              _buildRatingChip('4.0 ★ +', '4.0'),
              const SizedBox(width: 12),
              _buildRatingChip('4.5 ★ +', '4.5'),
            ],
          ),
          const SizedBox(height: 20),
          Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: _resetFilters,
                  style: OutlinedButton.styleFrom(
                    side: const BorderSide(color: AppColors.primary),
                    minimumSize: const Size(0, 48),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14),
                    ),
                  ),
                  child: const Text(
                    'Đặt lại',
                    style: TextStyle(
                      color: AppColors.primary,
                      fontWeight: FontWeight.bold,
                      fontSize: 15,
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                flex: 2,
                child: ElevatedButton(
                  onPressed: _submitFilters,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    minimumSize: const Size(0, 48),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14),
                    ),
                    elevation: 0,
                  ),
                  child: const Text(
                    'Áp dụng',
                    style: TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                      fontSize: 15,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildPriceField({
    required TextEditingController controller,
    required String hint,
  }) {
    return TextField(
      controller: controller,
      keyboardType: TextInputType.number,
      style: const TextStyle(fontSize: 14, color: Color(0xff374151)),
      decoration: InputDecoration(
        hintText: hint,
        prefixIcon: const Padding(
          padding: EdgeInsets.only(left: 12, right: 4),
          child: Text(
            'đ',
            style: TextStyle(
              color: AppColors.primary,
              fontWeight: FontWeight.bold,
              fontSize: 14,
            ),
          ),
        ),
        prefixIconConstraints: const BoxConstraints(minWidth: 0, minHeight: 0),
        filled: true,
        fillColor: const Color(0xfff9fafb),
        contentPadding: const EdgeInsets.symmetric(
          horizontal: 12,
          vertical: 12,
        ),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Color(0xffe5e7eb)),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Color(0xFFE5E7EB)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.primary),
        ),
      ),
    );
  }

  Widget _buildRatingChip(String label, String value) {
    final bool isSelected = _minRating == value;
    return GestureDetector(
      onTap: () => setState(() => _minRating = value),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFFE0F7F8) : Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected ? AppColors.primary : const Color(0xFFE5E7EB),
            width: isSelected ? 1.5 : 1,
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.bold,
            color: isSelected ? AppColors.primary : const Color(0xFF4B5563),
          ),
        ),
      ),
    );
  }

  void _resetFilters() {
    setState(() {
      _selectedCategory = 'Tất cả';
      _selectedArea = SearchFilterModel.areas.first;
      _minRating = 'any';
      _priceFromCtrl.clear();
      _priceToCtrl.clear();
    });
  }

  void _submitFilters() {
    final updatedModel = SearchFilterModel(
      category: _selectedCategory,
      priceFrom: _priceFromCtrl.text.trim(),
      priceTo: _priceToCtrl.text.trim(),
      area: _selectedArea,
      minRating: _minRating,
    );
    widget.onApply(updatedModel);
    Navigator.pop(context);
  }
}
