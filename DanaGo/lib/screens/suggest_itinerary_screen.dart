import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:smarttrip/models/ai_candidate_model.dart';
import 'package:smarttrip/theme/app_colors.dart';
import 'package:smarttrip/widgets/ai_plan/ai_prompt_input.dart';
import 'package:smarttrip/widgets/ai_plan/ai_candidate_card.dart';
import 'package:smarttrip/widgets/ai_plan/ai_floating_bar.dart';
import 'package:smarttrip/widgets/ai_plan/ai_filter_section.dart';

class SuggestItineraryScreen extends StatefulWidget {
  const SuggestItineraryScreen({super.key});

  @override
  State<SuggestItineraryScreen> createState() => _SuggestItineraryScreenState();
}

class _SuggestItineraryScreenState extends State<SuggestItineraryScreen> {
  final TextEditingController _promptController = TextEditingController();
  bool _isLoading = false;

  List<AICandidatePlace> _candidates = [];
  final Set<int> _selectedPlaceIds = {};

  final List<String> _quickPrompts = [
    '🌅 Chỗ ngắm hoàng hôn lãng mạn',
    '☕ Quán cà phê view đẹp sống ảo',
    '🏖️ Bãi biển trong xanh yên bình',
    '🍜 Quán ăn đặc sản đậm chất Đà Nẵng',
    '🏛️ Địa điểm văn hóa lịch sử',
  ];
  bool _showFilters = false;
  String _selectedRegion = 'Tất cả khu vực';
  double _budget = 5.0;
  final Set<String> _selectedInterests = {'Biển & đảo', 'Ẩm thực'};

  final List<String> _regions = [
    'Tất cả khu vực',
    'Đà Nẵng nội thành',
    'Hội An - Điện Bàn',
    'Hòa Vang - Bà Nà',
    'Cù Lao Chàm',
    'Duy Xuyên - Mỹ Sơn',
  ];

  final List<Map<String, dynamic>> _interestGroups = [
    {'name': 'Biển & đảo', 'icon': Icons.waves_rounded},
    {'name': 'Ẩm thực', 'icon': Icons.restaurant_rounded},
    {'name': 'Văn hóa & lịch sử', 'icon': Icons.account_balance_rounded},
    {'name': 'Thiên nhiên & khám phá', 'icon': Icons.forest_rounded},
    {'name': 'Vui chơi & check-in', 'icon': Icons.attractions_rounded},
  ];

  @override
  void initState() {
    super.initState();
    _fetchAICandidates();
  }

  @override
  void dispose() {
    _promptController.dispose();
    super.dispose();
  }

