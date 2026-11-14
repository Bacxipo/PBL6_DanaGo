class AiPlanResult {
  final int numDays;
  final int budgetPp;
  final int totalCostPp;
  final int budgetLeftPp;
  final List<AiPlanDay> days;
  final List<String> warnings;

  AiPlanResult({
    required this.numDays,
    required this.budgetPp,
    required this.totalCostPp,
    required this.budgetLeftPp,
    required this.days,
    required this.warnings,
  });

  factory AiPlanResult.fromJson(Map<String, dynamic> json) {
    return AiPlanResult(
      numDays: json['num_days'] ?? 0,
      budgetPp: json['budget_pp'] ?? 0,
      totalCostPp: json['total_cost_pp'] ?? 0,
      budgetLeftPp: json['budget_left_pp'] ?? 0,
      days: (json['days'] as List<dynamic>?)
              ?.map((d) => AiPlanDay.fromJson(d as Map<String, dynamic>))
              .toList() ??
          [],
      warnings: (json['warnings'] as List<dynamic>?)
              ?.map((w) => w.toString())
              .toList() ??
          [],
    );
  }
}

class AiPlanDay {
  final int day;
  final String? region;
  final List<AiPlanItem> items;
  final AiPlanLodging? night;
  final int costPp;

  AiPlanDay({
    required this.day,
    this.region,
    required this.items,
    this.night,
    required this.costPp,
  });

  factory AiPlanDay.fromJson(Map<String, dynamic> json) {
    return AiPlanDay(
      day: json['day'] ?? 1,
      region: json['region'] as String?,
      items: (json['items'] as List<dynamic>?)
              ?.map((it) => AiPlanItem.fromJson(it as Map<String, dynamic>))
              .toList() ??
          [],
      night: json['night'] != null && json['night'] is Map
          ? AiPlanLodging.fromJson(json['night'] as Map<String, dynamic>)
          : null,
      costPp: json['cost_pp'] ?? 0,
    );
  }
}

class AiPlanItem {
  final int id;
  final String name;
  final String? district;
  final String? region;
  final String? start;
  final String? end;
  final int priceEst;
  final String type; // 'breakfast', 'lunch', 'dinner', 'checkin', 'checkout', 'return', 'attraction'
  final String? label;
  final double? latitude;
  final double? longitude;
  final String? addressUrl;
  final String? priceText;
  // true = quán ăn: giá tùy theo món, không tính vào ngân sách
  final bool priceExcluded;
  final String? description;
  final int? travelMin;
  final double? distanceKm;

  AiPlanItem({
    required this.id,
    required this.name,
    this.district,
    this.region,
    this.start,
    this.end,
    required this.priceEst,
    required this.type,
    this.label,
    this.latitude,
    this.longitude,
    this.addressUrl,
    this.priceText,
    this.priceExcluded = false,
    this.description,
    this.travelMin,
    this.distanceKm,
  });

  bool get isMeal => type == 'breakfast' || type == 'lunch' || type == 'dinner';

  /// Chuỗi hiển thị giá cho item
  String get displayPriceNote {
    if (priceExcluded) {
      return (priceText != null && priceText!.isNotEmpty) ? priceText! : 'Tùy theo món ăn';
    }
    if (priceText != null && priceText!.isNotEmpty) return priceText!;
    return 'Miễn phí';
  }

  factory AiPlanItem.fromJson(Map<String, dynamic> json) {
    final type = json['type'] as String? ?? 'attraction';
    final isMealType = type == 'breakfast' || type == 'lunch' || type == 'dinner';
    return AiPlanItem(
      id: json['id'] is int ? json['id'] : int.tryParse(json['id'].toString()) ?? 0,
      name: json['name'] ?? '',
      district: json['district'] as String?,
      region: json['region'] as String?,
      start: json['start'] as String?,
      end: json['end'] as String?,
      priceEst: (json['price_est'] as num?)?.toInt() ?? 0,
      type: type,
      label: json['label'] as String?,
      latitude: (json['latitude'] as num?)?.toDouble(),
      longitude: (json['longitude'] as num?)?.toDouble(),
      addressUrl: json['address_url'] as String?,
      priceText: json['price_text']?.toString(),
      // Quán ăn có id > 0 (không phải "tự túc") luôn coi như không tính tiền
      priceExcluded: json['price_excluded'] == true ||
          (isMealType && json['price_text']?.toString() != 'Tự túc'),
      description: json['description']?.toString(),
      travelMin: (json['travel_min'] as num?)?.toInt(),
      distanceKm: (json['distance_km'] as num?)?.toDouble(),
    );
  }
}

class AiPlanLodging {
  final int id;
  final String name;
  final String? type;
  final String? district;
  final String? region;
  final int pricePerNight;
  final int pricePpNight;
  final int maxGuests;
  final String? checkin;
  final String? checkout;
  final double avgRating;
  final double? latitude;
  final double? longitude;
  final String? addressUrl;

  AiPlanLodging({
    required this.id,
    required this.name,
    this.type,
    this.district,
    this.region,
    required this.pricePerNight,
    required this.pricePpNight,
    required this.maxGuests,
    this.checkin,
    this.checkout,
    required this.avgRating,
    this.latitude,
    this.longitude,
    this.addressUrl,
  });

  factory AiPlanLodging.fromJson(Map<String, dynamic> json) {
    return AiPlanLodging(
      id: json['id'] is int ? json['id'] : int.tryParse(json['id'].toString()) ?? 0,
      name: json['name'] ?? '',
      type: json['type'] as String?,
      district: json['district'] as String?,
      region: json['region'] as String?,
      pricePerNight: (json['price_per_night'] as num?)?.toInt() ??
          (json['price_pp_night'] as num?)?.toInt() ??
          0,
      pricePpNight: (json['price_pp_night'] as num?)?.toInt() ?? 0,
      maxGuests: (json['max_guests'] as num?)?.toInt() ?? 2,
      checkin: json['checkin'] as String?,
      checkout: json['checkout'] as String?,
      avgRating: (json['avg_rating'] as num?)?.toDouble() ?? 4.5,
      latitude: (json['latitude'] as num?)?.toDouble(),
      longitude: (json['longitude'] as num?)?.toDouble(),
      addressUrl: json['address_url'] as String?,
    );
  }
}

