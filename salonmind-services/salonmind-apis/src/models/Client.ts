import mongoose, { Schema, type Document, type Types } from "mongoose";

export interface IClient {
  firstName: string;
  lastName?: string;
  email?: string;
  phoneNumber: string;
  birthday?: Date;
  gender?: "male" | "female" | "other" | "prefer_not_to_say";
  avatar?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  notes?: string;
  tags: string[];
  preferences: {
    preferredStaff?: Types.ObjectId;
    preferredServices: Types.ObjectId[];
    allergies: string[];
    skinType?: string;
    hairType?: string;
  };
  visitHistory: Array<{
    appointment: Types.ObjectId;
    visitDate?: Date;
    servicesReceived: Types.ObjectId[];
    amountSpent?: number;
    notes?: string;
  }>;
  totalVisits: number;
  totalSpent: number;
  lastVisit?: Date;
  status: "active" | "inactive" | "blocked";
  loyaltyPoints: number;
  referredBy?: Types.ObjectId;
  createdBy: Types.ObjectId;
  salon: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IClientMethods {
  addVisit(
    appointmentId: Types.ObjectId,
    services: Types.ObjectId[],
    amount: number
  ): Promise<IClientDocument>;
  addLoyaltyPoints(amount: number): Promise<IClientDocument>;
}

export type IClientDocument = Document<Types.ObjectId, object, IClient> &
  IClient &
  IClientMethods & { fullName: string };

const clientSchema = new Schema<IClient, mongoose.Model<IClient, object, IClientMethods>, IClientMethods>(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    phoneNumber: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },
    birthday: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other", "prefer_not_to_say"],
    },
    avatar: {
      type: String,
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
    notes: {
      type: String,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    preferences: {
      preferredStaff: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
      preferredServices: [
        {
          type: Schema.Types.ObjectId,
          ref: "Service",
        },
      ],
      allergies: [String],
      skinType: String,
      hairType: String,
    },
    visitHistory: [
      {
        appointment: {
          type: Schema.Types.ObjectId,
          ref: "Appointment",
        },
        visitDate: Date,
        servicesReceived: [
          {
            type: Schema.Types.ObjectId,
            ref: "Service",
          },
        ],
        amountSpent: Number,
        notes: String,
      },
    ],
    totalVisits: {
      type: Number,
      default: 0,
    },
    totalSpent: {
      type: Number,
      default: 0,
    },
    lastVisit: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "blocked"],
      default: "active",
    },
    loyaltyPoints: {
      type: Number,
      default: 0,
    },
    referredBy: {
      type: Schema.Types.ObjectId,
      ref: "Client",
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    salon: {
      type: Schema.Types.ObjectId,
      ref: "Salon",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

clientSchema.index({ phoneNumber: 1, salon: 1 });
clientSchema.index({ email: 1, salon: 1 });
clientSchema.index({ firstName: 1, lastName: 1 });
clientSchema.index({ tags: 1 });
clientSchema.index({ status: 1 });
clientSchema.index({ createdAt: -1 });

clientSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName || ""}`.trim();
});

clientSchema.methods.addVisit = function (
  appointmentId: Types.ObjectId,
  services: Types.ObjectId[],
  amount: number
): Promise<IClientDocument> {
  this.visitHistory.push({
    appointment: appointmentId,
    visitDate: new Date(),
    servicesReceived: services,
    amountSpent: amount,
  });
  this.totalVisits += 1;
  this.totalSpent += amount;
  this.lastVisit = new Date();
  return this.save() as unknown as Promise<IClientDocument>;
};

clientSchema.methods.addLoyaltyPoints = function (
  amount: number
): Promise<IClientDocument> {
  const points = Math.floor(amount / 10);
  this.loyaltyPoints += points;
  return this.save() as unknown as Promise<IClientDocument>;
};

clientSchema.set("toJSON", { virtuals: true });
clientSchema.set("toObject", { virtuals: true });

export default mongoose.model<IClient, mongoose.Model<IClient, object, IClientMethods>>(
  "Client",
  clientSchema
);
