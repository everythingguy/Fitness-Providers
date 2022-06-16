import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { UserContext } from "../context/UserState";
import ProviderApplication from "./ProviderApplication";

export const Footer: React.FC = () => {
    const contactEmail = process.env.MAIL_CONTACT_EMAIL;
    const { loggedIn, user } = useContext(UserContext);

    return (
        <div id="footer" className="bg-dark">
            <div className="row w-100">
                <div className="col-md-4 col-sm-12 text-md-start text-center mb-md-0 mb-3">
                    {!loggedIn && (
                        <Link
                            to="/user/register"
                            className="text-decoration-none d-block text-light"
                        >
                            Register
                        </Link>
                    )}
                    {loggedIn && !user?.provider && (
                        <ProviderApplication buttonStyle="btn text-decoration-none d-block text-light" />
                    )}
                    {user && user.provider && (
                        <Link
                            to="/user/settings/subscription"
                            className="text-decoration-none d-block text-light"
                        >
                            Manage Subscription
                        </Link>
                    )}
                </div>
                <div className="col-md-4 col-sm-12 text-md-center text-center mb-md-0 mb-3">
                    <a
                        className="text-decoration-none d-block text-light"
                        href={`mailto:${contactEmail}`}
                    >
                        {contactEmail}
                    </a>
                </div>
                <div className="col-md-4 col-sm-12 text-md-end text-center mb-md-0 mb-3">
                    <Link
                        to="/"
                        className="text-decoration-none d-block text-light"
                    >
                        Home
                    </Link>
                    <Link
                        to="/calendar"
                        className="text-decoration-none d-block text-light"
                    >
                        Calendar
                    </Link>
                    <Link
                        to="/directory"
                        className="text-decoration-none d-block text-light"
                    >
                        Directory
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Footer;
