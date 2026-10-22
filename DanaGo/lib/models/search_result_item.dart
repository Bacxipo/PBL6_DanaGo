import 'package:flutter/material.dart';
import 'package:smarttrip/models/destination_item.dart';

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
  });
  DestinationItem toDestinationItem() {
    return DestinationItem(
      id: id,
      title: title,
      category: badge,
      imageUrl: imageUrl,
      rating: rating,
      tag: tagLabel ?? '',
    );
  }

  factory SearchResultItem.fromJson(Map<String, dynamic> json) {
    return SearchResultItem(
      id: json['id'] ?? '',
      title: json['name'] ?? json['title'] ?? '',
      imageUrl: json['image_url'] ?? json['imageUrl'] ?? '',
      badge: json['category'] ?? json['badge'] ?? 'Địa điểm',
      badgeColor: const Color(0xFF0D9488),
      address: json['address'] ?? '',
      rating: (json['rating'] as num?)?.toDouble() ?? 5.0,
      reviewCount: json['review_count'] ?? json['reviewCount'] ?? 0,
      distance: json['distance'] ?? '1.0 km',
      tagLabel: json['status_label'] ?? json['tagLabel'],
      tagColor: const Color(0xFF059669),
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

  static final List<SearchResultItem> mockList = [
    const SearchResultItem(
      id: 'place_01',
      title: 'Bãi biển Mỹ Khê',
      imageUrl:
          'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500',
      badge: 'Biển & Đảo',
      badgeColor: Color(0xFF0D9488),
      address: 'Võ Nguyên Giáp, P. Phước Mỹ',
      rating: 4.8,
      reviewCount: 1200,
      distance: '1.2 km',
      tagLabel: 'Vé: Miễn phí',
      tagColor: Color(0xFF0D9488),
      isFavorite: true,
    ),
    const SearchResultItem(
      id: 'place_02',
      title: 'Quán Hải Sản Bé Mặn',
      imageUrl:
          'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500',
      badge: 'Hải sản tươi',
      badgeColor: Color(0xFFEA580C),
      address: 'Lô 11 Võ Nguyên Giáp, Mân Thái',
      rating: 4.6,
      reviewCount: 850,
      distance: '1.8 km',
      tagLabel: 'Mở 09:00 - 23:00',
      tagColor: Color(0xFF059669),
      isFavorite: false,
    ),
    const SearchResultItem(
      id: 'place_03',
      title: 'Cà phê Sơn Trà Marina',
      imageUrl:
          'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=500',
      badge: 'View Vịnh Biển',
      badgeColor: Color(0xFF0284C7),
      address: 'Bến du thuyền Sơn Trà, Bán đảo Sơn Trà',
      rating: 4.7,
      reviewCount: 420,
      distance: '4.5 km',
      tagLabel: 'Đang mở cửa',
      tagColor: Color(0xFF059669),
      isFavorite: false,
    ),
  ];
}
