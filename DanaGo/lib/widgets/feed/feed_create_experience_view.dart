import 'package:flutter/material.dart';
import 'package:smarttrip/theme/app_colors.dart';

class FeedCreateExperienceView extends StatefulWidget {
  final TextEditingController titleController;
  final TextEditingController contentController;
  final Function(double rating)? onRatingChanged;
  final List<String> selectedImages;
  final VoidCallback? onAddImage;

  const FeedCreateExperienceView({
    super.key,
    required this.titleController,
    required this.contentController,
    this.onRatingChanged,
    this.selectedImages = const [],
    this.onAddImage,
  });

  @override
  State<FeedCreateExperienceView> createState() =>
      _FeedCreateExperienceViewState();
}

class _FeedCreateExperienceViewState extends State<FeedCreateExperienceView> {
  double _rating = 5.0;
  final String _selectedDestination = 'Bán đảo Sơn Trà & Đỉnh Bàn Cờ';
  final String _selectedItinerary = 'Lịch trình Đà Nẵng 3N2Đ - Ngày 1';
  late final TextEditingController _costController;

  final List<String> _suggestedHashtags = const [
    '#CheckInDaNang',
    '#SonTra',
    '#MyKheBeach',
    '#BanhTrangCuon',
    '#DaNangTrip',
  ];

  @override
  void initState() {
    super.initState();
    _costController = TextEditingController(text: '~150.000 đ / người');
  }

  void _addHashtag(String tag) {
    final current = widget.contentController.text;
    if (!current.contains(tag)) {
      final updated = current.isEmpty ? '$tag ' : '$current $tag ';
      widget.contentController.value = TextEditingValue(
        text: updated,
        selection: TextSelection.collapsed(offset: updated.length),
      );
    }
  }

