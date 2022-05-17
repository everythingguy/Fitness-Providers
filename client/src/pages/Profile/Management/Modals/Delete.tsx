import React from "react";
import Modal from "react-bootstrap/Modal";

import { Course, Session, LiveSession } from "../../../../API";

interface Props {
  info: { type: "course" | "session" | "liveSession"; id: string };
  showModal: boolean;
  setModal: React.Dispatch<React.SetStateAction<boolean>>;
}

export const DeleteModal: React.FC<Props> = ({ info, showModal, setModal }) => {
  const { type, id } = info;

  const onSubmit = async () => {
    if (type === "course") await Course.deleteCourse(id);
    else if (type === "session") await Session.deleteSession(id);
    else if (type === "liveSession") await LiveSession.deleteLiveSession(id);

    setModal(false);
  };

  return (
    <Modal size="lg" show={showModal} onHide={() => setModal(!showModal)}>
      <Modal.Header>
        <h5>Delete Confirmation</h5>
      </Modal.Header>
      <Modal.Body>
        <p>Are you sure you would like to delete this {type}?</p>
      </Modal.Body>
      <Modal.Footer>
        <button
          className="btn btn-danger mb-4"
          type="button"
          onClick={() => setModal(false)}
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
