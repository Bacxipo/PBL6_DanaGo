import 'package:flutter/material.dart';
import 'package:smarttrip/models/feed_post_model.dart';
import 'package:smarttrip/theme/app_colors.dart';

class FeedCommentSheet extends StatefulWidget {
  final FeedPostModel post;
  final Function(CommentItem newComment)? onCommentAdded;

  const FeedCommentSheet({
    super.key,
    required this.post,
    this.onCommentAdded,
  });

  static Future<void> show(
    BuildContext context, {
    required FeedPostModel post,
    Function(CommentItem)? onCommentAdded,
  }) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => FeedCommentSheet(
        post: post,
        onCommentAdded: onCommentAdded,
      ),
    );
  }

  @override
  State<FeedCommentSheet> createState() => _FeedCommentSheetState();
}

class _FeedCommentSheetState extends State<FeedCommentSheet> {
  final TextEditingController _commentController = TextEditingController();
  late List<CommentItem> _comments;

  @override
  void initState() {
    super.initState();
    _comments = List.from(widget.post.comments);
  }

  @override
  void dispose() {
    _commentController.dispose();
    super.dispose();
  }

  void _submitComment() {
    final text = _commentController.text.trim();
    if (text.isEmpty) return;

    final newComment = CommentItem(
      id: 'cmt_${DateTime.now().millisecondsSinceEpoch}',
      authorName: 'Bạn (Người dùng)',
      authorAvatar: FeedPostModel.userDefaultAvatar,
      content: text,
      timeAgo: 'Vừa xong',
    );

    setState(() {
      _comments.insert(0, newComment);
      widget.post.commentsCount++;
    });

    widget.onCommentAdded?.call(newComment);
    _commentController.clear();
    FocusScope.of(context).unfocus();
  }

