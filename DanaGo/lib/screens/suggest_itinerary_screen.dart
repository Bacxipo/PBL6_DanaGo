import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:smarttrip/models/ai_plan_model.dart';
import 'package:smarttrip/models/destination_item.dart';
import 'package:smarttrip/services/ai_service.dart';
import 'package:smarttrip/theme/app_colors.dart';
import 'package:smarttrip/widgets/ai_plan/ai_plan_map_view.dart';
import 'package:smarttrip/widgets/ai_plan/plan_result_view.dart';
import 'package:smarttrip/widgets/ai_plan/select_lodging_sheet.dart';
import 'package:smarttrip/widgets/ai_plan/select_places_sheet.dart';

class SuggestItineraryScreen extends StatefulWidget {
  const SuggestItineraryScreen({super.key});

  @override
  State<SuggestItineraryScreen> createState() => _SuggestItineraryScreenState();
}

class _SuggestItineraryScreenState extends State<SuggestItineraryScreen> {
  // 1. Form States
  final TextEditingController _destinationCtrl =
      TextEditingController(text: 'Đà Nẵng');

  late DateTime _startDate;
  late DateTime _endDate;
  int _numDays = 3;

  double _budget = 4200000; // VND
  final Set<String> _selectedInterests = {'Văn hóa & lịch sử'};
  String _selectedRegion = '';

  List<DestinationItem> _selectedPlaces = [];
  AiPlanLodging? _selectedLodging;

  bool _includeMeals = true;
  bool _includeLodging = true;
  int _guestsPerRoom = 2;

  // 2. State & Result
  bool _isLoadingPlan = false;
  String? _errorMessage;
  AiPlanResult? _planResult;

  // View mode when plan is generated: 'map' or 'timeline'
  String _resultViewMode = 'timeline';

  final List<Map<String, dynamic>> _styleOptions = [
    {
      'id': 'Văn hóa & lịch sử',
      'label': 'Đậm văn hóa & Bản địa',
      'icon': '🏛️',
    },
    {
      'id': 'Biển & đảo',
      'label': 'Nghỉ dưỡng biển & Đảo',
      'icon': '🌊',
    },
    {
      'id': 'Ẩm thực',
      'label': 'Khám phá ẩm thực địa phương',
      'icon': '🍜',
    },
    {
      'id': 'Thiên nhiên & khám phá',
      'label': 'Thiên nhiên sinh thái & Suối thác',
      'icon': '🌲',
    },
    {
      'id': 'Vui chơi & check-in',
      'label': 'Vui chơi giải trí & Check-in',
      'icon': '🎡',
    },
  ];

  final List<Map<String, String>> _regionOptions = [
    {'value': '', 'label': 'Tất cả khu vực (AI tự cân đối)'},
    {'value': 'Đà Nẵng nội thành', 'label': 'Đà Nẵng nội thành (Sơn Trà, Hải Châu)'},
    {'value': 'Hội An - Điện Bàn', 'label': 'Hội An - Điện Bàn (Phố Cổ, Biển An Bàng)'},
    {'value': 'Hòa Vang - Bà Nà', 'label': 'Hòa Vang - Bà Nà (Bà Nà Hills, Thần Tài)'},
    {'value': 'Cù Lao Chàm', 'label': 'Cù Lao Chàm (Lặn biển & Khám phá đảo)'},
    {'value': 'Duy Xuyên - Mỹ Sơn', 'label': 'Duy Xuyên - Mỹ Sơn (Thánh địa Mỹ Sơn)'},
    {'value': 'Nam Quảng Nam', 'label': 'Nam Quảng Nam (Tam Kỳ, Bích Họa)'},
  ];

  @override
  void initState() {
    super.initState();
    final now = DateTime.now();
    _startDate = DateTime(now.year, now.month, now.day);
    _endDate = _startDate.add(const Duration(days: 2));
    _calcNumDays();
  }

  @override
  void dispose() {
    _destinationCtrl.dispose();
    super.dispose();
  }

  void _calcNumDays() {
    final diff = _endDate.difference(_startDate).inDays + 1;
    _numDays = diff.clamp(1, 7);
  }

