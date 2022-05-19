import React, { useContext, useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import { Link } from "react-router-dom";

import LiveSchedule from "./LiveSchedule";
import {
  Course as CourseType,
  Session as SessionType,
} from "../../../@types/Models";
import { UserContext } from "../../../context/UserState";
import Result from "../../../components/Result";
import ResultList from "../../../components/ResultList";
import LiveSessionModal from "./Modals/LiveSession";
import DeleteModal from "./Modals/Delete";
import { Course, LiveSession } from "../../../API";

interface Props {}

export const LiveManagement: React.FC<Props> = () => {
  const { user } = useContext(UserContext);

  const [showLiveSessionModal, setLiveSessionModal] = useState(false);
  const [showDeleteModal, setDeleteModal] = useState(false);

  const [courses, setCourses] = useState<CourseType[]>([]);
  const [liveSessions, setliveSessions] = useState<SessionType[]>([]);

  const [editDeleteInfo, setEditDeleteInfo] = useState<
    | {
        type: "course" | "session" | "live session";
        id: string;
      }
    | false
  >(false);

  useEffect(() => {
    if (user && user.provider && !showLiveSessionModal) {
      LiveSession.getAllProviderLiveSessions(user.provider._id).then((s) =>
        setliveSessions(s)
      );

      Course.getAllProvidersCourses(user.provider._id).then((c) =>
        setCourses(c)
      );
    }
  }, [showLiveSessionModal]);

  return (
    <div className="ContentManagement">
      <div className="container">
        <div className="row">
          <div className="col-md-12">
            <Link className="btn btn-dark m-2" to="/provider/management">
              Return
            </Link>
            <Button
              className="m-2"
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
              items={liveSessions.map((liveSession) =>
                typeof liveSession.liveSession === "object" &&
                typeof liveSession.course === "object"
                  ? {
                      _id: liveSession.liveSession._id,
                      title: liveSession.name,
                      href: liveSession.URL || `/course/${liveSession._id}`,
                      external: liveSession.URL ? true : false,
                      image:
                        liveSession.image ||
                        "https://via.placeholder.com/500x500",
                      subtitle: liveSession.course.name,
                      /*TODO: date: liveSession.liveSession.recurring
                  ? recurringLiveSessionDateToString(liveSession)
                  : liveSessionDateToString(liveSession),*/
                    }
                  : { _id: "", title: "", href: "", image: "" }
              )}
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
    </div>
  );
};

export default LiveManagement;
