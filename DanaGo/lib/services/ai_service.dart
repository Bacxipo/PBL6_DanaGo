import 'dart:convert';
import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:smarttrip/models/ai_plan_model.dart';
import 'package:smarttrip/services/api_client.dart';

class AiService {
  AiService._();
  static final AiService instance = AiService._();

  final http.Client _client = http.Client();

  /// Địa chỉ của AI Service (FastAPI cổng 8000)
  String get aiBaseUrl {
    if (kIsWeb) return 'http://localhost:8000';
    try {
      if (Platform.isAndroid) {
        // Trên Android Emulator, 10.0.2.2 là máy chủ localhost
        return 'http://10.0.2.2:8000';
      }
    } catch (_) {}
    return 'http://127.0.0.1:8000';
  }

  /// Gọi API tạo lịch trình AI: POST /plan
  Future<AiPlanResult> generatePlan({
    required int numDays,
    required int budgetPp,
    required List<String> interests,
    String? region,
    List<int>? selectedIds,
    List<int>? lodgingIds,
    bool includeMeals = true,
    bool includeLodging = true,
    int guestsPerRoom = 2,
    bool randomize = true,
  }) async {
    final uri = Uri.parse('$aiBaseUrl/plan');
    final payload = {
      'num_days': numDays,
      'budget_pp': budgetPp,
      'interests': interests,
      'region': (region != null && region.isNotEmpty && region != 'Tất cả khu vực')
          ? region
          : null,
      'selected_ids': selectedIds ?? [],
      'lodging_ids': lodgingIds ?? [],
      'include_meals': includeMeals,
      'include_lodging': includeLodging,
      'guests_per_room': guestsPerRoom,
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
      return res != null;
    } catch (e) {
      debugPrint('Lỗi lưu lịch trình lên server: $e');
      return false;
    }
  }
}

