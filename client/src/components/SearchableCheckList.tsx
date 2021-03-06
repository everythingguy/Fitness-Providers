import React from "react";
import { SearchbarSmall } from "./Searchbar";
import CheckList from "./CheckList";
import { useEffect, useState } from "react";
import { KeysOfMultiType } from "../@types/misc";

interface Item {
    _id: string;
    value?: string;
    checked?: boolean;
}

interface Props {
    placeholder: string;
    items: Item[];
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    textProperty?: KeysOfMultiType<Item, string>;
    id?: string;
}

export const SearchableChecklist: React.FC<Props> = ({
    placeholder,
    items,
    onChange,
    textProperty = "value",
    id = ""
}) => {
    const [visibleItems, setVisibleItems] = useState(items);

    // Here we use an effect hook so that we can update visible items state if we have re-rendered.
    useEffect(() => {
        setVisibleItems(items);
    }, [items]);

    const onInputChange = (e) => {
        setVisibleItems(
            items.filter((item) => {
                if (textProperty && item[textProperty])
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    return item[textProperty]!.toLowerCase().includes(
                        e.target.value.toLowerCase()
                    );
                else {
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    return item
                        .value!.toLowerCase()
                        .includes(e.target.value.toLowerCase());
                }
            })
        );
    };

    return (
        <div className="SearchableChecklist">
            <div className="d-grid gap-2">
                <SearchbarSmall
                    placeholder={placeholder}
                    onChange={onInputChange}
                />
                <div
                    style={
                        visibleItems.length === 0
                            ? { visibility: "hidden" }
                            : { visibility: "visible" }
                    }
                >
                    <CheckList
                        items={visibleItems}
                        onChange={onChange}
                        textProperty={textProperty}
                        id={id}
                    />
                </div>
            </div>
        </div>
    );
};

export default SearchableChecklist;
