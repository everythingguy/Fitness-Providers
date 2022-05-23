import { WeekDays } from "../@types/enums";
import { LiveSession } from "../@types/Models";

const nonRecurringLiveSessionDateToString = (session: LiveSession) => {
    const beginDateTime = new Date(session.beginDateTime);
    const date = beginDateTime.toLocaleDateString([], {
        dateStyle: "full"
    });
    return `${date}  ${liveSessionTimeToString(session)}`;
};

const recurringLiveSessionDateToString = (session: LiveSession) => {
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
    return `${beginDate} - ${endDate}, ${liveSessionTimeToString(
        session
    )} [${weekDays}] Every ${session.recurring.frequency} week(s)`;
};

export const liveSessionDateToString = (session: LiveSession) => {
    if (session.recurring) return recurringLiveSessionDateToString(session);
    else return nonRecurringLiveSessionDateToString(session);
};

export const liveSessionTimeToString = (session: LiveSession) => {
    const beginDateTime = new Date(session.beginDateTime);
    const endDateTime = new Date(session.endDateTime);
    const beginTime = beginDateTime.toLocaleTimeString([], {
        timeStyle: "short"
    });
    const endTime = endDateTime.toLocaleTimeString([], {
        timeStyle: "short"
    });
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const timeZone = Intl.DateTimeFormat([], { timeZoneName: "long" })
        .formatToParts(beginDateTime)
        .find((part) => part.type === "timeZoneName")!.value;
    return `${beginTime} - ${endTime} (${timeZone})`;
};
