import { useContext } from "react";
import { UserContext } from "../context/UserState";

export const Header: React.FC = () => {
  const { loggedIn } = useContext(UserContext);

  const toggleVisability = (id: string) => {
    var element = document.getElementById(id);
    if (element) {
      element.style.height = "0%";
      if (!element.classList.toggle("invisible")) {
        growth(element, 0);
      }
    }
  };

  const growth = (element: HTMLElement, height: number) => {
    element.style.height = height + "px";
    height += 10;
    console.log(height);
    if (height !== 120) setTimeout(() => growth(element, height), 50);
  };

  return (
    <nav>
      <ul className="flex bg-gray-800 pb-5">
        <li className="ml-auto mr-6 ml-4">
          {loggedIn ? (
            <>
              <div
                className="text-purple-500 hover:text-purple-800 cursor-pointer"
                onClick={(e) => toggleVisability("profile-dropdown")}
              >
                Profile
              </div>
              <div
                id="profile-dropdown"
                className=" overflow-hidden bg-gray-800 rounded-lg absolute items-center top right-0 mr-2 mt-5 p-2 invisible"
              >
                <a
                  className="py-2 text-purple-500 hover:text-purple-800 cursor-pointer block"
                  href="/user/logout"
                >
                  Logout
                </a>
              </div>
            </>
          ) : (
            <a
              className="text-purple-500 hover:text-purple-800 cursor-pointer"
              href="/user/login"
            >
              Login
            </a>
          )}
        </li>
      </ul>
    </nav>
  );
};
