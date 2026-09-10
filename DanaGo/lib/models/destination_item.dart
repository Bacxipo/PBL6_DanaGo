class DestinationItem {
  final String id;
  final String title;
  final String category;
  final String imageUrl;
  final double rating;
  final String tag;
  final String? distance;

  const DestinationItem({
    required this.id,
    required this.title,
    required this.category,
    required this.imageUrl,
    required this.rating,
    required this.tag,
    this.distance,
  });
  static final List<DestinationItem> featuredItems = [
    const DestinationItem(
      id: '1',
      title: 'Cầu Rồng',
      category: 'BIỂU TƯỢNG',
      imageUrl:
          'https://danangfantasticity.com/wp-content/uploads/2018/10/cau-rong-top-20-cay-cau-ky-quai-nhat-the-gioi-theo-boredom-therapy-02.jpg',
      rating: 4.9,
      tag: 'Miễn phí',
    ),
    const DestinationItem(
      id: '2',
      title: 'Bà Nà Hills',
      category: 'KHU DU LỊCH',
      imageUrl:
          'https://media.istockphoto.com/id/1569696238/vi/anh/nh%C3%ACn-t%E1%BB%AB-tr%C3%AAn-kh%C3%B4ng-c%E1%BB%A7a-l%C3%A0ng-ph%C3%A1p-t%E1%BA%A1i-%C4%91%E1%BB%93i-bana-%C4%91%C3%A0-n%E1%BA%B5ng-vi%E1%BB%87t-nam.jpg?s=612x612&w=0&k=20&c=Lb2p3tQwJnwUaSivIi16wy9gOJXI63Nj2hoCR9dM39k=',
      rating: 4.8,
      tag: 'Vé vào cửa',
    ),
  ];
  static final List<DestinationItem> recommendedItems = [
    const DestinationItem(
      id: '3',
      title: 'Mì Quảng Bà Vị',
      category: 'ẨM THỰC',
      imageUrl: 'https://static.vinwonders.com/2022/10/mi-quang-hoi-an-01.jpg',
      rating: 4.7,
      tag: '\$',
    ),
    const DestinationItem(
      id: '4',
      title: 'Biển Mỹ Khê',
      category: 'BÃI BIỂN',
      imageUrl:
          'https://media.istockphoto.com/id/1512756668/vi/anh/nh%C3%ACn-t%E1%BB%AB-tr%C3%AAn-kh%C3%B4ng-b%C3%A3i-bi%E1%BB%83n-m%E1%BB%B9-kh%C3%AA-m%E1%BB%99t-%C4%91%E1%BB%8Ba-%C4%91i%E1%BB%83m-du-l%E1%BB%8Bch-n%E1%BB%95i-ti%E1%BA%BFng-%E1%BB%9F-th%C3%A0nh-ph%E1%BB%91-%C4%91%C3%A0-n%E1%BA%B5ng.jpg?s=612x612&w=0&k=20&c=jZNRJ9XqfZ_dxw-F558Z1ABZHH976AGeHmAVhQ2GUr4=',
      rating: 4.9,
      tag: 'Miễn phí',
    ),
  ];
  static final List<DestinationItem> nearbyItems = [
    const DestinationItem(
      id: '5',
      title: 'Bảo tàng Điêu khắc Chăm',
      category: 'DI TÍCH',
      imageUrl:
          'https://images.baoangiang.com.vn/image/fckeditor/upload/2020/20201003/images/ttxvn_bao_tang_dieu_khac_cham.jpg',
      rating: 4.6,
      tag: 'Vé vào cửa',
      distance: '1.2 km',
    ),
    const DestinationItem(
      id: '6',
      title: 'Chợ Đêm Sơn Trà',
      category: 'MUA SẮM',
      imageUrl:
          'https://greenfuture.tech/_next/image?url=https%3A%2F%2Fupload-static.fgf.vn%2Fcms%2Fcho-dem-son-tra-1.jpg&w=1920&q=100',
      rating: 4.7,
      tag: 'Miễn phí',
      distance: '2.5 km',
    ),
  ];
}
