import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import SettingsHeader from "../../../components/SettingsHeader";
import { UserContext } from "../../../context/UserState";

interface Props {}

// TODO:

export const SubscriptionManagement: React.FC<Props> = () => {
    const { loggedIn, user } = useContext(UserContext);

    if (!loggedIn) return <Navigate to="/user/login" />;
    if (user && !user.provider)
        return <Navigate to="/user/settings?createProvider=true" />;

    return (
        <>
            <SettingsHeader activePage="subscription" />
        </>
    );
};

export default SubscriptionManagement;
