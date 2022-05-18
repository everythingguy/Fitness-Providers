import React, { useState, useEffect, useContext } from "react";
import { Link, Navigate } from "react-router-dom";
import Button from "react-bootstrap/Button";
import Searchbar from "../../../components/Searchbar";
import {
  Category as CategoryType,
  Course as CourseType,
  Session as SessionType,
} from "../../../@types/Models";
import Category from "../../../components/Category";
import {
  Category as CategoryAPI,
  Course as CourseAPI,
  Session as SessionAPI,
} from "../../../API";
import { CourseModal, SessionModal, DeleteModal } from "./Modals";
import { UserContext } from "../../../context/UserState";
import { ResultList } from "../../../components/ResultList";

interface Props {}

export const Management: React.FC<Props> = () => {
  // logged in context
  const { loggedIn, user } = useContext(UserContext);

  const [showCourseModal, setCourseModal] = useState(false);
  const [showSessionModal, setSessionModal] = useState(false);
  const [showDeleteModal, setDeleteModal] = useState(false);

  const [searchParams, setSearchParams] = useState<{
    keywords: string;
    selectedCourseTags: string[];
  }>({
    keywords: "",
    selectedCourseTags: [],
  });

  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [courses, setCourses] = useState<CourseType[]>([]);
  const [sessions, setSessions] = useState<SessionType[]>([]);
  const [editDeleteInfo, setEditDeleteInfo] = useState<
    | {
        type: "course" | "session" | "liveSession";
        id: string;
      }
    | false
  >(false);

  useEffect(() => {
    CategoryAPI.getCourseCategories().then((resp) => {
      if (resp.success) setCategories(resp.data.categories);
    });
  }, []);

  useEffect(() => {
    if (
      user &&
      user.provider &&
      !showDeleteModal &&
      !showCourseModal &&
      !showSessionModal
    ) {
      CourseAPI.getProvidersCourses(user.provider._id).then((resp) => {
        if (resp.success) setCourses(resp.data.courses);
      });

      SessionAPI.getProviderSessions(user.provider._id).then((resp) => {
        if (resp.success) setSessions(resp.data.sessions);
      });
    }
  }, [user, showDeleteModal, showCourseModal, showSessionModal]);

  /*
  if (!(loggedIn && user && user.provider))
    return <Navigate to="/user/login" />;
    */

  return (
    <div className="ContentManagement">
      <div className="container">
        <div className="row">
          <div className="col-md-12">
            <Button
              className="m-2"
              variant="dark"
              onClick={() => setCourseModal(true)}
            >
              Add Class
            </Button>
            <Button
              className="m-2"
              variant="dark"
              onClick={() => setSessionModal(true)}
            >
              Add Session
            </Button>
            <Link className="btn btn-dark m-2" to="/provider/management/events">
              Schedule Events
            </Link>
          </div>
        </div>
        <div className="row">
          <div className="mb-2">
            <Searchbar
              id="search"
              placeholder="Search Key Words"
              onChange={(e) =>
                setSearchParams({
                  ...searchParams,
                  keywords: e.target.value,
                })
              }
            />
          </div>
        </div>
        <div className="row">
          <div className="col-xs-6 col-sm-4 col-md-5 col-lg-3 col-xl-3 col-xxl-3 mb-2">
            <div className="card side-bar search h-100">
              {categories.map((category) => (
                <Category
                  category={category.name}
                  items={category.tags}
                  onChange={(e) =>
                    setSearchParams({
                      ...searchParams,
                      selectedCourseTags: e.target.checked
                        ? [
                            ...searchParams.selectedCourseTags,
                            e.target.dataset.id!,
                          ]
                        : searchParams.selectedCourseTags.filter(
                            (_id) => _id !== e.target.dataset.id
                          ),
                    })
                  }
                  key={category._id}
                  id={category._id}
                />
              ))}
            </div>
          </div>
          <div className="col-xs-6 col-sm-8 col-md-7 col-lg-9 col-xl-9 col-xxl-9 card mb-2">
            <div>
              <ResultList
                title="Classes"
                items={courses.map((course) => {
                  return {
                    _id: course._id,
                    title: course.name,
                    subtitle: course.description,
                    href: "",
                    image:
                      course.image || "https://via.placeholder.com/500x500",
                  };
                })}
                onEdit={(id) => {
                  setEditDeleteInfo({ id, type: "course" });
                  setCourseModal(true);
                }}
                onDelete={(id) => {
                  setEditDeleteInfo({ id, type: "course" });
                  setDeleteModal(true);
                }}
                onScrollBottom={(e) => {
                  // TODO: add pagination
                  console.log("Next Page Please");
                }}
              />
            </div>
            <div>
              <ResultList
                title="Sessions"
                items={sessions.map((session) => {
                  return {
                    _id: session._id,
                    title: session.name,
                    href: "",
                    image:
                      session.image || "https://via.placeholder.com/500x500",
                  };
                })}
                onEdit={(id) => {
                  setEditDeleteInfo({ id, type: "session" });
                  setSessionModal(true);
                }}
                onDelete={(id) => {
                  setEditDeleteInfo({ id, type: "session" });
                  setDeleteModal(true);
                }}
                onScrollBottom={(e) => {
                  // TODO: add pagination
                  console.log("Next Page Please");
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <CourseModal
        setModal={setCourseModal}
        showModal={showCourseModal}
        info={editDeleteInfo}
        setInfo={setEditDeleteInfo}
      />
      <SessionModal
        setModal={setSessionModal}
        showModal={showSessionModal}
        providerCourses={courses}
        info={editDeleteInfo}
        setInfo={setEditDeleteInfo}
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

export default Management;
export * from "./EventManagement";
export * from "./Modals";
