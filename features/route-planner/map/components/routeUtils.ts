export type Point = {
    lat: number;
    lng: number;
};

export function buildGoogleRoute(points: Point[], fallback?: Point | null) {
    const all = points.length ? points : fallback ? [fallback] : [];

    if (!all.length) return '';

    if (all.length === 1) {
        const p = all[0];
        return `https://www.google.com/maps?q=${p.lat},${p.lng}`;
    }

    return `https://www.google.com/maps/dir/${all
        .map((p) => `${p.lat},${p.lng}`)
        .join('/')}`;
}