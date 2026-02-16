import type { Types } from "mongoose";
import ApiError from "../../../utils/ApiError.js";
import TenantProductItem from "../../../models/TenantProductItem.js";
import type {
  ITenantProductItem,
  ITenantProductItemDocument,
} from "../../../models/TenantProductItem.js";
import { resolveBranchContext } from "../utils/branchContext.js";
import { parsePagination, buildSearchQuery } from "../utils/pagination.js";
import type { IBranchDocument } from "../../../models/Branch.js";

/* -------------------------------------------------------------------------- */
/*  Response / payload types                                                  */
/* -------------------------------------------------------------------------- */

interface ProductResponse {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  usage: string;
  description: string;
  inStock: boolean;
}

interface InventoryResponse {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  unit: string;
  price: number;
  supplier: string;
  lastRestocked: string;
}

interface ProductPayload {
  name?: string;
  brand?: string;
  category?: string;
  price?: number;
  usage?: string;
  description?: string;
  inStock?: boolean;
  currentStock?: number;
  minStock?: number;
  maxStock?: number;
  unit?: string;
  supplier?: string;
  lastRestocked?: string | Date;
  branchId?: string;
}

interface InventoryPayload {
  name?: string;
  category?: string;
  currentStock?: number;
  minStock?: number;
  maxStock?: number;
  unit?: string;
  price?: number;
  supplier?: string;
  lastRestocked?: string | Date;
  inStock?: boolean;
}

interface SanitizedProductData {
  name?: string;
  brand?: string;
  category?: string;
  price?: number;
  usage?: string;
  description?: string;
  inStock?: boolean;
  currentStock?: number;
  minStock?: number;
  maxStock?: number;
  unit?: string;
  supplier?: string;
  lastRestocked?: Date;
  tenant?: Types.ObjectId | string;
  branch?: Types.ObjectId;
  createdBy?: Types.ObjectId | string;
}

interface ListResult<T> {
  results: T[];
  pagination: { page: number; limit: number; total: number };
  branch: IBranchDocument;
}

/* -------------------------------------------------------------------------- */
/*  Mapping helpers                                                           */
/* -------------------------------------------------------------------------- */

function toProductResponse(doc: ITenantProductItemDocument): ProductResponse {
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

function toInventoryResponse(
  doc: ITenantProductItemDocument
): InventoryResponse {
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

/* -------------------------------------------------------------------------- */
/*  Sanitisation / resolution helpers                                         */
/* -------------------------------------------------------------------------- */

function sanitizeProductPayload(
  payload: ProductPayload = {}
): SanitizedProductData {
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
      typeof payload.currentStock === "number"
        ? payload.currentStock
        : undefined,
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

function resolveInStock(
  payload: Partial<Pick<ITenantProductItem, "inStock" | "currentStock">>,
  existing?: ITenantProductItemDocument | null
): boolean {
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

/* -------------------------------------------------------------------------- */
/*  Product CRUD                                                              */
/* -------------------------------------------------------------------------- */

export async function listProducts({
  tenantId,
  branchId,
  search,
  category,
  pagination = {},
}: {
  tenantId: Types.ObjectId | string;
  branchId?: string | null;
  search?: string;
  category?: string;
  pagination?: Record<string, unknown>;
}): Promise<ListResult<ProductResponse>> {
  const branch = await resolveBranchContext({
    tenantId,
    branchId,
    fallbackToDefault: true,
  });

  const baseQuery: Record<string, unknown> = {
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
    results: (products as ITenantProductItemDocument[]).map(toProductResponse),
    pagination: { page, limit, total },
    branch,
  };
}

export async function createProduct({
  tenantId,
  userId,
  branchId,
  payload,
}: {
  tenantId: Types.ObjectId | string;
  userId: Types.ObjectId | string;
  branchId?: string | null;
  payload: ProductPayload;
}): Promise<ProductResponse> {
  if (!payload?.name) {
    throw ApiError.badRequest("Product name is required");
  }
  const branch = await resolveBranchContext({
    tenantId,
    branchId,
    fallbackToDefault: true,
  });

  const data: SanitizedProductData = sanitizeProductPayload(payload);
  data.tenant = tenantId;
  data.branch = branch._id as Types.ObjectId;
  data.createdBy = userId;
  data.inStock = resolveInStock(data);

  const product = await TenantProductItem.create(data);
  return toProductResponse(product as ITenantProductItemDocument);
}

export async function updateProduct({
  tenantId,
  productId,
  payload,
}: {
  tenantId: Types.ObjectId | string;
  productId: string;
  payload: ProductPayload;
}): Promise<ProductResponse> {
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
    product.branch = branch._id as Types.ObjectId;
  }

  const data = sanitizeProductPayload(payload);
  for (const [key, value] of Object.entries(data)) {
    if (typeof value !== "undefined") {
      (product as unknown as Record<string, unknown>)[key] = value;
    }
  }
  product.inStock = resolveInStock(payload, product as ITenantProductItemDocument);
  if (typeof payload.currentStock === "number" && !payload.lastRestocked) {
    product.lastRestocked = new Date();
  }

  await product.save();
  return toProductResponse(product as ITenantProductItemDocument);
}

export async function deleteProduct({
  tenantId,
  productId,
}: {
  tenantId: Types.ObjectId | string;
  productId: string;
}): Promise<ITenantProductItemDocument> {
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
  return product as ITenantProductItemDocument;
}

/* -------------------------------------------------------------------------- */
/*  Inventory                                                                 */
/* -------------------------------------------------------------------------- */

export async function listInventory({
  tenantId,
  branchId,
  search,
  category,
  pagination = {},
}: {
  tenantId: Types.ObjectId | string;
  branchId?: string | null;
  search?: string;
  category?: string;
  pagination?: Record<string, unknown>;
}): Promise<ListResult<InventoryResponse>> {
  const branch = await resolveBranchContext({
    tenantId,
    branchId,
    fallbackToDefault: true,
  });

  const baseQuery: Record<string, unknown> = {
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
    results: (items as ITenantProductItemDocument[]).map(toInventoryResponse),
    pagination: { page, limit, total },
    branch,
  };
}

export async function updateInventory({
  tenantId,
  productId,
  payload,
}: {
  tenantId: Types.ObjectId | string;
  productId: string;
  payload: InventoryPayload;
}): Promise<InventoryResponse> {
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
  ] as const;

  for (const field of allowed) {
    if (typeof payload[field] !== "undefined") {
      (product as unknown as Record<string, unknown>)[field] =
        field === "lastRestocked"
          ? new Date(payload[field] as string | Date)
          : payload[field];
    }
  }

  product.inStock = resolveInStock(payload, product as ITenantProductItemDocument);
  if (typeof payload.currentStock === "number" && !payload.lastRestocked) {
    product.lastRestocked = new Date();
  }

  await product.save();
  return toInventoryResponse(product as ITenantProductItemDocument);
}
