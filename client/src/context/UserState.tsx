import React, { createContext, useReducer } from "react";
import PropTypes from "prop-types";
import UserReducer from "./UserReducer";
import API from "../API/User";

import User from "../@types/Models";

interface State {
    loggedIn: boolean;
    loading: boolean;
    user?: User;
    setLogin?: (relogin?: boolean) => void;
    logout?: () => void;
}

interface Props {
    children: React.ReactNode;
}

const initialState: State = {
    loggedIn: false,
    loading: true
};

export const UserContext = createContext(initialState);

export const UserProvider: React.FC<Props> = ({ children }) => {
    const [state, dispatch] = useReducer(UserReducer, initialState);

    async function setLogin(relogin = false) {
        if (!state.loggedIn || relogin) {
            const body = await API.getUserData();
            if (body.success && body.data.user)
                dispatch({
                    action: "SET_LOGIN",
                    payload: {
                        loggedIn: body.success,
                        user: body.data.user
                    }
                });
            else logout();
        }
    }

    function logout() {
        dispatch({
            action: "SET_LOGIN",
            payload: { loggedIn: false }
        });
    }

    if (state.loading) setLogin();

    return (
        <UserContext.Provider
            value={{
                loading: state.loading,
                user: state.user,
                loggedIn: state.loggedIn,
                setLogin,
                logout
            }}
        >
            {children}
        </UserContext.Provider>
    );
};

UserProvider.propTypes = {
    children: PropTypes.node.isRequired
};
