import 'package:flutter/material.dart';
import 'package:smarttrip/models/search_filter_model.dart';
import 'package:smarttrip/theme/app_colors.dart';
import 'package:smarttrip/widgets/search/search_filter_chip.dart';

class MapSearchHeader extends StatelessWidget {
  final TextEditingController controller;
  final TextEditingController aiController;
  final bool isAiMode;
  final bool hasAiResults;
  final bool isAiLoading;
  final String aiActiveQuery;
  final String? aiError;
  final ValueChanged<bool> onModeChanged;
  final VoidCallback onFilterTap;
  final Set<String> activeChips;
  final ValueChanged<String> onChipToggle;
  final ValueChanged<String>? onSearchChanged;
  final ValueChanged<String> onAiSearchSubmit;
  final VoidCallback onClearAi;

  static const List<Map<String, String>> aiQuickPrompts = [
    {'label': '☕ Cà phê view sống ảo', 'query': 'Quán cà phê view sống ảo'},
    {'label': '🏖️ Bãi biển trong xanh', 'query': 'Bãi biển trong xanh'},
    {'label': '🏛️ Địa điểm văn hóa', 'query': 'Địa điểm văn hóa'},
  ];

  const MapSearchHeader({
    super.key,
    required this.controller,
    required this.aiController,
    required this.isAiMode,
    required this.hasAiResults,
    required this.isAiLoading,
    required this.aiActiveQuery,
    this.aiError,
    required this.onModeChanged,
    required this.onFilterTap,
    required this.activeChips,
    required this.onChipToggle,
    this.onSearchChanged,
    required this.onAiSearchSubmit,
    required this.onClearAi,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final showAiInput = isAiMode || hasAiResults;

    return SafeArea(
      bottom: false,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const SizedBox(height: 8),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 14),
            child: Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: Theme.of(context).cardColor,
                borderRadius: BorderRadius.circular(20),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: isDark ? 0.35 : 0.1),
                    blurRadius: 16,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  // 1. Thanh chuyển đổi chế độ giống Web: Tìm theo tên | Gợi ý bằng AI
                  Row(
                    children: [
                      Expanded(
                        child: Container(
                          padding: const EdgeInsets.all(3),
                          decoration: BoxDecoration(
                            color: isDark
                                ? const Color(0xFF0F172A)
                                : const Color(0xFFF1F5F9),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Row(
                            children: [
                              Expanded(
                                child: GestureDetector(
                                  onTap: () => onModeChanged(false),
                                  child: AnimatedContainer(
                                    duration: const Duration(milliseconds: 200),
                                    padding: const EdgeInsets.symmetric(
                                      vertical: 7,
                                      horizontal: 8,
                                    ),
                                    decoration: BoxDecoration(
                                      color: !showAiInput
                                          ? (isDark
                                              ? const Color(0xFF1E293B)
                                              : Colors.white)
                                          : Colors.transparent,
                                      borderRadius: BorderRadius.circular(9),
                                      boxShadow: !showAiInput
                                          ? [
                                              BoxShadow(
                                                color: Colors.black.withValues(
                                                  alpha: 0.06,
                                                ),
                                                blurRadius: 4,
                                                offset: const Offset(0, 1),
                                              ),
                                            ]
                                          : null,
                                    ),
                                    child: Row(
                                      mainAxisAlignment:
                                          MainAxisAlignment.center,
                                      children: [
                                        Icon(
                                          Icons.search_rounded,
                                          size: 14,
                                          color: !showAiInput
                                              ? (isDark
                                                  ? Colors.white
                                                  : AppColors.textPrimary)
                                              : AppColors.textTertiary,
                                        ),
                                        const SizedBox(width: 5),
                                        Flexible(
                                          child: Text(
                                            'Tìm theo tên',
                                            maxLines: 1,
                                            overflow: TextOverflow.ellipsis,
                                            style: TextStyle(
                                              fontFamily: 'Be Vietnam Pro',
                                              fontSize: 11.5,
                                              fontWeight: FontWeight.w700,
                                              color: !showAiInput
                                                  ? (isDark
                                                      ? Colors.white
                                                      : AppColors.textPrimary)
                                                  : AppColors.textTertiary,
                                            ),
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ),
                              ),
                              Expanded(
                                child: GestureDetector(
                                  onTap: () => onModeChanged(true),
                                  child: AnimatedContainer(
                                    duration: const Duration(milliseconds: 200),
                                    padding: const EdgeInsets.symmetric(
                                      vertical: 7,
                                      horizontal: 8,
                                    ),
                                    decoration: BoxDecoration(
                                      color: showAiInput
                                          ? AppColors.primary
                                          : Colors.transparent,
                                      borderRadius: BorderRadius.circular(9),
                                    ),
                                    child: Row(
                                      mainAxisAlignment:
                                          MainAxisAlignment.center,
                                      children: [
                                        Icon(
                                          Icons.auto_awesome,
                                          size: 14,
                                          color: showAiInput
                                              ? Colors.amberAccent
                                              : AppColors.primary,
                                        ),
                                        const SizedBox(width: 5),
                                        Flexible(
                                          child: Text(
                                            'Gợi ý bằng AI',
                                            maxLines: 1,
                                            overflow: TextOverflow.ellipsis,
                                            style: TextStyle(
                                              fontFamily: 'Be Vietnam Pro',
                                              fontSize: 11.5,
                                              fontWeight: FontWeight.w700,
                                              color: showAiInput
                                                  ? Colors.white
                                                  : (isDark
                                                      ? Colors.white70
                                                      : AppColors.primary),
                                            ),
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
                      ),
                      const SizedBox(width: 8),
                      InkWell(
                        onTap: onFilterTap,
                        borderRadius: BorderRadius.circular(12),
                        child: Container(
                          width: 36,
                          height: 36,
                          decoration: BoxDecoration(
                            color: isDark
                                ? const Color(0xFF0F172A)
                                : const Color(0xFFF1F5F9),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Icon(
                            Icons.tune_rounded,
                            color: isDark
                                ? Colors.grey.shade300
                                : AppColors.textSecondary,
                            size: 18,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),

                  // 2. Ô nhập liệu theo chế độ
                  if (!showAiInput)
                    Container(
                      height: 42,
                      padding: const EdgeInsets.symmetric(horizontal: 12),
                      decoration: BoxDecoration(
                        color: isDark
                            ? const Color(0xFF0F172A)
                            : const Color(0xFFF8FAFC),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: isDark
                              ? Colors.white12
                              : Colors.grey.shade200,
                        ),
                      ),
                      child: Row(
                        children: [
                          const Icon(
                            Icons.search,
                            color: AppColors.primary,
                            size: 19,
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: TextField(
                              controller: controller,
                              onChanged: onSearchChanged,
                              style: TextStyle(
                                fontSize: 13,
                                color: isDark
                                    ? Colors.white
                                    : AppColors.textPrimary,
                              ),
                              decoration: const InputDecoration(
                                hintText:
                                    'Tìm theo tên (Bà Nà, Mỹ Khê, Sơn Trà...)',
                                hintStyle: TextStyle(
                                  color: AppColors.textHint,
                                  fontSize: 13,
                                ),
                                border: InputBorder.none,
                                isDense: true,
                              ),
                            ),
                          ),
                          if (controller.text.isNotEmpty)
                            GestureDetector(
                              onTap: () {
                                controller.clear();
                                onSearchChanged?.call('');
                              },
                              child: const Icon(
                                Icons.close_rounded,
                                size: 17,
                                color: AppColors.textTertiary,
                              ),
                            ),
                        ],
                      ),
                    )
                  else ...[
                    Row(
                      children: [
                        Expanded(
                          child: Container(
                            height: 42,
                            padding: const EdgeInsets.symmetric(horizontal: 10),
                            decoration: BoxDecoration(
                              color: isDark
                                  ? const Color(0xFF0F172A)
                                  : const Color(0xFFF0FDFA),
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(
                                color: AppColors.primary.withValues(
                                  alpha: 0.35,
                                ),
                              ),
                            ),
                            child: Row(
                              children: [
                                const Icon(
                                  Icons.auto_awesome,
                                  color: AppColors.primary,
                                  size: 17,
                                ),
                                const SizedBox(width: 8),
                                Expanded(
                                  child: TextField(
                                    controller: aiController,
                                    textInputAction: TextInputAction.search,
                                    onSubmitted: (val) =>
                                        onAiSearchSubmit(val),
                                    onChanged: (_) => onSearchChanged?.call(''),
                                    style: TextStyle(
                                      fontSize: 13,
                                      color: isDark
                                          ? Colors.white
                                          : AppColors.textPrimary,
                                    ),
                                    decoration: const InputDecoration(
                                      hintText:
                                          'Mô tả trải nghiệm (vd: cafe view biển)...',
                                      hintStyle: TextStyle(
                                        color: AppColors.textHint,
                                        fontSize: 12.5,
                                      ),
                                      border: InputBorder.none,
                                      isDense: true,
                                    ),
                                  ),
                                ),
                                if (aiController.text.isNotEmpty)
                                  GestureDetector(
                                    onTap: () {
                                      aiController.clear();
                                      onSearchChanged?.call('');
                                    },
                                    child: const Icon(
                                      Icons.close_rounded,
                                      size: 16,
                                      color: AppColors.textTertiary,
                                    ),
                                  ),
                              ],
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        SizedBox(
                          height: 42,
                          child: ElevatedButton(
                            onPressed: isAiLoading
                                ? null
                                : () => onAiSearchSubmit(aiController.text),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppColors.primary,
                              foregroundColor: Colors.white,
                              elevation: 0,
                              padding: const EdgeInsets.symmetric(
                                horizontal: 12,
                              ),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                            ),
                            child: isAiLoading
                                ? const SizedBox(
                                    width: 16,
                                    height: 16,
                                    child: CircularProgressIndicator(
                                      strokeWidth: 2,
                                      color: Colors.white,
                                    ),
                                  )
                                : const Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      Icon(Icons.send_rounded, size: 14),
                                      SizedBox(width: 4),
                                      Text(
                                        'Tìm AI',
                                        style: TextStyle(
                                          fontFamily: 'Be Vietnam Pro',
                                          fontSize: 12,
                                          fontWeight: FontWeight.w700,
                                        ),
                                      ),
                                    ],
                                  ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    // Các prompt gợi ý nhanh (đồng bộ Web)
                    SizedBox(
                      height: 28,
                      child: ListView.separated(
                        scrollDirection: Axis.horizontal,
                        itemCount: aiQuickPrompts.length,
                        separatorBuilder: (_, __) => const SizedBox(width: 6),
                        itemBuilder: (context, idx) {
                          final item = aiQuickPrompts[idx];
                          return GestureDetector(
                            onTap: isAiLoading
                                ? null
                                : () {
                                    aiController.text = item['query']!;
                                    onAiSearchSubmit(item['query']!);
                                  },
                            child: Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 10,
                                vertical: 4,
                              ),
                              decoration: BoxDecoration(
                                color: isDark
                                    ? const Color(0xFF0F172A)
                                    : const Color(0xFFF1F5F9),
                                borderRadius: BorderRadius.circular(14),
                              ),
                              child: Center(
                                child: Text(
                                  item['label']!,
                                  style: TextStyle(
                                    fontFamily: 'Be Vietnam Pro',
                                    fontSize: 11,
                                    fontWeight: FontWeight.w600,
                                    color: isDark
                                        ? Colors.white70
                                        : AppColors.textSecondary,
                                  ),
                                ),
                              ),
                            ),
                          );
                        },
                      ),
                    ),
                    if (hasAiResults) ...[
                      const SizedBox(height: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 10,
                          vertical: 7,
                        ),
                        decoration: BoxDecoration(
                          color: const Color(0xFFECFDF5),
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: const Color(0xFFA7F3D0)),
                        ),
                        child: Row(
                          children: [
                            const Icon(
                              Icons.auto_awesome,
                              size: 14,
                              color: Color(0xFF059669),
                            ),
                            const SizedBox(width: 6),
                            Expanded(
                              child: Text(
                                'AI xếp hạng cho: "$aiActiveQuery"',
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: const TextStyle(
                                  fontFamily: 'Be Vietnam Pro',
                                  fontSize: 11,
                                  fontWeight: FontWeight.w600,
                                  color: Color(0xFF065F46),
                                ),
                              ),
                            ),
                            GestureDetector(
                              onTap: onClearAi,
                              child: const Padding(
                                padding: EdgeInsets.only(left: 8),
                                child: Text(
                                  'Xóa AI',
                                  style: TextStyle(
                                    fontFamily: 'Be Vietnam Pro',
                                    fontSize: 11,
                                    fontWeight: FontWeight.w700,
                                    color: Color(0xFF047857),
                                    decoration: TextDecoration.underline,
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                    if (aiError != null && aiError!.isNotEmpty) ...[
                      const SizedBox(height: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 10,
                          vertical: 7,
                        ),
                        decoration: BoxDecoration(
                          color: Colors.red.shade50,
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: Colors.red.shade200),
                        ),
                        child: Row(
                          children: [
                            const Icon(
                              Icons.error_outline_rounded,
                              size: 15,
                              color: Colors.red,
                            ),
                            const SizedBox(width: 6),
                            Expanded(
                              child: Text(
                                aiError!,
                                style: const TextStyle(
                                  fontSize: 11,
                                  color: Colors.red,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ],
                ],
              ),
            ),
          ),
          if (!showAiInput) ...[
            const SizedBox(height: 10),
            SearchFilterChips(
              chips: SearchFilterModel.quickFilters,
              activeChips: activeChips,
              onToggle: onChipToggle,
            ),
          ],
        ],
      ),
    );
  }
}
