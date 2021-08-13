import { createContext, useReducer } from 'react';
import UserReducer from './UserReducer';
import API from '../API';

var loadedState = sessionStorage.getItem("UserState");
if(loadedState) loadedState = JSON.parse(loadedState);

const initialState = loadedState || {
    loggedIn: false,
    user: null
};

export const UserContext = createContext(initialState);

export const UserProvider = ({children}) => {
    const [state, dispatch] = useReducer(UserReducer, initialState);

    async function setLogin() {
        if(!state.loggedIn) {
        const user = await API.getUserData();
        if(user.success)
            dispatch({
                action: 'SET_LOGIN',
                payload: user
            });
        }
    }

    setLogin();

    return(
        <UserContext.Provider value={{
            user: state.user,
            loggedIn: state.loggedIn
        }}>
            {children}
        </UserContext.Provider>
    );
};