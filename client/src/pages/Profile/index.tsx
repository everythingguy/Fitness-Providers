import React, { useState, useEffect, useContext, useRef } from "react";
import Select from "react-select";
import { Link, useMatch } from "react-router-dom";
import Error404 from "../ErrorPages/404";
import { Provider, Course, LiveSession, Tag } from "../../API";
import {
    Provider as ProviderType,
    Course as CourseType,
    LiveSession as LiveSessionType,
    Tag as TagType
} from "../../@types/Models";
import Loading from "../../components/Loading";
import { formatPhoneNumber } from "./../../utils/format";
import { ResultList } from "../../components";
import ReactCalendar from "react-calendar";
import { liveSessionTimeToString } from "../../utils/Date";
import { liveSessionDateToString } from "./../../utils/Date";
import { UserContext } from "../../context/UserState";
import { Alert, Modal } from "react-bootstrap";
import { reloadImage } from "../../utils/reload";

interface Props {}

export const Profile: React.FC<Props> = () => {
    const match = useMatch("/provider/profile/:id");
    const providerID = match ? match.params.id : null;

    const { user } = useContext(UserContext);

    const isMyProfile =
        providerID && user && user.provider && user.provider._id === providerID;

    const [providerData, setProviderData] = useState<
        ProviderType | null | false
    >(null);
    const [courseData, setCourseData] = useState<CourseType[]>([]);
    const [liveSessionData, setLiveSessionData] = useState<LiveSessionType[]>(
        []
    );

    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [page, setPage] = useState<{
        course: number | null;
        liveSession: number | null;
    }>({ course: 1, liveSession: 1 });

    const [showEditModal, setEditModal] = useState(false);
    const [showExportModal, setExportModal] = useState(false);
    const [selectedTags, setSelectedTags] = useState<
        { value: string; label: string }[]
    >([]);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const currentImage = useRef<string | null>(null);
    const [providerTags, setProviderTags] = useState<TagType[]>([]);

    const [formData, setFormData] = useState<{
        image: File | null;
        bio: string | null;
    }>({
        image: null,
        bio: null
    });

    const [errors, setError] = useState<{
        tags: string | null;
        image: string | null;
        bio: string | null;
    }>({
        tags: null,
        image: null,
        bio: null
    });

    const searchCourses = () => {
        if (providerID && page.course)
            Course.getProvidersCourses(providerID, { page: page.course }).then(
                (resp) => {
                    if (resp.success) {
                        if (page.course === 1) setCourseData(resp.data.courses);
                        else
                            setCourseData([
                                ...courseData,
                                ...resp.data.courses
                            ]);

                        if (!resp.hasNextPage)
                            setPage({ ...page, course: null });
                    }
                }
            );
    };

    const searchLiveSessions = () => {
        if (providerID && page.liveSession)
            LiveSession.getProviderLiveSessions(providerID, {
                day: selectedDate ? selectedDate.toISOString() : undefined,
                page: page.liveSession
            }).then((resp) => {
                if (resp.success) {
                    if (page.liveSession === 1)
                        setLiveSessionData(resp.data.liveSessions);
                    else
                        setLiveSessionData([
                            ...liveSessionData,
                            ...resp.data.liveSessions
                        ]);

                    if (!resp.hasNextPage)
                        setPage({ ...page, liveSession: null });
                }
            });
    };

    const onChange = (e) => {
        if (e.target.type === "checkbox")
            setFormData({ ...formData, [e.target.name]: e.target.checked });
        else setFormData({ ...formData, [e.target.name]: e.target.value });
        setError({ ...errors, [e.target.name]: null });
    };

    const onSubmit = () => {
        if (providerID && providerData)
            Provider.updateProvider(providerID, {
                tags: selectedTags.map((tag) => tag.value),
                bio:
                    formData.bio && formData.bio.length > 0
                        ? formData.bio
                        : null
            }).then((resp) => {
                if (resp.success) {
                    setProviderData(resp.data.provider);

                    if (
                        currentImage.current !== null &&
                        selectedImage === null
                    ) {
                        // remove image
                        Provider.removeImage(providerID).then((resp) => {
                            if (resp.success) {
                                setProviderData({
                                    ...providerData,
                                    image: undefined
                                });
                                setEditModal(false);
                            } else
                                setError({
                                    ...errors,
                                    ...(resp.error as any)
                                });
                        });
                    } else if (
                        currentImage.current !== selectedImage &&
                        formData.image
                    ) {
                        // upload image
                        Provider.uploadImage(providerID, formData.image).then(
                            (resp) => {
                                if (resp.success && resp.data.image) {
                                    setProviderData({
                                        ...providerData,
                                        image: resp.data.image
                                    });
                                    // reload image on the site
                                    reloadImage(resp.data.image);
                                    setEditModal(false);
                                } else
                                    setError({
                                        ...errors,
                                        ...(resp.error as any)
                                    });
                            }
                        );
                    } else setEditModal(false);
                } else
                    setError({
                        ...errors,
                        ...(resp.error as any)
                    });
            });
    };

    const resetForm = () => {
        if (providerData)
            setSelectedTags(
                providerData.tags.map((tag) => {
                    return {
                        value: tag._id,
                        label: tag.value
                    };
                })
            );

        if (providerData) currentImage.current = providerData.image || null;
        else currentImage.current = null;

        if (providerData) setSelectedImage(providerData.image || null);
        else setSelectedImage(null);
    };

    useEffect(() => {
        Tag.getProviderTags().then((resp) => {
            if (resp.success) {
                setProviderTags(resp.data.tags);
            }
        });

        if (providerID) {
            Provider.getProvider(providerID).then((resp) => {
                if (resp.success) {
                    const { provider } = resp.data;
                    setProviderData(provider);
                    setSelectedTags(
                        provider.tags.map((tag) => {
                            return { value: tag._id, label: tag.value };
                        })
                    );
                    setFormData({
                        ...formData,
                        bio: provider.bio ? provider.bio : null
                    });
                    if (provider.image) {
                        currentImage.current = provider.image;
                        setSelectedImage(provider.image);
                    }
                } else setProviderData(false);
            });

            searchCourses();
        }
    }, []);

    useEffect(() => {
        if (page.course) searchCourses();
    }, [page.course]);

    useEffect(() => {
        if (page.liveSession) searchLiveSessions();
    }, [page.liveSession]);

    useEffect(() => {
        if (page.liveSession === 1) searchLiveSessions();
        else setPage({ ...page, liveSession: 1 });
    }, [selectedDate]);

    if (!providerID || providerData === false) return <Error404 />;
    if (providerData === null) return <Loading />;

    return (
        <>
            {isMyProfile && user && user.provider && !user.provider.isEnrolled && (
                <Alert variant="warning">
                    Your account is currently private. Select a subscription{" "}
                    <Link to="/user/settings/subscription">here</Link> to go
                    public.
                </Alert>
            )}
            <div className="row mb-3">
                <div className="col-lg-6 col-md-12 text-center">
                    <div className="mx-auto position-relative">
                        <img
                            style={{ width: "100%", height: "100%" }}
                            src={
                                providerData.image ||
                                "https://picsum.photos/500/500?" +
                                    providerData._id
                            }
                        />
                        {isMyProfile && (
                            <div className="zindex-popover top-0 position-absolute w-100 h-100">
                                <button
                                    className="mx-auto bg-black opacity-transition w-100 h-100 d-flex text-center justify-content-center align-items-center"
                                    onClick={() => setEditModal(true)}
                                >
                                    <i
                                        className="bi bi-pencil-square text-white"
                                        style={{ fontSize: "10rem" }}
                                    ></i>
                                </button>
                            </div>
                        )}
                    </div>
                    <h1>
                        {providerData.user.name}{" "}
                        {isMyProfile && (
                            <button
                                className="btn"
                                role="button"
                                onClick={() => setEditModal(true)}
                            >
                                <i className="bi bi-pencil-square fs-4"></i>
                            </button>
                        )}
                    </h1>
                    {providerData.bio && <pre>{providerData.bio}</pre>}
                    <p className="mb-0">
                        <a
                            className="mb-0 text-decoration-none text-reset"
                            href={
                                "tel:" + formatPhoneNumber(providerData.phone)
                            }
                        >
                            <i className="bi bi-telephone"></i>{" "}
                            {formatPhoneNumber(providerData.phone)}
                        </a>
                    </p>
                    <p className="mb-0">
                        <a
                            className="mb-0 text-decoration-none text-reset"
                            href={"mailto:" + providerData.user.email}
                        >
                            <i className="bi bi-envelope"></i>{" "}
                            {providerData.user.email}
                        </a>
                    </p>
                    {/* TODO: external link warning */}
                    {providerData.website && (
                        <a
                            className="mb-0 text-decoration-none text-reset"
                            href={providerData.website}
                            target="_blank"
                            rel="noreferrer noopener"
                        >
                            <i className="bi bi-globe"></i>{" "}
                            {providerData.website}
                        </a>
                    )}
                    {providerData.address && (
                        <p className="mb-0">
                            <i className="bi bi-geo-alt"></i>{" "}
                            {`${providerData.address.city}, ${providerData.address.state} ${providerData.address.zip}`}
                        </p>
                    )}
                    <div className="mt-3">
                        {providerData.tags.map((t) => (
                            <Link
                                className="text-decoration-none"
                                to={`/directory/providers?provider_tags=${t._id}`}
                                key={t._id}
                            >
                                <span className="me-2 p-1 bg-dark text-light rounded">
                                    {t.value}
                                </span>
                            </Link>
                        ))}
                        {isMyProfile && (
                            <button
                                role="button"
                                className="me-2 p-1 bg-dark text-light rounded"
                                onClick={() => setEditModal(true)}
                            >
                                +
                            </button>
                        )}
                    </div>
                </div>
                <div className="col-lg-6 col-md-12 p-0">
                    {user &&
                        user.provider &&
                        user.provider.isEnrolled &&
                        isMyProfile && (
                            <button
                                type="button"
                                className="float-end border-0 bg-transparent"
                                onClick={() => setExportModal(true)}
                            >
                                <i className="bi bi-share"></i>
                            </button>
                        )}
                    <ResultList
                        title="Courses"
                        maxHeight="550px"
                        items={courseData.map((c) => ({
                            _id: c._id,
                            image:
                                c.image ||
                                "https://picsum.photos/500/500?" + c._id,
                            title: c.name,
                            subtitle: c.location
                                ? `${c.location.city}, ${c.location.state} ${c.location.zip}`
                                : undefined,
                            href: `/course/${c._id}`
                        }))}
                        onScrollBottom={() => {
                            if (page.course)
                                setPage({
                                    ...page,
                                    course: page.course + 1
                                });
                        }}
                    />
                </div>
            </div>
            <div className="row mb-3">
                <div className="col-lg-6 col-md-12 d-flex align-items-center">
                    <div style={{ height: "20rem" }}>
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
                <div className="col-lg-6 col-md-12 p-0">
                    <ResultList
                        title="Live Sessions"
                        items={liveSessionData.map((s) => ({
                            _id: s._id,
                            image:
                                s.session.image ||
                                "https://picsum.photos/500/500?" + s._id,
                            title: s.session.name,
                            date: selectedDate
                                ? liveSessionTimeToString(
                                      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                                      s
                                  )
                                : liveSessionDateToString(
                                      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                                      s
                                  ),
                            href:
                                s.session.URL ||
                                `/course/${s.session.course._id}`,
                            external: s.session.URL ? true : false
                        }))}
                        onScrollBottom={() => {
                            if (page.liveSession)
                                setPage({
                                    ...page,
                                    liveSession: page.liveSession + 1
                                });
                        }}
                    />
                </div>
            </div>
            {user && user.provider && user.provider.isEnrolled && isMyProfile && (
                <Modal
                    size="lg"
                    show={showExportModal}
                    onHide={() => {
                        setExportModal(false);
                    }}
                >
                    <Modal.Header>My Courses IFrame</Modal.Header>
                    <Modal.Body>
                        <p>
                            You can share your courses on other websites using
                            an iframe.
                        </p>
                        <textarea
                            readOnly
                            className="w-100"
                            style={{ height: "250px" }}
                            value={`<iframe src="${window.location.protocol}//${window.location.hostname}/embedded/courses/${user.provider._id}/?newTab=false" height="500" width="500" frameborder="0"></iframe>
                        `}
                        ></textarea>
                    </Modal.Body>
                    <Modal.Footer></Modal.Footer>
                </Modal>
            )}
            <Modal
                size="lg"
                show={showEditModal}
                onHide={() => {
                    setEditModal(false);
                    resetForm();
                }}
            >
                <Modal.Header>Edit Profile</Modal.Header>
                <Modal.Body>
                    <div className="form-group mb-4">
                        <label className="form-label">Bio:</label>
                        <textarea
                            className={
                                errors.bio
                                    ? "form-control is-invalid"
                                    : "form-control"
                            }
                            rows={5}
                            placeholder="bio"
                            name="bio"
                            required
                            value={formData.bio || ""}
                            onChange={onChange}
                        />
                        <div className="invalid-feedback">{errors.bio}</div>
                    </div>
                    <div className="form-group mb-4">
                        <label className="form-label">Tags:</label>
                        <Select
                            options={providerTags.map((tag) => {
                                return { value: tag._id, label: tag.value };
                            })}
                            onChange={(arr) => {
                                setSelectedTags([...arr]);
                            }}
                            value={selectedTags}
                            isMulti
                            closeMenuOnSelect={false}
                            styles={{
                                control: (provided) =>
                                    errors.tags
                                        ? {
                                              ...provided,
                                              borderColor: "#dc3545",
                                              "&:hover": {
                                                  borderColor: "#a21c29"
                                              }
                                          }
                                        : provided
                            }}
                        />
                        {errors.tags && (
                            <div className="text-danger">{errors.tags}</div>
                        )}
                    </div>
                    <div className="form-group mb-4">
                        <label className="form-label">Profile Picture:</label>
                        <input
                            className={
                                errors.image
                                    ? "form-control is-invalid"
                                    : "form-control"
                            }
                            type="file"
                            name="image"
                            accept=".jpg,.jpeg,.png"
                            onChange={(e) => {
                                if (
                                    e.target.files &&
                                    e.target.files.length > 0
                                ) {
                                    setSelectedImage(
                                        URL.createObjectURL(e.target.files[0])
                                    );
                                    setFormData({
                                        ...formData,
                                        image: e.target.files[0]
                                    });
                                }
                            }}
                        />
                        {selectedImage && (
                            <>
                                <img
                                    className="img-thumbnail col-md-3"
                                    src={selectedImage}
                                />
                                <br />
                                <button
                                    className="btn btn-danger mb-4"
                                    type="button"
                                    onClick={() => setSelectedImage(null)}
                                >
                                    Remove
                                </button>
                            </>
                        )}
                        <div className="invalid-feedback">{errors.image}</div>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <button
                        className="btn btn-danger mb-4"
                        type="button"
                        onClick={() => {
                            setEditModal(false);
                            resetForm();
                        }}
                    >
                        Cancel
                    </button>

                    <button
                        className="btn btn-primary mb-4"
                        type="button"
                        onClick={onSubmit}
                    >
                        Submit
                    </button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export * from "./Management";
export * from "./MyProfile";
export default Profile;
