export function getStartOfWeek(date: Date): Date {
    const result = new Date(date);

    result.setHours(0, 0, 0, 0);

    const day = result.getDay();
    const diff = day === 0 ? -6 : 1 - day;

    result.setDate(result.getDate() + diff);

    return result;
}

export function getEndOfWeek(date: Date): Date {
    const result = getStartOfWeek(date);

    result.setDate(result.getDate() + 6);
    result.setHours(23, 59, 59, 999);

    return result;
}

export function formatWeek(date: Date): string {
    return `${formatDate(getStartOfWeek(date))} – ${formatDate(
        getEndOfWeek(date),
    )}`;
}

function formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(date);
}

export function parseDateTime(
    date: string,
    time: string,
    endDate?: string,
): Date {
    const actualDate = endDate || date;

    if (!actualDate || !time) {
        return new Date(NaN);
    }

    const [year, month, day] = actualDate.split('-').map(Number);
    const [hours, minutes] = time.split(':').map(Number);

    if (
        !Number.isFinite(year) ||
        !Number.isFinite(month) ||
        !Number.isFinite(day) ||
        !Number.isFinite(hours) ||
        !Number.isFinite(minutes)
    ) {
        return new Date(NaN);
    }

    return new Date(
        year,
        month - 1,
        day,
        hours,
        minutes,
    );
}