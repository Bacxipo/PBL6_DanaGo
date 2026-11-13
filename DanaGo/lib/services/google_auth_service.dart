import 'dart:async';
import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:http/http.dart' as http;
import 'package:smarttrip/config/auth_config.dart';

enum GoogleLoginStatus { idle, opening, exchanging, authenticated, failed }

class GoogleAuthService extends ChangeNotifier {
  GoogleAuthService._();
  static final instance = GoogleAuthService._();
  static const _storage = FlutterSecureStorage();
  final _google = GoogleSignIn.instance;
  Future<void>? _initialization;
  bool _busy = false;
  GoogleLoginStatus status = GoogleLoginStatus.idle;
  String? errorMessage;
  bool hasPreferences = false;

  bool get isBusy => _busy;

  Future<String?> getAccessToken() async {
    return await _storage.read(key: 'accessToken');
  }

  Future<void> initialize() async {
    if (!AuthConfig.isConfigured) return;
    try {
      await (_initialization ??= _google.initialize(
        serverClientId: AuthConfig.googleWebClientId,
      ));
    } catch (_) {
      _initialization = null;
      rethrow;
    }
  }

  Future<void> signIn() async {
    if (_busy) return;
    errorMessage = null;
    if (!AuthConfig.isConfigured) {
      _fail('Chưa cấu hình GOOGLE_WEB_CLIENT_ID cho app.');
      return;
    }
    _busy = true;
    status = GoogleLoginStatus.opening;
    notifyListeners();
    final client = http.Client();
    try {
      await initialize();
      if (!_google.supportsAuthenticate()) {
        _fail('Thiết bị này chưa hỗ trợ cách đăng nhập Google của app.');
        return;
      }
      final account = await _google.authenticate();
      final idToken = account.authentication.idToken;
      if (idToken == null || idToken.isEmpty) {
        _fail('Không lấy được Google ID token. Kiểm tra Web Client ID và SHA-1 Android.');
        return;
      }
      status = GoogleLoginStatus.exchanging;
      notifyListeners();
      final baseUrl = AuthConfig.apiUrl.replaceFirst(RegExp(r'/+$'), '');
      final response = await client.post(
        Uri.parse('$baseUrl/identity/auth/google/mobile'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'idToken': idToken}),
      ).timeout(const Duration(seconds: 40));
      final body = jsonDecode(response.body);
      if (body is! Map<String, dynamic>) {
        _fail('Server trả về dữ liệu không hợp lệ.');
        return;
      }
      if (response.statusCode != 200) {
        final message = body['message'];
        _fail(message is String
            ? message
            : message is List
                ? message.join('\n')
                : 'Đăng nhập DanaGo thất bại.');
        return;
      }
      final token = body['accessToken'];
      if (token is! String || token.isEmpty) {
        _fail('Server không trả về JWT DanaGo hợp lệ.');
        return;
      }
      await _storage.write(key: 'accessToken', value: token);

      // Kiểm tra xem người dùng đã thiết lập sở thích chưa
      hasPreferences = false;
      try {
        final prefResponse = await client.get(
          Uri.parse('$baseUrl/identity/users/me/preferences'),
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer $token',
          },
        ).timeout(const Duration(seconds: 10));
        if (prefResponse.statusCode == 200) {
          final prefBody = jsonDecode(prefResponse.body);
          if (prefBody is Map<String, dynamic> &&
              prefBody['categoryIds'] is List) {
            final List cats = prefBody['categoryIds'];
            hasPreferences = cats.isNotEmpty;
          }
        }
      } catch (_) {
        final localPref = await _storage.read(key: 'has_chosen_preferences');
        hasPreferences = localPref == 'true';
      }

      status = GoogleLoginStatus.authenticated;
    } on GoogleSignInException catch (error) {
      if (error.code == GoogleSignInExceptionCode.canceled) {
        status = GoogleLoginStatus.idle;
      } else if (error.code == GoogleSignInExceptionCode.clientConfigurationError ||
          error.code == GoogleSignInExceptionCode.providerConfigurationError) {
        _fail('Cấu hình Google chưa đúng. Kiểm tra package Android, SHA-1 và Web Client ID.');
      } else {
        _fail('Không thể xác thực Google. Vui lòng thử lại.');
      }
    } on TimeoutException {
      _fail('Server phản hồi quá lâu. Kiểm tra kết nối mạng.');
    } on http.ClientException {
      _fail('Không kết nối được API. Kiểm tra API_URL cổng 5000 và kết nối điện thoại.');
    } on FormatException {
      _fail('Phản hồi không hợp lệ. API_URL phải trỏ đến API NestJS.');
    } catch (_) {
      _fail('Không thể hoàn tất hoặc lưu phiên đăng nhập. Vui lòng thử lại.');
    } finally {
      client.close();
      _busy = false;
      notifyListeners();
    }
  }

  Future<bool> savePreferences(List<int> categoryIds) async {
    await _storage.write(key: 'has_chosen_preferences', value: 'true');
    hasPreferences = true;
    final token = await _storage.read(key: 'accessToken');
    if (token == null || token.isEmpty) return true;

    final baseUrl = AuthConfig.apiUrl.replaceFirst(RegExp(r'/+$'), '');
    final client = http.Client();
    try {
      final response = await client.patch(
        Uri.parse('$baseUrl/identity/users/me/preferences'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode({'categoryIds': categoryIds}),
      ).timeout(const Duration(seconds: 15));
      return response.statusCode == 200;
    } catch (_) {
      return false;
    } finally {
      client.close();
    }
  }

  Future<void> signOut() async {
    if (_busy) throw StateError('Đang xử lý đăng nhập. Vui lòng thử lại.');
    await _storage.delete(key: 'accessToken');
    await _storage.delete(key: 'has_chosen_preferences');
    hasPreferences = false;
    errorMessage = null;
    status = GoogleLoginStatus.idle;
    notifyListeners();
    if (_initialization != null) {
      try {
        await _google.signOut();
      } catch (_) {
        // Local DanaGo logout is already complete.
      }
    }
  }

  void _fail(String message) {
    errorMessage = message;
    status = GoogleLoginStatus.failed;
    notifyListeners();
  }
}
