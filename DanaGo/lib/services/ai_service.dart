import 'dart:convert';
import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:smarttrip/config/auth_config.dart';
import 'package:smarttrip/models/ai_plan_model.dart';
import 'package:smarttrip/services/api_client.dart';
import 'package:smarttrip/services/itinerary_service.dart';

class AiService {
  AiService._();
  static final AiService instance = AiService._();

  final http.Client _client = http.Client();

  /// Địa chỉ của AI Service (FastAPI cổng 8000)
  String get aiBaseUrl {
    if (kIsWeb) return 'http://localhost:8000';
    try {
      final apiUri = Uri.tryParse(AuthConfig.apiUrl);
      if (apiUri != null &&
          apiUri.host.isNotEmpty &&
          apiUri.host != 'localhost' &&
          apiUri.host != '127.0.0.1') {
        return '${apiUri.scheme}://${apiUri.host}:8000';
      }
      if (Platform.isAndroid) {
        return 'http://127.0.0.1:8000';
      }
    } catch (_) {}
    return 'http://127.0.0.1:8000';
  }

  List<String> get _aiBaseUrlCandidates {
    final primary = aiBaseUrl;
    if (kIsWeb) return [primary];
    try {
      if (Platform.isAndroid) {
        final fallback = primary.contains('127.0.0.1')
            ? 'http://10.0.2.2:8000'
            : 'http://127.0.0.1:8000';
        return [primary, fallback];
      }
    } catch (_) {}
    return [primary];
  }

  /// Gợi ý địa điểm thông minh bằng AI Semantic Search: POST /candidates (đồng bộ Web Explore)
  Future<List<Map<String, dynamic>>> searchCandidates({
    required String query,
    List<String> interests = const [],
    int? budgetPp,
    String? region,
    int topK = 50,
  }) async {
    final payload = {
      'query': query.trim().isNotEmpty ? query.trim() : null,
      'interests': interests,
      'budget_pp': budgetPp,
      'region': region,
      'top_k': topK,
    };

    Object? lastError;
    for (final base in _aiBaseUrlCandidates) {
      try {
        final uri = Uri.parse('$base/candidates');
        final response = await _client
            .post(
              uri,
              headers: {'Content-Type': 'application/json'},
              body: jsonEncode(payload),
            )
            .timeout(const Duration(seconds: 20));

        if (response.statusCode >= 200 && response.statusCode < 300) {
          final decoded = jsonDecode(utf8.decode(response.bodyBytes));
          final top = decoded['top'] as List<dynamic>? ?? [];
          return top.whereType<Map<String, dynamic>>().toList();
        } else {
          String errorMsg = 'Lỗi máy chủ AI (${response.statusCode})';
          try {
            final errJson = jsonDecode(utf8.decode(response.bodyBytes));
            if (errJson['detail'] != null) {
              if (errJson['detail'] is List) {
                errorMsg = (errJson['detail'] as List)
                    .map((m) => m['msg'] ?? m.toString())
                    .join(', ');
              } else {
                errorMsg = errJson['detail'].toString();
              }
            }
          } catch (_) {}
          throw Exception(errorMsg);
        }
      } catch (e) {
        lastError = e;
        if (e is Exception && !e.toString().contains('SocketException') &&
            !e.toString().contains('ClientException') &&
            !e.toString().contains('TimeoutException') &&
            !e.toString().contains('Connection refused')) {
          rethrow;
        }
      }
    }

    debugPrint('Lỗi searchCandidates AI: $lastError');
    throw Exception(
      'Không thể kết nối tới AI Service (cổng 8000). Vui lòng đảm bảo server AI đang chạy.',
    );
  }

