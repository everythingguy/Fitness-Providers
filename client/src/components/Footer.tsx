import { useContext } from "react";
import { Link } from "react-router-dom";
import { UserContext } from "../context/UserState";

export const Footer: React.FC = () => {
  const contactEmail = "contact@fitnessproviders.net";
  const { loggedIn, user } = useContext(UserContext);

  return (
    <div id="footer" className="bg-dark">
      <div className="container">
        <div className="row">
          <div className="col text-start">
            {!loggedIn && (
              <Link
                to="/user/register"
                className="text-decoration-none d-block"
              >
                Create an Account
              </Link>
            )}
            {loggedIn && user?.provider && (
              <Link to="" className="text-decoration-none d-block">
                Become a provider
              </Link>
            )}
          </div>
          <div className="col text-center">
            <a
              className="text-decoration-none d-block"
              href={`mailto:${contactEmail}`}
            >
              {contactEmail}
            </a>
          </div>
          <div className="col text-end">
            <Link to="/" className="text-decoration-none d-block">
              Home
            </Link>
            <Link to="/calendar" className="text-decoration-none d-block">
              Calendar
            </Link>
            <Link to="/directory" className="text-decoration-none d-block">
              Directory
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
