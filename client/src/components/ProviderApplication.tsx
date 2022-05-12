import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "react-bootstrap/Modal";
import Provider from "../API/Provider";
import { UserContext } from "../context/UserState";

interface Props {
  buttonStyle?: string;
}

export const ProviderApplication: React.FC<Props> = ({
  buttonStyle = "btn text-light btn-dark mb-2",
}) => {
  const navigate = useNavigate();

  const { loggedIn, setLogin, user } = useContext(UserContext);

  const [showModal, setModal] = useState(false);
  const [showSuccessModal, setSuccessModal] = useState(false);

  // field state
  const [errors, setError] = useState({
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

  const [formData, setFormData] = useState({
    bio: "",
    website: "",
    phone: "",
    "address.street1": "",
    "address.street2": "",
    "address.city": "",
    "address.state": "",
    "address.zip": "",
    "address.country": "",
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

      if (setLogin) await setLogin(true);
      setModal(false);
      setSuccessModal(true);
    } else {
      setError(auth.error as any);
    }
  };

  return (
    <>
      {loggedIn && !user?.provider && (
        <>
          <div>
            <div>
              <span
                onClick={() => setModal(true)}
                className={buttonStyle}
                role="button"
              >
                Provider Registration
              </span>
            </div>
          </div>
          <Modal size="lg" show={showModal} onHide={() => setModal(!showModal)}>
            <Modal.Header>
              <h5>Register as a Provider</h5>
            </Modal.Header>
            <Modal.Body>
              <div className="form-group mb-4">
                <label className="form-label">Phone Number*:</label>
                <input
                  className={
                    errors.phone ? "form-control is-invalid" : "form-control"
                  }
                  type="text"
                  placeholder="Phone Number"
                  name="phone"
                  required
                  onChange={onChange}
                  onKeyUp={enterSubmit}
                />
                <div className="invalid-feedback">{errors.phone}</div>
              </div>
              <div className="form-group mb-4">
                <label className="form-label">Website:</label>
                <input
                  className={
                    errors.website ? "form-control is-invalid" : "form-control"
                  }
                  type="text"
                  placeholder="Website"
                  name="website"
                  required
                  onChange={onChange}
                  onKeyUp={enterSubmit}
                />
                <div className="invalid-feedback">
                  {errors.website + " Ex: https://mydomain.com"}
                </div>
              </div>
              <div className="form-group mb-4">
                <label className="form-label">Bio:</label>
                <textarea
                  className={
                    errors.bio ? "form-control is-invalid" : "form-control"
                  }
                  rows={5}
                  placeholder="bio"
                  name="bio"
                  required
                  onChange={onChange}
                  onKeyUp={enterSubmit}
                />
                <div className="invalid-feedback">{errors.bio}</div>
              </div>
              <h5>Business Address (Optional):</h5>
              <div className="form-group mb-4">
                <label className="form-label">Street 1:</label>
                <input
                  className={
                    errors["address.street1"]
                      ? "form-control is-invalid"
                      : "form-control"
                  }
                  type="text"
                  placeholder="Street 1"
                  name="address.street1"
                  onChange={onChange}
                  onKeyUp={enterSubmit}
                />
                <div className="invalid-feedback">
                  {errors["address.street1"]}
                </div>
              </div>
              <div className="form-group mb-4">
                <label className="form-label">Street 2:</label>
                <input
                  className={
                    errors["address.street2"]
                      ? "form-control is-invalid"
                      : "form-control"
                  }
                  type="text"
                  placeholder="Street 2"
                  name="address.street2"
                  onChange={onChange}
                  onKeyUp={enterSubmit}
                />
                <div className="invalid-feedback">
                  {errors["address.street2"]}
                </div>
              </div>
              <div className="form-group mb-4 container">
                <div className="row">
                  <div className="col">
                    <label className="form-label">City:</label>
                    <input
                      className={
                        errors["address.city"]
                          ? "form-control is-invalid"
                          : "form-control"
                      }
                      type="text"
                      placeholder="City"
                      name="address.city"
                      onChange={onChange}
                      onKeyUp={enterSubmit}
                    />
                    <div className="invalid-feedback">
                      {errors["address.city"]}
                    </div>
                  </div>
                  <div className="col">
                    <label className="form-label">State:</label>
                    <input
                      className={
                        errors["address.state"]
                          ? "form-control is-invalid"
                          : "form-control"
                      }
                      type="text"
                      placeholder="State"
                      name="address.state"
                      onChange={onChange}
                      onKeyUp={enterSubmit}
                    />
                    <div className="invalid-feedback">
                      {errors["address.state"]}
                    </div>
                  </div>
                </div>
              </div>
              <div className="form-group mb-4 container">
                <div className="row">
                  <div className="col">
                    <label className="form-label">Zip Code:</label>
                    <input
                      className={
                        errors["address.zip"]
                          ? "form-control is-invalid"
                          : "form-control"
                      }
                      type="text"
                      placeholder="Zip Code"
                      name="address.zip"
                      onChange={onChange}
                      onKeyUp={enterSubmit}
                    />
                    <div className="invalid-feedback">
                      {errors["address.zip"]}
                    </div>
                  </div>
                  <div className="col">
                    <label className="form-label">Country:</label>
                    <input
                      className={
                        errors["address.country"]
                          ? "form-control is-invalid"
                          : "form-control"
                      }
                      type="text"
                      placeholder="Country"
                      name="address.country"
                      onChange={onChange}
                      onKeyUp={enterSubmit}
                    />
                    <div className="invalid-feedback">
                      {errors["address.country"]}
                    </div>
                  </div>
                </div>
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
        </>
      )}
      <Modal
        size="lg"
        show={showSuccessModal}
        onHide={() => setSuccessModal(!showSuccessModal)}
      >
        <Modal.Header>
          <h5>Provider Registration Successfully</h5>
        </Modal.Header>
        <Modal.Body>
          <div className="form-group mb-4 container">
            <div className="row">
              <div className="col">
                <p>Select a subscription to make your profile public.</p>
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <button
            className="btn btn-primary mb-4"
            type="button"
            onClick={() => {
              setSuccessModal(false);
              navigate("/provider/profile/me", { replace: true });
            }}
          >
            Ok
          </button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ProviderApplication;
