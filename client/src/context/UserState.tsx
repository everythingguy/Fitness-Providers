import { createContext, useReducer } from "react";
import UserReducer from "./UserReducer";
import API from "../API/User";

import User from "../@types/Models";

interface State {
  loggedIn: boolean;
  user?: User;
  setLogin?: (relogin?: boolean) => void;
  logout?: () => void;
}

interface Props {
  children: any;
}

const initialState: State = {
  loggedIn: false,
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
          payload: { loggedIn: body.success, user: body.data.user },
        });
    }
  }

  function logout() {
    dispatch({
      action: "SET_LOGIN",
      payload: { loggedIn: false },
    });
  }

  setLogin();

  return (
    <UserContext.Provider
      value={{
        user: state.user,
        loggedIn: state.loggedIn,
        setLogin,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
