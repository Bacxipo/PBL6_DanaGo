import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:smarttrip/config/auth_config.dart';
import 'package:smarttrip/screens/main_screen.dart';
import 'package:smarttrip/theme/app_colors.dart';
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
    return MaterialApp(
      title: 'DanaGo',
      debugShowCheckedModeBanner: false,
      scrollBehavior: MyCustomScrollBehavior(),
      theme: ThemeData(
        useMaterial3: true,
        scaffoldBackgroundColor: AppColors.bgPrimary,
        colorScheme: ColorScheme.fromSeed(
          seedColor: AppColors.primary,
          surface: AppColors.bgPrimary,
        ),
        bottomNavigationBarTheme: const BottomNavigationBarThemeData(
          backgroundColor: AppColors.bgPrimary,
          elevation: 0,
        ),
      ),
      home: const MainScreen(),
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
