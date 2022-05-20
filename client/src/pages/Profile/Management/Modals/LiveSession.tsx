import React, { useEffect, useState } from "react";
import Select from "react-select";
import Modal from "react-bootstrap/Modal";
import Session from "../../../../API/Session";
import { Course as CourseType } from "../../../../@types/Models";

type Info = { type: "course" | "session" | "live session"; id: string } | false;

interface Props {
  setModal: React.Dispatch<React.SetStateAction<boolean>>;
  showModal: boolean;
  providerCourses: CourseType[];
  info: Info;
  setInfo: React.Dispatch<React.SetStateAction<Info>>;
}

// TODO: image upload

// TODO: add additional live session inputs and API call

export const LiveSessionModal: React.FC<Props> = ({
  setModal,
  showModal,
  providerCourses,
  info,
  setInfo,
}) => {
  const [selectedCourse, setSelectedCourse] = useState<CourseType | null>(null);

  // field state
  const [errors, setError] = useState({
    name: null,
    URL: null,
    course: null,
    image: null,
  });

  const [formData, setFormData] = useState({
    name: "",
    URL: "",
  });

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
    let auth;
    if (!info)
      auth = await Session.createSession(
        formData.URL,
        formData.name,
        selectedCourse ? selectedCourse._id : undefined
      );
    else
      auth = await Session.updateSession(
        info.id,
        formData.URL,
        formData.name,
        selectedCourse ? selectedCourse._id : undefined
      );

    if (auth.success) {
      setError({
        name: null,
        URL: null,
        course: null,
        image: null,
      });

      setModal(false);
      setInfo(false);
      setFormData({ ...formData, name: "", URL: "" });
    } else {
      setError(auth.error as any);
    }
  };

  useEffect(() => {
    if (showModal && info) {
      Session.getSession(info.id).then((resp) => {
        if (resp.success) {
          const session = resp.data.session;
          const { course } = session;

          if (typeof course === "object")
            setSelectedCourse(
              providerCourses.filter((c) => c._id === course._id)[0]
            );

          setFormData({
            ...formData,
            name: session.name,
            URL: session.URL || "",
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
          image: null,
        });
      }}
    >
      <Modal.Header>
        <h5>{info ? "Edit Session" : "Create a Session"}</h5>
      </Modal.Header>
      <Modal.Body>
        <div className="form-group mb-4">
          <label className="form-label">Name:</label>
          <input
            className={errors.name ? "form-control is-invalid" : "form-control"}
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
            className={errors.URL ? "form-control is-invalid" : "form-control"}
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
                    label: selectedCourse.name,
                  }
                : undefined
            }
            onChange={({ value }: any) => {
              const course = providerCourses.filter((c) => c._id === value)[0];
              setSelectedCourse(course);
            }}
            styles={{
              control: (provided, state) =>
                errors.course
                  ? {
                      ...provided,
                      borderColor: "#dc3545",
                      "&:hover": {
                        borderColor: "#a21c29",
                      },
                    }
                  : provided,
            }}
          />
          {errors.course && <div className="text-danger">{errors.course}</div>}
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
              image: null,
            });
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

export default LiveSessionModal;