  String _formatDate(DateTime d) {
    final day = d.day.toString().padLeft(2, '0');
    final month = d.month.toString().padLeft(2, '0');
    return '$day/$month/${d.year}';
  }

  String _formatDateApi(DateTime d) {
    final day = d.day.toString().padLeft(2, '0');
    final month = d.month.toString().padLeft(2, '0');
    return '${d.year}-$month-$day';
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
    return '${buffer.toString().split('').reversed.join()} VND';
  }

  void _toggleInterest(String id) {
    setState(() {
      if (_selectedInterests.contains(id)) {
        if (_selectedInterests.length > 1) {
          _selectedInterests.remove(id);
        }
      } else {
        _selectedInterests.add(id);
        if (id == 'Ẩm thực') {
          _includeMeals = true;
        }
      }
    });
  }

  Future<void> _pickStartDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: _startDate,
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 365)),
    );
    if (picked != null) {
      setState(() {
        _startDate = picked;
        if (_endDate.isBefore(_startDate)) {
          _endDate = _startDate.add(const Duration(days: 2));
        }
        _calcNumDays();
      });
    }
  }

  Future<void> _pickEndDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: _endDate,
      firstDate: _startDate,
      lastDate: _startDate.add(const Duration(days: 6)),
    );
    if (picked != null) {
      setState(() {
        _endDate = picked;
        _calcNumDays();
      });
    }
  }

  Future<void> _openSelectPlacesModal() async {
    final result = await showModalBottomSheet<List<DestinationItem>>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => SelectPlacesSheet(initialSelected: _selectedPlaces),
    );
    if (result != null) {
      setState(() => _selectedPlaces = result);
    }
  }

  Future<void> _openSelectLodgingModal() async {
    final result = await showModalBottomSheet<dynamic>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => SelectLodgingSheet(
        currentRegion: _selectedRegion,
        budgetPp: _budget.toInt(),
        initialSelected: _selectedLodging,
      ),
    );
    if (result == 'CLEAR') {
      setState(() => _selectedLodging = null);
    } else if (result is AiPlanLodging) {
      setState(() => _selectedLodging = result);
    }
  }

  void _resetAll() {
    final now = DateTime.now();
    setState(() {
      _startDate = DateTime(now.year, now.month, now.day);
      _endDate = _startDate.add(const Duration(days: 2));
      _calcNumDays();
      _budget = 4200000;
      _selectedInterests.clear();
      _selectedInterests.add('Văn hóa & lịch sử');
      _selectedRegion = '';
      _selectedPlaces.clear();
      _selectedLodging = null;
      _includeMeals = true;
      _includeLodging = true;
      _guestsPerRoom = 2;
      _planResult = null;
      _errorMessage = null;
    });
  }

  Future<void> _generatePlan() async {
    setState(() {
      _isLoadingPlan = true;
      _errorMessage = null;
    });
    HapticFeedback.mediumImpact();

    try {
      final nights = (_numDays - 1).clamp(0, 7);
      final lodgingIds = (_includeLodging && _selectedLodging != null)
          ? List.filled(nights, _selectedLodging!.id)
          : <int>[];

      final plan = await AiService.instance.generatePlan(
        numDays: _numDays,
        budgetPp: _budget.toInt(),
        interests: _selectedInterests.toList(),
        region: _selectedRegion,
        selectedIds: _selectedPlaces
            .map((p) => int.tryParse(p.id))
            .whereType<int>()
            .toList(),
        lodgingIds: lodgingIds,
        includeMeals: _includeMeals,
        includeLodging: _includeLodging,
        guestsPerRoom: _guestsPerRoom,
      );

      setState(() {
        _planResult = plan;
        _resultViewMode = 'timeline';
      });
    } catch (e) {
      setState(() {
        _errorMessage = e.toString().replaceFirst('Exception: ', '');
      });
    } finally {
      if (mounted) setState(() => _isLoadingPlan = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final nightsCount = (_numDays - 1).clamp(0, 7);

    return Scaffold(
      backgroundColor: theme.scaffoldBackgroundColor,
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'DanaGo AI Discovery',
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.bold,
                color: Colors.amber,
              ),
            ),
            Text(
              _planResult != null
                  ? 'Lịch Trình AI (${_numDays} Ngày)'
                  : 'Lập Lịch Trình Thông Minh',
              style: const TextStyle(
                fontSize: 17,
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
        actions: [
          if (_planResult != null)
            IconButton(
              icon: const Icon(Icons.edit_note_rounded),
              tooltip: 'Sửa thông tin',
              onPressed: () => setState(() => _planResult = null),
            )
          else
            IconButton(
              icon: const Icon(Icons.refresh_rounded),
              tooltip: 'Làm mới',
              onPressed: _resetAll,
            ),
        ],
        flexibleSpace: Container(
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              colors: [Color(0xFF004E54), Color(0xFF006971)],
            ),
          ),
        ),
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      body: _planResult != null
          ? _buildResultContainer(isDark)
          : _buildFormContainer(isDark, nightsCount),
    );
  }

  // ==================== RESULT CONTAINER ====================
  Widget _buildResultContainer(bool isDark) {
    return Column(
      children: [
        // Top Switcher Bar (Map vs Timeline)
        Container(
          margin: const EdgeInsets.fromLTRB(16, 12, 16, 8),
          padding: const EdgeInsets.all(4),
          decoration: BoxDecoration(
            color: isDark ? Colors.grey[850] : Colors.grey[200],
            borderRadius: BorderRadius.circular(16),
          ),
          child: Row(
            children: [
              Expanded(
                child: GestureDetector(
                  onTap: () => setState(() => _resultViewMode = 'timeline'),
                  child: Container(
                    padding: const EdgeInsets.symmetric(vertical: 8),
                    decoration: BoxDecoration(
                      color: _resultViewMode == 'timeline'
                          ? (isDark ? Colors.grey[750] : Colors.white)
                          : Colors.transparent,
                      borderRadius: BorderRadius.circular(12),
                      boxShadow: _resultViewMode == 'timeline'
                          ? [
                              BoxShadow(
                                color: Colors.black.withValues(alpha: 0.08),
                                blurRadius: 4,
                              ),
                            ]
                          : null,
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.list_alt_rounded,
                          size: 16,
                          color: _resultViewMode == 'timeline'
                              ? AppColors.primary
                              : Colors.grey,
                        ),
                        const SizedBox(width: 6),
                        Text(
                          'Lịch trình chi tiết',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                            color: _resultViewMode == 'timeline'
                                ? AppColors.primary
                                : Colors.grey,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
              Expanded(
                child: GestureDetector(
                  onTap: () => setState(() => _resultViewMode = 'map'),
                  child: Container(
                    padding: const EdgeInsets.symmetric(vertical: 8),
                    decoration: BoxDecoration(
                      color: _resultViewMode == 'map'
                          ? (isDark ? Colors.grey[750] : Colors.white)
                          : Colors.transparent,
                      borderRadius: BorderRadius.circular(12),
                      boxShadow: _resultViewMode == 'map'
                          ? [
                              BoxShadow(
                                color: Colors.black.withValues(alpha: 0.08),
                                blurRadius: 4,
                              ),
                            ]
                          : null,
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.map_rounded,
                          size: 16,
                          color: _resultViewMode == 'map'
                              ? AppColors.primary
                              : Colors.grey,
                        ),
                        const SizedBox(width: 6),
                        Text(
                          'Bản đồ lộ trình',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                            color: _resultViewMode == 'map'
                                ? AppColors.primary
                                : Colors.grey,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),

        // Result Content View
        Expanded(
          child: _resultViewMode == 'map'
              ? Padding(
                  padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
                  child: AiPlanMapView(
                    plan: _planResult,
                    selectedPlaces: _selectedPlaces,
                    selectedLodging: _selectedLodging,
                  ),
                )
              : PlanResultView(
                  plan: _planResult!,
                  startDateStr: _formatDateApi(_startDate),
                  endDateStr: _formatDateApi(_endDate),
                  includeMeals: _includeMeals,
                  includeLodging: _includeLodging,
                  onReset: () => setState(() => _planResult = null),
                ),
        ),
      ],
    );
  }

  // ==================== FORM CONTAINER ====================
  Widget _buildFormContainer(bool isDark, int nightsCount) {
    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 100),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // 1. Destination
          _buildSectionLabel('ĐIỂM ĐẾN (TỈNH / THÀNH PHỐ)'),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
            decoration: BoxDecoration(
              color: isDark ? Colors.grey[850] : Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(
                color: isDark ? Colors.grey[800]! : Colors.grey[200]!,
              ),
            ),
            child: Row(
              children: [
                const Icon(Icons.location_on_rounded,
                    color: AppColors.primary, size: 20),
                const SizedBox(width: 10),
                Expanded(
                  child: TextField(
                    controller: _destinationCtrl,
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 14,
                    ),
                    decoration: const InputDecoration(
                      border: InputBorder.none,
                      hintText: 'Nhập điểm đến...',
                    ),
                  ),
                ),
                Icon(Icons.explore_outlined, color: Colors.grey[400], size: 20),
              ],
            ),
          ),
          const SizedBox(height: 18),

          // 2. Dates
          _buildSectionLabel('THỜI GIAN CHUYẾN ĐI'),
          Row(
            children: [
              Expanded(
                child: GestureDetector(
                  onTap: _pickStartDate,
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 12, vertical: 12),
                    decoration: BoxDecoration(
                      color: isDark ? Colors.grey[850] : Colors.white,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(
                        color: isDark ? Colors.grey[800]! : Colors.grey[200]!,
                      ),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.calendar_today_rounded,
                            size: 14, color: AppColors.primary),
                        const SizedBox(width: 6),
                        Expanded(
                          child: Text(
                            _formatDate(_startDate),
                            style: const TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
              const Padding(
                padding: EdgeInsets.symmetric(horizontal: 6),
                child: Text('-', style: TextStyle(fontWeight: FontWeight.bold)),
              ),
              Expanded(
                child: GestureDetector(
                  onTap: _pickEndDate,
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 12, vertical: 12),
                    decoration: BoxDecoration(
                      color: isDark ? Colors.grey[850] : Colors.white,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(
                        color: isDark ? Colors.grey[800]! : Colors.grey[200]!,
                      ),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.event_available_rounded,
                            size: 14, color: AppColors.primary),
                        const SizedBox(width: 6),
                        Expanded(
                          child: Text(
                            _formatDate(_endDate),
                            style: const TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 10, vertical: 11),
                decoration: BoxDecoration(
                  color: Colors.teal.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: Colors.teal.withValues(alpha: 0.3)),
                ),
                child: Text(
                  '$_numDays Ngày ${nightsCount > 0 ? '$nightsCount Đêm' : ''}',
                  style: const TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                    color: AppColors.primary,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 18),

          // 3. Budget
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _buildSectionLabel('NGÂN SÁCH MỖI NGƯỜI'),
              Text(
                'Ước tính: ${_formatVND(_budget.toInt())}',
                style: const TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                  color: AppColors.primary,
                ),
              ),
            ],
          ),
          SliderTheme(
            data: SliderTheme.of(context).copyWith(
              activeTrackColor: AppColors.primary,
              inactiveTrackColor: Colors.grey.withValues(alpha: 0.25),
              thumbColor: AppColors.primary,
              trackHeight: 4,
            ),
            child: Slider(
              value: _budget,
              min: 1000000,
              max: 15000000,
              divisions: 70,
              onChanged: (val) => setState(() => _budget = val),
            ),
          ),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _buildBudgetPresetBtn('Tiết kiệm (2tr)', 2000000),
              _buildBudgetPresetBtn('Tiêu chuẩn (4.2tr)', 4200000),
              _buildBudgetPresetBtn('Cao cấp (9tr)', 9000000),
            ],
          ),
          const SizedBox(height: 18),

          // 4. Style & Interests
          _buildSectionLabel('CẢM XÚC & PHONG CÁCH'),
          Column(
            children: _styleOptions.map((st) {
              final isSelected = _selectedInterests.contains(st['id']);
              return GestureDetector(
                onTap: () => _toggleInterest(st['id']),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 150),
                  margin: const EdgeInsets.only(bottom: 8),
                  padding:
                      const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                  decoration: BoxDecoration(
                    color: isSelected
                        ? Colors.teal.withValues(alpha: 0.08)
                        : (isDark ? Colors.grey[850] : Colors.white),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(
                      color: isSelected
                          ? AppColors.primary
                          : (isDark ? Colors.grey[800]! : Colors.grey[200]!),
                      width: isSelected ? 1.5 : 1,
                    ),
                  ),
                  child: Row(
                    children: [
                      Text(st['icon'], style: const TextStyle(fontSize: 18)),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Text(
                          st['label'],
                          style: TextStyle(
                            fontSize: 13,
                            fontWeight: isSelected
                                ? FontWeight.bold
                                : FontWeight.normal,
                            color: isSelected
                                ? AppColors.primary
                                : (isDark ? Colors.grey[200] : Colors.grey[800]),
                          ),
                        ),
                      ),
                      Container(
                        width: 20,
                        height: 20,
                        decoration: BoxDecoration(
                          color: isSelected ? AppColors.primary : Colors.transparent,
                          borderRadius: BorderRadius.circular(6),
                          border: Border.all(
                            color: isSelected
                                ? AppColors.primary
                                : Colors.grey[400]!,
                          ),
                        ),
                        child: isSelected
                            ? const Icon(Icons.check,
                                color: Colors.white, size: 14)
                            : null,
                      ),
                    ],
                  ),
                ),
              );
            }).toList(),
          ),
          const SizedBox(height: 14),

          // 5. Region Dropdown
          _buildSectionLabel('KHU VỰC TRỌNG TÂM'),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
            decoration: BoxDecoration(
              color: isDark ? Colors.grey[850] : Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(
                color: isDark ? Colors.grey[800]! : Colors.grey[200]!,
              ),
            ),
            child: DropdownButtonHideUnderline(
              child: DropdownButton<String>(
                value: _selectedRegion,
                isExpanded: true,
                icon: const Icon(Icons.keyboard_arrow_down_rounded),
                items: _regionOptions.map((opt) {
                  return DropdownMenuItem<String>(
                    value: opt['value'],
                    child: Text(
                      opt['label']!,
                      style: const TextStyle(fontSize: 13),
                    ),
                  );
                }).toList(),
                onChanged: (val) {
                  if (val != null) setState(() => _selectedRegion = val);
                },
              ),
            ),
          ),
          const SizedBox(height: 18),

          // 6. Selected Places
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _buildSectionLabel(
                  'ĐIỂM THAM QUAN MONG MUỐN (${_selectedPlaces.length})'),
              InkWell(
                onTap: _openSelectPlacesModal,
                child: const Row(
                  children: [
                    Icon(Icons.add_rounded, size: 16, color: AppColors.primary),
                    SizedBox(width: 2),
                    Text(
                      'Chọn thêm',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        color: AppColors.primary,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          if (_selectedPlaces.isEmpty)
            GestureDetector(
              onTap: _openSelectPlacesModal,
              child: Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(
                    color: Colors.grey.withValues(alpha: 0.4),
                    style: BorderStyle.solid,
                  ),
                  color: isDark ? Colors.grey[850] : Colors.grey[50],
                ),
                child: Center(
                  child: Text(
                    'Chưa chọn điểm nào. Click để chọn địa điểm yêu thích!',
                    style: TextStyle(
                      fontSize: 12,
                      color: isDark ? Colors.grey[400] : Colors.grey[600],
                    ),
                  ),
                ),
              ),
            )
          else
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: _selectedPlaces.map((p) {
                return Chip(
                  label: Text(p.title, style: const TextStyle(fontSize: 11)),
                  deleteIcon: const Icon(Icons.close, size: 14),
                  onDeleted: () {
                    setState(() {
                      _selectedPlaces.removeWhere((item) => item.id == p.id);
                    });
                  },
                  backgroundColor: Colors.teal.withValues(alpha: 0.1),
                  side: BorderSide(color: Colors.teal.withValues(alpha: 0.3)),
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12)),
                );
              }).toList(),
            ),
          const SizedBox(height: 18),

          // 7. Lodging Section
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _buildSectionLabel('NƠI LƯU TRÚ MONG MUỐN'),
              if (_includeLodging)
                InkWell(
                  onTap: _openSelectLodgingModal,
                  child: Row(
                    children: [
                      const Icon(Icons.hotel_rounded,
                          size: 14, color: Colors.purple),
                      const SizedBox(width: 4),
                      Text(
                        _selectedLodging != null ? 'Đổi nơi ở' : 'Chọn nơi ở',
                        style: const TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: Colors.purple,
                        ),
                      ),
                    ],
                  ),
                ),
            ],
          ),
          CheckboxListTile(
            value: _includeLodging,
            contentPadding: EdgeInsets.zero,
            controlAffinity: ListTileControlAffinity.leading,
            activeColor: AppColors.primary,
            title: const Text(
              'Bao gồm nơi lưu trú trong lịch trình & ngân sách',
              style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
            ),
            onChanged: (val) {
              if (val != null) setState(() => _includeLodging = val);
            },
          ),
          if (_includeLodging) ...[
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
              decoration: BoxDecoration(
                color: Colors.purple.withValues(alpha: 0.06),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: Colors.purple.withValues(alpha: 0.2)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.people_alt_rounded,
                      color: Colors.purple, size: 18),
                  const SizedBox(width: 10),
                  const Expanded(
                    child: Text(
                      'Hình thức lưu trú:',
                      style:
                          TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                    ),
                  ),
                  DropdownButtonHideUnderline(
                    child: DropdownButton<int>(
                      value: _guestsPerRoom,
                      items: const [
                        DropdownMenuItem(
                            value: 1,
                            child: Text('1 người (Phòng riêng)',
                                style: TextStyle(fontSize: 11))),
                        DropdownMenuItem(
                            value: 2,
                            child: Text('2 người / phòng',
                                style: TextStyle(fontSize: 11))),
                        DropdownMenuItem(
                            value: 3,
                            child: Text('3 người / phòng',
                                style: TextStyle(fontSize: 11))),
                        DropdownMenuItem(
                            value: 4,
                            child: Text('4 người / phòng (Nhóm)',
                                style: TextStyle(fontSize: 11))),
                      ],
                      onChanged: (v) {
                        if (v != null) setState(() => _guestsPerRoom = v);
                      },
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 8),
            if (_selectedLodging == null)
              GestureDetector(
                onTap: _openSelectLodgingModal,
                child: Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: Colors.purple.withValues(alpha: 0.05),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: Colors.purple.withValues(alpha: 0.25)),
                  ),
                  child: const Center(
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.hotel_rounded, size: 16, color: Colors.purple),
                        SizedBox(width: 6),
                        Text(
                          'Để AI tự động tối ưu hoặc click chọn nơi ở',
                          style: TextStyle(
                            fontSize: 12,
                            color: Colors.purple,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              )
            else
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.purple.withValues(alpha: 0.06),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: Colors.purple.withValues(alpha: 0.3)),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.hotel_rounded, color: Colors.purple, size: 22),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            _selectedLodging!.name,
                            style: const TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.bold,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                          Text(
                            '${_selectedLodging!.district ?? ""} • ${_formatVND(_selectedLodging!.pricePerNight)}/đêm',
                            style: TextStyle(fontSize: 11, color: Colors.grey[600]),
                          ),
                        ],
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.close, size: 16, color: Colors.purple),
                      onPressed: () => setState(() => _selectedLodging = null),
                    ),
                  ],
                ),
              ),
          ] else ...[
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.grey.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Row(
                children: [
                  Icon(Icons.info_outline, size: 16, color: Colors.grey),
                  SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Tự túc nơi ở: Lịch trình sẽ không tính chi phí phòng nghỉ vào ngân sách (0đ).',
                      style: TextStyle(fontSize: 11, color: Colors.grey),
                    ),
                  ),
                ],
              ),
            ),
          ],
          const SizedBox(height: 18),

          // 8. Meals Section
          _buildSectionLabel('DỊCH VỤ ĂN UỐNG (SÁNG, TRƯA, TỐI)'),
          CheckboxListTile(
            value: _includeMeals,
            contentPadding: EdgeInsets.zero,
            controlAffinity: ListTileControlAffinity.leading,
            activeColor: AppColors.primary,
            title: const Text(
              'AI gợi ý và xếp các quán ăn / cà phê vào các bữa',
              style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
            ),
            onChanged: (val) {
              if (val != null) {
                setState(() {
                  _includeMeals = val;
                  if (!val && _selectedInterests.contains('Ẩm thực')) {
                    if (_selectedInterests.length > 1) {
                      _selectedInterests.remove('Ẩm thực');
                    } else {
                      _selectedInterests.add('Văn hóa & lịch sử');
                    }
                  }
                });
              }
            },
          ),
          if (!_includeMeals)
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.amber.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.amber.withValues(alpha: 0.3)),
              ),
              child: const Row(
                children: [
                  Icon(Icons.restaurant_menu_rounded,
                      size: 16, color: Colors.amber),
                  SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Tự túc ăn uống: Lịch trình vẫn giữ khung giờ ăn nhưng không gắn quán (0đ).',
                      style: TextStyle(fontSize: 11, color: Colors.orange),
                    ),
                  ),
                ],
              ),
            ),

          // Error banner
          if (_errorMessage != null) ...[
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.red.withValues(alpha: 0.08),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: Colors.red.withValues(alpha: 0.3)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.error_outline_rounded,
                      color: Colors.red, size: 20),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      _errorMessage!,
                      style: const TextStyle(fontSize: 12, color: Colors.red),
                    ),
                  ),
                ],
              ),
            ),
          ],

          const SizedBox(height: 24),

          // Big Submit Button
          SizedBox(
            width: double.infinity,
            height: 52,
            child: ElevatedButton(
              onPressed: _isLoadingPlan ? null : _generatePlan,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primaryDark,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(18),
                ),
                elevation: 4,
              ),
              child: _isLoadingPlan
                  ? const Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(
                            color: Colors.amber,
                            strokeWidth: 2.5,
                          ),
                        ),
                        SizedBox(width: 12),
                        Text(
                          'AI Đang Tối Ưu Lịch Trình...',
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    )
                  : const Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.auto_awesome, color: Colors.amber, size: 20),
                        SizedBox(width: 8),
                        Text(
                          'TẠO LỊCH TRÌNH AI',
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.bold,
                            letterSpacing: 0.5,
                          ),
                        ),
                      ],
                    ),
            ),
          ),

          const SizedBox(height: 24),

          // Mascot Footer Banner
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: isDark ? Colors.grey[850] : Colors.amber.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(18),
              border: Border.all(
                color: Colors.amber.withValues(alpha: 0.3),
              ),
            ),
            child: const Row(
              children: [
                Text('🧭', style: TextStyle(fontSize: 26)),
                SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Khám phá Đà Nẵng cùng AI Plan',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      SizedBox(height: 2),
                      Text(
                        'Tự động sắp xếp cung đường, tính toán chi phí & đồng bộ checklist hành lý.',
                        style: TextStyle(fontSize: 11, color: Colors.grey),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionLabel(String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Text(
        text,
        style: const TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.w800,
          color: Colors.grey,
          letterSpacing: 0.5,
        ),
      ),
    );
  }

  Widget _buildBudgetPresetBtn(String label, double value) {
    final isSelected = (_budget - value).abs() < 10000;
    return InkWell(
      onTap: () => setState(() => _budget = value),
      borderRadius: BorderRadius.circular(10),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
        decoration: BoxDecoration(
          color: isSelected
              ? AppColors.primary.withValues(alpha: 0.12)
              : Colors.transparent,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(
            color: isSelected
                ? AppColors.primary
                : Colors.grey.withValues(alpha: 0.3),
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 11,
            fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
            color: isSelected ? AppColors.primary : Colors.grey[600],
          ),
        ),
      ),
    );
  }
}
