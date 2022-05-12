const Searchbar = ({
  placeholder,
  onChange,
  id,
}: {
  placeholder: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  id?: string;
}) => {
  return (
    <div className="SearchbarLarge">
      <div className="input-group input-group-lg">
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
          style={{
            marginLeft: "-3.25rem",
            paddingLeft: "3.25rem",
            borderRadius: "0.3rem",
          }}
        />
      </div>
    </div>
  );
};

export const SearchbarSmall = ({
  placeholder,
  onChange,
  id,
}: {
  placeholder: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  id?: string;
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
          style={{
            marginLeft: "-2rem",
            paddingLeft: "2rem",
            borderRadius: "0.3rem",
          }}
        />
      </div>
    </div>
  );
};

export default Searchbar;
