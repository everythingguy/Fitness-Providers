import React, { useState } from "react";
import { Link } from "react-router-dom";
import BootstrapCard from "react-bootstrap/Card";

interface innerProps {
    image: string;
    title?: string;
    subtitle?: string;
}

interface Props extends innerProps {
    _id: string;
    href: string;
    external?: boolean;
    newTab?: boolean;
    className?: string;
    text?: string;
    date?: string;
    readMore?: boolean;
    hidden?: boolean;
    setExternalWarningState?: (state: {
        showModal: boolean;
        link: string;
        newTab: boolean;
    }) => void;
}

const InnerCard: React.FC<innerProps> = ({ title, subtitle, image }) => {
    return (
        <>
            <BootstrapCard.Img
                variant="top"
                src={image}
                alt={title}
                style={{ maxWidth: "500px", maxHeight: "500px" }}
            ></BootstrapCard.Img>
            <BootstrapCard.Header>
                <BootstrapCard.Title>{title}</BootstrapCard.Title>
                {subtitle && (
                    <BootstrapCard.Subtitle>{subtitle}</BootstrapCard.Subtitle>
                )}
            </BootstrapCard.Header>
        </>
    );
};

export const Card: React.FC<Props> = ({
    _id,
    title,
    subtitle,
    text,
    href,
    date,
    image,
    setExternalWarningState,
    className = "",
    external = false,
    newTab = true,
    readMore = true,
    hidden = false
}) => {
    const maxLength = 100;
    const [displayAll, setDisplayAll] = useState(false);

    return (
        <div
            className={"p-3 col-lg-3 col-md-4 col-sm-6 col-xs-12 " + className}
        >
            <BootstrapCard
                style={{
                    padding: "0"
                }}
            >
                {external ? (
                    <button
                        type="button"
                        onClick={() => {
                            if (setExternalWarningState)
                                setExternalWarningState({
                                    showModal: true,
                                    link: href,
                                    newTab
                                });
                        }}
                        data-id={_id}
                        className="text-decoration-none text-reset border-0 bg-transparent p-0"
                    >
                        <InnerCard
                            image={image}
                            title={title}
                            subtitle={subtitle}
                        />
                    </button>
                ) : (
                    <Link
                        to={href}
                        className="text-decoration-none text-reset"
                        data-id={_id}
                    >
                        <InnerCard
                            image={image}
                            title={title}
                            subtitle={subtitle}
                        />
                    </Link>
                )}
                <BootstrapCard.Body>
                    {text && readMore && text.length > maxLength ? (
                        <BootstrapCard.Text>
                            {displayAll ? (
                                <>
                                    <p>{text}</p>
                                    <button
                                        role="button"
                                        type="button"
                                        className="text-primary"
                                        onClick={() => setDisplayAll(false)}
                                    >
                                        read less
                                    </button>
                                </>
                            ) : (
                                <>
                                    <p>{text.substring(0, maxLength - 1)}...</p>
                                    <button
                                        role="button"
                                        type="button"
                                        className="text-primary"
                                        onClick={() => setDisplayAll(true)}
                                    >
                                        read more
                                    </button>
                                </>
                            )}
                        </BootstrapCard.Text>
                    ) : (
                        <>
                            <BootstrapCard.Text>{text}</BootstrapCard.Text>
                            {hidden && (
                                <p className="text-danger">
                                    Only you can see this result until you
                                    select a subscription. Select a subscription
                                    in the user settings.
                                </p>
                            )}
                        </>
                    )}
                </BootstrapCard.Body>
                {date && <BootstrapCard.Footer>{date}</BootstrapCard.Footer>}
            </BootstrapCard>
        </div>
    );
};

export default Card;
