const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: function () {
        return !this.phoneNumber; // Email required if no phone
      },
      sparse: true, // Allow multiple null values
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: function () {
        return this.email && !this.phoneNumber; // Password required only for email login
      },
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // Don't return password by default
    },
    phoneNumber: {
      type: String,
      sparse: true, // Allow multiple null values
      trim: true,
    },
    role: {
      type: String,
      enum: ["owner", "manager", "staff", "client"],
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
    salon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Salon",
    },
    // Staff-specific fields
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
          startTime: String, // "09:00"
          endTime: String, // "18:00"
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
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Exclude password from JSON response
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model("User", userSchema);
