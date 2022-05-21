import React from "react";
import { Link } from "react-router-dom";
import BootstrapCard from "react-bootstrap/Card";

interface innerProps {
  image: string;
  title?: string;
  subtitle?: string;
  text?: string;
  date?: string;
}

interface Props extends innerProps {
  _id: string;
  href: string;
  external?: boolean;
  newTab?: boolean;
  className?: string;
}

const InnerCard: React.FC<innerProps> = ({
  title,
  subtitle,
  text,
  date,
  image,
}) => {
  return (
    <>
      <BootstrapCard.Img
        variant="top"
        src={image}
        alt={title}
      ></BootstrapCard.Img>
      <BootstrapCard.Header>
        <BootstrapCard.Title>{title}</BootstrapCard.Title>
        {subtitle && (
          <BootstrapCard.Subtitle>{subtitle}</BootstrapCard.Subtitle>
        )}
      </BootstrapCard.Header>
      <BootstrapCard.Body>
        {text && <BootstrapCard.Text>{text}</BootstrapCard.Text>}
      </BootstrapCard.Body>
      {date && <BootstrapCard.Footer>{date}</BootstrapCard.Footer>}
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
  className = "",
  external = false,
  newTab = true,
}) => {
  return (
    <div className={"p-3 col-lg-3 col-md-4 col-sm-6 col-xs-12 " + className}>
      <BootstrapCard
        style={{
          padding: "0",
        }}
      >
        {external ? (
          <a
            href={href}
            target={newTab ? "_blank" : "_self"}
            rel="noreferrer noopener"
            data-id={_id}
            className="text-decoration-none text-reset"
          >
            <InnerCard
              image={image}
              title={title}
              subtitle={subtitle}
              text={text}
              date={date}
            />
          </a>
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
              text={text}
              date={date}
            />
          </Link>
        )}
      </BootstrapCard>
    </div>
  );
};

export default Card;
