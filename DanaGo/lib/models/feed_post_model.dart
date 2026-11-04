import 'package:smarttrip/models/destination_item.dart';

enum PostType {
  experience, // Trải nghiệm / Review
  question,   // Hỏi đáp cộng đồng
  newPlace,   // Đề xuất địa điểm mới
}

class PostImageItem {
  final String imageUrl;
  final String? caption;

  const PostImageItem({
    required this.imageUrl,
    this.caption,
  });
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

  static const String userDefaultAvatar = 'https://i.postimg.cc/tC24nW4N/avt1.jpg';
  static const String secondDefaultAvatar = 'https://i.postimg.cc/X7QYBdY8/avt2.jpg';

  static List<FeedPostModel> getMockPosts() {
    return [
      // Post 1: Lê Hoàng Yến - Sơn Trà (Grid 2 ảnh có overlay caption)
      FeedPostModel(
        id: 'post_1',
        type: PostType.experience,
        authorName: 'Lê Hoàng Yến',
        authorAvatar: userDefaultAvatar,
        timeAgo: '2 giờ trước',
        isVerified: true,
        locationName: 'Bán đảo Sơn Trà & Đỉnh Bàn Cờ',
        title: 'Sáng sớm săn mây đón bình minh Sơn Trà',
        content: 'Sáng sớm chạy xe máy lên Sơn Trà đón bình minh cực kỳ chill luôn mọi người ơi! Đường đèo thoáng đãng, không khí trong lành thoang thoảng mùi biển, may mắn gặp cả gia đình Voọc chà vá chân nâu siêu đáng yêu 🐒. Khuyên thật lòng nên xuất phát từ 5:30 sáng nha cả nhà!',
        images: const [
          PostImageItem(
            imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
            caption: 'Góc ngắm Bàn Cờ',
          ),
          PostImageItem(
            imageUrl: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=800&q=80',
            caption: 'Bình minh 05:45',
          ),
        ],
        linkedDestination: const DestinationItem(
          id: 'dest_sontra',
          title: 'Bán đảo Sơn Trà & Đỉnh Bàn Cờ',
          category: 'DANH THẮNG',
          imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
          rating: 4.9,
          tag: 'Miễn phí vé',
          address: 'Bán đảo Sơn Trà, Q. Sơn Trà, Đà Nẵng',
          openHours: '06:00 - 18:00',
          description: 'Bán đảo Sơn Trà được mệnh danh là viên ngọc quý của Đà Nẵng với hệ sinh thái phong phú và cảnh quan núi rừng ôm trọn biển.',
        ),
        rating: 5.0,
        itineraryTag: 'Lịch trình Đà Nẵng 3N2Đ - Ngày 1',
        costEstimate: '~150.000 đ / người',
        likes: 248,
        commentsCount: 42,
        isLiked: false,
        comments: [
          CommentItem(
            id: 'c1_1',
            authorName: 'Trần Văn Nam',
            authorAvatar: secondDefaultAvatar,
            content: 'Đoạn đường lên Đỉnh Bàn Cờ xe tay ga lên được không bạn ơi hay phải đi xe số?',
            timeAgo: '1 giờ trước',
            likes: 12,
          ),
          CommentItem(
            id: 'c1_2',
            authorName: 'Lê Hoàng Yến',
            authorAvatar: userDefaultAvatar,
            content: '@Trần Văn Nam Quy định hiện tại cấm xe tay ga từ đoạn trạm gác lên đỉnh nha bạn, nên thuê xe số hoặc xe côn tay cho an toàn nè!',
            timeAgo: '45 phút trước',
            likes: 24,
          ),
          CommentItem(
            id: 'c1_3',
            authorName: 'Nguyễn Thị Hương',
            authorAvatar: secondDefaultAvatar,
            content: 'Ảnh chụp bình minh đẹp mê mẩn luôn! Chuyến đi quá xuất sắc.',
            timeAgo: '20 phút trước',
            likes: 5,
          ),
        ],
      ),

      // Post 2: Trần Quốc Huy - Chợ đêm Sơn Trà (Banner Collage món ngon)
      FeedPostModel(
        id: 'post_2',
        type: PostType.experience,
        authorName: 'Trần Quốc Huy',
        authorAvatar: secondDefaultAvatar,
        timeAgo: '5 giờ trước',
        isVerified: true,
        locationName: 'Chợ đêm Sơn Trà & Phố ẩm thực',
        title: 'Review chợ đêm ẩm thực Đà Nẵng',
        content: 'Tối nay nhóm mình vừa "quét sạch" các sạp hải sản nướng và chè sầu Liên trứ danh ở chợ đêm. Giá cả niêm yết rõ ràng không sợ chặt chém, hải sản thì nhảy tanh tách tươi rói luôn. Ai đến Đà Nẵng nhất định phải ghé thử món mực nhảy nướng sa tế cay tê đầu lưỡi nhé! 🦑🔥',
        images: const [
          PostImageItem(
            imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=900&q=80',
            caption: 'Hải sản nướng chợ đêm',
          ),
        ],
        isCollageBanner: true,
        bannerHighlightTitle: 'Mực nhảy nướng sa tế & Chè sầu',
        bannerPriceTag: '~65k - 120k/món',
        bannerExtraImagesText: '+4 ảnh món ngon',
        linkedDestination: const DestinationItem(
          id: 'dest_chodemsontra',
          title: 'Chợ đêm Sơn Trà & Phố ẩm thực',
          category: 'ẨM THỰC',
          imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=900&q=80',
          rating: 4.7,
          tag: 'Mở 18:00 - 24:00',
          address: 'Đường Lý Nam Đế, P. An Hải Tây, Q. Sơn Trà, Đà Nẵng',
          openHours: '18:00 - 24:00',
          description: 'Khu chợ đêm sầm uất ngay sát bờ sông Hàn và Cầu Rồng, thiên đường hải sản tươi nướng và quà lưu niệm Đà Nẵng.',
        ),
        rating: 4.8,
        costEstimate: '~120.000 đ / người',
        likes: 185,
        commentsCount: 38,
        isLiked: true,
        comments: [
          CommentItem(
            id: 'c2_1',
            authorName: 'Đặng Tuấn Anh',
            authorAvatar: userDefaultAvatar,
            content: 'Quán sạp số mấy vậy bạn? Cuối tuần mình bay vào thử liền!',
            timeAgo: '3 giờ trước',
            likes: 6,
          ),
          CommentItem(
            id: 'c2_2',
            authorName: 'Trần Quốc Huy',
            authorAvatar: secondDefaultAvatar,
            content: '@Đặng Tuấn Anh Cứ đi thẳng từ cổng đường Mai Hắc Hướng vào tầm 20m dãy tay trái sạp số 18 nha bro!',
            timeAgo: '2 giờ trước',
            likes: 14,
          ),
        ],
      ),

      // Post 3: Nguyễn Hoàng Minh - Hỏi đáp (Chế độ Hỏi đáp)
      FeedPostModel(
        id: 'post_3',
        type: PostType.question,
        authorName: 'Nguyễn Hoàng Minh',
        authorAvatar: userDefaultAvatar,
        timeAgo: '8 giờ trước',
        isVerified: false,
        categoryTag: '🍽️ Ăn uống & Quán ngon',
        title: 'Quán hải sản tươi ngon giá hợp lý gần biển Mỹ Khê?',
        locationName: 'Bãi biển Mỹ Khê, Quận Ngũ Hành Sơn',
        content: 'Cuối tuần này gia đình mình 6 người có chuyến du lịch Đà Nẵng 3 ngày. Mọi người cho mình xin địa chỉ quán hải sản nào dân địa phương hay ăn, tươi sống và giá cả hợp lý gần bãi biển Mỹ Khê với ạ! Tiêu chí là không chặt chém và có chỗ ngồi thoáng đãng.',
        images: const [
          PostImageItem(
            imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
            caption: 'Bãi biển Mỹ Khê',
          ),
        ],
        linkedDestination: const DestinationItem(
          id: 'dest_mykhe',
          title: 'Bãi biển Mỹ Khê',
          category: 'BIỂN & ĐẢO',
          imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
          rating: 4.8,
          tag: 'Miễn phí',
          address: 'Đường Võ Nguyên Giáp, Q. Ngũ Hành Sơn',
          openHours: 'Cả ngày',
        ),
        likes: 94,
        commentsCount: 23,
        isLiked: false,
        comments: [
          CommentItem(
            id: 'c3_1',
            authorName: 'Thảo My',
            authorAvatar: secondDefaultAvatar,
            content: 'Né các quán lớn mặt đường ra bạn ơi, ghé Hải sản Bé Mặn hoặc Năm Đảnh trong hẻm K139 Trần Quang Khải bao tươi rẻ đúng chất Đà Nẵng!',
            timeAgo: '7 giờ trước',
            likes: 31,
          ),
        ],
      ),

      // Post 4: Vũ Thảo Nguyên - Đề xuất địa điểm mới (Chế độ Địa điểm mới)
      FeedPostModel(
        id: 'post_4',
        type: PostType.newPlace,
        authorName: 'Vũ Thảo Nguyên',
        authorAvatar: secondDefaultAvatar,
        timeAgo: '1 ngày trước',
        isVerified: true,
        categoryTag: '☕ Quán Cà Phê',
        locationName: 'Quận Cẩm Lệ, Đà Nẵng',
        title: 'Tiệm Cà Phê Rừng Dừa Cẩm Lệ',
        content: 'Phát hiện một quán cafe view rừng dừa nước cực thơ mộng ngay ngoại ô Cẩm Lệ! Không gian mát rượi, đồ uống từ 25k, buổi chiều gió thổi lồng lộng cực chill thích hợp tụ tập bạn bè cuối tuần.',
        images: const [
          PostImageItem(
            imageUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80',
            caption: 'Không gian ngoài trời',
          ),
        ],
        costEstimate: '25.000đ - 65.000đ',
        likes: 312,
        commentsCount: 56,
        isLiked: false,
      ),
    ];
  }
}
