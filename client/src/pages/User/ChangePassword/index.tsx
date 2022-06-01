import React, { useContext, useState } from "react";
import { Navigate } from "react-router-dom";
import SettingsHeader from "../../../components/SettingsHeader";
import { UserContext } from "../../../context/UserState";
import User from "../../../API/User";

interface Props {}

export const ChangePassword: React.FC<Props> = () => {
    const { loggedIn, logout } = useContext(UserContext);

    const [errors, setError] = useState({
        currentPassword: null,
        password: null,
        re_password: null
    });

    const [formData, setFormData] = useState({
        currentPassword: "",
        password: "",
        re_password: ""
    });

    const [success, setSuccess] = useState(false);

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
        const resp = await User.changePassword(formData);
        if (resp.success) {
            await User.logoutUser();
            if (logout) await logout();
            setSuccess(true);
        } else setError(resp.error as any);
    };

    if (!loggedIn || success) return <Navigate to="/user/login" />;

    return (
        <>
            <SettingsHeader activePage="password" />
            <div className="form-group mb-4">
                <label className="form-label">Current Password:</label>
                <input
                    className={
                        errors.currentPassword
                            ? "form-control is-invalid"
                            : "form-control"
                    }
                    type="password"
                    placeholder="Current Password"
                    name="currentPassword"
                    required
                    value={formData.currentPassword}
                    onChange={onChange}
                    onKeyUp={enterSubmit}
                />
                <div className="invalid-feedback">{errors.currentPassword}</div>
            </div>
            <div className="form-group mb-4">
                <label className="form-label">New Password:</label>
                <input
                    className={
                        errors.password
                            ? "form-control is-invalid"
                            : "form-control"
                    }
                    type="password"
                    placeholder="New Password"
                    name="password"
                    required
                    value={formData.password}
                    onChange={onChange}
                    onKeyUp={enterSubmit}
                />
                <div className="invalid-feedback">{errors.password}</div>
            </div>
            <div className="form-group mb-4">
                <label className="form-label">Reenter Password:</label>
                <input
                    className={
                        errors.re_password
                            ? "form-control is-invalid"
                            : "form-control"
                    }
                    type="password"
                    placeholder="Reenter Password"
                    name="re_password"
                    required
                    value={formData.re_password}
                    onChange={onChange}
                    onKeyUp={enterSubmit}
                />
                <div className="invalid-feedback">{errors.re_password}</div>
            </div>
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

export default ChangePassword;
