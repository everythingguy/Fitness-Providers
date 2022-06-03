import React, { useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import User from "../../../API/User";
import Error400 from "../../ErrorPages/400";

interface Props {}

export const ResetPassword: React.FC<Props> = () => {
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const code = params.get("code") || false;

    const [success, setSuccess] = useState(false);

    const [errors, setError] = useState({
        password: null,
        code: null
    });

    const [formData, setFormData] = useState({
        password: "",
        re_password: ""
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
        if (code)
            User.resetPassword(
                code,
                formData.password,
                formData.re_password
            ).then((resp) => {
                if (resp.success) setSuccess(true);
                else setError(resp.error as any);
            });
    };

    if (!code) return <Error400 />;
    if (success) return <Navigate to="/user/login" />;

    return (
        <>
            <div className="form-group mb-4">
                <label className="form-label">New Password:</label>
                <input
                    className={
                        errors.password || errors.code
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
                {errors.password && (
                    <div className="invalid-feedback">{errors.password}</div>
                )}
            </div>
            <div className="form-group mb-4">
                <label className="form-label">Reenter Password:</label>
                <input
                    className={
                        errors.code ? "form-control is-invalid" : "form-control"
                    }
                    type="password"
                    placeholder="Reenter Password"
                    name="re_password"
                    required
                    value={formData.re_password}
                    onChange={onChange}
                    onKeyUp={enterSubmit}
                />
                <div className="invalid-feedback">{errors.code}</div>
            </div>
            <button
                className="btn btn-primary mb-4 float-end"
                type="button"
                onClick={onSubmit}
            >
                Submit
            </button>
        </>
    );
};

export default ResetPassword;
