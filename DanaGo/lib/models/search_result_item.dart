import 'package:flutter/material.dart';
import 'package:smarttrip/models/destination_item.dart';
import 'package:smarttrip/theme/app_colors.dart';

class SearchResultItem {
  final String id;
  final String title;
  final String imageUrl;
  final String badge;
  final Color badgeColor;
  final String address;
  final double rating;
  final int reviewCount;
  final String distance;
  final String? tagLabel;
  final Color? tagColor;
  final bool isFavorite;
  final DestinationItem? originalDestination;

  const SearchResultItem({
    required this.id,
    required this.title,
    required this.imageUrl,
    required this.badge,
    required this.badgeColor,
    required this.address,
    required this.rating,
    required this.reviewCount,
    required this.distance,
    this.tagLabel,
    this.tagColor,
    this.isFavorite = false,
    this.originalDestination,
  });
  DestinationItem toDestinationItem() {
    if (originalDestination != null) return originalDestination!;
    return DestinationItem(
      id: id,
      title: title,
      category: badge,
      imageUrl: imageUrl,
      rating: rating,
      tag: tagLabel ?? '',
    );
  }

  factory SearchResultItem.fromDestination(DestinationItem dest) {
    return SearchResultItem(
      id: dest.id,
      title: dest.title,
      imageUrl: dest.imageUrl.isNotEmpty
          ? dest.imageUrl
          : 'https://jmwoffnpyqqglvvzgzah.supabase.co/storage/v1/object/public/destination_image/dest-18/cau-rong-da-nang%20(7)-min.jpg',
      badge: dest.category.isNotEmpty ? dest.category : 'ĐỊA ĐIỂM',
      badgeColor: AppColors.primary,
      address: dest.address ?? 'Đà Nẵng',
      rating: dest.rating,
      reviewCount: 0,
      distance: dest.distance ?? '',
      tagLabel: dest.tag,
      tagColor: AppColors.primary,
      originalDestination: dest,
    );
  }
  factory SearchResultItem.fromJson(Map<String, dynamic> json) {
    return SearchResultItem(
      id: json['id'] ?? '',
      title: json['name'] ?? json['title'] ?? '',
      imageUrl: json['image_url'] ?? json['imageUrl'] ?? '',
      badge: json['category'] ?? json['badge'] ?? 'Địa điểm',
      badgeColor: AppColors.primary,
      address: json['address'] ?? '',
      rating: (json['rating'] as num?)?.toDouble() ?? 5.0,
      reviewCount: json['review_count'] ?? json['reviewCount'] ?? 0,
      distance: json['distance'] ?? '1.0 km',
      tagLabel: json['status_label'] ?? json['tagLabel'],
      tagColor: AppColors.success,
      isFavorite: json['is_favorite'] ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'image_url': imageUrl,
      'badge': badge,
      'address': address,
      'rating': rating,
      'review_count': reviewCount,
      'distance': distance,
      'tag_label': tagLabel,
      'is_favorite': isFavorite,
    };
  }
}
