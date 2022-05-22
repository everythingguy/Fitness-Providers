import { WeekDays } from "../@types/enums";

/**
 * @description Get a enum representation of the day a date takes place
 */
export function getDay(date: Date) {
    const dayNum = date.getDay();

    if (dayNum === 0) return WeekDays.Sunday;
    if (dayNum === 1) return WeekDays.Monday;
    if (dayNum === 2) return WeekDays.Tuesday;
    if (dayNum === 3) return WeekDays.Wednesday;
    if (dayNum === 4) return WeekDays.Thursday;
    if (dayNum === 5) return WeekDays.Friday;

    return WeekDays.Saturday;
}

/**
 * @description Convert day enum to number
 */
export function getDayNum(day: WeekDays, offset = 0) {
    if (day === WeekDays.Sunday) return 0 + offset;
    if (day === WeekDays.Monday) return 1 + offset;
    if (day === WeekDays.Tuesday) return 2 + offset;
    if (day === WeekDays.Wednesday) return 3 + offset;
    if (day === WeekDays.Thursday) return 4 + offset;
    if (day === WeekDays.Friday) return 5 + offset;

    return 6 + offset;
}

/**
 * @description Adds days to a date
 */
export function addDays(date: Date, days: number) {
    const newDate = new Date(date);
    newDate.setDate(date.getDate() + days);
    return newDate;
}

/**
 * @description Gets the number of days between two days of the week
 */
export function numberOfDaysBetween(day1: WeekDays, day2: WeekDays) {
    const num = getDayNum(day2) - getDayNum(day1);

    if (num < 0) return num + 7;
    return num;
}
/**
 * @description Checks a date to see if it falls on a recurring date
 */
/* import moment from "moment";
   import "moment-recur-ts";
   
export function dateWithinRecurrence(
    beginDate: Date,
    weekDays: WeekDays[],
    date: Date,
    frequency = 1
) {
    return moment(beginDate)
        .recur()
        .every(weekDays)
        .daysOfWeek()
        .every(frequency)
        .weeks()
        .matches(date);
}
*/
