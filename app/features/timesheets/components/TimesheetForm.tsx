'use client';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { format, startOfWeek, addDays, subDays } from 'date-fns';
import { useState, useEffect } from 'react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const tableHeaders = [
  'Day',
  'Date',
  // 'Vehicle Reg',
  // 'Vehicle Class',
  // 'Start Time',
  // 'Break',
  // 'Finish Time',
  // 'Expenses',
  // 'Manager Sign',
  'Paid Hours',
  'Notes',
];

const DayEntrySchema = z
  .object({
    date: z.string().optional(),
    vehicleReg: z.string().optional(),
    vehicleClass: z.string().optional(),
    startTime: z.string().optional(),
    breakTime: z.string().optional(),
    finishTime: z.string().optional(),
    expenses: z.string().optional(),
    managerSign: z.string().optional(),
    paidHours: z.string().optional(),
    actions: z.string().optional(),
  })
  .refine(
    (data) => {
      const anyFilled =
        data.startTime || data.finishTime || data.date || data.vehicleReg;
      const allFilled =
        data.date &&
        data.vehicleReg &&
        data.vehicleClass &&
        data.startTime &&
        data.breakTime &&
        data.finishTime &&
        data.paidHours;
      return !anyFilled || allFilled;
    },
    {
      message: 'If one field is filled, all required fields must be filled.',
      path: ['date'],
    }
  );

const TimesheetSchema = z.object({
  agencyName: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  days: z.array(DayEntrySchema),
});

