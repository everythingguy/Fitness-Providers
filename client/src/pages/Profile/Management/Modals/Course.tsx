import React, { useState } from "react";
import Modal from "react-bootstrap/Modal";

interface Props {
  setModal: React.Dispatch<React.SetStateAction<boolean>>;
  showModal: boolean;
}

// TODO: change this to the course modal

export const CourseModal: React.FC<Props> = ({ setModal, showModal }) => {
  // field state
  const [errors, setError] = useState({
    name: null,
    description: null,
    image: null,
  });

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: null,
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
    /*
    const auth = await Provider.createProvider(
      formData.bio,
      formData.website,
      formData.phone,
      formData["address.street1"],
      formData["address.street2"],
      formData["address.city"],
      formData["address.state"],
      formData["address.zip"],
      formData["address.country"]
    );

    if (auth.success) {
      setError({
        bio: null,
        website: null,
        phone: null,
        "address.street1": null,
        "address.street2": null,
        "address.city": null,
        "address.state": null,
        "address.zip": null,
        "address.country": null,
      });

      setModal(false);
    } else {
      setError(auth.error as any);
    }
    */
    setModal(false);
  };

  return (
    <Modal size="lg" show={showModal} onHide={() => setModal(!showModal)}>
      <Modal.Header>
        <h5>Register as a Provider</h5>
      </Modal.Header>
      <Modal.Body>
        <div className="form-group mb-4">
          <label className="form-label">Name:</label>
          <input
            className={errors.name ? "form-control is-invalid" : "form-control"}
            type="text"
            placeholder="Name"
            name="name"
            required
            onChange={onChange}
            onKeyUp={enterSubmit}
          />
          <div className="invalid-feedback">{errors.name}</div>
        </div>
        <div className="form-group mb-4">
          <label className="form-label">Description:</label>
          <textarea
            className={
              errors.description ? "form-control is-invalid" : "form-control"
            }
            rows={5}
            placeholder="description"
            name="description"
            required
            onChange={onChange}
            onKeyUp={enterSubmit}
          />
          <div className="invalid-feedback">{errors.description}</div>
        </div>
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

export default CourseModal;
