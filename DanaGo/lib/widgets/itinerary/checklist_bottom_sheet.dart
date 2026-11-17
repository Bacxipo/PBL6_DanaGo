import 'package:flutter/material.dart';
import 'package:smarttrip/models/itinerary_model.dart';
import 'package:smarttrip/services/itinerary_service.dart';
import 'package:smarttrip/theme/app_colors.dart';

class ChecklistBottomSheet extends StatefulWidget {
  final Itinerary? itinerary;

  const ChecklistBottomSheet({super.key, this.itinerary});

  @override
  State<ChecklistBottomSheet> createState() => _ChecklistBottomSheetState();
}

class _ChecklistBottomSheetState extends State<ChecklistBottomSheet> {
  final TextEditingController _itemController = TextEditingController();
  String _filter = 'all'; // 'all' | 'pending' | 'completed'
  bool _isLoading = true;
  bool _isSubmitting = false;
  List<ItineraryChecklistItem> _items = [];
  int? _selectedItineraryItemId;

  List<ItineraryPlace> get _availablePlaces {
    final it = widget.itinerary;
    if (it == null) return [];
    final list = <ItineraryPlace>[];
    for (final day in it.days) {
      for (final p in day.places) {
        if (p.itemId != null) {
          list.add(p);
        }
      }
    }
    return list;
  }

  @override
  void initState() {
    super.initState();
    final places = _availablePlaces;
    if (places.isNotEmpty) {
      _selectedItineraryItemId = places.first.itemId;
    }
    _loadChecklists();
  }

  @override
  void dispose() {
    _itemController.dispose();
    super.dispose();
  }

  Future<void> _loadChecklists() async {
    final itineraryId = widget.itinerary?.dbId;
    if (itineraryId == null) {
      setState(() {
        _items = [];
        _isLoading = false;
      });
      return;
    }

    setState(() => _isLoading = true);
    final fetched = await ItineraryService.instance.getChecklistsByItinerary(
      itineraryId,
    );
    if (mounted) {
      setState(() {
        _items = fetched;
        _isLoading = false;
      });
    }
  }

