import React, { useEffect, useState } from "react";
import ReactCalendar from "react-calendar";
import ResultList from "../../components/ResultList";

import "react-calendar/dist/Calendar.css";
import { LiveSession } from "../../API/LiveSession";
import { LiveSession as LiveSessionType } from "../../@types/Models";

interface Props {}

// TODO:

export const Calendar: React.FC<Props> = () => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [liveSessions, setLiveSessions] = useState<LiveSessionType[]>([]);
    const [page, setPage] = useState(1);

    useEffect(() => {
        LiveSession.getLiveSessions().then((resp) => {
            if (resp.success) {
                setLiveSessions(resp.data.liveSessions);
            }
        });
    }, [selectedDate]);

    return (
        <>
            <div className="row mb-3">
                <div
                    className="col-12"
                    style={{ height: "22rem", width: "100vw" }}
                >
                    <ReactCalendar
                        className="m-auto w-100 h-100"
                        minDetail="year"
                        prev2Label={null}
                        next2Label={null}
                        calendarType="US"
                        selectRange={false}
                        onChange={(date) => setSelectedDate(date)}
                        value={selectedDate}
                    ></ReactCalendar>
                </div>
            </div>
            <div className="row">
                <div
                    className="col-12"
                    style={{ height: "22rem", width: "100vw" }}
                >
                    <ResultList
                        title="Live Sessions"
                        items={liveSessions.map((s) => ({
                            _id: s._id,
                            title: s.session.name,
                            href:
                                s.session.URL ||
                                `/course/${s.session.course._id}`,
                            image:
                                s.session.course.image ||
                                "https://via.placeholder.com/500x500"
                        }))}
                    />
                </div>
            </div>
        </>
    );
};

export default Calendar;
