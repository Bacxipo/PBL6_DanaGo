import 'package:latlong2/latlong.dart';
import 'search_result_item.dart';

class MapPlaceItem {
  final LatLng location;
  final SearchResultItem item;

  const MapPlaceItem({required this.location, required this.item});
}
