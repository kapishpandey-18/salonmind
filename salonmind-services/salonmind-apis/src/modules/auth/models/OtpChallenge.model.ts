import mongoose, { Schema, type Document, type Types } from "mongoose";
import type { Surface, OtpChallengeStatus } from "../../../types/index.js";

const SURFACES: Surface[] = ["ADMIN", "SALON_OWNER", "SALON_EMPLOYEE"];
const STATUSES: OtpChallengeStatus[] = ["ACTIVE", "USED", "LOCKED"];

export interface IOtpChallenge {
  challengeId: string;
  phone: string;
  surface: Surface;
  otpHash: string;
  expiresAt: Date;
  attempts: number;
  maxAttempts: number;
  status: OtpChallengeStatus;
  resendCount: number;
  lockReason?: string;
  meta: {
    ip?: string;
    userAgent?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export type IOtpChallengeDocument = Document<
  Types.ObjectId,
  object,
  IOtpChallenge
> &
  IOtpChallenge;

const otpChallengeSchema = new Schema<IOtpChallenge>(
  {
    challengeId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    phone: {
      type: String,
      required: true,
      index: true,
    },
    surface: {
      type: String,
      enum: SURFACES,
      required: true,
      index: true,
    },
    otpHash: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: {
        expires: 0,
      },
    },
    attempts: {
      type: Number,
      default: 0,
    },
    maxAttempts: {
      type: Number,
      default: 5,
    },
    status: {
      type: String,
      enum: STATUSES,
      default: "ACTIVE",
      index: true,
    },
    resendCount: {
      type: Number,
      default: 0,
    },
    lockReason: {
      type: String,
    },
    meta: {
      ip: String,
      userAgent: String,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IOtpChallenge>(
  "OtpChallenge",
  otpChallengeSchema
);
