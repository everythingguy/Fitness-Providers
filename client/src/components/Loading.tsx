import React from "react";

interface Props {}

export const Loading: React.FC<Props> = () => {
    return (
        <div className="row text-center">
            <h1>Loading...</h1>
        </div>
    );
};

export default Loading;
