import React, { useContext, useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { Alert } from "react-bootstrap";
import { toast } from "react-toastify";
import User from "../../../API/User";
import { UserContext } from "../../../context/UserState";

export const Login: React.FC = () => {
    // logged in context
    const { loggedIn, setLogin } = useContext(UserContext);

    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const createProvider = params.get("createProvider") || false;

    // field state
    const [isAuth, setAuth] = useState(false);
    const [wasInvalidLogin, setWasInvalidLogin] = useState(false);
    const [emailConfirmed, setEmailConfirmed] = useState(true);
    const [formData, setFormData] = useState({
        username: "",
        password: ""
    });
    const { username, password } = formData;

    const onChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setWasInvalidLogin(false);
        setEmailConfirmed(true);
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
        const auth = await User.loginUser(username, password);
        if (auth.success) {
            if (setLogin) await setLogin();
            setAuth(true);
        } else {
            if (auth.error === "Email not confirmed") setEmailConfirmed(false);
            setWasInvalidLogin(true);
        }
    };

    if ((isAuth || loggedIn) && createProvider)
        return <Navigate to="/user/settings?createProvider=true" />;
    if (isAuth || loggedIn) return <Navigate to="/" />;

    return (
        <>
            {process.env.DEMO && process.env.DEMO === "true" && (
                <Alert variant="info">
                    There are demo accounts available{" "}
                    <a
                        target="_blank"
                        rel="noreferrer"
                        href="https://gitlab.duraken.com/fitness-providers/fitness-providers/-/blob/staging/README.md#demo"
                    >
                        here
                    </a>
                    .
                </Alert>
            )}
            <div className="h3">Login to your account</div>
            <div className="divider-border"></div>

            <form onSubmit={onSubmit}>
                <div className="form-group mb-4">
                    <label className="form-label">Username:</label>
                    <input
                        className={
                            wasInvalidLogin
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
                    <div className="invalid-feedback">
                        {!emailConfirmed ? (
                            <p>
                                Please confirm your email -
                                <button
                                    type="button"
                                    className="btn btn-link text-decoration-none text-dark fw-bold"
                                    onClick={() =>
                                        User.resendConfirmation(username).then(
                                            (resp) => {
                                                if (resp.success)
                                                    toast.info(
                                                        "Email Confirmation Sent!"
                                                    );
                                                else if (
                                                    resp.error ===
                                                    "Server was unable to send the email"
                                                )
                                                    toast.error(
                                                        "Error sending email confirmation, please contact an admin or try again later."
                                                    );
                                                else toast.error(resp.error);
                                            }
                                        )
                                    }
                                >
                                    Resend?
                                </button>
                            </p>
                        ) : (
                            "Incorrect username or password"
                        )}
                    </div>
                </div>
                <div className="form-group mb-4">
                    <label className="form-label">Password:</label>
                    <input
                        className={
                            wasInvalidLogin
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
                </div>
                <button className="btn btn-primary mb-4" type="submit">
                    Sign In
                </button>
            </form>
            <p>
                Don&apos;t have an account?{" "}
                <Link
                    className="text-decoration-none text-dark fw-bold"
                    to="/user/register"
                >
                    Sign Up
                </Link>
            </p>
            <p>
                Forgot your password?{" "}
                <Link
                    className="text-decoration-none text-dark fw-bold"
                    to="/user/password/forgot"
                >
                    Reset Password
                </Link>
            </p>
        </>
    );
};

export default Login;
