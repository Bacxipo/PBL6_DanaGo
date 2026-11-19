import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:smarttrip/models/feed_post_model.dart';
import 'package:smarttrip/services/feed_service.dart';
import 'package:smarttrip/theme/app_colors.dart';

class FeedCommentSheet extends StatefulWidget {
  final FeedPostModel post;
  final Function(CommentItem newComment)? onCommentAdded;

  const FeedCommentSheet({super.key, required this.post, this.onCommentAdded});

  static Future<void> show(
    BuildContext context, {
    required FeedPostModel post,
    Function(CommentItem)? onCommentAdded,
  }) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) =>
          FeedCommentSheet(post: post, onCommentAdded: onCommentAdded),
    );
  }

  @override
  State<FeedCommentSheet> createState() => _FeedCommentSheetState();
}

class _FeedCommentSheetState extends State<FeedCommentSheet> {
  final TextEditingController _commentController = TextEditingController();
  final FocusNode _focusNode = FocusNode();
  List<CommentItem> _comments = [];
  int? _replyToUserId;
  String? _replyToUserName;
  bool _isSubmitting = false;

  @override
  void initState() {
    super.initState();
    _loadComments();
  }

  @override
  void dispose() {
    _commentController.dispose();
    _focusNode.dispose();
    super.dispose();
  }

  Future<void> _loadComments() async {
    final data = await FeedService.instance.getComments(widget.post.id);
    if (mounted) setState(() => _comments = data);
  }

  void _startReply(CommentItem cmt) {
    setState(() {
      _replyToUserId = cmt.authorId;
      _replyToUserName = cmt.authorName;
    });
    final prefix = '@${cmt.authorName} ';
    final current = _commentController.text;
    if (!current.startsWith(prefix)) {
      _commentController.text = prefix;
      _commentController.selection = TextSelection.fromPosition(
        TextPosition(offset: _commentController.text.length),
      );
    }
    _focusNode.requestFocus();
  }

  void _cancelReply() {
    setState(() {
      _replyToUserId = null;
      _replyToUserName = null;
    });
  }

  void _submitComment() async {
    if (_isSubmitting) return;
    final text = _commentController.text.trim();
    if (text.isEmpty) return;

    final replyTargetId = _replyToUserId;
    setState(() {
      _isSubmitting = true;
      _replyToUserId = null;
      _replyToUserName = null;
    });
    _commentController.clear();
    FocusScope.of(context).unfocus();

    final created = await FeedService.instance.addComment(
      widget.post.id,
      text,
      replyToUserId: replyTargetId,
    );
    if (!mounted) return;
    setState(() => _isSubmitting = false);
    if (created != null) {
      setState(() {
        _comments.add(created);
        widget.post.commentsCount = _comments.length;
      });
      widget.onCommentAdded?.call(created);
    }
  }

