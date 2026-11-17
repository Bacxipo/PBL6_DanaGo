import 'package:flutter/material.dart';
import 'package:smarttrip/models/itinerary_model.dart';
import 'package:smarttrip/screens/login_screen.dart';
import 'package:smarttrip/services/auth_service.dart';
import 'package:smarttrip/services/itinerary_service.dart';
import 'package:smarttrip/theme/app_colors.dart';
import 'package:smarttrip/widgets/itinerary/create_itinerary_sheet.dart';
import 'package:smarttrip/widgets/itinerary/itinerary_card.dart';
import 'itinerary_detail_screen.dart';

class ItineraryScreen extends StatefulWidget {
  const ItineraryScreen({super.key});

  @override
  State<ItineraryScreen> createState() => _ItineraryScreenState();
}

class _ItineraryScreenState extends State<ItineraryScreen>
    with SingleTickerProviderStateMixin {
  int _selectedFilter = 0;
  late AnimationController _fabController;
  late Animation<double> _fabAnimation;
  List<Itinerary> _myItineraries = [];
  bool _isLoading = true;
  bool _isLoggedIn = false;

  final List<String> _filters = [
    'Tất cả',
    'Đang diễn ra',
    'Sắp tới',
    'Đã hoàn thành',
  ];

  final List<ItineraryStatus?> _filterStatuses = [
    null,
    ItineraryStatus.ongoing,
    ItineraryStatus.upcoming,
    ItineraryStatus.completed,
  ];

  @override
  void initState() {
    super.initState();
    _fabController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 600),
    );
    _fabAnimation = CurvedAnimation(
      parent: _fabController,
      curve: Curves.elasticOut,
    );
    _fabController.forward();

    ItineraryService.instance.addListener(_loadItineraries);
    AuthService.instance.addListener(_loadItineraries);
    _loadItineraries();
  }

  @override
  void dispose() {
    ItineraryService.instance.removeListener(_loadItineraries);
    AuthService.instance.removeListener(_loadItineraries);
    _fabController.dispose();
    super.dispose();
  }

  Future<void> _loadItineraries() async {
    if (!mounted) return;
    setState(() => _isLoading = true);
    try {
      final profile = await AuthService.instance.getProfile();
      if (profile == null || profile['id'] == null) {
        if (mounted) {
          setState(() {
            _isLoggedIn = false;
            _myItineraries = [];
            _isLoading = false;
          });
        }
        return;
      }

      final userId = (profile['id'] as num).toInt();
      final list = await ItineraryService.instance.getUserItineraries(userId);
      if (mounted) {
        setState(() {
          _isLoggedIn = true;
          _myItineraries = list;
          _isLoading = false;
        });
      }
    } catch (_) {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  List<Itinerary> get _filteredList {
    final status = _filterStatuses[_selectedFilter];
    if (status == null) return _myItineraries;
    return _myItineraries.where((e) => e.status == status).toList();
  }

  Future<void> _confirmDelete(Itinerary itinerary) async {
    final dbId = itinerary.dbId;
    if (dbId == null) return;

    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Xóa lịch trình?'),
        content: Text(
          'Bạn có chắc chắn muốn xóa lịch trình "${itinerary.title}" không?',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Hủy'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(ctx, true),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.red,
              foregroundColor: Colors.white,
            ),
            child: const Text('Xóa'),
          ),
        ],
      ),
    );

    if (confirmed != true) return;
    final ok = await ItineraryService.instance.deleteItinerary(dbId);
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          ok
              ? 'Đã xóa lịch trình "${itinerary.title}"'
              : 'Không thể xóa lịch trình, vui lòng thử lại',
        ),
        backgroundColor: ok ? AppColors.primary : Colors.red,
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  Future<void> _openCreateSheet() async {
    if (!_isLoggedIn) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Vui lòng đăng nhập để tạo lịch trình'),
          behavior: SnackBarBehavior.floating,
        ),
      );
      return;
    }

    final data = await showModalBottomSheet<Map<String, dynamic>>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => const CreateItinerarySheet(),
    );

    if (data == null || !mounted) return;

    try {
      final startIso =
          (data['startDateIso'] as String?) ??
          DateTime.now().toIso8601String().split('T').first;
      final endIso = (data['endDateIso'] as String?) ?? startIso;

      final payload = {
        'title': data['title'],
        'startDate': startIso,
        'endDate': endIso,
        'description': data['description'] ?? '',
        'coverImg': Itinerary.defaultCoverImage,
        'budget': 0,
        'days': {'1': []},
      };

      final saved = await ItineraryService.instance.saveFullItinerary(payload);
      if (saved != null && mounted) {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (_) => ItineraryDetailScreen(itinerary: saved),
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Không thể tạo lịch trình: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildHeader(isDark),
            if (_isLoggedIn) _buildFilterTabs(isDark),
            Expanded(
              child: _isLoading
                  ? const Center(
                      child: CircularProgressIndicator(
                        color: AppColors.primary,
                      ),
                    )
                  : !_isLoggedIn
                      ? _buildLoginRequired(isDark)
                      : RefreshIndicator(
                          onRefresh: _loadItineraries,
                          color: AppColors.primary,
                          child: _filteredList.isEmpty
                              ? ListView(
                                  physics:
                                      const AlwaysScrollableScrollPhysics(),
                                  children: [
                                    SizedBox(
                                      height:
                                          MediaQuery.of(context).size.height *
                                              0.55,
                                      child: _buildEmptyState(),
                                    ),
                                  ],
                                )
                              : ListView.builder(
                                  physics: const AlwaysScrollableScrollPhysics(
                                    parent: BouncingScrollPhysics(),
                                  ),
                                  padding: const EdgeInsets.fromLTRB(
                                    16,
                                    8,
                                    16,
                                    100,
                                  ),
                                  itemCount: _filteredList.length,
                                  itemBuilder: (context, index) {
                                    final item = _filteredList[index];
                                    return ItineraryCard(
                                      itinerary: item,
                                      onDelete: () => _confirmDelete(item),
                                      onTap: () {
                                        Navigator.push(
                                          context,
                                          MaterialPageRoute(
                                            builder: (_) =>
                                                ItineraryDetailScreen(
                                              itinerary: item,
                                            ),
                                          ),
                                        );
                                      },
                                    );
                                  },
                                ),
                        ),
            ),
          ],
        ),
      ),
      floatingActionButton: ScaleTransition(
        scale: _fabAnimation,
        child: FloatingActionButton(
          heroTag: 'itinerary_fab',
          onPressed: _openCreateSheet,
          backgroundColor: AppColors.primary,
          elevation: 6,
          child: const Icon(Icons.add, color: Colors.white, size: 28),
        ),
      ),
    );
  }

  Widget _buildHeader(bool isDark) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 20, 20, 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Lịch trình của tôi',
                style: TextStyle(
                  fontSize: 26,
                  fontWeight: FontWeight.bold,
                  color: isDark ? Colors.white : AppColors.textPrimary,
                ),
              ),
              Text(
                '${_myItineraries.length} lịch trình',
                style: const TextStyle(
                  fontSize: 13,
                  color: AppColors.textTertiary,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildFilterTabs(bool isDark) {
    return Container(
      height: 44,
      margin: const EdgeInsets.only(bottom: 8),
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 16),
        itemCount: _filters.length,
        itemBuilder: (context, index) {
          final isSelected = _selectedFilter == index;
          return GestureDetector(
            onTap: () => setState(() => _selectedFilter = index),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 250),
              margin: const EdgeInsets.only(right: 8),
              padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 8),
              decoration: BoxDecoration(
                color: isSelected
                    ? AppColors.primary
                    : (isDark ? const Color(0xFF1E293B) : Colors.white),
                borderRadius: BorderRadius.circular(22),
                boxShadow: [
                  if (isSelected)
                    BoxShadow(
                      color: AppColors.primary.withValues(alpha: 0.3),
                      blurRadius: 8,
                      offset: const Offset(0, 3),
                    ),
                ],
              ),
              child: Text(
                _filters[index],
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: isSelected
                      ? Colors.white
                      : (isDark
                          ? Colors.grey.shade400
                          : AppColors.textTertiary),
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildLoginRequired(bool isDark) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.map_outlined,
              size: 72,
              color: AppColors.primary.withValues(alpha: 0.35),
            ),
            const SizedBox(height: 16),
            Text(
              'Đăng nhập để quản lý lịch trình',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: isDark ? Colors.white : AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              'Lưu trữ và đồng bộ các chuyến đi Đà Nẵng cùng checklist hành lý của bạn.',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 13, color: AppColors.textTertiary),
            ),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const LoginScreen()),
                );
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(
                  horizontal: 28,
                  vertical: 12,
                ),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(14),
                ),
              ),
              child: const Text(
                'Đăng nhập ngay',
                style: TextStyle(fontWeight: FontWeight.bold),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.map_outlined,
            size: 80,
            color: AppColors.primary.withValues(alpha: 0.3),
          ),
          const SizedBox(height: 16),
          const Text(
            'Chưa có lịch trình nào',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: AppColors.textSecondary,
            ),
          ),
          const SizedBox(height: 8),
          const Text(
            'Bấm dấu + để tự tạo hoặc nhờ DanaGo AI gợi ý lịch trình!',
            style: TextStyle(fontSize: 13, color: AppColors.textTertiary),
          ),
        ],
      ),
    );
  }
}
