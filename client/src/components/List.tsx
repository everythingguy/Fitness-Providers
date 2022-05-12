import { Link } from "react-router-dom";

export const List = ({
  title,
  items,
}: {
  title: string;
  items: [
    {
      to: string;
      id: string;
      img_url: string;
      text: string;
      author: string;
      date: Date;
    }
  ];
}) => {
  return (
    <div className="DetailedList">
      <div className="d-grid gap-1 p-2">
        <h4 className="mb-0 ms-4 fw-bold">{title}</h4>
        <div className="list-group rounded-2">
          {items.map((item) => (
            <Link
              to={item.to}
              key={item.id}
              id={item.id}
              className="list-group-item list-group-item-action border-0"
            >
              <div className="d-flex">
                <img
                  src={item.img_url}
                  className="rounded-3"
                  alt={item.text}
                  style={{ width: "4em", height: "4em", objectFit: "cover" }}
                />
                <div className="d-flex w-75 ms-3 py-1 flex-column justify-content-between">
                  <h6 className="fw-bold w-100 m-0">{item.text}</h6>
                  <div className="d-flex w-100 justify-content-between">
                    <p className="m-0">{item.author}</p>
                    <p className="m-0">{item.date}</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default List;
