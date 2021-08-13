export default (state, {action, payload}) => {
    switch(action) {
        case 'SET_LOGIN':
            return {
                ...state, 
                loggedIn: payload.success,
                user: payload.user
            }
        default:
            return state;
    }
};