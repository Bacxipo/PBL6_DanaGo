import 'package:flutter/foundation.dart';
import 'package:smarttrip/models/itinerary_model.dart';
import 'package:smarttrip/services/api_client.dart';

class ItineraryService extends ChangeNotifier {
  ItineraryService._();
  static final ItineraryService instance = ItineraryService._();

  int _myItinerariesCount = 0;
  int get myItinerariesCount => _myItinerariesCount;

  void clear() {
    _myItinerariesCount = 0;
    notifyListeners();
  }

  void notifyChanged() => notifyListeners();

  Future<List<Itinerary>> getUserItineraries(int userId) async {
    try {
      final data = await ApiClient.instance.get('/itineraries/user/$userId');
      if (data is List) {
        final list = data
            .whereType<Map<String, dynamic>>()
            .map(Itinerary.fromJson)
            .toList();
        if (_myItinerariesCount != list.length) {
          _myItinerariesCount = list.length;
          notifyListeners();
        }
        return list;
      }
      return [];
    } catch (e) {
      debugPrint('Error getUserItineraries: $e');
      return [];
    }
  }

  Future<Itinerary?> getItineraryById(int id) async {
    try {
      final data = await ApiClient.instance.get('/itineraries/$id');
      if (data is Map<String, dynamic>) {
        return Itinerary.fromJson(data);
      }
      return null;
    } catch (e) {
      debugPrint('Error getItineraryById: $e');
      return null;
    }
  }

  Future<Itinerary?> saveFullItinerary(Map<String, dynamic> payload) async {
    try {
      final data = await ApiClient.instance.post(
        '/itineraries/save-full',
        body: payload,
      );
      if (data is Map<String, dynamic>) {
        final saved = Itinerary.fromJson(data);
        notifyListeners();
        return saved;
      }
      return null;
    } catch (e) {
      debugPrint('Error saveFullItinerary: $e');
      rethrow;
    }
  }

  Future<bool> deleteItinerary(int id) async {
    try {
      await ApiClient.instance.delete('/itineraries/$id');
      if (_myItinerariesCount > 0) _myItinerariesCount--;
      notifyListeners();
      return true;
    } catch (e) {
      debugPrint('Error deleteItinerary: $e');
      return false;
    }
  }

  Future<List<ItineraryChecklistItem>> getChecklistsByItinerary(
    int itineraryId,
  ) async {
    try {
      final data = await ApiClient.instance.get(
        '/itineraries/$itineraryId/checklists',
      );
      if (data is List) {
        return data
            .whereType<Map<String, dynamic>>()
            .map((e) => ItineraryChecklistItem.fromJson(e))
            .toList();
      }
      return [];
    } catch (e) {
      debugPrint('Error getChecklistsByItinerary: $e');
      return [];
    }
  }

  Future<ItineraryChecklistItem?> createChecklistItem(
    int itineraryItemId,
    String itemName, {
    bool isChecked = false,
    String? activityTag,
  }) async {
    try {
      final data = await ApiClient.instance.post(
        '/itineraries/items/$itineraryItemId/checklists',
        body: {'itemName': itemName, 'isChecked': isChecked},
      );
      if (data is Map<String, dynamic>) {
        return ItineraryChecklistItem.fromJson(data, fallbackTag: activityTag);
      }
      return null;
    } catch (e) {
      debugPrint('Error createChecklistItem: $e');
      return null;
    }
  }

  Future<bool> updateChecklistItem(
    int id, {
    String? itemName,
    bool? isChecked,
  }) async {
    try {
      await ApiClient.instance.patch(
        '/itineraries/checklists/$id',
        body: {
          if (itemName != null) 'itemName': itemName,
          if (isChecked != null) 'isChecked': isChecked,
        },
      );
      return true;
    } catch (e) {
      debugPrint('Error updateChecklistItem: $e');
      return false;
    }
  }

  Future<bool> deleteChecklistItem(int id) async {
    try {
      await ApiClient.instance.delete('/itineraries/checklists/$id');
      return true;
    } catch (e) {
      debugPrint('Error deleteChecklistItem: $e');
      return false;
    }
  }
}
