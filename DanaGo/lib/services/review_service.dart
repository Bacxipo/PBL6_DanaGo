import 'package:flutter/material.dart';
import 'package:smarttrip/models/review_item.dart';
import 'package:smarttrip/services/api_client.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;

class ReviewService extends ChangeNotifier {
  ReviewService._();
  static final instance = ReviewService._();

  int _myReviewsCount = 0;
  int get myReviewsCount => _myReviewsCount;
  Future<List<ReviewItemModel>> getDestinationReviews(
    String destinationId,
  ) async {
    try {
      final res = await ApiClient.instance.get(
        '/community/reviews/destination/$destinationId',
      );
      if (res is List) {
        return res
            .whereType<Map<String, dynamic>>()
            .map(ReviewItemModel.fromJson)
            .toList();
      }
      return [];
    } catch (_) {
      return [];
    }
  }

  Future<ReviewItemModel?> createReview({
    required String destinationId,
    required int rating,
    required String comment,
    List<String> imagePaths = const [],
  }) async {
    try {
      final token = await ApiClient.instance.token;
      final uri = Uri.parse('${ApiClient.instance.baseUrl}/community/reviews');
      final req = http.MultipartRequest('POST', uri);
      if (token != null) req.headers['Authorization'] = 'Bearer $token';
      req.fields['destinationId'] = destinationId;
      req.fields['rating'] = rating.toString();
      req.fields['comment'] = comment;
      for (final path in imagePaths) {
        req.files.add(await http.MultipartFile.fromPath('images', path));
      }
      final streamed = await req.send();
      final resBody = await streamed.stream.bytesToString();
      if (streamed.statusCode >= 200 && streamed.statusCode < 300) {
        _myReviewsCount++;
        notifyListeners();
        return ReviewItemModel.fromJson(jsonDecode(resBody));
      }
      return null;
    } catch (_) {
      return null;
    }
  }

  Future<List<Map<String, dynamic>>> getMyReviews() async {
    try {
      final res = await ApiClient.instance.get('/community/reviews/my');
      if (res is List) {
        final list = res.whereType<Map<String, dynamic>>().toList();
        _myReviewsCount = list.length;
        notifyListeners();
        return list;
      }
      return [];
    } catch (_) {
      return [];
    }
  }

  Future<bool> updateReview({
    required String reviewId,
    required int rating,
    required String comment,
    required List<String> keptImageUrls,
    List<String> newImagePaths = const [],
  }) async {
    try {
      final token = await ApiClient.instance.token;
      final uri = Uri.parse(
        '${ApiClient.instance.baseUrl}/community/reviews/$reviewId',
      );
      final req = http.MultipartRequest('PUT', uri);
      if (token != null) req.headers['Authorization'] = 'Bearer $token';

      req.fields['rating'] = rating.toString();
      req.fields['comment'] = comment;
      for (int i = 0; i < keptImageUrls.length; i++) {
        req.fields['images[$i]'] = keptImageUrls[i];
      }
      for (final path in newImagePaths) {
        req.files.add(await http.MultipartFile.fromPath('images', path));
      }

      final streamed = await req.send();
      return streamed.statusCode >= 200 && streamed.statusCode < 300;
    } catch (_) {
      return false;
    }
  }

  Future<bool> deleteReview(String reviewId) async {
    try {
      await ApiClient.instance.delete('/community/reviews/$reviewId');
      if (_myReviewsCount > 0) _myReviewsCount--;
      notifyListeners();
      return true;
    } catch (_) {
      return false;
    }
  }
}
