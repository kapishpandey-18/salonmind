const jwt = require("jsonwebtoken");
const User = require("../models/User");
const logger = require("../utils/logger");

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// Generate Refresh Token
const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE,
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { email, password, phoneNumber, firstName, lastName } = req.body;

    logger.info("Registration attempt:", { email, phoneNumber });

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      logger.warn("Registration failed - User already exists:", email);
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    // Create user
    const user = await User.create({
      email,
      password,
      phoneNumber,
      firstName,
      lastName,
    });

    logger.success("User registered successfully:", {
      userId: user._id,
      email,
    });

    // Generate tokens
    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          phoneNumber: user.phoneNumber,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
          avatar: user.avatar,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        token,
        refreshToken,
      },
      message: "User registered successfully",
    });
  } catch (error) {
    logger.error("Register error:", error.message);
    res.status(500).json({
      success: false,
      message: "Error registering user",
      error: error.message,
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    logger.info("Login attempt:", { email });

    // Validate input
    if (!email || !password) {
      logger.warn("Login failed - Missing credentials");
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    // Find user and include password
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      logger.warn("Login failed - User not found:", email);
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check password
    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) {
      logger.warn("Login failed - Invalid password:", email);
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    logger.success("Login successful:", { userId: user._id, email });

    // Update last login
    user.lastLogin = Date.now();
    await user.save();

    // Generate tokens
    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          phoneNumber: user.phoneNumber,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
          avatar: user.avatar,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        token,
        refreshToken,
      },
      message: "Login successful",
    });
  } catch (error) {
    logger.error("Login error:", error.message);
    res.status(500).json({
      success: false,
      message: "Error logging in",
      error: error.message,
    });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error("Get me error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user",
      error: error.message,
    });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
  try {
    // In a real app, you might want to blacklist the token
    res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      message: "Error logging out",
      error: error.message,
    });
  }
};

// @desc    Refresh token
// @route   POST /api/auth/refresh
// @access  Public
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: "Refresh token is required",
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Generate new access token
    const token = generateToken(decoded.id);

    res.status(200).json({
      success: true,
      data: {
        token,
      },
    });
  } catch (error) {
    console.error("Refresh token error:", error);
    res.status(401).json({
      success: false,
      message: "Invalid refresh token",
    });
  }
};

// In-memory OTP storage (In production, use Redis or database)
const otpStore = new Map();

// @desc    Send OTP to phone number
// @route   POST /api/auth/send-otp
// @access  Public
exports.sendOTP = async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    logger.info("OTP request for:", phoneNumber);

    if (!phoneNumber) {
      logger.warn("OTP request failed - No phone number provided");
      return res.status(400).json({
        success: false,
        message: "Phone number is required",
      });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP with 5-minute expiry
    otpStore.set(phoneNumber, {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
    });

    // In production, send OTP via SMS (Twilio, etc.)
    logger.success(`OTP sent to ${phoneNumber}: ${otp}`);
    logger.debug("OTP Store contents:", Array.from(otpStore.entries()));

    res.status(200).json({
      success: true,
      message: "OTP sent successfully",
      // For development only - remove in production
      data: process.env.NODE_ENV === "development" ? { otp } : undefined,
    });
  } catch (error) {
    logger.error("Send OTP error:", error.message);
    res.status(500).json({
      success: false,
      message: "Error sending OTP",
      error: error.message,
    });
  }
};

// @desc    Verify OTP and login/register
// @route   POST /api/auth/verify-otp
// @access  Public
exports.verifyOTP = async (req, res) => {
  try {
    const { phoneNumber, otp } = req.body;

    logger.info("OTP verification for:", phoneNumber);
    logger.debug("Current OTP Store:", Array.from(otpStore.entries()));

    if (!phoneNumber || !otp) {
      logger.warn("OTP verification failed - Missing data");
      return res.status(400).json({
        success: false,
        message: "Phone number and OTP are required",
      });
    }

    // Check if OTP exists
    const storedOTPData = otpStore.get(phoneNumber);

    if (!storedOTPData) {
      logger.warn("OTP verification failed - OTP not found:", phoneNumber);
      return res.status(400).json({
        success: false,
        message: "OTP not found or expired",
      });
    }

    // Check if OTP expired
    if (Date.now() > storedOTPData.expiresAt) {
      otpStore.delete(phoneNumber);
      logger.warn("OTP verification failed - OTP expired:", phoneNumber);
      return res.status(400).json({
        success: false,
        message: "OTP has expired",
      });
    }

    // Verify OTP
    if (storedOTPData.otp !== otp) {
      logger.warn("OTP verification failed - Invalid OTP:", phoneNumber);
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // OTP verified - clear it
    otpStore.delete(phoneNumber);
    logger.success("OTP verified successfully:", phoneNumber);

    // Find or create user
    let user = await User.findOne({ phoneNumber });

    if (!user) {
      logger.info("Creating new user for:", phoneNumber);
      // Create new user with phone number
      user = await User.create({
        phoneNumber,
        email: `user_${phoneNumber}@temp.com`, // Temporary email
        role: "client",
      });
      logger.success("New user created:", { userId: user._id, phoneNumber });
    }

    // Update last login
    user.lastLogin = Date.now();
    await user.save();

    // Generate tokens
    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          phoneNumber: user.phoneNumber,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
          avatar: user.avatar,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        token,
        refreshToken,
      },
      message: "OTP verified successfully",
    });
  } catch (error) {
    logger.error("Verify OTP error:", error.message);
    res.status(500).json({
      success: false,
      message: "Error verifying OTP",
      error: error.message,
    });
  }
};

