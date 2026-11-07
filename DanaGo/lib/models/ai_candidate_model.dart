class AICandidatePlace {
  final int id;
  final String name;
  final String? district;
  final double avgRating;
  final String ticketPrice;
  final String? imageUrl;
  final String groupName;
  final double matchScore; // Tỉ lệ phù hợp (0.0 - 1.0)

  AICandidatePlace({
    required this.id,
    required this.name,
    this.district,
    required this.avgRating,
    required this.ticketPrice,
    this.imageUrl,
    required this.groupName,
    required this.matchScore,
  });

  factory AICandidatePlace.fromJson(
    Map<String, dynamic> json,
    String groupName,
  ) {
    return AICandidatePlace(
      id: json['id'] ?? 0,
      name: json['name'] ?? '',
      district: json['district'] ?? 'Đà Nẵng',
      avgRating: (json['avg_rating'] as num?)?.toDouble() ?? 4.5,
      ticketPrice: json['ticket_price'] ?? 'Miễn phí',
      imageUrl: json['image_url'],
      groupName: groupName,
      matchScore: (json['match_score'] as num?)?.toDouble() ?? 0.85,
    );
  }
}
