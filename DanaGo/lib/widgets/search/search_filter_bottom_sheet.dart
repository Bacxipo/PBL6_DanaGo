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
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
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
                color: isDark ? Colors.white24 : AppColors.border,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Bộ lọc',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: isDark ? Colors.white : Colors.black,
                ),
              ),
              GestureDetector(
                onTap: () => Navigator.pop(context),
                child: Container(
                  padding: const EdgeInsets.all(6),
                  decoration: BoxDecoration(
                    color: isDark ? const Color(0xFF0F172A) : AppColors.bgSecondary,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Icon(Icons.close, size: 18, color: isDark ? Colors.white70 : Colors.black),
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          Text(
            'DANH MỤC',
            style: TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.bold,
              color: isDark ? Colors.white : Colors.black,
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
                        : (isDark ? const Color(0xFF0F172A) : AppColors.primaryLight),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(
                      color: isSelected
                          ? AppColors.primary
                          : (isDark ? Colors.white12 : Colors.transparent),
                    ),
                  ),
                  child: Text(
                    cat,
                    style: TextStyle(
                      color: isSelected
                          ? Colors.white
                          : (isDark ? const Color(0xFF2DD4BF) : AppColors.primary),
                      fontWeight: FontWeight.w600,
                      fontSize: 13,
                    ),
                  ),
                ),
              );
            }).toList(),
          ),
          const SizedBox(height: 20),
          Text(
            'KHOẢNG GIÁ',
            style: TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.bold,
              color: isDark ? Colors.white : Colors.black,
              letterSpacing: 0.8,
            ),
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              Expanded(
                child: _buildPriceField(controller: _priceFromCtrl, hint: 'từ', isDark: isDark),
              ),
              const SizedBox(width: 20),
              Expanded(
                child: _buildPriceField(controller: _priceToCtrl, hint: 'đến', isDark: isDark),
              ),
            ],
          ),
          const SizedBox(height: 20),
          Text(
            'KHU VỰC',
            style: TextStyle(
              color: isDark ? Colors.white : Colors.black,
              fontSize: 15,
              fontWeight: FontWeight.bold,
              letterSpacing: 0.8,
            ),
          ),
          const SizedBox(height: 10),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
            decoration: BoxDecoration(
              color: isDark ? const Color(0xFF0F172A) : AppColors.bgCard,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: isDark ? Colors.white12 : AppColors.border),
            ),
            child: DropdownButtonHideUnderline(
              child: DropdownButton<String>(
                value: _selectedArea,
                isExpanded: true,
                dropdownColor: isDark ? const Color(0xFF1E293B) : Colors.white,
                icon: Icon(
                  Icons.keyboard_arrow_down_rounded,
                  color: isDark ? Colors.white70 : Colors.black,
                ),
                items: SearchFilterModel.areas
                    .map(
                      (area) => DropdownMenuItem(
                        value: area,
                        child: Text(
                          area,
                          style: TextStyle(
                            fontSize: 14,
                            color: isDark ? Colors.white : AppColors.textSecondary,
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
          Text(
            'ĐÁNH GIÁ TỐI THIỂU',
            style: TextStyle(
              color: isDark ? Colors.white : Colors.black,
              fontSize: 15,
              fontWeight: FontWeight.bold,
              letterSpacing: 0.8,
            ),
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              _buildRatingChip('Bất kỳ', 'any', isDark),
              const SizedBox(width: 12),
              _buildRatingChip('4.0 ★ +', '4.0', isDark),
              const SizedBox(width: 12),
              _buildRatingChip('4.5 ★ +', '4.5', isDark),
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
    required bool isDark,
  }) {
    return TextField(
      controller: controller,
      keyboardType: TextInputType.number,
      style: TextStyle(
        fontSize: 14,
        color: isDark ? Colors.white : AppColors.textSecondary,
      ),
      decoration: InputDecoration(
        hintText: hint,
        hintStyle: TextStyle(
          color: isDark ? Colors.grey.shade500 : AppColors.textHint,
        ),
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
        fillColor: isDark ? const Color(0xFF0F172A) : AppColors.bgCard,
        contentPadding: const EdgeInsets.symmetric(
          horizontal: 12,
          vertical: 12,
        ),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: isDark ? Colors.white12 : AppColors.border),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: isDark ? Colors.white12 : AppColors.border),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.primary),
        ),
      ),
    );
  }

  Widget _buildRatingChip(String label, String value, bool isDark) {
    final bool isSelected = _minRating == value;
    return GestureDetector(
      onTap: () => setState(() => _minRating = value),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        decoration: BoxDecoration(
          color: isSelected
              ? (isDark ? AppColors.primary.withValues(alpha: 0.2) : AppColors.primaryLight)
              : (isDark ? const Color(0xFF0F172A) : Colors.white),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected
                ? AppColors.primary
                : (isDark ? Colors.white12 : AppColors.border),
            width: isSelected ? 1.5 : 1,
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.bold,
            color: isSelected
                ? (isDark ? const Color(0xFF2DD4BF) : AppColors.primary)
                : (isDark ? Colors.grey.shade300 : AppColors.textSecondary),
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
