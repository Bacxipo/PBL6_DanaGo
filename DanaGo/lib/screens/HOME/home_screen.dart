import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:smarttrip/models/destination_item.dart';
import 'package:smarttrip/models/event_item.dart';
import 'package:smarttrip/screens/detail_place_screen.dart';
import 'package:smarttrip/screens/HOME/event_detail_screen.dart';
import 'package:smarttrip/screens/HOME/events_screen.dart';
import 'package:smarttrip/screens/lodging_screen.dart';
import 'package:smarttrip/screens/PROFILE/user_profile_posts_screen.dart';
import 'package:smarttrip/services/auth_service.dart';
import 'package:smarttrip/services/destination_service.dart';
import 'package:smarttrip/services/event_service.dart';
import 'package:smarttrip/theme/app_colors.dart';
import 'package:smarttrip/widgets/common/danago_logo.dart';
import 'package:smarttrip/widgets/home/category_selector.dart';
import 'package:smarttrip/widgets/home/destination_tile.dart';
import 'package:smarttrip/widgets/home/event_card.dart';
import 'package:smarttrip/widgets/home/featured_card.dart';
import 'package:smarttrip/widgets/home/home_search_bar.dart';
import 'package:geolocator/geolocator.dart';

class HomeScreen extends StatefulWidget {
  final VoidCallback? onSearchTap;

  const HomeScreen({super.key, this.onSearchTap});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _selectCategoryIndex = 0;
  String? _avatarUrl;
  String _userName = 'Bạn';
  String? _customFilterTitle;
  List<Map<String, dynamic>> _categories = [
    {'id': 0, 'name': 'Tất cả'},
  ];

  final Map<String, int> _categoryIdMap = {
    'Biển': 1,
    'Ẩm thực': 2,
    'Di tích': 3,
    'Trekking': 4,
    'Cafe': 5,
  };
  List<DestinationItem> _featuredPlaces = [];
  List<EventItem> _upcomingEvents = [];
  List<DestinationItem> _recommendedPlaces = [];
  List<DestinationItem> _nearbyPlaces = [];
  List<DestinationItem> _categoryFilteredPlaces = [];

  bool _isLoading = true;
  bool _isCategoryLoading = false;

  @override
  void initState() {
    super.initState();
    AuthService.instance.addListener(_onAuthChanged);
    _loadAvatar();
    _loadHomeData();
  }

  @override
  void dispose() {
    AuthService.instance.removeListener(_onAuthChanged);
    super.dispose();
  }

  void _onAuthChanged() {
    _loadAvatar();
    _loadHomeData();
  }

