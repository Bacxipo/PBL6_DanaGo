import 'package:flutter/material.dart';
import 'package:smarttrip/models/ai_plan_model.dart';
import 'package:smarttrip/services/ai_service.dart';
import 'package:smarttrip/theme/app_colors.dart';

class SelectLodgingSheet extends StatefulWidget {
  final String? currentRegion;
  final int? budgetPp;
  final AiPlanLodging? initialSelected;

  const SelectLodgingSheet({
    super.key,
    this.currentRegion,
    this.budgetPp,
    this.initialSelected,
  });

  @override
  State<SelectLodgingSheet> createState() => _SelectLodgingSheetState();
}

class _SelectLodgingSheetState extends State<SelectLodgingSheet> {
  final TextEditingController _searchCtrl = TextEditingController();
  List<AiPlanLodging> _lodgings = [];
  AiPlanLodging? _selectedLodging;
  String _selectedType = 'ALL';
  bool _isLoading = true;
  String? _errorMessage;

  final List<String> _types = [
    'ALL',
    'Khách sạn',
    'Homestay',
    'Villa',
    'Nhà nghỉ',
  ];

  @override
  void initState() {
    super.initState();
    _selectedLodging = widget.initialSelected;
    _fetchLodgings();
  }

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  String _formatVND(int amount) {
    final str = amount.toString();
    final buffer = StringBuffer();
    int count = 0;
    for (int i = str.length - 1; i >= 0; i--) {
      buffer.write(str[i]);
      count++;
      if (count % 3 == 0 && i > 0) {
        buffer.write('.');
      }
    }
    return '${buffer.toString().split('').reversed.join()} đ';
  }

