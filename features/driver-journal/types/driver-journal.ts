export type RestType = 'daily' | 'weekly';

export type Shift = {
    id: string;
    date: string;
    start: string;
    driving: number;
    shift: number;
    break: number;
    rest: number;
    restType: RestType;
    end: string;
    endDate: string;
    earn: number;
};

export type DurationInput = {
    hours: number;
    minutes: number;
};

export type ShiftFormData = {
    date: string;
    start: string;
    driving: DurationInput;
    break: DurationInput;
    restType: RestType;
    end: string;
    endDate: string;
    earn: number;
};

export type JournalTotals = {
    driving: number;
    shift: number;
    break: number;
    rest: number;
    working: number;
    earn: number;
};
