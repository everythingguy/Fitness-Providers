import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { UserContext } from "../../context/UserState";
import Error403 from "../ErrorPages/403";

interface Props {}

export const MyProfile: React.FC<Props> = () => {
    const { user } = useContext(UserContext);

    if (!user) return <Navigate to="/user/login" />;
    if (!user.provider) return <Error403 />;

    return <Navigate to={`/provider/profile/${user.provider._id}`} />;
};

export default MyProfile;