const getWeekDates = (startOfWeekDate) => {
  const startOfCurrentWeek = startOfWeek(startOfWeekDate, { weekStartsOn: 0 }); // Start on Sunday
  return dayNames.map((_, index) => {
    const day = addDays(startOfCurrentWeek, index);
    return format(day, 'dd.MM.yyyy'); // Include year
  });
};
export default function TimesheetForm() {
  const [selectedWeekStart, setSelectedWeekStart] = useState(new Date());
  const [weekDates, setWeekDates] = useState(() => getWeekDates(new Date()));

  useEffect(() => {
    // Update week dates when the selectedWeekStart changes
    const newDates = getWeekDates(selectedWeekStart);
    setWeekDates(newDates);
  }, [selectedWeekStart]);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    getValues,
  } = useForm({
    resolver: zodResolver(TimesheetSchema),
    defaultValues: {
      agencyName: '',
      firstName: '',
      lastName: '',
      days: dayNames.map((_, index) => ({
        date: '',
        vehicleReg: '',
        vehicleClass: '',
        startTime: '',
        breakTime: '',
        finishTime: '',
        expenses: '',
        managerSign: '',
        paidHours: '',
        actions: '',
      })),
    },
  });

  // Update form values when weekDates changes
  useEffect(() => {
    const currentValues = getValues();
    reset({
      ...currentValues,
      days: dayNames.map((_, index) => ({
        ...currentValues.days[index],
        date: weekDates[index] || '',
      })),
    });
  }, [weekDates, reset, getValues]);

  const onSubmit = (data) => {};

  const handlePreviousWeek = () => {
    setSelectedWeekStart((prev) => {
      const newStart = subDays(startOfWeek(prev), 7);
      reset({
        ...getValues(),
        days: dayNames.map((_, index) => ({
          ...getValues().days[index],
          date: getWeekDates(newStart)[index],
        })),
      });
      return newStart;
    });
  };

  const handleNextWeek = () => {
    setSelectedWeekStart((prev) => {
      const newStart = addDays(startOfWeek(prev), 7);
      reset({
        ...getValues(),
        days: dayNames.map((_, index) => ({
          ...getValues().days[index],
          date: getWeekDates(newStart)[index],
        })),
      });
      return newStart;
    });
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
      {/* Employee Information Card */}
      <div className="dark:bg-muted/50 rounded-lg p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-foreground dark:text-white mb-3 sm:mb-4">
          Employee Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <div>
            <label
              htmlFor="firstName"
              className="block text-xs sm:text-sm font-medium text-secondary-foreground dark:text-muted-foreground mb-1 sm:mb-2"
            >
              First Name
            </label>
            <Input
              id="firstName"
              placeholder="Enter first name"
              {...register('firstName')}
              className="w-full text-sm"
            />
            {errors.firstName && (
              <p className="text-red-500 text-xs sm:text-sm mt-1">
                {errors.firstName.message}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="lastName"
              className="block text-xs sm:text-sm font-medium text-secondary-foreground dark:text-muted-foreground mb-1 sm:mb-2"
            >
              Last Name
            </label>
            <Input
              id="lastName"
              placeholder="Enter last name"
              {...register('lastName')}
              className="w-full text-sm"
            />
            {errors.lastName && (
              <p className="text-red-500 text-xs sm:text-sm mt-1">
                {errors.lastName.message}
              </p>
            )}
          </div>
          <div className="sm:col-span-2 lg:col-span-1">
            <label
              htmlFor="agencyName"
              className="block text-xs sm:text-sm font-medium text-secondary-foreground dark:text-muted-foreground mb-1 sm:mb-2"
            >
              Agency Name
            </label>
            <Input
              id="agencyName"
              placeholder="Enter agency name"
              {...register('agencyName')}
              className="w-full text-sm"
            />
            {errors.agencyName && (
              <p className="text-red-500 text-xs sm:text-sm mt-1">
                {errors.agencyName.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Week Navigation */}
      <div className=" dark:bg-muted/50 rounded-lg p-3 sm:p-4">
        <div className="flex items-center justify-between gap-2 sm:gap-3">
          <Button
            type="button"
            onClick={handlePreviousWeek}
            variant="outline"
            className="flex items-center gap-1 border-blue-200 hover:border-blue-300 hover:bg-blue-50 dark:border-blue-700 dark:hover:border-blue-600 dark:hover:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs px-2 sm:px-3 py-2"
          >
            ← Prev
          </Button>

          <div className="text-center flex-1">
            <h3 className="text-xs font-semibold text-foreground dark:text-white leading-tight">
              {format(startOfWeek(selectedWeekStart), 'dd.MM')} -{' '}
              {format(addDays(startOfWeek(selectedWeekStart), 6), 'dd.MM')}
            </h3>
            <p className="text-xs text-muted-foreground dark:text-muted-foreground">
              {format(selectedWeekStart, 'yyyy')} • Week{' '}
              {format(selectedWeekStart, 'w')}
            </p>
          </div>

          <Button
            type="button"
            onClick={handleNextWeek}
            variant="outline"
            className="flex items-center gap-1 border-blue-200 hover:border-blue-300 hover:bg-blue-50 dark:border-blue-700 dark:hover:border-blue-600 dark:hover:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs px-2 sm:px-3 py-2"
          >
            Next →
          </Button>
        </div>
      </div>

      {/* Timesheet Table */}
      <div className="bg-white dark:bg-card rounded-lg border border-border dark:border-border overflow-hidden">
        <div className="overflow-x-auto min-w-full">
          <Table className="w-full">
            <TableHeader>
              <TableRow className="bg-[#f8faff] dark:bg-muted">
                {tableHeaders.map((header) => (
                  <TableHead
                    key={header}
                    className="font-semibold text-foreground dark:text-white whitespace-nowrap px-1 py-2 text-xs"
                  >
                    {header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {dayNames.map((day, index) => (
                <TableRow
                  key={day}
                  className="hover:bg-[#f8faff] dark:hover:bg-muted/50"
                >
                  <TableCell
                    className="font-medium text-foreground dark:text-white whitespace-nowrap px-1 py-2 text-xs"
                    style={{ width: '10%' }}
                  >
                    {day}
                  </TableCell>
                  <TableCell className="px-1 py-2" style={{ width: '30%' }}>
                    <label htmlFor={`date-${index}`} className="sr-only">
                      Date for {day}
                    </label>
                    <Input
                      id={`date-${index}`}
                      {...register(`days.${index}.date`)}
                      value={weekDates[index]}
                      readOnly
                      className="bg-[#f0f4ff] dark:bg-primary text-primary dark:text-muted-foreground text-xs w-full"
                    />
                  </TableCell>
                  <TableCell className="px-1 py-2" style={{ width: '20%' }}>
                    <label htmlFor={`hours-${index}`} className="sr-only">
                      Paid hours for {day}
                    </label>
                    <Input
                      id={`hours-${index}`}
                      {...register(`days.${index}.paidHours`)}
                      placeholder="8.5"
                      className="w-full text-xs"
                    />
                  </TableCell>
                  <TableCell className="px-1 py-2" style={{ width: '40%' }}>
                    <label htmlFor={`notes-${index}`} className="sr-only">
                      Notes for {day}
                    </label>
                    <Input
                      id={`notes-${index}`}
                      {...register(`days.${index}.actions`)}
                      placeholder="Notes"
                      className="w-full text-xs"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-center sm:justify-end">
        <Button
          type="submit"
          className="w-full sm:w-auto px-6 sm:px-8 py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-200 transform hover:-translate-y-0.5 text-sm sm:text-base"
        >
          Submit Timesheet
        </Button>
      </div>
    </form>
  );
}
