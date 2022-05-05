import API from "../../../API/User";

export const Logout: React.FC = () => {
  const logoutUser = async () => {
    await API.logoutUser();

    sessionStorage.clear();

    window.location.pathname = "/";
  };

  logoutUser();

  return <></>;
};
