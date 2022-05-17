import React from "react";

interface Props {
  errorCode: number;
  errorMessage: string;
}

export const AbstractError: React.FC<Props> = ({ errorCode, errorMessage }) => {
  return (
    <div className="text-center">
      <img
        className="mx-auto"
        src="/images/Error.svg"
        width="150"
        alt="error icon"
      />
      <h1>{errorMessage}</h1>
      <h3>{errorCode} Error</h3>
    </div>
  );
};

export * from "./400";
export * from "./403";
export * from "./404";
export * from "./500";
