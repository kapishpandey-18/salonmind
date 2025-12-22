const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
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
      default: false, // Can be sold to customers
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
          type: mongoose.Schema.Types.ObjectId,
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
      type: mongoose.Schema.Types.ObjectId,
      ref: "Salon",
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
productSchema.index({ category: 1, salon: 1 });
productSchema.index({ "stock.current": 1 });
productSchema.index({ lowStockAlert: 1 });
productSchema.index({ isActive: 1 });
productSchema.index({ name: "text", description: "text", brand: "text" });

// Pre-save middleware to calculate margin
productSchema.pre("save", function (next) {
  if (
    this.isModified("pricing.cost") ||
    this.isModified("pricing.sellingPrice")
  ) {
    this.pricing.margin = (
      ((this.pricing.sellingPrice - this.pricing.cost) / this.pricing.cost) *
      100
    ).toFixed(2);
  }

  // Check if stock is low
  if (this.stock.current <= this.stock.reorderLevel) {
    this.lowStockAlert = true;
  } else {
    this.lowStockAlert = false;
  }

  next();
});

// Method to add stock
productSchema.methods.addStock = function (quantity, type, reason, userId) {
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

// Method to use stock
productSchema.methods.useStock = function (quantity, reason, userId) {
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

// Method to sell product
productSchema.methods.sellProduct = function (quantity, userId) {
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

module.exports = mongoose.model("Product", productSchema);
