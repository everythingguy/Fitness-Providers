import React from "react";
import Result from "./Result";

interface ComponentProps {
  _id: string;
  href: string;
  image: string;
  title: string;
  subtitle?: string;
  date?: Date;
  newTab?: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

interface Item {
  _id: string;
  href: string;
  image: string;
  title: string;
  subtitle?: string;
  date?: Date;
  newTab?: boolean;
}

interface Props {
  title: string;
  items: Item[];
  component?: React.FC<ComponentProps>;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onScrollBottom?: (e: React.UIEvent<HTMLDivElement, UIEvent>) => void;
}

export const ResultList: React.FC<Props> = ({
  title,
  items,
  component = Result,
  onEdit,
  onDelete,
  onScrollBottom,
}) => {
  const onScroll = (e) => {
    const ele = e.target;
    if (ele.scrollHeight - ele.scrollTop === ele.clientHeight) {
      if (onScrollBottom) onScrollBottom(e);
    }
  };

  return (
    <div className="ResultList">
      <div className="d-grid gap-1 p-2">
        <h4 className="my-2">{title}</h4>
        <div className="divider-border"></div>
        <div
          onScroll={onScroll}
          className="list-group rounded-2 import w-100 overflow-auto"
        >
          {items.map((item) =>
            React.createElement(component, {
              ...item,
              onEdit,
              onDelete,
              key: item._id,
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default ResultList;
