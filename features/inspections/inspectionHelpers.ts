export function formatDate(date: string) {
    return new Date(date).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export function buildInspectionUrl(
    inspection: any,
    mode: 'view' | 'edit',
    fromPage?: string,
) {
    return `/inspection/${inspection.vehicle_id}?trip=${inspection.trip}&inspectionId=${inspection.id}&mode=${mode}&from=${fromPage || 'user-inspections'
        }`;
}