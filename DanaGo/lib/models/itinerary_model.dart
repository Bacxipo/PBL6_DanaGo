import 'package:flutter/material.dart';
import 'package:smarttrip/theme/app_colors.dart';

enum ItineraryStatus { ongoing, upcoming, planning, completed }

class ItineraryChecklistItem {
  final int? id;
  final int? itineraryItemId;
  String itemName;
  bool isChecked;
  String? activityTag;

  ItineraryChecklistItem({
    this.id,
    this.itineraryItemId,
    required this.itemName,
    this.isChecked = false,
    this.activityTag,
  });

  factory ItineraryChecklistItem.fromJson(
    Map<String, dynamic> json, {
    String? fallbackTag,
  }) {
    final item = json['itineraryItem'] as Map<String, dynamic>?;
    final dest = item?['destination'] as Map<String, dynamic>?;
    final tag =
        dest?['name']?.toString() ??
        item?['name']?.toString() ??
        fallbackTag;

    return ItineraryChecklistItem(
      id: (json['id'] as num?)?.toInt(),
      itineraryItemId:
          (json['itineraryItemId'] ?? json['itinerary_item_id'] ?? item?['id']) != null
          ? ((json['itineraryItemId'] ?? json['itinerary_item_id'] ?? item?['id']) as num)
              .toInt()
          : null,
      itemName: (json['itemName'] ?? json['item_name'] ?? '').toString(),
      isChecked: json['isChecked'] == true || json['is_checked'] == true,
      activityTag: tag,
    );
  }

  Map<String, dynamic> toSaveJson() => {
    if (id != null) 'id': id,
    'itemName': itemName,
    'isChecked': isChecked,
  };
}

class ItineraryPlace {
  final int? itemId;
  final int? destinationId;
  final int? lodgingId;
  final String name;
  final String imageUrl;
  final String startTime;
  final String endTime;
  final String timeRange;
  final String duration;
  final String description;
  final double rating;
  final String price;
  final double budget;
  final String travelTime;
  final String travelMode;
  final String address;
  final String itemType;
  final String? tag;
  final List<ItineraryChecklistItem> checklists;

  const ItineraryPlace({
    this.itemId,
    this.destinationId,
    this.lodgingId,
    required this.name,
    required this.imageUrl,
    this.startTime = '08:00',
    this.endTime = '10:00',
    required this.timeRange,
    required this.duration,
    required this.description,
    required this.rating,
    required this.price,
    this.budget = 0,
    required this.travelTime,
    required this.travelMode,
    required this.address,
    this.itemType = 'attraction',
    this.tag,
    this.checklists = const [],
  });

  static const String defaultPlaceImage =
      'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=400';

