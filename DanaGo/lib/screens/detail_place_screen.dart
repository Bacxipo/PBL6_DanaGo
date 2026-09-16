import 'package:flutter/material.dart';
import 'package:smarttrip/models/destination_item.dart';
import 'package:smarttrip/theme/app_colors.dart';
import 'package:smarttrip/widgets/place_detail/detail_about_section.dart';
import 'package:smarttrip/widgets/place_detail/detail_botttom_action_bar.dart';
import 'package:smarttrip/widgets/place_detail/detail_image_header.dart';
import 'package:smarttrip/widgets/place_detail/detail_info_grid.dart';
import 'package:smarttrip/widgets/place_detail/detail_reviews_section.dart';
import 'package:smarttrip/models/review_item.dart';

class DetailPlaceScreen extends StatefulWidget {
  final DestinationItem item;
  const DetailPlaceScreen({super.key, required this.item});

  @override
  State<DetailPlaceScreen> createState() => _DetailPlaceScreenState();
}

class _DetailPlaceScreenState extends State<DetailPlaceScreen> {
  bool isFavorite = false;
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xfff8fafc),
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
              onFavoriteToggle: () {
                setState(() {
                  isFavorite = !isFavorite;
                });
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
                      const Text(
                        '( 1.2B đánh giá )',
                        style: TextStyle(
                          color: Color(0xff9ca3af),
                          fontSize: 13,
                        ),
                      ),
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
                    reviews: ReviewItemModel.mockReviews,
                    onSeeAll: () {},
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
