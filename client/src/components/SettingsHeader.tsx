import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { UserContext } from "../context/UserState";

interface Props {
    activePage: "info" | "address" | "password";
}

export const SettingsHeader: React.FC<Props> = ({ activePage }) => {
    const btnStyle = "btn btn-dark fw-bold text-light mb-4 me-2";
    const activeBtnStyle = btnStyle + " active";

    const { user } = useContext(UserContext);

    return (
        <>
            <Link
                className={activePage === "info" ? activeBtnStyle : btnStyle}
                to="/user/settings"
            >
                User Info
            </Link>
            {user?.provider && (
                <Link
                    className={
                        activePage === "info" ? activeBtnStyle : btnStyle
                    }
                    to="/user/settings/address"
                >
                    Address Management
                </Link>
            )}
            <Link
                className={activePage === "info" ? activeBtnStyle : btnStyle}
                to="/user/settings/password"
            >
                Change Password
            </Link>
        </>
    );
};

export default SettingsHeader;
