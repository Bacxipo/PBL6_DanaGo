import 'package:flutter/material.dart';
import 'package:smarttrip/theme/app_colors.dart';
import 'package:smarttrip/widgets/feed/feed_create_experience_view.dart';
import 'package:smarttrip/widgets/feed/feed_create_place_view.dart';
import 'package:smarttrip/widgets/feed/feed_create_question_view.dart';
import 'package:smarttrip/widgets/feed/feed_create_tab_bar.dart';
import 'package:smarttrip/services/feed_service.dart';
import 'package:image_picker/image_picker.dart';

class CreatePostScreen extends StatefulWidget {
  const CreatePostScreen({super.key});

  @override
  State<CreatePostScreen> createState() => _CreatePostScreenState();
}

class _CreatePostScreenState extends State<CreatePostScreen> {
  int _currentTabIndex = 0;

  // Controllers for Tab 0: Trải nghiệm
  final TextEditingController _expTitleController = TextEditingController();
  final TextEditingController _expContentController = TextEditingController();
  double _expRating = 5.0;
  int? _selectedDestinationId;
  List<String> _selectedImagePaths = [];
  Map<String, dynamic> _placeData = {};
  bool _isPickerActive = false;

  Future<void> _pickImages() async {
    if (_isPickerActive) return;
    _isPickerActive = true;
    try {
      final picker = ImagePicker();
      final images = await picker.pickMultiImage(
        maxWidth: 1920,
        maxHeight: 1920,
        imageQuality: 75,
      );
      if (images.isNotEmpty && mounted) {
        setState(() {
          for (final img in images) {
            if (_selectedImagePaths.length < 5 &&
                !_selectedImagePaths.contains(img.path)) {
              _selectedImagePaths.add(img.path);
            }
          }
        });
      }
    } catch (_) {
      // Bỏ qua lỗi already_active hoặc huỷ chọn
    } finally {
      _isPickerActive = false;
    }
  }

  // Controllers for Tab 1: Hỏi đáp
  final TextEditingController _qTitleController = TextEditingController();
  final TextEditingController _qContentController = TextEditingController();
  String _qCategory = '🍽️ Ăn uống & Quán ngon';

  // Controllers for Tab 2: Địa điểm mới
  final TextEditingController _placeNameController = TextEditingController();
  final TextEditingController _placeDescController = TextEditingController();

  @override
  void dispose() {
    _expTitleController.dispose();
    _expContentController.dispose();
    _qTitleController.dispose();
    _qContentController.dispose();
    _placeNameController.dispose();
    _placeDescController.dispose();
    super.dispose();
  }

  void _clearTabData(int tabIndex) {
    switch (tabIndex) {
      case 0:
        _expTitleController.clear();
        _expContentController.clear();
        _expRating = 5.0;
        _selectedDestinationId = null;
        _selectedImagePaths.clear();
        break;
      case 1:
        _qTitleController.clear();
        _qContentController.clear();
        _qCategory = '🍽️ Ăn uống & Quán ngon';
        break;
      case 2:
        _placeNameController.clear();
        _placeDescController.clear();
        break;
    }
  }

  void _handleTabChanged(int newIndex) {
    if (_currentTabIndex == newIndex) return;
    // Xóa toàn bộ dữ liệu ở tab hiện tại trước khi chuyển sang tab mới
    _clearTabData(_currentTabIndex);
    setState(() {
      _currentTabIndex = newIndex;
    });
  }

