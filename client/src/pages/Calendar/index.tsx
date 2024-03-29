import React, { useContext, useEffect, useRef, useState } from "react";
import ReactCalendar from "react-calendar";
import Modal from "react-bootstrap/Modal";
import ResultList from "../../components/ResultList";
import Searchbar from "../../components/Searchbar";
import CategoryComp from "../../components/Category";
import LiveSession from "../../API/LiveSession";
import Category from "../../API/Category";
import {
    LiveSession as LiveSessionType,
    Category as CategoryType,
    Tag as TagType
} from "../../@types/Models";
import { liveSessionTimeToString } from "../../utils/Date";
import { liveSessionDateToString } from "./../../utils/Date";
import { UserContext } from "../../context/UserState";
import ExternalWarning from "../../components/ExternalWarning";

interface Props {}

export const Calendar: React.FC<Props> = () => {
    const { user } = useContext(UserContext);
    const [selectedDate, setSelectedDate] = useState<Date | null>(
        new Date(new Date().setHours(0, 0, 0, 0))
    );
    const [liveSessions, setLiveSessions] = useState<LiveSessionType[]>([]);
    const [categories, setCategories] = useState<CategoryType[]>([]);
    const [tags, setTags] = useState<{ [key: string]: boolean }>({});
    const [search, setSearch] = useState("");
    const [zip, setZip] = useState<number | null>(null);
    const [page, setPage] = useState<number | null>(1);
    const [showFilterModal, setFilterModal] = useState(false);
    const [externalWarningState, setExternalWarningState] = useState({
        showModal: false,
        link: "",
        newTab: true
    });

    const searchTimeout = useRef<number | null>(null);

    const searchLiveSessions = () => {
        const tagsArr: string[] = [];
        for (const tag in tags) if (tags[tag]) tagsArr.push(tag);

        LiveSession.getLiveSessions({
            day: selectedDate ? selectedDate.toISOString() : undefined,
            page,
            tags: tagsArr,
            search,
            zip: zip ? zip : undefined
        }).then((resp) => {
            if (resp.success) {
                if (page === 1) setLiveSessions(resp.data.liveSessions);
                else
                    setLiveSessions([
                        ...liveSessions,
                        ...resp.data.liveSessions
                    ]);

                if (!resp.hasNextPage) setPage(null);
            }
        });
    };

    useEffect(() => {
        if (searchTimeout.current) window.clearTimeout(searchTimeout.current);

        searchTimeout.current = window.setTimeout(() => {
            if (page !== 1) setPage(1);
            else searchLiveSessions();

            searchTimeout.current = null;
        }, 250);
    }, [selectedDate, search, tags, zip]);

    useEffect(() => {
        if (page) searchLiveSessions();
    }, [page]);

    useEffect(() => {
        Category.getCourseCategories().then((resp) => {
            if (resp.success) setCategories(resp.data.categories);
        });
    }, []);

    const dicHasTruthyKey = (dic: { [key: string]: boolean }) => {
        for (const key in dic) {
            if (dic[key] && dic[key] === true) return true;
        }

        return false;
    };

    const filter = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTags({
            ...tags,
            [e.target.getAttribute("data-id") as string]: e.target.checked
        });
    };

    return (
        <>
            <div className="row mb-3">
                <div
                    className="col-12"
                    style={{ height: "22rem", width: "100vw" }}
                >
                    <ReactCalendar
                        className="w-100 h-100"
                        minDetail="year"
                        prev2Label={null}
                        next2Label={null}
                        calendarType="US"
                        selectRange={false}
                        onChange={(date) => {
                            if (
                                selectedDate &&
                                date.getTime() === selectedDate.getTime()
                            )
                                setSelectedDate(null);
                            else setSelectedDate(date);
                        }}
                        value={selectedDate}
                    />
                </div>
            </div>
            <div className="row">
                <Searchbar
                    placeholder="search"
                    onChange={(e) => setSearch(e.target.value)}
                    onFilterClick={() => setFilterModal(true)}
                    filtered={dicHasTruthyKey(tags)}
                />
            </div>
            <div className="row">
                <div
                    className="col-12"
                    style={{ height: "25rem", width: "100vw" }}
                >
                    <ResultList
                        title="Live Sessions"
                        onScrollBottom={() => {
                            if (page) setPage(page + 1);
                        }}
                        items={liveSessions.map((s) => ({
                            _id: s._id,
                            title: `${s.session.course.name} - ${s.session.name}`,
                            subtitle: s.session.course.location
                                ? `${s.session.course.location.city}, ${s.session.course.location.state} ${s.session.course.location.zip}`
                                : "online",
                            date: selectedDate
                                ? liveSessionTimeToString(s)
                                : liveSessionDateToString(s),
                            href:
                                s.session.URL ||
                                `/course/${s.session.course._id}`,
                            external: s.session.URL ? true : false,
                            setExternalWarningState,
                            image:
                                s.session.course.image ||
                                "https://picsum.photos/500/500?" + s._id,
                            hidden:
                                user &&
                                user.provider &&
                                !user.provider.isEnrolled &&
                                s.session.course.provider._id ===
                                    user.provider._id
                                    ? true
                                    : false
                        }))}
                    />
                </div>
            </div>
            <Modal
                size="lg"
                show={showFilterModal}
                onHide={() => setFilterModal(false)}
            >
                <div className="p-3">
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
                    {categories.map((category) => (
                        <CategoryComp
                            category={category.name}
                            items={(category.tags as TagType[]).map((t) => ({
                                ...t,
                                checked: tags[t._id] || false
                            }))}
                            onChange={filter}
                            key={category._id}
                            id={"course"}
                        />
                    ))}
                </div>
            </Modal>
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
        </>
    );
};

export default Calendar;
