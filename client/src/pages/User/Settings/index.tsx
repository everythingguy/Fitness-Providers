import React, { useContext, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import Select from "react-select";

import { UserContext } from "../../../context/UserState";
import { Address as AddressType } from "../../../@types/Models";
import SettingsHeader from "../../../components/SettingsHeader";
import { User, Provider, Address } from "../../../API";

interface Props {}

// TODO: delete my account

export const Settings: React.FC<Props> = () => {
    const { user, loggedIn, setLogin } = useContext(UserContext);

    const [errors, setError] = useState({
        firstName: null,
        lastName: null,
        email: null,
        phone: null,
        website: null,
        address: null
    });
    const [formData, setFormData] = useState({
        firstName: user?.firstName,
        lastName: user?.lastName,
        email: user?.email,
        phone: user?.provider?.phone,
        website: user?.provider?.website
    });

    const [selectedAddress, setSelectedAddress] = useState<
        AddressType | { _id: "none"; street1: "None" }
    >(
        user?.provider?.address || {
            _id: "none",
            street1: "None"
        }
    );
    const [providerAddresses, setProviderAddresses] = useState<
        (AddressType | { _id: "none"; street1: "None" })[]
    >([]);

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
            onSubmit();
        }
    };

    const onSubmit = () => {
        const promises: Promise<any>[] = [];
        setError({
            firstName: null,
            lastName: null,
            email: null,
            phone: null,
            website: null,
            address: null
        });

        const { firstName, lastName, email, phone, website } = formData;
        const userBody = {
            firstName,
            lastName,
            email
        };

        if (user?.firstName === firstName) delete userBody.firstName;
        if (user?.lastName === lastName) delete userBody.lastName;
        if (user?.email === email) delete userBody.email;

        if (Object.keys(userBody).length > 0 && user) {
            const userPromise = User.updateUser(user._id, userBody);

            userPromise.then((userResp) => {
                if (!userResp.success) {
                    if (
                        typeof userResp.error === "object" &&
                        !Array.isArray(userResp.error)
                    )
                        setError({ ...errors, ...userResp.error });
                }
            });

            promises.push(userPromise);
        }

        if (user && user.provider) {
            const providerBody: {
                phone: string | undefined;
                website: string | undefined | null;
                address: string | undefined | null;
            } = {
                phone,
                website: website && website.length > 0 ? website : null,
                address:
                    selectedAddress._id === "none" ? null : selectedAddress._id
            };

            if (user.provider.phone === phone) delete providerBody.phone;
            if (user.provider.website === providerBody.website)
                delete providerBody.website;
            if (
                (user.provider.address &&
                    user.provider.address._id === providerBody.address) ||
                (user.provider.address as any) === providerBody.address
            )
                delete providerBody.address;

            if (Object.keys(providerBody).length > 0) {
                const providerPromise = Provider.updateProvider(
                    user.provider._id,
                    providerBody
                );

                providerPromise.then((providerResp) => {
                    if (!providerResp.success) {
                        if (
                            typeof providerResp.error === "object" &&
                            !Array.isArray(providerResp.error)
                        )
                            setError({ ...errors, ...providerResp.error });
                    }
                });

                promises.push(providerPromise);
            }
        }

        if (promises.length > 0) {
            Promise.all(promises).then(() => {
                if (setLogin) setLogin(true);
            });
        }
    };

    useEffect(() => {
        if (user && user.provider)
            Address.getProvidersAddresses(user.provider._id).then((resp) => {
                if (resp.success)
                    setProviderAddresses([
                        ...resp.data.addresses,
                        {
                            _id: "none",
                            street1: "None"
                        }
                    ]);
            });
    }, []);

    if (!loggedIn) return <Navigate to="/user/login" />;

    return (
        <>
            <SettingsHeader activePage="info" />
            <div className="form-group mb-4">
                <label className="form-label">First Name:</label>
                <input
                    className={
                        errors.firstName
                            ? "form-control is-invalid"
                            : "form-control"
                    }
                    type="text"
                    placeholder="First Name"
                    name="firstName"
                    required
                    value={formData.firstName}
                    onChange={onChange}
                    onKeyUp={enterSubmit}
                />
                <div className="invalid-feedback">{errors.firstName}</div>
            </div>
            <div className="form-group mb-4">
                <label className="form-label">Last Name:</label>
                <input
                    className={
                        errors.lastName
                            ? "form-control is-invalid"
                            : "form-control"
                    }
                    type="text"
                    placeholder="Last Name"
                    name="lastName"
                    required
                    value={formData.lastName}
                    onChange={onChange}
                    onKeyUp={enterSubmit}
                />
                <div className="invalid-feedback">{errors.lastName}</div>
            </div>
            <div className="form-group mb-4">
                <label className="form-label">Email:</label>
                <input
                    className={
                        errors.email
                            ? "form-control is-invalid"
                            : "form-control"
                    }
                    type="text"
                    placeholder="Email"
                    name="email"
                    required
                    readOnly // TODO: remove once working on the backend
                    value={formData.email}
                    onChange={onChange}
                    onKeyUp={enterSubmit}
                />
                <div className="invalid-feedback">{errors.email}</div>
            </div>
            {user && user.provider && (
                <>
                    <div className="form-group mb-4">
                        <label className="form-label">Phone:</label>
                        <input
                            className={
                                errors.phone
                                    ? "form-control is-invalid"
                                    : "form-control"
                            }
                            type="text"
                            placeholder="Phone"
                            name="phone"
                            required
                            value={formData.phone}
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
                            value={formData.website || ""}
                            onChange={onChange}
                            onKeyUp={enterSubmit}
                        />
                        <div className="invalid-feedback">{errors.website}</div>
                    </div>
                    <div className="form-group mb-4">
                        <label className="form-label">Address:</label>
                        <Select
                            options={providerAddresses.map((val) => {
                                return { value: val._id, label: val.street1 };
                            })}
                            value={
                                selectedAddress
                                    ? {
                                          value: selectedAddress._id,
                                          label: selectedAddress.street1
                                      }
                                    : undefined
                            }
                            onChange={({ value }: any) => {
                                const address = providerAddresses.filter(
                                    (addr) => addr._id === value
                                )[0];
                                setSelectedAddress(address);
                            }}
                            styles={{
                                control: (provided) =>
                                    errors.address
                                        ? {
                                              ...provided,
                                              borderColor: "#dc3545",
                                              "&:hover": {
                                                  borderColor: "#a21c29"
                                              }
                                          }
                                        : provided
                            }}
                        />
                        <div className="invalid-feedback">{errors.address}</div>
                    </div>
                </>
            )}
            <button
                className="btn btn-primary mb-4 float-end"
                type="button"
                onClick={onSubmit}
            >
                Save
            </button>
        </>
    );
};

export default Settings;