  /// Gọi API tạo lịch trình AI: POST /plan
  Future<AiPlanResult> generatePlan({
    required int numDays,
    required int budgetPp,
    required List<String> interests,
    String? region,
    List<String>? regions,
    List<int>? selectedIds,
    List<int>? lodgingIds,
    bool includeMeals = true,
    bool includeLodging = true,
    int guestsPerRoom = 2,
    String lodgingPriceTier = 'mid',
    int placesPerDay = 3,
    bool randomize = true,
  }) async {
    final uri = Uri.parse('$aiBaseUrl/plan');
    final validRegions = (regions ?? [])
        .where((r) => r.trim().isNotEmpty && r != 'Tất cả khu vực')
        .toList();
    final payload = {
      'num_days': numDays,
      'budget_pp': budgetPp,
      'interests': interests,
      'region': validRegions.isNotEmpty
          ? validRegions.join(',')
          : ((region != null && region.isNotEmpty && region != 'Tất cả khu vực')
              ? region
              : null),
      'regions': validRegions,
      'selected_ids': selectedIds ?? [],
      'lodging_ids': lodgingIds ?? [],
      'include_meals': includeMeals,
      'include_lodging': includeLodging,
      'guests_per_room': guestsPerRoom,
      'lodging_price_tier': lodgingPriceTier,
      'places_per_day': placesPerDay,
      'randomize': randomize,
    };

    final response = await _client
        .post(
          uri,
          headers: {'Content-Type': 'application/json'},
          body: jsonEncode(payload),
        )
        .timeout(const Duration(seconds: 25));

    if (response.statusCode >= 200 && response.statusCode < 300) {
      final decoded = jsonDecode(utf8.decode(response.bodyBytes));
      return AiPlanResult.fromJson(decoded);
    } else {
      String errorMsg = 'Lỗi tạo lịch trình (${response.statusCode})';
      try {
        final errJson = jsonDecode(utf8.decode(response.bodyBytes));
        if (errJson['detail'] != null) {
          if (errJson['detail'] is List) {
            errorMsg = (errJson['detail'] as List)
                .map((m) => m['msg'] ?? m.toString())
                .join(', ');
          } else {
            errorMsg = errJson['detail'].toString();
          }
        }
      } catch (_) {}
      throw Exception(errorMsg);
    }
  }

  /// Lấy danh sách nơi nghỉ từ AI service: POST /lodging
  Future<List<AiPlanLodging>> getLodgings({
    String? region,
    String? type,
    int? budgetPp,
  }) async {
    final queryParams = <String, String>{};
    if (region != null && region.isNotEmpty && region != 'Tất cả khu vực') {
      queryParams['region'] = region;
    }
    if (type != null && type.isNotEmpty && type != 'ALL') {
      queryParams['type'] = type;
    }
    if (budgetPp != null && budgetPp > 0) {
      queryParams['budget_pp'] = budgetPp.toString();
    }

    final uri = Uri.parse('$aiBaseUrl/lodging').replace(
      queryParameters: queryParams.isNotEmpty ? queryParams : null,
    );

    final response = await _client
        .post(uri, headers: {'Content-Type': 'application/json'})
        .timeout(const Duration(seconds: 15));

    if (response.statusCode >= 200 && response.statusCode < 300) {
      final decoded = jsonDecode(utf8.decode(response.bodyBytes));
      final items = decoded['items'] as List<dynamic>? ?? [];
      return items.map((e) => AiPlanLodging.fromJson(e)).toList();
    } else {
      throw Exception('Không thể tải danh sách nơi lưu trú (${response.statusCode})');
    }
  }

  /// Lưu lịch trình đầy đủ vào Backend NestJS: POST /itineraries/save-full
  Future<bool> saveItineraryFull(Map<String, dynamic> data) async {
    try {
      final res = await ApiClient.instance.post(
        '/itineraries/save-full',
        body: data,
      );
      if (res != null) {
        ItineraryService.instance.notifyChanged();
        return true;
      }
      return false;
    } catch (e) {
      debugPrint('Lỗi lưu lịch trình lên server: $e');
      return false;
    }
  }
}

