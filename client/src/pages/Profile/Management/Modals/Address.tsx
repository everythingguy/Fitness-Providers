import React, { useState } from "react";
import Modal from "react-bootstrap/Modal";
import Address from "../../../../API/Address";
import { Address as AddressType } from "../../../../@types/Models";

interface Props {
    show: boolean;
    setModal: React.Dispatch<React.SetStateAction<boolean>>;
    onSuccess: (address: AddressType) => void;
    onCancel: () => void;
}

export const AddressModal: React.FC<Props> = ({
    show,
    setModal,
    onSuccess,
    onCancel
}) => {
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
        const addressResp = await Address.createAddress(
            formData.street1,
            formData.street2,
            formData.city,
            formData.state,
            formData.zip,
            formData.country
        );

        if (addressResp.success) {
            setError({
                street1: null,
                street2: null,
                city: null,
                state: null,
                zip: null,
                country: null
            });

            setModal(false);
            onSuccess(addressResp.data.address);
        } else {
            setError(addressResp.error as any);
        }
    };

    return (
        <Modal size="lg" show={show} onHide={() => setModal(!show)}>
            <Modal.Header>
                <h5>Business Address:</h5>
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
                    onClick={() => {
                        setModal(false);
                        onCancel();
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

export default AddressModal;
