import React from "react";
import { AbstractError } from ".";

interface Props {}

export const Error500: React.FC<Props> = () => {
    return (
        <AbstractError
            errorCode={50}
            errorMessage={"Server Error"}
        ></AbstractError>
    );
};

export default Error500;
