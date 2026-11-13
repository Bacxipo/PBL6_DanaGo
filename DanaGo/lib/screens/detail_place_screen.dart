import 'package:flutter/material.dart';
import 'package:smarttrip/models/destination_item.dart';
import 'package:smarttrip/services/review_service.dart';
import 'package:smarttrip/theme/app_colors.dart';
import 'package:smarttrip/widgets/place_detail/detail_about_section.dart';
import 'package:smarttrip/widgets/place_detail/detail_botttom_action_bar.dart';
import 'package:smarttrip/widgets/place_detail/detail_image_header.dart';
import 'package:smarttrip/widgets/place_detail/detail_info_grid.dart';
import 'package:smarttrip/widgets/place_detail/detail_reviews_section.dart';
import 'package:smarttrip/models/review_item.dart';
import 'package:smarttrip/services/favorite_service.dart';
import 'dart:io';
import 'package:image_picker/image_picker.dart';

class DetailPlaceScreen extends StatefulWidget {
  final DestinationItem item;
  const DetailPlaceScreen({super.key, required this.item});

  @override
  State<DetailPlaceScreen> createState() => _DetailPlaceScreenState();
}

class _DetailPlaceScreenState extends State<DetailPlaceScreen> {
  bool isFavorite = false;
  @override
  void initState() {
    super.initState();
    _checkFavorite();
    _loadReviews();
  }

  Future<void> _checkFavorite() async {
    if (FavoriteService.instance.isFavorite(widget.item.id)) {
      setState(() => isFavorite = true);
    } else {
      await FavoriteService.instance.getFavorites();
      if (mounted) {
        setState(() {
          isFavorite = FavoriteService.instance.isFavorite(widget.item.id);
        });
      }
    }
  }

  List<ReviewItemModel> _reviews = [];
  Future<void> _loadReviews() async {
    final data = await ReviewService.instance.getDestinationReviews(
      widget.item.id,
    );
    if (mounted) setState(() => _reviews = data);
  }

