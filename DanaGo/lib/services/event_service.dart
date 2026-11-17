import 'package:flutter/foundation.dart';
import 'package:smarttrip/models/event_item.dart';
import 'package:smarttrip/services/api_client.dart';

class EventService {
  EventService._();
  static final EventService instance = EventService._();

  Future<List<EventItem>> getEvents() async {
    try {
      final data = await ApiClient.instance.get('/events');
      if (data is List) {
        return data
            .whereType<Map<String, dynamic>>()
            .map(EventItem.fromJson)
            .toList();
      }
      return [];
    } catch (e) {
      debugPrint('Error getEvents: $e');
      return [];
    }
  }

  Future<EventItem?> getEventById(int id) async {
    try {
      final data = await ApiClient.instance.get('/events/$id');
      if (data is Map<String, dynamic>) {
        return EventItem.fromJson(data);
      }
      return null;
    } catch (e) {
      debugPrint('Error getEventById: $e');
      return null;
    }
  }

  Future<bool?> toggleFavorite(int eventId) async {
    try {
      final data = await ApiClient.instance.post('/events/$eventId/favorite');
      if (data is Map<String, dynamic> && data['favorited'] is bool) {
        return data['favorited'] as bool;
      }
      return null;
    } catch (e) {
      debugPrint('Error toggleFavorite event: $e');
      rethrow;
    }
  }
}
