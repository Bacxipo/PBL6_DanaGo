export function normalizePlaceName(value = '') {
    return String(value ?? '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[đĐ]/g, 'd')
        .toLowerCase()
        .trim()
        .replace(/\s+/g, ' ');
}

export function searchPlaces(places, searchTerm = '') {
    const query = normalizePlaceName(searchTerm);
    return places.filter((place) => !query || normalizePlaceName(place.name).includes(query));
}

