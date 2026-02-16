import mongoose, { Schema, type Document, type Model, type Types } from "mongoose";

export interface IAppointment {
  client: Types.ObjectId;
  service: Types.ObjectId;
  staff: Types.ObjectId;
  date: Date;
  startTime: string;
  endTime: string;
  duration: number;
  status: string;
  price: number;
  paid: boolean;
  paymentMethod?: string;
  notes?: string;
  reminderSent: boolean;
  cancelledAt?: Date;
  cancelledBy?: Types.ObjectId;
  cancellationReason?: string;
  rating?: number;
  feedback?: string;
  salon: Types.ObjectId;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAppointmentMethods {
  markCompleted(): Promise<IAppointmentDocument>;
  cancel(userId: Types.ObjectId, reason: string): Promise<IAppointmentDocument>;
}

export interface IAppointmentModel
  extends Model<IAppointment, object, IAppointmentMethods> {
  checkConflict(
    staffId: Types.ObjectId,
    date: Date,
    startTime: string,
    endTime: string,
    excludeId?: Types.ObjectId | null
  ): Promise<boolean>;
}

export type IAppointmentDocument = Document<
  Types.ObjectId,
  object,
  IAppointment
> &
  IAppointment &
  IAppointmentMethods;

const appointmentSchema = new Schema<
  IAppointment,
  IAppointmentModel,
  IAppointmentMethods
>(
  {
    client: {
      type: Schema.Types.ObjectId,
      ref: "Client",
      required: [true, "Client is required"],
    },
    service: {
      type: Schema.Types.ObjectId,
      ref: "Service",
      required: [true, "Service is required"],
    },
    staff: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Staff member is required"],
    },
    date: {
      type: Date,
      required: [true, "Appointment date is required"],
    },
    startTime: {
      type: String,
      required: [true, "Start time is required"],
    },
    endTime: {
      type: String,
      required: [true, "End time is required"],
    },
    duration: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "in_progress",
        "completed",
        "cancelled",
        "no_show",
      ],
      default: "pending",
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    paid: {
      type: Boolean,
      default: false,
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "card", "upi", "wallet", "other"],
    },
    notes: {
      type: String,
    },
    reminderSent: {
      type: Boolean,
      default: false,
    },
    cancelledAt: {
      type: Date,
    },
    cancelledBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    cancellationReason: {
      type: String,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    feedback: {
      type: String,
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

appointmentSchema.index({ date: 1, salon: 1 });
appointmentSchema.index({ client: 1 });
appointmentSchema.index({ staff: 1, date: 1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ createdAt: -1 });
appointmentSchema.index({ staff: 1, date: 1, startTime: 1, endTime: 1 });

appointmentSchema.statics.checkConflict = async function (
  staffId: Types.ObjectId,
  date: Date,
  startTime: string,
  endTime: string,
  excludeId: Types.ObjectId | null = null
): Promise<boolean> {
  const query: Record<string, unknown> = {
    staff: staffId,
    date: date,
    status: { $nin: ["cancelled", "no_show"] },
    $or: [
      {
        startTime: { $lt: endTime },
        endTime: { $gt: startTime },
      },
    ],
  };

  if (excludeId) {
    query._id = { $ne: excludeId };
  }

  const conflict = await this.findOne(query);
  return !!conflict;
};

appointmentSchema.methods.markCompleted =
  function (): Promise<IAppointmentDocument> {
    this.status = "completed";
    return this.save();
  };

appointmentSchema.methods.cancel = function (
  userId: Types.ObjectId,
  reason: string
): Promise<IAppointmentDocument> {
  this.status = "cancelled";
  this.cancelledAt = new Date();
  this.cancelledBy = userId;
  this.cancellationReason = reason;
  return this.save();
};

export default mongoose.model<IAppointment, IAppointmentModel>(
  "Appointment",
  appointmentSchema
);
