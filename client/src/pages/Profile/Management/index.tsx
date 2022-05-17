import React, { useState, useEffect, useContext } from "react";
import { Link, Navigate } from "react-router-dom";
import Button from "react-bootstrap/Button";
import Searchbar from "../../../components/Searchbar";
import { Category as CategoryType } from "../../../@types/Models";
import Category from "../../../components/Category";
import CategoryAPI from "../../../API/Category";
import { CourseModal, SessionModal } from "./Modals";
import { UserContext } from "../../../context/UserState";

interface Props {}

export const Management: React.FC<Props> = () => {
  // logged in context
  const { loggedIn, user } = useContext(UserContext);

  const [showCourseModal, setCourseModal] = useState(false);
  const [showSessionModal, setSessionModal] = useState(false);
  const [searchParams, setSearchParams] = useState<{
    keywords: string;
    selectedCourseTags: string[];
  }>({
    keywords: "",
    selectedCourseTags: [],
  });

  const [categories, setCategories] = useState<CategoryType[]>([]);

  useEffect(() => {
    CategoryAPI.getCourseCategories().then((resp) => {
      if (resp.success) setCategories(resp.data.categories);
    });
  }, []);

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
              Add Video
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
              {/* <ResultList
                title="Classes"
                component={ClassResult}
                items={courseResults}
                onEditOptional={(id) => openCourseModal(id)}
                onDeleteOptional={(id) => openDeleteCourseModal(id)}
                onScrollBottom={(e) => {
                  if (hasNextCoursePage) setCoursePage(coursePage + 1);
                }}
              /> */}
            </div>
            <div>
              {/* <ResultList
                title="Videos"
                component={VideoResult}
                items={sessionResults}
                onEditOptional={(id) => openSessionModal(id)}
                onDeleteOptional={(id) => openDeleteSessionModal(id)}
                onScrollBottom={(e) => {
                  if (hasNextSessionPage) setSessionPage(sessionPage + 1);
                }}
              /> */}
            </div>
          </div>
        </div>
      </div>

      <CourseModal setModal={setCourseModal} showModal={showCourseModal} />
      <SessionModal setModal={setSessionModal} showModal={showSessionModal} />
    </div>
  );
};

export default Management;
export * from "./EventManagement";
export * from "./Modals";
