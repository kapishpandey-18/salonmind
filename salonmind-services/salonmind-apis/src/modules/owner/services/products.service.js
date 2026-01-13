const ApiError = require("../../../utils/ApiError");
const TenantProductItem = require("../../../models/TenantProductItem");
const { resolveBranchContext } = require("../utils/branchContext");
const { parsePagination, buildSearchQuery } = require("../utils/pagination");

function toProductResponse(doc) {
  return {
    id: doc._id.toString(),
    name: doc.name,
    brand: doc.brand || "",
    category: doc.category || "",
    price: typeof doc.price === "number" ? doc.price : 0,
    usage: doc.usage || "",
    description: doc.description || "",
    inStock: doc.inStock !== false,
  };
}

function toInventoryResponse(doc) {
  const fallbackDate = doc.lastRestocked || doc.updatedAt || doc.createdAt;
  return {
    id: doc._id.toString(),
    name: doc.name,
    category: doc.category || "",
    currentStock: typeof doc.currentStock === "number" ? doc.currentStock : 0,
    minStock: typeof doc.minStock === "number" ? doc.minStock : 0,
    maxStock: typeof doc.maxStock === "number" ? doc.maxStock : 0,
    unit: doc.unit || "",
    price: typeof doc.price === "number" ? doc.price : 0,
    supplier: doc.supplier || "",
    lastRestocked: fallbackDate ? fallbackDate.toISOString() : "",
  };
}

function sanitizeProductPayload(payload = {}) {
  return {
    name: payload.name?.trim(),
    brand: payload.brand,
    category: payload.category,
    price: typeof payload.price === "number" ? payload.price : undefined,
    usage: payload.usage,
    description: payload.description,
    inStock:
      typeof payload.inStock === "boolean" ? payload.inStock : undefined,
    currentStock:
      typeof payload.currentStock === "number" ? payload.currentStock : undefined,
    minStock:
      typeof payload.minStock === "number" ? payload.minStock : undefined,
    maxStock:
      typeof payload.maxStock === "number" ? payload.maxStock : undefined,
    unit: payload.unit,
    supplier: payload.supplier,
    lastRestocked: payload.lastRestocked
      ? new Date(payload.lastRestocked)
      : undefined,
  };
}

function resolveInStock(payload, existing) {
  if (typeof payload.inStock === "boolean") {
    return payload.inStock;
  }
  if (typeof payload.currentStock === "number") {
    return payload.currentStock > 0;
  }
  if (existing && typeof existing.currentStock === "number") {
    return existing.currentStock > 0;
  }
  return true;
}

async function listProducts({ tenantId, branchId, search, category, pagination = {} }) {
  const branch = await resolveBranchContext({
    tenantId,
    branchId,
    fallbackToDefault: true,
  });
  const baseQuery = {
    tenant: tenantId,
    branch: branch._id,
    isDeleted: false,
  };
  if (category) {
    baseQuery.category = category;
  }
  const searchQuery = buildSearchQuery(search, [
    "name",
    "brand",
    "category",
    "usage",
    "description",
  ]);
  const finalQuery = { ...baseQuery, ...searchQuery };
  const { page, limit, skip } = parsePagination(pagination);

  const [products, total] = await Promise.all([
    TenantProductItem.find(finalQuery)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit),
    TenantProductItem.countDocuments(finalQuery),
  ]);

  return {
    results: products.map(toProductResponse),
    pagination: { page, limit, total },
    branch,
  };
}

async function createProduct({ tenantId, userId, branchId, payload }) {
  if (!payload?.name) {
    throw ApiError.badRequest("Product name is required");
  }
  const branch = await resolveBranchContext({
    tenantId,
    branchId,
    fallbackToDefault: true,
  });

  const data = sanitizeProductPayload(payload);
  data.tenant = tenantId;
  data.branch = branch._id;
  data.createdBy = userId;
  data.inStock = resolveInStock(data);

  const product = await TenantProductItem.create(data);
  return toProductResponse(product);
}

async function updateProduct({ tenantId, productId, payload }) {
  const product = await TenantProductItem.findOne({
    _id: productId,
    tenant: tenantId,
    isDeleted: false,
  });
  if (!product) {
    throw ApiError.notFound("Product not found");
  }

  if (payload.branchId) {
    const branch = await resolveBranchContext({
      tenantId,
      branchId: payload.branchId,
      fallbackToDefault: true,
    });
    product.branch = branch._id;
  }

  const data = sanitizeProductPayload(payload);
  Object.entries(data).forEach(([key, value]) => {
    if (typeof value !== "undefined") {
      product[key] = value;
    }
  });
  product.inStock = resolveInStock(payload, product);
  if (typeof payload.currentStock === "number" && !payload.lastRestocked) {
    product.lastRestocked = new Date();
  }

  await product.save();
  return toProductResponse(product);
}

async function deleteProduct({ tenantId, productId }) {
  const product = await TenantProductItem.findOne({
    _id: productId,
    tenant: tenantId,
    isDeleted: false,
  });
  if (!product) {
    throw ApiError.notFound("Product not found");
  }
  product.isDeleted = true;
  product.deletedAt = new Date();
  await product.save();
  return product;
}

async function listInventory({ tenantId, branchId, search, category, pagination = {} }) {
  const branch = await resolveBranchContext({
    tenantId,
    branchId,
    fallbackToDefault: true,
  });
  const baseQuery = {
    tenant: tenantId,
    branch: branch._id,
    isDeleted: false,
  };
  if (category) {
    baseQuery.category = category;
  }
  const searchQuery = buildSearchQuery(search, [
    "name",
    "supplier",
    "category",
  ]);
  const finalQuery = { ...baseQuery, ...searchQuery };
  const { page, limit, skip } = parsePagination(pagination);

  const [items, total] = await Promise.all([
    TenantProductItem.find(finalQuery)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit),
    TenantProductItem.countDocuments(finalQuery),
  ]);

  return {
    results: items.map(toInventoryResponse),
    pagination: { page, limit, total },
    branch,
  };
}

async function updateInventory({ tenantId, productId, payload }) {
  const product = await TenantProductItem.findOne({
    _id: productId,
    tenant: tenantId,
    isDeleted: false,
  });
  if (!product) {
    throw ApiError.notFound("Inventory item not found");
  }

  const allowed = [
    "name",
    "category",
    "currentStock",
    "minStock",
    "maxStock",
    "unit",
    "price",
    "supplier",
    "lastRestocked",
  ];
  allowed.forEach((field) => {
    if (typeof payload[field] !== "undefined") {
      product[field] =
        field === "lastRestocked"
          ? new Date(payload[field])
          : payload[field];
    }
  });

  product.inStock = resolveInStock(payload, product);
  if (typeof payload.currentStock === "number" && !payload.lastRestocked) {
    product.lastRestocked = new Date();
  }

  await product.save();
  return toInventoryResponse(product);
}

module.exports = {
  listProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  listInventory,
  updateInventory,
};
