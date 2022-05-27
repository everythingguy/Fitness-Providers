/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useEffect, useRef, useState } from "react";
import Modal from "react-bootstrap/Modal";
import Select from "react-select";

import { Tag, Address, Course } from "../../../../API";
import {
    Tag as TagType,
    Address as AddressType
} from "../../../../@types/Models";
import { UserContext } from "../../../../context/UserState";
import AddressModal from "./Address";
import {
    CourseResponse,
    ErrorResponse,
    ImageResponse
} from "../../../../@types/Response";
import { reloadImage } from "../../../../utils/reload";

type Info = { type: "course" | "session" | "live session"; id: string } | false;

interface Props {
    info: Info;
    setInfo: React.Dispatch<React.SetStateAction<Info>>;
    setModal: React.Dispatch<React.SetStateAction<boolean>>;
    showModal: boolean;
}

export const CourseModal: React.FC<Props> = ({
    setModal,
    showModal,
    info,
    setInfo
}) => {
    const first = useRef(true);
    const { user } = useContext(UserContext);

    const [showAddressModal, setShowAddressModal] = useState(false);
    const [selectedAddress, setSelectedAddress] = useState<
        | AddressType
        | { _id: "online"; street1: "Online" }
        | { _id: "new"; street1: "Add new address" }
    >({
        _id: "online",
        street1: "Online"
    });
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const renderedInfo = useRef(false);
    const currentAddress = useRef<AddressType | null>(null);
    const currentImage = useRef<string | null>(null);

    const [selectedTags, setSelectedTags] = useState<
        { value: string; label: string }[]
    >([]);

    // field state
    const [errors, setError] = useState({
        name: null,
        description: null,
        location: null,
        image: null,
        tags: null
    });

    const [formData, setFormData] = useState<{
        name: string;
        description: string;
        image: File | null;
    }>({
        name: "",
        description: "",
        image: null
    });

    const [courseTags, setCourseTags] = useState<TagType[]>([]);
    const [providerAddresses, setProviderAddresses] = useState<
        (
            | AddressType
            | { _id: "online"; street1: "Online" }
            | { _id: "new"; street1: "Add new address" }
        )[]
    >([]);

    useEffect(() => {
        if (showModal && info && !renderedInfo.current) {
            Course.getCourse(info.id).then((resp) => {
                if (resp.success) {
                    const course = resp.data.course;

                    setFormData({
                        ...formData,
                        name: course.name,
                        description: course.description
                    });

                    setSelectedTags(
                        course.tags.map((tag) => {
                            return { value: tag._id, label: tag.value };
                        })
                    );

                    if (course.image) {
                        currentImage.current = course.image;
                        setSelectedImage(course.image);
                    }

                    if (course.location) {
                        const location = course.location;
                        currentAddress.current = location;
                        setSelectedAddress(
                            providerAddresses.filter(
                                (addr) => addr._id === location._id
                            )[0]
                        );
                    } else
                        setSelectedAddress({
                            _id: "online",
                            street1: "Online"
                        });
                }
            });
            renderedInfo.current = true;
        }
    }, [info, showModal]);

    useEffect(() => {
        if (user && user.provider)
            Address.getProvidersAddresses(user.provider._id).then((resp) => {
                if (resp.success)
                    setProviderAddresses([
                        ...resp.data.addresses,
                        {
                            _id: "online",
                            street1: "Online"
                        },
                        {
                            _id: "new",
                            street1: "Add new address"
                        }
                    ]);
            });

        Tag.getCourseTags().then((resp) => {
            if (resp.success) setCourseTags(resp.data.tags);
        });
    }, [user]);

    useEffect(() => {
        if (providerAddresses.length > 0 && first.current) {
            setSelectedAddress(
                providerAddresses.filter((val) => {
                    if (user && user.provider && user.provider.address)
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        return val._id === user!.provider!.address._id;
                    return val._id === "online";
                })[0]
            );

            first.current = false;
        }
    }, [providerAddresses]);

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
        if (selectedAddress._id !== "new") {
            let courseResp: CourseResponse | ErrorResponse;
            if (!info)
                courseResp = await Course.createCourse(
                    formData.name,
                    formData.description,
                    selectedTags.map((tag) => tag.value),
                    selectedAddress._id
                );
            else
                courseResp = await Course.updateCourse(
                    info.id,
                    formData.name,
                    formData.description,
                    selectedTags.map((tag) => tag.value),
                    selectedAddress._id
                );

            if (courseResp.success) {
                setError({
                    name: null,
                    description: null,
                    location: null,
                    image: null,
                    tags: null
                });

                let imageResp:
                    | ImageResponse
                    | CourseResponse
                    | ErrorResponse
                    | null = null;

                if (currentImage.current !== null && selectedImage === null) {
                    imageResp = await Course.removeImage(
                        courseResp.data.course._id
                    );
                } else if (
                    currentImage.current !== selectedImage &&
                    formData.image
                ) {
                    imageResp = await Course.uploadImage(
                        courseResp.data.course._id,
                        formData.image
                    );

                    if (
                        imageResp &&
                        imageResp.success &&
                        imageResp.data.image
                    ) {
                        // reload image on the site
                        reloadImage(imageResp.data.image);
                    }
                }

                if ((imageResp && imageResp.success) || imageResp === null) {
                    setModal(false);
                    setSelectedTags([]);
                    if (user && user.provider && user.provider.address)
                        setSelectedAddress(user.provider.address);
                    else
                        setSelectedAddress({
                            _id: "online",
                            street1: "Online"
                        });
                    setFormData({ ...formData, name: "", description: "" });
                    if (info) setInfo(false);
                    renderedInfo.current = false;
                    currentAddress.current = null;
                    currentImage.current = null;
                    setSelectedImage(null);
                } else {
                    setInfo({ type: "course", id: courseResp.data.course._id });
                    setError(imageResp.error as any);
                }
            } else {
                setError(courseResp.error as any);
            }
        } else {
            setShowAddressModal(true);
            setModal(false);
        }
    };

    return (
        <>
            <AddressModal
                show={showAddressModal}
                setModal={setShowAddressModal}
                onSuccess={(address) => {
                    setModal(true);
                    setProviderAddresses([...providerAddresses, address]);
                    setSelectedAddress(address);
                }}
                onCancel={() => {
                    setModal(true);
                    if (info)
                        if (currentAddress.current)
                            setSelectedAddress(currentAddress.current);
                        else
                            setSelectedAddress({
                                _id: "online",
                                street1: "Online"
                            });
                    else if (user && user.provider && user.provider.address)
                        setSelectedAddress(user.provider.address);
                    else
                        setSelectedAddress({
                            _id: "online",
                            street1: "Online"
                        });
                }}
            />
            <Modal
                size="lg"
                show={showModal}
                onHide={() => {
                    setModal(!showModal);
                    setInfo(false);
                    setSelectedTags([]);
                    if (user && user.provider && user.provider.address)
                        setSelectedAddress(user.provider.address);
                    else
                        setSelectedAddress({
                            _id: "online",
                            street1: "Online"
                        });
                    setFormData({ ...formData, name: "", description: "" });
                    setError({
                        name: null,
                        description: null,
                        location: null,
                        image: null,
                        tags: null
                    });
                    renderedInfo.current = false;
                    currentAddress.current = null;
                    currentImage.current = null;
                    setSelectedImage(null);
                }}
            >
                <Modal.Header>
                    <h5>{info ? "Edit Course" : "Create a Course"}</h5>
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
                            placeholder="Name"
                            name="name"
                            required
                            value={formData.name}
                            onChange={onChange}
                            onKeyUp={enterSubmit}
                        />
                        <div className="invalid-feedback">{errors.name}</div>
                    </div>
                    <div className="form-group mb-4">
                        <label className="form-label">Description:</label>
                        <textarea
                            className={
                                errors.description
                                    ? "form-control is-invalid"
                                    : "form-control"
                            }
                            rows={5}
                            placeholder="description"
                            name="description"
                            required
                            value={formData.description}
                            onChange={onChange}
                            onKeyUp={enterSubmit}
                        />
                        <div className="invalid-feedback">
                            {errors.description}
                        </div>
                    </div>
                    <div className="form-group mb-4">
                        <label className="form-label">Location:</label>
                        <Select
                            options={providerAddresses.map((val) => {
                                return { value: val._id, label: val.street1 };
                            })}
                            value={
                                selectedAddress
                                    ? {
                                          value: selectedAddress._id,
                                          label: selectedAddress.street1
                                      }
                                    : undefined
                            }
                            onChange={({ value }: any) => {
                                const address = providerAddresses.filter(
                                    (addr) => addr._id === value
                                )[0];
                                setSelectedAddress(address);
                            }}
                            styles={{
                                control: (provided) =>
                                    errors.location
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
                        {errors.location && (
                            <div className="text-danger">{errors.location}</div>
                        )}
                    </div>
                    <div className="form-group mb-4">
                        <label className="form-label">Tags:</label>
                        <Select
                            options={courseTags.map((tag) => {
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
                            setModal(false);
                            setInfo(false);
                            setSelectedTags([]);
                            if (user && user.provider && user.provider.address)
                                setSelectedAddress(user.provider.address);
                            else
                                setSelectedAddress({
                                    _id: "online",
                                    street1: "Online"
                                });
                            setFormData({
                                ...formData,
                                name: "",
                                description: ""
                            });
                            setError({
                                name: null,
                                description: null,
                                location: null,
                                image: null,
                                tags: null
                            });
                            renderedInfo.current = false;
                            currentAddress.current = null;
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
        </>
    );
};

export default CourseModal;