  factory ItineraryPlace.fromJson(Map<String, dynamic> json) {
    final dest = json['destination'] as Map<String, dynamic>?;
    final lodging = json['lodging'] as Map<String, dynamic>?;

    String? img;
    final destImages = dest?['images'] as List<dynamic>?;
    if (destImages != null && destImages.isNotEmpty) {
      final first = destImages.first;
      if (first is Map<String, dynamic>) {
        img = (first['imageUrl'] ?? first['image_url'])?.toString();
      } else if (first is String) {
        img = first;
      }
    }
    if (img == null || img.isEmpty) {
      final lodgingImages = lodging?['images'] as List<dynamic>?;
      if (lodgingImages != null && lodgingImages.isNotEmpty) {
        final first = lodgingImages.first;
        if (first is Map<String, dynamic>) {
          img = (first['imageUrl'] ?? first['image_url'])?.toString();
        } else if (first is String) {
          img = first;
        }
      }
    }

    final start = (json['startTime'] ?? json['start_time'] ?? '08:00').toString();
    final end = (json['endTime'] ?? json['end_time'] ?? '10:00').toString();
    final name =
        (json['name'] ?? dest?['name'] ?? lodging?['name'] ?? 'Điểm đến')
            .toString();

    final rawBudget = json['budget'] ?? 0;
    final parsedBudget = rawBudget is num
        ? rawBudget.toDouble()
        : (double.tryParse(rawBudget.toString()) ?? 0.0);

    final rawRating = dest?['avgRating'] ?? dest?['avg_rating'] ?? lodging?['rating'] ?? 4.5;
    final parsedRating = rawRating is num
        ? rawRating.toDouble()
        : (double.tryParse(rawRating.toString()) ?? 4.5);

    final address =
        (json['location'] ??
                dest?['address'] ??
                dest?['district'] ??
                lodging?['district'] ??
                'Đà Nẵng')
            .toString();

    final notes =
        (json['notes'] ??
                json['tag'] ??
                dest?['description'] ??
                (lodging != null ? 'Lưu trú & Nghỉ ngơi' : 'Tham quan & Khám phá'))
            .toString();

    final rawChecklists = json['checklists'] as List<dynamic>? ?? [];
    final checklists = rawChecklists
        .whereType<Map<String, dynamic>>()
        .map((c) => ItineraryChecklistItem.fromJson(c, fallbackTag: name))
        .toList();

    final destIdVal = json['destinationId'] ?? json['destination_id'] ?? dest?['id'];
    final lodgingIdVal = json['lodgingId'] ?? json['lodging_id'] ?? lodging?['id'];

    return ItineraryPlace(
      itemId: (json['id'] as num?)?.toInt(),
      destinationId: destIdVal != null ? int.tryParse(destIdVal.toString()) : null,
      lodgingId: lodgingIdVal != null ? int.tryParse(lodgingIdVal.toString()) : null,
      name: name,
      imageUrl: (img != null && img.isNotEmpty) ? img : defaultPlaceImage,
      startTime: start,
      endTime: end,
      timeRange: '$start - $end',
      duration: _computeDuration(start, end),
      description: notes,
      rating: double.parse(parsedRating.toStringAsFixed(1)),
      price: _formatPrice(parsedBudget),
      budget: parsedBudget,
      travelTime: 'Di chuyển linh hoạt',
      travelMode: (json['tag'] ?? json['itemType'] ?? 'Xe máy / Taxi').toString(),
      address: address,
      itemType: (json['itemType'] ?? json['item_type'] ?? 'attraction').toString(),
      tag: json['tag']?.toString(),
      checklists: checklists,
    );
  }

  Map<String, dynamic> toSaveJson() => {
    if (destinationId != null) 'destinationId': destinationId,
    if (lodgingId != null) 'lodgingId': lodgingId,
    'name': name,
    'itemType': itemType,
    'type': itemType,
    'tag': tag ?? itemType,
    'time': startTime,
    'startTime': startTime,
    'endTime': endTime,
    'budget': budget,
    'location': address,
    'notes': description,
    'checklists': checklists.map((c) => c.toSaveJson()).toList(),
  };

  static String _computeDuration(String start, String end) {
    try {
      final sParts = start.split(':');
      final eParts = end.split(':');
      if (sParts.length < 2 || eParts.length < 2) return '2h';
      final sMin = int.parse(sParts[0]) * 60 + int.parse(sParts[1]);
      final eMin = int.parse(eParts[0]) * 60 + int.parse(eParts[1]);
      final diff = eMin - sMin;
      if (diff <= 0) return '1h 30m';
      final h = diff ~/ 60;
      final m = diff % 60;
      if (h > 0 && m > 0) return '${h}h ${m}m';
      if (h > 0) return '${h}h';
      return '${m}m';
    } catch (_) {
      return '2h';
    }
  }

  static String _formatPrice(double amount) {
    if (amount <= 0) return 'Miễn phí';
    final str = amount.toInt().toString();
    final buffer = StringBuffer();
    int count = 0;
    for (int i = str.length - 1; i >= 0; i--) {
      buffer.write(str[i]);
      count++;
      if (count % 3 == 0 && i > 0) buffer.write('.');
    }
    return '${buffer.toString().split('').reversed.join()}đ';
  }
}

class ItineraryDay {
  final int dayIndex;
  final String date;
  final String label;
  final List<ItineraryPlace> places;

