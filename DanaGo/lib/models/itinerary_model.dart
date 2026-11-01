import 'package:flutter/material.dart';
import 'package:smarttrip/theme/app_colors.dart';

enum ItineraryStatus { ongoing, upcoming, planning, completed }

class ItineraryPlace {
  final String name;
  final String imageUrl;
  final String timeRange;
  final String duration;
  final String description;
  final double rating;
  final String price;
  final String travelTime;
  final String travelMode;
  final String address;

  const ItineraryPlace({
    required this.name,
    required this.imageUrl,
    required this.timeRange,
    required this.duration,
    required this.description,
    required this.rating,
    required this.price,
    required this.travelTime,
    required this.travelMode,
    required this.address,
  });
}

class ItineraryDay {
  final String date;
  final String label;
  final List<ItineraryPlace> places;

  const ItineraryDay({
    required this.date,
    required this.label,
    required this.places,
  });
}

class Itinerary {
  final String id;
  final String title;
  final String coverImage;
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
    required this.coverImage,
    required this.dateRange,
    required this.placeCount,
    required this.status,
    this.memberAvatars = const [],
    this.costPerPerson = 0,
    this.temperature = '',
    this.days = const [],
  });

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

  static final List<Itinerary> sampleList = [
    Itinerary(
      id: '1',
      title: 'Hè rực rỡ Đà Nẵng',
      coverImage:
          'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800',
      dateRange: '15/06 - 17/06/2026',
      placeCount: 6,
      status: ItineraryStatus.ongoing,
      memberAvatars: [
        'https://i.pravatar.cc/100?img=1',
        'https://i.pravatar.cc/100?img=2',
        'https://i.pravatar.cc/100?img=3',
        'https://i.pravatar.cc/100?img=4',
      ],
      costPerPerson: 1450000,
      temperature: '29°C Nắng đẹp',
      days: [
        ItineraryDay(
          date: '15/06',
          label: 'Ngày 1',
          places: [
            ItineraryPlace(
              name: 'Bãi biển Mỹ Khê',
              imageUrl:
                  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400',
              timeRange: '08:30 - 10:00',
              duration: '1h 30m',
              description: 'Tắm biển & Check-in',
              rating: 4.8,
              price: 'Miễn phí',
              travelTime: '15 phút di chuyển',
              travelMode: 'Đường Võ Nguyên 1',
              address: 'Quận Ngũ Hành Sơn, Đà Nẵng',
            ),
            ItineraryPlace(
              name: 'Chùa Linh Ứng - Sơn Trà',
              imageUrl:
                  'https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=400',
              timeRange: '10:30 - 12:00',
              duration: '1h 30m',
              description: 'Tâm linh & Danh thắng',
              rating: 4.7,
              price: 'Vào: Miễn phí',
              travelTime: '20 phút di chuyển',
              travelMode: 'Cung đường Sơn Trà',
              address: 'Bán đảo Sơn Trà, Đà Nẵng',
            ),
            ItineraryPlace(
              name: 'Bánh Tráng Thịt Heo Bà Mua',
              imageUrl:
                  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400',
              timeRange: '12:30 - 14:00',
              duration: '1h 30m',
              description: 'Ẩm thực địa phương',
              rating: 4.5,
              price: '90.000đ/người',
              travelTime: '15 phút di chuyển',
              travelMode: 'Cung đường sen B',
              address: 'Quận Hải Châu, Đà Nẵng',
            ),
            ItineraryPlace(
              name: 'Cà Phê Sơn Trà Marina',
              imageUrl:
                  'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400',
              timeRange: '15:30 - 17:30',
              duration: '2h',
              description: 'View biển ngắm hoàng hôn',
              rating: 4.6,
              price: '45.000đ/người',
              travelTime: '15 phút di chuyển',
              travelMode: 'Đường ven biển',
              address: 'Quận Sơn Trà, Đà Nẵng',
            ),
          ],
        ),
        ItineraryDay(
          date: '16/06',
          label: 'Ngày 2',
          places: [
            ItineraryPlace(
              name: 'Cầu Rồng',
              imageUrl:
                  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
              timeRange: '08:00 - 09:30',
              duration: '1h 30m',
              description: 'Biểu tượng Đà Nẵng',
              rating: 4.9,
              price: 'Miễn phí',
              travelTime: '10 phút di chuyển',
              travelMode: 'Đường ven sông',
              address: 'Trung tâm Đà Nẵng',
            ),
            ItineraryPlace(
              name: 'Bà Nà Hills',
              imageUrl:
                  'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=400',
              timeRange: '10:00 - 16:00',
              duration: '6h',
              description: 'Công viên giải trí & Cầu Vàng',
              rating: 4.8,
              price: '750.000đ/người',
              travelTime: '45 phút di chuyển',
              travelMode: 'Quốc lộ 14G',
              address: 'Huyện Hòa Vang, Đà Nẵng',
            ),
          ],
        ),
        ItineraryDay(
          date: '17/06',
          label: 'Ngày 3',
          places: [
            ItineraryPlace(
              name: 'Phố cổ Hội An',
              imageUrl:
                  'https://images.unsplash.com/photo-1559000357-f6b52ddfbe37?w=400',
              timeRange: '08:30 - 13:00',
              duration: '4h 30m',
              description: 'Di sản văn hóa thế giới',
              rating: 4.9,
              price: '120.000đ/người',
              travelTime: '45 phút di chuyển',
              travelMode: 'Quốc lộ 1A',
              address: 'Thành phố Hội An, Quảng Nam',
            ),
          ],
        ),
      ],
    ),
    Itinerary(
      id: '2',
      title: 'Trốn nóng Bà Nà',
      coverImage:
          'https://images.unsplash.com/photo-1514190051997-0f6f39ca5cde?w=800',
      dateRange: '02/08 - 04/08/2024',
      placeCount: 2,
      status: ItineraryStatus.upcoming,
      days: [],
    ),
    Itinerary(
      id: '3',
      title: 'Food Tour Quanh Thành Phố',
      coverImage:
          'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800',
      dateRange: 'Chưa xác định ngày',
      placeCount: 8,
      status: ItineraryStatus.planning,
      days: [],
    ),
  ];
}
