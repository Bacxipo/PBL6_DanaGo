// Design tokens - DanaGo App (Apple HIG Semantic + Da Nang Coastal Identity)

import 'package:flutter/material.dart';

abstract class AppColors {
  AppColors._();

  // ─── Core Brand Colors (Da Nang Coastal Teal & Sunset Coral) ───
  static const Color primary = Color(0xFF006971);
  static const Color primaryDarkMode = Color(0xFF2DD4BF);
  static const Color secondary = Color(0xFFFF7F50);
  static const Color tertiary = Color(0xFFD98340);
  static const Color neutral = Color(0xFF64748B);
  static const Color primaryLight = Color(0xFFE6F4F5);
  static const Color primaryDark = Color(0xFF004D54);
  static const Color accent = Color(0xFFFE7E4F);
  static const Color accentLight = Color(0xFFFFB347);

  // ─── Backgrounds (Apple Grouped Light & Elevated Dark) ─────────
  static const Color bgPrimary = Color(0xFFF2F5F7); // iOS grouped canvas (light)
  static const Color bgWhite = Color(0xFFFFFFFF);
  static const Color bgCard = Color(0xFFFFFFFF);
  static const Color bgSecondary = Color(0xFFE9EEF2);
  static const Color bgOverlay = Color(0xE6F2F5F7);
  static const Color bgDark = Color(0xFF090E14); // iOS true base dark
  static const Color bgDarkElevated = Color(0xFF131C26); // iOS elevated card dark
  static const Color bgDarkTertiary = Color(0xFF1C2735); // iOS tertiary surface dark

  // ─── Text Colors (WCAG AA >= 4.5:1 on white) ───────────────────
  static const Color textPrimary = Color(0xFF0F172A); // 17.4:1 on white
  static const Color textSecondary = Color(0xFF334155); // 10.3:1 on white
  static const Color textTertiary = Color(0xFF526071); // 6.3:1 on white
  static const Color textHint = Color(0xFF64748B); // 4.7:1 on white
  static const Color textGray = Color(0xFF526071);

  // ─── UI Elements (Apple Hairline Separators) ───────────────────
  static const Color divider = Color(0xFFE2E8F0);
  static const Color border = Color(0xFFE2E8F0);
  static const Color borderLight = Color(0xFFF1F5F9);
  static const Color shadow = Color(0x0D0F172A);
  static const Color overlay = Color(0x7FBCC9CB);
  static const Color filterOverlay = Color(0x661A2E35);

  // ─── Status / Feedback (Apple System Semantics) ────────────────
  static const Color success = Color(0xFF10B981);
  static const Color error = Color(0xFFEF4444);
  static const Color warning = Color(0xFFF59E0B);
  static const Color info = Color(0xFF0284C7);

  // ─── Star / Rating ─────────────────────────────────────────────
  static const Color starActive = Color(0xFFF59E0B);
  static const Color starInactive = Color(0xFFCBD5E1);

  // ─── Semantic Helpers (Light / Dark Adaptive) ──────────────────
  static Color accentOf(BuildContext context) =>
      Theme.of(context).brightness == Brightness.dark
          ? primaryDarkMode
          : primary;

  static Color labelPrimary(BuildContext context) =>
      Theme.of(context).brightness == Brightness.dark
          ? const Color(0xFFF8FAFC)
          : textPrimary;

  static Color labelSecondary(BuildContext context) =>
      Theme.of(context).brightness == Brightness.dark
          ? const Color(0xFF94A3B8)
          : textTertiary;

  static Color hairlineBorder(BuildContext context) =>
      Theme.of(context).brightness == Brightness.dark
          ? Colors.white.withValues(alpha: 0.08)
          : const Color(0xFF0F172A).withValues(alpha: 0.06);

  static Color surfaceGrouped(BuildContext context) =>
      Theme.of(context).brightness == Brightness.dark
          ? bgDarkElevated
          : bgWhite;

  static Color surfaceTertiary(BuildContext context) =>
      Theme.of(context).brightness == Brightness.dark
          ? bgDarkTertiary
          : const Color(0xFFF1F5F9);
}
