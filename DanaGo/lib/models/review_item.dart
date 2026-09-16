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
      avatarUrl:
          'https://scontent.fdad3-6.fna.fbcdn.net/v/t39.30808-6/475869510_1945477732641527_8457676487602526743_n.jpg?stp=dst-jpg_tt6&cstp=mx720x720&ctp=s720x720&_nc_cat=100&ccb=1-7&_nc_sid=6ee11a&_nc_eui2=AeFwmeAxoswBsJP7wUJk9hxRhm1P7_Zy_TqGbU_v9nL9OjooryUVG3pdxFwkQ0kB0HOF47fbnqBEEJpQ_H_gtR16&_nc_ohc=kBz6zBfiO4kQ7kNvwG4ja2m&_nc_oc=Adom37Y80mYIPiIcGtGDVDK4IFB-IfQk5Kk5Rmmy8huJUG4MwuWfES7nPlyxG2lXMgGrOrsTgYqMLRalAl6qKcqn&_nc_zt=23&_nc_ht=scontent.fdad3-6.fna&_nc_gid=8j-ZLTICei_YsIHB_TiKog&_nc_ss=782a8&oh=00_AQJ1BECOiawejRHhxto-91evOeJs5Vft5snvCYDRdZfHNQ&oe=6AB07C46',
      timeAgo: '2 ngày trước',
      rating: 5.0,
      comment:
          'Rất đẹp, đặc biệt là xem phun lửa cuối tuần. Không khí nhộn nhịp, nhiều quán ăn xung quanh.',
    ),
    const ReviewItemModel(
      id: 'r2',
      userName: 'Hải Nam',
      avatarUrl:
          'https://scontent.fdad3-6.fna.fbcdn.net/v/t39.30808-6/365430937_116796678167841_7446359974295334731_n.jpg?stp=dst-jpg_tt6&cstp=mx564x743&ctp=s564x743&_nc_cat=107&ccb=1-7&_nc_sid=6ee11a&_nc_eui2=AeHaVtn7hwdjJ1OU8EMR-6Ve4Ew317dzw2DgTDfXt3PDYKednLHX2t4IEk04VLUznEQUFn7u2p6DdwPV01ukEu-w&_nc_ohc=4McqXkCPdFEQ7kNvwG5VEn8&_nc_oc=AdrJGsbyxYQNRnOHlrvQ2Ty1BVV161ruk01MTorJISrwM0ae0GRu1L-4dNu1Fg5J_WK23Y7vbjgmp-luxS4rj0NY&_nc_zt=23&_nc_ht=scontent.fdad3-6.fna&_nc_gid=R5NmX0Govx0HOmfEx0woHQ&_nc_ss=782a8&oh=00_AQLIfI2uoiIviBBbSCxoECCDg3apb7u_-VaDRy0MWlN8lA&oe=6AB07D6F',
      timeAgo: '1 tuần trước',
      rating: 5.0,
      comment:
          'Biểu tượng không thể bỏ qua khi đến Đà Nẵng. Chụp ảnh góc nào cũng xuất sắc luôn nha.',
    ),
  ];
}
