import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import User from "../../../API/User";

interface Props {}

export const ForgotPassword: React.FC<Props> = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({ email: "" });
    const [errors, setError] = useState<{ email: string | null }>({
        email: null
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
        const resp = await User.forgotPassword(formData.email);

        if (resp.success) {
            navigate("/user/login", { replace: true });
            toast.info("Check your email for a password reset link");
        } else setError(resp.error as any);
    };

    return (
        <>
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
                    onChange={onChange}
                    onKeyUp={enterSubmit}
                />
                <div className="invalid-feedback">{errors.email}</div>
            </div>
            <button
                className="btn btn-primary mb-4 float-end"
                type="button"
                onClick={onSubmit}
            >
                Submit
            </button>
            <Link
                className="btn btn-danger mb-4 me-4 text-decoration-none text-reset float-end"
                to="/user/login"
            >
                Back
            </Link>
        </>
    );
};

export default ForgotPassword;
