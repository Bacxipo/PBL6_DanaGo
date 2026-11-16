import 'package:smarttrip/models/destination_item.dart';

enum PostType {
  experience, // Trải nghiệm / Review
  question, // Hỏi đáp cộng đồng
  newPlace, // Đề xuất địa điểm mới
}

class PostImageItem {
  final String imageUrl;
  final String? caption;

  const PostImageItem({required this.imageUrl, this.caption});
}

class CommentItem {
  final String id;
  final String authorName;
  final String authorAvatar;
  final String content;
  final String timeAgo;
  int likes;
  bool isLiked;

  CommentItem({
    required this.id,
    required this.authorName,
    required this.authorAvatar,
    required this.content,
    required this.timeAgo,
    this.likes = 0,
    this.isLiked = false,
  });
  factory CommentItem.fromJson(Map<String, dynamic> json) {
    final user = json['user'] as Map<String, dynamic>?;
    final rawAvatar = user?['avatarUrl'] as String? ?? '';
    final dt = DateTime.tryParse(json['createdAt'] as String? ?? '')?.toLocal();
    final diff = dt != null ? DateTime.now().difference(dt) : Duration.zero;
    final timeAgo = diff.inDays > 0
        ? '${diff.inDays} ngày trước'
        : diff.inHours > 0
        ? '${diff.inHours} giờ trước'
        : diff.inMinutes > 0
        ? '${diff.inMinutes} phút trước'
        : 'Vừa xong';
    return CommentItem(
      id: json['id'].toString(),
      authorName: user?['fullName'] as String? ?? 'Người dùng DanaGo',
      authorAvatar: rawAvatar.isNotEmpty
          ? rawAvatar
          : 'assets/images/default-avatar.svg',
      content: json['content'] as String? ?? '',
      timeAgo: timeAgo,
    );
  }
}

class FeedPostModel {
  final String id;
  final PostType type;
  final String authorName;
  final String authorAvatar;
  final String timeAgo;
  final bool isVerified;
  final String? locationName;
  final String? title;
  final String content;
  final List<PostImageItem> images;
  final bool isCollageBanner;
  final String? bannerHighlightTitle;
  final String? bannerPriceTag;
  final String? bannerExtraImagesText;
  final DestinationItem? linkedDestination;
  final String? categoryTag;
  final double? rating;
  final String? itineraryTag; // VD: "Lịch trình Đà Nẵng 3N2Đ - Ngày 1"
  final String? costEstimate; // VD: "~150.000 đ / người"
  int likes;
  int commentsCount;
  bool isLiked;
  bool isSaved;
  List<CommentItem> comments;

  FeedPostModel({
    required this.id,
    this.type = PostType.experience,
    required this.authorName,
    required this.authorAvatar,
    required this.timeAgo,
    this.isVerified = false,
    this.locationName,
    this.title,
    required this.content,
    this.images = const [],
    this.isCollageBanner = false,
    this.bannerHighlightTitle,
    this.bannerPriceTag,
    this.bannerExtraImagesText,
    this.linkedDestination,
    this.categoryTag,
    this.rating,
    this.itineraryTag,
    this.costEstimate,
    this.likes = 0,
    this.commentsCount = 0,
    this.isLiked = false,
    this.isSaved = false,
    List<CommentItem>? comments,
  }) : comments = comments ?? [];
  factory FeedPostModel.fromJson(Map<String, dynamic> json) {
    final user = json['user'] as Map<String, dynamic>?;
    final rawAvatar = user?['avatarUrl'] as String? ?? '';
    final dest = json['destination'] as Map<String, dynamic>?;
    final count = json['_count'] as Map<String, dynamic>?;
    final rawImgs = json['images'] as List<dynamic>? ?? [];
    final dt = DateTime.tryParse(json['createdAt'] as String? ?? '')?.toLocal();
    final diff = dt != null ? DateTime.now().difference(dt) : Duration.zero;
    final timeAgo = diff.inDays > 0
        ? '${diff.inDays} ngày trước'
        : diff.inHours > 0
        ? '${diff.inHours} giờ trước'
        : diff.inMinutes > 0
        ? '${diff.inMinutes} phút trước'
        : 'Vừa xong';
    return FeedPostModel(
      id: json['id'].toString(),
      type: json['postType'] == 'NEW_DESTINATION'
          ? PostType.newPlace
          : PostType.experience,
      authorName: user?['fullName'] as String? ?? 'Người dùng DanaGo',
      authorAvatar: rawAvatar.isNotEmpty
          ? rawAvatar
          : 'assets/images/default-avatar.svg',
      timeAgo: timeAgo,
      locationName: dest?['name'] as String?,
      content: json['content'] as String? ?? '',
      images: rawImgs
          .map((e) => PostImageItem(imageUrl: e['imageUrl'] as String? ?? ''))
          .where((e) => e.imageUrl.isNotEmpty)
          .toList(),
      linkedDestination: dest != null ? DestinationItem.fromJson(dest) : null,
      categoryTag: dest?['category']?['name'] as String?,
      likes: (count?['likes'] as num?)?.toInt() ?? 0,
      commentsCount: (count?['comments'] as num?)?.toInt() ?? 0,
      isLiked: json['isLiked'] as bool? ?? false,
    );
  }
}
