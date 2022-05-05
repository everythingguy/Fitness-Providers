import User from "../../../API/User";

export const Logout: React.FC = () => {
  const logoutUser = async () => {
    await User.logoutUser();

    sessionStorage.clear();

    window.location.pathname = "/";
  };

  logoutUser();

  return <></>;
};
