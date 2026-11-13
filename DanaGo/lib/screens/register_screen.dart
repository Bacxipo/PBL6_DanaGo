import 'package:flutter/material.dart';
import 'package:smarttrip/screens/interest_screen.dart';
import 'package:smarttrip/theme/app_colors.dart';
import 'package:smarttrip/utils/ui_helpers.dart';
import 'package:smarttrip/utils/validators.dart';
import 'package:smarttrip/widgets/common/custom_text_field.dart';
import 'package:smarttrip/services/auth_service.dart';
import 'package:smarttrip/services/api_client.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _SignupScreenState();
}

class _SignupScreenState extends State<RegisterScreen> {
  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  final TextEditingController _confirmPassController = TextEditingController();

  bool _isObscurePassword = true;
  bool _isObscureConfirmPass = true;
  bool _isAgree = false;
  bool _isLoading = false;
  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _confirmPassController.dispose();
    super.dispose();
  }

  Future<void> _handleRegister() async {
    final String? errorMessage = Validators.validateRegisterForm(
      name: _nameController.text,
      email: _emailController.text,
      password: _passwordController.text,
      confirmPassword: _confirmPassController.text,
      isAgree: _isAgree,
    );
    if (errorMessage != null) {
      UiHelpers.showError(context, errorMessage);
      return;
    }
    setState(() => _isLoading = true);
    try {
      final email = _emailController.text.trim();
      String username = email
          .split('@')[0]
          .replaceAll(RegExp(r'[^a-zA-Z0-9]'), '');
      if (username.isEmpty) {
        username = 'user_${DateTime.now().millisecondsSinceEpoch % 100000}';
      }
      await AuthService.instance.register(
        fullName: _nameController.text.trim(),
        username: username,
        email: email,
        password: _passwordController.text,
      );
      if (!mounted) return;
      UiHelpers.showSuccess(
        context,
        'Đăng ký tài khoản thành công cho. Hãy chọn sở thích của bạn.',
      );
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (context) => const InterestScreen()),
      );
    } on ApiException catch (e) {
      if (mounted) {
        UiHelpers.showError(context, e.message);
      }
    } catch (_) {
      if (mounted) {
        UiHelpers.showError(
          context,
          'Không thể kết nối đến máy chủ. Vui lòng thử lại!',
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.primaryLight,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: AppColors.primary),
          onPressed: () {
            Navigator.pop(context);
          },
        ),
        title: const Text(
          'DanaGo ',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: AppColors.primary,
          ),
        ),
        centerTitle: true,
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 10),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              const SizedBox(height: 12),
              Container(
                width: 80,
                height: 80,
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
              const SizedBox(height: 8),
              const Text(
                'Đăng ký tài khoản',
                style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              const Text(
                'Trở thành một phần của cộng đồng du lịch thông minh',
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 24),
              CustomTextField(
                controller: _nameController,
                hintText: 'Họ và Tên',
                prefixIcon: Icons.person,
                keyboardType: TextInputType.name,
              ),
              const SizedBox(height: 12),
              CustomTextField(
                controller: _emailController,
                hintText: 'Email',
                prefixIcon: Icons.email,
                keyboardType: TextInputType.emailAddress,
              ),
              const SizedBox(height: 12),
              CustomTextField(
                controller: _passwordController,
                hintText: 'Mật khẩu',
                prefixIcon: Icons.lock,
                obscureText: _isObscurePassword,
                suffixIcon: IconButton(
                  onPressed: () {
                    setState(() {
                      _isObscurePassword = !_isObscurePassword;
                    });
                  },
                  icon: Icon(
                    _isObscurePassword
                        ? Icons.visibility_off_outlined
                        : Icons.visibility_outlined,
                    color: AppColors.textHint,
                  ),
                ),
              ),
              const SizedBox(height: 12),
              CustomTextField(
                controller: _confirmPassController,
                hintText: 'Xác nhận mật khẩu',
                prefixIcon: Icons.lock,
                obscureText: _isObscureConfirmPass,
                suffixIcon: IconButton(
                  onPressed: () {
                    setState(() {
                      _isObscureConfirmPass = !_isObscureConfirmPass;
                    });
                  },
                  icon: Icon(
                    _isObscureConfirmPass
                        ? Icons.visibility_off_outlined
                        : Icons.visibility_outlined,
                    color: AppColors.textHint,
                  ),
                ),
              ),
              const SizedBox(height: 16),
              Row(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  SizedBox(
                    width: 24,
                    height: 24,
                    child: Checkbox(
                      value: _isAgree,
                      activeColor: AppColors.primary,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(4),
                      ),
                      onChanged: (value) {
                        setState(() {
                          _isAgree = value ?? false;
                        });
                      },
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text.rich(
                      TextSpan(
                        text: 'Tôi đồng ý với các ',
                        style: const TextStyle(
                          color: Colors.black,
                          fontSize: 13,
                        ),
                        children: [
                          TextSpan(
                            text: 'Điều khoản',
                            style: const TextStyle(
                              color: AppColors.primary,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const TextSpan(text: ' & '),
                          TextSpan(
                            text: 'Chính sách',
                            style: const TextStyle(
                              color: AppColors.primary,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const TextSpan(
                            text: ' của ứng dụng. ',
                            style: TextStyle(color: Colors.black),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 24),
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
                  onPressed: _isLoading ? null : _handleRegister,
                  child: _isLoading
                      ? const SizedBox(
                          width: 24,
                          height: 24,
                          child: CircularProgressIndicator(
                            strokeWidth: 2.5,
                            color: Colors.white,
                          ),
                        )
                      : const Text(
                          'Đăng ký',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                ),
              ),
              const SizedBox(height: 24),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Text(
                    'Đã có tài khoản?',
                    style: TextStyle(
                      color: AppColors.textTertiary,
                      fontSize: 14,
                    ),
                  ),
                  GestureDetector(
                    onTap: () {
                      Navigator.pop(context);
                    },
                    child: const Text(
                      'Đăng nhập',
                      style: TextStyle(
                        color: AppColors.primary,
                        fontWeight: FontWeight.bold,
                        fontSize: 14,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 20),
            ],
          ),
        ),
      ),
    );
  }
}
