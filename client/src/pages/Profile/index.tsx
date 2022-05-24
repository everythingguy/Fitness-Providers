import React, { useState, useEffect } from "react";
import { Link, useMatch } from "react-router-dom";
import Error404 from "../ErrorPages/404";
import Provider from "../../API/Provider";
import Course from "../../API/Course";
import LiveSession from "../../API/LiveSession";
import {
    Provider as ProviderType,
    Course as CourseType,
    LiveSession as LiveSessionType
} from "../../@types/Models";
import Loading from "../../components/Loading";
import { formatPhoneNumber } from "./../../utils/format";
import { ResultList } from "../../components";
import ReactCalendar from "react-calendar";
import { liveSessionTimeToString } from "../../utils/Date";
import { liveSessionDateToString } from "./../../utils/Date";

interface Props {}

// TODO: pagination and ability to edit
// for some reason tag filtering by provider is not working

export const Profile: React.FC<Props> = () => {
    const match = useMatch("/provider/profile/:id");
    const providerID = match ? match.params.id : null;

    const [providerData, setProviderData] = useState<
        ProviderType | null | false
    >(null);
    const [courseData, setCourseData] = useState<CourseType[]>([]);
    const [liveSessionData, setLiveSessionData] = useState<LiveSessionType[]>(
        []
    );

    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    useEffect(() => {
        if (providerID) {
            Provider.getProvider(providerID).then((resp) => {
                if (resp.success) setProviderData(resp.data.provider);
                else setProviderData(false);
            });

            // TODO: pagination
            Course.getProvidersCourses(providerID).then((resp) => {
                if (resp.success) setCourseData(resp.data.courses);
            });
        }
    }, []);

    useEffect(() => {
        // TODO: pagination
        if (providerID)
            LiveSession.getProviderLiveSessions(providerID, {
                day: selectedDate ? selectedDate.toISOString() : undefined
            }).then((resp) => {
                if (resp.success) setLiveSessionData(resp.data.liveSessions);
            });
    }, [selectedDate]);

    if (!providerID || providerData === false) return <Error404 />;
    if (providerData === null) return <Loading />;

    return (
        <>
            <div className="row">
                <div className="col-lg-6 col-md-12 text-center">
                    <img
                        className="mx-auto"
                        src={
                            providerData.image ||
                            "https://picsum.photos/500/500?" + providerData._id
                        }
                    />
                    <h1>{providerData.user.name}</h1>
                    {providerData.bio && <p>{providerData.bio}</p>}
                    <p className="mb-0">
                        {formatPhoneNumber(providerData.phone)}
                    </p>
                    <p className="mb-0">{providerData.user.email}</p>
                    {providerData.address && (
                        <p className="mb-0">{`${providerData.address.city}, ${providerData.address.state} ${providerData.address.zip}`}</p>
                    )}
                    <div className="mt-3">
                        {providerData.tags.map((t) => (
                            <Link
                                className="text-decoration-none"
                                to={`/directory/providers?provider_tags=${t._id}`}
                                key={t._id}
                            >
                                <span className="me-2 p-1 bg-dark text-light rounded">
                                    {t.value}
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>
                <div className="col-lg-6 col-md-12 container p-0">
                    <div className="row">
                        <div className="col-12">
                            <ResultList
                                title="Courses"
                                items={courseData.map((c) => ({
                                    _id: c._id,
                                    image:
                                        c.image ||
                                        "https://picsum.photos/500/500?" +
                                            c._id,
                                    title: c.name,
                                    subtitle: c.location
                                        ? `${c.location.city}, ${c.location.state} ${c.location.zip}`
                                        : undefined,
                                    href: `/course/${c._id}`
                                }))}
                            />
                        </div>
                    </div>
                </div>
            </div>
            <div className="row container mb-3">
                <div className="row">
                    <div className="col-lg-6 col-md-12 d-flex align-items-center">
                        <div style={{ height: "20rem" }}>
                            <ReactCalendar
                                className="w-100 h-100"
                                minDetail="year"
                                prev2Label={null}
                                next2Label={null}
                                calendarType="US"
                                selectRange={false}
                                onChange={(date) => {
                                    if (
                                        selectedDate &&
                                        date.getTime() ===
                                            selectedDate.getTime()
                                    )
                                        setSelectedDate(null);
                                    else setSelectedDate(date);
                                }}
                                value={selectedDate}
                            />
                        </div>
                    </div>
                    <div className="col-lg-6 col-md-12">
                        <ResultList
                            title="Live Sessions"
                            items={liveSessionData.map((s) => ({
                                _id: s._id,
                                image:
                                    s.session.image ||
                                    "https://picsum.photos/500/500?" + s._id,
                                title: s.session.name,
                                date: selectedDate
                                    ? liveSessionTimeToString(
                                          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                                          s
                                      )
                                    : liveSessionDateToString(
                                          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                                          s
                                      ),
                                href:
                                    s.session.URL ||
                                    `/course/${s.session.course._id}`,
                                external: s.session.URL ? true : false
                            }))}
                        />
                    </div>
                </div>
            </div>
        </>
    );
};

export * from "./Management";
export * from "./MyProfile";
export default Profile;
