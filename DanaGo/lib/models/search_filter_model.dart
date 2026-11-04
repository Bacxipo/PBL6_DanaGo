class SearchFilterModel {
  final String category;
  final String? priceFrom;
  final String? priceTo;
  final String area;
  final String minRating;

  const SearchFilterModel({
    this.category = 'Tất cả',
    this.priceFrom,
    this.priceTo,
    this.area = 'Tất cả quận/huyện',
    this.minRating = 'any',
  });

  Map<String, String> toQueryParams() {
    final Map<String, String> params = {};
    if (category != 'Tất cả') params['category'] = category;
    if (priceFrom != null && priceFrom!.isNotEmpty)
      params['min_price'] = priceFrom!;
    if (priceTo != null && priceTo!.isNotEmpty) params['max_price'] = priceTo!;
    if (area != 'Tất cả quận/huyện') params['district'] = area;
    if (minRating != 'any') params['min_rating'] = minRating;
    return params;
  }

  int get activeFilterCount {
    int count = 0;
    if (category != 'Tất cả') count++;
    if (area != 'Tất cả quận/huyện') count++;
    if (minRating != 'any') count++;
    if (priceFrom != null && priceFrom!.isNotEmpty) count++;
    if (priceTo != null && priceTo!.isNotEmpty) count++;
    return count;
  }

  static const List<String> categories = [
    'Tất cả',
    'Thiên nhiên',
    'Ăn uống',
    'Văn hóa',
    'Vui chơi',
  ];

  static const List<String> areas = [
    'Tất cả quận/huyện',
    'Hải Châu',
    'Thanh Khê',
    'Sơn Trà',
    'Ngũ Hành Sơn',
    'Liên Chiểu',
    'Cẩm Lệ',
  ];

  static const List<String> quickFilters = [
    'Gần tôi',
    'Đang mở cửa',
    'Đánh giá 4.5+',
  ];
}
