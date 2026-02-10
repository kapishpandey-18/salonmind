import mongoose, { Schema, type Document, type Types } from "mongoose";

export interface IService {
  name: string;
  description?: string;
  category: string;
  price: number;
  duration: number;
  image?: string;
  staff: Types.ObjectId[];
  isActive: boolean;
  isPackage: boolean;
  packageServices: Array<{
    service: Types.ObjectId;
    quantity: number;
  }>;
  supplies: Array<{
    product: Types.ObjectId;
    quantity: number;
  }>;
  bookingCount: number;
  revenue: number;
  averageRating: number;
  salon: Types.ObjectId;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IServiceMethods {
  incrementBooking(amount: number): Promise<IServiceDocument>;
}

export type IServiceDocument = Document<Types.ObjectId, object, IService> &
  IService &
  IServiceMethods;

const serviceSchema = new Schema<IService, mongoose.Model<IService, object, IServiceMethods>, IServiceMethods>(
  {
    name: {
      type: String,
      required: [true, "Service name is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: [
        "hair",
        "nails",
        "facial",
        "massage",
        "makeup",
        "waxing",
        "spa",
        "other",
      ],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: 0,
    },
    duration: {
      type: Number,
      required: [true, "Duration is required"],
      min: 15,
    },
    image: {
      type: String,
    },
    staff: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    isPackage: {
      type: Boolean,
      default: false,
    },
    packageServices: [
      {
        service: {
          type: Schema.Types.ObjectId,
          ref: "Service",
        },
        quantity: {
          type: Number,
          default: 1,
        },
      },
    ],
    supplies: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: "Product",
        },
        quantity: {
          type: Number,
          default: 1,
        },
      },
    ],
    bookingCount: {
      type: Number,
      default: 0,
    },
    revenue: {
      type: Number,
      default: 0,
    },
    averageRating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    salon: {
      type: Schema.Types.ObjectId,
      ref: "Salon",
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

serviceSchema.index({ category: 1, salon: 1 });
serviceSchema.index({ isActive: 1 });
serviceSchema.index({ name: "text", description: "text" });
serviceSchema.index({ bookingCount: -1 });
serviceSchema.index({ revenue: -1 });

serviceSchema.methods.incrementBooking = function (
  amount: number
): Promise<IServiceDocument> {
  this.bookingCount += 1;
  this.revenue += amount;
  return this.save();
};

export default mongoose.model<IService, mongoose.Model<IService, object, IServiceMethods>>(
  "Service",
  serviceSchema
);