// @desc    Update user profile
// @route   PATCH /api/auth/update-profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, email, avatar } = req.body;

    logger.info("Updating profile for user:", req.user.id);

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update only provided fields
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (email) {
      // Check if email is already taken by another user
      const existingUser = await User.findOne({
        email,
        _id: { $ne: req.user.id },
      });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Email already in use",
        });
      }
      user.email = email;
    }
    if (avatar) user.avatar = avatar;

    await user.save();

    logger.success("Profile updated:", { userId: user._id });

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          phoneNumber: user.phoneNumber,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
          avatar: user.avatar,
          isOnboarded: user.isOnboarded,
          salon: user.salon,
        },
      },
      message: "Profile updated successfully",
    });
  } catch (error) {
    logger.error("Update profile error:", error.message);
    res.status(500).json({
      success: false,
      message: "Error updating profile",
      error: error.message,
    });
  }
};

// @desc    Complete onboarding (create salon and update user)
// @route   POST /api/auth/complete-onboarding
// @access  Private
exports.completeOnboarding = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      salonName,
      salonAddress,
      salonCity,
      salonState,
      salonZipCode,
      salonCountry,
      salonPhoneNumber,
      salonEmail,
      businessHours,
      currency,
      timezone,
    } = req.body;

    logger.info("Completing onboarding for user:", req.user.id);

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if already onboarded
    if (user.isOnboarded) {
      return res.status(400).json({
        success: false,
        message: "User already onboarded",
      });
    }

    // Import Salon model at the top if not already
    const Salon = require("../models/Salon");

    // Create salon
    const salon = await Salon.create({
      name: salonName,
      address: {
        street: salonAddress,
        city: salonCity,
        state: salonState,
        zipCode: salonZipCode,
        country: salonCountry || "India",
      },
      contact: {
        phone: salonPhoneNumber,
        email: salonEmail,
      },
      owner: user._id,
      businessHours: businessHours || [
        { day: "monday", isOpen: true, openTime: "09:00", closeTime: "18:00" },
        { day: "tuesday", isOpen: true, openTime: "09:00", closeTime: "18:00" },
        {
          day: "wednesday",
          isOpen: true,
          openTime: "09:00",
          closeTime: "18:00",
        },
        {
          day: "thursday",
          isOpen: true,
          openTime: "09:00",
          closeTime: "18:00",
        },
        { day: "friday", isOpen: true, openTime: "09:00", closeTime: "18:00" },
        {
          day: "saturday",
          isOpen: true,
          openTime: "09:00",
          closeTime: "18:00",
        },
        { day: "sunday", isOpen: false, openTime: "09:00", closeTime: "18:00" },
      ],
      settings: {
        currency: currency || "INR",
        timezone: timezone || "Asia/Kolkata",
      },
    });

    // Update user profile
    user.firstName = firstName;
    user.lastName = lastName;
    if (email && email !== user.email) {
      // Check if email is already taken
      const existingUser = await User.findOne({
        email,
        _id: { $ne: user._id },
      });
      if (existingUser) {
        // Delete the salon we just created
        await salon.deleteOne();
        return res.status(400).json({
          success: false,
          message: "Email already in use",
        });
      }
      user.email = email;
    }
    user.salon = salon._id;
    user.role = "owner";
    user.isOnboarded = true;

    await user.save();

    logger.success("Onboarding completed:", {
      userId: user._id,
      salonId: salon._id,
    });

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          phoneNumber: user.phoneNumber,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
          avatar: user.avatar,
          isOnboarded: user.isOnboarded,
          salon: user.salon,
        },
        salon: {
          id: salon._id,
          name: salon.name,
          address: salon.address,
          contact: salon.contact,
        },
      },
      message: "Onboarding completed successfully",
    });
  } catch (error) {
    logger.error("Complete onboarding error:", error.message);
    res.status(500).json({
      success: false,
      message: "Error completing onboarding",
      error: error.message,
    });
  }
};
