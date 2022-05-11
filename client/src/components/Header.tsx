import { useContext, Fragment } from "react";
import { UserContext } from "../context/UserState";
import { Link } from "react-router-dom";
import { Navbar, Nav, NavDropdown, Container } from "react-bootstrap";
import User from "../API/User";

export const Header: React.FC = () => {
  const { loggedIn, user, setLogin } = useContext(UserContext);

  return (
    <Navbar collapseOnSelect expand="lg" fixed="top" bg="white">
      <Container className="">
        <Navbar.Brand className="w-10 mx-auto mx-0 mx-lg-0 text-center">
          <Nav.Link
            as={Link}
            to="/"
            className="text-decoration-none text-secondary px-0 mx-0"
            eventKey="link-1"
          >
            <img
              src="https://via.placeholder.com/150x40"
              className="text-center"
              width="150"
              alt="Rebel Body Collective Logo"
            />
          </Nav.Link>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="me-auto mx-lg-4 fw-bold ">
            <Nav.Link
              as={Link}
              to="/"
              className="text-decoration-none mx-2 my-1"
              eventKey="link-2"
            >
              Home
            </Nav.Link>
            <Nav.Link
              as={Link}
              to="/calendar"
              className="text-decoration-none mx-1 my-1"
              eventKey="link-3"
            >
              Calendar
            </Nav.Link>
            <Nav.Link
              as={Link}
              to="/directory"
              className="text-decoration-none mx-1 my-1"
              eventKey="link-4"
            >
              Directory
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
        <Navbar.Collapse className="justify-content-end fw-bold">
          {loggedIn && (
            <Fragment>
              <Nav className="text-center">
                <NavDropdown title="My Account" id="collasible-nav-dropdown">
                  <NavDropdown.Header className="text-primary fw-bold">
                    {user?.username}
                  </NavDropdown.Header>
                  <NavDropdown.Divider></NavDropdown.Divider>
                  {user?.provider && (
                    <>
                      <NavDropdown.Item
                        as={Link}
                        to="/profile"
                        role="button"
                        className="text-decoration-none btn text-black"
                        eventKey="link-8"
                      >
                        <i className="bi bi-person-badge me-2"></i>My Profile
                      </NavDropdown.Item>
                      <NavDropdown.Item
                        as={Link}
                        to="/content-management"
                        role="button"
                        className="text-decoration-none btn text-black"
                        eventKey="link-8"
                      >
                        <i className="bi bi-text-left me-2"></i>My Content
                      </NavDropdown.Item>
                    </>
                  )}
                  <NavDropdown.Item
                    as={Link}
                    to="/settings"
                    className="text-decoration-none btn text-black"
                    eventKey="link-9"
                  >
                    <i className="bi bi-gear-wide me-2"></i>Settings
                  </NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item
                    onClick={async () => {
                      await User.logoutUser();
                      if (setLogin) await setLogin();
                    }}
                    role="button"
                    className="text-decoration-none"
                    eventKey="link-10"
                  >
                    <i className="bi bi-box-arrow-left me-2"></i>Log Out
                  </NavDropdown.Item>
                </NavDropdown>
              </Nav>
            </Fragment>
          )}
          {!loggedIn && (
            <Fragment>
              <Nav.Link
                as={Link}
                to="/user/login"
                className="btn btn-outline-light btn-sm text-decoration-none p-2 m-1"
                eventKey="link-6"
              >
                Log In
              </Nav.Link>
              <Nav.Link
                as={Link}
                to="/user/register"
                className="btn btn-outline-light btn-sm text-decoration-none p-2 m-1"
                eventKey="link-7"
              >
                Sign Up
              </Nav.Link>
            </Fragment>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};
