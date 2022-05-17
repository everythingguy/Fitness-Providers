import React from "react";
import { AbstractError } from ".";

interface Props {}

export const Error403: React.FC<Props> = () => {
  return (
    <AbstractError
      errorCode={403}
      errorMessage={"Not Authorized"}
    ></AbstractError>
  );
};

export default Error403;
