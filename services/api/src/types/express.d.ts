import type { Types, Document } from "mongoose";
import type { Surface } from "./index.js";
import type { IUser } from "../models/User.js";
import type { IBranch } from "../models/Branch.js";
import type { ITenantSubscription } from "../models/TenantSubscription.js";

declare global {
  namespace Express {
    interface Request {
      user?: Document<unknown, object, IUser> &
        IUser & { _id: Types.ObjectId };
      auth?: {
        surface: Surface;
        sessionId: string;
      };
      branch?: Document<unknown, object, IBranch> &
        IBranch & { _id: Types.ObjectId };
      branchId?: Types.ObjectId;
      activeSubscription?: Document<unknown, object, ITenantSubscription> &
        ITenantSubscription & { _id: Types.ObjectId };
    }
  }
}
