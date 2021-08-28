import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import API from "../../../API";
import { UserContext } from "../../../context/UserState";

export const Login: React.FC = () => {
  //logged in context
  const { loggedIn } = useContext(UserContext);

  //field state
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  //tailwind class names for the button
  const button =
    "cursor-pointer text-center max-w-full bg-transparent hover:bg-purple-500 text-purple-700 font-semibold hover:text-white py-2 px-4 border border-purple-500 hover:border-transparent rounded";

  //allows the enter key to submit the form
  const enterSubmit = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.keyCode === 13) {
      e.preventDefault();
      await submitForm();
    }
  };

  //process the form
  const submitForm = async () => {
    const error = document.getElementById("error");

    //if the error element was found by id
    if (error) {
      //if the user is logged out and filled in the form
      if (username && password && !loggedIn) {
        //try to login with the provided credientials
        var data = await API.loginUser(username, password);

        //if success redirect home
        if (data.success) {
          window.location.pathname = "/";
        }
        //otherwise
        else {
          //tell the user they entered wrong info
          error.innerText = "Incorrect username or password";
          error.style.display = "block";
        }
      }
      //if the user is already logged in warn them
      else if (loggedIn) {
        error.innerText = "Please logout before logging in";
        error.style.display = "block";
      }
      //otherwise
      else {
        //tell the user to fill out the form
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
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyUp={(e) => enterSubmit(e)}
        />
        <label className="my-10">Password</label>
        <input
          className="my-10 mx-10 bg-purple-200"
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyUp={(e) => enterSubmit(e)}
        />
        <Link to="/user/register" className={button + " mr-10"}>
          Register
        </Link>
        <button className={button} onClick={(e) => submitForm()}>
          Login
        </button>
      </div>
    </>
  );
};
