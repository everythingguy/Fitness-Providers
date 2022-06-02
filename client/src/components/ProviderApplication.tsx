import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "react-bootstrap/Modal";
import Provider from "../API/Provider";
import Address from "../API/Address";
import { UserContext } from "../context/UserState";

interface AddressProps {
    showAddressModal: boolean;
    setAddressModal: React.Dispatch<React.SetStateAction<boolean>>;
    setSuccessModal: React.Dispatch<React.SetStateAction<boolean>>;
    providerID: string | null;
}

const AddressModal: React.FC<AddressProps> = ({
    showAddressModal,
    setAddressModal,
    setSuccessModal,
    providerID
}) => {
    const { setLogin } = useContext(UserContext);

    // field state
    const [errors, setError] = useState({
        street1: null,
        street2: null,
        city: null,
        state: null,
        zip: null,
        country: null
    });

    const [formData, setFormData] = useState({
        street1: "",
        street2: "",
        city: "",
        state: "",
        zip: "",
        country: ""
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
        if (
            formData.street1.length > 0 ||
            formData.street2.length > 0 ||
            formData.city.length > 0 ||
            formData.state.length > 0 ||
            formData.zip.length > 0 ||
            formData.country.length > 0
        ) {
            const auth = await Address.createAddress(
                formData.street1,
                formData.street2,
                formData.city,
                formData.state,
                formData.zip,
                formData.country
            );

            if (auth.success) {
                setError({
                    street1: null,
                    street2: null,
                    city: null,
                    state: null,
                    zip: null,
                    country: null
                });

                if (providerID)
                    await Provider.setAddress(
                        providerID,
                        auth.data.address._id
                    );

                setAddressModal(false);
                setSuccessModal(true);
            } else {
                setError(auth.error as any);
            }
        } else {
            setAddressModal(false);
            setSuccessModal(true);
        }
    };

    return (
        <Modal
            size="lg"
            show={showAddressModal}
            onHide={async () => {
                setAddressModal(!showAddressModal);
                if (setLogin) await setLogin(true);
            }}
        >
            <Modal.Header>
                <h5>Business Address (Optional):</h5>
            </Modal.Header>
            <Modal.Body>
                <div className="form-group mb-4">
                    <label className="form-label">Street 1:</label>
                    <input
                        className={
                            errors.street1
                                ? "form-control is-invalid"
                                : "form-control"
                        }
                        type="text"
                        placeholder="Street 1"
                        name="street1"
                        onChange={onChange}
                        onKeyUp={enterSubmit}
                    />
                    <div className="invalid-feedback">{errors.street1}</div>
                </div>
                <div className="form-group mb-4">
                    <label className="form-label">Street 2:</label>
                    <input
                        className={
                            errors.street2
                                ? "form-control is-invalid"
                                : "form-control"
                        }
                        type="text"
                        placeholder="Street 2"
                        name="street2"
                        onChange={onChange}
                        onKeyUp={enterSubmit}
                    />
                    <div className="invalid-feedback">{errors.street2}</div>
                </div>
                <div className="form-group mb-4 container">
                    <div className="row">
                        <div className="col">
                            <label className="form-label">City:</label>
                            <input
                                className={
                                    errors.city
                                        ? "form-control is-invalid"
                                        : "form-control"
                                }
                                type="text"
                                placeholder="City"
                                name="city"
                                onChange={onChange}
                                onKeyUp={enterSubmit}
                            />
                            <div className="invalid-feedback">
                                {errors.city}
                            </div>
                        </div>
                        <div className="col">
                            <label className="form-label">State:</label>
                            <input
                                className={
                                    errors.state
                                        ? "form-control is-invalid"
                                        : "form-control"
                                }
                                type="text"
                                placeholder="State"
                                name="state"
                                onChange={onChange}
                                onKeyUp={enterSubmit}
                            />
                            <div className="invalid-feedback">
                                {errors.state}
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
                                    errors.zip
                                        ? "form-control is-invalid"
                                        : "form-control"
                                }
                                type="text"
                                placeholder="Zip Code"
                                name="zip"
                                onChange={onChange}
                                onKeyUp={enterSubmit}
                            />
                            <div className="invalid-feedback">{errors.zip}</div>
                        </div>
                        <div className="col">
                            <label className="form-label">Country:</label>
                            <input
                                className={
                                    errors.country
                                        ? "form-control is-invalid"
                                        : "form-control"
                                }
                                type="text"
                                placeholder="Country"
                                name="country"
                                onChange={onChange}
                                onKeyUp={enterSubmit}
                            />
                            <div className="invalid-feedback">
                                {errors.country}
                            </div>
                        </div>
                    </div>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <button
                    className="btn btn-danger mb-4"
                    type="button"
                    onClick={() => setAddressModal(false)}
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

interface Props {
    buttonStyle?: string;
    showAtStart?: boolean;
}

export const ProviderApplication: React.FC<Props> = ({
    buttonStyle = "btn text-light btn-dark mb-2",
    showAtStart = false
}) => {
    const navigate = useNavigate();

    const { loggedIn, setLogin, user } = useContext(UserContext);

    const [showModal, setModal] = useState(showAtStart);
    const [showAddressModal, setAddressModal] = useState(false);
    const [showSuccessModal, setSuccessModal] = useState(false);

    const [providerID, setProviderID] = useState<string | null>(null);

    // field state
    const [errors, setError] = useState({
        bio: null,
        website: null,
        phone: null
    });

    const [formData, setFormData] = useState({
        bio: "",
        website: "",
        phone: ""
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
            formData.phone
        );

        if (auth.success) {
            setError({
                bio: null,
                website: null,
                phone: null
            });

            setProviderID(auth.data.provider._id);
            setModal(false);
            setAddressModal(true);
        } else {
            setError(auth.error as any);
        }
    };

    return (
        <>
            {loggedIn && !user?.provider && (
                <button
                    onClick={() => setModal(true)}
                    className={buttonStyle}
                    role="button"
                >
                    Provider Registration
                </button>
            )}
            <Modal
                size="lg"
                show={showModal}
                onHide={() => setModal(!showModal)}
            >
                <Modal.Header>
                    <h5>Register as a Provider</h5>
                </Modal.Header>
                <Modal.Body>
                    <div className="form-group mb-4">
                        <label className="form-label">Phone Number*:</label>
                        <input
                            className={
                                errors.phone
                                    ? "form-control is-invalid"
                                    : "form-control"
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
                                errors.website
                                    ? "form-control is-invalid"
                                    : "form-control"
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
                                errors.bio
                                    ? "form-control is-invalid"
                                    : "form-control"
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
            <AddressModal
                showAddressModal={showAddressModal}
                setAddressModal={setAddressModal}
                setSuccessModal={setSuccessModal}
                providerID={providerID}
            />
            <Modal
                size="lg"
                show={showSuccessModal}
                onHide={async () => {
                    setSuccessModal(!showSuccessModal);
                    if (setLogin) await setLogin(true);
                }}
            >
                <Modal.Header>
                    <h5>Provider Registration Successfully</h5>
                </Modal.Header>
                <Modal.Body>
                    <div className="form-group mb-4 container">
                        <div className="row">
                            <div className="col">
                                <p>
                                    Select a subscription to make your profile
                                    public.
                                </p>
                            </div>
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <button
                        className="btn btn-primary mb-4"
                        type="button"
                        onClick={async () => {
                            setSuccessModal(false);
                            if (setLogin) await setLogin(true);
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
