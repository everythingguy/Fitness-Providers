import React, { useContext, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { toast } from "react-toastify";
import User from "../../../API/User";
import { UserContext } from "../../../context/UserState";

export const Register: React.FC = () => {
    // logged in context
    const { loggedIn, setLogin } = useContext(UserContext);

    // field state
    const [errors, setError] = useState({
        email: null,
        firstName: null,
        lastName: null,
        username: null,
        password: null
    });

    const [wasSuccessful, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        firstName: "",
        lastName: "",
        username: "",
        password: "",
        re_password: "",
        provider: false
    });
    const {
        email,
        firstName,
        lastName,
        username,
        password,
        re_password,
        provider
    } = formData;

    const onChange = (e) => {
        if (e.target.type === "checkbox")
            setFormData({ ...formData, [e.target.name]: e.target.checked });
        else setFormData({ ...formData, [e.target.name]: e.target.value });
        setError({ ...errors, [e.target.name]: null });
    };

    // allows the enter key to submit the form
    const enterSubmit = async (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.keyCode === 13) {
            e.preventDefault();
            await onSubmit();
        }
    };

    const onSubmit = async (e?: React.FormEvent<HTMLFormElement>) => {
        if (e) e.preventDefault();
        const auth = await User.createUser(
            firstName,
            lastName,
            email,
            username,
            password,
            re_password,
            provider
        );
        if (auth.success) {
            setError({
                email: null,
                firstName: null,
                lastName: null,
                username: null,
                password: null
            });

            if (setLogin) await setLogin();
            setSuccess(true);
            toast.info("Please confirm your email before signing in!");
        } else {
            setError(auth.error as any);
        }
    };

    if (!wasSuccessful && loggedIn) return <Navigate to="/" />;
    if (wasSuccessful && provider)
        return <Navigate to="/user/login?createProvider=true" />;
    if (wasSuccessful) return <Navigate to="/user/login" />;

    return (
        <>
            <div className="h3">Create your account</div>
            <div className="divider-border"></div>

            <form onSubmit={onSubmit}>
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
                        value={email}
                        onChange={onChange}
                        onKeyUp={(e) => enterSubmit(e)}
                        required
                    />
                    <div className="invalid-feedback">{errors.email}</div>
                </div>
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
                        value={firstName}
                        onChange={onChange}
                        onKeyUp={(e) => enterSubmit(e)}
                        required
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
                        value={lastName}
                        onChange={onChange}
                        onKeyUp={(e) => enterSubmit(e)}
                        required
                    />
                    <div className="invalid-feedback">{errors.lastName}</div>
                </div>
                <div className="form-group mb-4">
                    <label className="form-label">Username:</label>
                    <input
                        className={
                            errors.username
                                ? "form-control is-invalid"
                                : "form-control"
                        }
                        type="text"
                        placeholder="Username"
                        name="username"
                        value={username}
                        onChange={onChange}
                        onKeyUp={(e) => enterSubmit(e)}
                        required
                    />
                    <div className="invalid-feedback">{errors.username}</div>
                </div>
                <div className="form-group mb-4">
                    <label className="form-label">Password:</label>
                    <input
                        className={
                            errors.password
                                ? "form-control is-invalid"
                                : "form-control"
                        }
                        type="password"
                        placeholder="Password"
                        name="password"
                        value={password}
                        onChange={onChange}
                        onKeyUp={(e) => enterSubmit(e)}
                        required
                    />
                    <div className="invalid-feedback">{errors.password}</div>
                </div>
                <div className="form-group mb-4">
                    <label className="form-label">Confirm Password:</label>
                    <input
                        className={
                            errors.password
                                ? "form-control is-invalid"
                                : "form-control"
                        }
                        type="password"
                        placeholder="Confirm Password"
                        name="re_password"
                        value={re_password}
                        onChange={onChange}
                        onKeyUp={(e) => enterSubmit(e)}
                        required
                    />
                    <div className="invalid-feedback">{errors.password}</div>
                </div>
                <div className="form-group mb-4">
                    <label className="form-label">Become a provider?</label>
                    <input
                        className="form-control form-check-input d-inline-block ms-4 p-2"
                        type="checkbox"
                        name="provider"
                        onChange={onChange}
                    />
                </div>
                <div>
                    <p>
                        By registering you are agreeing to the{" "}
                        <a href="/terms" target="_blank">
                            terms and conditions
                        </a>
                    </p>
                </div>
                <button className="btn btn-primary mb-4" type="submit">
                    Register
                </button>
            </form>
            <p>
                Already have an account? <Link to="/user/login">Sign In</Link>
            </p>
        </>
    );
};

export default Register;