  Future<void> _fetchAICandidates() async {
    setState(() => _isLoading = true);
    try {
      final res = await http
          .post(
            Uri.parse('http://10.0.2.2:8000/candidates'),
            headers: {'Content-Type': 'application/json'},
            body: jsonEncode({
              'query': _promptController.text.trim().isEmpty
                  ? null
                  : _promptController.text.trim(),
              'interests': _selectedInterests.toList(), // 👈 1. 5 Nhóm sở thích
              'region': _selectedRegion == 'Tất cả khu vực'
                  ? null
                  : _selectedRegion, // 👈 2. Khu vực
              'budget_pp': (_budget * 1000000).toInt(), // 👈 3. Ngân sách (VNĐ)
              'per_group': 6,
              'top_k': 12,
            }),
          )
          .timeout(const Duration(seconds: 4));

      if (res.statusCode == 200) {
        final data = jsonDecode(utf8.decode(res.bodyBytes));
        final Map<String, dynamic> groups = data['groups'] ?? {};
        final List<AICandidatePlace> list = [];
        groups.forEach((groupName, places) {
          if (places is List) {
            for (var p in places) {
              list.add(AICandidatePlace.fromJson(p, groupName));
            }
          }
        });
        list.sort((a, b) => b.matchScore.compareTo(a.matchScore));
        setState(() => _candidates = list);
      } else {
        _loadSampleData();
      }
    } catch (_) {
      _loadSampleData();
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _loadSampleData() {
    setState(() {
      _candidates = [
        AICandidatePlace(
          id: 1,
          name: 'Bãi biển Mỹ Khê',
          district: 'Sơn Trà',
          avgRating: 4.8,
          ticketPrice: 'Miễn phí',
          imageUrl:
              'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
          groupName: 'Biển & đảo',
          matchScore: 0.96,
        ),
        AICandidatePlace(
          id: 2,
          name: 'Bán đảo Sơn Trà & Chùa Linh Ứng',
          district: 'Sơn Trà',
          avgRating: 4.7,
          ticketPrice: 'Miễn phí',
          imageUrl:
              'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800',
          groupName: 'Văn hóa & lịch sử',
          matchScore: 0.92,
        ),
        AICandidatePlace(
          id: 3,
          name: 'Phố cổ Hội An',
          district: 'Hội An',
          avgRating: 4.9,
          ticketPrice: '80.000đ',
          imageUrl:
              'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800',
          groupName: 'Văn hóa & lịch sử',
          matchScore: 0.89,
        ),
      ];
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      body: Stack(
        children: [
          SafeArea(
            child: CustomScrollView(
              slivers: [
                // Header Banner
                SliverToBoxAdapter(
                  child: Container(
                    padding: const EdgeInsets.all(20),
                    decoration: const BoxDecoration(
                      gradient: LinearGradient(
                        colors: [Color(0xFF004E54), Color(0xFF006971)],
                      ),
                    ),
                    child: const Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'DanaGo AI Discovery',
                          style: TextStyle(
                            color: Colors.amberAccent,
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        SizedBox(height: 6),
                        Text(
                          'Gợi ý Lịch trình Thông minh',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),

                // Ô nhập Prompt & Quick Prompts
                SliverToBoxAdapter(
                  child: AIPromptInput(
                    controller: _promptController,
                    quickPrompts: _quickPrompts,
                    onSearch: _fetchAICandidates,
                    onSelectPrompt: (p) {
                      _promptController.text = p.replaceFirst(
                        RegExp(r'^[^\s]+\s'),
                        '',
                      );
                      _fetchAICandidates();
                    },
                  ),
                ),
                // Nút bấm mở/đóng bộ lọc
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 4,
                    ),
                    child: InkWell(
                      onTap: () => setState(() => _showFilters = !_showFilters),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.end,
                        children: [
                          Icon(
                            _showFilters
                                ? Icons.keyboard_arrow_up_rounded
                                : Icons.tune_rounded,
                            size: 16,
                            color: AppColors.primary,
                          ),
                          const SizedBox(width: 4),
                          Text(
                            _showFilters
                                ? 'Thu gọn bộ lọc'
                                : 'Lọc nâng cao (Khu vực, Ngân sách, Sở thích)',
                            style: const TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                              color: AppColors.primary,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),

                // Hiển thị phần bộ lọc khi _showFilters = true
                if (_showFilters)
                  SliverToBoxAdapter(
                    child: AIFilterSection(
                      selectedRegion: _selectedRegion,
                      regions: _regions,
                      onRegionChanged: (val) {
                        if (val != null) setState(() => _selectedRegion = val);
                      },
                      selectedInterests: _selectedInterests,
                      interestGroups: _interestGroups,
                      onInterestToggled: (name, isSelected) {
                        setState(() {
                          if (isSelected) {
                            _selectedInterests.add(name);
                          } else {
                            _selectedInterests.remove(name);
                          }
                        });
                      },
                      budget: _budget,
                      onBudgetChanged: (val) => setState(() => _budget = val),
                      onReset: () {
                        setState(() {
                          _selectedRegion = 'Tất cả khu vực';
                          _selectedInterests.clear();
                          _budget = 5.0;
                        });
                        _fetchAICandidates();
                      },
                      onApply: () {
                        setState(
                          () => _showFilters = false,
                        ); // Đóng bộ lọc và tìm kiếm
                        _fetchAICandidates();
                      },
                    ),
                  ),
                // Danh sách địa điểm gợi ý
                if (_isLoading)
                  const SliverToBoxAdapter(
                    child: Center(
                      child: Padding(
                        padding: EdgeInsets.all(40),
                        child: CircularProgressIndicator(),
                      ),
                    ),
                  )
                else
                  SliverList(
                    delegate: SliverChildBuilderDelegate((context, i) {
                      final place = _candidates[i];
                      return AICandidateCard(
                        place: place,
                        isSelected: _selectedPlaceIds.contains(place.id),
                        onToggleSelect: () {
                          setState(() {
                            if (_selectedPlaceIds.contains(place.id)) {
                              _selectedPlaceIds.remove(place.id);
                            } else {
                              _selectedPlaceIds.add(place.id);
                            }
                          });
                        },
                      );
                    }, childCount: _candidates.length),
                  ),

                const SliverToBoxAdapter(child: SizedBox(height: 100)),
              ],
            ),
          ),

          // Thanh nổi gom địa điểm dưới đáy
          AIFloatingBar(
            selectedCount: _selectedPlaceIds.length,
            onCreateItinerary: () {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text(
                    'Đang tạo lịch trình với ${_selectedPlaceIds.length} địa điểm...',
                  ),
                ),
              );
            },
          ),
        ],
      ),
    );
  }
}
