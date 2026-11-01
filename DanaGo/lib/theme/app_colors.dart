// Design tokens - DanaGo App
// Combined: manual tokens + Figma extracted colors

import 'package:flutter/material.dart';

abstract class AppColors {
  AppColors._();

  // ─── Core Brand Colors ─────────────────────────────────────────
  static const Color primary = Color(0xFF006971);
  static const Color secondary = Color(0xFFFF7F50);
  static const Color tertiary = Color(0xFFD98340);
  static const Color neutral = Color(0xFF727879);
  static const Color primaryLight = Color(0xFFE0F7F8);
  static const Color primaryDark = Color(0xFF004D54);
  static const Color accent = Color(0xFFFE7E4F);
  static const Color accentLight = Color(0xFFFFB347);

  // ─── Backgrounds ───────────────────────────────────────────────
  static const Color bgPrimary = Color(0xFFF5FAFB);
  static const Color bgWhite = Color(0xFFFFFFFF);
  static const Color bgCard = Color(0xFFF8FAFC);
  static const Color bgSecondary = Color(0xFFF3F4F6);
  static const Color bgOverlay = Color(0xE5F5FAFB);
  static const Color bgDark = Color(0xFF1A2E35);

  // ─── Text Colors ───────────────────────────────────────────────
  static const Color textPrimary = Color(0xFF111827);
  static const Color textSecondary = Color(0xFF374151);
  static const Color textTertiary = Color(0xFF6B7280);
  static const Color textHint = Color(0xFF9CA3AF);
  static const Color textGray = Color(0xFF6B7280);

  // ─── UI Elements ───────────────────────────────────────────────
  static const Color divider = Color(0xFFE5E7EB);
  static const Color border = Color(0xFFE5E7EB);
  static const Color borderLight = Color(0xFFF3F4F6);
  static const Color shadow = Color(0x14000000);
  static const Color overlay = Color(0x7FBCC9CB);
  static const Color filterOverlay = Color(0x661A2E35);

  // ─── Status / Feedback ─────────────────────────────────────────
  static const Color success = Color(0xFF059669);
  static const Color error = Color(0xFFEF4444);
  static const Color warning = Color(0xFFF59E0B);
  static const Color info = Color(0xFF0284C7);

  // ─── Star / Rating ─────────────────────────────────────────────
  static const Color starActive = Color(0xFFFFB347);
  static const Color starInactive = Color(0xFFDEE3E4);
}
