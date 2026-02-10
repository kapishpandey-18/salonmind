import mongoose, { Schema, type Document, type Types } from "mongoose";

export interface ITenantProductItem {
  tenant: Types.ObjectId;
  branch: Types.ObjectId;
  name: string;
  brand: string;
  category: string;
  price: number;
  usage: string;
  description: string;
  inStock: boolean;
  currentStock: number;
  minStock: number;
  maxStock: number;
  unit: string;
  supplier: string;
  lastRestocked?: Date;
  isDeleted: boolean;
  deletedAt?: Date;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export type ITenantProductItemDocument = Document<
  Types.ObjectId,
  object,
  ITenantProductItem
> &
  ITenantProductItem;

const tenantProductSchema = new Schema<ITenantProductItem>(
  {
    tenant: {
      type: Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
      index: true,
    },
    branch: {
      type: Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    brand: {
      type: String,
      default: "",
      trim: true,
    },
    category: {
      type: String,
      default: "",
      trim: true,
    },
    price: {
      type: Number,
      default: 0,
      min: 0,
    },
    usage: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
    inStock: {
      type: Boolean,
      default: true,
    },
    currentStock: {
      type: Number,
      default: 0,
      min: 0,
    },
    minStock: {
      type: Number,
      default: 0,
      min: 0,
    },
    maxStock: {
      type: Number,
      default: 0,
      min: 0,
    },
    unit: {
      type: String,
      default: "",
      trim: true,
    },
    supplier: {
      type: String,
      default: "",
      trim: true,
    },
    lastRestocked: {
      type: Date,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

tenantProductSchema.index({ tenant: 1, branch: 1, isDeleted: 1 });

export default mongoose.model<ITenantProductItem>(
  "TenantProductItem",
  tenantProductSchema
);
