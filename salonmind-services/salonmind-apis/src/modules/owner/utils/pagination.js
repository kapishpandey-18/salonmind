const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

function parsePagination(query = {}) {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(
    Math.max(parseInt(query.limit, 10) || DEFAULT_LIMIT, 1),
    MAX_LIMIT
  );
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

function buildSearchQuery(search, fields = []) {
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

module.exports = {
  parsePagination,
  buildSearchQuery,
};
