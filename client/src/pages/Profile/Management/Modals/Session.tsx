import React, { useEffect, useRef, useState } from "react";
import Select from "react-select";
import Modal from "react-bootstrap/Modal";
import Session from "../../../../API/Session";
import { Course as CourseType } from "../../../../@types/Models";
import {
    ErrorResponse,
    ImageResponse,
    SessionResponse
} from "../../../../@types/Response";
import { reloadImage } from "../../../../utils/reload";
import { Info } from "../../../../@types/misc";

interface Props {
    setModal: React.Dispatch<React.SetStateAction<boolean>>;
    showModal: boolean;
    providerCourses: CourseType[];
    info: Info;
    setInfo: React.Dispatch<React.SetStateAction<Info>>;
}

export const SessionModal: React.FC<Props> = ({
    setModal,
    showModal,
    providerCourses,
    info,
    setInfo
}) => {
    const [selectedCourse, setSelectedCourse] = useState<CourseType | null>(
        null
    );

    // field state
    const [errors, setError] = useState({
        name: null,
        URL: null,
        course: null,
        image: null
    });

    const [formData, setFormData] = useState<{
        name: string;
        URL: string;
        image: File | null;
    }>({
        name: "",
        URL: "",
        image: null
    });

    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const currentImage = useRef<string | null>(null);

    const onChange = (e) => {
        if (e.target.type === "checkbox")
            setFormData({ ...formData, [e.target.name]: e.target.checked });
        else setFormData({ ...formData, [e.target.name]: e.target.value });
        setError({ ...errors, [e.target.name]: null });
    };

    // allows the enter key to submit the form
    const enterSubmit = async (
        e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        if (e.keyCode === 13) {
            e.preventDefault();
            await onSubmit();
        }
    };

    const onSubmit = async () => {
        let sessionResp: SessionResponse | ErrorResponse;
        if (!info)
            sessionResp = await Session.createSession(
                formData.name,
                formData.URL,
                selectedCourse ? selectedCourse._id : undefined
            );
        else
            sessionResp = await Session.updateSession(
                info.id,
                formData.name,
                formData.URL,
                selectedCourse ? selectedCourse._id : undefined
            );

        if (sessionResp.success) {
            let imageResp:
                | ImageResponse
                | SessionResponse
                | ErrorResponse
                | null = null;

            if (currentImage.current !== null && selectedImage === null) {
                imageResp = await Session.removeImage(
                    sessionResp.data.session._id
                );
            } else if (
                currentImage.current !== selectedImage &&
                formData.image
            ) {
                imageResp = await Session.uploadImage(
                    sessionResp.data.session._id,
                    formData.image
                );

                if (imageResp && imageResp.success && imageResp.data.image) {
                    // reload image on the site
                    reloadImage(imageResp.data.image);
                }
            }

            if ((imageResp && imageResp.success) || imageResp === null) {
                setError({
                    name: null,
                    URL: null,
                    course: null,
                    image: null
                });

                setModal(false);
                setInfo(false);
                setFormData({ ...formData, name: "", URL: "" });
                currentImage.current = null;
                setSelectedImage(null);
            } else {
                setInfo({ type: "session", id: sessionResp.data.session._id });
                setError(imageResp.error as any);
            }
        } else {
            setError(sessionResp.error as any);
        }
    };

    useEffect(() => {
        if (showModal && info) {
            Session.getSession(info.id).then((resp) => {
                if (resp.success) {
                    const session = resp.data.session;
                    const { course } = session;

                    setSelectedCourse(
                        providerCourses.filter((c) => c._id === course._id)[0]
                    );

                    if (session.image) {
                        currentImage.current = session.image;
                        setSelectedImage(session.image);
                    }

                    setFormData({
                        ...formData,
                        name: session.name,
                        URL: session.URL || ""
                    });
                }
            });
        }
    }, [info, showModal]);

    return (
        <Modal
            size="lg"
            show={showModal}
            onHide={() => {
                setModal(!showModal);
                setInfo(false);
                setFormData({ ...formData, name: "", URL: "" });
                setError({
                    name: null,
                    URL: null,
                    course: null,
                    image: null
                });
                currentImage.current = null;
                setSelectedImage(null);
            }}
        >
            <Modal.Header>
                <h5>{info ? "Edit Session" : "Create a Session"}</h5>
            </Modal.Header>
            <Modal.Body>
                <div className="form-group mb-4">
                    <label className="form-label">Name:</label>
                    <input
                        className={
                            errors.name
                                ? "form-control is-invalid"
                                : "form-control"
                        }
                        type="text"
                        placeholder="Session Name"
                        name="name"
                        required
                        value={formData.name}
                        onChange={onChange}
                        onKeyUp={enterSubmit}
                    />
                    <div className="invalid-feedback">{errors.name}</div>
                </div>
                <div className="form-group mb-4">
                    <label className="form-label">URL:</label>
                    <input
                        className={
                            errors.URL
                                ? "form-control is-invalid"
                                : "form-control"
                        }
                        type="text"
                        placeholder="URL"
                        name="URL"
                        value={formData.URL}
                        onChange={onChange}
                        onKeyUp={enterSubmit}
                    />
                    <div className="invalid-feedback">
                        {errors.URL + " Ex: https://mydomain.com"}
                    </div>
                </div>
                <div className="form-group mb-4">
                    <label className="form-label">Course:</label>
                    <Select
                        options={providerCourses.map((val) => {
                            return { value: val._id, label: val.name };
                        })}
                        value={
                            selectedCourse
                                ? {
                                      value: selectedCourse._id,
                                      label: selectedCourse.name
                                  }
                                : undefined
                        }
                        onChange={({ value }: any) => {
                            const course = providerCourses.filter(
                                (c) => c._id === value
                            )[0];
                            setSelectedCourse(course);
                        }}
                        styles={{
                            control: (provided) =>
                                errors.course
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
                    {errors.course && (
                        <div className="text-danger">{errors.course}</div>
                    )}
                </div>
                <div className="form-group mb-4">
                    <label className="form-label">Image:</label>
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
                            if (e.target.files && e.target.files.length > 0) {
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
                        setModal(false);
                        setInfo(false);
                        setFormData({ ...formData, name: "", URL: "" });
                        setError({
                            name: null,
                            URL: null,
                            course: null,
                            image: null
                        });
                        currentImage.current = null;
                        setSelectedImage(null);
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
    );
};

export default SessionModal;
