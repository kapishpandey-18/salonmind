import mongoose, { Schema, type Document, type Types } from "mongoose";
import type { Surface } from "../../../types/index.js";

export interface IRefreshToken {
  user: Types.ObjectId;
  session: Types.ObjectId;
  surface: Surface;
  tokenHash: string;
  expiresAt: Date;
  revokedAt?: Date;
  revokedReason?: string;
  replacedByTokenHash?: string;
  createdByIp?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IRefreshTokenMethods {
  isActive(): boolean;
}

export type IRefreshTokenDocument = Document<
  Types.ObjectId,
  object,
  IRefreshToken
> &
  IRefreshToken &
  IRefreshTokenMethods;

const refreshTokenSchema = new Schema<IRefreshToken, mongoose.Model<IRefreshToken, object, IRefreshTokenMethods>, IRefreshTokenMethods>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    session: {
      type: Schema.Types.ObjectId,
      ref: "Session",
      required: true,
      index: true,
    },
    surface: {
      type: String,
      enum: ["ADMIN", "SALON_OWNER", "SALON_EMPLOYEE"],
      required: true,
      index: true,
    },
    tokenHash: {
      type: String,
      required: true,
      unique: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: {
        expires: 0,
      },
    },
    revokedAt: {
      type: Date,
    },
    revokedReason: {
      type: String,
    },
    replacedByTokenHash: {
      type: String,
    },
    createdByIp: String,
  },
  {
    timestamps: true,
  }
);

refreshTokenSchema.methods.isActive = function (): boolean {
  return !this.revokedAt && new Date() < this.expiresAt;
};

export default mongoose.model<IRefreshToken, mongoose.Model<IRefreshToken, object, IRefreshTokenMethods>>(
  "RefreshToken",
  refreshTokenSchema
);
