import 'package:flutter/foundation.dart';
import 'package:smarttrip/models/destination_item.dart';
import 'package:smarttrip/services/api_client.dart';

class FavoriteService extends ChangeNotifier {
  FavoriteService._();
  static final instance = FavoriteService._();

  final Set<String> _favoriteIds = {};
  int get favoriteCount => _favoriteIds.length;

  Future<List<DestinationItem>> getFavorites() async {
    try {
      final res = await ApiClient.instance.get('/favorites');
      if (res is List) {
        _favoriteIds.clear();
        final list = <DestinationItem>[];
        for (final item in res) {
          if (item is Map<String, dynamic> && item['destination'] != null) {
            final dest = DestinationItem.fromJson(item['destination']);
            list.add(dest);
            _favoriteIds.add(dest.id);
          }
        }
        notifyListeners();
        return list;
      }
      return [];
    } catch (_) {
      return [];
    }
  }

  bool isFavorite(String destinationId) {
    return _favoriteIds.contains(destinationId);
  }

  Future<bool> addFavorite(String destinationId) async {
    try {
      final res = await ApiClient.instance.post('/favorites/$destinationId');
      if (res != null) {
        _favoriteIds.add(destinationId);
        notifyListeners();
        return true;
      }
      return false;
    } catch (_) {
      return false;
    }
  }

  Future<bool> removeFavorite(String destinationId) async {
    try {
      final res = await ApiClient.instance.delete('/favorites/$destinationId');
      if (res != null) {
        _favoriteIds.remove(destinationId);
        notifyListeners();
        return true;
      }
      return false;
    } catch (_) {
      return false;
    }
  }

  Future<bool> toggleFavorite(String destinationId) async {
    if (isFavorite(destinationId)) {
      final success = await removeFavorite(destinationId);
      return !success;
    } else {
      final success = await addFavorite(destinationId);
      return success;
    }
  }
}