  Future<void> _addItem() async {
    final text = _itemController.text.trim();
    if (text.isEmpty || _isSubmitting) return;

    final targetItemId = _selectedItineraryItemId;
    if (targetItemId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text(
            'Hãy thêm ít nhất 1 điểm đến và bấm Lưu trước khi thêm Checklist.',
          ),
          behavior: SnackBarBehavior.floating,
        ),
      );
      return;
    }

    setState(() => _isSubmitting = true);
    String? tagName;
    for (final p in _availablePlaces) {
      if (p.itemId == targetItemId) {
        tagName = p.name;
        break;
      }
    }

    final created = await ItineraryService.instance.createChecklistItem(
      targetItemId,
      text,
      isChecked: false,
      activityTag: tagName,
    );

    if (mounted) {
      setState(() {
        _isSubmitting = false;
        if (created != null) {
          _items.insert(0, created);
          _itemController.clear();
        }
      });
    }
  }

  Future<void> _toggleItem(ItineraryChecklistItem item, bool checked) async {
    setState(() => item.isChecked = checked);
    if (item.id != null) {
      final ok = await ItineraryService.instance.updateChecklistItem(
        item.id!,
        isChecked: checked,
      );
      if (!ok && mounted) {
        setState(() => item.isChecked = !checked);
      }
    }
  }

  Future<void> _deleteItem(ItineraryChecklistItem item) async {
    setState(() {
      _items.remove(item);
    });
    if (item.id != null) {
      await ItineraryService.instance.deleteChecklistItem(item.id!);
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final places = _availablePlaces;

    final total = _items.length;
    final completed = _items.where((i) => i.isChecked).length;
    final percent = total > 0 ? (completed / total) : 0.0;

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
          // 1. Header
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

          // 2. Progress bar
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
                    backgroundColor:
                        isDark ? Colors.white12 : Colors.teal.shade100,
                    valueColor: const AlwaysStoppedAnimation<Color>(
                      AppColors.primary,
                    ),
                  ),
                ),
              ],
            ),
          ),

          // 3. Chọn điểm đến gắn checklist + Ô thêm nhanh
          if (places.isNotEmpty)
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 10, 16, 0),
              child: DropdownButtonFormField<int>(
                value: _selectedItineraryItemId,
                isExpanded: true,
                decoration: InputDecoration(
                  labelText: 'Gắn với điểm đến',
                  labelStyle: TextStyle(
                    fontSize: 12,
                    color: isDark ? Colors.white70 : AppColors.textSecondary,
                  ),
                  filled: true,
                  fillColor:
                      isDark ? const Color(0xFF0F172A) : const Color(0xFFF8FAFC),
                  contentPadding: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 8,
                  ),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide(
                      color: isDark ? Colors.white12 : Colors.grey.shade200,
                    ),
                  ),
                ),
                items: places
                    .map(
                      (p) => DropdownMenuItem<int>(
                        value: p.itemId,
                        child: Text(
                          p.name,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(fontSize: 13),
                        ),
                      ),
                    )
                    .toList(),
                onChanged: (val) =>
                    setState(() => _selectedItineraryItemId = val),
              ),
            ),

          Padding(
            padding: const EdgeInsets.fromLTRB(16, 10, 16, 8),
            child: Row(
              children: [
                Expanded(
                  child: Container(
                    decoration: BoxDecoration(
                      color: isDark
                          ? const Color(0xFF0F172A)
                          : const Color(0xFFF8FAFC),
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
                  onPressed: _isSubmitting ? null : _addItem,
                  style: IconButton.styleFrom(
                    backgroundColor: AppColors.primary,
                  ),
                  icon: _isSubmitting
                      ? const SizedBox(
                          width: 18,
                          height: 18,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            color: Colors.white,
                          ),
                        )
                      : const Icon(Icons.add_rounded, color: Colors.white),
                ),
              ],
            ),
          ),

          // 4. Filter tabs
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
            child: Row(
              children: [
                _buildFilterChip('all', 'Tất cả ($total)', isDark),
                const SizedBox(width: 8),
                _buildFilterChip(
                  'pending',
                  'Cần mang (${total - completed})',
                  isDark,
                ),
                const SizedBox(width: 8),
                _buildFilterChip('completed', 'Đã mang ($completed)', isDark),
              ],
            ),
          ),
          Divider(
            height: 16,
            color: isDark ? Colors.white12 : AppColors.divider,
          ),

          // 5. Checklist list
          Expanded(
            child: _isLoading
                ? const Center(
                    child: CircularProgressIndicator(color: AppColors.primary),
                  )
                : filteredItems.isEmpty
                    ? Center(
                        child: Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 24),
                          child: Text(
                            places.isEmpty
                                ? 'Hãy thêm điểm đến và bấm Lưu để quản lý checklist cho chuyến đi.'
                                : 'Chưa có vật dụng nào trong mục này.',
                            textAlign: TextAlign.center,
                            style: const TextStyle(color: Colors.grey),
                          ),
                        ),
                      )
                    : ListView.separated(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 16,
                          vertical: 6,
                        ),
                        itemCount: filteredItems.length,
                        separatorBuilder: (_, __) => const SizedBox(height: 6),
                        itemBuilder: (context, index) {
                          final item = filteredItems[index];
                          return Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 10,
                              vertical: 6,
                            ),
                            decoration: BoxDecoration(
                              color: item.isChecked
                                  ? (isDark
                                      ? const Color(0xFF0F172A)
                                      : const Color(0xFFF8FAFC))
                                  : (isDark
                                      ? const Color(0xFF1E293B)
                                      : Colors.white),
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(
                                color: isDark
                                    ? Colors.white12
                                    : Colors.grey.shade100,
                              ),
                            ),
                            child: Row(
                              children: [
                                Checkbox(
                                  value: item.isChecked,
                                  activeColor: AppColors.primary,
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(6),
                                  ),
                                  onChanged: (val) =>
                                      _toggleItem(item, val ?? false),
                                ),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        item.itemName,
                                        style: TextStyle(
                                          fontSize: 13,
                                          fontWeight: FontWeight.w600,
                                          color: item.isChecked
                                              ? Colors.grey
                                              : (isDark
                                                  ? Colors.white
                                                  : const Color(0xFF1E293B)),
                                          decoration: item.isChecked
                                              ? TextDecoration.lineThrough
                                              : null,
                                        ),
                                      ),
                                      if (item.activityTag != null &&
                                          item.activityTag!.isNotEmpty)
                                        Container(
                                          margin: const EdgeInsets.only(top: 2),
                                          padding: const EdgeInsets.symmetric(
                                            horizontal: 6,
                                            vertical: 1,
                                          ),
                                          decoration: BoxDecoration(
                                            color: isDark
                                                ? AppColors.primary
                                                    .withValues(alpha: 0.15)
                                                : Colors.teal.shade50,
                                            borderRadius:
                                                BorderRadius.circular(6),
                                          ),
                                          child: Text(
                                            item.activityTag!,
                                            style: TextStyle(
                                              fontSize: 10,
                                              color: isDark
                                                  ? const Color(0xFF2DD4BF)
                                                  : Colors.teal.shade800,
                                              fontWeight: FontWeight.bold,
                                            ),
                                          ),
                                        ),
                                    ],
                                  ),
                                ),
                                IconButton(
                                  onPressed: () => _deleteItem(item),
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
