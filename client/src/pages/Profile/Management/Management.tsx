import React, { useState, useEffect, useContext, useRef } from "react";
import { Link, Navigate } from "react-router-dom";
import Button from "react-bootstrap/Button";
import Searchbar from "../../../components/Searchbar";
import {
    Category as CategoryType,
    Tag as TagType,
    Course as CourseType,
    Session as SessionType
} from "../../../@types/Models";
import Category from "../../../components/Category";
import {
    Category as CategoryAPI,
    Course as CourseAPI,
    Session as SessionAPI
} from "../../../API";
import { CourseModal, SessionModal, DeleteModal } from "./Modals";
import { UserContext } from "../../../context/UserState";
import { ResultList } from "../../../components/ResultList";
import Error403 from "../../ErrorPages/403";

interface Props {}

export const Management: React.FC<Props> = () => {
    // logged in context
    const { loggedIn, user } = useContext(UserContext);

    const timeout = useRef<number | null>(null);
    const first = useRef(true);

    const [showCourseModal, setCourseModal] = useState(false);
    const [showSessionModal, setSessionModal] = useState(false);
    const [showDeleteModal, setDeleteModal] = useState(false);

    const [searchParams, setSearchParams] = useState<{
        keywords: string;
        selectedCourseTags: string[];
    }>({
        keywords: "",
        selectedCourseTags: []
    });

    const [page, setPage] = useState<{
        session: number | null;
    }>({ session: 1 });

    const [categories, setCategories] = useState<CategoryType[]>([]);
    const [courses, setCourses] = useState<CourseType[]>([]);
    const [sessions, setSessions] = useState<SessionType[]>([]);
    const [editDeleteInfo, setEditDeleteInfo] = useState<
        | {
              type: "course" | "session" | "live session";
              id: string;
          }
        | false
    >(false);

    const initialQuery = () => {
        if (user && user.provider) {
            CourseAPI.getAllProvidersCourses(user.provider._id, {
                search: searchParams.keywords,
                tags: searchParams.selectedCourseTags
            }).then((respCourses) => {
                setCourses(respCourses);
            });

            SessionAPI.getProviderSessions(user.provider._id, {
                page: 1,
                search: searchParams.keywords,
                tags: searchParams.selectedCourseTags,
                live: false
            }).then((resp) => {
                if (resp.success) {
                    setSessions(resp.data.sessions);
                    if (!resp.hasNextPage) setPage({ ...page, session: null });
                    else setPage({ ...page, session: 1 });
                }
            });
        }
    };

    useEffect(() => {
        CategoryAPI.getCourseCategories().then((resp) => {
            if (resp.success) setCategories(resp.data.categories);
        });
    }, []);

    useEffect(() => {
        if (!showDeleteModal && !showCourseModal && !showSessionModal) {
            initialQuery();
        }
    }, [showDeleteModal, showCourseModal, showSessionModal]);

    useEffect(() => {
        if (user && user.provider && page.session && page.session > 1)
            SessionAPI.getProviderSessions(user.provider._id, {
                page: page.session,
                search: searchParams.keywords,
                tags: searchParams.selectedCourseTags,
                live: false
            }).then((resp) => {
                if (resp.success) {
                    setSessions([...sessions, ...resp.data.sessions]);
                    if (!resp.hasNextPage) setPage({ ...page, session: null });
                }
            });
    }, [page.session]);

    useEffect(() => {
        if (!first.current) {
            if (timeout.current) window.clearTimeout(timeout.current);

            timeout.current = window.setTimeout(() => {
                initialQuery();
            }, 250);
        } else first.current = false;
    }, [searchParams]);

    if (!loggedIn) return <Navigate to="/user/login" />;

    if (!(user && user.provider)) return <Error403 />;

    return (
        <div className="ContentManagement">
            <div className="container">
                <div className="row">
                    <div className="col-md-12">
                        <Button
                            className="m-2 text-light fw-bold"
                            variant="dark"
                            onClick={() => setCourseModal(true)}
                        >
                            Add Class
                        </Button>
                        <Button
                            className="m-2 text-light fw-bold"
                            variant="dark"
                            onClick={() => setSessionModal(true)}
                        >
                            Add Session
                        </Button>
                        <Link
                            className="btn btn-dark m-2 text-light fw-bold"
                            to="/provider/management/live"
                        >
                            Schedule Live Sessions
                        </Link>
                    </div>
                </div>
                <div className="row">
                    <div className="mb-2">
                        <Searchbar
                            id="search"
                            placeholder="Search"
                            onChange={(e) =>
                                setSearchParams({
                                    ...searchParams,
                                    keywords: e.target.value
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
                                    items={category.tags as TagType[]}
                                    onChange={(e) =>
                                        setSearchParams({
                                            ...searchParams,
                                            selectedCourseTags: e.target.checked
                                                ? [
                                                      ...searchParams.selectedCourseTags,
                                                      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                                                      e.target.dataset.id!
                                                  ]
                                                : searchParams.selectedCourseTags.filter(
                                                      (_id) =>
                                                          _id !==
                                                          e.target.dataset.id
                                                  )
                                        })
                                    }
                                    key={category._id}
                                    id={category._id}
                                />
                            ))}
                        </div>
                    </div>
                    <div className="col-xs-6 col-sm-8 col-md-7 col-lg-9 col-xl-9 col-xxl-9 card mb-2">
                        <ResultList
                            title="Classes"
                            items={courses.map((course) => {
                                return {
                                    _id: course._id,
                                    title: course.name,
                                    subtitle: course.description,
                                    href: `/course/${course._id}`,
                                    image:
                                        course.image ||
                                        "https://picsum.photos/500/500?" +
                                            course._id
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
                        />
                        <ResultList
                            title="Sessions"
                            items={sessions.map((s) => ({
                                _id: s._id,
                                title: s.name,
                                subtitle: s.course.name,
                                href: s.URL || `/course/${s.course._id}`,
                                image:
                                    s.image ||
                                    "https://picsum.photos/500/500?" + s._id,
                                external: s.URL ? true : false
                            }))}
                            onEdit={(id) => {
                                setEditDeleteInfo({ id, type: "session" });
                                setSessionModal(true);
                            }}
                            onDelete={(id) => {
                                setEditDeleteInfo({ id, type: "session" });
                                setDeleteModal(true);
                            }}
                            onScrollBottom={() => {
                                if (page.session)
                                    setPage({
                                        ...page,
                                        session: page.session + 1
                                    });
                            }}
                        />
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
