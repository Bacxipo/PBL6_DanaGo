import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:http_parser/http_parser.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:smarttrip/services/api_client.dart';
import 'package:smarttrip/services/favorite_service.dart';
import 'package:smarttrip/services/itinerary_service.dart';
import 'package:smarttrip/services/notification_service.dart';
import 'package:smarttrip/services/review_service.dart';

class AuthService extends ChangeNotifier {
  AuthService._();
  static final AuthService instance = AuthService._();

  static const _storage = FlutterSecureStorage();
  //Đăng nhập
  Future<Map<String, dynamic>> login({
    required String emailOrUsername,
    required String password,
  }) async {
    final response = await ApiClient.instance.post(
      'identity/auth/login',
      body: {'emailOrUsername': emailOrUsername.trim(), 'password': password},
    );
    //lưu token
    if (response is Map<String, dynamic> && response['accessToken'] != null) {
      final token = response['accessToken'] as String;
      await _storage.write(key: 'accessToken', value: token);
      notifyListeners();
    }
    return response as Map<String, dynamic>;
  }

  //Đăng ký
  Future<Map<String, dynamic>> register({
    required String fullName,
    required String username,
    required String email,
    required String password,
  }) async {
    final response = await ApiClient.instance.post(
      'identity/auth/register',
      body: {
        'fullName': fullName.trim(),
        'username': username.trim().toLowerCase(),
        'email': email.trim().toLowerCase(),
        'password': password,
      },
    );
    //lưu token
    if (response is Map<String, dynamic> && response['accessToken'] != null) {
      final token = response['accessToken'] as String;
      await _storage.write(key: 'accessToken', value: token);
      notifyListeners();
    }

    return response as Map<String, dynamic>;
  }

  // Lấy tt người dùng
  Future<Map<String, dynamic>?> getProfile() async {
    try {
      final response = await ApiClient.instance.get('/identity/users/me');
      return response as Map<String, dynamic>?;
    } catch (_) {
      return null;
    }
  }

  // cập nhật thông tin
  Future<Map<String, dynamic>?> updateProfile({
    required String fullName,
    String? phoneNumber,
    String? bio,
    List<int>? categoryIds,
  }) async {
    try {
      final reponse = await ApiClient.instance.patch(
        '/identity/users/me',
        body: {
          'fullName': fullName.trim(),
          'phoneNumber': phoneNumber?.trim() ?? '',
          'bio': bio?.trim() ?? '',
          if (categoryIds != null) 'categoryIds': categoryIds,
        },
      );
      notifyListeners();
      return reponse as Map<String, dynamic>?;
    } catch (_) {
      return null;
    }
  }

  //cập nhật ảnh đại diện
  Future<String?> updateAvatar(String filePath) async {
    try {
      final token = await ApiClient.instance.token;
      final uri = Uri.parse(
        '${ApiClient.instance.baseUrl}/identity/users/me/avatar',
      );
      final req = http.MultipartRequest('PATCH', uri);
      if (token != null) req.headers['Authorization'] = 'Bearer $token';

      final ext = filePath.split('.').last.toLowerCase();
      final subType = (ext == 'png' || ext == 'webp') ? ext : 'jpeg';
      req.files.add(
        await http.MultipartFile.fromPath(
          'file',
          filePath,
          contentType: MediaType('image', subType),
        ),
      );
      final streameRes = await req.send();
      final res = await http.Response.fromStream(streameRes);
      if (res.statusCode >= 200 && res.statusCode < 300) {
        final data = jsonDecode(res.body);
        notifyListeners();
        return data['avatarUrl'] as String?;
      }
      return null;
    } catch (_) {
      return null;
    }
  }

  // Đăng xuất
  Future<void> logout() async {
    await _storage.delete(key: 'accessToken');
    await _storage.delete(key: 'has_chosen_preferences');
    FavoriteService.instance.clear();
    ReviewService.instance.clear();
    NotificationService.instance.clear();
    ItineraryService.instance.clear();
    notifyListeners();
  }

  //Kiểm tra người dùng login chưa
  Future<bool> isLoggedIn() async {
    final token = await _storage.read(key: 'accessToken');
    return token != null && token.isNotEmpty;
  }

  // Theo dõi / Hủy theo dõi một người dùng
  Future<Map<String, dynamic>?> toggleFollow(int targetUserId) async {
    try {
      final res = await ApiClient.instance.post('/identity/users/$targetUserId/follow');
      if (res is Map<String, dynamic>) {
        notifyListeners();
        return res;
      }
      return null;
    } catch (_) {
      return null;
    }
  }

  // Lấy thống kê theo dõi của một người dùng
  Future<Map<String, dynamic>?> getFollowStats(int targetUserId) async {
    try {
      final res = await ApiClient.instance.get('/identity/users/$targetUserId/follow-stats');
      return res as Map<String, dynamic>?;
    } catch (_) {
      return null;
    }
  }

  // Lấy thông tin công khai của một người dùng theo ID
  Future<Map<String, dynamic>?> getPublicProfile(int userId) async {
    try {
      final res = await ApiClient.instance.get('/identity/users/$userId/public');
      return res as Map<String, dynamic>?;
    } catch (_) {
      return null;
    }
  }

  // Lấy danh sách sở thích (categoryIds)
  Future<List<int>> getPreferences() async {
    try {
      final res = await ApiClient.instance.get('/identity/users/me/preferences');
      if (res is Map<String, dynamic> && res['categoryIds'] is List) {
        return (res['categoryIds'] as List)
            .whereType<num>()
            .map((e) => e.toInt())
            .toList();
      }
      return [];
    } catch (_) {
      return [];
    }
  }

  // Lưu sở thích (categoryIds)
  Future<bool> savePreferences(List<int> categoryIds) async {
    try {
      final res = await ApiClient.instance.patch(
        '/identity/users/me/preferences',
        body: {'categoryIds': categoryIds},
      );
      await _storage.write(key: 'has_chosen_preferences', value: 'true');
      notifyListeners();
      return res != null;
    } catch (_) {
      return false;
    }
  }
}
