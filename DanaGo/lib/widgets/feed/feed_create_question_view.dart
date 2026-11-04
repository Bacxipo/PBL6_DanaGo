import 'package:flutter/material.dart';
import 'package:smarttrip/theme/app_colors.dart';

class FeedCreateQuestionView extends StatefulWidget {
  final TextEditingController titleController;
  final TextEditingController contentController;
  final Function(String category)? onCategorySelected;

  const FeedCreateQuestionView({
    super.key,
    required this.titleController,
    required this.contentController,
    this.onCategorySelected,
  });

  @override
  State<FeedCreateQuestionView> createState() => _FeedCreateQuestionViewState();
}

class _FeedCreateQuestionViewState extends State<FeedCreateQuestionView> {
  int _selectedCategoryIndex = 0;

  final List<Map<String, String>> _categories = const [
    {'emoji': '🍽️', 'title': 'Ăn uống & Quán ngon'},
    {'emoji': '🛵', 'title': 'Đi lại & Thuê xe'},
    {'emoji': '☀️', 'title': 'Thời tiết & Biển'},
    {'emoji': '💰', 'title': 'Chi phí & Budget'},
    {'emoji': '📸', 'title': 'Điểm chụp ảnh đẹp'},
    {'emoji': '👥', 'title': 'Tìm bạn đồng hành'},
  ];

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      children: [
        // Header: Category label
        const Row(
          children: [
            Icon(Icons.help_outline_rounded, size: 18, color: AppColors.primary),
            SizedBox(width: 6),
            Text(
              'CHỦ ĐỀ CÂU HỎI',
              style: TextStyle(
                fontFamily: 'Be Vietnam Pro',
                fontSize: 12,
                fontWeight: FontWeight.w700,
                color: AppColors.primary,
                letterSpacing: 0.5,
              ),
            ),
            Spacer(),
            Text(
              'Chọn 1 chủ đề',
              style: TextStyle(
                fontFamily: 'Be Vietnam Pro',
                fontSize: 11,
                color: AppColors.neutral,
              ),
            ),
          ],
        ),
        const SizedBox(height: 10),

        // Horizontal Categories Carousel
        SizedBox(
          height: 38,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            itemCount: _categories.length,
            separatorBuilder: (context, index) => const SizedBox(width: 8),
            itemBuilder: (context, index) {
              final item = _categories[index];
              final isSelected = _selectedCategoryIndex == index;

              return GestureDetector(
                onTap: () {
                  setState(() {
                    _selectedCategoryIndex = index;
                  });
                  widget.onCategorySelected?.call(
                    '${item['emoji']} ${item['title']}',
                  );
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

        // Question Title Field
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text(
              'TIÊU ĐỀ THẮC MẮC',
              style: TextStyle(
                fontFamily: 'Be Vietnam Pro',
                fontSize: 12,
                fontWeight: FontWeight.w700,
                color: AppColors.textPrimary,
              ),
            ),
            ValueListenableBuilder<TextEditingValue>(
              valueListenable: widget.titleController,
              builder: (context, value, _) {
                return Text(
                  '${value.text.length}/90',
                  style: const TextStyle(
                    fontFamily: 'Be Vietnam Pro',
                    fontSize: 11,
                    color: AppColors.neutral,
                  ),
                );
              },
            ),
          ],
        ),
        const SizedBox(height: 6),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: AppColors.borderLight),
          ),
          child: TextField(
            controller: widget.titleController,
            maxLength: 90,
            decoration: const InputDecoration(
              hintText: 'VD: Quán hải sản tươi ngon giá hợp lý gần biển Mỹ Khê?',
              hintStyle: TextStyle(
                fontFamily: 'Be Vietnam Pro',
                fontSize: 13,
                color: AppColors.textHint,
              ),
              border: InputBorder.none,
              counterText: '',
            ),
            style: const TextStyle(
              fontFamily: 'Be Vietnam Pro',
              fontSize: 14,
              fontWeight: FontWeight.w700,
              color: AppColors.textPrimary,
            ),
          ),
        ),
        const SizedBox(height: 14),

