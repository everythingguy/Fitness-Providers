import { KeysOfMultiType } from "../@types/misc";

interface item {
  id: number;
  text?: string;
}

export const Checklist = ({
  items,
  onChange,
  onScrollBottom,
  textProperty = "text",
  id = "",
}: {
  items: item[];
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onScrollBottom?: (e: React.UIEvent<HTMLDivElement, UIEvent>) => void;
  textProperty?: KeysOfMultiType<item, string>;
  id?: string;
}) => {
  const onScroll = (e) => {
    let ele = e.target;
    if (ele.scrollHeight - ele.scrollTop === ele.clientHeight) {
      if (onScrollBottom) onScrollBottom(e);
    }
  };

  return (
    <div
      onScroll={onScroll}
      className="Checklist w-100 overflow-auto"
      style={{ height: "8.5em" }}
    >
      <div className="d-grid gap-2 p-2 rounded-2">
        {items.map((item) => (
          <div className="form-check" key={item[textProperty] + id}>
            <input
              className="form-check-input"
              type="checkbox"
              id={item[textProperty] + id}
              data-id={item.id}
              onChange={onChange}
            />
            <label
              className="form-check-label"
              htmlFor={item[textProperty] + id}
            >
              {item[textProperty]}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Checklist;
