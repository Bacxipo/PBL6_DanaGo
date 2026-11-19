import 'dart:io';

import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:smarttrip/models/user_review_model.dart';
import 'package:smarttrip/services/review_service.dart';
import 'package:smarttrip/theme/app_colors.dart';
import 'package:smarttrip/widgets/reviews/my_review_card.dart';
import 'package:smarttrip/widgets/reviews/review_stats_header.dart';
import 'package:smarttrip/services/destination_service.dart';

class MyReviewsScreen extends StatefulWidget {
  const MyReviewsScreen({super.key});

  @override
  State<MyReviewsScreen> createState() => _MyReviewsScreenState();
}

class _MyReviewsScreenState extends State<MyReviewsScreen> {
  List<UserReviewModel> _reviews = [];
  String _selectedFilter = 'Tất cả';

  final List<String> _filters = ['Tất cả', '5 sao', '4 sao', 'Có hình ảnh'];

  @override
  void initState() {
    super.initState();
    _loadMyReviews();
  }

  Future<void> _loadMyReviews() async {
    final raw = await ReviewService.instance.getMyReviews();
    final destinations = await DestinationService.instance.getAll();
    final destMap = {for (final d in destinations) d.id: d};
    if (mounted) {
      setState(() {
        _reviews = raw.map((json) {
          final dest = destMap[json['destinationId'].toString()];
          if (dest != null) {
            json['destination'] = {
              'name': dest.title,
              'district': dest.address,
              'imageUrl': dest.imageUrl,
            };
          }
          return UserReviewModel.fromJson(json);
        }).toList();
      });
    }
  }

  List<UserReviewModel> get _filteredReviews {
    return _reviews.where((r) {
      if (_selectedFilter == '5 sao') return r.rating >= 4.8;
      if (_selectedFilter == '4 sao') return r.rating >= 3.8 && r.rating < 4.8;
      if (_selectedFilter == 'Có hình ảnh') return r.photos.isNotEmpty;
      return true;
    }).toList();
  }

