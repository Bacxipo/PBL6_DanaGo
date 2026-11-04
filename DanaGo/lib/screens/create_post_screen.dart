import 'package:flutter/material.dart';
import 'package:smarttrip/models/feed_post_model.dart';
import 'package:smarttrip/theme/app_colors.dart';
import 'package:smarttrip/widgets/feed/feed_create_experience_view.dart';
import 'package:smarttrip/widgets/feed/feed_create_place_view.dart';
import 'package:smarttrip/widgets/feed/feed_create_question_view.dart';
import 'package:smarttrip/widgets/feed/feed_create_tab_bar.dart';

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

  void _submitPost() {
    FeedPostModel? newPost;

    if (_currentTabIndex == 0) {
      final content = _expContentController.text.trim();
      if (content.isEmpty) {
        _showErrorSnackBar('Vui lòng nhập nội dung chia sẻ trải nghiệm!');
        return;
      }
      newPost = FeedPostModel(
        id: 'post_${DateTime.now().millisecondsSinceEpoch}',
        type: PostType.experience,
        authorName: 'Bạn (Người dùng)',
        authorAvatar: FeedPostModel.userDefaultAvatar,
        timeAgo: 'Vừa xong',
        isVerified: true,
        locationName: 'Đà Nẵng',
        title: _expTitleController.text.trim().isEmpty
            ? null
            : _expTitleController.text.trim(),
        content: content,
        rating: _expRating,
        images: const [
          PostImageItem(
            imageUrl:
                'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
            caption: 'Ảnh chuyến đi',
          ),
        ],
      );
    } else if (_currentTabIndex == 1) {
      final title = _qTitleController.text.trim();
      final content = _qContentController.text.trim();
      if (title.isEmpty) {
        _showErrorSnackBar('Vui lòng nhập tiêu đề câu hỏi thắc mắc!');
        return;
      }
      newPost = FeedPostModel(
        id: 'post_${DateTime.now().millisecondsSinceEpoch}',
        type: PostType.question,
        authorName: 'Bạn (Người dùng)',
        authorAvatar: FeedPostModel.userDefaultAvatar,
        timeAgo: 'Vừa xong',
        categoryTag: _qCategory,
        title: title,
        content: content.isEmpty ? title : content,
        images: const [],
      );
    } else {
      final name = _placeNameController.text.trim();
      final desc = _placeDescController.text.trim();
      if (name.isEmpty) {
        _showErrorSnackBar('Vui lòng nhập tên địa điểm mới!');
        return;
      }
      newPost = FeedPostModel(
        id: 'post_${DateTime.now().millisecondsSinceEpoch}',
        type: PostType.newPlace,
        authorName: 'Bạn (Người dùng)',
        authorAvatar: FeedPostModel.userDefaultAvatar,
        timeAgo: 'Vừa xong',
        locationName: 'Quận Hải Châu, Đà Nẵng',
        title: name,
        content:
            desc.isEmpty ? 'Gợi ý địa điểm mới cực hot tại Đà Nẵng: $name' : desc,
        images: const [
          PostImageItem(
            imageUrl:
                'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80',
            caption: 'Mặt tiền quán',
          ),
        ],
      );
    }

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: const Text(
          'Đăng bài viết thành công!',
          style: TextStyle(fontFamily: 'Be Vietnam Pro', fontSize: 13),
        ),
        backgroundColor: AppColors.primary,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        duration: const Duration(seconds: 2),
      ),
    );

    Navigator.pop(context, newPost);
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
          onAddImage: () {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text('Đã chọn 2 ảnh du lịch chất lượng cao'),
                duration: Duration(seconds: 1),
              ),
            );
          },
        );
      case 1:
        return FeedCreateQuestionView(
          key: const ValueKey('tab_question'),
          titleController: _qTitleController,
          contentController: _qContentController,
          onCategorySelected: (cat) => _qCategory = cat,
        );
      case 2:
        return FeedCreatePlaceView(
          key: const ValueKey('tab_place'),
          nameController: _placeNameController,
          descController: _placeDescController,
        );
      default:
        return const SizedBox.shrink();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bgPrimary,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        centerTitle: true,
        leading: TextButton(
          onPressed: () => Navigator.pop(context),
          child: const Text(
            'Hủy',
            style: TextStyle(
              fontFamily: 'Be Vietnam Pro',
              fontSize: 14,
              color: AppColors.neutral,
            ),
          ),
        ),
        title: const Text(
          'Tạo bài viết',
          style: TextStyle(
            fontFamily: 'Be Vietnam Pro',
            fontSize: 16,
            fontWeight: FontWeight.w700,
            color: AppColors.textPrimary,
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
            Expanded(
              child: _buildCurrentTab(),
            ),
          ],
        ),
      ),
    );
  }
}
