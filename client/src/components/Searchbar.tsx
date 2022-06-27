import React from "react";

interface Props {
    placeholder: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onFilterClick?: () => void;
    filtered?: boolean;
    id?: string;
}

export const Searchbar: React.FC<Props> = ({
    placeholder,
    onChange,
    onFilterClick,
    filtered = false,
    id
}) => {
    return (
        <div className="SearchbarLarge">
            <div className="input-group input-group-lg">
                <span
                    className="input-group-text bg-transparent border-0"
                    style={{ zIndex: 4 }}
                >
                    <i className="bi bi-search" />
                </span>
                <input
                    id={id}
                    type="search"
                    className="form-control"
                    placeholder={placeholder}
                    onChange={onChange}
                    style={
                        onFilterClick
                            ? {
                                  marginLeft: "-3.25rem",
                                  paddingLeft: "3.25rem",
                                  marginRight: "-3.25rem",
                                  paddingRight: "3.25rem",
                                  borderRadius: "0.3rem"
                              }
                            : {
                                  marginLeft: "-3.25rem",
                                  paddingLeft: "3.25rem",
                                  borderRadius: "0.3rem"
                              }
                    }
                />
                {onFilterClick && (
                    <span
                        className="input-group-text bg-transparent border-0 cursor-pointer"
                        style={{ zIndex: 4 }}
                        onClick={() => onFilterClick()}
                    >
                        <i
                            className={
                                filtered ? "bi bi-funnel-fill" : "bi bi-funnel"
                            }
                        />
                    </span>
                )}
            </div>
        </div>
    );
};

export const SearchbarSmall: React.FC<Props> = ({
    placeholder,
    onChange,
    onFilterClick,
    filtered = false,
    id
}) => {
    return (
        <div className="SearchbarSmall">
            <div className="input-group input-group-sm sm">
                <span
                    className="input-group-text bg-transparent border-0"
                    style={{ zIndex: 4 }}
                >
                    <i className="bi bi-search"></i>
                </span>
                <input
                    id={id}
                    type="search"
                    className="form-control"
                    placeholder={placeholder}
                    onChange={onChange}
                    style={
                        onFilterClick
                            ? {
                                  marginLeft: "-2rem",
                                  paddingLeft: "2rem",
                                  marginRight: "-2rem",
                                  paddingRight: "2rem",
                                  borderRadius: "0.3rem"
                              }
                            : {
                                  marginLeft: "-2rem",
                                  paddingLeft: "2rem",
                                  borderRadius: "0.3rem"
                              }
                    }
                />
                {onFilterClick && (
                    <span
                        className="input-group-text bg-transparent border-0"
                        style={{ zIndex: 4 }}
                        onClick={() => onFilterClick()}
                    >
                        <i
                            className={
                                filtered ? "bi bi-funnel-fill" : "bi bi-funnel"
                            }
                        />
                    </span>
                )}
            </div>
        </div>
    );
};

export default Searchbar;
