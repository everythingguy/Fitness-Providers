import { Routes, Route } from "react-router-dom";

import { Header } from "./components/Header";

import { Home } from "./pages/Home";
import { Register } from "./pages/User/Register";
import { Login } from "./pages/User/Login";
import { Logout } from "./pages/User/Logout";

import { Footer } from "./components/Footer";

import { UserProvider } from "./context/UserState";

function App() {
  return (
    <div className="pt-3 bg-light">
      <UserProvider>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/user/register" element={<Register />} />
          <Route path="/user/login" element={<Login />} />
          <Route path="/user/logout" element={<Logout />} />
        </Routes>
      </UserProvider>
      <Footer />
    </div>
  );
}

export default App;
