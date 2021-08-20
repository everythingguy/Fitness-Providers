import { Switch, Route } from "react-router-dom";

import { Home } from "./Home/Home";
import { Register } from "./User/Register";
import { Login } from "./User/Login";
import { Logout } from "./User/Logout";

export const Main: React.FC = () => {
  return (
    <Switch>
      <Route exact path="/" component={Home} />
      <Route exact path="/user/register" component={Register} />
      <Route exact path="/user/login" component={Login} />
      <Route exact path="/user/logout" component={Logout} />
    </Switch>
  );
};
