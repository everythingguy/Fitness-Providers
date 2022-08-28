import React, { useContext } from "react";
import { useState, useEffect, useRef } from "react";
import { Searchbar, Category as CategoryComp, Card } from "../../components";
import { Category, Provider, Course, Session } from "../../API";
import {
    Category as CategoryType,
    Tag as TagType,
    Course as CourseType,
    Session as SessionType,
    Provider as ProviderType
} from "../../@types/Models";
import { Link, useMatch, useSearchParams } from "react-router-dom";
import Modal from "react-bootstrap/Modal";
import { UserContext } from "../../context/UserState";
import { Alert } from "react-bootstrap";

// TODO: Get all categories

export const Directory: React.FC = () => {
    const { user } = useContext(UserContext);
    const match = useMatch("/directory/:type");
    const displayParam: "providers" | "courses" | "sessions" =
        match &&
        match.params.type &&
        ["providers", "courses", "sessions"].includes(match.params.type)
            ? (match.params.type as "providers" | "courses" | "sessions")
            : "courses";

    const [searchParams] = useSearchParams();

    const [showFilterModal, setFilterModal] = useState(false);
    const [providerCategories, setProviderCategories] = useState<
        CategoryType[]
    >([]);
    const [courseCategories, setCourseCategories] = useState<CategoryType[]>(
        []
    );
    const [courseSearchResults, setCourseSearchResults] = useState<
        CourseType[]
    >([]);
    const [sessionSearchResults, setSessionSearchResults] = useState<
        SessionType[]
    >([]);
    const [providerSearchResults, setProviderSearchResults] = useState<
        ProviderType[]
    >([]);

    const [page, setPage] = useState<{
        provider: number | null;
        course: number | null;
        session: number | null;
    }>({ provider: 1, course: 1, session: 1 });
    const pageRef = useRef(page);

    const [search, setSearch] = useState<string>("");
    const [zip, setZip] = useState<number | null>(null);
    const [tags, setTags] = useState<{
        provider: { [key: string]: boolean };
        course: { [key: string]: boolean };
    }>({
        provider: searchParams.get("provider_tags")
            ? Object.assign(
                  {},
                  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                  ...searchParams
                      .get("provider_tags")!
                      .split(",")
                      .map((t) => ({ [t]: true }))
              )
            : {},
        course: searchParams.get("course_tags")
            ? Object.assign(
                  {},
                  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                  ...searchParams
                      .get("course_tags")!
                      .split(",")
                      .map((t) => ({ [t]: true }))
              )
            : {}
    });
    const timeout = useRef<number | null>(null);
    const firstRender = useRef<boolean>(true);
    const [display, setDisplay] = useState<
        "providers" | "courses" | "sessions"
    >(displayParam);

    const filterProvider = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTags({
            ...tags,
            provider: {
                ...tags.provider,
                [e.target.getAttribute("data-id") as string]: e.target.checked
            }
        });
    };

    const filterCourse = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTags({
            ...tags,
            course: {
                ...tags.course,
                [e.target.getAttribute("data-id") as string]: e.target.checked
            }
        });
    };

    const searchProviders = () => {
        // populate providers list
        const tagsArr: string[] = [];
        for (const tag in tags.provider)
            if (tags.provider[tag]) tagsArr.push(tag);

        Provider.getProviders({
            search,
            tags: tagsArr,
            page: page.provider,
            zip: zip ? zip : undefined
        }).then((resp) => {
            if (resp.success) {
                if (page.provider === null || page.provider > 1)
                    setProviderSearchResults([
                        ...providerSearchResults,
                        ...resp.data.providers
                    ]);
                else setProviderSearchResults(resp.data.providers);

                if (!resp.hasNextPage) {
                    pageRef.current = { ...page, provider: null };
                    setPage({ ...page, provider: null });
                }
            }
        });
    };

    const searchCourses = () => {
        // populate course list
        const tagsArr: string[] = [];
        for (const tag in tags.course) if (tags.course[tag]) tagsArr.push(tag);

        Course.getCourses({
            search,
            tags: tagsArr,
            page: page.course,
            zip: zip ? zip : undefined
        }).then((resp) => {
            if (resp.success) {
                if (page.course === null || page.course > 1)
                    setCourseSearchResults([
                        ...courseSearchResults,
                        ...resp.data.courses
                    ]);
                else setCourseSearchResults(resp.data.courses);

                if (!resp.hasNextPage) {
                    pageRef.current = { ...page, course: null };
                    setPage({ ...page, course: null });
                }
            }
        });
    };

    const searchSessions = () => {
        // populate session list
        const tagsArr: string[] = [];
        for (const tag in tags.course) if (tags.course[tag]) tagsArr.push(tag);

        Session.getSessions({
            search,
            tags: tagsArr,
            live: false,
            page: page.session
        }).then((resp) => {
            if (resp.success) {
                if (page.session === null || page.session > 1)
                    setSessionSearchResults([
                        ...sessionSearchResults,
                        ...resp.data.sessions
                    ]);
                else setSessionSearchResults(resp.data.sessions);

                if (!resp.hasNextPage) {
                    pageRef.current = { ...page, session: null };
                    setPage({ ...page, session: null });
                }
            }
        });
    };

    const dicHasTruthyKey = (dic: { [key: string]: boolean }) => {
        for (const key in dic) {
            if (dic[key] && dic[key] === true) return true;
        }

        return false;
    };

    const onScrollHanlder = () => {
        if (
            document.scrollingElement &&
            window.innerHeight + document.documentElement.scrollTop ===
                document.scrollingElement.scrollHeight
        ) {
            if (display === "providers") {
                if (pageRef.current.provider) {
                    pageRef.current.provider++;
                    setPage(pageRef.current);
                }
            } else if (display === "courses") {
                if (pageRef.current.course) {
                    pageRef.current.course++;
                    setPage(pageRef.current);
                }
            } else if (display === "sessions") {
                if (pageRef.current.session) {
                    pageRef.current.session++;
                    setPage(pageRef.current);
                }
            }
        }
    };

    useEffect(() => {
        window.addEventListener("scroll", onScrollHanlder);
        return () => {
            window.removeEventListener("scroll", onScrollHanlder);
        };
    }, []);

    useEffect(() => {
        Category.getProviderCategories().then((resp) => {
            if (resp.success) {
                setProviderCategories(resp.data.categories);
            }
        });

        Category.getCourseCategories().then((resp) => {
            if (resp.success) {
                setCourseCategories(resp.data.categories);
            }
        });
    }, []);

    useEffect(() => {
        if (timeout.current) window.clearTimeout(timeout.current);

        if (!firstRender.current) {
            timeout.current = window.setTimeout(() => {
                pageRef.current = { provider: 1, course: 1, session: 1 };
                setPage(pageRef.current);

                timeout.current = null;
            }, 250);
        }
    }, [search]);

    useEffect(() => {
        if (timeout.current) window.clearTimeout(timeout.current);

        if (!firstRender.current) {
            timeout.current = window.setTimeout(() => {
                if (page.provider !== 1) {
                    pageRef.current = { ...page, provider: 1 };
                    setPage(pageRef.current);
                } else searchProviders();

                if (page.course !== 1) {
                    pageRef.current = { ...page, course: 1 };
                    setPage(pageRef.current);
                } else searchCourses();

                timeout.current = null;
            }, 250);
        }
    }, [zip]);

    useEffect(() => {
        if (!firstRender.current) {
            if (page.provider !== 1) {
                pageRef.current = { ...page, provider: 1 };
                setPage(pageRef.current);
            } else searchProviders();
        }
    }, [tags.provider]);

    useEffect(() => {
        if (page.provider) searchProviders();
    }, [page.provider]);

    useEffect(() => {
        if (!firstRender.current) {
            if (page.course !== 1 && page.session !== 1) {
                pageRef.current = { ...page, course: 1, session: 1 };
                setPage(pageRef.current);
            } else if (page.course !== 1) {
                pageRef.current = { ...page, course: 1 };
                setPage(pageRef.current);
                searchSessions();
            } else if (page.session !== 1) {
                pageRef.current = { ...page, session: 1 };
                setPage(pageRef.current);
                searchCourses();
            } else {
                searchCourses();
                searchSessions();
            }
        } else firstRender.current = false;
    }, [tags.course]);

    useEffect(() => {
        if (page.course) searchCourses();
    }, [page.course]);

    useEffect(() => {
        if (page.session) searchSessions();
    }, [page.session]);

    return (
        <>
            {process.env.DEMO && process.env.DEMO === "true" && (
                <Alert variant="info">
                    Demo: To see the full functionality of the site please click
                    login and login as an instructor. Then select my account
                    (hambuger button on mobile) to see the content management
                    tools.
                </Alert>
            )}
            <div className="h3">Directory</div>
            <div className="divider-border"></div>
            <div className="row mb-3">
                <div className="col-12">
                    <Searchbar
                        placeholder="Search"
                        onChange={(e) => setSearch(e.target.value)}
                        onFilterClick={() => setFilterModal(true)}
                        filtered={
                            display === "providers"
                                ? dicHasTruthyKey(tags.provider)
                                : dicHasTruthyKey(tags.course)
                        }
                    />
                </div>
            </div>
            <div className="row mb-5">
                <Link
                    className="btn btn-dark text-light fw-bold d-inline w-25"
                    to="/directory/providers"
                    onClick={() => setDisplay("providers")}
                >
                    Providers
                </Link>
                <Link
                    className="btn btn-dark text-light fw-bold d-inline w-25 active"
                    to="/directory/courses"
                    onClick={() => setDisplay("courses")}
                >
                    Courses
                </Link>
                <Link
                    className="btn btn-dark text-light fw-bold d-inline w-25"
                    to="/directory/sessions"
                    onClick={() => setDisplay("sessions")}
                >
                    Async Sessions
                </Link>
                <Link
                    to="/calendar"
                    className="btn btn-dark text-light fw-bold d-inline w-25"
                >
                    Live Sessions
                </Link>
            </div>
            <div className="row">
                {display === "providers" &&
                    providerSearchResults.map((p) => (
                        <Card
                            key={p._id}
                            _id={p._id}
                            image={
                                p.image ||
                                "https://picsum.photos/500/500?" + p._id
                            }
                            href={`/provider/profile/${p._id}`}
                            title={p.user.name}
                            subtitle={
                                p.address
                                    ? `${p.address.city}, ${p.address.state} ${p.address.zip}`
                                    : ""
                            }
                            text={p.bio}
                            hidden={
                                user &&
                                user.provider &&
                                !user.provider.isEnrolled &&
                                p._id === user.provider._id
                                    ? true
                                    : false
                            }
                        ></Card>
                    ))}
                {display === "courses" &&
                    courseSearchResults.map((c) => (
                        <Card
                            key={c._id}
                            _id={c._id}
                            image={
                                c.image ||
                                "https://picsum.photos/500/500?" + c._id
                            }
                            href={`/course/${c._id}`}
                            title={c.name}
                            subtitle={
                                c.location
                                    ? `${c.location.city}, ${c.location.state} ${c.location.zip}`
                                    : ""
                            }
                            text={c.description}
                            hidden={
                                user &&
                                user.provider &&
                                !user.provider.isEnrolled &&
                                c.provider._id === user.provider._id
                                    ? true
                                    : false
                            }
                        ></Card>
                    ))}
                {display === "sessions" &&
                    sessionSearchResults.map((s) => (
                        <Card
                            key={s._id}
                            _id={s._id}
                            image={
                                s.image ||
                                "https://picsum.photos/500/500?" + s._id
                            }
                            href={s.URL ? s.URL : `/course/${s.course._id}`}
                            title={s.name}
                            subtitle={s.course.name}
                            text={s.course.description}
                            hidden={
                                user &&
                                user.provider &&
                                !user.provider.isEnrolled &&
                                s.course.provider._id === user.provider._id
                                    ? true
                                    : false
                            }
                            external={s.URL ? true : false}
                        ></Card>
                    ))}
            </div>
            <Modal
                size="lg"
                show={showFilterModal}
                onHide={() => setFilterModal(!showFilterModal)}
            >
                <div className="p-3">
                    {display === "providers" || display === "courses" ? (
                        <div className="col-12">
                            <div className="card-body mb-md-4">
                                <label className="fw-bold">Zip Code</label>
                                <input
                                    className="form-control"
                                    type="text"
                                    placeholder="Zip Code"
                                    name="zip"
                                    value={zip || ""}
                                    onChange={(e) => {
                                        try {
                                            const val = e.target.value;
                                            if (
                                                val.length > 0 &&
                                                !isNaN(parseInt(val, 10))
                                            )
                                                setZip(parseInt(val, 10));
                                            else setZip(null);
                                        } catch (error) {
                                            setZip(null);
                                        }
                                    }}
                                />
                            </div>
                        </div>
                    ) : undefined}

                    {display === "providers" &&
                        providerCategories.map((category) => (
                            <CategoryComp
                                category={category.name}
                                items={(category.tags as TagType[]).map(
                                    (t) => ({
                                        ...t,
                                        checked: tags.provider[t._id] || false
                                    })
                                )}
                                onChange={filterProvider}
                                key={category._id}
                                id={"instr"}
                            />
                        ))}
                    {display === "courses" || display === "sessions"
                        ? courseCategories.map((category) => (
                              <CategoryComp
                                  category={category.name}
                                  items={(category.tags as TagType[]).map(
                                      (t) => ({
                                          ...t,
                                          checked: tags.course[t._id] || false
                                      })
                                  )}
                                  onChange={filterCourse}
                                  key={category._id}
                                  id={"course"}
                              />
                          ))
                        : undefined}
                </div>
            </Modal>
        </>
    );
};

export default Directory;
