import { Routes, Route } from "react-router-dom";

import Header from "./components/Header";

import { Home } from "./pages/Home";
import Directory from "./pages/Directory";
import Calendar from "./pages/Calendar";
import Course from "./pages/Course";
import {
  Profile,
  Management,
  MyProfile,
  EventManagement,
} from "./pages/Profile";
import * as UserPages from "./pages/User";
import Terms from "./pages/Terms";

import Footer from "./components/Footer";

import * as ErrorPages from "./pages/ErrorPages";

import { UserProvider } from "./context/UserState";

function App() {
  return (
    <>
      <UserProvider>
        <Header />
        <div id="main" className="bg-light">
          <div className="container">
            <Routes>
              <Route path="/" element={<Home />} />

              <Route path="/directory" element={<Directory />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/course/:id" element={<Course />} />
              <Route path="/provider/profile/me" element={<MyProfile />} />
              <Route path="/provider/profile/:id" element={<Profile />} />
              <Route path="/provider/management" element={<Management />} />
              <Route
                path="/provider/management/events"
                element={<EventManagement />}
              />

              <Route path="/user/register" element={<UserPages.Register />} />
              <Route path="/user/login" element={<UserPages.Login />} />
              <Route
                path="/user/password/forgot"
                element={<UserPages.ForgotPassword />}
              />
              <Route
                path="/user/password/reset"
                element={<UserPages.ResetPassword />}
              />
              <Route path="/user/settings" element={<UserPages.Settings />} />
              <Route path="/terms" element={<Terms />} />

              <Route path="/error/400" element={<ErrorPages.Error400 />} />
              <Route path="/error/403" element={<ErrorPages.Error403 />} />
              <Route path="/error/404" element={<ErrorPages.Error404 />} />
              <Route path="/error/500" element={<ErrorPages.Error500 />} />
              <Route path="*" element={<ErrorPages.Error404 />} />
            </Routes>
          </div>
        </div>
        <Footer />
      </UserProvider>
    </>
  );
}

export default App;
