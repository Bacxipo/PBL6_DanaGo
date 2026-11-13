import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:smarttrip/models/ai_plan_model.dart';
import 'package:smarttrip/services/ai_service.dart';
import 'package:smarttrip/theme/app_colors.dart';

class PlanResultView extends StatefulWidget {
  final AiPlanResult plan;
  final String startDateStr;
  final String endDateStr;
  final bool includeMeals;
  final bool includeLodging;
  final VoidCallback onReset;
  final VoidCallback? onSavedSuccess;

  const PlanResultView({
    super.key,
    required this.plan,
    required this.startDateStr,
    required this.endDateStr,
    this.includeMeals = true,
    this.includeLodging = true,
    required this.onReset,
    this.onSavedSuccess,
  });

  @override
  State<PlanResultView> createState() => _PlanResultViewState();
}

class _PlanResultViewState extends State<PlanResultView> {
  int _activeDayTab = 0; // 0 = all days
  bool _isSaving = false;
  final Set<String> _checkedChecklists = {};

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

  Future<void> _handleSaveItinerary() async {
    setState(() => _isSaving = true);
    HapticFeedback.mediumImpact();

    try {
      final daysMap = <String, dynamic>{};
      for (var d in widget.plan.days) {
        final itemsList = <Map<String, dynamic>>[];
        for (int idx = 0; idx < d.items.length; idx++) {
          final it = d.items[idx];
          final isLodgingItem = [
                'checkin',
                'checkout',
                'return',
                'lodging'
              ].contains(it.type) ||
              (it.label != null && it.label!.toLowerCase().contains('khách sạn'));

          final checklists = <Map<String, dynamic>>[];
          if (it.type == 'attraction') {
            checklists.addAll([
              {'id': idx * 10 + 1, 'itemName': 'Vé tham quan / QR Code', 'isChecked': false},
              {'id': idx * 10 + 2, 'itemName': 'Điện thoại & sạc dự phòng', 'isChecked': false},
              {'id': idx * 10 + 3, 'itemName': 'Mũ nón, kem chống nắng', 'isChecked': false},
            ]);
          } else if (['breakfast', 'lunch', 'dinner', 'food'].contains(it.type)) {
            checklists.addAll([
              {'id': idx * 10 + 1, 'itemName': 'Khăn ướt / Nước rửa tay', 'isChecked': false},
              {'id': idx * 10 + 2, 'itemName': 'Tiền mặt hoặc ứng dụng thanh toán', 'isChecked': false},
            ]);
          } else if (isLodgingItem) {
            checklists.addAll([
              {'id': idx * 10 + 1, 'itemName': 'CCCD / Hộ chiếu nhận phòng', 'isChecked': false},
              {'id': idx * 10 + 2, 'itemName': 'Kiểm tra hành lý & đồ đạc cá nhân', 'isChecked': false},
            ]);
          }

          itemsList.add({
            'id': it.id > 0 ? it.id : DateTime.now().millisecondsSinceEpoch + idx,
            'placeId': it.id > 0 ? it.id : null,
            'destinationId': !isLodgingItem && it.id > 0 ? it.id : null,
            'lodgingId': isLodgingItem && it.id > 0 ? it.id : null,
            'name': it.name,
            'location': it.district != null
                ? '${it.district}, ${it.region ?? "Đà Nẵng"}'
                : 'Đà Nẵng',
            'time': it.start ?? '08:00',
            'endTime': it.end ?? '10:00',
            'tag': it.label ?? it.type,
            'type': it.type,
            'priceEst': it.priceEst,
            'budget': it.priceEst,
            'notes': it.description ?? (it.priceExcluded ? 'Tùy theo món ăn' : null),
            'checklists': checklists,
          });
        }
        daysMap[d.day.toString()] = itemsList;
      }

      final payload = {
        'title': 'Lịch trình AI Đà Nẵng ${widget.plan.numDays} Ngày',
        'startDate': widget.startDateStr,
        'endDate': widget.endDateStr,
        'description':
            'Lịch trình tự động tối ưu bởi DanaGO AI với tổng chi phí ước tính ${_formatVND(widget.plan.totalCostPp)}/người.',
        'coverImg':
            'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
        'budget': widget.plan.totalCostPp,
        'days': daysMap,
      };

      final success = await AiService.instance.saveItineraryFull(payload);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Row(
              children: [
                const Icon(Icons.check_circle_rounded, color: Colors.white, size: 20),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    success
                        ? '✅ Đã lưu lịch trình thành công vào mục Lịch trình!'
                        : 'Lưu lịch trình thành công vào thiết bị!',
                  ),
                ),
              ],
            ),
            backgroundColor: AppColors.primary,
            behavior: SnackBarBehavior.floating,
            duration: const Duration(seconds: 3),
          ),
        );

        if (widget.onSavedSuccess != null) {
          widget.onSavedSuccess!();
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Lỗi lưu lịch trình: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _isSaving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    final hasEmptyDays = widget.plan.days.any((d) =>
        d.items.isEmpty || !d.items.any((it) => it.type == 'attraction'));

    final daysToDisplay = _activeDayTab == 0
        ? widget.plan.days
        : widget.plan.days.where((d) => d.day == _activeDayTab).toList();

    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 100),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Warning if any day is missing activities
          if (hasEmptyDays)
            Container(
              margin: const EdgeInsets.only(bottom: 16),
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: Colors.red.withValues(alpha: 0.08),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.red.withValues(alpha: 0.3)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.warning_amber_rounded, color: Colors.red, size: 20),
                      const SizedBox(width: 8),
                      const Expanded(
                        child: Text(
                          'Một số ngày chưa thể xếp điểm tham quan',
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 13,
                            color: Colors.red,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Text(
                    'Ngân sách dự tính quá thấp hoặc tiêu chí khu vực quá chặt. Bạn hãy thử tăng ngân sách hoặc chọn "Tất cả khu vực".',
                    style: TextStyle(
                      fontSize: 12,
                      color: isDark ? Colors.grey[300] : Colors.grey[700],
                      height: 1.35,
                    ),
                  ),
                  const SizedBox(height: 10),
                  InkWell(
                    onTap: widget.onReset,
                    child: const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.refresh_rounded, size: 14, color: AppColors.primary),
                        SizedBox(width: 4),
                        Text(
                          'Điều chỉnh & Tạo lại lịch trình',
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
            ),

          // Overview Financial Card
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: isDark ? Colors.grey[850] : Colors.white,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(
                color: isDark ? Colors.grey[800]! : Colors.grey[200]!,
              ),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.04),
                  blurRadius: 10,
                  offset: const Offset(0, 3),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: AppColors.primary.withValues(alpha: 0.12),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: const Icon(Icons.account_balance_wallet_rounded,
                              color: AppColors.primary, size: 18),
                        ),
                        const SizedBox(width: 10),
                        const Text(
                          'Dự Toán Chi Phí',
                          style: TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: Colors.teal.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        '${widget.plan.numDays} Ngày',
                        style: const TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                          color: AppColors.primary,
                        ),
                      ),
                    ),
                  ],
                ),
                const Divider(height: 20),
                Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Tổng chi phí / người',
                            style: TextStyle(
                              fontSize: 11,
                              color: isDark ? Colors.grey[400] : Colors.grey[600],
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            _formatVND(widget.plan.totalCostPp),
                            style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                              color: AppColors.primary,
                            ),
                          ),
                        ],
                      ),
                    ),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Text(
                            'Ngân sách còn lại',
                            style: TextStyle(
                              fontSize: 11,
                              color: isDark ? Colors.grey[400] : Colors.grey[600],
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            _formatVND(widget.plan.budgetLeftPp),
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.bold,
                              color: widget.plan.budgetLeftPp >= 0
                                  ? Colors.green
                                  : Colors.red,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                Wrap(
                  spacing: 6,
                  runSpacing: 4,
                  children: [
                    _buildInclusionChip('Vé tham quan', true),
                    _buildInclusionChip('Nơi lưu trú', widget.includeLodging),
                  ],
                ),
                if (widget.includeMeals) ...[
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      const Icon(Icons.restaurant_menu_rounded,
                          size: 13, color: Colors.deepOrange),
                      const SizedBox(width: 4),
                      Expanded(
                        child: Text(
                          'Ăn uống: có gợi ý quán, chi phí tùy theo món (không tính vào ngân sách)',
                          style: TextStyle(
                            fontSize: 11,
                            fontStyle: FontStyle.italic,
                            color: isDark ? Colors.grey[400] : Colors.grey[700],
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
                if (widget.plan.budgetLeftPp >= 500000 &&
                    widget.plan.budgetPp > 0 &&
                    (widget.plan.budgetLeftPp / widget.plan.budgetPp) >= 0.2) ...[
                  const SizedBox(height: 12),
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.teal.withValues(alpha: 0.08),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: Colors.teal.withValues(alpha: 0.3),
                      ),
                    ),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('💡', style: TextStyle(fontSize: 15)),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            'Ngân sách còn dư ${_formatVND(widget.plan.budgetLeftPp)}/người (~${_formatVND((widget.plan.budgetLeftPp / (widget.plan.numDays > 0 ? widget.plan.numDays : 1)).round())}/ngày): AI đã chọn tối đa số điểm tham quan có vé và nơi nghỉ phù hợp nhất. Khoản dư này là quỹ dự phòng lý tưởng cho các bữa ăn uống đặc sản (tùy món), di chuyển cá nhân và mua sắm quà lưu niệm.',
                            style: TextStyle(
                              fontSize: 11.5,
                              height: 1.4,
                              color: isDark ? Colors.teal[100] : Colors.teal[900],
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ],
            ),
          ),

          const SizedBox(height: 16),

          // Day Filter Tabs
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: [
                _buildFilterTab(0, 'Tất cả các ngày'),
                ...widget.plan.days.map((d) => _buildFilterTab(d.day, 'Ngày ${d.day}')),
              ],
            ),
          ),

          const SizedBox(height: 16),

          // Days Timeline List
          ...daysToDisplay.map((day) => _buildDaySection(day, isDark)),

          const SizedBox(height: 20),

          // Action Buttons
          Row(
            children: [
              Expanded(
                flex: 2,
                child: OutlinedButton.icon(
                  onPressed: widget.onReset,
                  icon: const Icon(Icons.tune_rounded, size: 16),
                  label: const Text('Điều chỉnh', style: TextStyle(fontSize: 12)),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: AppColors.primary,
                    side: const BorderSide(color: AppColors.primary),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    padding: const EdgeInsets.symmetric(vertical: 14),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                flex: 3,
                child: ElevatedButton.icon(
                  onPressed: _isSaving ? null : _handleSaveItinerary,
                  icon: _isSaving
                      ? const SizedBox(
                          width: 16,
                          height: 16,
                          child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                        )
                      : const Icon(Icons.bookmark_add_rounded, size: 18),
                  label: Text(
                    _isSaving ? 'Đang lưu...' : 'LƯU LỊCH TRÌNH',
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    elevation: 2,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildInclusionChip(String label, bool included) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: included ? Colors.green.withValues(alpha: 0.1) : Colors.grey.withValues(alpha: 0.15),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            included ? Icons.check_circle_rounded : Icons.cancel_outlined,
            size: 11,
            color: included ? Colors.green : Colors.grey,
          ),
          const SizedBox(width: 4),
          Text(
            label,
            style: TextStyle(
              fontSize: 10,
              fontWeight: FontWeight.w600,
              color: included ? Colors.green[800] : Colors.grey[600],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterTab(int dayNum, String label) {
    final isSelected = _activeDayTab == dayNum;
    return GestureDetector(
      onTap: () => setState(() => _activeDayTab = dayNum),
      child: Container(
        margin: const EdgeInsets.only(right: 8),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primary : Colors.grey.withValues(alpha: 0.15),
          borderRadius: BorderRadius.circular(20),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 12,
            fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
            color: isSelected ? Colors.white : Colors.grey[700],
          ),
        ),
      ),
    );
  }

  Widget _buildDaySection(AiPlanDay day, bool isDark) {
    return Container(
      margin: const EdgeInsets.only(bottom: 18),
      decoration: BoxDecoration(
        color: isDark ? Colors.grey[850] : Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: isDark ? Colors.grey[800]! : Colors.grey[200]!),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.03),
            blurRadius: 10,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Day Header
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: BoxDecoration(
              color: AppColors.primary.withValues(alpha: 0.06),
              borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 4),
                      decoration: BoxDecoration(
                        color: AppColors.primary,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Text(
                        'Ngày ${day.day}',
                        style: const TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                          fontSize: 12,
                        ),
                      ),
                    ),
                    if (day.region != null) ...[
                      const SizedBox(width: 8),
                      Text(
                        day.region!,
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: isDark ? Colors.grey[300] : Colors.grey[700],
                        ),
                      ),
                    ],
                  ],
                ),
                Text(
                  'Chi phí: ${_formatVND(day.costPp)}',
                  style: const TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                    color: AppColors.primary,
                  ),
                ),
              ],
            ),
          ),

          // Items Timeline
          if (day.items.isEmpty)
            Padding(
              padding: const EdgeInsets.all(20),
              child: Center(
                child: Text(
                  'Không có hoạt động nào được xếp trong ngày này.',
                  style: TextStyle(fontSize: 12, color: Colors.grey[500]),
                ),
              ),
            )
          else
            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              padding: const EdgeInsets.all(14),
              itemCount: day.items.length,
              separatorBuilder: (context, idx) => _buildTravelDashedConnector(
                day.items[idx],
                day.items[idx + 1],
                isDark,
              ),
              itemBuilder: (context, idx) {
                final it = day.items[idx];
                return _buildTimelineItem(it, idx, isDark);
              },
            ),

          // Night Lodging card if available
          if (day.night != null) ...[
            const Divider(height: 1),
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: Colors.purple.withValues(alpha: 0.05),
                borderRadius: const BorderRadius.vertical(bottom: Radius.circular(20)),
              ),
              child: Row(
                children: [
                  Container(
                    width: 38,
                    height: 38,
                    decoration: BoxDecoration(
                      color: Colors.purple.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Center(
                      child: Text('🏨', style: TextStyle(fontSize: 18)),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Nghỉ đêm tại',
                          style: TextStyle(fontSize: 10, color: Colors.purple, fontWeight: FontWeight.bold),
                        ),
                        Text(
                          day.night!.name,
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        Text(
                          '${day.night!.checkin ?? "14:00"} - ${day.night!.checkout ?? "12:00"} • ${_formatVND(day.night!.pricePpNight)}/người',
                          style: TextStyle(fontSize: 11, color: Colors.grey[600]),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildTravelDashedConnector(
    AiPlanItem prevItem,
    AiPlanItem nextItem,
    bool isDark,
  ) {
    int? travelMin = nextItem.travelMin;
    if (travelMin == null && prevItem.end != null && nextItem.start != null) {
      final pParts = prevItem.end!.split(':');
      final nParts = nextItem.start!.split(':');
      if (pParts.length == 2 && nParts.length == 2) {
        final pm = (int.tryParse(pParts[0]) ?? 0) * 60 +
            (int.tryParse(pParts[1]) ?? 0);
        final nm = (int.tryParse(nParts[0]) ?? 0) * 60 +
            (int.tryParse(nParts[1]) ?? 0);
        travelMin = (nm - pm).clamp(0, 999);
      }
    }
    final mins = travelMin ?? 10;
    final distStr = (nextItem.distanceKm != null && nextItem.distanceKm! > 0)
        ? ' (${nextItem.distanceKm} km)'
        : '';
    final labelText = mins > 0
        ? 'Thời gian di chuyển: ~$mins phút$distStr'
        : 'Tại cùng địa điểm (0 phút di chuyển)';

    final dashColor = isDark ? Colors.grey[700]! : Colors.grey[350]!;

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 7, horizontal: 6),
      child: Row(
        children: [
          Expanded(child: _buildDashedLine(dashColor)),
          Container(
            margin: const EdgeInsets.symmetric(horizontal: 8),
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3.5),
            decoration: BoxDecoration(
              color: isDark ? Colors.grey[850] : Colors.grey[100],
              borderRadius: BorderRadius.circular(20),
              border: Border.all(
                color: dashColor,
                width: 1,
              ),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Text('🛵', style: TextStyle(fontSize: 11)),
                const SizedBox(width: 5),
                Text(
                  labelText,
                  style: TextStyle(
                    fontSize: 10.5,
                    fontWeight: FontWeight.w600,
                    color: isDark ? Colors.grey[300] : Colors.grey[700],
                  ),
                ),
              ],
            ),
          ),
          Expanded(child: _buildDashedLine(dashColor)),
        ],
      ),
    );
  }

  Widget _buildDashedLine(Color color) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final boxWidth = constraints.constrainWidth();
        const dashWidth = 4.0;
        const dashHeight = 1.2;
        final dashCount = (boxWidth / (2 * dashWidth)).floor();
        return Flex(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          direction: Axis.horizontal,
          children: List.generate(dashCount, (_) {
            return SizedBox(
              width: dashWidth,
              height: dashHeight,
              child: DecoratedBox(
                decoration: BoxDecoration(color: color),
              ),
            );
          }),
        );
      },
    );
  }

  Widget _buildTimelineItem(AiPlanItem it, int index, bool isDark) {
    final bool isMeal = it.type == 'breakfast' ||
        it.type == 'lunch' ||
        it.type == 'dinner' ||
        it.type == 'food';
    final bool isHotel = it.type == 'checkin' ||
        it.type == 'checkout' ||
        it.type == 'return' ||
        it.type == 'lodging';

    // 🎨 Màu theo từng nhóm ô (Ăn uống, Khách sạn/Nghỉ ngơi, Đi tham quan)
    final Color cardBg;
    final Color cardBorder;
    final Color accentColor;
    final Color tagBg;
    final Color tagColor;
    final Color timeBadgeBg;
    final String emoji;

    if (isMeal) {
      // 1. Ô Ăn uống: Tông cam / hổ phách ấm áp
      cardBg = isDark ? const Color(0xFF2B1910) : const Color(0xFFFFF7ED);
      cardBorder = isDark ? const Color(0xFF7C2D12) : const Color(0xFFFFDBB5);
      accentColor = const Color(0xFFEA580C);
      tagBg = isDark ? const Color(0xFF431407) : const Color(0xFFFFEDD5);
      tagColor = isDark ? const Color(0xFFFDBA74) : const Color(0xFFC2410C);
      timeBadgeBg = isDark ? const Color(0xFF381B10) : Colors.white;
      emoji = '🍽️';
    } else if (isHotel) {
      // 2. Ô Khách sạn / Nghỉ ngơi: Tông tím sang trọng
      cardBg = isDark ? const Color(0xFF221634) : const Color(0xFFFAF5FF);
      cardBorder = isDark ? const Color(0xFF581C87) : const Color(0xFFE9D5FF);
      accentColor = const Color(0xFF9333EA);
      tagBg = isDark ? const Color(0xFF3B0764) : const Color(0xFFF3E8FF);
      tagColor = isDark ? const Color(0xFFD8B4FE) : const Color(0xFF7E22CE);
      timeBadgeBg = isDark ? const Color(0xFF2E1748) : Colors.white;
      emoji = '🏨';
    } else {
      // 3. Ô Đi tham quan / Thắng cảnh: Tông xanh ngọc teal tươi mát
      cardBg = isDark ? const Color(0xFF0F2628) : const Color(0xFFF0FDFA);
      cardBorder = isDark ? const Color(0xFF134E4A) : const Color(0xFFCCFBF1);
      accentColor = AppColors.primary;
      tagBg = isDark ? const Color(0xFF042F2E) : const Color(0xFFCCFBF1);
      tagColor = isDark ? const Color(0xFF5EEAD4) : const Color(0xFF0F766E);
      timeBadgeBg = isDark ? const Color(0xFF143437) : Colors.white;
      emoji = '📍';
    }

    final checklistItems = <String>[];
    if (it.type == 'attraction') {
      checklistItems.addAll([
        'Vé tham quan / QR Code',
        'Điện thoại, sạc dự phòng & máy ảnh',
        'Mũ nón, kính râm & kem chống nắng',
      ]);
    } else if (isMeal) {
      checklistItems.addAll([
        'Khăn ướt / Nước rửa tay',
        'Tiền mặt hoặc ứng dụng thanh toán',
      ]);
    } else if (isHotel) {
      checklistItems.addAll([
        'CCCD / Hộ chiếu nhận phòng',
        'Kiểm tra hành lý & đồ đạc',
      ]);
    }

    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: cardBorder, width: 1.2),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.02),
            blurRadius: 6,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Time Badge
              Container(
                width: 54,
                padding: const EdgeInsets.symmetric(vertical: 5),
                decoration: BoxDecoration(
                  color: timeBadgeBg,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(
                    color: cardBorder.withValues(alpha: 0.8),
                    width: 0.8,
                  ),
                ),
                child: Column(
                  children: [
                    Text(
                      it.start ?? '08:00',
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                        color: accentColor,
                      ),
                    ),
                    if (it.end != null)
                      Text(
                        it.end!,
                        style: TextStyle(
                          fontSize: 10,
                          color: isDark ? Colors.grey[400] : Colors.grey[600],
                        ),
                      ),
                  ],
                ),
              ),
              const SizedBox(width: 10),

              // Icon Avatar
              Container(
                width: 34,
                height: 34,
                decoration: BoxDecoration(
                  color: tagBg,
                  shape: BoxShape.circle,
                  border: Border.all(color: cardBorder, width: 0.8),
                ),
                child: Center(
                  child: Text(emoji, style: const TextStyle(fontSize: 15)),
                ),
              ),
              const SizedBox(width: 10),

              // Details
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 7, vertical: 2.5),
                          decoration: BoxDecoration(
                            color: tagBg,
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(
                            it.label ?? it.type,
                            style: TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                              color: tagColor,
                            ),
                          ),
                        ),
                        const Spacer(),
                        if (it.priceExcluded)
                          Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: const Color(0xFFFFEDD5),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                const Icon(Icons.restaurant_menu_rounded,
                                    size: 11, color: Color(0xFFEA580C)),
                                const SizedBox(width: 3),
                                Text(
                                  it.displayPriceNote,
                                  style: const TextStyle(
                                    fontSize: 10,
                                    fontWeight: FontWeight.bold,
                                    color: Color(0xFFC2410C),
                                  ),
                                ),
                              ],
                            ),
                          )
                        else if (it.priceEst > 0)
                          Text(
                            _formatVND(it.priceEst),
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                              color: isDark ? Colors.amber[300] : Colors.deepOrange,
                            ),
                          )
                        else
                          Text(
                            it.isMeal ? it.displayPriceNote : 'Miễn phí',
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w600,
                              color: it.isMeal ? Colors.grey[600] : Colors.green[700],
                            ),
                          ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(
                      it.name,
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 13,
                        height: 1.25,
                      ),
                    ),
                    if (it.description != null &&
                        it.description!.isNotEmpty)
                      Padding(
                        padding: const EdgeInsets.only(top: 3),
                        child: Text(
                          it.description!,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          style: TextStyle(
                            fontSize: 11,
                            height: 1.3,
                            color: isDark
                                ? Colors.grey[300]
                                : (isMeal
                                    ? const Color(0xFF7C2D12).withValues(alpha: 0.85)
                                    : const Color(0xFF004D54).withValues(alpha: 0.85)),
                          ),
                        ),
                      ),
                    if (it.district != null && it.district!.isNotEmpty)
                      Padding(
                        padding: const EdgeInsets.only(top: 2),
                        child: Text(
                          '📍 ${it.district}',
                          style: TextStyle(
                            fontSize: 11,
                            color: isDark ? Colors.grey[400] : Colors.grey[600],
                          ),
                        ),
                      ),
                  ],
                ),
              ),
            ],
          ),

          // Suggested Checklist Dropdown / Items
          if (checklistItems.isNotEmpty)
            Padding(
              padding: const EdgeInsets.only(left: 64, top: 8),
              child: Wrap(
                spacing: 6,
                runSpacing: 4,
                children: checklistItems.map((chk) {
                  final key = '${it.id}_$chk';
                  final isDone = _checkedChecklists.contains(key);
                  return GestureDetector(
                    onTap: () {
                      setState(() {
                        if (isDone) {
                          _checkedChecklists.remove(key);
                        } else {
                          _checkedChecklists.add(key);
                        }
                      });
                    },
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 150),
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: isDone
                            ? Colors.green.withValues(alpha: 0.15)
                            : (isDark ? Colors.black26 : Colors.white),
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(
                          color: isDone ? Colors.green : cardBorder,
                          width: 0.8,
                        ),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            isDone
                                ? Icons.check_box_rounded
                                : Icons.check_box_outline_blank_rounded,
                            size: 13,
                            color: isDone ? Colors.green : Colors.grey[600],
                          ),
                          const SizedBox(width: 4),
                          Text(
                            chk,
                            style: TextStyle(
                              fontSize: 10,
                              decoration: isDone ? TextDecoration.lineThrough : null,
                              color: isDone
                                  ? Colors.green[800]
                                  : (isDark ? Colors.grey[300] : Colors.grey[800]),
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                }).toList(),
              ),
            ),
        ],
      ),
    );
  }
}

