import 'package:flutter/material.dart';
import 'package:smarttrip/screens/HOME/main_screen.dart';
import 'package:smarttrip/services/auth_service.dart';
import 'package:smarttrip/services/destination_service.dart';
import 'package:smarttrip/theme/app_colors.dart';
import 'package:smarttrip/utils/ui_helpers.dart';
import 'package:smarttrip/widgets/interest/interest_card.dart';

class InterestScreen extends StatefulWidget {
  const InterestScreen({super.key});
  @override
  State<InterestScreen> createState() => _InterestScreenState();
}

class _InterestScreenState extends State<InterestScreen> {
  List<Map<String, dynamic>> _categories = [];
  final Set<int> _selectedCategoryIds = {};
  bool _isLoading = true;
  bool _isSaving = false;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  IconData _getIconForCategory(String name) {
    final lower = name.toLowerCase();
    if (lower.contains('biển') || lower.contains('bãi')) {
      return Icons.beach_access_rounded;
    }
    if (lower.contains('ẩm thực') ||
        lower.contains('ăn') ||
        lower.contains('món')) {
      return Icons.restaurant_rounded;
    }
    if (lower.contains('di tích') ||
        lower.contains('lịch sử') ||
        lower.contains('bảo tàng') ||
        lower.contains('văn hóa')) {
      return Icons.account_balance_rounded;
    }
    if (lower.contains('giải trí') ||
        lower.contains('đêm') ||
        lower.contains('bar') ||
        lower.contains('pub')) {
      return Icons.nightlife_rounded;
    }
    if (lower.contains('núi') ||
        lower.contains('rừng') ||
        lower.contains('leo núi') ||
        lower.contains('trekking')) {
      return Icons.hiking_rounded;
    }
    if (lower.contains('cafe') || lower.contains('cà phê')) {
      return Icons.local_cafe_rounded;
    }
    if (lower.contains('mua sắm') || lower.contains('chợ')) {
      return Icons.shopping_bag_rounded;
    }
    if (lower.contains('sinh thái') ||
        lower.contains('thiên nhiên') ||
        lower.contains('công viên')) {
      return Icons.park_rounded;
    }
    return Icons.explore_rounded;
  }

  Future<void> _loadData() async {
    setState(() => _isLoading = true);
    try {
      final results = await Future.wait([
        DestinationService.instance.getCategories(),
        AuthService.instance.getPreferences(),
      ]);

      final categories = results[0] as List<Map<String, dynamic>>;
      final savedPrefs = results[1] as List<int>;

      if (mounted) {
        setState(() {
          _categories = categories;
          _selectedCategoryIds.addAll(savedPrefs);
          _isLoading = false;
        });
      }
    } catch (_) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _toggleInterest(int id) {
    if (_isSaving) return;
    setState(() {
      if (_selectedCategoryIds.contains(id)) {
        _selectedCategoryIds.remove(id);
      } else {
        _selectedCategoryIds.add(id);
      }
    });
  }

  Future<void> _handleComplete() async {
    if (_isSaving) return;
    if (_selectedCategoryIds.isEmpty) {
      UiHelpers.showError(context, "Vui lòng chọn ít nhất một sở thích");
      return;
    }

    setState(() => _isSaving = true);

    final success = await AuthService.instance.savePreferences(
      _selectedCategoryIds.toList(),
    );

    if (!mounted) return;
    setState(() => _isSaving = false);

    if (success) {
      UiHelpers.showSuccess(context, 'Đã lưu sở thích thành công!');
    }
    Navigator.pushAndRemoveUntil(
      context,
      MaterialPageRoute(builder: (context) => const MainScreen()),
      (route) => false,
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      body: SafeArea(
        child: _isLoading
            ? const Center(
                child: CircularProgressIndicator(color: AppColors.primary),
              )
            : SingleChildScrollView(
                padding: const EdgeInsets.symmetric(
                  horizontal: 24,
                  vertical: 20,
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    const SizedBox(height: 20),
                    Container(
                      width: 72,
                      height: 72,
                      decoration: BoxDecoration(
                        color: AppColors.primary.withValues(alpha: 0.12),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(
                        Icons.favorite_rounded,
                        color: AppColors.primary,
                        size: 36,
                      ),
                    ),
                    const SizedBox(height: 20),
                    const Text(
                      'Sở thích của bạn là gì?',
                      style: TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                        color: AppColors.primary,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Chọn các danh mục bạn quan tâm để chúng tôi gợi ý những địa điểm phù hợp nhất',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 14,
                        color: isDark
                            ? Colors.white70
                            : AppColors.textSecondary,
                        height: 1.4,
                      ),
                    ),
                    const SizedBox(height: 28),
                    if (_categories.isEmpty)
                      const Padding(
                        padding: EdgeInsets.symmetric(vertical: 40),
                        child: Text(
                          'Chưa tải được danh mục sở thích. Vui lòng thử lại sau.',
                          style: TextStyle(color: AppColors.textSecondary),
                        ),
                      )
                    else
                      Column(
                        children: _categories.map((item) {
                          final id = (item['id'] as num?)?.toInt() ?? 0;
                          final name = item['name'] as String? ?? '';
                          final isSelected = _selectedCategoryIds.contains(id);
                          return Padding(
                            padding: const EdgeInsets.only(bottom: 12),
                            child: InterestCard(
                              title: name,
                              icon: _getIconForCategory(name),
                              isSelected: isSelected,
                              onTap: () => _toggleInterest(id),
                            ),
                          );
                        }).toList(),
                      ),
                    const SizedBox(height: 20),
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
                        onPressed: _isSaving ? null : _handleComplete,
                        child: _isSaving
                            ? const SizedBox(
                                width: 24,
                                height: 24,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2.5,
                                  valueColor: AlwaysStoppedAnimation<Color>(
                                    Colors.white,
                                  ),
                                ),
                              )
                            : const Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Text(
                                    'Hoàn tất',
                                    style: TextStyle(
                                      color: Colors.white,
                                      fontSize: 16,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                  SizedBox(width: 8),
                                  Icon(
                                    Icons.arrow_forward,
                                    color: Colors.white,
                                    size: 20,
                                  ),
                                ],
                              ),
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
