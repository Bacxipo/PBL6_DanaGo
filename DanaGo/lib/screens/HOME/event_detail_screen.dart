import 'package:flutter/material.dart';
import 'package:smarttrip/models/event_item.dart';
import 'package:smarttrip/screens/detail_place_screen.dart';
import 'package:smarttrip/services/auth_service.dart';
import 'package:smarttrip/services/destination_service.dart';
import 'package:smarttrip/services/event_service.dart';
import 'package:smarttrip/theme/app_colors.dart';

class EventDetailScreen extends StatefulWidget {
  final EventItem event;

  const EventDetailScreen({super.key, required this.event});

  @override
  State<EventDetailScreen> createState() => _EventDetailScreenState();
}

class _EventDetailScreenState extends State<EventDetailScreen> {
  late EventItem _event;
  int _currentImage = 0;
  bool _isTogglingFavorite = false;

  @override
  void initState() {
    super.initState();
    _event = widget.event;
    _refreshDetail();
  }

  Future<void> _refreshDetail() async {
    final fresh = await EventService.instance.getEventById(_event.id);
    if (fresh != null && mounted) {
      setState(() => _event = fresh);
    }
  }

  Future<void> _toggleFavorite() async {
    if (_isTogglingFavorite) return;
    final loggedIn = await AuthService.instance.isLoggedIn();
    if (!loggedIn) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Vui lòng đăng nhập để lưu sự kiện yêu thích'),
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
      return;
    }

