import React from "react";
import { useState, useEffect, useRef } from "react";
import { Searchbar, Category, ResultList, Result } from "../../components";

interface Props {}

// TODO:

export const Directory: React.FC<Props> = () => {
  /*
  // State so we can use data from the backend in our components.
  const [instructorCategories, setInstructorCategories] = useState([]);
  const [courseCategories, setCourseCategories] = useState([]);
  const [courseSearchResults, setCourseSearchResults] = useState([]);
  const [sessionSearchResults, setSessionSearchResults] = useState([]);
  const [instructorSearchResults, setInstructorSearchResults] = useState([]);
  const [page, setPage] = useState({
    instructor: 1,
    course: 1,
    session: 1,
  });
  const [search, setSearch] = useState("");
  const [tags, setTags] = useState({
    instructor: {},
    course: {},
  });
  const timeout = useRef(null);
  const firstRender = useRef(true);

  const filterInstructor = (e) => {
    setTags({
      course: tags.course,
      instructor: {
        ...tags.instructor,
        [e.target.getAttribute("data-id")]: e.target.checked,
      },
    });
  };

  const filterCourse = (e) => {
    setTags({
      instructor: tags.instructor,
      course: {
        ...tags.course,
        [e.target.getAttribute("data-id")]: e.target.checked,
      },
    });
  };

  const createFilterURL = (tags) => {
    let URL = "";

    for (const tag in tags) {
      if (tags[tag]) {
        URL += "&tags__id__exact=" + tag;
      }
    }

    return URL;
  };

  const searchInstructors = () => {
    // populate instructors list
    let request = new DataRequest(
      "GET",
      "instructors/?search=" +
        search +
        createFilterURL(tags.instructor) +
        "&page=" +
        page.instructor
    );
    APIManager.sendRequest(
      request,
      (res) => {
        const instructors = res.data.results;
        let instructorArr = [];

        if (page.instructor > 1) instructorArr = [...instructorSearchResults];

        for (const instructor of instructors) {
          instructorArr.push({
            id: instructor.id,
            text: `${instructor.firstName} ${instructor.lastName}`,
            author: instructor.bio,
            img_url: instructor.image || "https://via.placeholder.com/500x500",
            href: `/profile/${instructor.id}`,
            value: instructor.tags,
            checked: false,
          });
        }

        setInstructorSearchResults(instructorArr); // populate instructor list
      },
      () => {
        setPage({
          ...page,
          instructor: null,
        });
      }
    );
  };

  const searchCourses = () => {
    // populate course list
    let request = new DataRequest(
      "GET",
      "courses/?search=" +
        search +
        createFilterURL(tags.course) +
        "&page=" +
        page.course
    );
    APIManager.sendRequest(
      request,
      (res) => {
        const courses = res.data.results;
        let courseArr = [];

        if (page.course > 1) courseArr = [...courseSearchResults];

        for (const course of courses) {
          courseArr.push({
            id: course.id,
            text: course.name,
            author: `${course.instructor.firstName} ${course.instructor.lastName}`,
            img_url: course.image || "https://via.placeholder.com/500x500",
            href: `/class/${course.id}/details`,
            value: course.tags,
            checked: false,
            date: convertDate(course.createdAt),
          });
        }

        setCourseSearchResults(courseArr); // populate course list
      },
      () => {
        setPage({
          ...page,
          course: null,
        });
      }
    );
  };

  const searchSessions = () => {
    // populate session list
    let request = new DataRequest(
      "GET",
      "sessions/?search=" + search + "&page=" + page.session
    );
    APIManager.sendRequest(
      request,
      (res) => {
        const sessions = res.data.results;
        let sessionArr = [];

        if (page.session > 1) sessionArr = [...sessionSearchResults];

        for (const session of sessions) {
          if (!session.liveSession) {
            sessionArr.push({
              id: session.id,
              text: session.name,
              author: `${session.course.instructor.firstName} ${session.course.instructor.lastName}`,
              img_url: session.image || "https://via.placeholder.com/500x500",
              href: session.sessionURL,
              checked: false,
            });
          }
        }

        setSessionSearchResults(sessionArr);

        if (sessionSearchResults.length < 50 && res.data.next) {
          setPage({
            ...page,
            session: page.session + 1,
          });
        }
      },
      () => {
        setPage({
          ...page,
          session: null,
        });
      }
    );
  };

  useEffect(() => {
    // populate instructor checklist from instructors api route
    let request = new DataRequest("GET", "instructortagcategories/");
    request.setOrdering("name");
    APIManager.getAllResults(request, (results) => {
      setInstructorCategories(results);
    });

    // populate category checklist from coursetagcategories api route
    request = new DataRequest("GET", "coursetagcategories/");
    request.setOrdering("name");
    APIManager.getAllResults(request, (results) => {
      setCourseCategories(results);
    });
  }, []);

  useEffect(() => {
    if (timeout.current) window.clearTimeout(timeout.current);

    timeout.current = window.setTimeout(() => {
      setPage({
        instructor: 1,
        course: 1,
        session: 1,
      });

      searchInstructors();
      searchCourses();
      searchSessions();
    }, 250);
  }, [search]);

  useEffect(() => {
    if (!firstRender.current) {
      setPage({
        ...page,
        instructor: 1,
      });
      searchInstructors();
    }
  }, [tags.instructor]);

  useEffect(() => {
    if (page.instructor && page.instructor != 1) {
      searchInstructors();
    }
  }, [page.instructor]);

  useEffect(() => {
    if (!firstRender.current) {
      setPage({
        ...page,
        course: 1,
      });
      searchCourses();
    } else firstRender.current = false;
  }, [tags.course]);

  useEffect(() => {
    if (page.course && page.course != 1) {
      searchCourses();
    }
  }, [page.course]);

  useEffect(() => {
    if (page.session && page.session != 1) {
      searchSessions();
    }
  }, [page.session]);

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
      <div className="row">
        <div className="col-xs-6 col-sm-4 col-md-5 col-lg-3 col-xl-3 col-xxl-3">
          <div className="card side-bar search mb-2">
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
          </div>
        </div>
        <div className="col-xs-6 col-sm-8 col-md-7 col-lg-9 col-xl-9 col-xxl-9">
          <div className="card">
            <ResultList
              title="Providers"
              component={InstructorResult}
              items={instructorSearchResults}
              onScrollBottom={(e) => {
                if (page.instructor)
                  setPage({
                    ...page,
                    instructor: page.instructor + 1,
                  });
              }}
            />
          </div>
          <div className="card">
            <ResultList
              title="Classes"
              component={Result}
              items={courseSearchResults}
              onScrollBottom={(e) => {
                if (page.course)
                  setPage({
                    ...page,
                    course: page.course + 1,
                  });
              }}
            />
          </div>
          <div className="card mb-2">
            <ResultList
              title="Asynchronous Sessions"
              component={Result}
              items={sessionSearchResults}
              onScrollBottom={(e) => {
                if (page.session)
                  setPage({
                    ...page,
                    session: page.session + 1,
                  });
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
  */
  return <></>;
};

export default Directory;
