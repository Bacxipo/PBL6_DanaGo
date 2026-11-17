import 'package:flutter/material.dart';

enum EventTimelineStatus { happening, upcoming, ended }

class EventItem {
  final int id;
  final String name;
  final String description;
  final int? destinationId;
  final String? destinationName;
  final String? destinationDistrict;
  final String? locationNote;
  final DateTime startDate;
  final DateTime endDate;
  final double ticketPrice;
  final List<String> images;
  final bool isFavorited;

  const EventItem({
    required this.id,
    required this.name,
    this.description = '',
    this.destinationId,
    this.destinationName,
    this.destinationDistrict,
    this.locationNote,
    required this.startDate,
    required this.endDate,
    this.ticketPrice = 0,
    this.images = const [],
    this.isFavorited = false,
  });

  factory EventItem.fromJson(Map<String, dynamic> json) {
    final dest = json['destination'] as Map<String, dynamic>?;
    final rawImages = json['images'] as List<dynamic>? ?? [];
    final imageUrls = rawImages
        .map((img) {
          if (img is String) return img;
          if (img is Map<String, dynamic>) {
            return (img['imageUrl'] ?? img['image_url'] ?? '').toString();
          }
          return '';
        })
        .where((url) => url.isNotEmpty)
        .toList();

    final parsedStart =
        DateTime.tryParse((json['startDate'] ?? json['start_date'] ?? '').toString()) ??
        DateTime.now();
    final parsedEnd =
        DateTime.tryParse((json['endDate'] ?? json['end_date'] ?? '').toString()) ??
        parsedStart;

    final rawPrice = json['ticketPrice'] ?? json['ticket_price'] ?? 0;
    final price = rawPrice is num
        ? rawPrice.toDouble()
        : (double.tryParse(rawPrice.toString()) ?? 0.0);

    return EventItem(
      id: (json['id'] as num?)?.toInt() ?? 0,
      name: (json['name'] ?? 'Sự kiện Đà Nẵng').toString(),
      description: (json['description'] ?? '').toString(),
      destinationId: (json['destinationId'] ?? json['destination_id'] ?? dest?['id']) != null
          ? ((json['destinationId'] ?? json['destination_id'] ?? dest?['id']) as num).toInt()
          : null,
      destinationName: dest?['name']?.toString(),
      destinationDistrict: dest?['district']?.toString(),
      locationNote: (json['locationNote'] ?? json['location_note'])?.toString(),
      startDate: parsedStart,
      endDate: parsedEnd,
      ticketPrice: price,
      images: imageUrls,
      isFavorited: json['isFavorited'] == true,
    );
  }

  EventItem copyWith({bool? isFavorited}) {
    return EventItem(
      id: id,
      name: name,
      description: description,
      destinationId: destinationId,
      destinationName: destinationName,
      destinationDistrict: destinationDistrict,
      locationNote: locationNote,
      startDate: startDate,
      endDate: endDate,
      ticketPrice: ticketPrice,
      images: images,
      isFavorited: isFavorited ?? this.isFavorited,
    );
  }

  String get coverImage => images.isNotEmpty ? images.first : '';

  String get locationText {
    if (locationNote != null && locationNote!.trim().isNotEmpty) {
      return locationNote!.trim();
    }
    if (destinationName != null && destinationName!.trim().isNotEmpty) {
      if (destinationDistrict != null && destinationDistrict!.trim().isNotEmpty) {
        return '${destinationName!.trim()}, ${destinationDistrict!.trim()}';
      }
      return destinationName!.trim();
    }
    return 'Đà Nẵng';
  }

  DateTime get _startDateOnly => DateTime(startDate.year, startDate.month, startDate.day);
  DateTime get _endDateOnly => DateTime(endDate.year, endDate.month, endDate.day);

  EventTimelineStatus get timelineStatus {
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    if (today.isAfter(_endDateOnly)) return EventTimelineStatus.ended;
    if (!today.isBefore(_startDateOnly) && !today.isAfter(_endDateOnly)) {
      return EventTimelineStatus.happening;
    }
    return EventTimelineStatus.upcoming;
  }

  int get daysUntilStart {
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    return _startDateOnly.difference(today).inDays;
  }

  String get badgeLabel {
    switch (timelineStatus) {
      case EventTimelineStatus.happening:
        return 'Đang diễn ra';
      case EventTimelineStatus.ended:
        return 'Đã kết thúc';
      case EventTimelineStatus.upcoming:
        final days = daysUntilStart;
        if (days <= 0) return 'Hôm nay';
        if (days == 1) return 'Ngày mai';
        return 'Còn $days ngày';
    }
  }

  Color get badgeColor {
    switch (timelineStatus) {
      case EventTimelineStatus.happening:
        return const Color(0xFF10B981);
      case EventTimelineStatus.upcoming:
        return const Color(0xFFF59E0B);
      case EventTimelineStatus.ended:
        return const Color(0xFF6B7280);
    }
  }

  String get formattedDateRange {
    String fmtFull(DateTime d) =>
        '${d.day.toString().padLeft(2, '0')}/${d.month.toString().padLeft(2, '0')}/${d.year}';
    String fmtShort(DateTime d) =>
        '${d.day.toString().padLeft(2, '0')}/${d.month.toString().padLeft(2, '0')}';

    if (_startDateOnly == _endDateOnly) {
      return fmtFull(_startDateOnly);
    }
    if (_startDateOnly.year == _endDateOnly.year) {
      return '${fmtShort(_startDateOnly)} - ${fmtFull(_endDateOnly)}';
    }
    return '${fmtFull(_startDateOnly)} - ${fmtFull(_endDateOnly)}';
  }

  String get formattedPrice {
    if (ticketPrice <= 0) return 'Miễn phí';
    final str = ticketPrice.toInt().toString();
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
