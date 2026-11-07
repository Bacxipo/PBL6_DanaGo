import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:smarttrip/config/auth_config.dart';
import 'package:smarttrip/screens/main_screen.dart';
import 'package:smarttrip/screens/onboarding_screen.dart';
import 'package:smarttrip/theme/app_colors.dart';
import 'package:smarttrip/theme/theme_controller.dart';
Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await AuthConfig.load();

  // Google SDK initialization happens when the user selects Google login.

  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  // This widget is the root of your application.
  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder<ThemeMode>(
      valueListenable: ThemeController.themeMode,
      builder: (context, currentMode, _) {
        return MaterialApp(
          title: 'DanaGo',
          debugShowCheckedModeBanner: false,
          scrollBehavior: MyCustomScrollBehavior(),
          themeMode: currentMode,
          theme: ThemeData(
            useMaterial3: true,
            brightness: Brightness.light,
            scaffoldBackgroundColor: AppColors.bgPrimary,
            colorScheme: ColorScheme.fromSeed(
              seedColor: AppColors.primary,
              brightness: Brightness.light,
              surface: Colors.white,
            ),
            cardColor: Colors.white,
          ),
          darkTheme: ThemeData(
            useMaterial3: true,
            brightness: Brightness.dark,
            scaffoldBackgroundColor: const Color(0xFF0F172A),
            colorScheme: ColorScheme.fromSeed(
              seedColor: AppColors.primary,
              brightness: Brightness.dark,
              surface: const Color(0xFF1E293B),
            ),
            cardColor: const Color(0xFF1E293B),
          ),
          home: const OnboardingScreen(),
        );
      },
    );
  }
}

class MyCustomScrollBehavior extends MaterialScrollBehavior {
  @override
  Set<PointerDeviceKind> get dragDevices => {
    PointerDeviceKind.touch,
    PointerDeviceKind.mouse, // Cho phép vuốt bằng chuột
  };
}
