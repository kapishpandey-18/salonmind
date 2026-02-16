import mongoose, { Schema, type Document, type Types } from "mongoose";

export interface IProduct {
  name: string;
  description?: string;
  category: string;
  sku?: string;
  barcode?: string;
  brand?: string;
  supplier: {
    name?: string;
    contact?: string;
    email?: string;
    phone?: string;
  };
  stock: {
    current: number;
    reorderLevel: number;
    reorderQuantity: number;
  };
  pricing: {
    cost: number;
    sellingPrice: number;
    margin: number;
  };
  unit: string;
  image?: string;
  isRetail: boolean;
  isActive: boolean;
  lowStockAlert: boolean;
  stockHistory: Array<{
    date: Date;
    type: string;
    quantity: number;
    reason?: string;
    by: Types.ObjectId;
  }>;
  totalUsed: number;
  totalSold: number;
  revenue: number;
  salon: Types.ObjectId;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProductMethods {
  addStock(
    quantity: number,
    type: string,
    reason: string,
    userId: Types.ObjectId
  ): Promise<IProductDocument>;
  useStock(
    quantity: number,
    reason: string,
    userId: Types.ObjectId
  ): Promise<IProductDocument>;
  sellProduct(
    quantity: number,
    userId: Types.ObjectId
  ): Promise<IProductDocument>;
}

export type IProductDocument = Document<Types.ObjectId, object, IProduct> &
  IProduct &
  IProductMethods;

const productSchema = new Schema<IProduct, mongoose.Model<IProduct, object, IProductMethods>, IProductMethods>(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
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
        "hair_product",
        "nail_product",
        "skin_product",
        "tool",
        "equipment",
        "supply",
        "retail",
        "other",
      ],
    },
    sku: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    barcode: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    brand: {
      type: String,
      trim: true,
    },
    supplier: {
      name: {
        type: String,
        trim: true,
      },
      contact: String,
      email: String,
      phone: String,
    },
    stock: {
      current: {
        type: Number,
        required: true,
        default: 0,
        min: 0,
      },
      reorderLevel: {
        type: Number,
        default: 10,
        min: 0,
      },
      reorderQuantity: {
        type: Number,
        default: 50,
      },
    },
    pricing: {
      cost: {
        type: Number,
        required: true,
        min: 0,
      },
      sellingPrice: {
        type: Number,
        required: true,
        min: 0,
      },
      margin: {
        type: Number,
        default: 0,
      },
    },
    unit: {
      type: String,
      enum: ["piece", "bottle", "box", "kg", "liter", "pack", "set"],
      default: "piece",
    },
    image: {
      type: String,
    },
    isRetail: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lowStockAlert: {
      type: Boolean,
      default: false,
    },
    stockHistory: [
      {
        date: {
          type: Date,
          default: Date.now,
        },
        type: {
          type: String,
          enum: ["purchase", "usage", "sale", "adjustment", "return"],
        },
        quantity: Number,
        reason: String,
        by: {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
      },
    ],
    totalUsed: {
      type: Number,
      default: 0,
    },
    totalSold: {
      type: Number,
      default: 0,
    },
    revenue: {
      type: Number,
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

productSchema.index({ category: 1, salon: 1 });
productSchema.index({ "stock.current": 1 });
productSchema.index({ lowStockAlert: 1 });
productSchema.index({ isActive: 1 });
productSchema.index({ name: "text", description: "text", brand: "text" });

productSchema.pre("save", function (next) {
  if (
    this.isModified("pricing.cost") ||
    this.isModified("pricing.sellingPrice")
  ) {
    this.pricing.margin = Number(
      (
        ((this.pricing.sellingPrice - this.pricing.cost) / this.pricing.cost) *
        100
      ).toFixed(2)
    );
  }

  if (this.stock.current <= this.stock.reorderLevel) {
    this.lowStockAlert = true;
  } else {
    this.lowStockAlert = false;
  }

  next();
});

productSchema.methods.addStock = function (
  quantity: number,
  type: string,
  reason: string,
  userId: Types.ObjectId
): Promise<IProductDocument> {
  this.stock.current += quantity;
  this.stockHistory.push({
    date: new Date(),
    type: type || "purchase",
    quantity: quantity,
    reason: reason,
    by: userId,
  });
  return this.save();
};

productSchema.methods.useStock = function (
  quantity: number,
  reason: string,
  userId: Types.ObjectId
): Promise<IProductDocument> {
  if (this.stock.current < quantity) {
    throw new Error("Insufficient stock");
  }

  this.stock.current -= quantity;
  this.totalUsed += quantity;
  this.stockHistory.push({
    date: new Date(),
    type: "usage",
    quantity: -quantity,
    reason: reason,
    by: userId,
  });
  return this.save();
};

productSchema.methods.sellProduct = function (
  quantity: number,
  userId: Types.ObjectId
): Promise<IProductDocument> {
  if (this.stock.current < quantity) {
    throw new Error("Insufficient stock");
  }

  this.stock.current -= quantity;
  this.totalSold += quantity;
  this.revenue += this.pricing.sellingPrice * quantity;
  this.stockHistory.push({
    date: new Date(),
    type: "sale",
    quantity: -quantity,
    by: userId,
  });
  return this.save();
};

export default mongoose.model<IProduct, mongoose.Model<IProduct, object, IProductMethods>>(
  "Product",
  productSchema
);
