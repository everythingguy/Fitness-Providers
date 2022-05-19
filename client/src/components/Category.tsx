import { Tag } from "../@types/Models";
import SearchableCheckList from "./SearchableCheckList";

interface Props {
  category: string;
  items: Tag[];
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  id: string;
}

export const Category: React.FC<Props> = ({
  category,
  items,
  onChange,
  id,
}) => {
  if (items && items.length > 0)
    return (
      <div className="col-12">
        <div className="card-body mb-md-4">
          <h6 className="fw-bold">{category}</h6>
          <SearchableCheckList
            placeholder={"Ex: " + items[0].value}
            items={items}
            onChange={onChange}
            id={id}
          />
        </div>
      </div>
    );
  else return <></>;
};

export default Category;
