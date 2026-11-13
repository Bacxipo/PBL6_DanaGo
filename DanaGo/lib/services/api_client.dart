import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:http/http.dart' as http;
import 'package:smarttrip/config/auth_config.dart';

/// Lớp xử lý lỗi khi gọi API
class ApiException implements Exception {
  final String message;
  final int? statusCode;

  ApiException(this.message, {this.statusCode});
  @override
  String toString() => message;
}

/// ApiClient: Cầu nối gửi nhận dữ liệu giữa Mobile và NestJS
class ApiClient {
  ApiClient._();
  static final ApiClient instance = ApiClient._();

  static const _storage = FlutterSecureStorage();
  final http.Client _client = http.Client();
  // Địa chỉ Backend NestJS
  String get baseUrl => AuthConfig.apiUrl.replaceFirst(RegExp(r'/+$'), '');
  // Lấy mã JWT token
  Future<String?> get token async => await _storage.read(key: 'accessToken');

  // Tự động kẹp Token vào Header để Backend biết ai đang gọi
  Future<Map<String, String>> _buildHeaders() async {
    final headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    final currentToken = await token;
    if (currentToken != null && currentToken.isNotEmpty) {
      headers['Authorization'] = 'Bearer $currentToken';
    }
    return headers;
  }

  // 1. Hàm GET: Dùng để LẤY dữ liệu về
  Future<dynamic> get(String endpoint) async {
    return _send(() async {
      final path = endpoint.startsWith('/') ? endpoint : '/$endpoint';
      final uri = Uri.parse('$baseUrl$path');
      final headers = await _buildHeaders();
      final response = await _client
          .get(uri, headers: headers)
          .timeout(const Duration(seconds: 15));
      return _processResponse(response);
    });
  }

  // 2. Hàm POST: Dùng để GỬI dữ liệu lên
  Future<dynamic> post(String endpoint, {Map<String, dynamic>? body}) async {
    return _send(() async {
      final path = endpoint.startsWith('/') ? endpoint : '/$endpoint';
      final uri = Uri.parse('$baseUrl$path');
      final headers = await _buildHeaders();
      final response = await _client
          .post(
            uri,
            headers: headers,
            body: body != null ? jsonEncode(body) : null,
          )
          .timeout(const Duration(seconds: 20));
      return _processResponse(response);
    });
  }

  //3. Hàm PATCH: Dùng để CẬP NHẬT dữ liệu
  Future<dynamic> patch(String endpoint, {Map<String, dynamic>? body}) async {
    return _send(() async {
      final path = endpoint.startsWith('/') ? endpoint : '/$endpoint';
      final uri = Uri.parse('$baseUrl$path');
      final headers = await _buildHeaders();
      final response = await _client
          .patch(
            uri,
            headers: headers,
            body: body != null ? jsonEncode(body) : null,
          )
          .timeout(const Duration(seconds: 20));
      return _processResponse(response);
    });
  }

  // 4. Hàm DELETE: Dùng để XÓA dữ liệu
  Future<dynamic> delete(String endpoint) async {
    return _send(() async {
      final path = endpoint.startsWith('/') ? endpoint : '/$endpoint';
      final uri = Uri.parse('$baseUrl$path');
      final headers = await _buildHeaders();
      final response = await _client
          .delete(uri, headers: headers)
          .timeout(const Duration(seconds: 15));
      return _processResponse(response);
    });
  }

  // Đọc phản hồi từ Backend và xử lý thông báo lỗi nếu có
  dynamic _processResponse(http.Response response) {
    dynamic jsonBody;
    try {
      jsonBody = response.body.isNotEmpty ? jsonDecode(response.body) : null;
    } catch (_) {
      jsonBody = null;
    }
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return jsonBody;
    }
  }

  // Bắt các lỗi mất kết nối vật lý
  Future<T> _send<T>(Future<T> Function() request) async {
    try {
      return await request();
    } on SocketException catch (e) {
      throw ApiException('Lỗi Socket: ${e.message}');
    } on TimeoutException {
      throw ApiException('Máy chủ phản hồi quá lâu (Timeout).');
    } on http.ClientException catch (e) {
      throw ApiException('Lỗi kết nối: ${e.message}');
    } catch (e) {
      throw ApiException('Lỗi ngoại lệ: $e');
    }
  }
}
