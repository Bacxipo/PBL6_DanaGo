import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:smarttrip/services/api_client.dart';

class AuthService {
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

  // Đăng xuất
  Future<void> logout() async {
    await _storage.delete(key: 'accessToken');
    await _storage.delete(key: 'has_chosen_preferences');
  }

  //Kiểm tra người dùng login chưa
  Future<bool> isLoggedIn() async {
    final token = await _storage.read(key: 'accessToken');
    return token != null && token.isNotEmpty;
  }
}