        // Question Details Textarea
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: const [
            Text(
              'CHI TIẾT CÂU HỎI',
              style: TextStyle(
                fontFamily: 'Be Vietnam Pro',
                fontSize: 12,
                fontWeight: FontWeight.w700,
                color: AppColors.textPrimary,
              ),
            ),
            Text(
              'Càng rõ càng tốt',
              style: TextStyle(
                fontFamily: 'Be Vietnam Pro',
                fontSize: 11,
                color: AppColors.neutral,
              ),
            ),
          ],
        ),
        const SizedBox(height: 6),
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: AppColors.borderLight),
          ),
          child: TextField(
            controller: widget.contentController,
            maxLines: 5,
            decoration: const InputDecoration(
              hintText:
                  'Mô tả chi tiết thắc mắc của bạn (thời gian đi, số lượng người, sở thích cụ thể để cộng đồng thổ địa Đà Nẵng tư vấn chuẩn xác nhất)...',
              hintStyle: TextStyle(
                fontFamily: 'Be Vietnam Pro',
                fontSize: 13,
                height: 1.45,
                color: AppColors.textHint,
              ),
              border: InputBorder.none,
            ),
            style: const TextStyle(
              fontFamily: 'Be Vietnam Pro',
              fontSize: 14,
              height: 1.45,
              color: AppColors.textPrimary,
            ),
          ),
        ),
        const SizedBox(height: 16),

        // Attach images (Max 3)
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: const [
            Text(
              'HÌNH ẢNH ĐÍNH KÈM',
              style: TextStyle(
                fontFamily: 'Be Vietnam Pro',
                fontSize: 12,
                fontWeight: FontWeight.w700,
                color: AppColors.textPrimary,
              ),
            ),
            Text(
              'Tối đa 3 ảnh',
              style: TextStyle(
                fontFamily: 'Be Vietnam Pro',
                fontSize: 11,
                color: AppColors.neutral,
              ),
            ),
          ],
        ),
        const SizedBox(height: 8),
        Row(
          children: [
            Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                color: const Color(0xFFF8FAFC),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: AppColors.primary.withValues(alpha: 0.3),
                ),
              ),
              child: const Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.add_photo_alternate_outlined,
                    size: 24,
                    color: AppColors.primary,
                  ),
                  SizedBox(height: 4),
                  Text(
                    'Thêm ảnh',
                    style: TextStyle(
                      fontFamily: 'Be Vietnam Pro',
                      fontSize: 11,
                      color: AppColors.primary,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),

        // Community Q&A Guidelines
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: const Color(0xFFF0FDF4),
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: const Color(0xFFBBF7D0)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Row(
                children: [
                  Icon(
                    Icons.lightbulb_outline_rounded,
                    size: 18,
                    color: Color(0xFF16A34A),
                  ),
                  SizedBox(width: 6),
                  Text(
                    'Văn hóa hỏi đáp Smart Trip Đà Nẵng',
                    style: TextStyle(
                      fontFamily: 'Be Vietnam Pro',
                      fontSize: 13,
                      fontWeight: FontWeight.w700,
                      color: Color(0xFF15803D),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              _buildGuidelineItem(
                'Tôn trọng người chia sẻ & người dân bản địa Đà Nẵng.',
              ),
              _buildGuidelineItem(
                'Ghi rõ khoảng ngân sách ước tính để nhận gợi ý quán phù hợp.',
              ),
              _buildGuidelineItem(
                'Thả tim hoặc bấm "Hữu ích" cho câu trả lời bạn tâm đắc nhất nhé!',
              ),
            ],
          ),
        ),
        const SizedBox(height: 24),
      ],
    );
  }

  Widget _buildGuidelineItem(String text) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 3),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            '• ',
            style: TextStyle(
              color: Color(0xFF16A34A),
              fontWeight: FontWeight.bold,
            ),
          ),
          Expanded(
            child: Text(
              text,
              style: const TextStyle(
                fontFamily: 'Be Vietnam Pro',
                fontSize: 11.5,
                color: Color(0xFF166534),
                height: 1.35,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
