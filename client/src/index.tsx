import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router } from "react-router-dom";
import { UserProvider } from "./context/UserState";

import App from "./App";

import "./assets/tailwind.css";
import "./assets/style.css";
import "./assets/bootstrap.css";

ReactDOM.render(
    <Router>
        <React.StrictMode>
            <UserProvider>
                <App />
            </UserProvider>
        </React.StrictMode>
    </Router>,
    document.getElementById("app")
);
