import 'package:smarttrip/models/lodging_item.dart';
import 'package:smarttrip/services/api_client.dart';

class LodgingService {
  LodgingService._();
  static final LodgingService instance = LodgingService._();
  final ApiClient _api = ApiClient.instance;

  Future<List<LodgingItem>> getLodgings({
    String? search,
    String? type,
    String? district,
    int? maxGuests,
    double? maxPrice,
    List<int>? amenityIds,
    String status = 'APPROVED',
  }) async {
    try {
      final queryParams = <String, String>{};
      if (status.isNotEmpty) queryParams['status'] = status;
      if (search != null && search.trim().isNotEmpty) {
        queryParams['search'] = search.trim();
      }
      if (type != null && type.isNotEmpty && type != 'Tất cả') {
        queryParams['type'] = type;
      }
      if (district != null && district.isNotEmpty && district != 'Tất cả') {
        queryParams['district'] = district;
      }
      if (maxGuests != null && maxGuests > 0) {
        queryParams['maxGuests'] = maxGuests.toString();
      }
      if (maxPrice != null && maxPrice > 0) {
        queryParams['maxPrice'] = maxPrice.round().toString();
      }
      if (amenityIds != null && amenityIds.isNotEmpty) {
        queryParams['amenityIds'] = amenityIds.join(',');
      }

      final queryString = Uri(queryParameters: queryParams).query;
      final endpoint =
          queryString.isNotEmpty ? '/lodgings?$queryString' : '/lodgings';
      final response = await _api.get(endpoint);
      if (response is List) {
        return response
            .whereType<Map<String, dynamic>>()
            .map(LodgingItem.fromJson)
            .toList();
      }
      return [];
    } catch (_) {
      return [];
    }
  }

  Future<List<AmenityItem>> getAmenities() async {
    try {
      final response = await _api.get('/lodgings/amenities');
      if (response is List) {
        return response
            .whereType<Map<String, dynamic>>()
            .map(AmenityItem.fromJson)
            .toList();
      }
      return [];
    } catch (_) {
      return [];
    }
  }
}
