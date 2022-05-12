import User from "../@types/User";

type Actions = {
  action: "SET_LOGIN";
  payload: {
    loggedIn: boolean;
    user?: User;
  };
};

interface State {
  loggedIn: boolean;
  user?: User;
}

const UserReducer = (state: State, { action, payload }: Actions) => {
  switch (action) {
    case "SET_LOGIN":
      return {
        ...state,
        loggedIn: payload.loggedIn,
        user: payload.user,
      };
    default:
      return state;
  }
};

export default UserReducer;
