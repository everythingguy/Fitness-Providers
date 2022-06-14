import { WeekDays } from "../@types/enums";
import { LiveSession } from "../@types/Models";

const fullDay = (shortDay: string) => {
    if (shortDay === "Sun") return "Sunday";
    else if (shortDay === "Mon") return "Monday";
    else if (shortDay === "Tue") return "Tuesday";
    else if (shortDay === "Wed") return "Wednesday";
    else if (shortDay === "Thu") return "Thursday";
    else if (shortDay === "Fri") return "Friday";
    else return "Saturday";
};

export const formatDate = (date: string | Date): string => {
    if (typeof date === "string")
        return new Date(date).toLocaleDateString([], {
            dateStyle: "full"
        });
    else
        return date.toLocaleDateString([], {
            dateStyle: "full"
        });
};

export const formatTime = (date: string | Date) => {
    if (typeof date === "string")
        return new Date(date).toLocaleTimeString([], {
            timeStyle: "short"
        });
    else
        return date.toLocaleTimeString([], {
            timeStyle: "short"
        });
};

export const formatDateTime = (date: string | Date) => {
    return `${formatTime(date)} ${formatDate(date)}`;
};

const nonRecurringLiveSessionDateToString = (
    session: LiveSession,
    tz = false
) => {
    return `${formatDate(session.beginDateTime)}  ${liveSessionTimeToString(
        session,
        tz
    )}`;
};

const recurringLiveSessionDateToString = (session: LiveSession, tz = false) => {
    const beginDateTime = new Date(session.beginDateTime);
    const endDateTime = new Date(session.endDateTime);
    const beginDate = beginDateTime.toLocaleDateString([], {
        dateStyle: "long"
    });
    const endDate = endDateTime.toLocaleDateString([], {
        dateStyle: "long"
    });
    const weekDays = session.recurring.weekDays
        .map((day) => {
            if (day === WeekDays.Sunday) return "Sun";
            else if (day === WeekDays.Monday) return "Mon";
            else if (day === WeekDays.Tuesday) return "Tue";
            else if (day === WeekDays.Wednesday) return "Wed";
            else if (day === WeekDays.Thursday) return "Thu";
            else if (day === WeekDays.Friday) return "Fri";
            else return "Sat";
        })
        .join(", ");
    return session.recurring.frequency === 1
        ? session.recurring.weekDays.length === 1
            ? `${beginDate} - ${endDate}, ${liveSessionTimeToString(
                  session,
                  tz
              )} Every ${fullDay(weekDays)}`
            : `${beginDate} - ${endDate}, ${liveSessionTimeToString(
                  session,
                  tz
              )} [${weekDays}] Every week`
        : `${beginDate} - ${endDate}, ${liveSessionTimeToString(
              session,
              tz
          )} [${weekDays}] Every ${session.recurring.frequency} weeks`;
};

export const liveSessionDateToString = (session: LiveSession, tz = false) => {
    if (session.recurring) return recurringLiveSessionDateToString(session, tz);
    else return nonRecurringLiveSessionDateToString(session, tz);
};

export const liveSessionTimeToString = (session: LiveSession, tz = false) => {
    const beginDateTime = new Date(session.beginDateTime);
    const endDateTime = new Date(session.endDateTime);
    const beginTime = formatTime(beginDateTime);
    const endTime = formatTime(endDateTime);

    if (tz) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const timeZone = Intl.DateTimeFormat([], { timeZoneName: "long" })
            .formatToParts(beginDateTime)
            .find((part) => part.type === "timeZoneName")!.value;
        return `${beginTime} - ${endTime} (${timeZone})`;
    } else {
        return `${beginTime} - ${endTime}`;
    }
};
