// L_Photos is stored as a JSON string, but the data isn't always valid —
// some rows are empty strings, null, or malformed. We parse inside a try/catch
// and always return an array so callers never crash on bad data.
export function parsePhotos(rawPhotos) {
    if (!rawPhotos) return [];
    try {
        const parsed = JSON.parse(rawPhotos);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}