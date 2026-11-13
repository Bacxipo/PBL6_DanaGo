class ReviewItemModel {
  final String id;
  final String userName;
  final String avatarUrl;
  final String timeAgo;
  final double rating;
  final String comment;
  final List<String> images;

  const ReviewItemModel({
    required this.id,
    required this.userName,
    required this.avatarUrl,
    required this.timeAgo,
    required this.rating,
    required this.comment,
    this.images = const [],
  });
  factory ReviewItemModel.fromJson(Map<String, dynamic> json) {
    final user = json['user'] as Map<String, dynamic>?;
    final rawAvatar = user?['avatarUrl'] as String? ?? '';
    final dt = DateTime.tryParse(json['createdAt'] as String? ?? '');
    final diff = dt != null ? DateTime.now().difference(dt) : Duration.zero;
    final timeAgo = diff.inDays > 0
        ? '${diff.inDays} ngày trước'
        : (diff.inHours > 0 ? '${diff.inHours} giờ trước' : 'vừa xong');
    return ReviewItemModel(
      id: json['id'].toString(),
      userName: user?['fullName'] as String? ?? 'Người dùng DanaGo',
      avatarUrl: rawAvatar.startsWith('http')
          ? rawAvatar
          : 'assets/images/default-avatar.svg',
      timeAgo: timeAgo,
      rating: (json['rating'] as num?)?.toDouble() ?? 5.0,
      comment: json['comment'] as String? ?? '',
      images:
          (json['images'] as List<dynamic>?)
              ?.map((img) => img['imageUrl'] as String? ?? '')
              .where((url) => url.isNotEmpty)
              .toList() ??
          [],
    );
  }
}
