import React from "react";
import { AbstractError } from ".";

interface Props {}

export const Error404: React.FC<Props> = () => {
  return (
    <AbstractError
      errorCode={404}
      errorMessage={"Page Not Found"}
    ></AbstractError>
  );
};

export default Error404;
