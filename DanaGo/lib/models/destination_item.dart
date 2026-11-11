class DestinationItem {
  final String id;
  final String title;
  final String category;
  final String imageUrl;
  final double rating;
  final String tag;
  final String? distance;

  final String? description;
  final String? address;
  final String? openHours;
  final List<String>? galleryImages;
  final double? price;
  final double? latitude;
  final double? longitude;

  const DestinationItem({
    required this.id,
    required this.title,
    required this.category,
    required this.imageUrl,
    required this.rating,
    required this.tag,
    this.distance,
    this.description,
    this.address,
    this.openHours,
    this.galleryImages,
    this.price,
    this.latitude,
    this.longitude,
  });
  factory DestinationItem.fromJson(Map<String, dynamic> json) {
    final images = json['images'] as List<dynamic>?;
    final firstImage = (images != null && images.isNotEmpty)
        ? (images[0]['imageUrl'] as String? ?? '')
        : '';
    final galleryUrls = images != null
        ? images
              .map((img) => img['imageUrl'] as String? ?? '')
              .where((url) => url.isNotEmpty)
              .toList()
        : <String>[];
    final ticketPrice = json['ticketPrice'] as String?;
    String tag;
    if (ticketPrice == null || ticketPrice.isEmpty || ticketPrice == '0') {
      tag = 'Miễn phí';
    } else {
      tag = ticketPrice;
    }
    return DestinationItem(
      id: json['id'].toString(),
      title: json['name'] as String? ?? '',
      category: (json['categoryName'] as String? ?? '').toUpperCase(),
      imageUrl: firstImage,
      rating: (json['avgRating'] as num?)?.toDouble() ?? 0.0,
      tag: tag,
      distance: json['distance'] as String?,
      description: json['description'] as String?,
      address: json['district'] as String?,
      openHours: json['openHours'] as String?,
      galleryImages: galleryUrls.isNotEmpty ? galleryUrls : null,
      latitude: (json['latitude'] as num?)?.toDouble(),
      longitude: (json['longitude'] as num?)?.toDouble(),
    );
  }
}
