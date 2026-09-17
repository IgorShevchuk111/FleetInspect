export type Shift = {
    id: string;
    date: string;
    start: string;
    driving: number;
    shift: number;
    break: number;
    end: string;
};

export type DurationInput = {
    hours: number;
    minutes: number;
};

export type ShiftFormData = {
    date: string;
    start: string;
    driving: DurationInput;
    shift: DurationInput;
    break: DurationInput;
    end: string;
};

export type JournalTotals = {
    driving: number;
    shift: number;
    break: number;
};