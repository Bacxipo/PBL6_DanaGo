class AmenityItem {
  final int id;
  final String name;
  final String? icon;

  AmenityItem({
    required this.id,
    required this.name,
    this.icon,
  });

  factory AmenityItem.fromJson(Map<String, dynamic> json) {
    return AmenityItem(
      id: (json['id'] as num?)?.toInt() ?? 0,
      name: json['name']?.toString() ?? '',
      icon: json['icon']?.toString(),
    );
  }
}

class LodgingImageItem {
  final int id;
  final String imageUrl;

  LodgingImageItem({
    required this.id,
    required this.imageUrl,
  });

  factory LodgingImageItem.fromJson(Map<String, dynamic> json) {
    return LodgingImageItem(
      id: (json['id'] as num?)?.toInt() ?? 0,
      imageUrl: json['imageUrl']?.toString() ?? '',
    );
  }
}

class LodgingItem {
  final int id;
  final String name;
  final String type;
  final String district;
  final double latitude;
  final double longitude;
  final double pricePerNight;
  final int? maxGuests;
  final String? checkin;
  final String? checkout;
  final double avgRating;
  final String? description;
  final String status;
  final String? addressUrl;
  final String? website;
  final List<LodgingImageItem> images;
  final List<AmenityItem> amenities;

  LodgingItem({
    required this.id,
    required this.name,
    required this.type,
    required this.district,
    required this.latitude,
    required this.longitude,
    required this.pricePerNight,
    this.maxGuests,
    this.checkin,
    this.checkout,
    required this.avgRating,
    this.description,
    required this.status,
    this.addressUrl,
    this.website,
    required this.images,
    required this.amenities,
  });

  String get thumbnailUrl {
    if (images.isNotEmpty && images.first.imageUrl.isNotEmpty) {
      return images.first.imageUrl;
    }
    return 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600';
  }

  factory LodgingItem.fromJson(Map<String, dynamic> json) {
    final rawImages = (json['images'] as List?) ?? [];
    final rawAmenities = (json['amenities'] as List?) ?? [];
    return LodgingItem(
      id: (json['id'] as num?)?.toInt() ?? 0,
      name: json['name']?.toString() ?? 'Nơi lưu trú',
      type: json['type']?.toString() ?? 'Hotel',
      district: json['district']?.toString() ?? 'Đà Nẵng',
      latitude: (json['latitude'] as num?)?.toDouble() ?? 16.0544,
      longitude: (json['longitude'] as num?)?.toDouble() ?? 108.2022,
      pricePerNight: (json['pricePerNight'] as num?)?.toDouble() ?? 0,
      maxGuests: (json['maxGuests'] as num?)?.toInt(),
      checkin: json['checkin']?.toString(),
      checkout: json['checkout']?.toString(),
      avgRating: (json['avgRating'] as num?)?.toDouble() ?? 4.5,
      description: json['description']?.toString(),
      status: json['status']?.toString() ?? 'APPROVED',
      addressUrl: json['addressUrl']?.toString(),
      website: json['website']?.toString(),
      images: rawImages
          .whereType<Map<String, dynamic>>()
          .map(LodgingImageItem.fromJson)
          .toList(),
      amenities: rawAmenities
          .whereType<Map<String, dynamic>>()
          .map(AmenityItem.fromJson)
          .toList(),
    );
  }
}
