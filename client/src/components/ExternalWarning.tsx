import React from "react";
import Modal from "react-bootstrap/Modal";

interface Props {
    showModal: boolean;
    setModal: (showModal: boolean) => void;
    link: string;
    newTab: boolean;
}

export const ExternalWarning: React.FC<Props> = ({
    showModal,
    setModal,
    link,
    newTab
}) => {
    return (
        <Modal size="lg" show={showModal} onHide={() => setModal(!showModal)}>
            <Modal.Header>
                <h5>Warning: External Link</h5>
            </Modal.Header>
            <Modal.Body>
                <p>
                    You are about to navigate to an external site. If you trust
                    the source you may proceed. Click &quot;Cancel&quot; to
                    abort navigation to the third party website.
                </p>
                <p>External Link: {link}</p>
            </Modal.Body>
            <Modal.Footer>
                <button
                    className="btn btn-danger mb-4"
                    type="button"
                    onClick={() => setModal(false)}
                >
                    Cancel
                </button>

                <a
                    className="btn btn-primary mb-4"
                    href={link}
                    target={newTab ? "_blank" : "_self"}
                    rel="noreferrer noopener"
                    onClick={() => setModal(false)}
                >
                    Proceed
                </a>
            </Modal.Footer>
        </Modal>
    );
};

export default ExternalWarning;
