import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { UserContext } from "../context/UserState";
import ProviderApplication from "./ProviderApplication";

// TODO: broken on mobile

export const Footer: React.FC = () => {
    const contactEmail = process.env.MAIL_CONTACT_EMAIL;
    const { loggedIn, user } = useContext(UserContext);

    return (
        <div id="footer" className="bg-dark">
            <div className="container">
                <div className="row">
                    <div className="col text-start">
                        {!loggedIn && (
                            <Link
                                to="/user/register"
                                className="text-decoration-none d-block text-light"
                            >
                                Create an Account
                            </Link>
                        )}
                        {loggedIn && !user?.provider && (
                            <ProviderApplication buttonStyle="text-decoration-none d-block text-light" />
                        )}
                    </div>
                    <div className="col text-center">
                        <a
                            className="text-decoration-none d-block text-light"
                            href={`mailto:${contactEmail}`}
                        >
                            {contactEmail}
                        </a>
                    </div>
                    <div className="col text-end">
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
        </div>
    );
};

export default Footer;
