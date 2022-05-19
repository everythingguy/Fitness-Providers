import React from "react";
import { AbstractError } from ".";

interface Props {}

export const Error400: React.FC<Props> = () => {
  return (
    <AbstractError errorCode={400} errorMessage={"Bad Request"}></AbstractError>
  );
};

export default Error400;
