export function parsePhotos(rawPhotos) {
    if (!rawPhotos) return [];
    try {
        const parsed = JSON.parse(rawPhotos);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}