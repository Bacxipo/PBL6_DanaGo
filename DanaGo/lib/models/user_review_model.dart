class UserReviewModel {
  final String id;
  final String placeId;
  final String placeTitle;
  final String placeCategory;
  final String placeImageUrl;
  final double rating;
  final String content;
  final String timeAgo;
  final List<String> photos;
  final int helpfulCount;

  const UserReviewModel({
    required this.id,
    required this.placeId,
    required this.placeTitle,
    required this.placeCategory,
    required this.placeImageUrl,
    required this.rating,
    required this.content,
    required this.timeAgo,
    this.photos = const [],
    this.helpfulCount = 0,
  });

  factory UserReviewModel.fromJson(Map<String, dynamic> json) {
    final dest = json['destination'] as Map<String, dynamic>?;
    final dt = DateTime.tryParse(json['createdAt'] as String? ?? '');
    final diff = dt != null ? DateTime.now().difference(dt) : Duration.zero;
    final timeAgo = diff.inDays > 0 ? '${diff.inDays} ngày trước' : 'Hôm nay';
    final imgs =
        (json['images'] as List<dynamic>?)
            ?.map((e) => e['imageUrl'] as String? ?? '')
            .where((u) => u.isNotEmpty)
            .toList() ??
        [];

    return UserReviewModel(
      id: json['id'].toString(),
      placeId: json['destinationId'].toString(),
      placeTitle:
          dest?['name'] as String? ?? 'Địa điểm #${json['destinationId']}',
      placeCategory: (dest?['district'] as String? ?? 'ĐÀ NẴNG').toUpperCase(),
      placeImageUrl: (dest?['imageUrl'] as String?)?.isNotEmpty == true
          ? dest!['imageUrl'] as String
          : 'https://i.postimg.cc/jdZSnPSm/caurong1.jpg',
      rating: (json['rating'] as num?)?.toDouble() ?? 5.0,
      content: json['comment'] as String? ?? '',
      timeAgo: timeAgo,
      photos: imgs,
    );
  }
}
