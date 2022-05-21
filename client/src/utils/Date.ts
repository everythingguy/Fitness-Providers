import { WeekDays } from "../@types/enums";
import { Session } from "../@types/Models";

const nonRecurringLiveSessionDateToString = (session: Session) => {
    if (typeof session.liveSession === "object") {
        const beginDateTime = new Date(session.liveSession.beginDateTime);
        const endDateTime = new Date(session.liveSession.endDateTime);
        const date = beginDateTime.toLocaleDateString([], {
            dateStyle: "full"
        });
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
        return `${date}  ${beginTime} - ${endTime} (${timeZone})`;
    } else throw new Error("Session is missing live session object!");
};

const recurringLiveSessionDateToString = (session: Session) => {
    if (typeof session.liveSession === "object") {
        const beginDateTime = new Date(session.liveSession.beginDateTime);
        const endDateTime = new Date(session.liveSession.endDateTime);
        const beginDate = beginDateTime.toLocaleDateString([], {
            dateStyle: "long"
        });
        const endDate = endDateTime.toLocaleDateString([], {
            dateStyle: "long"
        });
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
        const weekDays = session.liveSession.recurring.weekDays
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
        return `${beginDate} - ${endDate}, ${beginTime} - ${endTime} (${timeZone}) [${weekDays}] Every ${session.liveSession.recurring.frequency} week(s)`;
    } else throw new Error("Session is missing live session object!");
};

export const liveSessionDateToString = (session: Session) => {
    if (typeof session.liveSession === "object")
        if (session.liveSession.recurring)
            return recurringLiveSessionDateToString(session);
        else return nonRecurringLiveSessionDateToString(session);
    else throw new Error("Session is missing live session object!");
};
