import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import SettingsHeader from "../../../components/SettingsHeader";
import { UserContext } from "../../../context/UserState";
import { Error403 } from "./../../ErrorPages/403";

interface Props {}

// TODO:

export const AddressManagement: React.FC<Props> = () => {
    const { loggedIn, user } = useContext(UserContext);

    if (!loggedIn) return <Navigate to="/user/login" />;
    if (!user?.provider) return <Error403 />;

    return (
        <>
            <SettingsHeader activePage="address" />
        </>
    );
};

export default AddressManagement;