  Future<void> _fetchLodgings() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });
    try {
      final list = await AiService.instance.getLodgings(
        region: widget.currentRegion,
        type: _selectedType == 'ALL' ? null : _selectedType,
        budgetPp: widget.budgetPp,
      );
      if (mounted) {
        setState(() {
          _lodgings = list;
          _isLoading = false;
        });
      }
    } catch (err) {
      if (mounted) {
        setState(() {
          _errorMessage = err.toString();
          _isLoading = false;
        });
      }
    }
  }

  List<AiPlanLodging> get _filteredLodgings {
    final query = _searchCtrl.text.trim().toLowerCase();
    return _lodgings.where((l) {
      final matchQuery = query.isEmpty ||
          l.name.toLowerCase().contains(query) ||
          (l.district != null && l.district!.toLowerCase().contains(query));
      final matchType = _selectedType == 'ALL' || l.type == _selectedType;
      return matchQuery && matchType;
    }).toList();
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
                        'Chọn Nơi Lưu Trú Mong Muốn',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        'AI sẽ sắp xếp lịch trình tối ưu theo điểm lưu trú này',
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
                hintText: 'Tìm kiếm nơi ở theo tên, quận huyện...',
                hintStyle: const TextStyle(fontSize: 13, color: Colors.grey),
                prefixIcon: const Icon(Icons.search, size: 20, color: Colors.purple),
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

          // Type Chips
          SizedBox(
            height: 38,
            child: ListView.separated(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              scrollDirection: Axis.horizontal,
              itemCount: _types.length,
              separatorBuilder: (_, __) => const SizedBox(width: 8),
              itemBuilder: (context, i) {
                final type = _types[i];
                final isSelected = type == _selectedType;
                return ChoiceChip(
                  label: Text(
                    type == 'ALL' ? 'Tất cả' : type,
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                      color: isSelected ? Colors.white : (isDark ? Colors.grey[300] : Colors.black87),
                    ),
                  ),
                  selected: isSelected,
                  selectedColor: Colors.purple,
                  backgroundColor: isDark ? Colors.grey[800] : Colors.grey[200],
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                  side: BorderSide.none,
                  onSelected: (_) {
                    setState(() => _selectedType = type);
                    _fetchLodgings();
                  },
                );
              },
            ),
          ),

          const SizedBox(height: 8),

          // Lodging List
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator(color: Colors.purple))
                : _errorMessage != null
                    ? Center(
                        child: Padding(
                          padding: const EdgeInsets.all(24),
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              const Icon(Icons.error_outline_rounded, size: 40, color: Colors.red),
                              const SizedBox(height: 8),
                              Text(
                                _errorMessage!,
                                textAlign: TextAlign.center,
                                style: const TextStyle(fontSize: 12, color: Colors.red),
                              ),
                              const SizedBox(height: 12),
                              ElevatedButton(
                                onPressed: _fetchLodgings,
                                child: const Text('Thử lại'),
                              ),
                            ],
                          ),
                        ),
                      )
                    : _filteredLodgings.isEmpty
                        ? Center(
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(Icons.hotel_outlined, size: 48, color: Colors.grey[400]),
                                const SizedBox(height: 8),
                                Text(
                                  'Không tìm thấy nơi lưu trú phù hợp',
                                  style: TextStyle(color: Colors.grey[500], fontSize: 13),
                                ),
                              ],
                            ),
                          )
                        : ListView.builder(
                            padding: const EdgeInsets.fromLTRB(16, 4, 16, 16),
                            itemCount: _filteredLodgings.length,
                            itemBuilder: (context, idx) {
                              final lo = _filteredLodgings[idx];
                              final isSelected = _selectedLodging?.id == lo.id;

                              return Container(
                                margin: const EdgeInsets.only(bottom: 10),
                                decoration: BoxDecoration(
                                  color: isDark ? Colors.grey[850] : Colors.white,
                                  borderRadius: BorderRadius.circular(16),
                                  border: Border.all(
                                    color: isSelected
                                        ? Colors.purple
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
                                  onTap: () {
                                    setState(() {
                                      if (isSelected) {
                                        _selectedLodging = null;
                                      } else {
                                        _selectedLodging = lo;
                                      }
                                    });
                                  },
                                  child: Padding(
                                    padding: const EdgeInsets.all(12),
                                    child: Row(
                                      children: [
                                        // Icon avatar
                                        Container(
                                          width: 48,
                                          height: 48,
                                          decoration: BoxDecoration(
                                            color: Colors.purple.withValues(alpha: 0.1),
                                            borderRadius: BorderRadius.circular(12),
                                          ),
                                          child: const Icon(
                                            Icons.hotel_rounded,
                                            color: Colors.purple,
                                            size: 26,
                                          ),
                                        ),
                                        const SizedBox(width: 12),

                                        // Details
                                        Expanded(
                                          child: Column(
                                            crossAxisAlignment: CrossAxisAlignment.start,
                                            children: [
                                              Text(
                                                lo.name,
                                                style: const TextStyle(
                                                  fontSize: 14,
                                                  fontWeight: FontWeight.bold,
                                                ),
                                                maxLines: 1,
                                                overflow: TextOverflow.ellipsis,
                                              ),
                                              const SizedBox(height: 3),
                                              Row(
                                                children: [
                                                  if (lo.district != null && lo.district!.isNotEmpty) ...[
                                                    Icon(Icons.location_on_rounded, size: 12, color: Colors.grey[500]),
                                                    const SizedBox(width: 2),
                                                    Flexible(
                                                      child: Text(
                                                        lo.district!,
                                                        style: TextStyle(fontSize: 11, color: Colors.grey[500]),
                                                        maxLines: 1,
                                                        overflow: TextOverflow.ellipsis,
                                                      ),
                                                    ),
                                                    const SizedBox(width: 6),
                                                  ],
                                                  if (lo.avgRating > 0) ...[
                                                    const Icon(Icons.star_rounded, size: 13, color: Colors.amber),
                                                    const SizedBox(width: 2),
                                                    Text(
                                                      lo.avgRating.toStringAsFixed(1),
                                                      style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold),
                                                    ),
                                                  ],
                                                ],
                                              ),
                                              const SizedBox(height: 4),
                                              Row(
                                                children: [
                                                  if (lo.type != null) ...[
                                                    Container(
                                                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1.5),
                                                      decoration: BoxDecoration(
                                                        color: Colors.grey.withValues(alpha: 0.15),
                                                        borderRadius: BorderRadius.circular(4),
                                                      ),
                                                      child: Text(
                                                        lo.type!,
                                                        style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w600),
                                                      ),
                                                    ),
                                                    const SizedBox(width: 8),
                                                  ],
                                                  Text(
                                                    '${_formatVND(lo.pricePerNight)} / đêm',
                                                    style: const TextStyle(
                                                      fontSize: 12,
                                                      fontWeight: FontWeight.bold,
                                                      color: Colors.deepOrange,
                                                    ),
                                                  ),
                                                ],
                                              ),
                                            ],
                                          ),
                                        ),

                                        // Radio indicator
                                        Radio<int>(
                                          value: lo.id,
                                          groupValue: _selectedLodging?.id,
                                          activeColor: Colors.purple,
                                          onChanged: (_) {
                                            setState(() => _selectedLodging = lo);
                                          },
                                        ),
                                      ],
                                    ),
                                  ),
                                ),
                              );
                            },
                          ),
          ),

          // Bottom Bar
          Container(
            padding: const EdgeInsets.fromLTRB(20, 12, 20, 24),
            decoration: BoxDecoration(
              color: isDark ? Colors.grey[900] : Colors.white,
              border: Border(top: BorderSide(color: isDark ? Colors.grey[800]! : Colors.grey[200]!)),
            ),
            child: Row(
              children: [
                OutlinedButton(
                  onPressed: () {
                    Navigator.pop(context, 'CLEAR');
                  },
                  style: OutlinedButton.styleFrom(
                    foregroundColor: Colors.grey[600],
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  ),
                  child: const Text('Tự động / Xóa', style: TextStyle(fontSize: 12)),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: ElevatedButton(
                    onPressed: () {
                      Navigator.pop(context, _selectedLodging);
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.purple,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                      padding: const EdgeInsets.symmetric(vertical: 12),
                    ),
                    child: Text(
                      _selectedLodging != null ? 'Chọn nơi này' : 'Để AI tự chọn',
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                    ),
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

