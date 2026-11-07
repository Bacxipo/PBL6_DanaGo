import 'package:flutter/material.dart';
import 'package:smarttrip/theme/app_colors.dart';

class EditProfileScreen extends StatefulWidget {
  final Map<String, dynamic> userData;
  const EditProfileScreen({super.key, required this.userData});

  @override
  State<EditProfileScreen> createState() => _EditProfileScreenState();
}

class _EditProfileScreenState extends State<EditProfileScreen> {
  late TextEditingController _nameController;
  late TextEditingController _emailController;
  late TextEditingController _phoneController;
  late TextEditingController _bioController;
  String _selectedGender = 'Nam';
  DateTime? _birthDate;
  bool _hasChanges = false;

  @override
  void initState() {
    super.initState();
    _nameController = TextEditingController(text: widget.userData['name'] ?? '');
    _emailController = TextEditingController(text: widget.userData['email'] ?? '');
    _phoneController = TextEditingController(text: widget.userData['phone'] ?? '');
    _bioController = TextEditingController(text: widget.userData['bio'] ?? '');

    // Listen for changes
    for (var c in [_nameController, _emailController, _phoneController, _bioController]) {
      c.addListener(() => setState(() => _hasChanges = true));
    }
  }

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _bioController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      appBar: _buildAppBar(),
      body: SingleChildScrollView(
        physics: const BouncingScrollPhysics(),
        padding: const EdgeInsets.symmetric(horizontal: 20),
        child: Column(
          children: [
            const SizedBox(height: 24),

            // ─── Avatar Section ───────────────────────────────────
            _buildAvatarSection(),
            const SizedBox(height: 32),

            // ─── Form Fields ──────────────────────────────────────
            _buildSectionTitle('Thông tin cá nhân'),
            const SizedBox(height: 12),
            _buildTextField(
              controller: _nameController,
              label: 'Họ và tên',
              icon: Icons.person_outline_rounded,
              hint: 'Nhập họ và tên',
            ),
            const SizedBox(height: 16),
            _buildTextField(
              controller: _bioController,
              label: 'Giới thiệu bản thân',
              icon: Icons.edit_note_rounded,
              hint: 'Viết vài dòng về bản thân...',
              maxLines: 3,
            ),
            const SizedBox(height: 16),

            // Gender selector
            _buildGenderSelector(),
            const SizedBox(height: 16),

            // Birth date
            _buildDatePicker(),
            const SizedBox(height: 28),

            // ─── Contact Info ─────────────────────────────────────
            _buildSectionTitle('Thông tin liên hệ'),
            const SizedBox(height: 12),
            _buildTextField(
              controller: _emailController,
              label: 'Email',
              icon: Icons.email_outlined,
              hint: 'example@gmail.com',
              keyboardType: TextInputType.emailAddress,
            ),
            const SizedBox(height: 16),
            _buildTextField(
              controller: _phoneController,
              label: 'Số điện thoại',
              icon: Icons.phone_outlined,
              hint: '0901 234 567',
              keyboardType: TextInputType.phone,
            ),
            const SizedBox(height: 28),

            // ─── Travel Preferences ───────────────────────────────
            _buildSectionTitle('Sở thích du lịch'),
            const SizedBox(height: 12),
            _buildTravelPreferences(),
            const SizedBox(height: 32),

            // ─── Save Button ──────────────────────────────────────
            _buildSaveButton(),
            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }

  PreferredSizeWidget _buildAppBar() {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return AppBar(
      backgroundColor: Colors.transparent,
      elevation: 0,
      leading: IconButton(
        onPressed: () => _onBackPressed(),
        icon: Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: Theme.of(context).cardColor,
            borderRadius: BorderRadius.circular(12),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: isDark ? 0.2 : 0.05),
                blurRadius: 8,
              ),
            ],
          ),
          child: Icon(
            Icons.arrow_back_ios_new_rounded,
            size: 16,
            color: isDark ? Colors.white : AppColors.textPrimary,
          ),
        ),
      ),
      title: Text(
        'Chỉnh sửa hồ sơ',
        style: TextStyle(
          fontSize: 18,
          fontWeight: FontWeight.bold,
          color: isDark ? Colors.white : AppColors.textPrimary,
        ),
      ),
      centerTitle: true,
    );
  }

  Widget _buildAvatarSection() {
    return Center(
      child: Stack(
        children: [
          Container(
            width: 110,
            height: 110,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [
                  AppColors.primary.withValues(alpha: 0.1),
                  AppColors.primaryLight,
                ],
              ),
              border: Border.all(color: AppColors.primary.withValues(alpha: 0.2), width: 3),
              boxShadow: [
                BoxShadow(
                  color: AppColors.primary.withValues(alpha: 0.15),
                  blurRadius: 20,
                  offset: const Offset(0, 8),
                ),
              ],
            ),
            child: const Icon(Icons.person_rounded, size: 55, color: AppColors.primary),
          ),
          Positioned(
            bottom: 4,
            right: 4,
            child: GestureDetector(
              onTap: () => _showAvatarOptions(),
              child: Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: AppColors.accent,
                  shape: BoxShape.circle,
                  border: Border.all(color: Colors.white, width: 3),
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.accent.withValues(alpha: 0.3),
                      blurRadius: 8,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: const Icon(Icons.camera_alt_rounded, size: 16, color: Colors.white),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Align(
      alignment: Alignment.centerLeft,
      child: Text(
        title,
        style: TextStyle(
          fontSize: 16,
          fontWeight: FontWeight.w700,
          color: isDark ? Colors.white : AppColors.textPrimary,
        ),
      ),
    );
  }

  Widget _buildTextField({
    required TextEditingController controller,
    required String label,
    required IconData icon,
    required String hint,
    int maxLines = 1,
    TextInputType? keyboardType,
  }) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Container(
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: isDark ? 0.2 : 0.04),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: TextField(
        controller: controller,
        maxLines: maxLines,
        keyboardType: keyboardType,
        style: TextStyle(
          fontSize: 15,
          color: isDark ? Colors.white : AppColors.textPrimary,
          fontWeight: FontWeight.w500,
        ),
        decoration: InputDecoration(
          labelText: label,
          labelStyle: const TextStyle(
            fontSize: 13,
            color: AppColors.textTertiary,
            fontWeight: FontWeight.w500,
          ),
          hintText: hint,
          hintStyle: const TextStyle(
            fontSize: 14,
            color: AppColors.textHint,
          ),
          prefixIcon: Container(
            margin: const EdgeInsets.all(12),
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: AppColors.primary.withValues(alpha: 0.08),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, size: 18, color: AppColors.primary),
          ),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(16),
            borderSide: BorderSide.none,
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(16),
            borderSide: BorderSide.none,
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(16),
            borderSide: const BorderSide(color: AppColors.primary, width: 1.5),
          ),
          filled: true,
          fillColor: Theme.of(context).cardColor,
          contentPadding: const EdgeInsets.symmetric(vertical: 16, horizontal: 16),
        ),
      ),
    );
  }

  Widget _buildGenderSelector() {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final genders = ['Nam', 'Nữ', 'Khác'];
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: isDark ? 0.2 : 0.04),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: AppColors.primary.withValues(alpha: 0.08),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(Icons.wc_rounded, size: 18, color: AppColors.primary),
              ),
              const SizedBox(width: 12),
              const Text(
                'Giới tính',
                style: TextStyle(
                  fontSize: 13,
                  color: AppColors.textTertiary,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: genders.map((gender) {
              final isSelected = _selectedGender == gender;
              return Expanded(
                child: GestureDetector(
                  onTap: () => setState(() {
                    _selectedGender = gender;
                    _hasChanges = true;
                  }),
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 200),
                    margin: EdgeInsets.only(right: gender != genders.last ? 10 : 0),
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    decoration: BoxDecoration(
                      color: isSelected
                          ? AppColors.primary
                          : (isDark ? const Color(0xFF0F172A) : AppColors.bgPrimary),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: isSelected
                            ? AppColors.primary
                            : (isDark ? Colors.white12 : AppColors.border),
                      ),
                    ),
                    child: Text(
                      gender,
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
                        color: isSelected
                            ? Colors.white
                            : (isDark ? Colors.grey.shade300 : AppColors.textSecondary),
                      ),
                    ),
                  ),
                ),
              );
            }).toList(),
          ),
        ],
      ),
    );
  }

  Widget _buildDatePicker() {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return GestureDetector(
      onTap: () async {
        final picked = await showDatePicker(
          context: context,
          initialDate: _birthDate ?? DateTime(2000, 1, 1),
          firstDate: DateTime(1950),
          lastDate: DateTime.now(),
          builder: (context, child) {
            return Theme(
              data: Theme.of(context).copyWith(
                colorScheme: isDark
                    ? const ColorScheme.dark(
                        primary: AppColors.primary,
                        onPrimary: Colors.white,
                        surface: Color(0xFF1E293B),
                        onSurface: Colors.white,
                      )
                    : const ColorScheme.light(
                        primary: AppColors.primary,
                        onPrimary: Colors.white,
                        surface: Colors.white,
                      ),
              ),
              child: child!,
            );
          },
        );
        if (picked != null) {
          setState(() {
            _birthDate = picked;
            _hasChanges = true;
          });
        }
      },
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Theme.of(context).cardColor,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: isDark ? 0.2 : 0.04),
              blurRadius: 10,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: AppColors.primary.withValues(alpha: 0.08),
                borderRadius: BorderRadius.circular(10),
              ),
              child: const Icon(Icons.cake_outlined, size: 18, color: AppColors.primary),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Ngày sinh',
                    style: TextStyle(
                      fontSize: 13,
                      color: AppColors.textTertiary,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    _birthDate != null
                        ? '${_birthDate!.day}/${_birthDate!.month}/${_birthDate!.year}'
                        : 'Chọn ngày sinh',
                    style: TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w500,
                      color: _birthDate != null
                          ? (isDark ? Colors.white : AppColors.textPrimary)
                          : AppColors.textHint,
                    ),
                  ),
                ],
              ),
            ),
            const Icon(Icons.chevron_right_rounded, color: AppColors.textHint),
          ],
        ),
      ),
    );
  }

  Widget _buildTravelPreferences() {
    final preferences = [
      {'label': 'Biển', 'icon': Icons.beach_access_rounded, 'selected': true},
      {'label': 'Núi & Rừng', 'icon': Icons.landscape_rounded, 'selected': false},
      {'label': 'Ẩm thực', 'icon': Icons.restaurant_rounded, 'selected': true},
      {'label': 'Văn hóa', 'icon': Icons.account_balance_rounded, 'selected': true},
      {'label': 'Mua sắm', 'icon': Icons.shopping_bag_rounded, 'selected': false},
      {'label': 'Trekking', 'icon': Icons.hiking_rounded, 'selected': false},
      {'label': 'Cafe', 'icon': Icons.coffee_rounded, 'selected': true},
      {'label': 'Nightlife', 'icon': Icons.nightlife_rounded, 'selected': false},
    ];

    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Wrap(
      spacing: 10,
      runSpacing: 10,
      children: preferences.map((pref) {
        final isSelected = pref['selected'] as bool;
        return GestureDetector(
          onTap: () {
            setState(() {
              pref['selected'] = !(pref['selected'] as bool);
              _hasChanges = true;
            });
          },
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 200),
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
            decoration: BoxDecoration(
              color: isSelected
                  ? AppColors.primary.withValues(alpha: 0.1)
                  : Theme.of(context).cardColor,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(
                color: isSelected
                    ? AppColors.primary
                    : (isDark ? Colors.white12 : AppColors.border),
                width: isSelected ? 1.5 : 1,
              ),
              boxShadow: isSelected
                  ? [
                      BoxShadow(
                        color: AppColors.primary.withValues(alpha: 0.1),
                        blurRadius: 8,
                        offset: const Offset(0, 2),
                      ),
                    ]
                  : [],
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(
                  pref['icon'] as IconData,
                  size: 18,
                  color: isSelected ? AppColors.primary : AppColors.textTertiary,
                ),
                const SizedBox(width: 6),
                Text(
                  pref['label'] as String,
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
                    color: isSelected
                        ? AppColors.primary
                        : (isDark ? Colors.grey.shade300 : AppColors.textSecondary),
                  ),
                ),
                if (isSelected) ...[
                  const SizedBox(width: 4),
                  const Icon(Icons.check_circle_rounded, size: 14, color: AppColors.primary),
                ],
              ],
            ),
          ),
        );
      }).toList(),
    );
  }

  Widget _buildSaveButton() {
    return AnimatedOpacity(
      opacity: _hasChanges ? 1.0 : 0.5,
      duration: const Duration(milliseconds: 200),
      child: Container(
        width: double.infinity,
        height: 54,
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            colors: [AppColors.primary, AppColors.primaryDark],
          ),
          borderRadius: BorderRadius.circular(16),
          boxShadow: _hasChanges
              ? [
                  BoxShadow(
                    color: AppColors.primary.withValues(alpha: 0.35),
                    blurRadius: 16,
                    offset: const Offset(0, 6),
                  ),
                ]
              : [],
        ),
        child: Material(
          color: Colors.transparent,
          child: InkWell(
            onTap: _hasChanges ? _saveProfile : null,
            borderRadius: BorderRadius.circular(16),
            child: const Center(
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.check_circle_outline_rounded, color: Colors.white, size: 20),
                  SizedBox(width: 8),
                  Text(
                    'Lưu thay đổi',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w700,
                      color: Colors.white,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  void _saveProfile() {
    final result = {
      'name': _nameController.text,
      'email': _emailController.text,
      'phone': _phoneController.text,
      'bio': _bioController.text,
    };

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: const Row(
          children: [
            Icon(Icons.check_circle_rounded, color: Colors.white, size: 20),
            SizedBox(width: 8),
            Text('Đã lưu thay đổi thành công!'),
          ],
        ),
        backgroundColor: AppColors.success,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        margin: const EdgeInsets.all(16),
      ),
    );

    Navigator.pop(context, result);
  }

  void _onBackPressed() {
    if (_hasChanges) {
      showDialog(
        context: context,
        builder: (context) => AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          title: const Text('Hủy thay đổi?'),
          content: const Text('Bạn có thay đổi chưa lưu. Bạn có chắc muốn hủy không?'),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Tiếp tục chỉnh sửa', style: TextStyle(color: AppColors.primary)),
            ),
            ElevatedButton(
              onPressed: () {
                Navigator.pop(context);
                Navigator.pop(context);
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.error,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              child: const Text('Hủy'),
            ),
          ],
        ),
      );
    } else {
      Navigator.pop(context);
    }
  }

  void _showAvatarOptions() {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: Theme.of(context).cardColor,
          borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: isDark ? Colors.white24 : AppColors.border,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            const SizedBox(height: 20),
            Text(
              'Đổi ảnh đại diện',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: isDark ? Colors.white : AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: 20),
            _buildAvatarOption(
              icon: Icons.camera_alt_rounded,
              label: 'Chụp ảnh mới',
              onTap: () => Navigator.pop(context),
            ),
            _buildAvatarOption(
              icon: Icons.photo_library_rounded,
              label: 'Chọn từ thư viện',
              onTap: () => Navigator.pop(context),
            ),
            _buildAvatarOption(
              icon: Icons.delete_outline_rounded,
              label: 'Xóa ảnh hiện tại',
              color: AppColors.error,
              onTap: () => Navigator.pop(context),
            ),
            const SizedBox(height: 10),
          ],
        ),
      ),
    );
  }

  Widget _buildAvatarOption({
    required IconData icon,
    required String label,
    Color? color,
    required VoidCallback onTap,
  }) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return ListTile(
      onTap: onTap,
      leading: Container(
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(
          color: (color ?? AppColors.primary).withValues(alpha: 0.08),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Icon(icon, color: color ?? AppColors.primary, size: 22),
      ),
      title: Text(
        label,
        style: TextStyle(
          fontSize: 15,
          fontWeight: FontWeight.w500,
          color: color ?? (isDark ? Colors.white : AppColors.textPrimary),
        ),
      ),
      trailing: const Icon(Icons.chevron_right_rounded, color: AppColors.textHint),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
    );
  }
}