  Future<void> _loadHomeData() async {
    setState(() => _isLoading = true);
    try {
      // Đợt 1: Gọi song song Profile, Categories, Featured, Events và GPS cache
      final batch1 = await Future.wait<dynamic>([
        AuthService.instance.getProfile(),
        DestinationService.instance.getCategories(),
        DestinationService.instance.getFeature(limit: 6),
        EventService.instance.getEvents(),
        () async {
          try {
            return await Geolocator.getLastKnownPosition();
          } catch (_) {
            return null;
          }
        }(),
      ]);

      final profile = batch1[0] as Map<String, dynamic>?;
      final categoriesFromDb = batch1[1] as List<Map<String, dynamic>>;
      final featured = batch1[2] as List<DestinationItem>;
      final allEvents = batch1[3] as List<EventItem>;
      final pos = batch1[4] as Position?;

      final int? currentUserId = (profile?['id'] as num?)?.toInt();
      final upcomingEvents =
          allEvents
              .where((e) => e.timelineStatus != EventTimelineStatus.ended)
              .toList()
            ..sort((a, b) => a.startDate.compareTo(b.startDate));

      // Đợt 2: Gọi song song Recommended & Nearby
      final batch2 = await Future.wait<List<DestinationItem>>([
        DestinationService.instance.getRecommended(
          limit: 6,
          userId: currentUserId,
        ),
        DestinationService.instance.getNearby(
          lat: pos?.latitude,
          lng: pos?.longitude,
          limit: 6,
        ),
      ]);

      final recommended = batch2[0];
      final nearby = batch2[1];

      if (mounted) {
        setState(() {
          if (categoriesFromDb.isNotEmpty) {
            _categories = [
              {'id': 0, 'name': 'Tất cả'},
              ...categoriesFromDb,
            ];
          }
          _featuredPlaces = featured;
          _upcomingEvents = upcomingEvents.take(10).toList();
          _recommendedPlaces = recommended;
          _nearbyPlaces = nearby;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  void _showAllFeatured() {
    setState(() {
      _customFilterTitle = 'Nổi bật tại Đà Nẵng';
      _categoryFilteredPlaces = _featuredPlaces;
      _selectCategoryIndex = -1; // Bỏ chọn chip danh mục
    });
  }

  // Bấm "Xem tất cả" mục Gợi ý cho bạn
  void _showAllRecommended() {
    setState(() {
      _customFilterTitle = 'Gợi ý cho bạn';
      _categoryFilteredPlaces = _recommendedPlaces;
      _selectCategoryIndex = -1;
    });
  }

  // Bấm "Xem tất cả" mục Gần bạn
  void _showAllNearby() {
    setState(() {
      _customFilterTitle = 'Địa điểm gần bạn';
      _categoryFilteredPlaces = _nearbyPlaces;
      _selectCategoryIndex = -1;
    });
  }

  Future<void> _onCategorySelected(int index) async {
    setState(() {
      _selectCategoryIndex = index;
      _customFilterTitle = null;
    });
    final selectedCat = _categories[index];
    final int catId = selectedCat['id'] as int;
    if (catId == 0) return;
    setState(() => _isCategoryLoading = true);
    final places = await DestinationService.instance.getAll(categoryId: catId);
    if (mounted) {
      setState(() {
        _categoryFilteredPlaces = places;
        _isCategoryLoading = false;
      });
    }
  }

  Future<void> _loadAvatar() async {
    final profile = await AuthService.instance.getProfile();
    if (profile != null && mounted) {
      final url = profile['avatarUrl'] as String?;
      setState(() {
        _avatarUrl = (url != null && url.isNotEmpty) ? url : null;
        _userName = profile['fullName'] as String? ?? 'Bạn';
      });
    }
  }

  void _navigateToDetail(DestinationItem item) {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (context) => DetailPlaceScreen(item: item)),
    );
  }

  void _navigateToUserProfile() {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => UserProfilePostsScreen(
          authorName: _userName,
          authorAvatar: _avatarUrl ?? 'assets/images/default-avatar.svg',
          isVerified: true,
          isCurrentUser: true,
        ),
      ),
    );
  }

  int _todaySpotlightIndex(int length) {
    if (length <= 1) return 0;
    final now = DateTime.now();
    final dayOfYear = now.difference(DateTime(now.year, 1, 1)).inDays;
    return dayOfYear % length;
  }

  Widget _buildHeroSpotlightCard(DestinationItem item) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return GestureDetector(
      onTap: () {
        HapticFeedback.selectionClick();
        _navigateToDetail(item);
      },
      child: Container(
        height: 296,
        width: double.infinity,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(26),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: isDark ? 0.38 : 0.14),
              blurRadius: 24,
              offset: const Offset(0, 12),
            ),
          ],
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(26),
          child: Stack(
            fit: StackFit.expand,
            children: [
              item.imageUrl.isNotEmpty
                  ? Image.network(
                      item.imageUrl,
                      cacheWidth: 900,
                      fit: BoxFit.cover,
                      errorBuilder: (_, _, _) =>
                          Container(color: AppColors.primaryDark),
                    )
                  : Container(color: AppColors.primaryDark),
              // Subtle top vignette
              Positioned.fill(
                child: DecoratedBox(
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                      colors: [
                        Colors.black.withValues(alpha: 0.28),
                        Colors.transparent,
                        Colors.black.withValues(alpha: 0.40),
                      ],
                      stops: const [0.0, 0.35, 1.0],
                    ),
                  ),
                ),
              ),
              // Top-left Apple "Today" eyebrow glass pill
              Positioned(
                top: 16,
                left: 16,
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(14),
                  child: BackdropFilter(
                    filter: ImageFilter.blur(sigmaX: 14, sigmaY: 14),
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 11,
                        vertical: 6,
                      ),
                      decoration: BoxDecoration(
                        color: Colors.black.withValues(alpha: 0.36),
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(
                          color: Colors.white.withValues(alpha: 0.26),
                          width: 0.8,
                        ),
                      ),
                      child: const Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            Icons.auto_awesome,
                            size: 13,
                            color: Color(0xFFFFB347),
                          ),
                          SizedBox(width: 5),
                          Text(
                            'NỔI BẬT HÔM NAY',
                            style: TextStyle(
                              fontFamily: 'Be Vietnam Pro',
                              fontSize: 10.5,
                              fontWeight: FontWeight.w700,
                              letterSpacing: 0.9,
                              color: Colors.white,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
              // Bottom Apple App Store frosted glass caption bar
              Positioned(
                left: 0,
                right: 0,
                bottom: 0,
                child: ClipRRect(
                  child: BackdropFilter(
                    filter: ImageFilter.blur(sigmaX: 22, sigmaY: 22),
                    child: Container(
                      padding: const EdgeInsets.fromLTRB(18, 14, 16, 16),
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          begin: Alignment.topCenter,
                          end: Alignment.bottomCenter,
                          colors: [
                            Colors.black.withValues(alpha: 0.28),
                            Colors.black.withValues(alpha: 0.68),
                          ],
                        ),
                        border: Border(
                          top: BorderSide(
                            color: Colors.white.withValues(alpha: 0.22),
                            width: 0.8,
                          ),
                        ),
                      ),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Text(
                                  item.category.toUpperCase(),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: TextStyle(
                                    fontFamily: 'Be Vietnam Pro',
                                    fontSize: 10.5,
                                    fontWeight: FontWeight.w700,
                                    color: Colors.white.withValues(alpha: 0.82),
                                    letterSpacing: 0.9,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  item.title,
                                  maxLines: 2,
                                  overflow: TextOverflow.ellipsis,
                                  style: const TextStyle(
                                    fontFamily: 'Be Vietnam Pro',
                                    fontSize: 21,
                                    height: 1.18,
                                    letterSpacing: -0.4,
                                    fontWeight: FontWeight.w800,
                                    color: Colors.white,
                                  ),
                                ),
                                const SizedBox(height: 6),
                                Row(
                                  children: [
                                    const Icon(
                                      Icons.star_rounded,
                                      size: 15,
                                      color: Color(0xFFFFB347),
                                    ),
                                    const SizedBox(width: 4),
                                    Text(
                                      item.rating.toStringAsFixed(1),
                                      style: const TextStyle(
                                        fontFamily: 'Be Vietnam Pro',
                                        fontSize: 12.5,
                                        fontWeight: FontWeight.w700,
                                        color: Colors.white,
                                      ),
                                    ),
                                    if (item.tag.isNotEmpty) ...[
                                      const SizedBox(width: 8),
                                      Flexible(
                                        child: Text(
                                          '• ${item.tag}',
                                          maxLines: 1,
                                          overflow: TextOverflow.ellipsis,
                                          style: TextStyle(
                                            fontFamily: 'Be Vietnam Pro',
                                            fontSize: 12,
                                            color: Colors.white.withValues(
                                              alpha: 0.85,
                                            ),
                                          ),
                                        ),
                                      ),
                                    ],
                                  ],
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(width: 12),
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 14,
                              vertical: 8,
                            ),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: const Text(
                              'Khám phá',
                              style: TextStyle(
                                fontFamily: 'Be Vietnam Pro',
                                fontSize: 12.5,
                                fontWeight: FontWeight.w700,
                                color: AppColors.primaryDark,
                              ),
                            ),
                          ),
                        ],
                      ),
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

  Widget _buildGroupedDestinationList(List<DestinationItem> items) {
    if (items.isEmpty) return const SizedBox.shrink();
    return Container(
      decoration: BoxDecoration(
        color: AppColors.surfaceGrouped(context),
        borderRadius: BorderRadius.circular(22),
        border: Border.all(
          color: AppColors.hairlineBorder(context),
          width: 0.85,
        ),
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(22),
        child: Column(
          children: List.generate(items.length, (i) {
            final item = items[i];
            return DestinationTile(
              item: item,
              grouped: true,
              showDivider: i < items.length - 1,
              onTap: () => _navigateToDetail(item),
            );
          }),
        ),
      ),
    );
  }

  Widget _buildSectionHeader(String title, VoidCallback onSeeAll) {
    final accent = AppColors.accentOf(context);
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        Expanded(
          child: Text(
            title,
            style: TextStyle(
              fontFamily: 'Be Vietnam Pro',
              fontSize: 20,
              fontWeight: FontWeight.w700,
              letterSpacing: -0.4,
              color: AppColors.labelPrimary(context),
            ),
          ),
        ),
        InkWell(
          onTap: onSeeAll,
          borderRadius: BorderRadius.circular(12),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 6),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  'Xem tất cả',
                  style: TextStyle(
                    fontFamily: 'Be Vietnam Pro',
                    fontSize: 13.5,
                    fontWeight: FontWeight.w600,
                    color: accent,
                  ),
                ),
                const SizedBox(width: 2),
                Icon(Icons.chevron_right_rounded, size: 18, color: accent),
              ],
            ),
          ),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bool isAll = _selectCategoryIndex == 0 && _customFilterTitle == null;
    final String selectedCategoryName =
        _customFilterTitle ??
        (_categories.isNotEmpty &&
                _selectCategoryIndex >= 0 &&
                _selectCategoryIndex < _categories.length
            ? (_categories[_selectCategoryIndex]['name'] as String? ?? '')
            : '');
    final String headerLabel = _customFilterTitle != null
        ? 'Bộ sưu tập'
        : 'Danh mục';
    final filteredPlaces = _categoryFilteredPlaces;

    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: const DanaGoLogo.horizontal(markSize: 26, fontSize: 20),
        centerTitle: false,
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 16, top: 8, bottom: 8),
            child: InkWell(
              borderRadius: BorderRadius.circular(20),
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => const LodgingScreen(),
                  ),
                );
              },
              child: Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 12,
                  vertical: 6,
                ),
                decoration: BoxDecoration(
                  color: AppColors.primary.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(
                    color: AppColors.primary.withValues(alpha: 0.35),
                  ),
                ),
                child: const Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(
                      Icons.hotel_rounded,
                      size: 16,
                      color: AppColors.primary,
                    ),
                    SizedBox(width: 6),
                    Text(
                      'Nơi lưu trú',
                      style: TextStyle(
                        fontFamily: 'Be Vietnam Pro',
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
                        color: AppColors.primary,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: _loadHomeData,
          color: AppColors.primary,
          child: SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(
              parent: BouncingScrollPhysics(),
            ),
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Search bar with Avatar shortcut
                HomeSearchBar(
                  onTap: () {
                    if (widget.onSearchTap != null) {
                      widget.onSearchTap!();
                    }
                  },
                  onAvatarTap: _navigateToUserProfile,
                  avatarUrl: _avatarUrl,
                ),
                const SizedBox(height: 20),
                CategorySelector(
                  categories: _categories
                      .map((c) => c['name'] as String)
                      .toList(),
                  selectedIndex: _selectCategoryIndex,
                  onSelect: _onCategorySelected,
                ),
                const SizedBox(height: 24),
                if (isAll) ...[
                  // 1. Apple App Store "Today" Hero Spotlight Card (tự xoay theo ngày)
                  if (_featuredPlaces.isNotEmpty) ...[
                    Builder(
                      builder: (context) {
                        final spotlightIdx = _todaySpotlightIndex(
                          _featuredPlaces.length,
                        );
                        final spotlightItem = _featuredPlaces[spotlightIdx];
                        final otherFeatured = <DestinationItem>[
                          for (int i = 0; i < _featuredPlaces.length; i++)
                            if (i != spotlightIdx) _featuredPlaces[i],
                        ];
                        return Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            _buildHeroSpotlightCard(spotlightItem),
                            const SizedBox(height: 28),
                            if (otherFeatured.isNotEmpty) ...[
                              _buildSectionHeader(
                                'Nổi bật tại Đà Nẵng',
                                _showAllFeatured,
                              ),
                              const SizedBox(height: 12),
                              SizedBox(
                                height: 262,
                                child: ListView.builder(
                                  scrollDirection: Axis.horizontal,
                                  physics: const BouncingScrollPhysics(),
                                  itemCount: otherFeatured.length,
                                  itemBuilder: (context, index) {
                                    final item = otherFeatured[index];
                                    return FeaturedCard(
                                      item: item,
                                      onTap: () => _navigateToDetail(item),
                                    );
                                  },
                                ),
                              ),
                              const SizedBox(height: 28),
                            ],
                          ],
                        );
                      },
                    ),
                  ],

                  // 3. Upcoming Events (Đồng bộ với Web User)
                  if (_upcomingEvents.isNotEmpty) ...[
                    _buildSectionHeader('Sự kiện sắp diễn ra', () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => const EventsScreen()),
                      );
                    }),
                    const SizedBox(height: 12),
                    SizedBox(
                      height: 268,
                      child: ListView.builder(
                        scrollDirection: Axis.horizontal,
                        physics: const BouncingScrollPhysics(),
                        itemCount: _upcomingEvents.length,
                        itemBuilder: (context, index) {
                          final ev = _upcomingEvents[index];
                          return EventCard(
                            event: ev,
                            width: 248,
                            onTap: () async {
                              final updated = await Navigator.push<EventItem>(
                                context,
                                MaterialPageRoute(
                                  builder: (_) => EventDetailScreen(event: ev),
                                ),
                              );
                              if (updated != null && mounted) {
                                setState(() {
                                  final idx = _upcomingEvents.indexWhere(
                                    (e) => e.id == updated.id,
                                  );
                                  if (idx != -1) _upcomingEvents[idx] = updated;
                                });
                              }
                            },
                          );
                        },
                      ),
                    ),
                    const SizedBox(height: 28),
                  ],

                  // 4. Recommended — True Apple Inset-Grouped Table Container
                  _buildSectionHeader('Gợi ý cho bạn', _showAllRecommended),
                  const SizedBox(height: 12),
                  _buildGroupedDestinationList(
                    _recommendedPlaces.take(4).toList(),
                  ),
                  const SizedBox(height: 28),

                  // 5. Nearby — True Apple Inset-Grouped Table Container
                  _buildSectionHeader('Gần bạn', _showAllNearby),
                  const SizedBox(height: 12),
                  _buildGroupedDestinationList(_nearbyPlaces.take(4).toList()),
                ] else ...[
                  const SizedBox(height: 16),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      // Bọc Expanded để chữ dài tự động co gọn, không đè nút bên phải
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              '${headerLabel}',
                              style: TextStyle(
                                fontFamily: 'Be Vietnam Pro',
                                fontSize: 12,
                                fontWeight: FontWeight.w600,
                                color: isDark
                                    ? Colors.white60
                                    : AppColors.textTertiary,
                                letterSpacing: 0.5,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              selectedCategoryName,
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                              style: TextStyle(
                                fontFamily: 'Be Vietnam Pro',
                                fontSize: 20, // Tên danh mục to và đậm rõ ràng
                                fontWeight: FontWeight.bold,
                                height: 1.25,
                                color: isDark
                                    ? Colors.white
                                    : AppColors.textPrimary,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              '${filteredPlaces.length} địa điểm hấp dẫn tại Đà Nẵng',
                              style: TextStyle(
                                fontFamily: 'Be Vietnam Pro',
                                fontSize: 13,
                                color: isDark
                                    ? Colors.white70
                                    : AppColors.textTertiary,
                              ),
                            ),
                            const SizedBox(height: 4),
                          ],
                        ),
                      ),
                      const SizedBox(width: 12),
                      // Nút "Tất cả"
                      TextButton.icon(
                        onPressed: () {
                          setState(() {
                            _selectCategoryIndex = 0;
                            _customFilterTitle = null;
                          });
                        },
                        icon: Icon(
                          Icons.close_rounded,
                          size: 16,
                          color: isDark ? Colors.white70 : AppColors.neutral,
                        ),
                        label: Text(
                          'Tất cả',
                          style: TextStyle(
                            fontFamily: 'Be Vietnam Pro',
                            fontSize: 12,
                            color: isDark ? Colors.white70 : AppColors.neutral,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        style: TextButton.styleFrom(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 10,
                            vertical: 4,
                          ),
                          backgroundColor: isDark
                              ? const Color(0xFF1E293B)
                              : AppColors.bgSecondary,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(16),
                          ),
                        ),
                      ),
                    ],
                  ),
                  // List of filtered places
                  if (filteredPlaces.isEmpty)
                    Container(
                      padding: const EdgeInsets.symmetric(vertical: 40),
                      alignment: Alignment.center,
                      child: Column(
                        children: [
                          const Icon(
                            Icons.explore_off_outlined,
                            size: 48,
                            color: AppColors.textHint,
                          ),
                          const SizedBox(height: 12),
                          Text(
                            'Chưa có địa điểm nào trong mục $selectedCategoryName',
                            textAlign: TextAlign.center,
                            style: TextStyle(
                              fontFamily: 'Be Vietnam Pro',
                              fontSize: 14,
                              color: isDark
                                  ? Colors.white70
                                  : AppColors.textTertiary,
                            ),
                          ),
                        ],
                      ),
                    )
                  else
                    Column(
                      children: filteredPlaces.map((item) {
                        return DestinationTile(
                          item: item,
                          onTap: () => _navigateToDetail(item),
                        );
                      }).toList(),
                    ),
                ],
                const SizedBox(height: 110),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
