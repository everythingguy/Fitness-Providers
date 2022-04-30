import React, { useState } from "react";
import { Link } from "react-router-dom";
import API from "../../../API";

export const Register: React.FC = () => {
  // field state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // tailwind class names for the button
  const button =
    "cursor-pointer text-center max-w-full bg-transparent hover:bg-purple-500 text-purple-700 font-semibold hover:text-white py-2 px-4 border border-purple-500 hover:border-transparent rounded";
  const inputStyle = "mb-10 mx-10 bg-purple-200";

  // allows the enter key to submit the form
  const enterSubmit = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.keyCode === 13) {
      e.preventDefault();
      await submitForm();
    }
  };

  // process the form
  const submitForm = async () => {
    const error = document.getElementById("error");

    // if the error element was found by id
    if (error) {
      error.innerHTML = "";

      // if all fields are filled in
      if (name && email && username && password) {
        // ask the api to create the user
        const data = await API.createUser(name, email, username, password);

        // if success redirect to login
        if (data.success) window.location.pathname = "/user/login";
        // otherwise
        else {
          // print each error
          // TODO: fix xss vulnerability, display errors like capstone
          /*
          for (let i = 0; i < data.error.length; i++) {
            data.error = data.error as { msg: string }[];
            error.innerHTML += "<p>" + data.error[i].msg + "</p>";
          }
          */

          // display the error in a block
          error.style.display = "block";
        }
      }
      // otherwise
      else {
        // tell the user to finish filling the form
        error.innerText = "Please fill in all fields";
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
        <label>Name</label>
        <input
          className={inputStyle}
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyUp={(e) => enterSubmit(e)}
        />
        <label>Email</label>
        <input
          className={inputStyle}
          type="text"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyUp={(e) => enterSubmit(e)}
        />
        <label>Username</label>
        <input
          className={inputStyle}
          type="text"
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyUp={(e) => enterSubmit(e)}
        />
        <label>Password</label>
        <input
          className={inputStyle}
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyUp={(e) => enterSubmit(e)}
        />
        <Link to="/user/login" className={button + " mr-10"}>
          Back
        </Link>
        <button className={button} onClick={submitForm}>
          Register
        </button>
      </div>
    </>
  );
};
