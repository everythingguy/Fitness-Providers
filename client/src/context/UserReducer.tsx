import User from "../@types/User";

type Actions = {
  action: "SET_LOGIN";
  payload: {
    success: true;
    user: User;
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
        loggedIn: payload.success,
        user: payload!.user,
      };
    default:
      return state;
  }
};

export default UserReducer;
