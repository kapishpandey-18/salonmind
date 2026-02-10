import mongoose, { Schema, type Document, type Types } from "mongoose";
import type { Surface } from "../../../types/index.js";

export interface ISession {
  user: Types.ObjectId;
  surface: Surface;
  isActive: boolean;
  createdByIp?: string;
  userAgent?: string;
  revokedAt?: Date;
  revokedReason?: string;
  lastUsedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISessionMethods {
  revoke(reason: string): void;
}

export type ISessionDocument = Document<Types.ObjectId, object, ISession> &
  ISession &
  ISessionMethods;

const sessionSchema = new Schema<ISession, mongoose.Model<ISession, object, ISessionMethods>, ISessionMethods>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    surface: {
      type: String,
      enum: ["ADMIN", "SALON_OWNER", "SALON_EMPLOYEE"],
      required: true,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdByIp: String,
    userAgent: String,
    revokedAt: Date,
    revokedReason: String,
    lastUsedAt: Date,
  },
  {
    timestamps: true,
  }
);

sessionSchema.methods.revoke = function (reason: string): void {
  this.isActive = false;
  this.revokedAt = new Date();
  this.revokedReason = reason;
};

export default mongoose.model<ISession, mongoose.Model<ISession, object, ISessionMethods>>(
  "Session",
  sessionSchema
);
