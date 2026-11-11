import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class ThemeController {
  static const _storage = FlutterSecureStorage();
  static final ValueNotifier<ThemeMode> themeMode = ValueNotifier(
    ThemeMode.light,
  );

  static Future<void> loadTheme() async {
    final saved = await _storage.read(key: 'isDarkMode');
    themeMode.value = saved == 'true' ? ThemeMode.dark : ThemeMode.light;
  }

  static void toggleTheme(bool isDark) {
    themeMode.value = isDark ? ThemeMode.dark : ThemeMode.light;
    _storage.write(key: 'isDarkMode', value: isDark.toString());
  }
}
