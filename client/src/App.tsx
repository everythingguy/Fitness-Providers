import { Routes, Route } from "react-router-dom";

import { Header } from "./components/Header";

import { Home } from "./pages/Home";
import { Directory } from "./pages/Directory";
import { Calendar } from "./pages/Calendar";
import { Course } from "./pages/Course";
import { Profile, Management, MyProfile } from "./pages/Profile";
import * as UserPages from "./pages/User";

import { Footer } from "./components/Footer";

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
            </Routes>
          </div>
        </div>
        <Footer />
      </UserProvider>
    </>
  );
}

export default App;
