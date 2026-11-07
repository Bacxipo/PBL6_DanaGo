import 'package:flutter/material.dart';
import 'package:smarttrip/services/google_auth_service.dart';
import 'package:smarttrip/screens/register_screen.dart';
import 'package:smarttrip/screens/forgot_password_screen.dart';
import 'package:smarttrip/screens/main_screen.dart';
import 'package:smarttrip/theme/app_colors.dart';
import 'package:smarttrip/theme/app_styles.dart';
import 'package:smarttrip/utils/ui_helpers.dart';
import 'package:smarttrip/utils/validators.dart';
import 'package:smarttrip/widgets/common/custom_text_field.dart';
import 'package:smarttrip/screens/interest_screen.dart';
class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  bool _isObscure = true; //hide mk

  final _googleAuth = GoogleAuthService.instance;
  bool _googleNavigationScheduled = false;
  String? _lastGoogleError;

  @override
  void initState() {
    super.initState();
    _googleAuth.addListener(_onGoogleAuthChanged);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) _onGoogleAuthChanged();
    });
  }

  void _onGoogleAuthChanged() {
    if (!mounted) return;
    setState(() {});
    final error = _googleAuth.errorMessage;
    if (_googleAuth.status == GoogleLoginStatus.failed &&
        error != null && error != _lastGoogleError) {
      _lastGoogleError = error;
      UiHelpers.showError(context, error);
    } else if (_googleAuth.status != GoogleLoginStatus.failed) {
      _lastGoogleError = null;
    }
    if (_googleAuth.status == GoogleLoginStatus.authenticated &&
        !_googleNavigationScheduled) {
      _googleNavigationScheduled = true;
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (!mounted) return;
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (_) => const InterestScreen()),
        );
      });
    }
  }

  Future<void> _handleGoogleLogin() {
    _lastGoogleError = null;
    return _googleAuth.signIn();
  }

  @override
  void dispose() {
    _googleAuth.removeListener(_onGoogleAuthChanged);
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  void _handleLogin() {
    final String email = _emailController.text.trim();
    final String password = _passwordController.text;

    if (email.isEmpty || password.isEmpty) {
      UiHelpers.showError(context, "Vui lòng nhập đầy đủ Email và Mật khẩu!");
      return;
    }
    if (!Validators.isValidEmail(email)) {
      UiHelpers.showError(context, "Địa chỉ Email không đúng định dạng!");
      return;
    }
    UiHelpers.showSuccess(context, 'Đăng nhập thành công!');
    Navigator.pushReplacement(
      context,
      MaterialPageRoute(builder: (context) => const MainScreen()),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color.fromARGB(255, 201, 232, 238),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              const SizedBox(height: 20),
              // 1. logo
              Container(
                width: 120,
                height: 120,
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.06),
                      blurRadius: 16,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: Image.asset(
                  'assets/images/Logo.png',
                  fit: BoxFit.contain,
                ),
              ),
              const SizedBox(height: 24),
              const Text('Xin chào!', style: AppTextStyles.titleBold),
              const SizedBox(height: 8),
              const Text(
                'Đăng nhập để tiếp tục hành trình khám phá Đà Nẵng',
                textAlign: TextAlign.center,
                style: AppTextStyles.titlebody,
              ),
              const SizedBox(height: 15),
              // 2. Email & MK
              const Align(
                alignment: Alignment.centerLeft,
                child: Text(
                  'Email',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: Colors.black,
                  ),
                ),
              ),
              const SizedBox(height: 8),
              CustomTextField(
                controller: _emailController,
                hintText: 'Nhập địa chỉ email',
                prefixIcon: Icons.mail_outline,
                keyboardType: TextInputType.emailAddress,
              ),
              const SizedBox(height: 8),
              const Align(
                alignment: Alignment.centerLeft,
                child: Text(
                  'Mật khẩu',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: Colors.black,
                  ),
                ),
              ),
              const SizedBox(height: 8),
              CustomTextField(
                controller: _passwordController,
                hintText: 'Nhập mật khẩu',
                prefixIcon: Icons.lock_outline,
                obscureText: _isObscure,
                suffixIcon: IconButton(
                  onPressed: () {
                    setState(() {
                      _isObscure = !_isObscure;
                    });
                  },
                  icon: Icon(
                    _isObscure
                        ? Icons.visibility_off_outlined
                        : Icons.visibility_outlined,
                    color: AppColors.textHint,
                  ),
                ),
              ),
              const SizedBox(height: 12),
              Align(
                alignment: Alignment.centerRight,
                child: GestureDetector(
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => const ForgotPasswordScreen(),
                      ),
                    );
                  },
                  child: const Text(
                    'Quên mật khẩu?',
                    style: TextStyle(
                      color: AppColors.primary,
                      fontWeight: FontWeight.w600,
                      fontSize: 13,
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 15),
              //3 Nut dang nhap
              Container(
                width: double.infinity,
                height: 52,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.primary.withValues(alpha: 0.3),
                      blurRadius: 12,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    elevation: 0,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                    ),
                  ),
                  onPressed: _handleLogin,
                  child: const Text(
                    'Đăng nhập',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 18,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  Expanded(
                    child: Divider(color: AppColors.divider, thickness: 1),
                  ),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: Text(
                      'Hoặc',
                      style: TextStyle(
                        color: AppColors.textHint,
                        fontSize: 13,
                        fontWeight: FontWeight.w400,
                      ),
                    ),
                  ),
                  Expanded(
                    child: Divider(color: AppColors.divider, thickness: 1),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                height: 52,
                child: OutlinedButton(
                  style: OutlinedButton.styleFrom(
                    backgroundColor: Colors.white,
                    side: const BorderSide(color: AppColors.border),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                    ),
                  ),
                  onPressed: _googleAuth.isBusy ? null : _handleGoogleLogin,
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Image.network(
                        'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/60px-Google_%22G%22_logo.svg.png?utm_source=vi.wikipedia.org&utm_campaign=index&utm_content=thumbnail',
                        height: 22,
                        width: 22,
                      ),
                      const SizedBox(width: 12),
                      Text(
                        _googleAuth.isBusy
                            ? 'Đang đăng nhập…'
                            : 'Đăng nhập bằng Google',
                        style: const TextStyle(
                          color: AppColors.textPrimary,
                          fontSize: 18,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              // 4. Dang kys
              const SizedBox(height: 12),
              Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  Text(
                    'Chưa có tài Khoản?',
                    style: TextStyle(color: Colors.black, fontSize: 13),
                  ),
                  const SizedBox(width: 8),
                  Align(
                    alignment: Alignment.centerRight,
                    child: GestureDetector(
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => const RegisterScreen(),
                          ),
                        );
                      },
                      child: const Text(
                        'Đăng ký',
                        style: TextStyle(
                          color: AppColors.primary,
                          fontWeight: FontWeight.bold,
                          fontSize: 13,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
              //5. Guess
              const SizedBox(height: 15),
              GestureDetector(
                onTap: () {
                  Navigator.pushReplacement(
                    context,
                    MaterialPageRoute(builder: (context) => const MainScreen()),
                  );
                },
                child: const Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      'Đăng nhập với tư cách khách',
                      style: TextStyle(
                        color: AppColors.primary,
                        fontSize: 15,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    SizedBox(width: 6),
                    Icon(
                      Icons.arrow_forward,
                      color: AppColors.primary,
                      size: 18,
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),
            ],
          ),
        ),
      ),
    );
  }
}
