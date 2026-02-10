import mongoose, { Schema, type Document, type Types } from "mongoose";

export interface IBranch {
  tenant: Types.ObjectId;
  name: string;
  code?: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  phone: string;
  email: string;
  isDefault: boolean;
  isActive: boolean;
  metadata: Map<string, string>;
  createdAt: Date;
  updatedAt: Date;
}

export type IBranchDocument = Document<Types.ObjectId, object, IBranch> &
  IBranch;

const addressSchema = new Schema(
  {
    street: { type: String, default: "" },
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    zipCode: { type: String, default: "" },
    country: { type: String, default: "India" },
  },
  { _id: false }
);

const branchSchema = new Schema<IBranch>(
  {
    tenant: {
      type: Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      trim: true,
    },
    address: {
      type: addressSchema,
      default: () => ({}),
    },
    phone: {
      type: String,
      default: "",
    },
    email: {
      type: String,
      default: "",
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    metadata: {
      type: Map,
      of: String,
      default: () => new Map(),
    },
  },
  { timestamps: true }
);

branchSchema.index({ tenant: 1, isActive: 1 });
branchSchema.index({ tenant: 1, isDefault: 1 });

export default mongoose.model<IBranch>("Branch", branchSchema);