  @override
  void dispose() {
    _costController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return ListView(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      children: [
        // Author & Quick Star Rating
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: Theme.of(context).cardColor,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: isDark ? Colors.white10 : AppColors.borderLight,
            ),
          ),
          child: Row(
            children: [
              ClipOval(
                child: Image.network(
                  'https://i.postimg.cc/tC24nW4N/avt1.jpg',
                  width: 40,
                  height: 40,
                  fit: BoxFit.cover,
                  errorBuilder: (_, __, ___) => Container(
                    width: 40,
                    height: 40,
                    color: AppColors.primaryLight,
                    child: const Icon(Icons.person, color: AppColors.primary, size: 22),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              const Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Bạn (Người dùng)',
                      style: TextStyle(
                        fontFamily: 'Be Vietnam Pro',
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    Text(
                      'Công khai • Chia sẻ kinh nghiệm',
                      style: TextStyle(
                        fontFamily: 'Be Vietnam Pro',
                        fontSize: 11,
                        color: AppColors.neutral,
                      ),
                    ),
                  ],
                ),
              ),
              // Star Rating
              Row(
                mainAxisSize: MainAxisSize.min,
                children: List.generate(5, (index) {
                  final starVal = index + 1.0;
                  return GestureDetector(
                    onTap: () {
                      setState(() {
                        _rating = starVal;
                      });
                      widget.onRatingChanged?.call(_rating);
                    },
                    child: Icon(
                      _rating >= starVal
                          ? Icons.star_rounded
                          : Icons.star_border_rounded,
                      size: 22,
                      color: AppColors.starActive,
                    ),
                  );
                }),
              ),
            ],
          ),
        ),
        const SizedBox(height: 14),

        // Title Input
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
            controller: widget.titleController,
            decoration: const InputDecoration(
              hintText:
                  'Tiêu đề bài viết (VD: Sáng săn mây Sơn Trà ngắm trọn Mỹ Khê...)',
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
        const SizedBox(height: 12),

        // Content Input with char counter
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: Theme.of(context).cardColor,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(
              color: isDark ? Colors.white10 : AppColors.borderLight,
            ),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              TextField(
                controller: widget.contentController,
                maxLines: 5,
                decoration: const InputDecoration(
                  hintText:
                      'Bạn đã có trải nghiệm gì tuyệt vời tại Đà Nẵng hôm nay? Chia sẻ mẹo chụp ảnh, quán xá ngon lành hay kinh nghiệm vi vu thú vị nhé...',
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
              const SizedBox(height: 6),
              ValueListenableBuilder<TextEditingValue>(
                valueListenable: widget.contentController,
                builder: (context, value, _) {
                  return Align(
                    alignment: Alignment.centerRight,
                    child: Text(
                      '${value.text.length}/1500',
                      style: const TextStyle(
                        fontFamily: 'Be Vietnam Pro',
                        fontSize: 11,
                        color: AppColors.neutral,
                      ),
                    ),
                  );
                },
              ),
            ],
          ),
        ),
        const SizedBox(height: 12),

        // Quick Hashtags Carousel
        SizedBox(
          height: 32,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            itemCount: _suggestedHashtags.length,
            separatorBuilder: (context, index) => const SizedBox(width: 8),
            itemBuilder: (context, index) {
              final tag = _suggestedHashtags[index];
              return InkWell(
                onTap: () => _addHashtag(tag),
                borderRadius: BorderRadius.circular(16),
                child: Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 10,
                    vertical: 6,
                  ),
                  decoration: BoxDecoration(
                    color: const Color(0xFFEFF5F5),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(
                      color: AppColors.primary.withValues(alpha: 0.2),
                    ),
                  ),
                  child: Text(
                    tag,
                    style: const TextStyle(
                      fontFamily: 'Be Vietnam Pro',
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                      color: AppColors.primary,
                    ),
                  ),
                ),
              );
            },
          ),
        ),
        const SizedBox(height: 14),

        // Images Attachment Section
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
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Hình ảnh & Clip đính kèm',
                    style: TextStyle(
                      fontFamily: 'Be Vietnam Pro',
                      fontSize: 13,
                      fontWeight: FontWeight.w700,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  Text(
                    '${widget.selectedImages.length}/10',
                    style: const TextStyle(
                      fontFamily: 'Be Vietnam Pro',
                      fontSize: 12,
                      color: AppColors.neutral,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 10),
              InkWell(
                onTap: widget.onAddImage,
                borderRadius: BorderRadius.circular(12),
                child: Container(
                  height: 100,
                  width: double.infinity,
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
                      Icon(
                        Icons.add_photo_alternate_outlined,
                        size: 32,
                        color: AppColors.primary.withValues(alpha: 0.8),
                      ),
                      const SizedBox(height: 6),
                      const Text(
                        'Thêm ảnh hoặc video hành trình',
                        style: TextStyle(
                          fontFamily: 'Be Vietnam Pro',
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: AppColors.primary,
                        ),
                      ),
                      const Text(
                        '(Tối đa 10 ảnh chất lượng cao)',
                        style: TextStyle(
                          fontFamily: 'Be Vietnam Pro',
                          fontSize: 10,
                          color: AppColors.neutral,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 14),

        // Linked Travel Info Box
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
              const Row(
                children: [
                  Icon(Icons.link_rounded, size: 18, color: AppColors.primary),
                  SizedBox(width: 6),
                  Text(
                    'Đính kèm thông tin du lịch',
                    style: TextStyle(
                      fontFamily: 'Be Vietnam Pro',
                      fontSize: 13,
                      fontWeight: FontWeight.w700,
                      color: AppColors.textPrimary,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              // Destination selector
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 12,
                  vertical: 10,
                ),
                decoration: BoxDecoration(
                  color: const Color(0xFFEFF5F5),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Row(
                  children: [
                    const Icon(
                      Icons.location_on_rounded,
                      size: 18,
                      color: AppColors.accent,
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            _selectedDestination,
                            style: const TextStyle(
                              fontFamily: 'Be Vietnam Pro',
                              fontSize: 13,
                              fontWeight: FontWeight.w700,
                              color: AppColors.primary,
                            ),
                          ),
                          const Text(
                            'Đã xác thực • Phường Thọ Quang, Sơn Trà',
                            style: TextStyle(
                              fontFamily: 'Be Vietnam Pro',
                              fontSize: 11,
                              color: AppColors.neutral,
                            ),
                          ),
                        ],
                      ),
                    ),
                    TextButton(
                      onPressed: () {},
                      child: const Text(
                        'Đổi',
                        style: TextStyle(
                          fontFamily: 'Be Vietnam Pro',
                          fontSize: 12,
                          color: AppColors.primary,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 10),
              // Itinerary Link
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 12,
                  vertical: 10,
                ),
                decoration: BoxDecoration(
                  color: const Color(0xFFEFF5F5),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Row(
                  children: [
                    const Icon(
                      Icons.calendar_month_rounded,
                      size: 18,
                      color: AppColors.primary,
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            _selectedItinerary,
                            style: const TextStyle(
                              fontFamily: 'Be Vietnam Pro',
                              fontSize: 13,
                              fontWeight: FontWeight.w700,
                              color: AppColors.textPrimary,
                            ),
                          ),
                          const Text(
                            'Cho phép bạn đọc lưu trực tiếp vào chuyến đi',
                            style: TextStyle(
                              fontFamily: 'Be Vietnam Pro',
                              fontSize: 11,
                              color: AppColors.neutral,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 10),
              // Cost Estimate
              Row(
                children: [
                  const Text(
                    'Chi phí gợi ý:',
                    style: TextStyle(
                      fontFamily: 'Be Vietnam Pro',
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: AppColors.textSecondary,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Container(
                      height: 36,
                      padding: const EdgeInsets.symmetric(horizontal: 10),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF3F4F6),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: TextField(
                        controller: _costController,
                        decoration: const InputDecoration(
                          border: InputBorder.none,
                          isDense: true,
                          contentPadding: EdgeInsets.symmetric(vertical: 8),
                        ),
                        style: const TextStyle(
                          fontFamily: 'Be Vietnam Pro',
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: AppColors.textPrimary,
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

        // Community guidelines
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: const Color(0xFFF0FDF4),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: const Color(0xFFBBF7D0)),
          ),
          child: const Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Icon(Icons.shield_outlined, size: 18, color: Color(0xFF16A34A)),
              SizedBox(width: 8),
              Expanded(
                child: Text(
                  'Quy tắc cộng đồng: Bài viết cần chia sẻ thông tin văn minh, hình ảnh chân thực và tôn trọng người dân địa phương Đà Nẵng.',
                  style: TextStyle(
                    fontFamily: 'Be Vietnam Pro',
                    fontSize: 11,
                    height: 1.4,
                    color: Color(0xFF15803D),
                  ),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 24),
      ],
    );
  }
}
