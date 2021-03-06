import React, { useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { UserContext } from "../context/UserState";
import ProviderApplication from "./ProviderApplication";

interface Props {
    activePage: "info" | "address" | "password" | "subscription";
}

export const SettingsHeader: React.FC<Props> = ({ activePage }) => {
    const btnStyle = "btn btn-dark fw-bold text-light mb-4 me-2";
    const activeBtnStyle = btnStyle + " active";

    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const createProvider = params.get("createProvider") || false;

    const { user } = useContext(UserContext);

    return (
        <div className="d-flex justify-content-center">
            <Link
                className={activePage === "info" ? activeBtnStyle : btnStyle}
                to="/user/settings"
            >
                User Info
            </Link>
            {user && user.provider && (
                <>
                    <Link
                        className={
                            activePage === "info" ? activeBtnStyle : btnStyle
                        }
                        to="/user/settings/address"
                    >
                        Address Management
                    </Link>

                    <Link
                        className={
                            activePage === "subscription"
                                ? activeBtnStyle
                                : btnStyle
                        }
                        to="/user/settings/subscription"
                    >
                        Subscription Management
                    </Link>
                </>
            )}
            <Link
                className={activePage === "info" ? activeBtnStyle : btnStyle}
                to="/user/settings/password"
            >
                Change Password
            </Link>
            {user && !user.provider && (
                <ProviderApplication
                    buttonStyle={btnStyle}
                    showAtStart={createProvider ? true : false}
                />
            )}
        </div>
    );
};

export default SettingsHeader;
