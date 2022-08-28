import React, { useContext, useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import { Link, Navigate } from "react-router-dom";

import LiveSchedule from "./LiveSchedule";
import {
    Course as CourseType,
    Session as SessionType
} from "../../../@types/Models";
import { UserContext } from "../../../context/UserState";
import Result from "../../../components/Result";
import ResultList from "../../../components/ResultList";
import LiveSessionModal from "./Modals/LiveSession";
import DeleteModal from "./Modals/Delete";
import { Course, LiveSession } from "../../../API";
import { liveSessionDateToString } from "../../../utils/Date";
import { Info } from "../../../@types/misc";
import ExternalWarning from "./../../../components/ExternalWarning";

interface Props {}

export const LiveManagement: React.FC<Props> = () => {
    const { user, loggedIn } = useContext(UserContext);

    const [showLiveSessionModal, setLiveSessionModal] = useState(false);
    const [showDeleteModal, setDeleteModal] = useState(false);
    const [externalWarningState, setExternalWarningState] = useState({
        showModal: false,
        link: "",
        newTab: true
    });

    const [courses, setCourses] = useState<CourseType[]>([]);
    const [liveSessions, setliveSessions] = useState<SessionType[]>([]);

    const [editDeleteInfo, setEditDeleteInfo] = useState<Info>(false);

    useEffect(() => {
        if (user && user.provider && !showLiveSessionModal) {
            LiveSession.getAllProviderLiveSessions(user.provider._id).then(
                (s) => setliveSessions(s)
            );

            Course.getAllProvidersCourses(user.provider._id).then((c) =>
                setCourses(c)
            );
        }
    }, [showLiveSessionModal, showDeleteModal]);

    if (!loggedIn) return <Navigate to="/user/login" />;

    return (
        <div className="ContentManagement">
            <div className="container">
                <div className="row">
                    <div className="col-md-12">
                        <Link
                            className="btn btn-dark m-2 text-light fw-bold"
                            to="/provider/management"
                        >
                            Return
                        </Link>
                        <Button
                            className="m-2 text-light fw-bold"
                            variant="dark"
                            onClick={() => setLiveSessionModal(true)}
                        >
                            Add Live Session
                        </Button>
                    </div>
                </div>
                <div className="d-grid gap-4">
                    <div className="card p-2">
                        <ResultList
                            title="Live Sessions"
                            component={Result}
                            items={liveSessions.map((session) => ({
                                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                                _id: session.liveSession!._id,
                                title: session.name,
                                href:
                                    session.URL ||
                                    `/course/${session.course._id}`,
                                external: session.URL ? true : false,
                                setExternalWarningState,
                                image:
                                    session.image ||
                                    "https://picsum.photos/500/500?" +
                                        session._id,
                                subtitle: session.course.name,
                                date: liveSessionDateToString(
                                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                                    session.liveSession!
                                )
                            }))}
                            onEdit={(id) => {
                                setEditDeleteInfo({ id, type: "live session" });
                                setLiveSessionModal(true);
                            }}
                            onDelete={(id) => {
                                setEditDeleteInfo({ id, type: "live session" });
                                setDeleteModal(true);
                            }}
                        />
                    </div>
                    <div className="card mb-2 p-2">
                        <div className="d-grid gap-1 p-2">
                            <h4 className="my-2">Schedule</h4>
                            <div className="divider-border"></div>
                            <LiveSchedule liveSessions={liveSessions} />
                        </div>
                    </div>
                </div>
            </div>

            <LiveSessionModal
                setModal={setLiveSessionModal}
                showModal={showLiveSessionModal}
                info={editDeleteInfo}
                setInfo={setEditDeleteInfo}
                providerCourses={courses}
            />

            <DeleteModal
                setModal={setDeleteModal}
                showModal={showDeleteModal}
                info={editDeleteInfo}
                setInfo={setEditDeleteInfo}
            />
            <ExternalWarning
                showModal={externalWarningState.showModal}
                setModal={(showModal: boolean) =>
                    setExternalWarningState({
                        ...externalWarningState,
                        showModal
                    })
                }
                link={externalWarningState.link}
                newTab={externalWarningState.newTab}
            />
        </div>
    );
};

export default LiveManagement;
