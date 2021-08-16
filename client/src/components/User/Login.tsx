import { useContext } from "react";
import API from "../../API";
import { UserContext } from "../../context/UserState";

export const Login: React.FC = () => {
  const { loggedIn } = useContext(UserContext) as {
    loggedIn: boolean;
    user: null;
  };
  const button =
    "cursor-pointer text-center max-w-full bg-transparent hover:bg-purple-500 text-purple-700 font-semibold hover:text-white py-2 px-4 border border-purple-500 hover:border-transparent rounded";

  const enterSubmit = async (e) => {
    if (e.keyCode === 13) {
      e.preventDefault();
      await submitForm();
    }
  };

  const submitForm = async () => {
    const usernameElement = document.getElementById(
      "username"
    ) as HTMLInputElement;
    const passwordElement = document.getElementById(
      "password"
    ) as HTMLInputElement;
    const error = document.getElementById("error");

    if (usernameElement && passwordElement && error) {
      const username = usernameElement.value;
      const password = passwordElement.value;

      if (username && password && !loggedIn) {
        var data = await API.loginUser(username, password);

        if (data.success) {
          sessionStorage.removeItem("VideoState");

          window.location.pathname = "/";
        } else {
          error.innerText = "Incorrect username or password";
          error.style.display = "block";
        }
      } else if (loggedIn) {
        error.innerText = "Please logout before logging in";
        error.style.display = "block";
      } else {
        error.innerText = "Please enter a username and password";
        error.style.display = "block";
      }
    }
  };

  return (
    <>
      <div
        className="mx-auto w-1/4 border border-purple-500 text-purple-700 hidden"
        id="error"
      ></div>
      <div className="grid grid-cols-2 text-purple-500 mx-auto my-20 sm:w-3/4 lg:w-1/2">
        <label>Username</label>
        <input
          className="mx-10 bg-purple-200"
          type="text"
          id="username"
          onKeyUp={(e) => enterSubmit(e)}
        />
        <label className="my-10">Password</label>
        <input
          className="my-10 mx-10 bg-purple-200"
          type="password"
          id="password"
          onKeyUp={(e) => enterSubmit(e)}
        />
        <a className={button + " mr-10"} href="/user/register">
          Register
        </a>
        <a className={button} onClick={(e) => submitForm()}>
          Login
        </a>
      </div>
    </>
  );
};
