import React, { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import { Info } from "../../@types/misc";
import { Category as CategoryType } from "../../@types/Models";
import Tag from "../../API/Tag";
import Category from "../../API/Category";
import { ResultList } from "../../components/ResultList";
import { formatDate } from "../../utils/Date";
import DeleteModal from "../Profile/Management/Modals/Delete";
import { CategoryResponse, ErrorResponse } from "../../@types/Response";

interface Props {}

// TODO: Categories (make a database backup)
// Age group category (Seniors, Kids, Young Adults, Adults)
// Settings (Indoor, outdoor, online, inperson)
// Class Size (Personal, Small Group, Large Group)
// Price Range (0-50, 51-75, 76-100, 100+)
// Rating (1-5 stars)
// Length (1/2 hour, 3/4 hour, 1 hour, 1 1/2 hours 2+ hours)
// Certificates

export const Admin: React.FC<Props> = () => {
    const [categories, setCategories] = useState<CategoryType[]>([]);
    const [editDeleteInfo, setEditDeleteInfo] = useState<Info>(false);
    const [deleteTagInfo, setDeleteTagInfo] = useState<Info>(false);
    const [showModal, setModal] = useState(false);
    const [showDeleteModal, setDeleteModal] = useState(false);
    const [showTagDeleteModal, setTagDeleteModal] = useState(false);

    const [errors, setError] = useState({
        name: null,
        value: null
    });
    const [formData, setFormData] = useState({
        name: "",
        value: "",
        appliesToProvider: true,
        appliesToCourse: true
    });

    useEffect(() => {
        if (!showDeleteModal && !showTagDeleteModal && formData.value === "")
            searchCategories();
    }, [showDeleteModal, formData.value, showTagDeleteModal]);

    useEffect(() => {
        if (editDeleteInfo) {
            const category = categories.filter(
                (c) => c._id === editDeleteInfo.id
            )[0];
            setFormData({ ...formData, name: category.name });
        } else resetModal();
    }, [editDeleteInfo]);

    const searchCategories = () => {
        Category.getAllCategories().then((resp) => {
            setCategories(resp);
        });
    };

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

    const enterSubmitTag = async (
        e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        if (e.keyCode === 13) {
            e.preventDefault();
            await onTagSubmit();
        }
    };

    const resetTagForm = () => {
        setError({
            ...errors,
            value: null
        });
        setFormData({
            ...formData,
            value: ""
        });
    };

    const resetModal = () => {
        setModal(false);
        setError({
            name: null,
            value: null
        });
        setFormData({
            name: "",
            value: "",
            appliesToProvider: true,
            appliesToCourse: true
        });
    };

    const onSubmit = async () => {
        let resp: CategoryResponse | ErrorResponse;
        if (editDeleteInfo)
            resp = await Category.updateCategory(
                editDeleteInfo.id,
                formData.name
            );
        else resp = await Category.createCategory(formData.name);

        if (resp.success) {
            searchCategories();
            resetModal();
        } else setError(resp.error as any);
    };

    const onTagSubmit = async () => {
        if (editDeleteInfo && editDeleteInfo.type === "category") {
            await Tag.createTag(
                editDeleteInfo.id,
                formData.value,
                formData.appliesToProvider,
                formData.appliesToCourse
            );
            resetTagForm();
        }
    };

    return (
        <>
            <ResultList
                title="Categories"
                items={categories.map((c) => ({
                    _id: c._id,
                    title: c.name,
                    date: formatDate(c.updatedAt)
                }))}
                onEdit={(id) => {
                    setEditDeleteInfo({ id, type: "category" });
                    setModal(true);
                }}
                onDelete={(id) => {
                    setEditDeleteInfo({ id, type: "category" });
                    setDeleteModal(true);
                }}
            ></ResultList>
            <div className="d-flex justify-content-center">
                <button
                    className="btn btn-dark fw-bold text-light mt-4"
                    type="button"
                    onClick={() => setModal(true)}
                >
                    Create Category
                </button>
            </div>
            <Modal size="lg" show={showModal} onHide={resetModal}>
                <Modal.Header>
                    {editDeleteInfo ? "Edit Category" : "Create Category"}
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
                            value={formData.name}
                            onChange={onChange}
                            onKeyUp={enterSubmit}
                        />
                        <div className="invalid-feedback">{errors.name}</div>
                    </div>
                    {editDeleteInfo && (
                        <>
                            <ResultList
                                title="Tags"
                                items={categories
                                    .filter(
                                        (c) => c._id === editDeleteInfo.id
                                    )[0]
                                    .tags.map((t) => ({
                                        _id: t._id,
                                        title: `${t.value} ${
                                            t.appliesToCourse ? "🏫" : " "
                                        }  ${t.appliesToProvider ? "👩‍🏫" : " "}`,
                                        date: formatDate(t.updatedAt)
                                    }))}
                                onDelete={(id) => {
                                    setDeleteTagInfo({ id, type: "tag" });
                                    setTagDeleteModal(true);
                                }}
                            ></ResultList>
                            <div className="form-group mb-4">
                                <label className="form-label">Value:</label>
                                <input
                                    className={
                                        errors.value
                                            ? "form-control is-invalid"
                                            : "form-control"
                                    }
                                    type="text"
                                    placeholder="Value"
                                    name="value"
                                    value={formData.value}
                                    onChange={onChange}
                                    onKeyUp={enterSubmitTag}
                                />
                                <div className="invalid-feedback">
                                    {errors.value}
                                </div>
                            </div>
                            <div className="form-group">
                                <label
                                    className="form-label"
                                    style={{ width: "150px" }}
                                >
                                    Applies to Provider:
                                </label>
                                <input
                                    className="form-control form-check-input d-inline-block ms-4 p-2"
                                    type="checkbox"
                                    name="appliesToProvider"
                                    checked={formData.appliesToProvider}
                                    onChange={onChange}
                                />
                            </div>
                            <div className="form-group mb-4">
                                <label
                                    className="form-label"
                                    style={{ width: "150px" }}
                                >
                                    Applies to Course:
                                </label>
                                <input
                                    className="form-control form-check-input d-inline-block ms-4 p-2"
                                    type="checkbox"
                                    name="appliesToCourse"
                                    checked={formData.appliesToCourse}
                                    onChange={onChange}
                                />
                            </div>
                            <div className="d-flex justify-content-center">
                                <button
                                    className="btn btn-dark fw-bold text-light mt-4"
                                    type="button"
                                    onClick={onTagSubmit}
                                >
                                    Create Tag
                                </button>
                            </div>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <button
                        className="btn btn-danger mb-4"
                        type="button"
                        onClick={resetModal}
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
            <DeleteModal
                setModal={setDeleteModal}
                showModal={showDeleteModal}
                info={editDeleteInfo}
                setInfo={setEditDeleteInfo}
            />
            <DeleteModal
                setModal={setTagDeleteModal}
                showModal={showTagDeleteModal}
                info={deleteTagInfo}
                setInfo={setDeleteTagInfo}
            />
        </>
    );
};

export default Admin;