  final List<XFile> pickedImages = [];
  bool isSubmitting = false;
  void _showAddReviewBottomSheet() {
    double selectedRating = 5.0; // Đánh giá mặc định 5 sao
    final TextEditingController commentController = TextEditingController();
    showModalBottomSheet(
      context: context,
      isScrollControlled: true, // Cho phép nâng khung lên khi bật bàn phím
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            return Padding(
              padding: EdgeInsets.only(
                left: 20,
                right: 20,
                top: 20,
                bottom:
                    MediaQuery.of(context).viewInsets.bottom +
                    20, // Đẩy khung theo bàn phím
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Viết đánh giá của bạn',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 12),

                  // Hàng chọn sao (1 đến 5 sao)
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: List.generate(5, (index) {
                      final starValue = index + 1.0;
                      return IconButton(
                        icon: Icon(
                          starValue <= selectedRating
                              ? Icons.star
                              : Icons.star_border,
                          color: Colors.amber,
                          size: 32,
                        ),
                        onPressed: () {
                          setModalState(() {
                            selectedRating = starValue;
                          });
                        },
                      );
                    }),
                  ),
                  const SizedBox(height: 12),

                  // Ô nhập nội dung nhận xét
                  TextField(
                    controller: commentController,
                    maxLines: 3,
                    decoration: InputDecoration(
                      hintText:
                          'Chia sẻ trải nghiệm của bạn về địa điểm này...',
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      OutlinedButton.icon(
                        onPressed: () async {
                          final imgs = await ImagePicker().pickMultiImage(
                            limit: 5,
                          );
                          if (imgs.isNotEmpty) {
                            setModalState(
                              () => pickedImages.addAll(
                                imgs.take(5 - pickedImages.length),
                              ),
                            );
                          }
                        },
                        icon: const Icon(
                          Icons.add_photo_alternate_outlined,
                          size: 18,
                        ),
                        label: Text('Thêm ảnh (${pickedImages.length}/5)'),
                      ),
                    ],
                  ),
                  if (pickedImages.isNotEmpty) ...[
                    const SizedBox(height: 8),
                    SizedBox(
                      height: 64,
                      child: ListView.separated(
                        scrollDirection: Axis.horizontal,
                        itemCount: pickedImages.length,
                        separatorBuilder: (_, __) => const SizedBox(width: 8),
                        itemBuilder: (_, i) => Stack(
                          children: [
                            ClipRRect(
                              borderRadius: BorderRadius.circular(8),
                              child: Image.file(
                                File(pickedImages[i].path),
                                width: 64,
                                height: 64,
                                fit: BoxFit.cover,
                              ),
                            ),
                            Positioned(
                              top: 2,
                              right: 2,
                              child: GestureDetector(
                                onTap: () => setModalState(
                                  () => pickedImages.removeAt(i),
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
                  // Nút Gửi đánh giá
                  SizedBox(
                    width: double.infinity,
                    height: 48,
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      onPressed: () async {
                        if (commentController.text.trim().isEmpty) return;
                        if (isSubmitting) return;
                        setModalState(() => isSubmitting = true);
                        final created = await ReviewService.instance
                            .createReview(
                              destinationId: widget.item.id,
                              rating: selectedRating.toInt(),
                              comment: commentController.text.trim(),
                              imagePaths: pickedImages
                                  .map((e) => e.path)
                                  .toList(),
                            );
                        if (!context.mounted) return;
                        Navigator.pop(context);
                        if (created != null) {
                          setState(() => _reviews.insert(0, created));
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                              content: Text('Cảm ơn bạn đã gửi đánh giá!'),
                              backgroundColor: AppColors.primary,
                            ),
                          );
                        }
                      },
                      child: const Text(
                        'Gửi đánh giá',
                        style: TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      bottomNavigationBar: DetailBotttomActionBar(
        onAddtoItinerary: () {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Đã thêm "${widget.item.title}" vào lịch trình'),
              backgroundColor: AppColors.secondary,
            ),
          );
        },
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            DetailImageHeader(
              images: widget.item.galleryImages ?? [widget.item.imageUrl],
              isFavorite: isFavorite,
              onFavoriteToggle: () async {
                setState(() {
                  isFavorite = !isFavorite;
                });
                final newState = await FavoriteService.instance.toggleFavorite(
                  widget.item.id,
                );
                if (mounted) {
                  setState(() {
                    isFavorite = newState;
                  });
                  ScaffoldMessenger.of(context).clearSnackBars();
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text(
                        isFavorite
                            ? 'Đã lưu "${widget.item.title}" vào mục Yêu thích'
                            : 'Đã bỏ lưu "${widget.item.title}"',
                      ),
                      duration: const Duration(seconds: 2),
                      behavior: SnackBarBehavior.floating,
                    ),
                  );
                }
              },
              onShare: () {
                //sau :))
              },
            ),
            Padding(
              padding: const EdgeInsets.all(20.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    widget.item.title,
                    style: const TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 10,
                          vertical: 4,
                        ),
                        decoration: BoxDecoration(
                          color: AppColors.primary.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          widget.item.category,
                          style: const TextStyle(
                            color: AppColors.primary,
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      const Icon(Icons.star, color: Colors.amber, size: 18),
                      const SizedBox(width: 4),
                      Text(
                        '${widget.item.rating}',
                        style: const TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 14,
                        ),
                      ),
                      const SizedBox(width: 12),
                    ],
                  ),
                  const SizedBox(height: 20),
                  DetailInfoGrid(
                    address: widget.item.address ?? 'Quận Hải Châu',
                    openHours: widget.item.openHours ?? 'Cả ngày',
                    priceTag: widget.item.tag,
                    onOpenMap: () {},
                  ),
                  const SizedBox(height: 24),
                  DetailAboutSection(
                    description:
                        widget.item.description ??
                        'Cầu Rồng là một trong những biểu tượng kiến trúc độc đáo và niềm tự hào của người dân Đà Nẵng. Cây cầu có thiết kế hình một con rồng uốn lượn vươn mình ra biển lớn, thể hiện khát vọng phát triển mạnh mẽ của thành phố.',
                  ),
                  const SizedBox(height: 24),
                  DetailReviewsSection(
                    reviews: _reviews,
                    onSeeAll: () {},
                    onWriteReview: _showAddReviewBottomSheet,
                  ),
                  const SizedBox(height: 20),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
