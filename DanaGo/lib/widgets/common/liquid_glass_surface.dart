import 'dart:ui';
import 'package:flutter/material.dart';

enum LiquidGlassVariant { regular, clear }

class LiquidGlassSurface extends StatelessWidget {
  final Widget child;
  final BorderRadius borderRadius;
  final EdgeInsetsGeometry? padding;
  final LiquidGlassVariant variant;
  final List<BoxShadow>? boxShadow;

  const LiquidGlassSurface({
    super.key,
    required this.child,
    this.borderRadius = const BorderRadius.all(Radius.circular(28)),
    this.padding,
    this.variant = LiquidGlassVariant.regular,
    this.boxShadow,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final highContrast = MediaQuery.of(context).highContrast;

    final double blurSigma = variant == LiquidGlassVariant.regular
        ? 30.0
        : 16.0;

    final Color fillColor;
    if (highContrast) {
      fillColor = isDark ? const Color(0xFF131C26) : Colors.white;
    } else if (variant == LiquidGlassVariant.regular) {
      fillColor = isDark
          ? const Color(0xFF111922).withValues(alpha: 0.62)
          : Colors.white.withValues(alpha: 0.64);
    } else {
      fillColor = isDark
          ? Colors.black.withValues(alpha: 0.36)
          : Colors.black.withValues(alpha: 0.28);
    }

    final Color borderColor = highContrast
        ? (isDark ? Colors.white38 : Colors.black26)
        : (isDark
              ? Colors.white.withValues(alpha: 0.18)
              : Colors.white.withValues(alpha: 0.92));

    final shadows =
        boxShadow ??
        [
          BoxShadow(
            color: Colors.black.withValues(alpha: isDark ? 0.42 : 0.12),
            blurRadius: 28,
            spreadRadius: -2,
            offset: const Offset(0, 10),
          ),
          BoxShadow(
            color: Colors.black.withValues(alpha: isDark ? 0.20 : 0.04),
            blurRadius: 6,
            offset: const Offset(0, 2),
          ),
        ];

    return Container(
      decoration: BoxDecoration(borderRadius: borderRadius, boxShadow: shadows),
      child: ClipRRect(
        borderRadius: borderRadius,
        child: BackdropFilter(
          filter: ImageFilter.blur(
            sigmaX: highContrast ? 0 : blurSigma,
            sigmaY: highContrast ? 0 : blurSigma,
          ),
          child: Container(
            padding: padding,
            decoration: BoxDecoration(
              color: fillColor,
              borderRadius: borderRadius,
              border: Border.all(color: borderColor, width: 1.1),
              gradient: highContrast
                  ? null
                  : LinearGradient(
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                      colors: variant == LiquidGlassVariant.clear
                          ? [
                              Colors.white.withValues(alpha: 0.22),
                              Colors.white.withValues(alpha: 0.06),
                            ]
                          : isDark
                          ? [
                              Colors.white.withValues(alpha: 0.12),
                              Colors.white.withValues(alpha: 0.02),
                            ]
                          : [
                              Colors.white.withValues(alpha: 0.72),
                              Colors.white.withValues(alpha: 0.28),
                            ],
                    ),
            ),
            child: child,
          ),
        ),
      ),
    );
  }
}
