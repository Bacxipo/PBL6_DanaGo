import 'package:flutter/material.dart';
import 'package:smarttrip/models/destination_item.dart';
import 'package:smarttrip/theme/app_colors.dart';
import 'package:flutter_svg/svg.dart';
import 'package:smarttrip/services/auth_service.dart';
import 'package:smarttrip/services/destination_service.dart';
import 'dart:io';

class FeedCreateExperienceView extends StatefulWidget {
  final TextEditingController titleController;
  final TextEditingController contentController;
  final Function(double rating)? onRatingChanged;
  final List<String> selectedImages;
  final VoidCallback? onAddImage;
  final Function(int? destinationId)? onDestinationSelected;
  final Function(int index)? onRemoveImage;

  const FeedCreateExperienceView({
    super.key,
    required this.titleController,
    required this.contentController,
    this.onRatingChanged,
    this.selectedImages = const [],
    this.onAddImage,
    this.onDestinationSelected,
    this.onRemoveImage,
  });

  @override
  State<FeedCreateExperienceView> createState() =>
      _FeedCreateExperienceViewState();
}

class _FeedCreateExperienceViewState extends State<FeedCreateExperienceView> {
  double _rating = 5.0;
  String _userName = 'Bạn';
  String _userAvatar = '';
  String _selectedDestinationName = '';
  int? _selectedDestinationId;
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
    _loadUser();
  }

  Future<void> _loadUser() async {
    final p = await AuthService.instance.getProfile();
    if (p != null && mounted) {
      setState(() {
        _userName = p['fullName'] as String? ?? 'Bạn';
        _userAvatar = p['avatarUrl'] as String? ?? '';
      });
    }
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

  Future<void> _pickDestination() async {
    final list = await DestinationService.instance.getAll();
    if (!mounted) return;
    final chosen = await showModalBottomSheet<DestinationItem>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: ((cxt) {
        String query = '';
        return StatefulBuilder(
          builder: (context, setSheetState) {
            final isDarkSheet = Theme.of(context).brightness == Brightness.dark;
            final filtered = list.where((d) {
              final q = query.toLowerCase().trim();
              return d.title.toLowerCase().contains(q) ||
                  d.category.toLowerCase().contains(q);
            }).toList();
            return Container(
              height: MediaQuery.of(context).size.height * 0.7,
              decoration: BoxDecoration(
                color: Theme.of(context).cardColor,
                borderRadius: const BorderRadius.vertical(
                  top: Radius.circular(20),
                ),
              ),
              child: Column(
                children: [
                  Container(
                    margin: const EdgeInsets.symmetric(vertical: 8),
                    width: 40,
                    height: 4,
                    decoration: BoxDecoration(
                      color: isDarkSheet
                          ? Colors.white24
                          : Colors.grey.shade300,
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 4,
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Chọn địa điểm gắn kèm',
                          style: TextStyle(
                            fontFamily: 'Be Vietnam Pro',
                            fontSize: 16,
                            fontWeight: FontWeight.w700,
                            color: isDarkSheet
                                ? Colors.white
                                : AppColors.textPrimary,
                          ),
                        ),
                        IconButton(
                          icon: Icon(
                            Icons.close_rounded,
                            size: 20,
                            color: isDarkSheet
                                ? Colors.white70
                                : Colors.black87,
                          ),
                          onPressed: () => Navigator.pop(context),
                        ),
                      ],
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 6,
                    ),
                    child: TextField(
                      onChanged: (val) => setSheetState(() => query = val),
                      decoration: InputDecoration(
                        hintText: 'Tìm địa điểm (Sơn Trà, Mỹ Khê...)...',
                        hintStyle: TextStyle(
                          color: isDarkSheet
                              ? Colors.white38
                              : AppColors.textHint,
                          fontSize: 13,
                        ),
                        prefixIcon: Icon(
                          Icons.search,
                          size: 20,
                          color: isDarkSheet
                              ? Colors.white54
                              : AppColors.neutral,
                        ),
                        isDense: true,
                        filled: true,
                        fillColor: isDarkSheet
                            ? const Color(0xFF1E293B)
                            : const Color(0xFFF3F4F6),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: BorderSide.none,
                        ),
                      ),
                    ),
                  ),
                  Expanded(
                    child: filtered.isEmpty
                        ? Center(
                            child: Text(
                              'Không tìm thấy địa điểm nào',
                              style: TextStyle(
                                color: isDarkSheet
                                    ? Colors.black54
                                    : AppColors.neutral,
                              ),
                            ),
                          )
                        : ListView.separated(
                            itemBuilder: (_, i) {
                              final d = filtered[i];
                              return ListTile(
                                leading: ClipRRect(
                                  borderRadius: BorderRadius.circular(8),
                                  child: Image.network(
                                    d.imageUrl,
                                    width: 44,
                                    height: 44,
                                    fit: BoxFit.cover,
                                    errorBuilder: (_, __, ___) => Container(
                                      width: 44,
                                      height: 44,
                                      color: isDarkSheet
                                          ? const Color(0xFF1E293B)
                                          : AppColors.primaryLight,
                                      child: const Icon(
                                        Icons.place,
                                        color: AppColors.primary,
                                        size: 20,
                                      ),
                                    ),
                                  ),
                                ),
                                title: Text(
                                  d.title,
                                  style: TextStyle(
                                    fontSize: 14,
                                    color: isDarkSheet
                                        ? Colors.white
                                        : AppColors.textPrimary,
                                  ),
                                ),
                                subtitle: Text(
                                  d.category,
                                  style: TextStyle(
                                    fontSize: 12,
                                    color: isDarkSheet
                                        ? Colors.white54
                                        : AppColors.neutral,
                                  ),
                                ),
                                onTap: () => Navigator.pop(context, d),
                              );
                            },
                            separatorBuilder: (_, __) =>
                                const Divider(height: 1),
                            itemCount: filtered.length,
                          ),
                  ),
                ],
              ),
            );
          },
        );
      }),
    );
    if (chosen != null && mounted) {
      setState(() {
        _selectedDestinationId = int.tryParse(chosen.id);
        _selectedDestinationName = chosen.title;
        widget.onDestinationSelected?.call(_selectedDestinationId);
      });
    }
  }

  @override
  void dispose() {
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
                child: _userAvatar.isNotEmpty
                    ? Image.network(
                        _userAvatar,
                        width: 40,
                        height: 40,
                        fit: BoxFit.cover,
                      )
                    : SvgPicture.asset(
                        'assets/images/default-avatar.svg',
                        width: 40,
                        height: 40,
                        fit: BoxFit.cover,
                      ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      _userName,
                      style: TextStyle(
                        fontFamily: 'Be Vietnam Pro',
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                        color: isDark ? Colors.white : AppColors.textPrimary,
                      ),
                    ),
                    const Text(
                      'Chia sẻ kinh nghiệm • Công khai',
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
              hintText: 'Tiêu đề bài viết (VD: Sáng săn mây Sơn Trà...)',
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
                style: TextStyle(
                  fontFamily: 'Be Vietnam Pro',
                  fontSize: 14,
                  height: 1.45,
                  color: isDark ? Colors.white : AppColors.textPrimary,
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
                    color: isDark
                        ? const Color(0xFF1E293B)
                        : const Color(0xFFEFF5F5),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(
                      color: AppColors.primary.withValues(
                        alpha: isDark ? 0.4 : 0.2,
                      ),
                    ),
                  ),
                  child: Text(
                    tag,
                    style: TextStyle(
                      fontFamily: 'Be Vietnam Pro',
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                      color: isDark
                          ? const Color(0xFF38BDF8)
                          : AppColors.primary,
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
                  Text(
                    'Hình ảnh & Clip đính kèm',
                    style: TextStyle(
                      fontFamily: 'Be Vietnam Pro',
                      fontSize: 13,
                      fontWeight: FontWeight.w700,
                      color: isDark ? Colors.white : AppColors.textPrimary,
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
              if (widget.selectedImages.isNotEmpty) ...[
                SizedBox(
                  height: 90,
                  child: ListView.separated(
                    scrollDirection: Axis.horizontal,
                    itemCount: widget.selectedImages.length + 1,
                    separatorBuilder: (_, __) => const SizedBox(width: 8),
                    itemBuilder: (context, index) {
                      if (index == widget.selectedImages.length) {
                        return InkWell(
                          onTap: widget.onAddImage,
                          child: Container(
                            width: 80,
                            decoration: BoxDecoration(
                              color: isDark
                                  ? const Color(0xFF1E293B)
                                  : const Color(0xFFF8FAFC),
                              borderRadius: BorderRadius.circular(10),
                              border: Border.all(
                                color: AppColors.primary.withValues(alpha: 0.3),
                              ),
                            ),
                            child: const Icon(
                              Icons.add_photo_alternate_outlined,
                              color: AppColors.primary,
                            ),
                          ),
                        );
                      }
                      return Stack(
                        children: [
                          ClipRRect(
                            borderRadius: BorderRadius.circular(10),
                            child: Image.file(
                              File(widget.selectedImages[index]),
                              width: 80,
                              height: 90,
                              fit: BoxFit.cover,
                            ),
                          ),
                          Positioned(
                            top: 3,
                            right: 3,
                            child: GestureDetector(
                              onTap: () => widget.onRemoveImage?.call(index),
                              child: Container(
                                padding: const EdgeInsets.all(2),
                                decoration: const BoxDecoration(
                                  color: Colors.black54,
                                  shape: BoxShape.circle,
                                ),
                                child: const Icon(
                                  Icons.close,
                                  size: 14,
                                  color: Colors.white,
                                ),
                              ),
                            ),
                          ),
                        ],
                      );
                    },
                  ),
                ),
              ] else
                InkWell(
                  onTap: widget.onAddImage,
                  borderRadius: BorderRadius.circular(12),
                  child: Container(
                    height: 90,
                    width: double.infinity,
                    decoration: BoxDecoration(
                      color: isDark
                          ? const Color(0xFF1E293B)
                          : const Color(0xFFF8FAFC),
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
                          size: 28,
                          color: isDark
                              ? const Color(0xFF38BDF8)
                              : AppColors.primary,
                        ),
                        const SizedBox(height: 6),
                        Text(
                          'Thêm ảnh hoặc video hành trình',
                          style: TextStyle(
                            fontFamily: 'Be Vietnam Pro',
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                            color: isDark
                                ? const Color(0xFF38BDF8)
                                : AppColors.primary,
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
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
          decoration: BoxDecoration(
            color: Theme.of(context).cardColor,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(
              color: isDark ? Colors.white10 : AppColors.borderLight,
            ),
          ),
          child: Row(
            children: [
              const Icon(
                Icons.location_on_rounded,
                size: 18,
                color: AppColors.accent,
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  _selectedDestinationName.isEmpty
                      ? 'Gắn địa điểm (không bắt buộc)'
                      : _selectedDestinationName,
                  style: TextStyle(
                    fontFamily: 'Be Vietnam Pro',
                    fontSize: 13,
                    fontWeight: _selectedDestinationName.isEmpty
                        ? FontWeight.w400
                        : FontWeight.w600,
                    color: _selectedDestinationName.isEmpty
                        ? AppColors.textHint
                        : AppColors.primary,
                  ),
                ),
              ),
              if (_selectedDestinationName.isNotEmpty)
                IconButton(
                  onPressed: () {
                    setState(() {
                      _selectedDestinationId = null;
                      _selectedDestinationName = '';
                    });
                    widget.onDestinationSelected?.call(null);
                  },
                  icon: const Icon(
                    Icons.close_rounded,
                    size: 18,
                    color: AppColors.neutral,
                  ),
                ),
              TextButton(
                onPressed: _pickDestination,
                child: Text(
                  _selectedDestinationName.isEmpty ? 'Chọn' : 'Đổi',
                  style: const TextStyle(
                    fontFamily: 'Be Vietnam Pro',
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 14),
        // Community guidelines
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: isDark
                ? const Color(0xFF064E3B).withValues(alpha: 0.3)
                : const Color(0xFFF0FDF4),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: isDark
                  ? const Color(0xFF059669).withValues(alpha: 0.4)
                  : const Color(0xFFBBF7D0),
            ),
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Icon(
                Icons.shield_outlined,
                size: 18,
                color: Color(0xFF16A34A),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  'Quy tắc cộng đồng: Bài viết cần chia sẻ thông tin văn minh, hình ảnh chân thực và tôn trọng người dân địa phương Đà Nẵng.',
                  style: TextStyle(
                    fontFamily: 'Be Vietnam Pro',
                    fontSize: 11,
                    height: 1.4,
                    color: isDark
                        ? const Color(0xFF86EFAC)
                        : const Color(0xFF15803D),
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
