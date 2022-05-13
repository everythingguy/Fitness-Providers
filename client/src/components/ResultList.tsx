import React from "react";

export function ResultList({
  title,
  items,
  component,
  onEdit,
  onDelete,
  onScrollBottom,
}: {
  title: string;
  items: any; // TODO: type this
  component: any; // TODO: type this
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onScrollBottom?: (e: React.UIEvent<HTMLDivElement, UIEvent>) => void;
}) {
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
              key: item.id,
            })
          )}
        </div>
      </div>
    </div>
  );
}
