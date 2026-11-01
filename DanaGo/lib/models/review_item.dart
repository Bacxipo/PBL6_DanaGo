class ReviewItemModel {
  final String id;
  final String userName;
  final String avatarUrl;
  final String timeAgo;
  final double rating;
  final String comment;

  const ReviewItemModel({
    required this.id,
    required this.userName,
    required this.avatarUrl,
    required this.timeAgo,
    required this.rating,
    required this.comment,
  });
  static final List<ReviewItemModel> mockReviews = [
    const ReviewItemModel(
      id: 'r1',
      userName: 'Xuân Bắc',
      avatarUrl: 'https://i.postimg.cc/tC24nW4N/avt1.jpg',
      timeAgo: '2 ngày trước',
      rating: 5.0,
      comment:
          'Rất đẹp, đặc biệt là xem phun lửa cuối tuần. Không khí nhộn nhịp, nhiều quán ăn xung quanh.',
    ),
    const ReviewItemModel(
      id: 'r2',
      userName: 'Hải Nam',
      avatarUrl: 'https://i.postimg.cc/X7QYBdY8/avt2.jpg',
      timeAgo: '1 tuần trước',
      rating: 5.0,
      comment:
          'Biểu tượng không thể bỏ qua khi đến Đà Nẵng. Chụp ảnh góc nào cũng xuất sắc luôn nha.',
    ),
  ];
}
