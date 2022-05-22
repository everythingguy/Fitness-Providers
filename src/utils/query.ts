import { FilterQuery } from "mongoose";

/**
 * @description append a query to another using a $and
 */
export function appendQuery<T>(
    currQuery: FilterQuery<T>,
    additionalQuery: FilterQuery<T>
) {
    if (currQuery.$and) currQuery.$and.push(additionalQuery);
    else if (Object.keys(currQuery).length === 0) return additionalQuery;
    else
        currQuery = {
            $and: [currQuery, additionalQuery]
        };

    return currQuery;
}