  void _submitPost() async {
    String content = '';
    if (_currentTabIndex == 0) {
      content = _expContentController.text.trim();
      if (content.isEmpty) {
        _showErrorSnackBar('Vui lòng nhập nội dung chia sẻ trải nghiệm!');
        return;
      }
    } else if (_currentTabIndex == 1) {
      final title = _qTitleController.text.trim();
      final body = _qContentController.text.trim();
      if (title.isEmpty) {
        _showErrorSnackBar('Vui lòng nhập tiêu đề câu hỏi thắc mắc!');
        return;
      }
      final header = '❓ [Hỏi đáp] $_qCategory';
      content = body.isEmpty ? '$header\n$title' : '$header\n$title\n\n$body';
    } else {
      final name = _placeNameController.text.trim();
      final desc = _placeDescController.text.trim();
      if (name.isEmpty) {
        _showErrorSnackBar('Vui lòng nhập tên địa điểm mới!');
        return;
      }
      if (_selectedImagePaths.isEmpty) {
        _showErrorSnackBar(
          'Địa điểm mới bắt buộc phải có ít nhất 1 ảnh thực tế!',
        );
        return;
      }
      content = desc.isEmpty ? 'Đề xuất địa điểm mới: $name' : '$name - $desc';
      final proposal = {
        'name': name,
        'district': _placeData['district'] ?? 'Quận Hải Châu',
        'description': desc,
        'ticketPrice': _placeData['ticketPrice'] ?? 'Miễn phí',
        'openHours': _placeData['openHours'] ?? '07:00 - 22:30',
      };
      final created = await FeedService.instance.createPost(
        content: content,
        postType: 'NEW_DESTINATION',
        proposal: proposal,
        imagePaths: _selectedImagePaths,
      );
      if (!mounted) return;
      if (created != null) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Text('Đã gửi đề xuất địa điểm (chờ Admin duyệt)!'),
            backgroundColor: AppColors.primary,
          ),
        );
        Navigator.pop(context, created);
      } else {
        _showErrorSnackBar('Không thể gửi đề xuất địa điểm, vui lòng thử lại!');
      }
      return;
    }
    final created = await FeedService.instance.createPost(
      content: content,
      destinationId: _selectedDestinationId,
      imagePaths: _selectedImagePaths,
    );
    if (!mounted) return;
    if (created != null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Text('Đã gửi bài viết (chờ Admin duyệt)!'),
          backgroundColor: AppColors.primary,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(10),
          ),
        ),
      );
      Navigator.pop(context, created);
    } else {
      _showErrorSnackBar('Không thể đăng bài viết, vui lòng thử lại!');
    }
  }

  void _showErrorSnackBar(String msg) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          msg,
          style: const TextStyle(fontFamily: 'Be Vietnam Pro', fontSize: 13),
        ),
        backgroundColor: AppColors.error,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      ),
    );
  }

  Widget _buildCurrentTab() {
    switch (_currentTabIndex) {
      case 0:
        return FeedCreateExperienceView(
          key: const ValueKey('tab_experience'),
          titleController: _expTitleController,
          contentController: _expContentController,
          onRatingChanged: (r) => _expRating = r,
          onDestinationSelected: (id) => _selectedDestinationId = id,
          selectedImages: _selectedImagePaths,
          onAddImage: _pickImages,
          onRemoveImage: (index) =>
              setState(() => _selectedImagePaths.removeAt(index)),
        );
      case 1:
        return FeedCreateQuestionView(
          key: const ValueKey('tab_question'),
          titleController: _qTitleController,
          contentController: _qContentController,
          onCategorySelected: (cat) => _qCategory = cat,
          selectedImages: _selectedImagePaths,
          onAddImage: _pickImages,
          onRemoveImage: (index) =>
              setState(() => _selectedImagePaths.removeAt(index)),
        );
      case 2:
        return FeedCreatePlaceView(
          key: const ValueKey('tab_place'),
          nameController: _placeNameController,
          descController: _placeDescController,
          onDataChanged: (data) => _placeData = data,
          selectedImages: _selectedImagePaths,
          onAddImage: _pickImages,
          onRemoveImage: (index) =>
              setState(() => _selectedImagePaths.removeAt(index)),
        );
      default:
        return const SizedBox.shrink();
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      appBar: AppBar(
        backgroundColor: Theme.of(context).cardColor,
        elevation: 0,
        centerTitle: true,
        leading: TextButton(
          onPressed: () => Navigator.pop(context),
          child: Text(
            'Hủy',
            style: TextStyle(
              fontFamily: 'Be Vietnam Pro',
              fontSize: 14,
              color: isDark ? Colors.grey.shade400 : AppColors.neutral,
            ),
          ),
        ),
        title: Text(
          'Tạo bài viết',
          style: TextStyle(
            fontFamily: 'Be Vietnam Pro',
            fontSize: 16,
            fontWeight: FontWeight.w700,
            color: isDark ? Colors.white : AppColors.textPrimary,
          ),
        ),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 12, top: 10, bottom: 10),
            child: ElevatedButton(
              onPressed: _submitPost,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                foregroundColor: Colors.white,
                elevation: 0,
                padding: const EdgeInsets.symmetric(horizontal: 16),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(20),
                ),
              ),
              child: const Text(
                'Đăng bài',
                style: TextStyle(
                  fontFamily: 'Be Vietnam Pro',
                  fontSize: 13,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ),
          ),
        ],
      ),
      body: SafeArea(
        child: Column(
          children: [
            // Segmented 3-mode Tab Bar
            FeedCreateTabBar(
              selectedIndex: _currentTabIndex,
              onTabSelected: _handleTabChanged,
            ),

            // Tab Content Body (Only builds active tab)
            Expanded(child: _buildCurrentTab()),
          ],
        ),
      ),
    );
  }
}
