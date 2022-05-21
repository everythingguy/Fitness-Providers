import { Types } from "mongoose";
import { Request } from "../@types/request";

/**
 * @description filter a GET query based on tags
 */
export function filterTags(req: Request) {
  // filter based on tags
  const tagFilter: Types.ObjectId[] = [];

  try {
    const tagSplit: string[] = req.query.tags
      ? (req.query.tags as string).split(",")
      : [];

    for (const tag of tagSplit) tagFilter.push(new Types.ObjectId(tag));
    // eslint-disable-next-line no-empty
  } catch (error) {}

  return tagFilter;
}
