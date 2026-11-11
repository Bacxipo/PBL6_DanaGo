import 'package:smarttrip/models/destination_item.dart';
import 'package:smarttrip/services/api_client.dart';

class DestinationService {
  DestinationService._();
  static final instance = DestinationService._();

  Future<List<DestinationItem>> getFeature({int limit = 6}) async {
    try {
      final res = await ApiClient.instance.get(
        '/destinations/featured?limit=$limit',
      );
      if (res is List) {
        return res.map((e) => DestinationItem.fromJson(e)).toList();
      }
      return [];
    } catch (_) {
      return [];
    }
  }

  Future<List<DestinationItem>> getAll({
    int? categoryId,
    String? search,
    String? district,
  }) async {
    try {
      final params = <String>[];
      if (categoryId != null && categoryId > 0) {
        params.add('categoryId=$categoryId');
      }
      if (search != null && search.isNotEmpty) {
        params.add('search=${Uri.encodeComponent(search)}');
      }
      if (district != null && district.isNotEmpty) {
        params.add('district=${Uri.encodeComponent(district)}');
      }

      final query = params.isNotEmpty ? '?${params.join('&')}' : '';
      final res = await ApiClient.instance.get('/destinations$query');

      if (res is List) {
        return res.map((e) => DestinationItem.fromJson(e)).toList();
      }
      return [];
    } catch (_) {
      return [];
    }
  }

  Future<DestinationItem?> getById(int id) async {
    try {
      final res = await ApiClient.instance.get('/destinations/$id');
      if (res is Map<String, dynamic>) {
        return DestinationItem.fromJson(res);
      }
      return null;
    } catch (_) {
      return null;
    }
  }

  Future<List<Map<String, dynamic>>> getCategories() async {
    try {
      final res = await ApiClient.instance.get('/destinations/categories');
      if (res is List) {
        return res.map<Map<String, dynamic>>((item) {
          if (item is Map) {
            return Map<String, dynamic>.from(item);
          } else {
            return {'id': 0, 'name': item.toString()};
          }
        }).toList();
      }
      return [];
    } catch (_) {
      return [];
    }
  }

  Future<List<DestinationItem>> getRecommended({int limit = 6}) async {
    try {
      final res = await ApiClient.instance.get(
        '/destinations/recommended?limit=$limit',
      );
      if (res is List) {
        return res.map((e) => DestinationItem.fromJson(e)).toList();
      }
      return [];
    } catch (_) {
      return [];
    }
  }

  Future<List<DestinationItem>> getNearby({
    double? lat,
    double? lng,
    int limit = 6,
  }) async {
    try {
      final params = <String>['limit=$limit'];
      if (lat != null) params.add('lat=$lat');
      if (lng != null) params.add('lng=$lng');
      final query = '?${params.join('&')}';
      final res = await ApiClient.instance.get('/destinations/nearby$query');
      if (res is List) {
        return res.map((e) => DestinationItem.fromJson(e)).toList();
      }
      return [];
    } catch (_) {
      return [];
    }
  }
}
