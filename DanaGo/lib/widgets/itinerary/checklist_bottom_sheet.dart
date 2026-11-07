import 'package:flutter/material.dart';
import 'package:smarttrip/theme/app_colors.dart';

// Model vật dụng cần chuẩn bị
class ChecklistItem {
  final String id;
  String title;
  bool isChecked;
  String? activityTag;

  ChecklistItem({
    required this.id,
    required this.title,
    this.isChecked = false,
    this.activityTag,
  });
}

class ChecklistBottomSheet extends StatefulWidget {
  const ChecklistBottomSheet({super.key});

  @override
  State<ChecklistBottomSheet> createState() => _ChecklistBottomSheetState();
}

class _ChecklistBottomSheetState extends State<ChecklistBottomSheet> {
  final TextEditingController _itemController = TextEditingController();
  String _filter = 'all'; // 'all' | 'pending' | 'completed'

  // Danh sách vật dụng mẫu thông minh cho chuyến đi Đà Nẵng
  final List<ChecklistItem> _items = [
    ChecklistItem(
      id: '1',
      title: 'CCCD / Hộ chiếu & Vé máy bay',
      isChecked: true,
      activityTag: 'Khởi hành',
    ),
    ChecklistItem(
      id: '2',
      title: 'Đồ bơi & Kính bơi',
      isChecked: false,
      activityTag: 'Bãi biển Mỹ Khê',
    ),
    ChecklistItem(
      id: '3',
      title: 'Kem chống nắng SPF 50+',
      isChecked: false,
      activityTag: 'Bán đảo Sơn Trà',
    ),
    ChecklistItem(
      id: '4',
      title: 'Áo khoác mỏng / Khăn quàng',
      isChecked: false,
      activityTag: 'Bà Nà Hills',
    ),
    ChecklistItem(
      id: '5',
      title: 'Sạc dự phòng 10.000mAh',
      isChecked: true,
      activityTag: 'Chung',
    ),
    ChecklistItem(
      id: '6',
      title: 'Thuốc say xe & Thuốc tiêu hóa',
      isChecked: false,
      activityTag: 'Chung',
    ),
  ];

  @override
  void dispose() {
    _itemController.dispose();
    super.dispose();
  }

  void _addItem() {
    final text = _itemController.text.trim();
    if (text.isEmpty) return;

    setState(() {
      _items.insert(
        0,
        ChecklistItem(
          id: DateTime.now().millisecondsSinceEpoch.toString(),
          title: text,
          isChecked: false,
          activityTag: 'Tự thêm',
        ),
      );
      _itemController.clear();
    });
  }

