import React, { useContext, useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import User from "../../../API/User";
import { UserContext } from "../../../context/UserState";

export const Login: React.FC = () => {
  // logged in context
  const { loggedIn } = useContext(UserContext);

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const createInstructor = params.get("createInstructor") || false;

  // field state
  const [isAuth, setAuth] = useState(false);
  const [wasInvalidLogin, setWasInvalidLogin] = useState(false);
  const [emailConfirmed, setEmailConfirmed] = useState(true);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
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
      setAuth(true);
    } else {
      if (auth.error === "Email not confirmed") setEmailConfirmed(false);
      setWasInvalidLogin(true);
    }
  };

  if ((isAuth || loggedIn) && createInstructor)
    return <Navigate to="/user/settings?createInstructor=true" />;
  if (isAuth || loggedIn) return <Navigate to="/" />;

  return (
    <>
      <div className="h3">Login to your account</div>
      <div className="divider-border"></div>

      <form onSubmit={onSubmit}>
        <div className="form-group mb-4">
          <label className="form-label">Username:</label>
          <input
            className={
              wasInvalidLogin ? "form-control is-invalid" : "form-control"
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
                  className="btn btn-link"
                  onClick={() => User.resendConfirmation(username)}
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
              wasInvalidLogin ? "form-control is-invalid" : "form-control"
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
        Don't have an account? <Link to="/user/register">Sign Up</Link>
      </p>
      <p>
        Forgot your password?{" "}
        <Link to="/user/password/forgot">Reset Password</Link>
      </p>
    </>
  );
};
