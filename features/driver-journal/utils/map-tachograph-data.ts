import type { Database } from '@/types/supabase/database';
import type { RestType, Shift } from '@/features/driver-journal/types/driver-journal';
import { calculateShiftMinutes } from '@/features/driver-journal/utils/shifts';

type DriverJournalShiftRow =
    Database['public']['Tables']['driver_journal_shifts']['Row'];

export function mapTachographShifts(
    rows: DriverJournalShiftRow[],
): Shift[] {
    return rows.map((row) => {
        const shift: Shift = {
            id: row.id,
            date: row.date,
            start: row.start,
            driving: row.driving,
            shift: 0,
            break: row.break,
            rest: row.rest,
            restType: row.rest_type as RestType,
            end: row.end,
            endDate: row.end_date,
            earn: row.earn,
        };

        return {
            ...shift,
            shift: calculateShiftMinutes(shift),
        };
    });
}