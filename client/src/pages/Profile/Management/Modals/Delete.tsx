import React from "react";
import Modal from "react-bootstrap/Modal";

import { Course, Session, LiveSession } from "../../../../API";

type Info = { type: "course" | "session" | "liveSession"; id: string } | false;

interface Props {
  info: Info;
  setInfo: React.Dispatch<React.SetStateAction<Info>>;
  showModal: boolean;
  setModal: React.Dispatch<React.SetStateAction<boolean>>;
}

export const DeleteModal: React.FC<Props> = ({
  info,
  setInfo,
  showModal,
  setModal,
}) => {
  const onSubmit = async () => {
    if (info) {
      const { type, id } = info;

      if (type === "course") await Course.deleteCourse(id);
      else if (type === "session") await Session.deleteSession(id);
      else if (type === "liveSession") await LiveSession.deleteLiveSession(id);

      setModal(false);
      setInfo(false);
    }
  };

  if (showModal && !info) setModal(false);

  return (
    <Modal size="lg" show={showModal} onHide={() => setModal(!showModal)}>
      <Modal.Header>
        <h5>Delete Confirmation</h5>
      </Modal.Header>
      <Modal.Body>
        {info && <p>Are you sure you would like to delete this {info.type}?</p>}
      </Modal.Body>
      <Modal.Footer>
        <button
          className="btn btn-danger mb-4"
          type="button"
          onClick={() => {
            setModal(false);
            setInfo(false);
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

export default DeleteModal;