    setState(() => _isTogglingFavorite = true);
    try {
      final result = await EventService.instance.toggleFavorite(_event.id);
      if (result != null && mounted) {
        setState(() => _event = _event.copyWith(isFavorited: result));
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              result
                  ? 'Đã thêm vào sự kiện yêu thích'
                  : 'Đã bỏ khỏi sự kiện yêu thích',
            ),
            backgroundColor: AppColors.primary,
            behavior: SnackBarBehavior.floating,
            duration: const Duration(seconds: 2),
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Không thể cập nhật yêu thích: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _isTogglingFavorite = false);
    }
  }

  Future<void> _openLinkedDestination() async {
    final destId = _event.destinationId;
    if (destId == null) return;
    final dest = await DestinationService.instance.getById(destId);
    if (dest != null && mounted) {
      Navigator.push(
        context,
        MaterialPageRoute(builder: (_) => DetailPlaceScreen(item: dest)),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final images = _event.images;

    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            expandedHeight: 280,
            pinned: true,
            backgroundColor: AppColors.primary,
            leading: Padding(
              padding: const EdgeInsets.all(8),
              child: InkWell(
                borderRadius: BorderRadius.circular(12),
                onTap: () => Navigator.pop(context, _event),
                child: Container(
                  decoration: BoxDecoration(
                    color: Colors.black.withValues(alpha: 0.35),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(
                    Icons.arrow_back_rounded,
                    color: Colors.white,
                  ),
                ),
              ),
            ),
            actions: [
              Padding(
                padding: const EdgeInsets.all(8),
                child: InkWell(
                  borderRadius: BorderRadius.circular(12),
                  onTap: _toggleFavorite,
                  child: Container(
                    width: 40,
                    height: 40,
                    decoration: BoxDecoration(
                      color: Colors.black.withValues(alpha: 0.35),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Icon(
                      _event.isFavorited
                          ? Icons.favorite_rounded
                          : Icons.favorite_border_rounded,
                      color: _event.isFavorited
                          ? Colors.redAccent
                          : Colors.white,
                    ),
                  ),
                ),
              ),
            ],
            flexibleSpace: FlexibleSpaceBar(
              background: Stack(
                fit: StackFit.expand,
                children: [
                  if (images.isNotEmpty)
                    PageView.builder(
                      itemCount: images.length,
                      onPageChanged: (i) => setState(() => _currentImage = i),
                      itemBuilder: (_, idx) => Image.network(
                        images[idx],
                        fit: BoxFit.cover,
                        errorBuilder: (_, __, ___) => _placeholderBanner(),
                      ),
                    )
                  else
                    _placeholderBanner(),
                  IgnorePointer(
                    child: Container(
                      decoration: const BoxDecoration(
                        gradient: LinearGradient(
                          begin: Alignment.topCenter,
                          end: Alignment.bottomCenter,
                          colors: [
                            Colors.black26,
                            Colors.transparent,
                            Colors.black54,
                          ],
                          stops: [0.0, 0.5, 1.0],
                        ),
                      ),
                    ),
                  ),
                  Positioned(
                    bottom: 16,
                    left: 16,
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 5,
                      ),
                      decoration: BoxDecoration(
                        color: _event.badgeColor,
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Text(
                        _event.badgeLabel,
                        style: const TextStyle(
                          fontFamily: 'Be Vietnam Pro',
                          fontSize: 12,
                          fontWeight: FontWeight.w700,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ),
                  if (images.length > 1)
                    Positioned(
                      bottom: 16,
                      right: 16,
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 10,
                          vertical: 4,
                        ),
                        decoration: BoxDecoration(
                          color: Colors.black54,
                          borderRadius: BorderRadius.circular(14),
                        ),
                        child: Text(
                          '${_currentImage + 1}/${images.length}',
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ),
                ],
              ),
            ),
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(20, 20, 20, 32),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    _event.name,
                    style: TextStyle(
                      fontFamily: 'Be Vietnam Pro',
                      fontSize: 22,
                      fontWeight: FontWeight.w800,
                      height: 1.3,
                      color: isDark ? Colors.white : AppColors.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 16),
                  _infoTile(
                    icon: Icons.calendar_month_rounded,
                    iconColor: AppColors.primary,
                    label: 'Thời gian diễn ra',
                    value: _event.formattedDateRange,
                    isDark: isDark,
                  ),
                  const SizedBox(height: 10),
                  _infoTile(
                    icon: Icons.location_on_rounded,
                    iconColor: const Color(0xFFF43F5E),
                    label: 'Địa điểm tổ chức',
                    value: _event.locationText,
                    isDark: isDark,
                    trailing: _event.destinationId != null
                        ? const Icon(
                            Icons.chevron_right_rounded,
                            color: AppColors.primary,
                          )
                        : null,
                    onTap: _event.destinationId != null
                        ? _openLinkedDestination
                        : null,
                  ),
                  const SizedBox(height: 10),
                  _infoTile(
                    icon: Icons.confirmation_number_rounded,
                    iconColor: const Color(0xFFF59E0B),
                    label: 'Giá vé tham khảo',
                    value: _event.formattedPrice,
                    isDark: isDark,
                  ),
                  const SizedBox(height: 24),
                  Text(
                    'Giới thiệu sự kiện',
                    style: TextStyle(
                      fontFamily: 'Be Vietnam Pro',
                      fontSize: 17,
                      fontWeight: FontWeight.w700,
                      color: isDark ? Colors.white : AppColors.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 10),
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Theme.of(context).cardColor,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                        color: isDark
                            ? Colors.white.withValues(alpha: 0.08)
                            : Colors.grey.shade200,
                      ),
                    ),
                    child: Text(
                      _event.description.trim().isNotEmpty
                          ? _event.description.trim()
                          : 'Sự kiện đặc sắc tại thành phố Đà Nẵng. Đừng bỏ lỡ cơ hội tham gia cùng bạn bè và gia đình!',
                      style: TextStyle(
                        fontFamily: 'Be Vietnam Pro',
                        fontSize: 14,
                        height: 1.6,
                        color: isDark
                            ? Colors.white.withValues(alpha: 0.85)
                            : AppColors.textSecondary,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _placeholderBanner() {
    return Container(
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [Color(0xFF004E54), Color(0xFF006971)],
        ),
      ),
      child: Center(
        child: Icon(
          Icons.celebration_rounded,
          size: 72,
          color: Colors.white.withValues(alpha: 0.4),
        ),
      ),
    );
  }

  Widget _infoTile({
    required IconData icon,
    required Color iconColor,
    required String label,
    required String value,
    required bool isDark,
    Widget? trailing,
    VoidCallback? onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: Theme.of(context).cardColor,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isDark
                ? Colors.white.withValues(alpha: 0.08)
                : Colors.grey.shade200,
          ),
        ),
        child: Row(
          children: [
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: iconColor.withValues(alpha: 0.12),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(icon, color: iconColor, size: 20),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    label,
                    style: TextStyle(
                      fontFamily: 'Be Vietnam Pro',
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                      color: isDark ? Colors.white60 : AppColors.textTertiary,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    value,
                    style: TextStyle(
                      fontFamily: 'Be Vietnam Pro',
                      fontSize: 14,
                      fontWeight: FontWeight.w700,
                      color: isDark ? Colors.white : AppColors.textPrimary,
                    ),
                  ),
                ],
              ),
            ),
            if (trailing != null) trailing,
          ],
        ),
      ),
    );
  }
}
