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
  Map<String, dynamic>? _cachedProfile;
  Future<Map<String, dynamic>?>? _inflightProfile;

  int? get cachedUserId => (_cachedProfile?['id'] as num?)?.toInt();

  void invalidateProfileCache() {
    _cachedProfile = null;
  }

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
      _cachedProfile = null;
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
      _cachedProfile = null;
      notifyListeners();
    }

    return response as Map<String, dynamic>;
  }

  // Lấy tt người dùng (có cache trong RAM + gộp các request trùng thời điểm)
  Future<Map<String, dynamic>?> getProfile({bool forceRefresh = false}) async {
    if (!forceRefresh && _cachedProfile != null) {
      return _cachedProfile;
    }
    if (!forceRefresh && _inflightProfile != null) {
      return _inflightProfile;
    }

    final future = () async {
      try {
        final token = await _storage.read(key: 'accessToken');
        if (token == null || token.isEmpty) {
          _cachedProfile = null;
          return null;
        }
        final response = await ApiClient.instance.get('/identity/users/me');
        if (response is Map<String, dynamic>) {
          _cachedProfile = response;
          return response;
        }
        return null;
      } catch (_) {
        return null;
      } finally {
        _inflightProfile = null;
      }
    }();

    _inflightProfile = future;
    return future;
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
      if (reponse is Map<String, dynamic>) {
        _cachedProfile = reponse;
      } else {
        _cachedProfile = null;
      }
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
        final newAvatarUrl = data['avatarUrl'] as String?;
        if (_cachedProfile != null && newAvatarUrl != null) {
          _cachedProfile = {..._cachedProfile!, 'avatarUrl': newAvatarUrl};
        } else {
          _cachedProfile = null;
        }
        notifyListeners();
        return newAvatarUrl;
      }
      return null;
    } catch (_) {
      return null;
    }
  }

  // Đăng xuất
  Future<void> logout() async {
    _cachedProfile = null;
    _inflightProfile = null;
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

  // Lưu cục bộ các trường hồ sơ mở rộng (Giới tính, Ngày sinh) theo userId trên thiết bị
  Future<void> saveLocalProfileExtras(
    int userId, {
    String? gender,
    DateTime? birthDate,
  }) async {
    try {
      final payload = jsonEncode({
        if (gender != null && gender.isNotEmpty) 'gender': gender,
        if (birthDate != null) 'birthDate': birthDate.toIso8601String(),
      });
      await _storage.write(key: 'profile_extras_$userId', value: payload);
    } catch (_) {}
  }

  // Đọc cục bộ Giới tính & Ngày sinh đã lưu theo userId
  Future<Map<String, dynamic>> getLocalProfileExtras(int userId) async {
    try {
      final raw = await _storage.read(key: 'profile_extras_$userId');
      if (raw != null && raw.isNotEmpty) {
        final decoded = jsonDecode(raw);
        if (decoded is Map<String, dynamic>) return decoded;
      }
    } catch (_) {}
    return {};
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
