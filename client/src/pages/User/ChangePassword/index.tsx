import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import SettingsHeader from "../../../components/SettingsHeader";
import { UserContext } from "../../../context/UserState";

interface Props {}

// TODO:

export const ChangePassword: React.FC<Props> = () => {
    const { loggedIn } = useContext(UserContext);

    if (!loggedIn) return <Navigate to="/user/login" />;

    return (
        <>
            <SettingsHeader activePage="password" />
        </>
    );
};

export default ChangePassword;
