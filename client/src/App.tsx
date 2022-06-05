import React, { useContext, lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import Header from "./components/Header";

const Home = lazy(() => import("./pages/Home"));
const Directory = lazy(() => import("./pages/Directory"));
const Calendar = lazy(() => import("./pages/Calendar"));
const Course = lazy(() => import("./pages/Course"));
const MyProfile = lazy(() => import("./pages/Profile/MyProfile"));
const Profile = lazy(() => import("./pages/Profile"));
const Management = lazy(() => import("./pages/Profile/Management/Management"));
const LiveManagement = lazy(
    () => import("./pages/Profile/Management/LiveManagement")
);
const Register = lazy(() => import("./pages/User/Register"));
const Login = lazy(() => import("./pages/User/Login"));
const Email = lazy(() => import("./pages/User/Email"));
const Settings = lazy(() => import("./pages/User/Settings"));
const SubscriptionManagement = lazy(
    () => import("./pages/User/SubscriptionManagement")
);
const AddressManagement = lazy(() => import("./pages/User/AddressManagement"));
const ChangePassword = lazy(() => import("./pages/User/ChangePassword"));
const ResetPassword = lazy(() => import("./pages/User/ResetPassword"));
const ForgotPassword = lazy(() => import("./pages/User/ForgotPassword"));
const Admin = lazy(() => import("./pages/Admin"));
const Terms = lazy(() => import("./pages/Terms"));

import Footer from "./components/Footer";

const Error400 = lazy(() => import("./pages/ErrorPages/400"));
const Error403 = lazy(() => import("./pages/ErrorPages/403"));
const Error404 = lazy(() => import("./pages/ErrorPages/404"));
const Error500 = lazy(() => import("./pages/ErrorPages/500"));

import { UserContext } from "./context/UserState";
import Loading from "./components/Loading";

function App() {
    const { loading, user } = useContext(UserContext);

    return (
        <>
            <Header />
            <div id="main" className="bg-light">
                <div className="container">
                    <Suspense fallback={<Loading />}>
                        {loading ? (
                            <Loading />
                        ) : (
                            <Routes>
                                <Route path="/" element={<Home />} />

                                <Route
                                    path="/directory"
                                    element={<Directory />}
                                />
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

                                <Route
                                    path="/calendar"
                                    element={<Calendar />}
                                />
                                <Route
                                    path="/course/:id"
                                    element={<Course />}
                                />
                                <Route
                                    path="/provider/profile/me"
                                    element={<MyProfile />}
                                />
                                <Route
                                    path="/provider/profile/:id"
                                    element={<Profile />}
                                />
                                <Route
                                    path="/provider/management"
                                    element={<Management />}
                                />
                                <Route
                                    path="/provider/management/live"
                                    element={<LiveManagement />}
                                />

                                <Route
                                    path="/user/register"
                                    element={<Register />}
                                />
                                <Route path="/user/login" element={<Login />} />
                                <Route
                                    path="/user/email/confirmation"
                                    element={<Email />}
                                />
                                <Route
                                    path="/user/password/forgot"
                                    element={<ForgotPassword />}
                                />
                                <Route
                                    path="/user/password/reset"
                                    element={<ResetPassword />}
                                />
                                <Route
                                    path="/user/settings/password"
                                    element={<ChangePassword />}
                                />
                                <Route
                                    path="/user/settings"
                                    element={<Settings />}
                                />
                                <Route
                                    path="/user/settings/address"
                                    element={<AddressManagement />}
                                />
                                <Route
                                    path="/user/settings/subscription"
                                    element={<SubscriptionManagement />}
                                />
                                <Route path="/terms" element={<Terms />} />

                                {user && user.isAdmin && (
                                    <Route path="/admin" element={<Admin />} />
                                )}

                                <Route
                                    path="/error/400"
                                    element={<Error400 />}
                                />
                                <Route
                                    path="/error/403"
                                    element={<Error403 />}
                                />
                                <Route
                                    path="/error/404"
                                    element={<Error404 />}
                                />
                                <Route
                                    path="/error/500"
                                    element={<Error500 />}
                                />
                                <Route path="*" element={<Error404 />} />
                            </Routes>
                        )}
                    </Suspense>
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
