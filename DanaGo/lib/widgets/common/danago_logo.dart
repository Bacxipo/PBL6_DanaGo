import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:smarttrip/theme/app_colors.dart';

enum DanaGoLogoVariant { mark, horizontal, vertical }

/// Reusable crisp vector brand logo for DanaGo across Splash, Onboarding,
/// Login, Register, and AppBars.
class DanaGoLogo extends StatelessWidget {
  final DanaGoLogoVariant variant;
  final double markSize;
  final double? fontSize;
  final bool onDark;
  final bool showTagline;
  final String tagline;

  const DanaGoLogo({
    super.key,
    this.variant = DanaGoLogoVariant.horizontal,
    this.markSize = 36,
    this.fontSize,
    this.onDark = false,
    this.showTagline = false,
    this.tagline = 'Khám phá Đà Nẵng thông minh',
  });

  const DanaGoLogo.mark({
    super.key,
    this.markSize = 56,
    this.onDark = false,
  })  : variant = DanaGoLogoVariant.mark,
        fontSize = null,
        showTagline = false,
        tagline = '';

  const DanaGoLogo.horizontal({
    super.key,
    this.markSize = 28,
    this.fontSize,
    this.onDark = false,
  })  : variant = DanaGoLogoVariant.horizontal,
        showTagline = false,
        tagline = '';

  const DanaGoLogo.vertical({
    super.key,
    this.markSize = 68,
    this.fontSize,
    this.onDark = false,
    this.showTagline = false,
    this.tagline = 'Khám phá Đà Nẵng thông minh',
  }) : variant = DanaGoLogoVariant.vertical;

  @override
  Widget build(BuildContext context) {
    final isDarkTheme = Theme.of(context).brightness == Brightness.dark;
    final useLightInk = onDark || isDarkTheme;

    final markWidget = SvgPicture.asset(
      onDark
          ? 'assets/images/danago_logo_mark_white.svg'
          : 'assets/images/danago_logo_mark.svg',
      width: markSize,
      height: markSize,
      fit: BoxFit.contain,
    );

    if (variant == DanaGoLogoVariant.mark) {
      return markWidget;
    }

    final resolvedFontSize =
        fontSize ?? (variant == DanaGoLogoVariant.vertical ? 28.0 : 20.0);

    final wordmark = RichText(
      text: TextSpan(
        style: TextStyle(
          fontFamily: 'Be Vietnam Pro',
          fontSize: resolvedFontSize,
          fontWeight: FontWeight.w800,
          letterSpacing: -0.3,
          height: 1.1,
        ),
        children: [
          TextSpan(
            text: 'Dana',
            style: TextStyle(
              color: useLightInk ? Colors.white : AppColors.primaryDark,
            ),
          ),
          TextSpan(
            text: 'Go',
            style: TextStyle(
              color: onDark ? const Color(0xFFFFB347) : AppColors.secondary,
            ),
          ),
        ],
      ),
    );

    if (variant == DanaGoLogoVariant.horizontal) {
      return Row(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          markWidget,
          SizedBox(width: markSize * 0.24),
          wordmark,
        ],
      );
    }

    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        markWidget,
        const SizedBox(height: 10),
        wordmark,
        if (showTagline) ...[
          const SizedBox(height: 6),
          Text(
            tagline,
            textAlign: TextAlign.center,
            style: TextStyle(
              fontFamily: 'Be Vietnam Pro',
              fontSize: 13,
              fontWeight: FontWeight.w500,
              letterSpacing: 0.25,
              color: onDark
                  ? Colors.white.withValues(alpha: 0.85)
                  : AppColors.textTertiary,
            ),
          ),
        ],
      ],
    );
  }
}
