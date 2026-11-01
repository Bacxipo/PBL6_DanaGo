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
  });
  static final List<DestinationItem> featuredItems = [
    const DestinationItem(
      id: '1',
      title: 'Cầu Rồng',
      category: 'BIỂU TƯỢNG',
      imageUrl: 'https://i.postimg.cc/jdZSnPSm/caurong1.jpg',
      rating: 4.9,
      tag: 'Miễn phí',
      address: 'Quận Hải Châu',
      openHours: 'Cả ngày',
      description:
          'Cầu Rồng là một trong những biểu tượng kiến trúc độc đáo và niềm tự hào của người dân Đà Nẵng. Cây cầu có thiết kế hình một con rồng uốn lượn vươn mình ra biển lớn, thể hiện khát vọng phát triển mạnh mẽ của thành phố.',
      galleryImages: [
        'https://i.postimg.cc/5Nn2QL2Z/caurong3.jpg',
        'https://i.postimg.cc/ZKV5vpqk/caurong4.jpg',
        'https://i.postimg.cc/3Jnx0mw5/caurong5.jpg',
      ],
    ),
    const DestinationItem(
      id: '2',
      title: 'Bà Nà Hills',
      category: 'KHU DU LỊCH',
      imageUrl: 'https://i.postimg.cc/xTt1NM1g/bana1.jpg',
      rating: 4.8,
      tag: 'Vé vào cửa',
      address: 'Hòa Vang',
      openHours: '08:00 - 22:00',
      description:
          'Khu du lịch sinh thái kết hợp nghỉ dưỡng đẳng cấp với Cầu Vàng nổi tiếng thế giới.',
      galleryImages: [
        'https://i.postimg.cc/vH3ZxfZ3/bana2.jpg',
        'https://i.postimg.cc/65Yp4npc/bana3.jpg',
        'https://i.postimg.cc/rFQwRxwf/bana4.jpg',
        'https://i.postimg.cc/3Jnx0mx6/bana5.jpg',
      ],
    ),
  ];
  static final List<DestinationItem> recommendedItems = [
    const DestinationItem(
      id: '3',
      title: 'Mì Quảng Bà Vị',
      category: 'ẨM THỰC',
      imageUrl: 'https://i.postimg.cc/Jz04N0sF/myquang.jpg',
      rating: 4.7,
      tag: '\$',
    ),
    const DestinationItem(
      id: '4',
      title: 'Biển Mỹ Khê',
      category: 'BÃI BIỂN',
      imageUrl: 'https://i.postimg.cc/nc0h9BLx/mykhe.jpg',
      rating: 4.9,
      tag: 'Miễn phí',
    ),
  ];
  static final List<DestinationItem> nearbyItems = [
    const DestinationItem(
      id: '5',
      title: 'Bảo tàng Điêu khắc Chăm',
      category: 'DI TÍCH',
      imageUrl: 'https://i.postimg.cc/MKdpfVpF/baotang.jpg',
      rating: 4.6,
      tag: 'Vé vào cửa',
      distance: '1.2 km',
    ),
    const DestinationItem(
      id: '6',
      title: 'Chợ Đêm Sơn Trà',
      category: 'MUA SẮM',
      imageUrl: 'https://i.postimg.cc/hPptQTGq/chodem1.jpg',
      rating: 4.7,
      tag: 'Miễn phí',
      distance: '2.5 km',
    ),
  ];
}
