import React from "react";
import { Link } from "react-router-dom";

interface innerProps {
    image?: string;
    title: string;
    subtitle?: string;
    date?: string;
    onClick?: () => void;
}

interface Props extends innerProps {
    _id: string;
    href?: string;
    external?: boolean;
    newTab?: boolean;
    onEdit?: (_id: string) => void;
    onDelete?: (_id: string) => void;
}

const InnerLink: React.FC<innerProps> = ({
    image,
    title,
    subtitle,
    date,
    onClick
}) => {
    return (
        <div
            className="d-flex w-100"
            onClick={onClick}
            role={onClick ? "button" : undefined}
        >
            {image && (
                <img
                    src={image}
                    className="rounded-3"
                    alt={title}
                    style={{
                        maxWidth: "100px",
                        maxHeight: "100px",
                        objectFit: "cover"
                    }}
                />
            )}

            <div className="d-flex w-100 ms-3 py-1 flex-column justify-content-between">
                <h6 className="fw-bold w-100 m-0">{title}</h6>
                <div className="d-lg-flex w-100">
                    {subtitle && <p className="m-0">{subtitle}</p>}

                    {date && <p className="m-0 ms-auto">{date}</p>}
                </div>
            </div>
        </div>
    );
};

export const Result: React.FC<Props> = ({
    _id,
    title,
    subtitle,
    href,
    date,
    image,
    external = false,
    newTab = true,
    onEdit,
    onDelete
}) => {
    return (
        <div className="list-group-item list-group-item-action border-0 d-inline-flex">
            {href ? (
                !external ? (
                    <Link
                        to={href}
                        className="text-decoration-none text-reset d-inline-block"
                        style={{ width: "90%" }}
                        data-id={_id}
                    >
                        <InnerLink
                            image={image}
                            title={title}
                            subtitle={subtitle}
                            date={date}
                        />
                    </Link>
                ) : (
                    /* TODO: external link warning */
                    <a
                        href={href}
                        target={newTab ? "_blank" : "_self"}
                        rel="noreferrer noopener"
                        data-id={_id}
                        className="text-decoration-none text-reset d-inline-block"
                        style={{ width: "90%" }}
                    >
                        <InnerLink
                            image={image}
                            title={title}
                            subtitle={subtitle}
                            date={date}
                        />
                    </a>
                )
            ) : onEdit ? (
                <InnerLink
                    image={image}
                    title={title}
                    subtitle={subtitle}
                    date={date}
                    onClick={() => onEdit(_id)}
                />
            ) : (
                <InnerLink
                    image={image}
                    title={title}
                    subtitle={subtitle}
                    date={date}
                />
            )}
            <div className="d-flex ms-auto">
                {onEdit ? (
                    <button onClick={() => onEdit(_id)}>
                        <i className="bi bi-pencil-square"></i>
                    </button>
                ) : null}
                {onDelete ? (
                    <button onClick={() => onDelete(_id)}>
                        <i className="bi bi-trash ms-2"></i>
                    </button>
                ) : null}
            </div>
        </div>
    );
};

export default Result;