  @override
  Widget build(BuildContext context) {
    final bottomInset = MediaQuery.of(context).viewInsets.bottom;

    return Container(
      constraints: BoxConstraints(
        maxHeight: MediaQuery.of(context).size.height * 0.8,
      ),
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Drag handle
          Center(
            child: Container(
              margin: const EdgeInsets.only(top: 10, bottom: 6),
              width: 36,
              height: 4,
              decoration: BoxDecoration(
                color: Colors.grey.shade300,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          // Header
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Row(
              children: [
                Text(
                  'Bình luận (${_comments.length})',
                  style: const TextStyle(
                    fontFamily: 'Be Vietnam Pro',
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                    color: AppColors.textPrimary,
                  ),
                ),
                const Spacer(),
                IconButton(
                  icon: const Icon(Icons.close_rounded, size: 20),
                  onPressed: () => Navigator.pop(context),
                  visualDensity: VisualDensity.compact,
                ),
              ],
            ),
          ),
          const Divider(height: 1, thickness: 1, color: AppColors.divider),
          // Comment list
          Expanded(
            child: _comments.isEmpty
                ? const Center(
                    child: Padding(
                      padding: EdgeInsets.all(24.0),
                      child: Text(
                        'Chưa có bình luận nào.\nHãy là người đầu tiên để lại ý kiến!',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          fontFamily: 'Be Vietnam Pro',
                          fontSize: 14,
                          color: AppColors.neutral,
                        ),
                      ),
                    ),
                  )
                : ListView.separated(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    itemCount: _comments.length,
                    separatorBuilder: (context, index) => const SizedBox(height: 16),
                    itemBuilder: (context, index) {
                      final cmt = _comments[index];
                      return _buildCommentItem(cmt);
                    },
                  ),
          ),
          // Input field row at bottom with keyboard safe insets
          Container(
            padding: EdgeInsets.only(
              left: 16,
              right: 16,
              top: 10,
              bottom: bottomInset + 12,
            ),
            decoration: BoxDecoration(
              color: Colors.white,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.04),
                  blurRadius: 8,
                  offset: const Offset(0, -2),
                ),
              ],
            ),
            child: Row(
              children: [
                ClipOval(
                  child: Image.network(
                    'https://i.postimg.cc/tC24nW4N/avt1.jpg',
                    width: 32,
                    height: 32,
                    fit: BoxFit.cover,
                    errorBuilder: (_, __, ___) => Container(
                      width: 32,
                      height: 32,
                      color: AppColors.primaryLight,
                      child: const Icon(Icons.person, color: AppColors.primary, size: 16),
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14),
                    decoration: BoxDecoration(
                      color: const Color(0xFFEFF5F5),
                      borderRadius: BorderRadius.circular(24),
                    ),
                    child: TextField(
                      controller: _commentController,
                      decoration: const InputDecoration(
                        hintText: 'Thêm bình luận...',
                        hintStyle: TextStyle(
                          fontFamily: 'Be Vietnam Pro',
                          fontSize: 13,
                          color: AppColors.textHint,
                        ),
                        border: InputBorder.none,
                        isDense: true,
                        contentPadding: EdgeInsets.symmetric(vertical: 10),
                      ),
                      textInputAction: TextInputAction.send,
                      onSubmitted: (_) => _submitComment(),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                IconButton(
                  onPressed: _submitComment,
                  icon: const Icon(Icons.send_rounded, color: AppColors.primary),
                  visualDensity: VisualDensity.compact,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCommentItem(CommentItem cmt) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        ClipOval(
          child: Image.network(
            cmt.authorAvatar,
            width: 32,
            height: 32,
            fit: BoxFit.cover,
            errorBuilder: (_, __, ___) => Container(
              width: 32,
              height: 32,
              color: AppColors.primaryLight,
              child: const Icon(Icons.person, color: AppColors.primary, size: 16),
            ),
          ),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                decoration: BoxDecoration(
                  color: const Color(0xFFF3F6F6),
                  borderRadius: BorderRadius.circular(14),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      cmt.authorName,
                      style: const TextStyle(
                        fontFamily: 'Be Vietnam Pro',
                        fontSize: 13,
                        fontWeight: FontWeight.w700,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      cmt.content,
                      style: const TextStyle(
                        fontFamily: 'Be Vietnam Pro',
                        fontSize: 13,
                        height: 1.35,
                        color: AppColors.textSecondary,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 4),
              Row(
                children: [
                  const SizedBox(width: 6),
                  Text(
                    cmt.timeAgo,
                    style: const TextStyle(
                      fontFamily: 'Be Vietnam Pro',
                      fontSize: 11,
                      color: AppColors.neutral,
                    ),
                  ),
                  const SizedBox(width: 12),
                  InkWell(
                    onTap: () {
                      setState(() {
                        cmt.isLiked = !cmt.isLiked;
                        cmt.likes += cmt.isLiked ? 1 : -1;
                      });
                    },
                    child: Text(
                      cmt.isLiked ? 'Đã thích' : 'Thích',
                      style: TextStyle(
                        fontFamily: 'Be Vietnam Pro',
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                        color: cmt.isLiked ? const Color(0xFFEF4444) : AppColors.textSecondary,
                      ),
                    ),
                  ),
                  if (cmt.likes > 0) ...[
                    const SizedBox(width: 4),
                    Text(
                      '• ${cmt.likes}',
                      style: const TextStyle(
                        fontFamily: 'Be Vietnam Pro',
                        fontSize: 11,
                        color: AppColors.neutral,
                      ),
                    ),
                  ],
                  const SizedBox(width: 12),
                  InkWell(
                    onTap: () {
                      _commentController.text = '@${cmt.authorName} ';
                      _commentController.selection = TextSelection.fromPosition(
                        TextPosition(offset: _commentController.text.length),
                      );
                    },
                    child: const Text(
                      'Trả lời',
                      style: TextStyle(
                        fontFamily: 'Be Vietnam Pro',
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                        color: AppColors.textSecondary,
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ],
    );
  }
}
