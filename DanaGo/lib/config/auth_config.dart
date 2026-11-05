import 'dart:convert';
import 'package:flutter/services.dart';

class AuthConfig {
  static Map<String, dynamic> _fileConfig = {};

  static Future<void> load() async {
    final content = await rootBundle.loadString('config/auth.example.json');
    final decoded = jsonDecode(content);
    if (decoded is! Map<String, dynamic>) {
      throw const FormatException('config/auth.example.json phải là một JSON object.');
    }
    _fileConfig = decoded;
  }

  static String _value(String name, String override, [String fallback = '']) {
    if (override.trim().isNotEmpty) return override.trim();
    final value = _fileConfig[name];
    return value is String && value.trim().isNotEmpty ? value.trim() : fallback;
  }
  // Web OAuth client ID configured in the server's Supabase Google provider.
  static String get googleWebClientId => _value(
    'GOOGLE_WEB_CLIENT_ID',
    const String.fromEnvironment('GOOGLE_WEB_CLIENT_ID'),
  );
  // USB port forwarding, or override with the computer's LAN address for Wi-Fi.
  // Call the NestJS API directly; no Next.js server is needed by the app.
  static String get apiUrl => _value(
    'API_URL',
    const String.fromEnvironment('API_URL'),
    'http://127.0.0.1:5000',
  );

  static bool get isConfigured => googleWebClientId.isNotEmpty;
}
