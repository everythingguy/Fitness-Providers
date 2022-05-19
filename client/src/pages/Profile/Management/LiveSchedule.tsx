import React from "react";
import moment from "moment";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import rrulePlugin from "@fullcalendar/rrule";

import { Session } from "../../../@types/Models";
import { WeekDays } from "../../../@types/enums";

interface Props {
  liveSessions: Session[];
}

export const LiveSchedule: React.FC<Props> = ({ liveSessions }) => {
  return (
    <div className="p-3 rounded" style={{ backgroundColor: "white" }}>
      <FullCalendar
        plugins={[timeGridPlugin, rrulePlugin]}
        initialView="timeGridWeek"
        allDaySlot={false}
        eventColor="#664479"
        events={
          liveSessions.map((session) => {
            if (
              typeof session === "object" &&
              typeof session.course === "object" &&
              typeof session.liveSession === "object"
            )
              return {
                id: session._id,
                title: session.course.name,
                start: !session.liveSession.recurring
                  ? session.liveSession.beginDateTime
                  : undefined,
                end: !session.liveSession.recurring
                  ? session.liveSession.endDateTime
                  : undefined,

                rrule: session.liveSession.recurring
                  ? {
                      freq: "weekly",
                      interval: session.liveSession.recurring.frequency,
                      byweekday: session.liveSession.recurring.weekDays.map(
                        (day) => {
                          if (day === WeekDays.Sunday) return "su";
                          else if (day === WeekDays.Monday) return "mo";
                          else if (day === WeekDays.Tuesday) return "tu";
                          else if (day === WeekDays.Wednesday) return "we";
                          else if (day === WeekDays.Thursday) return "th";
                          else if (day === WeekDays.Friday) return "fr";
                          else return "sa";
                        }
                      ),
                      dtstart: session.liveSession.beginDateTime,
                      until: session.liveSession.endDateTime,
                    }
                  : undefined,
                duration: session.liveSession.recurring
                  ? moment(
                      moment(session.liveSession.endDateTime).format(
                        "HH:mm:ss"
                      ),
                      "HH:mm:ss"
                    ).diff(
                      moment(
                        moment(session.liveSession.beginDateTime).format(
                          "HH:mm:ss"
                        ),
                        "HH:mm:ss"
                      )
                    )
                  : undefined,
              };
            else return undefined;
          }) as any
        }
      />
    </div>
  );
};

export default LiveSchedule;