  const ItineraryDay({
    this.dayIndex = 1,
    required this.date,
    required this.label,
    required this.places,
  });

  ItineraryDay copyWith({List<ItineraryPlace>? places}) {
    return ItineraryDay(
      dayIndex: dayIndex,
      date: date,
      label: label,
      places: places ?? this.places,
    );
  }
}

class Itinerary {
  final String id;
  final String title;
  final String description;
  final String coverImage;
  final DateTime? startDate;
  final DateTime? endDate;
  final String dateRange;
  final int placeCount;
  final ItineraryStatus status;
  final List<String> memberAvatars;
  final double costPerPerson;
  final String temperature;
  final List<ItineraryDay> days;

  const Itinerary({
    required this.id,
    required this.title,
    this.description = '',
    required this.coverImage,
    this.startDate,
    this.endDate,
    required this.dateRange,
    required this.placeCount,
    required this.status,
    this.memberAvatars = const [],
    this.costPerPerson = 0,
    this.temperature = '',
    this.days = const [],
  });

  static const String defaultCoverImage =
      'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800';

  int? get dbId => int.tryParse(id);

  Itinerary copyWith({
    String? id,
    String? title,
    String? description,
    String? coverImage,
    DateTime? startDate,
    DateTime? endDate,
    String? dateRange,
    int? placeCount,
    ItineraryStatus? status,
    double? costPerPerson,
    List<ItineraryDay>? days,
  }) {
    final nextDays = days ?? this.days;
    final nextCount =
        placeCount ?? nextDays.fold<int>(0, (sum, d) => sum + d.places.length);
    return Itinerary(
      id: id ?? this.id,
      title: title ?? this.title,
      description: description ?? this.description,
      coverImage: coverImage ?? this.coverImage,
      startDate: startDate ?? this.startDate,
      endDate: endDate ?? this.endDate,
      dateRange: dateRange ?? this.dateRange,
      placeCount: nextCount,
      status: status ?? this.status,
      memberAvatars: memberAvatars,
      costPerPerson: costPerPerson ?? this.costPerPerson,
      temperature: temperature,
      days: nextDays,
    );
  }

  factory Itinerary.fromJson(Map<String, dynamic> json) {
    final start =
        DateTime.tryParse((json['startDate'] ?? json['start_date'] ?? '').toString()) ??
        DateTime.now();
    final end =
        DateTime.tryParse((json['endDate'] ?? json['end_date'] ?? '').toString()) ??
        start;

    final startOnly = DateTime(start.year, start.month, start.day);
    final endOnly = DateTime(end.year, end.month, end.day);
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);

    ItineraryStatus computedStatus;
    if (today.isBefore(startOnly)) {
      computedStatus = ItineraryStatus.upcoming;
    } else if (today.isAfter(endOnly)) {
      computedStatus = ItineraryStatus.completed;
    } else {
      computedStatus = ItineraryStatus.ongoing;
    }

    final rawItems = json['items'] as List<dynamic>? ?? [];
    final Map<int, List<ItineraryPlace>> grouped = {};
    int maxDay = endOnly.difference(startOnly).inDays + 1;
    if (maxDay < 1) maxDay = 1;
    if (maxDay > 14) maxDay = 14;

    String? firstItemImage;
    for (final raw in rawItems) {
      if (raw is! Map<String, dynamic>) continue;
      final dayIdx =
          ((raw['dayIndex'] ?? raw['day_index'] ?? 1) as num).toInt().clamp(1, 30);
      if (dayIdx > maxDay) maxDay = dayIdx;
      final place = ItineraryPlace.fromJson(raw);
      firstItemImage ??=
          place.imageUrl != ItineraryPlace.defaultPlaceImage ? place.imageUrl : null;
      grouped.putIfAbsent(dayIdx, () => []).add(place);
    }