  void _deleteItem(String id) {
    setState(() {
      _items.removeWhere((i) => i.id == id);
    });
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    // Tính toán tiến độ
    final total = _items.length;
    final completed = _items.where((i) => i.isChecked).length;
    final percent = total > 0 ? (completed / total) : 0.0;

    // Lọc danh sách theo Tab
    final filteredItems = _items.where((item) {
      if (_filter == 'pending') return !item.isChecked;
      if (_filter == 'completed') return item.isChecked;
      return true;
    }).toList();

    return Container(
      height: MediaQuery.of(context).size.height * 0.82,
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
      ),
      child: Column(
        children: [
          // 1. HEADER GRADIENT SAO Y BẢN WEB
          Container(
            padding: const EdgeInsets.fromLTRB(20, 16, 16, 16),
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                colors: [Color(0xFF004E54), Color(0xFF006971)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Row(
                  children: [
                    Icon(
                      Icons.checklist_rounded,
                      color: Colors.amberAccent,
                      size: 24,
                    ),
                    SizedBox(width: 10),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Checklist Hành Lý',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 17,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        Text(
                          'Chuẩn bị vật dụng cho chuyến đi',
                          style: TextStyle(color: Colors.white70, fontSize: 11),
                        ),
                      ],
                    ),
                  ],
                ),
                IconButton(
                  onPressed: () => Navigator.pop(context),
                  icon: const Icon(Icons.close_rounded, color: Colors.white),
                ),
              ],
            ),
          ),

          // 2. THANH TIẾN ĐỘ CHUẨN BỊ (PROGRESS BAR)
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
            color: isDark ? const Color(0xFF0F172A) : const Color(0xFFF0FDFA),
            child: Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        const Icon(
                          Icons.check_circle_rounded,
                          color: Color(0xFF059669),
                          size: 16,
                        ),
                        const SizedBox(width: 6),
                        Text(
                          'Tiến độ chuẩn bị:',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                            color: isDark ? Colors.white : Colors.black87,
                          ),
                        ),
                      ],
                    ),
                    Text(
                      '$completed/$total (${(percent * 100).toInt()}%)',
                      style: const TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        color: AppColors.primary,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                ClipRRect(
                  borderRadius: BorderRadius.circular(10),
                  child: LinearProgressIndicator(
                    value: percent,
                    minHeight: 6,
                    backgroundColor: isDark ? Colors.white12 : Colors.teal.shade100,
                    valueColor: const AlwaysStoppedAnimation<Color>(
                      AppColors.primary,
                    ),
                  ),
                ),
              ],
            ),
          ),

          // 3. Ô THÊM NHANH VẬT DỤNG
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
            child: Row(
              children: [
                Expanded(
                  child: Container(
                    decoration: BoxDecoration(
                      color: isDark ? const Color(0xFF0F172A) : const Color(0xFFF8FAFC),
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(
                        color: isDark ? Colors.white12 : Colors.grey.shade200,
                      ),
                    ),
                    padding: const EdgeInsets.symmetric(horizontal: 14),
                    child: TextField(
                      controller: _itemController,
                      style: TextStyle(
                        fontSize: 13,
                        color: isDark ? Colors.white : AppColors.textPrimary,
                      ),
                      onSubmitted: (_) => _addItem(),
                      decoration: InputDecoration(
                        hintText: 'Thêm đồ cần mang (VD: Áo mưa, dép lào...)',
                        hintStyle: TextStyle(
                          fontSize: 12,
                          color: isDark ? Colors.grey.shade500 : Colors.grey,
                        ),
                        border: InputBorder.none,
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                IconButton.filled(
                  onPressed: _addItem,
                  style: IconButton.styleFrom(
                    backgroundColor: AppColors.primary,
                  ),
                  icon: const Icon(Icons.add_rounded, color: Colors.white),
                ),
              ],
            ),
          ),

          // 4. BA TAB LỌC (TẤT CẢ, CẦN MANG, ĐÃ CHUẨN BỊ)
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
            child: Row(
              children: [
                _buildFilterChip('all', 'Tất cả ($total)', isDark),
                const SizedBox(width: 8),
                _buildFilterChip('pending', 'Cần mang (${total - completed})', isDark),
                const SizedBox(width: 8),
                _buildFilterChip('completed', 'Đã mang ($completed)', isDark),
              ],
            ),
          ),
          Divider(height: 16, color: isDark ? Colors.white12 : AppColors.divider),

          // 5. DANH SÁCH CHECKLIST CÓ THỂ CUỘN
          Expanded(
            child: filteredItems.isEmpty
                ? const Center(
                    child: Text(
                      'Không có vật dụng nào trong mục này.',
                      style: TextStyle(color: Colors.grey),
                    ),
                  )
                : ListView.separated(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 6,
                    ),
                    itemCount: filteredItems.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 4),
                    itemBuilder: (context, index) {
                      final item = filteredItems[index];
                      return Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 10,
                          vertical: 6,
                        ),
                        decoration: BoxDecoration(
                          color: item.isChecked
                              ? (isDark ? const Color(0xFF0F172A) : const Color(0xFFF8FAFC))
                              : (isDark ? const Color(0xFF1E293B) : Colors.white),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: isDark ? Colors.white12 : Colors.grey.shade100,
                          ),
                        ),
                        child: Row(
                          children: [
                            // Checkbox
                            Checkbox(
                              value: item.isChecked,
                              activeColor: AppColors.primary,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(6),
                              ),
                              onChanged: (val) {
                                setState(() {
                                  item.isChecked = val ?? false;
                                });
                              },
                            ),
                            // Tiêu đề vật dụng & Tag địa điểm
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    item.title,
                                    style: TextStyle(
                                      fontSize: 13,
                                      fontWeight: FontWeight.w600,
                                      color: item.isChecked
                                          ? Colors.grey
                                          : (isDark ? Colors.white : const Color(0xFF1E293B)),
                                      decoration: item.isChecked
                                          ? TextDecoration.lineThrough
                                          : null,
                                    ),
                                  ),
                                  if (item.activityTag != null)
                                    Container(
                                      margin: const EdgeInsets.only(top: 2),
                                      padding: const EdgeInsets.symmetric(
                                        horizontal: 6,
                                        vertical: 1,
                                      ),
                                      decoration: BoxDecoration(
                                        color: isDark
                                            ? AppColors.primary.withValues(alpha: 0.15)
                                            : Colors.teal.shade50,
                                        borderRadius: BorderRadius.circular(6),
                                      ),
                                      child: Text(
                                        item.activityTag!,
                                        style: TextStyle(
                                          fontSize: 10,
                                          color: isDark ? const Color(0xFF2DD4BF) : Colors.teal.shade800,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                    ),
                                ],
                              ),
                            ),
                            // Nút xóa
                            IconButton(
                              onPressed: () => _deleteItem(item.id),
                              icon: const Icon(
                                Icons.delete_outline_rounded,
                                size: 18,
                                color: Colors.grey,
                              ),
                            ),
                          ],
                        ),
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterChip(String key, String label, bool isDark) {
    final isSelected = _filter == key;
    return GestureDetector(
      onTap: () => setState(() => _filter = key),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
        decoration: BoxDecoration(
          color: isSelected
              ? AppColors.primary
              : (isDark ? const Color(0xFF0F172A) : Colors.grey.shade100),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isSelected
                ? AppColors.primary
                : (isDark ? Colors.white12 : Colors.transparent),
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.bold,
            color: isSelected
                ? Colors.white
                : (isDark ? Colors.grey.shade400 : Colors.grey.shade700),
          ),
        ),
      ),
    );
  }
}