  @override
  Widget build(BuildContext context) {
    final bottomInset = MediaQuery.of(context).viewInsets.bottom;
    final safeBottom = MediaQuery.viewPaddingOf(context).bottom;
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      constraints: BoxConstraints(
        maxHeight: MediaQuery.of(context).size.height * 0.82,
      ),
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: Column(
        children: [
          Center(
            child: Container(
              margin: const EdgeInsets.only(top: 10, bottom: 6),
              width: 36,
              height: 4,
              decoration: BoxDecoration(
                color: isDark ? Colors.white24 : Colors.grey.shade300,
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
                  style: TextStyle(
                    fontFamily: 'Be Vietnam Pro',
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                    color: isDark ? Colors.white : AppColors.textPrimary,
                  ),
                ),
                const Spacer(),
                IconButton(
                  icon: Icon(
                    Icons.close_rounded,
                    size: 20,
                    color: isDark ? Colors.white70 : Colors.black87,
                  ),
                  onPressed: () => Navigator.pop(context),
                  visualDensity: VisualDensity.compact,
                ),
              ],
            ),
          ),
          Divider(
            height: 1,
            thickness: 1,
            color: isDark ? Colors.white12 : AppColors.divider,
          ),
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
                    padding: const EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 12,
                    ),
                    itemCount: _comments.length,
                    separatorBuilder: (context, index) =>
                        const SizedBox(height: 16),
                    itemBuilder: (context, index) {
                      final cmt = _comments[index];
                      return _buildCommentItem(cmt, isDark);
                    },
                  ),
          ),
          // Input field area with reply indicator & keyboard/nav-bar safe insets
          Container(
            padding: EdgeInsets.only(
              left: 16,
              right: 16,
              top: _replyToUserName != null ? 8 : 10,
              bottom: (bottomInset > 0 ? bottomInset : safeBottom) + 12,
            ),
            decoration: BoxDecoration(
              color: Theme.of(context).cardColor,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: isDark ? 0.2 : 0.04),
                  blurRadius: 8,
                  offset: const Offset(0, -2),
                ),
              ],
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                if (_replyToUserName != null)
                  Padding(
                    padding: const EdgeInsets.only(bottom: 8),
                    child: Row(
                      children: [
                        Icon(
                          Icons.reply_rounded,
                          size: 15,
                          color: AppColors.primary,
                        ),
                        const SizedBox(width: 6),
                        Expanded(
                          child: Text(
                            'Đang trả lời $_replyToUserName',
                            style: TextStyle(
                              fontFamily: 'Be Vietnam Pro',
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                              color: AppColors.primary,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        GestureDetector(
                          onTap: _cancelReply,
                          child: Padding(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 4,
                              vertical: 2,
                            ),
                            child: Icon(
                              Icons.close_rounded,
                              size: 16,
                              color: isDark
                                  ? Colors.white60
                                  : AppColors.textSecondary,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                Row(
                  children: [
                    ClipOval(
                      child: SvgPicture.asset(
                        'assets/images/default-avatar.svg',
                        width: 32,
                        height: 32,
                        fit: BoxFit.cover,
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 14),
                        decoration: BoxDecoration(
                          color: isDark
                              ? const Color(0xFF0F172A)
                              : const Color(0xFFEFF5F5),
                          borderRadius: BorderRadius.circular(24),
                        ),
                        child: TextField(
                          controller: _commentController,
                          focusNode: _focusNode,
                          style: TextStyle(
                            color: isDark ? Colors.white : AppColors.textPrimary,
                            fontSize: 13,
                          ),
                          decoration: InputDecoration(
                            hintText: _replyToUserName != null
                                ? 'Trả lời $_replyToUserName...'
                                : 'Thêm bình luận...',
                            hintStyle: const TextStyle(
                              fontFamily: 'Be Vietnam Pro',
                              fontSize: 13,
                              color: AppColors.textHint,
                            ),
                            border: InputBorder.none,
                            isDense: true,
                            contentPadding:
                                const EdgeInsets.symmetric(vertical: 10),
                          ),
                          textInputAction: TextInputAction.send,
                          onSubmitted: (_) => _submitComment(),
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    IconButton(
                      onPressed: _isSubmitting ? null : _submitComment,
                      icon: _isSubmitting
                          ? const SizedBox(
                              width: 18,
                              height: 18,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                color: AppColors.primary,
                              ),
                            )
                          : const Icon(
                              Icons.send_rounded,
                              color: AppColors.primary,
                            ),
                      visualDensity: VisualDensity.compact,
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCommentItem(CommentItem cmt, bool isDark) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        ClipOval(
          child: cmt.authorAvatar.endsWith('.svg')
              ? SvgPicture.asset(
                  cmt.authorAvatar,
                  width: 40,
                  height: 40,
                  fit: BoxFit.cover,
                )
              : Image.network(
                  cmt.authorAvatar,
                  width: 40,
                  height: 40,
                  cacheWidth: 96,
                  fit: BoxFit.cover,
                  errorBuilder: (_, _, _) => SvgPicture.asset(
                    'assets/images/default-avatar.svg',
                    width: 40,
                    height: 40,
                    fit: BoxFit.cover,
                  ),
                ),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 12,
                  vertical: 8,
                ),
                decoration: BoxDecoration(
                  color: isDark
                      ? const Color(0xFF0F172A)
                      : const Color(0xFFF3F6F6),
                  borderRadius: BorderRadius.circular(14),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      cmt.authorName,
                      style: TextStyle(
                        fontFamily: 'Be Vietnam Pro',
                        fontSize: 13,
                        fontWeight: FontWeight.w700,
                        color: isDark ? Colors.white : AppColors.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      cmt.content,
                      style: TextStyle(
                        fontFamily: 'Be Vietnam Pro',
                        fontSize: 13,
                        height: 1.35,
                        color: isDark
                            ? Colors.white70
                            : AppColors.textSecondary,
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
                  const SizedBox(width: 14),
                  InkWell(
                    onTap: () => _startReply(cmt),
                    borderRadius: BorderRadius.circular(6),
                    child: Padding(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 4,
                        vertical: 2,
                      ),
                      child: Text(
                        'Trả lời',
                        style: TextStyle(
                          fontFamily: 'Be Vietnam Pro',
                          fontSize: 11.5,
                          fontWeight: FontWeight.w600,
                          color: isDark
                              ? Colors.white70
                              : AppColors.textSecondary,
                        ),
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
