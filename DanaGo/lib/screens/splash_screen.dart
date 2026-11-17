import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:smarttrip/screens/main_screen.dart';
import 'package:smarttrip/screens/onboarding_screen.dart';
import 'package:smarttrip/services/api_client.dart';
import 'package:smarttrip/widgets/common/danago_logo.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen>
    with TickerProviderStateMixin {
  late final AnimationController _introController;
  late final AnimationController _pulseController;

  late final Animation<double> _badgeScale;
  late final Animation<double> _badgeFade;
  late final Animation<Offset> _textSlide;
  late final Animation<double> _textFade;
  late final Animation<double> _footerFade;

  @override
  void initState() {
    super.initState();

    _introController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    );

    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 2000),
    )..repeat(reverse: true);

    _badgeScale = Tween<double>(begin: 0.72, end: 1.0).animate(
      CurvedAnimation(
        parent: _introController,
        curve: const Interval(0.0, 0.6, curve: Curves.easeOutBack),
      ),
    );
    _badgeFade = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _introController,
        curve: const Interval(0.0, 0.45, curve: Curves.easeOut),
      ),
    );
    _textSlide = Tween<Offset>(
      begin: const Offset(0, 0.28),
      end: Offset.zero,
    ).animate(
      CurvedAnimation(
        parent: _introController,
        curve: const Interval(0.32, 0.8, curve: Curves.easeOutCubic),
      ),
    );
    _textFade = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _introController,
        curve: const Interval(0.32, 0.75, curve: Curves.easeOut),
      ),
    );
    _footerFade = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _introController,
        curve: const Interval(0.6, 1.0, curve: Curves.easeOut),
      ),
    );

    _introController.forward();
    _bootstrapAndNavigate();
  }

  Future<void> _bootstrapAndNavigate() async {
    final results = await Future.wait([
      ApiClient.instance.token,
      Future<void>.delayed(const Duration(milliseconds: 2100)),
    ]);

    if (!mounted) return;
    final token = results[0] as String?;
    final isLoggedIn = token != null && token.isNotEmpty;

    Navigator.of(context).pushReplacement(
      PageRouteBuilder(
        transitionDuration: const Duration(milliseconds: 520),
        pageBuilder: (_, _, _) =>
            isLoggedIn ? const MainScreen() : const OnboardingScreen(),
        transitionsBuilder: (_, animation, _, child) {
          return FadeTransition(
            opacity: CurvedAnimation(
              parent: animation,
              curve: Curves.easeInOut,
            ),
            child: child,
          );
        },
      ),
    );
  }

  @override
  void dispose() {
    _introController.dispose();
    _pulseController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: SystemUiOverlayStyle.light,
      child: Scaffold(
        body: Container(
          width: double.infinity,
          height: double.infinity,
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [
                Color(0xFF003B42),
                Color(0xFF005A62),
                Color(0xFF007A85),
              ],
              stops: [0.0, 0.52, 1.0],
            ),
          ),
          child: Stack(
            children: [
              // Soft ambient coral sunset glow (top-right)
              Positioned(
                top: -90,
                right: -80,
                child: Container(
                  width: 260,
                  height: 260,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    gradient: RadialGradient(
                      colors: [
                        const Color(0xFFFF7F50).withValues(alpha: 0.24),
                        const Color(0xFFFF7F50).withValues(alpha: 0.0),
                      ],
                    ),
                  ),
                ),
              ),

              // Soft aqua coastal glow (bottom-left)
              Positioned(
                bottom: 90,
                left: -90,
                child: Container(
                  width: 280,
                  height: 280,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    gradient: RadialGradient(
                      colors: [
                        const Color(0xFF4FD1C5).withValues(alpha: 0.22),
                        const Color(0xFF4FD1C5).withValues(alpha: 0.0),
                      ],
                    ),
                  ),
                ),
              ),

              // Layered Da Nang coastal waves along bottom
              Positioned(
                left: 0,
                right: 0,
                bottom: 0,
                height: 170,
                child: AnimatedBuilder(
                  animation: _pulseController,
                  builder: (context, _) {
                    return CustomPaint(
                      painter: _CoastalWavesPainter(
                        phase: _pulseController.value,
                      ),
                    );
                  },
                ),
              ),

              // Center brand reveal
              Positioned.fill(
                child: SafeArea(
                  child: SizedBox(
                    width: double.infinity,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [
                        const Spacer(flex: 4),
                    FadeTransition(
                      opacity: _badgeFade,
                      child: ScaleTransition(
                        scale: _badgeScale,
                        child: AnimatedBuilder(
                          animation: _pulseController,
                          builder: (context, child) {
                            final haloScale =
                                1.0 + (_pulseController.value * 0.07);
                            return Stack(
                              alignment: Alignment.center,
                              children: [
                                // Breathing outer halo
                                Transform.scale(
                                  scale: haloScale,
                                  child: Container(
                                    width: 146,
                                    height: 146,
                                    decoration: BoxDecoration(
                                      borderRadius: BorderRadius.circular(40),
                                      border: Border.all(
                                        color: Colors.white.withValues(
                                          alpha: 0.16,
                                        ),
                                        width: 1.5,
                                      ),
                                      color: Colors.white.withValues(
                                        alpha: 0.06,
                                      ),
                                    ),
                                  ),
                                ),
                                child!,
                              ],
                            );
                          },
                          child: Container(
                            width: 118,
                            height: 118,
                            padding: const EdgeInsets.all(18),
                            decoration: BoxDecoration(
                              borderRadius: BorderRadius.circular(32),
                              gradient: LinearGradient(
                                begin: Alignment.topLeft,
                                end: Alignment.bottomRight,
                                colors: [
                                  Colors.white.withValues(alpha: 0.22),
                                  Colors.white.withValues(alpha: 0.08),
                                ],
                              ),
                              border: Border.all(
                                color: Colors.white.withValues(alpha: 0.34),
                                width: 1.4,
                              ),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.black.withValues(alpha: 0.22),
                                  blurRadius: 28,
                                  offset: const Offset(0, 14),
                                ),
                              ],
                            ),
                            child: const DanaGoLogo.mark(
                              markSize: 82,
                              onDark: true,
                            ),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 28),
                    FadeTransition(
                      opacity: _textFade,
                      child: SlideTransition(
                        position: _textSlide,
                        child: Column(
                          children: [
                            RichText(
                              text: const TextSpan(
                                style: TextStyle(
                                  fontFamily: 'Be Vietnam Pro',
                                  fontSize: 38,
                                  fontWeight: FontWeight.w800,
                                  letterSpacing: 0.4,
                                  height: 1.1,
                                ),
                                children: [
                                  TextSpan(
                                    text: 'Dana',
                                    style: TextStyle(color: Colors.white),
                                  ),
                                  TextSpan(
                                    text: 'Go',
                                    style: TextStyle(
                                      color: Color(0xFFFFB347),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(height: 10),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 14,
                                vertical: 6,
                              ),
                              decoration: BoxDecoration(
                                color: Colors.white.withValues(alpha: 0.12),
                                borderRadius: BorderRadius.circular(20),
                                border: Border.all(
                                  color: Colors.white.withValues(alpha: 0.2),
                                ),
                              ),
                              child: const Text(
                                'Khám phá Đà Nẵng thông minh',
                                style: TextStyle(
                                  fontFamily: 'Be Vietnam Pro',
                                  fontSize: 13,
                                  fontWeight: FontWeight.w500,
                                  color: Colors.white,
                                  letterSpacing: 0.3,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                    const Spacer(flex: 3),

                    // Bottom loading indicator & subtle subtitle
                    FadeTransition(
                      opacity: _footerFade,
                      child: Column(
                        children: [
                          SizedBox(
                            width: 140,
                            child: ClipRRect(
                              borderRadius: BorderRadius.circular(99),
                              child: LinearProgressIndicator(
                                minHeight: 3.5,
                                backgroundColor: Colors.white.withValues(
                                  alpha: 0.18,
                                ),
                                valueColor: const AlwaysStoppedAnimation<Color>(
                                  Color(0xFFFFB347),
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(height: 14),
                          Text(
                            'Đang chuẩn bị hành trình của bạn...',
                            style: TextStyle(
                              fontFamily: 'Be Vietnam Pro',
                              fontSize: 12,
                              fontWeight: FontWeight.w500,
                              color: Colors.white.withValues(alpha: 0.78),
                            ),
                          ),
                          const SizedBox(height: 28),
                        ],
                      ),
                    ),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _CoastalWavesPainter extends CustomPainter {
  final double phase;

  _CoastalWavesPainter({required this.phase});

  @override
  void paint(Canvas canvas, Size size) {
    final shift = math.sin(phase * math.pi) * 14;

    final backWave = Paint()
      ..color = Colors.white.withValues(alpha: 0.07)
      ..style = PaintingStyle.fill;

    final backPath = Path()
      ..moveTo(0, size.height * 0.42 + shift * 0.3)
      ..quadraticBezierTo(
        size.width * 0.28,
        size.height * 0.12 - shift * 0.4,
        size.width * 0.56,
        size.height * 0.44,
      )
      ..quadraticBezierTo(
        size.width * 0.82,
        size.height * 0.70 + shift * 0.3,
        size.width,
        size.height * 0.36,
      )
      ..lineTo(size.width, size.height)
      ..lineTo(0, size.height)
      ..close();
    canvas.drawPath(backPath, backWave);

    final frontWave = Paint()
      ..color = Colors.white.withValues(alpha: 0.11)
      ..style = PaintingStyle.fill;

    final frontPath = Path()
      ..moveTo(0, size.height * 0.62 - shift * 0.25)
      ..quadraticBezierTo(
        size.width * 0.32,
        size.height * 0.90 + shift * 0.3,
        size.width * 0.64,
        size.height * 0.58,
      )
      ..quadraticBezierTo(
        size.width * 0.86,
        size.height * 0.38 - shift * 0.25,
        size.width,
        size.height * 0.60,
      )
      ..lineTo(size.width, size.height)
      ..lineTo(0, size.height)
      ..close();
    canvas.drawPath(frontPath, frontWave);
  }

  @override
  bool shouldRepaint(covariant _CoastalWavesPainter oldDelegate) {
    return oldDelegate.phase != phase;
  }
}
