import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:smarttrip/config/auth_config.dart';
import 'package:smarttrip/screens/onboarding_screen.dart';
import 'package:smarttrip/theme/app_colors.dart';
import 'package:smarttrip/theme/theme_controller.dart';
import 'package:smarttrip/screens/main_screen.dart';
import 'package:smarttrip/services/api_client.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await AuthConfig.load();
  await ThemeController.loadTheme();
  final token = await ApiClient.instance.token;
  runApp(MyApp(isLoggedIn: token != null && token.isNotEmpty));
}

class MyApp extends StatelessWidget {
  final bool isLoggedIn;
  const MyApp({super.key, this.isLoggedIn = false});

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
          builder: (context, child) {
            return MediaQuery(
              data: MediaQuery.of(context).copyWith(
                textScaler: MediaQuery.of(
                  context,
                ).textScaler.clamp(minScaleFactor: 0.85, maxScaleFactor: 1.05),
              ),
              child: child!,
            );
          },
          home: isLoggedIn ? const MainScreen() : const OnboardingScreen(),
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
