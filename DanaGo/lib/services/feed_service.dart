import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:http_parser/http_parser.dart';
import 'package:smarttrip/models/feed_post_model.dart';
import 'package:smarttrip/services/api_client.dart';

class FeedService {
  FeedService._();
  static final instance = FeedService._();

  Future<List<FeedPostModel>> getPosts() async {
    try {
      final res = await ApiClient.instance.get('/feed/posts');
      if (res is List) {
        return res
            .whereType<Map<String, dynamic>>()
            .map(FeedPostModel.fromJson)
            .toList();
      }
      return [];
    } catch (_) {
      return [];
    }
  }

  Future<List<FeedPostModel>> getMyPosts() async {
    try {
      final res = await ApiClient.instance.get('/feed/posts/mine');
      if (res is List) {
        return res
            .whereType<Map<String, dynamic>>()
            .map(FeedPostModel.fromJson)
            .toList();
      }
      return [];
    } catch (_) {
      return [];
    }
  }

  Future<FeedPostModel?> getPostById(int postId) async {
    try {
      final res = await ApiClient.instance.get('/feed/posts/$postId');
      if (res is Map<String, dynamic>) {
        return FeedPostModel.fromJson(res);
      }
      return null;
    } catch (_) {
      return null;
    }
  }

  Future<bool?> toggleLike(String postId) async {
    try {
      final res = await ApiClient.instance.post('/feed/posts/$postId/like');
      if (res is Map<String, dynamic>) return res['liked'] as bool?;
      return null;
    } catch (_) {
      return null;
    }
  }

  Future<List<CommentItem>> getComments(String postId) async {
    try {
      final res = await ApiClient.instance.get('/feed/posts/$postId/comments');
      if (res is List) {
        return res
            .whereType<Map<String, dynamic>>()
            .map(CommentItem.fromJson)
            .toList();
      }
      return [];
    } catch (_) {
      return [];
    }
  }

  Future<CommentItem?> addComment(
    String postId,
    String content, {
    int? replyToUserId,
  }) async {
    try {
      final res = await ApiClient.instance.post(
        '/feed/posts/$postId/comments',
        body: {
          'content': content,
          if (replyToUserId != null) 'replyToUserId': replyToUserId,
        },
      );
      if (res is Map<String, dynamic>) return CommentItem.fromJson(res);
      return null;
    } catch (_) {
      return null;
    }
  }

  Future<FeedPostModel?> updatePost(String postId, String content) async {
    try {
      final res = await ApiClient.instance.patch(
        '/feed/posts/$postId',
        body: {'content': content.trim()},
      );
      if (res is Map<String, dynamic>) {
        return FeedPostModel.fromJson(res);
      }
      return null;
    } catch (_) {
      return null;
    }
  }

  Future<bool> deletePost(String postId) async {
    try {
      final res = await ApiClient.instance.delete('/feed/posts/$postId');
      return res != null;
    } catch (_) {
      return false;
    }
  }

  Future<FeedPostModel?> createPost({
    required String content,
    int? destinationId,
    List<String> imagePaths = const [],
    String? postType,
    Map<String, dynamic>? proposal,
  }) async {
    try {
      final token = await ApiClient.instance.token;
      final uri = Uri.parse('${ApiClient.instance.baseUrl}/feed/posts');
      final req = http.MultipartRequest('POST', uri);
      if (token != null) req.headers['Authorization'] = 'Bearer $token';

      final Map<String, dynamic> data = {
        'content': content,
        if (destinationId != null) 'destinationId': destinationId,
        if (postType != null) 'postType': postType,
        if (proposal != null) 'proposal': proposal,
      };

      req.fields['data'] = jsonEncode(data);

      for (final path in imagePaths) {
        final ext = path.split('.').last.toLowerCase();
        final subType = (ext == 'png')
            ? 'png'
            : (ext == 'webp' ? 'webp' : 'jpeg');
        req.files.add(
          await http.MultipartFile.fromPath(
            'files',
            path,
            contentType: MediaType('image', subType),
          ),
        );
      }
      final streamed = await req.send();
      final bodyStr = await streamed.stream.bytesToString();
      print('LỖI ĐĂNG BÀI: ${streamed.statusCode} - $bodyStr');
      if (streamed.statusCode >= 200 && streamed.statusCode < 300) {
        return FeedPostModel.fromJson(jsonDecode(bodyStr));
      }
      return null;
    } catch (_) {
      return null;
    }
  }
}
