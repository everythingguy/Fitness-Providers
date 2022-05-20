import React, { useEffect, useState } from "react";
import Select from "react-select";
import Modal from "react-bootstrap/Modal";
import Session from "../../../../API/Session";
import { Course as CourseType } from "../../../../@types/Models";
import { DatePicker, TimePicker } from "antd";
import CircleToggle from "./../../../../components/CircleToggle";
import moment from "moment";

import "antd/dist/antd.css";
import { WeekDays } from "../../../../@types/enums";
import {
  ErrorResponse,
  LiveSessionResponse,
  SessionResponse,
} from "../../../../@types/Response";
import LiveSession from "../../../../API/LiveSession";

type Info = { type: "course" | "session" | "live session"; id: string } | false;

interface Props {
  setModal: React.Dispatch<React.SetStateAction<boolean>>;
  showModal: boolean;
  providerCourses: CourseType[];
  info: Info;
  setInfo: React.Dispatch<React.SetStateAction<Info>>;
}

// TODO: image upload

// TODO: edit live session

export const LiveSessionModal: React.FC<Props> = ({
  setModal,
  showModal,
  providerCourses,
  info,
  setInfo,
}) => {
  const [selectedCourse, setSelectedCourse] = useState<CourseType | null>(null);

  // field state
  const [errors, setError] = useState<{ [key: string]: string | null }>({
    name: null,
    URL: null,
    course: null,
    image: null,
    session: null,
    time: null,
    beginDateTime: null,
    endDateTime: null,
    date: null,
    endDate: null,
    "recurring.weekDays": null,
    "recurring.frequency": null,
  });

  const [formData, setFormData] = useState<{
    name: string;
    URL: string;
    isRecurring: boolean;
    date: moment.Moment | null;
    time: moment.Moment[];
    recurring: {
      weekDays: WeekDays[];
      frequency: number;
      endDate: moment.Moment | null;
    };
  }>({
    name: "",
    URL: "",
    isRecurring: false,
    date: null,
    time: [],
    recurring: {
      weekDays: [],
      frequency: 1,
      endDate: null,
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

  const errorHandler = () => {
    const e: any = {};
    if (!formData.name) e.name = "Please enter a session name";
    if (!selectedCourse) e.course = "Please select a course";
    if (!formData.date) e.date = "Please select a session date";
    if (!formData.time || (formData.time && formData.time.length !== 2))
      e.time = "Please select a time";
    if (formData.isRecurring) {
      if (!formData.recurring.endDate) e.endDate = "Please select a end date";
      else if (formData.date && formData.recurring.endDate < formData.date)
        e.endDate = "Must be greater than session date";
    }

    if (Object.keys(e).length > 0) {
      setError(e);
      return true;
    } else return false;
  };

  const onSubmit = async () => {
    if (errorHandler()) return;

    let sessionResp: SessionResponse | ErrorResponse;
    if (!info)
      sessionResp = await Session.createSession(
        formData.name,
        formData.URL,
        selectedCourse ? selectedCourse._id : undefined
      );
    else {
      const resp = await LiveSession.getLiveSession(info.id);
      if (resp.success && typeof resp.data.liveSession.session === "string") {
        sessionResp = await Session.updateSession(
          resp.data.liveSession.session,
          formData.name,
          formData.URL,
          selectedCourse ? selectedCourse._id : undefined
        );
      } else if (
        resp.success &&
        typeof resp.data.liveSession.session === "object"
      ) {
        sessionResp = await Session.updateSession(
          resp.data.liveSession.session._id,
          formData.name,
          formData.URL,
          selectedCourse ? selectedCourse._id : undefined
        );
      } else {
        setError({
          ...errors,
          name: "Unable to find the session that this live session belongs to",
        });
        return;
      }
    }

    if (sessionResp.success) {
      let liveResp: LiveSessionResponse | ErrorResponse;
      if (!info)
        liveResp = await LiveSession.createLiveSession(
          sessionResp.data.session._id,
          moment(
            `${formData.date!.format("YYYY-MM-DD")} ${formData.time[0].format(
              "hh:mm:ss a"
            )}`,
            "YYYY-MM-DD hh:mm:ss a"
          ).toDate(),
          formData.isRecurring
            ? moment(
                `${formData.recurring.endDate!.format(
                  "YYYY-MM-DD"
                )} ${formData.time[1].format("hh:mm:ss a")}`,
                "YYYY-MM-DD hh:mm:ss a"
              ).toDate()
            : moment(
                `${formData.date!.format(
                  "YYYY-MM-DD"
                )} ${formData.time[1].format("hh:mm:ss a")}`,
                "YYYY-MM-DD hh:mm:ss a"
              ).toDate(),
          formData.isRecurring ? formData.recurring : undefined
        );
      else
        liveResp = await LiveSession.updateLiveSession(
          info.id,
          sessionResp.data.session._id,
          moment(
            `${formData.date!.format("YYYY-MM-DD")} ${formData.time[0].format(
              "hh:mm:ss a"
            )}`,
            "YYYY-MM-DD hh:mm:ss a"
          ).toDate(),
          formData.isRecurring
            ? moment(
                `${formData.recurring.endDate!.format(
                  "YYYY-MM-DD"
                )} ${formData.time[1].format("hh:mm:ss a")}`,
                "YYYY-MM-DD hh:mm:ss a"
              ).toDate()
            : moment(
                `${formData.date!.format(
                  "YYYY-MM-DD"
                )} ${formData.time[1].format("hh:mm:ss a")}`,
                "YYYY-MM-DD hh:mm:ss a"
              ).toDate(),
          formData.isRecurring ? formData.recurring : undefined
        );

      if (liveResp.success) {
        setError({
          name: null,
          URL: null,
          course: null,
          image: null,
          session: null,
          time: null,
          beginDateTime: null,
          endDateTime: null,
          date: null,
          endDate: null,
          "recurring.weekDays": null,
          "recurring.frequency": null,
        });

        setModal(false);
        setInfo(false);
        setFormData({
          name: "",
          URL: "",
          isRecurring: false,
          date: null,
          time: [],
          recurring: {
            weekDays: [],
            frequency: 1,
            endDate: null,
          },
        });
      } else {
        setError(liveResp.error as any);
        if (!info) await Session.deleteSession(sessionResp.data.session._id);
      }
    } else {
      setError(sessionResp.error as any);
    }
  };

  useEffect(() => {
    if (showModal && info) {
      LiveSession.getLiveSession(info.id).then((liveResp) => {
        if (
          liveResp.success &&
          typeof liveResp.data.liveSession.session === "string"
        ) {
          Session.getSession(liveResp.data.liveSession.session).then((resp) => {
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

        // TODO: populate live session data
      });
    }
  }, [info, showModal]);

  useEffect(() => {
    if (formData.recurring.weekDays.length === 0 && formData.isRecurring)
      setFormData({ ...formData, isRecurring: false });
    else if (formData.recurring.weekDays.length !== 0 && !formData.isRecurring)
      setFormData({ ...formData, isRecurring: true });
  }, [formData.recurring.weekDays]);

  useEffect(() => {
    console.log(formData);
  }, [formData]);

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
          date: null,
          time: [],
          recurring: {
            weekDays: [],
            frequency: 1,
            endDate: null,
          },
        });
        setError({
          name: null,
          URL: null,
          course: null,
          image: null,
          session: null,
          time: null,
          beginDateTime: null,
          endDateTime: null,
          date: null,
          endDate: null,
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
          <DatePicker
            popupStyle={{ zIndex: 1070 }}
            style={{ width: "100%" }}
            onChange={(date) => setFormData({ ...formData, date })}
            status={
              errors.date || errors.beginDateTime || errors.endDateTime
                ? "error"
                : undefined
            }
          />
          {errors.date || errors.beginDateTime || errors.endDateTime ? (
            <div className="text-danger">
              {errors.date && <p>{errors.date}</p>}
              {errors.beginDateTime && <p>{errors.beginDateTime}</p>}
              {errors.endDateTime && <p>{errors.endDateTime}</p>}
            </div>
          ) : (
            <></>
          )}
        </div>
        <div className="form-group mb-4">
          <label className="form-label">Session Time:</label>
          <br />
          <TimePicker.RangePicker
            popupStyle={{ zIndex: 1070 }}
            style={{ width: "100%" }}
            onChange={(t) => {
              if (t && t.length >= 2)
                setFormData({
                  ...formData,
                  time: [t[0] as moment.Moment, t[1] as moment.Moment],
                });
            }}
            use12Hours
            format="h:mm a"
            status={
              errors.time || errors.beginDateTime || errors.endDateTime
                ? "error"
                : undefined
            }
          />
          {errors.time || errors.beginDateTime || errors.endDateTime ? (
            <div className="text-danger">
              {errors.time && <p>{errors.time}</p>}
              {errors.beginDateTime && <p>{errors.beginDateTime}</p>}
              {errors.endDateTime && <p>{errors.endDateTime}</p>}
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
                min={1}
                max={20}
                name="frequency"
                value={formData.recurring.frequency}
                onChange={(e) => {
                  if (
                    Number.isInteger(e.target.value) &&
                    parseInt(e.target.value, 10) > 0
                  ) {
                    setFormData({
                      ...formData,
                      recurring: {
                        ...formData.recurring,
                        frequency: parseInt(e.target.value, 10),
                      },
                    });

                    setError({
                      ...errors,
                      "recurring.frequency": null,
                    });
                  } else {
                    setError({
                      ...errors,
                      "recurring.frequency": "Please enter a postive integer",
                    });
                  }
                }}
                onKeyUp={enterSubmit}
              />{" "}
              Week(s)
            </span>
          )}
        </div>
        {formData.isRecurring && (
          <>
            {errors["recurring.frequency"] && (
              <div className="text-danger">
                <p>{errors["recurring.frequency"]}</p>
              </div>
            )}
            <div className="form-group mb-4">
              <label className="form-label">Until:</label>
              <br />
              <DatePicker
                popupStyle={{ zIndex: 1070 }}
                style={{ width: "100%" }}
                onChange={(date) =>
                  setFormData({
                    ...formData,
                    recurring: {
                      ...formData.recurring,
                      endDate: date,
                    },
                  })
                }
                status={
                  errors.endDate || errors.beginDateTime || errors.endDateTime
                    ? "error"
                    : undefined
                }
              />
              {errors.beginDateTime || errors.endDateTime || errors.endDate ? (
                <div className="text-danger">
                  {errors.endDate && <p>{errors.endDate}</p>}
                  {errors.beginDateTime && <p>{errors.beginDateTime}</p>}
                  {errors.endDateTime && <p>{errors.endDateTime}</p>}
                </div>
              ) : (
                <></>
              )}
            </div>
          </>
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
              date: null,
              time: [],
              recurring: {
                weekDays: [],
                frequency: 1,
                endDate: null,
              },
            });
            setError({
              name: null,
              URL: null,
              course: null,
              image: null,
              session: null,
              time: null,
              beginDateTime: null,
              endDateTime: null,
              date: null,
              endDate: null,
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
