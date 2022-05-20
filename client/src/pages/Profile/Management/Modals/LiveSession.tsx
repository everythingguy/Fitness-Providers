import React, { useEffect, useState } from "react";
import Select from "react-select";
import Modal from "react-bootstrap/Modal";
import Session from "../../../../API/Session";
import { Course as CourseType } from "../../../../@types/Models";
import { DatePicker, TimePicker, Space, InputNumber } from "antd";
import CircleToggle from "./../../../../components/CircleToggle";

import "antd/dist/antd.css";
import { WeekDays } from "../../../../@types/enums";

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
// https://ant.design/components/date-picker/

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
    session: null,
    beginDateTime: null,
    endDateTime: null,
    "recurring.weekDays": null,
    "recurring.frequency": null,
  });

  const [formData, setFormData] = useState<{
    name: string;
    URL: string;
    isRecurring: boolean;
    beginDateTime: Date | null;
    endDateTime: Date | null;
    recurring: { weekDays: WeekDays[]; frequency: number };
  }>({
    name: "",
    URL: "",
    isRecurring: false,
    beginDateTime: null,
    endDateTime: null,
    recurring: {
      weekDays: [],
      frequency: 1,
    },
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
        session: null,
        beginDateTime: null,
        endDateTime: null,
        "recurring.weekDays": null,
        "recurring.frequency": null,
      });

      setModal(false);
      setInfo(false);
      setFormData({
        name: "",
        URL: "",
        isRecurring: false,
        beginDateTime: null,
        endDateTime: null,
        recurring: {
          weekDays: [],
          frequency: 1,
        },
      });
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

  useEffect(() => {
    if (formData.recurring.weekDays.length === 0 && formData.isRecurring)
      setFormData({ ...formData, isRecurring: false });
    else if (formData.recurring.weekDays.length !== 0 && !formData.isRecurring)
      setFormData({ ...formData, isRecurring: true });
  }, [formData.recurring.weekDays]);

  const toggleWeekDayButton = (id: WeekDays) => {
    if (formData.recurring.weekDays.includes(id))
      setFormData({
        ...formData,
        recurring: {
          ...formData.recurring,
          weekDays: formData.recurring.weekDays.filter((day) => day !== id),
        },
      });
    else
      setFormData({
        ...formData,
        recurring: {
          ...formData.recurring,
          weekDays: [...formData.recurring.weekDays, id],
        },
      });
  };

  return (
    <Modal
      size="lg"
      show={showModal}
      onHide={() => {
        setModal(!showModal);
        setInfo(false);
        setFormData({
          name: "",
          URL: "",
          isRecurring: false,
          beginDateTime: null,
          endDateTime: null,
          recurring: {
            weekDays: [],
            frequency: 1,
          },
        });
        setError({
          name: null,
          URL: null,
          course: null,
          image: null,
          session: null,
          beginDateTime: null,
          endDateTime: null,
          "recurring.weekDays": null,
          "recurring.frequency": null,
        });
      }}
    >
      <Modal.Header>
        <h5>{info ? "Edit Live Session" : "Create a Live Session"}</h5>
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
        <div className="form-group mb-4">
          <label className="form-label">Session Date:</label>
          <br />
          <DatePicker popupStyle={{ zIndex: 1070 }} style={{ width: "100%" }} />
          {errors.beginDateTime || errors.endDateTime ? (
            <div className="text-danger">
              <p>{errors.beginDateTime}</p>
              <p>{errors.endDateTime}</p>
            </div>
          ) : (
            <></>
          )}
        </div>
        <div className="form-group mb-4">
          <label className="form-label">Session Time:</label>
          <br />
          <TimePicker popupStyle={{ zIndex: 1070 }} style={{ width: "100%" }} />
          {errors.beginDateTime || errors.endDateTime ? (
            <div className="text-danger">
              <p>{errors.beginDateTime}</p>
              <p>{errors.endDateTime}</p>
            </div>
          ) : (
            <></>
          )}
        </div>
        <div className="form-group mb-4">
          <label className="form-label me-3">Recurring:</label>
          <CircleToggle
            label="S"
            id={WeekDays.Sunday}
            enabled={formData.recurring.weekDays.includes(WeekDays.Sunday)}
            onChange={(id) => toggleWeekDayButton(id)}
          />
          <CircleToggle
            label="M"
            id={WeekDays.Monday}
            enabled={formData.recurring.weekDays.includes(WeekDays.Monday)}
            onChange={(id) => toggleWeekDayButton(id)}
          />
          <CircleToggle
            label="T"
            id={WeekDays.Tuesday}
            enabled={formData.recurring.weekDays.includes(WeekDays.Tuesday)}
            onChange={(id) => toggleWeekDayButton(id)}
          />
          <CircleToggle
            label="W"
            id={WeekDays.Wednesday}
            enabled={formData.recurring.weekDays.includes(WeekDays.Wednesday)}
            onChange={(id) => toggleWeekDayButton(id)}
          />
          <CircleToggle
            label="T"
            id={WeekDays.Thursday}
            enabled={formData.recurring.weekDays.includes(WeekDays.Thursday)}
            onChange={(id) => toggleWeekDayButton(id)}
          />
          <CircleToggle
            label="F"
            id={WeekDays.Friday}
            enabled={formData.recurring.weekDays.includes(WeekDays.Friday)}
            onChange={(id) => toggleWeekDayButton(id)}
          />
          <CircleToggle
            label="S"
            id={WeekDays.Saturday}
            enabled={formData.recurring.weekDays.includes(WeekDays.Saturday)}
            onChange={(id) => toggleWeekDayButton(id)}
          />
          {formData.isRecurring && (
            <span className="float-lg-end w-lg-25 d-lg-inline mt-lg-0 d-sm-block w-sm-100 mt-sm-3">
              Every{" "}
              <input
                className="border text-center d-inline"
                style={{ width: "25%" }}
                type="number"
                name="frequency"
                value={formData.recurring.frequency}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    recurring: {
                      ...formData.recurring,
                      frequency: parseInt(e.target.value, 10),
                    },
                  });
                }}
                onKeyUp={enterSubmit}
              />{" "}
              Week(s)
            </span>
          )}
        </div>
        {formData.isRecurring && (
          <div className="form-group mb-4">
            <label className="form-label">Until:</label>
            <br />
            <DatePicker
              popupStyle={{ zIndex: 1070 }}
              style={{ width: "100%" }}
            />
            {errors.beginDateTime || errors.endDateTime ? (
              <div className="text-danger">
                <p>{errors.beginDateTime}</p>
                <p>{errors.endDateTime}</p>
              </div>
            ) : (
              <></>
            )}
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <button
          className="btn btn-danger mb-4"
          type="button"
          onClick={() => {
            setModal(false);
            setInfo(false);
            setFormData({
              name: "",
              URL: "",
              isRecurring: false,
              beginDateTime: null,
              endDateTime: null,
              recurring: {
                weekDays: [],
                frequency: 1,
              },
            });
            setError({
              name: null,
              URL: null,
              course: null,
              image: null,
              session: null,
              beginDateTime: null,
              endDateTime: null,
              "recurring.weekDays": null,
              "recurring.frequency": null,
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