  void _confirmDeleteReview(UserReviewModel review) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text(
          'Xóa đánh giá?',
          style: TextStyle(
            fontFamily: 'Be Vietnam Pro',
            fontWeight: FontWeight.w700,
            fontSize: 18,
          ),
        ),
        content: Text(
          'Bạn có chắc chắn muốn xóa bài đánh giá cho "${review.placeTitle}" không? Hành động này không thể hoàn tác.',
          style: const TextStyle(
            fontFamily: 'Be Vietnam Pro',
            fontSize: 14,
            color: AppColors.textSecondary,
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text(
              'Hủy',
              style: TextStyle(
                fontFamily: 'Be Vietnam Pro',
                color: AppColors.neutral,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.error,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
            ),
            onPressed: () async {
              Navigator.pop(ctx);
              await ReviewService.instance.deleteReview(review.id);
              setState(() {
                _reviews.removeWhere((item) => item.id == review.id);
              });
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Đã xóa đánh giá thành công')),
              );
            },
            child: const Text(
              'Xóa',
              style: TextStyle(
                fontFamily: 'Be Vietnam Pro',
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _showEditSheet(UserReviewModel review) {
    final textCtrl = TextEditingController(text: review.content);
    double selectedRating = review.rating;
    final List<String> keptPhotos = List.from(review.photos);
    final List<XFile> newImages = [];
    bool isSaving = false;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Theme.of(context).cardColor,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setModalState) => Padding(
          padding: EdgeInsets.fromLTRB(
            16,
            16,
            16,
            MediaQuery.of(ctx).viewInsets.bottom + 16,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Text(
                      'Sửa đánh giá: ${review.placeTitle}',
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close_rounded),
                    onPressed: () => Navigator.pop(ctx),
                  ),
                ],
              ),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: List.generate(5, (i) {
                  final star = i + 1.0;
                  return IconButton(
                    icon: Icon(
                      star <= selectedRating ? Icons.star : Icons.star_border,
                      color: Colors.amber,
                      size: 30,
                    ),
                    onPressed: () => setModalState(() => selectedRating = star),
                  );
                }),
              ),
              TextField(
                controller: textCtrl,
                maxLines: 3,
                decoration: InputDecoration(
                  filled: true,
                  fillColor: AppColors.bgSecondary,
                  hintText: 'Nhập nội dung đánh giá...',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide.none,
                  ),
                ),
              ),
              const SizedBox(height: 12),
              OutlinedButton.icon(
                onPressed: () async {
                  final remain = 5 - keptPhotos.length - newImages.length;
                  if (remain <= 0) return;
                  final imgs = await ImagePicker().pickMultiImage(
                    limit: remain,
                  );
                  if (imgs.isNotEmpty)
                    setModalState(() => newImages.addAll(imgs.take(remain)));
                },
                icon: const Icon(Icons.add_photo_alternate_outlined, size: 18),
                label: Text(
                  'Thêm ảnh (${keptPhotos.length + newImages.length}/5)',
                ),
              ),
              if (keptPhotos.isNotEmpty || newImages.isNotEmpty) ...[
                const SizedBox(height: 8),
                SizedBox(
                  height: 68,
                  child: ListView(
                    scrollDirection: Axis.horizontal,
                    children: [
                      // Ảnh cũ (trên mạng) -> Bấm X để xóa
                      ...keptPhotos.asMap().entries.map(
                        (e) => Padding(
                          padding: const EdgeInsets.only(right: 8),
                          child: Stack(
                            children: [
                              ClipRRect(
                                borderRadius: BorderRadius.circular(8),
                                child: Image.network(
                                  e.value,
                                  width: 68,
                                  height: 68,
                                  fit: BoxFit.cover,
                                ),
                              ),
                              Positioned(
                                top: 2,
                                right: 2,
                                child: GestureDetector(
                                  onTap: () => setModalState(
                                    () => keptPhotos.removeAt(e.key),
                                  ),
                                  child: const CircleAvatar(
                                    radius: 9,
                                    backgroundColor: Colors.black54,
                                    child: Icon(
                                      Icons.close,
                                      size: 12,
                                      color: Colors.white,
                                    ),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                      // Ảnh mới chọn từ máy -> Bấm X để bỏ
                      ...newImages.asMap().entries.map(
                        (e) => Padding(
                          padding: const EdgeInsets.only(right: 8),
                          child: Stack(
                            children: [
                              ClipRRect(
                                borderRadius: BorderRadius.circular(8),
                                child: Image.file(
                                  File(e.value.path),
                                  width: 68,
                                  height: 68,
                                  fit: BoxFit.cover,
                                ),
                              ),
                              Positioned(
                                top: 2,
                                right: 2,
                                child: GestureDetector(
                                  onTap: () => setModalState(
                                    () => newImages.removeAt(e.key),
                                  ),
                                  child: const CircleAvatar(
                                    radius: 9,
                                    backgroundColor: Colors.black54,
                                    child: Icon(
                                      Icons.close,
                                      size: 12,
                                      color: Colors.white,
                                    ),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                height: 48,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  onPressed: () async {
                    if (isSaving) return;
                    setModalState(() => isSaving = true);
                    final ok = await ReviewService.instance.updateReview(
                      reviewId: review.id,
                      rating: selectedRating.toInt(),
                      comment: textCtrl.text.trim(),
                      keptImageUrls: keptPhotos,
                      newImagePaths: newImages.map((e) => e.path).toList(),
                    );
                    if (!ctx.mounted) return;
                    Navigator.pop(ctx);
                    if (ok) {
                      _loadMyReviews();
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text('Đã cập nhật đánh giá thành công!'),
                        ),
                      );
                    }
                  },
                  child: const Text(
                    'Lưu thay đổi',
                    style: TextStyle(fontWeight: FontWeight.w700, fontSize: 15),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // void _openPlaceDetail(String placeId) {
  //   Navigator.push(
  //     context,
  //     MaterialPageRoute(builder: (_) => DetailPlaceScreen(item: target)),
  //   );
  // }

  @override
  Widget build(BuildContext context) {
    final list = _filteredReviews;
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final double avg = _reviews.isEmpty
        ? 0.0
        : _reviews.map((r) => r.rating).reduce((a, b) => a + b) /
              _reviews.length;
    final int totalHelpful = _reviews.isEmpty
        ? 0
        : _reviews.map((r) => r.helpfulCount).reduce((a, b) => a + b);

    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      appBar: AppBar(
        backgroundColor: Theme.of(context).cardColor,
        elevation: 0,
        leading: IconButton(
          icon: Icon(
            Icons.arrow_back_ios_new_rounded,
            color: isDark ? Colors.white : AppColors.textPrimary,
            size: 20,
          ),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          'Đánh giá của tôi',
          style: TextStyle(
            fontFamily: 'Be Vietnam Pro',
            fontSize: 18,
            fontWeight: FontWeight.w700,
            color: isDark ? Colors.white : AppColors.textPrimary,
          ),
        ),
        centerTitle: true,
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(1),
          child: Container(
            color: isDark ? Colors.white12 : AppColors.divider,
            height: 1,
          ),
        ),
      ),
      body: CustomScrollView(
        physics: const BouncingScrollPhysics(),
        slivers: [
          // Stats summary banner
          SliverToBoxAdapter(
            child: ReviewStatsHeader(
              averageRating: avg,
              totalReviews: _reviews.length,
              totalHelpful: totalHelpful,
            ),
          ),

          // Filter chips
          SliverToBoxAdapter(
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
              physics: const BouncingScrollPhysics(),
              child: Row(
                children: _filters.map((f) {
                  final isSelected = _selectedFilter == f;
                  return Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: ChoiceChip(
                      label: Text(f),
                      selected: isSelected,
                      onSelected: (selected) {
                        if (selected) {
                          setState(() {
                            _selectedFilter = f;
                          });
                        }
                      },
                      labelStyle: TextStyle(
                        fontFamily: 'Be Vietnam Pro',
                        fontSize: 12,
                        fontWeight: isSelected
                            ? FontWeight.w600
                            : FontWeight.w400,
                        color: isSelected
                            ? Colors.white
                            : AppColors.textSecondary,
                      ),
                      selectedColor: AppColors.primary,
                      backgroundColor: Colors.white,
                      side: BorderSide(
                        color: isSelected
                            ? AppColors.primary
                            : AppColors.border,
                      ),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(20),
                      ),
                      padding: const EdgeInsets.symmetric(
                        horizontal: 10,
                        vertical: 4,
                      ),
                    ),
                  );
                }).toList(),
              ),
            ),
          ),

          const SliverToBoxAdapter(child: SizedBox(height: 8)),

          // List or Empty
          if (list.isEmpty)
            SliverFillRemaining(
              hasScrollBody: false,
              child: Center(
                child: Padding(
                  padding: const EdgeInsets.all(32),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Container(
                        width: 80,
                        height: 80,
                        decoration: BoxDecoration(
                          color: AppColors.primaryLight,
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(
                          Icons.rate_review_outlined,
                          size: 40,
                          color: AppColors.primary,
                        ),
                      ),
                      const SizedBox(height: 16),
                      const Text(
                        'Chưa có đánh giá nào',
                        style: TextStyle(
                          fontFamily: 'Be Vietnam Pro',
                          fontSize: 16,
                          fontWeight: FontWeight.w700,
                          color: AppColors.textPrimary,
                        ),
                      ),
                      const SizedBox(height: 8),
                      const Text(
                        'Các đánh giá của bạn giúp ích rất nhiều cho cộng đồng du lịch Đà Nẵng.',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          fontFamily: 'Be Vietnam Pro',
                          fontSize: 13,
                          color: AppColors.textTertiary,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            )
          else
            SliverList(
              delegate: SliverChildBuilderDelegate((context, index) {
                final review = list[index];
                return MyReviewCard(
                  review: review,
                  onTapPlace: () {},
                  onEdit: () => _showEditSheet(review),
                  onDelete: () => _confirmDeleteReview(review),
                );
              }, childCount: list.length),
            ),

          const SliverToBoxAdapter(child: SizedBox(height: 24)),
        ],
      ),
    );
  }
}
