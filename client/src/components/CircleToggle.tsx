import React from "react";

interface Props {
    label: string;
    id: any;
    enabled: boolean;
    onChange: (id: any) => void;
}

export const CircleToggle: React.FC<Props> = ({
    label,
    id,
    enabled,
    onChange
}) => {
    return (
        <button
            type="button"
            className="btn rounded-circle shadow-sm p-0 me-2"
            style={
                enabled
                    ? {
                          backgroundColor: "pink",
                          width: "35px",
                          height: "35px"
                      }
                    : {
                          backgroundColor: "white",
                          width: "35px",
                          height: "35px"
                      }
            }
            onClick={() => onChange(id)}
        >
            {label}
        </button>
    );
};

export default CircleToggle;
