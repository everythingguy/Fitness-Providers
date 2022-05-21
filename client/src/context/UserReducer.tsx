import User from "../@types/Models";

type Actions = {
    action: "SET_LOGIN";
    payload: {
        loggedIn: boolean;
        user?: User;
    };
};

interface State {
    loggedIn: boolean;
    loading: boolean;
    user?: User;
}

const UserReducer = (state: State, { action, payload }: Actions) => {
    switch (action) {
        case "SET_LOGIN":
            return {
                ...state,
                loading: false,
                loggedIn: payload.loggedIn,
                user: payload.user
            };
        default:
            return state;
    }
};

export default UserReducer;
