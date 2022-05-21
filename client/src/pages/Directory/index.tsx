import React from "react";
import { useState, useEffect, useRef } from "react";
import { Searchbar, Category as CategoryComp, Card } from "../../components";
import { Category, Provider, Course, Session } from "../../API";
import {
  Category as CategoryType,
  Course as CourseType,
  Session as SessionType,
  Provider as ProviderType
} from "../../@types/Models";
import { Link, useMatch } from "react-router-dom";

export const Directory: React.FC = () => {
  const match = useMatch("/directory/:type");
  const displayParam: "providers" | "courses" | "sessions" =
    match &&
    match.params.type &&
    ["providers", "courses", "sessions"].includes(match.params.type)
      ? (match.params.type as "providers" | "courses" | "sessions")
      : "courses";

  const [providerCategories, setProviderCategories] = useState<CategoryType[]>(
    []
  );
  const [courseCategories, setCourseCategories] = useState<CategoryType[]>([]);
  const [courseSearchResults, setCourseSearchResults] = useState<CourseType[]>(
    []
  );
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
  }>({
    provider: 1,
    course: 1,
    session: 1
  });
  const [search, setSearch] = useState<string>("");
  const [tags, setTags] = useState<{
    provider: { [key: string]: boolean };
    course: { [key: string]: boolean };
  }>({
    provider: {},
    course: {}
  });
  const timeout = useRef<number | null>(null);
  const firstRender = useRef<boolean>(true);
  const [display, setDisplay] = useState<"providers" | "courses" | "sessions">(
    displayParam
  );

  const filterProvider = (e) => {
    setTags({
      ...tags,
      provider: {
        ...tags.provider,
        [e.target.getAttribute("data-id")]: e.target.checked
      }
    });
  };

  const filterCourse = (e) => {
    setTags({
      ...tags,
      course: {
        ...tags.course,
        [e.target.getAttribute("data-id")]: e.target.checked
      }
    });
  };

  const searchProviders = () => {
    // populate providers list
    const tagsArr: string[] = [];
    for (const tag in tags.provider) if (tags.provider[tag]) tagsArr.push(tag);

    Provider.getProviders({
      search,
      tags: tagsArr,
      page: page.provider
    }).then((resp) => {
      if (resp.success) {
        if (page.provider === null || page.provider > 1)
          setProviderSearchResults([
            ...providerSearchResults,
            ...resp.data.providers
          ]);
        else setProviderSearchResults(resp.data.providers);

        if (!resp.hasNextPage) setPage({ ...page, provider: null });
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
      page: page.course
    }).then((resp) => {
      if (resp.success) {
        if (page.course === null || page.course > 1)
          setCourseSearchResults([
            ...courseSearchResults,
            ...resp.data.courses
          ]);
        else setCourseSearchResults(resp.data.courses);

        if (!resp.hasNextPage) setPage({ ...page, course: null });
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

        if (!resp.hasNextPage) setPage({ ...page, session: null });
      }
    });
  };

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
        setPage({
          provider: 1,
          course: 1,
          session: 1
        });
      }, 250);
    }
  }, [search]);

  useEffect(() => {
    if (!firstRender.current) {
      setPage({
        ...page,
        provider: 1
      });
    }
  }, [tags.provider]);

  useEffect(() => {
    if (page.provider) {
      searchProviders();
    }
  }, [page.provider]);

  useEffect(() => {
    if (!firstRender.current) {
      setPage({
        ...page,
        course: 1
      });
    } else firstRender.current = false;
  }, [tags.course]);

  useEffect(() => {
    if (page.course) {
      searchCourses();
    }
  }, [page.course]);

  useEffect(() => {
    if (page.session) {
      searchSessions();
    }
  }, [page.session]);

  // TODO: add categorys to the side and only show the correct ones for what is displayed
  /*
    {instructorCategories.map((category) => (
      <Category
        category={category.name}
        items={category.tags}
        onChange={filterInstructor}
        key={category.id}
        id={"instr"}
      />
    ))}
    {courseCategories.map((category) => (
      <Category
        category={category.name}
        items={category.tags}
        onChange={filterCourse}
        key={category.id}
        id={"course"}
      />
    ))}
  */

  return (
    <div className="container">
      <div className="h3">Directory</div>
      <div className="divider-border"></div>
      <div className="row mb-3">
        <div className="col-12">
          <Searchbar
            placeholder="Search"
            onChange={(e) => setSearch(e.target.value)}
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
      {/* TODO: Pagination on scroll event */}
      <div className="row">
        {display === "providers" &&
          providerSearchResults.map((p) => (
            <Card
              key={p._id}
              _id={p._id}
              image={p.image || "https://via.placeholder.com/500x500"}
              href={`/provider/profile/${p._id}`}
              title={typeof p.user === "object" ? p.user.name : ""}
              subtitle={
                p.address && typeof p.address === "object"
                  ? `${p.address.city}, ${p.address.state}`
                  : ""
              }
              text={
                p.bio && p.bio.length < 50
                  ? p.bio
                  : p.bio
                  ? `${p.bio.substring(0, 49)}...`
                  : undefined
              }
            ></Card>
          ))}
        {display === "courses" &&
          courseSearchResults.map((c) => (
            <Card
              key={c._id}
              _id={c._id}
              image={c.image || "https://via.placeholder.com/500x500"}
              href={`/course/${c._id}`}
              title={c.name}
              subtitle={
                c.location && typeof c.location === "object"
                  ? `${c.location.city}, ${c.location.state}`
                  : ""
              }
              text={
                c.description && c.description.length < 50
                  ? c.description
                  : `${c.description.substring(0, 49)}...`
              }
            ></Card>
          ))}
        {display === "sessions" &&
          sessionSearchResults.map((s) => (
            <Card
              key={s._id}
              _id={s._id}
              image={s.image || "https://via.placeholder.com/500x500"}
              href={
                s.URL
                  ? s.URL
                  : typeof s.course === "object"
                  ? `/course/${s.course._id}`
                  : ""
              }
              title={s.name}
              subtitle={typeof s.course === "object" ? s.course.name : ""}
              text={
                typeof s.course === "object" && s.course.description
                  ? s.course.description.length < 50
                    ? s.course.description
                    : `${s.course.description.substring(0, 49)}...`
                  : ""
              }
            ></Card>
          ))}
      </div>
    </div>
  );
};

export default Directory;
