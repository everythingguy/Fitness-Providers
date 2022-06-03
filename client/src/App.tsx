import React from "react";
import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import Header from "./components/Header";

import { Home } from "./pages/Home";
import Directory from "./pages/Directory";
import Calendar from "./pages/Calendar";
import Course from "./pages/Course";
import * as ProfilePages from "./pages/Profile";
import * as UserPages from "./pages/User";
import Admin from "./pages/Admin";
import Terms from "./pages/Terms";

import Footer from "./components/Footer";

import * as ErrorPages from "./pages/ErrorPages";

import { UserContext } from "./context/UserState";
import { useContext } from "react";
import Loading from "./components/Loading";

function App() {
    const { loading, user } = useContext(UserContext);

    return (
        <>
            <Header />
            <div id="main" className="bg-light">
                <div className="container">
                    {loading ? (
                        <Loading />
                    ) : (
                        <Routes>
                            <Route path="/" element={<Home />} />

                            <Route path="/directory" element={<Directory />} />
                            <Route
                                path="/directory/providers"
                                element={<Directory />}
                            />
                            <Route
                                path="/directory/courses"
                                element={<Directory />}
                            />
                            <Route
                                path="/directory/sessions"
                                element={<Directory />}
                            />

                            <Route path="/calendar" element={<Calendar />} />
                            <Route path="/course/:id" element={<Course />} />
                            <Route
                                path="/provider/profile/me"
                                element={<ProfilePages.MyProfile />}
                            />
                            <Route
                                path="/provider/profile/:id"
                                element={<ProfilePages.Profile />}
                            />
                            <Route
                                path="/provider/management"
                                element={<ProfilePages.Management />}
                            />
                            <Route
                                path="/provider/management/live"
                                element={<ProfilePages.LiveManagement />}
                            />

                            <Route
                                path="/user/register"
                                element={<UserPages.Register />}
                            />
                            <Route
                                path="/user/login"
                                element={<UserPages.Login />}
                            />
                            <Route
                                path="/user/email/confirmation"
                                element={<UserPages.Email />}
                            />
                            <Route
                                path="/user/password/forgot"
                                element={<UserPages.ForgotPassword />}
                            />
                            <Route
                                path="/user/password/reset"
                                element={<UserPages.ResetPassword />}
                            />
                            <Route
                                path="/user/settings/password"
                                element={<UserPages.ChangePassword />}
                            />
                            <Route
                                path="/user/settings"
                                element={<UserPages.Settings />}
                            />
                            <Route
                                path="/user/settings/address"
                                element={<UserPages.AddressManagement />}
                            />
                            <Route path="/terms" element={<Terms />} />

                            {user && user.isAdmin && (
                                <Route path="/admin" element={<Admin />} />
                            )}

                            <Route
                                path="/error/400"
                                element={<ErrorPages.Error400 />}
                            />
                            <Route
                                path="/error/403"
                                element={<ErrorPages.Error403 />}
                            />
                            <Route
                                path="/error/404"
                                element={<ErrorPages.Error404 />}
                            />
                            <Route
                                path="/error/500"
                                element={<ErrorPages.Error500 />}
                            />
                            <Route path="*" element={<ErrorPages.Error404 />} />
                        </Routes>
                    )}
                </div>
            </div>
            <ToastContainer
                position="bottom-right"
                pauseOnHover
                draggable
                closeOnClick
                autoClose={5000}
            />
            <Footer />
        </>
    );
}

export default App;
