import 'package:flutter/material.dart';
import 'package:smarttrip/theme/app_colors.dart';

class AIPromptInput extends StatelessWidget {
  final TextEditingController controller;
  final List<String> quickPrompts;
  final VoidCallback onSearch;
  final Function(String) onSelectPrompt;

  const AIPromptInput({
    super.key,
    required this.controller,
    required this.quickPrompts,
    required this.onSearch,
    required this.onSelectPrompt,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Column(
      children: [
        // 1. Ô Textfield nhập Prompt
        Container(
          margin: const EdgeInsets.fromLTRB(16, 14, 16, 10),
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
          decoration: BoxDecoration(
            color: Theme.of(context).cardColor,
            borderRadius: BorderRadius.circular(16),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: isDark ? 0.2 : 0.04),
                blurRadius: 10,
                offset: const Offset(0, 3),
              ),
            ],
          ),
          child: Row(
            children: [
              const Icon(
                Icons.search_rounded,
                color: AppColors.primary,
                size: 22,
              ),
              const SizedBox(width: 10),
              Expanded(
                child: TextField(
                  controller: controller,
                  onSubmitted: (_) => onSearch(),
                  style: TextStyle(
                    color: isDark ? Colors.white : AppColors.textPrimary,
                  ),
                  decoration: const InputDecoration(
                    hintText: 'Nhập mong muốn (VD: Hoàng hôn view biển...)',
                    hintStyle: TextStyle(fontSize: 13, color: Colors.grey),
                    border: InputBorder.none,
                  ),
                ),
              ),
              IconButton(
                onPressed: onSearch,
                icon: const Icon(
                  Icons.send_rounded,
                  color: AppColors.primary,
                  size: 20,
                ),
              ),
            ],
          ),
        ),

        // 2. Các gợi ý nhanh 1 chạm cuộn ngang
        SizedBox(
          height: 36,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            itemCount: quickPrompts.length,
            separatorBuilder: (_, __) => const SizedBox(width: 8),
            itemBuilder: (context, index) {
              final prompt = quickPrompts[index];
              return ActionChip(
                label: Text(
                  prompt,
                  style: TextStyle(
                    fontSize: 11,
                    color: isDark ? Colors.white : AppColors.textPrimary,
                  ),
                ),
                backgroundColor: Theme.of(context).cardColor,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(18),
                  side: BorderSide(
                    color: isDark ? Colors.white12 : Colors.grey.shade200,
                  ),
                ),
                onPressed: () => onSelectPrompt(prompt),
              );
            },
          ),
        ),
      ],
    );
  }
}
