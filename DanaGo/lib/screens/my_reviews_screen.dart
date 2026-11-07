import 'package:flutter/material.dart';
import 'package:smarttrip/models/destination_item.dart';
import 'package:smarttrip/models/user_review_model.dart';
import 'package:smarttrip/screens/detail_place_screen.dart';
import 'package:smarttrip/theme/app_colors.dart';
import 'package:smarttrip/widgets/reviews/my_review_card.dart';
import 'package:smarttrip/widgets/reviews/review_stats_header.dart';

class MyReviewsScreen extends StatefulWidget {
  const MyReviewsScreen({super.key});

  @override
  State<MyReviewsScreen> createState() => _MyReviewsScreenState();
}

class _MyReviewsScreenState extends State<MyReviewsScreen> {
  late List<UserReviewModel> _reviews;
  String _selectedFilter = 'Tất cả';

  final List<String> _filters = [
    'Tất cả',
    '5 sao',
    '4 sao',
    'Có hình ảnh',
  ];

  @override
  void initState() {
    super.initState();
    _reviews = List.from(UserReviewModel.mockReviews);
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
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            ),
            onPressed: () {
              Navigator.pop(ctx);
              setState(() {
                _reviews.removeWhere((item) => item.id == review.id);
              });
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Đã xóa đánh giá thành công')),
              );
            },
            child: const Text(
              'Xóa',
              style: TextStyle(fontFamily: 'Be Vietnam Pro', fontWeight: FontWeight.w600),
            ),
          ),
        ],
      ),
    );
  }

  void _showEditSheet(UserReviewModel review) {
    final textCtrl = TextEditingController(text: review.content);
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => Padding(
        padding: EdgeInsets.only(
          left: 16,
          right: 16,
          top: 16,
          bottom: MediaQuery.of(ctx).viewInsets.bottom + 16,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Sửa đánh giá: ${review.placeTitle}',
                  style: const TextStyle(
                    fontFamily: 'Be Vietnam Pro',
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                    color: AppColors.textPrimary,
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.close_rounded),
                  onPressed: () => Navigator.pop(ctx),
                ),
              ],
            ),
            const SizedBox(height: 12),
            TextField(
              controller: textCtrl,
              maxLines: 4,
              decoration: InputDecoration(
                filled: true,
                fillColor: AppColors.bgSecondary,
                hintText: 'Nhập nội dung đánh giá của bạn...',
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide.none,
                ),
              ),
            ),
            const SizedBox(height: 16),
            SizedBox(
              width: double.infinity,
              height: 48,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                onPressed: () {
                  Navigator.pop(ctx);
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Đã cập nhật đánh giá thành công!')),
                  );
                },
                child: const Text(
                  'Lưu thay đổi',
                  style: TextStyle(
                    fontFamily: 'Be Vietnam Pro',
                    fontWeight: FontWeight.w700,
                    fontSize: 15,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _openPlaceDetail(String placeId) {
    final allPlaces = [
      ...DestinationItem.featuredItems,
      ...DestinationItem.recommendedItems,
      ...DestinationItem.nearbyItems,
    ];
    final target = allPlaces.firstWhere(
      (p) => p.id == placeId,
      orElse: () => DestinationItem.featuredItems.first,
    );

    Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => DetailPlaceScreen(item: target)),
    );
  }

  @override
  Widget build(BuildContext context) {
    final list = _filteredReviews;
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final double avg = _reviews.isEmpty
        ? 0.0
        : _reviews.map((r) => r.rating).reduce((a, b) => a + b) / _reviews.length;
    final int totalHelpful =
        _reviews.isEmpty ? 0 : _reviews.map((r) => r.helpfulCount).reduce((a, b) => a + b);

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
                        fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
                        color: isSelected ? Colors.white : AppColors.textSecondary,
                      ),
                      selectedColor: AppColors.primary,
                      backgroundColor: Colors.white,
                      side: BorderSide(
                        color: isSelected ? AppColors.primary : AppColors.border,
                      ),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(20),
                      ),
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
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
              delegate: SliverChildBuilderDelegate(
                (context, index) {
                  final review = list[index];
                  return MyReviewCard(
                    review: review,
                    onTapPlace: () => _openPlaceDetail(review.placeId),
                    onEdit: () => _showEditSheet(review),
                    onDelete: () => _confirmDeleteReview(review),
                  );
                },
                childCount: list.length,
              ),
            ),

          const SliverToBoxAdapter(child: SizedBox(height: 24)),
        ],
      ),
    );
  }
}

