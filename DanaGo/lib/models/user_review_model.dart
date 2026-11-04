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

  static final List<UserReviewModel> mockReviews = [
    const UserReviewModel(
      id: 'rev_1',
      placeId: '1',
      placeTitle: 'Cầu Rồng',
      placeCategory: 'BIỂU TƯỢNG',
      placeImageUrl: 'https://i.postimg.cc/jdZSnPSm/caurong1.jpg',
      rating: 5.0,
      content:
          'Khung cảnh ban đêm lung linh tuyệt đẹp, cuối tuần có phun lửa và phun nước rất ấn tượng! Không khí nhộn nhịp, nhiều bạn trẻ và khách du lịch tụ tập quanh phố đi bộ Bạch Đằng.',
      timeAgo: '2 ngày trước',
      photos: [
        'https://i.postimg.cc/5Nn2QL2Z/caurong3.jpg',
        'https://i.postimg.cc/ZKV5vpqk/caurong4.jpg',
      ],
      helpfulCount: 24,
    ),
    const UserReviewModel(
      id: 'rev_2',
      placeId: '2',
      placeTitle: 'Bà Nà Hills',
      placeCategory: 'KHU DU LỊCH',
      placeImageUrl: 'https://i.postimg.cc/xTt1NM1g/bana1.jpg',
      rating: 5.0,
      content:
          'Cầu Vàng và làng Pháp mang lại cảm giác như đang lạc giữa châu Âu. Nên đi vào ngày nắng đẹp để chụp ảnh mây bồng bềnh, cáp treo dài và ngắm toàn cảnh rừng nguyên sinh rất hùng vĩ.',
      timeAgo: '1 tuần trước',
      photos: [
        'https://i.postimg.cc/vH3ZxfZ3/bana2.jpg',
        'https://i.postimg.cc/65Yp4npc/bana3.jpg',
      ],
      helpfulCount: 18,
    ),
    const UserReviewModel(
      id: 'rev_3',
      placeId: '3',
      placeTitle: 'Mì Quảng Bà Vị',
      placeCategory: 'ẨM THỰC',
      placeImageUrl: 'https://i.postimg.cc/Jz04N0sF/myquang.jpg',
      rating: 4.5,
      content:
          'Nước lèo đậm đà vừa miệng, sợi mì dai vàng óng ả ăn cùng rau sống tươi và bánh tráng nướng giòn rụm. Giá cả phải chăng, phục vụ nhanh nhẹn dù quán rất đông khách.',
      timeAgo: '2 tuần trước',
      photos: [],
      helpfulCount: 9,
    ),
    const UserReviewModel(
      id: 'rev_4',
      placeId: '4',
      placeTitle: 'Biển Mỹ Khê',
      placeCategory: 'BÃI BIỂN',
      placeImageUrl: 'https://i.postimg.cc/nc0h9BLx/mykhe.jpg',
      rating: 5.0,
      content:
          'Một trong những bãi biển quyến rũ nhất hành tinh! Cát trắng mịn màng, sóng êm, nước biển trong xanh. Dọc bờ biển có nhiều quán cà phê xinh xắn ngắm hoàng hôn cực chill.',
      timeAgo: '1 tháng trước',
      photos: [
        'https://i.postimg.cc/nc0h9BLx/mykhe.jpg',
      ],
      helpfulCount: 31,
    ),
  ];
}

