import React, { useEffect, useState } from "react";
import { useMatch, useSearchParams } from "react-router-dom";
import { Course as CourseType } from "../../../@types/Models";
import Course from "../../../API/Course";
import ResultList from "../../../components/ResultList";
import Error404 from "./../../ErrorPages/404";

interface Props {}

export const Courses: React.FC<Props> = () => {
    const [searchParams] = useSearchParams();
    const match = useMatch("/embedded/courses/:id");
    const providerID = match ? match.params.id : null;

    const [courses, setCourses] = useState<CourseType[]>([]);

    useEffect(() => {
        if (providerID)
            Course.getAllProvidersCourses(providerID).then((c) =>
                setCourses(c)
            );
    }, []);

    if (!providerID) return <Error404 />;

    return (
        <ResultList
            title="Classes"
            items={courses.map((c) => {
                return {
                    _id: c._id,
                    title: c.name,
                    subtitle: c.description,
                    href: `/course/${c._id}`,
                    image: c.image || "https://picsum.photos/500/500?" + c._id,
                    newTab: searchParams.get("newTab") === "true" ? true : false
                };
            })}
        />
    );
};

export default Courses;
