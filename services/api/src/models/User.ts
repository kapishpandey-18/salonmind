import mongoose, { Schema, type Document, type Types, type CallbackError } from "mongoose";
import bcrypt from "bcryptjs";
import type { UserRole } from "../types/index.js";

export interface IUser {
  email?: string;
  password?: string;
  phoneNumber?: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  tenant?: Types.ObjectId;
  activeBranch?: Types.ObjectId;
  staffProfile?: {
    specializations: string[];
    workingHours: Array<{
      day: string;
      isAvailable: boolean;
      startTime?: string;
      endTime?: string;
    }>;
    commissionRate: number;
    totalEarnings: number;
    totalAppointments: number;
    rating: number;
    bio?: string;
  };
  isActive: boolean;
  isOnboarded: boolean;
  isProfileComplete: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserMethods {
  comparePassword(candidatePassword: string): Promise<boolean>;
  toJSON(): Record<string, unknown>;
}

export type IUserDocument = Document<Types.ObjectId, object, IUser> &
  IUser &
  IUserMethods;

const userSchema = new Schema<IUser, mongoose.Model<IUser, object, IUserMethods>, IUserMethods>(
  {
    email: {
      type: String,
      required: function (this: IUser) {
        return !this.phoneNumber;
      },
      sparse: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: function (this: IUser): boolean {
        return Boolean(this.email && !this.phoneNumber);
      },
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    phoneNumber: {
      type: String,
      sparse: true,
      trim: true,
    },
    role: {
      type: String,
      enum: [
        "owner",
        "manager",
        "staff",
        "client",
        "ADMIN",
        "SALON_OWNER",
        "SALON_EMPLOYEE",
      ],
      default: "client",
    },
    firstName: {
      type: String,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    avatar: {
      type: String,
    },
    tenant: {
      type: Schema.Types.ObjectId,
      ref: "Tenant",
    },
    activeBranch: {
      type: Schema.Types.ObjectId,
      ref: "Branch",
    },
    staffProfile: {
      specializations: [
        {
          type: String,
          enum: [
            "hair",
            "nails",
            "facial",
            "massage",
            "makeup",
            "waxing",
            "spa",
          ],
        },
      ],
      workingHours: [
        {
          day: {
            type: String,
            enum: [
              "monday",
              "tuesday",
              "wednesday",
              "thursday",
              "friday",
              "saturday",
              "sunday",
            ],
          },
          isAvailable: {
            type: Boolean,
            default: true,
          },
          startTime: String,
          endTime: String,
        },
      ],
      commissionRate: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
      totalEarnings: {
        type: Number,
        default: 0,
      },
      totalAppointments: {
        type: Number,
        default: 0,
      },
      rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
      bio: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isOnboarded: {
      type: Boolean,
      default: false,
    },
    isProfileComplete: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  const doc = this as unknown as IUser & { password?: string; isModified(path: string): boolean };
  if (!doc.isModified("password")) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    doc.password = await bcrypt.hash(doc.password!, salt);
    next();
  } catch (error) {
    next(error as CallbackError);
  }
});

userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  const doc = this as unknown as IUser & { password?: string };
  return await bcrypt.compare(candidatePassword, doc.password!);
};

userSchema.methods.toJSON = function (): Record<string, unknown> {
  const user = this.toObject() as Record<string, unknown>;
  delete user.password;
  return user;
};

export default mongoose.model<IUser, mongoose.Model<IUser, object, IUserMethods>>(
  "User",
  userSchema
);
