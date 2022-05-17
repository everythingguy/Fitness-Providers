import { KeysOfMultiType } from "../@types/misc";

interface Item {
  _id: number;
  value?: string;
}

interface Props {
  items: Item[];
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onScrollBottom?: (e: React.UIEvent<HTMLDivElement, UIEvent>) => void;
  textProperty?: KeysOfMultiType<Item, string>;
  id?: string;
}

export const Checklist: React.FC<Props> = ({
  items,
  onChange,
  onScrollBottom,
  textProperty = "value",
  id = "",
}) => {
  const onScroll = (e) => {
    const ele = e.target;
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
              data-id={item._id}
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
