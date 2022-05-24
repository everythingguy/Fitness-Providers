import React, { useEffect, useState } from "react";
import { Link, useMatch } from "react-router-dom";

import {
    Course as CourseType,
    Session as SessionType
} from "../../@types/Models";
import CourseAPI from "../../API/Course";
import SessionAPI from "../../API/Session";
import { ResultList } from "../../components";
import Loading from "../../components/Loading";
import { liveSessionDateToString } from "../../utils/Date";
import Error404 from "../ErrorPages/404";
import Error500 from "../ErrorPages/500";
import { formatPhoneNumber } from "./../../utils/format";

interface Props {}

export const Course: React.FC<Props> = () => {
    const match = useMatch("/course/:id");
    const courseID = match ? match.params.id : null;
    const [courseData, setCourseData] = useState<CourseType | null | false>(
        null
    );
    const [sessionData, setSessionData] = useState<SessionType[]>([]);
    const [page, setPage] = useState<number | null>(1);

    const searchSessions = () => {
        if (courseID && page) {
            SessionAPI.getCourseSessions(courseID, { page }).then((resp) => {
                if (resp.success) {
                    if (page > 1)
                        setSessionData([...sessionData, ...resp.data.sessions]);
                    else setSessionData(resp.data.sessions);
                    if (!resp.hasNextPage) setPage(null);
                }
            });
        }
    };

    useEffect(() => {
        if (courseID) {
            CourseAPI.getCourse(courseID).then((resp) => {
                if (resp.success) setCourseData(resp.data.course);
                else setCourseData(false);
            });

            searchSessions();
        }
    }, []);

    useEffect(() => {
        if (page) searchSessions();
    }, [page]);

    if (courseID === null || courseID === undefined) return <Error404 />;
    if (courseData === false) return <Error500 />;
    if (courseData === null) return <Loading />;

    return (
        <div className="row w-100">
            <div className="col-sm-12 col-md-6 col-lg-8 text-center mb-3">
                <img
                    className="mx-auto rounded"
                    src={
                        courseData.image ||
                        "https://picsum.photos/500/500?" + courseData._id
                    }
                    alt={courseData.name}
                    style={{ width: "100%", maxWidth: "500px" }}
                />
                <h1>{courseData.name}</h1>

                <p className="text-left">{courseData.description}</p>
                <div className="mb-3">
                    {courseData.tags.map((t) => (
                        <Link
                            className="text-decoration-none"
                            to={`/directory/courses?course_tags=${t._id}`}
                            key={t._id}
                        >
                            <span className="me-2 p-1 bg-dark text-light rounded">
                                {t.value}
                            </span>
                        </Link>
                    ))}
                </div>
                <h3>Location</h3>
                {courseData.location ? (
                    <>
                        <p className="m-0">{courseData.location.street1}</p>
                        {courseData.location.street2 && (
                            <p className="m-0">{courseData.location.street2}</p>
                        )}
                        <p className="m-0">
                            {courseData.location.city},{" "}
                            {courseData.location.state}{" "}
                            {courseData.location.zip}
                        </p>
                        <p className="m-0">{courseData.location.country}</p>
                    </>
                ) : (
                    <p>Online</p>
                )}
            </div>
            <div className="col-sm-12 col-md-6 col-lg-4 text-center container p-0 mb-3">
                <div className="row h-lg-25 h-md-25">
                    <div className="col-12">
                        <Link
                            to={`/provider/profile/${courseData.provider._id}`}
                            className="text-decoration-none text-black"
                        >
                            <div className="container p-0">
                                <div className="row">
                                    <div className="col-6 d-flex align-items-center justify-content-center">
                                        <img
                                            src={
                                                courseData.provider.image ||
                                                "https://picsum.photos/500/500?" +
                                                    courseData.provider._id
                                            }
                                            className="w-100"
                                        />
                                    </div>
                                    <div className="col-6 d-flex align-items-center justify-content-center">
                                        <div>
                                            <h3>
                                                {courseData.provider.user.name}
                                            </h3>
                                            <p>
                                                {formatPhoneNumber(
                                                    courseData.provider.phone
                                                )}
                                            </p>
                                            <p>
                                                {courseData.provider.user.email}
                                            </p>
                                            <div className="btn btn-primary">
                                                View Profile
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </div>
                </div>

                <div className="row vh-100">
                    <div className="col-12">
                        <ResultList
                            title="Sessions"
                            items={sessionData.map((s) => ({
                                _id: s._id,
                                href: s.URL,
                                image:
                                    s.image ||
                                    "https://picsum.photos/500/500?" + s._id,
                                title: s.name,
                                date: s.liveSession
                                    ? liveSessionDateToString(s.liveSession)
                                    : "Async",
                                external: true
                            }))}
                            onScrollBottom={() => {
                                if (page) setPage(page + 1);
                            }}
                            style={{ height: "50rem" }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Course;
