import { createContext, useReducer } from "react";
import UserReducer from "./UserReducer";
import API from "../API/User";

import User from "../@types/User";

interface State {
  loggedIn: boolean;
  user?: User;
  setLogin?: () => void;
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

  async function setLogin() {
    if (!state.loggedIn) {
      const body = await API.getUserData();
      if (body.success && body.data.user)
        dispatch({
          action: "SET_LOGIN",
          payload: { success: body.success, user: body.data.user },
        });
    }
  }

  setLogin();

  return (
    <UserContext.Provider
      value={{
        user: state.user,
        loggedIn: state.loggedIn,
        setLogin,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