    final daysList = <ItineraryDay>[];
    for (int d = 1; d <= maxDay; d++) {
      final dateObj = startOnly.add(Duration(days: d - 1));
      final dateLabel =
          '${dateObj.day.toString().padLeft(2, '0')}/${dateObj.month.toString().padLeft(2, '0')}';
      daysList.add(
        ItineraryDay(
          dayIndex: d,
          date: dateLabel,
          label: 'Ngày $d',
          places: grouped[d] ?? [],
        ),
      );
    }

    final rawBudget = json['budget'] ?? 0;
    final parsedBudget = rawBudget is num
        ? rawBudget.toDouble()
        : (double.tryParse(rawBudget.toString()) ?? 0.0);

    final coverRaw = (json['coverImg'] ?? json['cover_img'] ?? '').toString().trim();
    final cover = coverRaw.isNotEmpty
        ? coverRaw
        : (firstItemImage ?? defaultCoverImage);

    String fmtShort(DateTime dt) =>
        '${dt.day.toString().padLeft(2, '0')}/${dt.month.toString().padLeft(2, '0')}';
    String fmtFull(DateTime dt) =>
        '${dt.day.toString().padLeft(2, '0')}/${dt.month.toString().padLeft(2, '0')}/${dt.year}';

    final rangeStr = startOnly == endOnly
        ? fmtFull(startOnly)
        : '${fmtShort(startOnly)} - ${fmtFull(endOnly)}';

    return Itinerary(
      id: (json['id'] ?? '').toString(),
      title: (json['title'] ?? 'Lịch trình Đà Nẵng').toString(),
      description: (json['description'] ?? '').toString(),
      coverImage: cover,
      startDate: startOnly,
      endDate: endOnly,
      dateRange: rangeStr,
      placeCount: rawItems.length,
      status: computedStatus,
      costPerPerson: parsedBudget,
      days: daysList,
    );
  }

  Map<String, dynamic> toSavePayload() {
    String fmtIso(DateTime d) =>
        '${d.year}-${d.month.toString().padLeft(2, '0')}-${d.day.toString().padLeft(2, '0')}';
    final s = startDate ?? DateTime.now();
    final e = endDate ?? s.add(Duration(days: (days.length - 1).clamp(0, 30)));
    final daysMap = <String, dynamic>{};
    for (int i = 0; i < days.length; i++) {
      final day = days[i];
      final key = (day.dayIndex > 0 ? day.dayIndex : i + 1).toString();
      daysMap[key] = day.places.map((p) => p.toSaveJson()).toList();
    }
    final parsedId = dbId;
    return {
      if (parsedId != null && parsedId > 0 && parsedId <= 2147483647)
        'id': parsedId,
      'title': title,
      'startDate': fmtIso(s),
      'endDate': fmtIso(e),
      if (description.isNotEmpty) 'description': description,
      'coverImg': coverImage,
      'budget': costPerPerson,
      'days': daysMap,
    };
  }

  static const Color ongoingColor = AppColors.accent;
  static const Color upcomingColor = AppColors.info;
  static const Color planningColor = AppColors.textTertiary;
  static const Color completedColor = AppColors.success;

  Color get statusColor {
    switch (status) {
      case ItineraryStatus.ongoing:
        return ongoingColor;
      case ItineraryStatus.upcoming:
        return upcomingColor;
      case ItineraryStatus.planning:
        return planningColor;
      case ItineraryStatus.completed:
        return completedColor;
    }
  }

  IconData get statusIcon {
    switch (status) {
      case ItineraryStatus.ongoing:
        return Icons.directions_run_rounded;
      case ItineraryStatus.upcoming:
        return Icons.flight_takeoff_rounded;
      case ItineraryStatus.planning:
        return Icons.edit_calendar_rounded;
      case ItineraryStatus.completed:
        return Icons.check_circle_rounded;
    }
  }

  String get statusLabel {
    switch (status) {
      case ItineraryStatus.ongoing:
        return 'Đang diễn ra';
      case ItineraryStatus.upcoming:
        return 'Sắp tới';
      case ItineraryStatus.planning:
        return 'Đang lên kế hoạch';
      case ItineraryStatus.completed:
        return 'Đã hoàn thành';
    }
  }

  static const List<Itinerary> sampleList = [];
}
