import type { PaginationParams } from "../../../types/index.js";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export function parsePagination(
  query: Record<string, unknown> = {}
): PaginationParams {
  const page = Math.max(parseInt(query.page as string, 10) || 1, 1);
  const limit = Math.min(
    Math.max(parseInt(query.limit as string, 10) || DEFAULT_LIMIT, 1),
    MAX_LIMIT
  );
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

export function buildSearchQuery(
  search: string | undefined,
  fields: string[] = []
): Record<string, unknown> {
  if (!search || !fields.length) {
    return {};
  }
  const regex = new RegExp(search.trim(), "i");
  return {
    $or: fields.map((field) => ({
      [field]: regex,
    })),
  };
}
