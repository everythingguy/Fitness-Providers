import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import User from "../../../API/User";
import Loading from "../../../components/Loading";
import Error400 from "../../ErrorPages/400";

interface Props {}

export const Email: React.FC<Props> = () => {
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const code = params.get("code") || false;

    const [success, setSuccess] = useState<boolean | null>(
        code === false ? false : null
    );

    useEffect(() => {
        if (code) {
            User.emailConfirmation(code).then((resp) => {
                if (resp.success) {
                    setSuccess(true);
                    toast.info("Your email has been confirmed, please login.");
                } else setSuccess(false);
            });
        }
    }, []);

    if (success === null) return <Loading />;
    if (!success) return <Error400 />;
    else return <Navigate to="/user/login" />;
};

export default Email;
