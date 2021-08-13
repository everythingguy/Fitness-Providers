import API from '../../API';

export const Logout = () => {

    const logoutUser = async () => {
        await API.logoutUser();

        sessionStorage.clear();
    
        window.location.pathname = '/';
    };

    logoutUser();

    return (
        <>
        </>
    )
}
