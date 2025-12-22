const ApiError = require("../../../utils/ApiError");
const User = require("../../../models/User");
const Salon = require("../../../models/Salon");
const otpService = require("./otp.service");
const tokenService = require("./token.service");
const {
  ensureAdminPhoneAllowed,
  ensureEmployeeActive,
} = require("../policies/auth.policy");
const { ensureTenantForOwner } = require("../../owner/services/tenant.service");

const SURFACES = {
  ADMIN: "ADMIN",
  SALON_OWNER: "SALON_OWNER",
  SALON_EMPLOYEE: "SALON_EMPLOYEE",
};

const sanitizeUser = (user) => ({
  id: user._id,
  phoneNumber: user.phoneNumber,
  role: user.role,
  salon: user.salon,
  tenant: user.tenant,
  activeBranch: user.activeBranch,
  isActive: user.isActive,
  isOnboarded: user.isOnboarded,
  isProfileComplete: user.isProfileComplete,
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
});

const DEFAULT_HOURS = [
  { day: "monday", isOpen: true, openTime: "09:00", closeTime: "18:00" },
  { day: "tuesday", isOpen: true, openTime: "09:00", closeTime: "18:00" },
  { day: "wednesday", isOpen: true, openTime: "09:00", closeTime: "18:00" },
  { day: "thursday", isOpen: true, openTime: "09:00", closeTime: "18:00" },
  { day: "friday", isOpen: true, openTime: "09:00", closeTime: "18:00" },
  { day: "saturday", isOpen: true, openTime: "09:00", closeTime: "18:00" },
  { day: "sunday", isOpen: false, openTime: "09:00", closeTime: "18:00" },
];

async function handleAdminSurface(phoneNumber) {
  ensureAdminPhoneAllowed(phoneNumber);
  const user = await User.findOne({ phoneNumber });
  if (!user) {
    throw ApiError.notFound("Admin account not found");
  }
  if (user.role !== SURFACES.ADMIN) {
    throw ApiError.forbidden("Account is not authorized for admin surface");
  }
  return user;
}

async function handleSalonOwnerSurface(phoneNumber) {
  let user = await User.findOne({ phoneNumber });
  if (!user) {
    user = await User.create({
      phoneNumber,
      role: SURFACES.SALON_OWNER,
      isProfileComplete: false,
      isOnboarded: false,
    });

    const salon = await Salon.create({
      name: "Pending Salon Setup",
      owner: user._id,
      contact: {
        email: `pending+${user._id}@salonmind.app`,
        phone: phoneNumber,
      },
      address: {
        street: "Pending",
        city: "Pending",
        state: "Pending",
        zipCode: "000000",
        country: "India",
      },
      businessHours: [
        { day: "monday", isOpen: true, openTime: "09:00", closeTime: "18:00" },
      ],
    });
    user.salon = salon._id;
  } else if (!user.salon) {
    const salon = await Salon.create({
      name: "Pending Salon Setup",
      owner: user._id,
      contact: {
        email: `pending+${user._id}@salonmind.app`,
        phone: phoneNumber,
      },
      address: {
        street: "Pending",
        city: "Pending",
        state: "Pending",
        zipCode: "000000",
        country: "India",
      },
      businessHours: [
        { day: "monday", isOpen: true, openTime: "09:00", closeTime: "18:00" },
      ],
    });
    user.salon = salon._id;
  }

  await ensureTenantForOwner(user);
  user.role = SURFACES.SALON_OWNER;
  await user.save();
  return user;
}

async function handleSalonEmployeeSurface(phoneNumber) {
  const user = await User.findOne({ phoneNumber }).populate("salon");
  ensureEmployeeActive(user);
  if (user.role !== "staff" && user.role !== SURFACES.SALON_EMPLOYEE) {
    throw ApiError.forbidden("Account is not authorized for employee surface");
  }
  return user;
}

async function issueSessionTokens({ user, surface, ip, userAgent }) {
  user.lastLogin = new Date();
  await user.save();

  const session = await tokenService.createSession({
    userId: user._id,
    surface,
    ip,
    userAgent,
  });

  const access = tokenService.generateAccessToken({
    userId: user._id,
    surface,
    sessionId: session._id,
  });

  const refresh = await tokenService.generateRefreshToken({
    userId: user._id,
    surface,
    sessionId: session._id,
    ip,
  });

  return {
    accessToken: access.token,
    refreshToken: refresh.token,
    expiresIn: access.expiresIn,
    user: sanitizeUser(user),
  };
}

async function initiateOtp({ phone, surface, meta }) {
  if (surface === SURFACES.ADMIN) {
    ensureAdminPhoneAllowed(phone);
  }
  return otpService.createChallenge({ phone, surface, meta });
}

async function resendOtp({ challengeId, surface }) {
  return otpService.resendChallenge({ challengeId, surface });
}

async function verifyOtp({ challengeId, otp, surface, meta }) {
  const result = await otpService.verifyChallenge({ challengeId, otp });
  if (result.surface !== surface) {
    throw ApiError.badRequest("OTP challenge surface mismatch");
  }

  let user;
  if (surface === SURFACES.ADMIN) {
    user = await handleAdminSurface(result.phone);
  } else if (surface === SURFACES.SALON_OWNER) {
    user = await handleSalonOwnerSurface(result.phone);
  } else if (surface === SURFACES.SALON_EMPLOYEE) {
    user = await handleSalonEmployeeSurface(result.phone);
  } else {
    throw ApiError.badRequest("Unsupported surface");
  }

  return issueSessionTokens({ user, surface, ip: meta.ip, userAgent: meta.userAgent });
}

async function refreshTokens({ refreshToken, surface, ip }) {
  if (!refreshToken) {
    throw ApiError.badRequest("Refresh token is required");
  }

  const storedToken = await tokenService.verifyRefreshToken(refreshToken);

  if (storedToken.surface !== surface) {
    throw ApiError.forbidden("Refresh token scope mismatch");
  }

  const user = await User.findById(storedToken.user);
  if (!user) {
    throw ApiError.unauthorized("User not found");
  }

  const sessionDoc = storedToken.session;
  if (!sessionDoc || !sessionDoc.isActive) {
    throw ApiError.unauthorized("Session is invalid");
  }
  if (sessionDoc.user.toString() !== user._id.toString()) {
    throw ApiError.unauthorized("Session user mismatch");
  }

  const { token: nextRefreshToken, session } =
    await tokenService.rotateRefreshToken(storedToken, {
      ip,
      session: sessionDoc,
    });

  const access = tokenService.generateAccessToken({
    userId: user._id,
    surface,
    sessionId: session._id,
  });

  return {
    accessToken: access.token,
    refreshToken: nextRefreshToken,
    expiresIn: access.expiresIn,
    user: sanitizeUser(user),
  };
}

async function logout({ refreshToken, surface }) {
  if (!refreshToken) {
    throw ApiError.badRequest("Refresh token is required");
  }

  const storedToken = await tokenService.verifyRefreshToken(refreshToken);
  if (storedToken.surface !== surface) {
    throw ApiError.forbidden("Refresh token scope mismatch");
  }

  await tokenService.revokeSession(storedToken.session, "logout");
}

async function getAuthenticatedProfile(userId) {
  const user = await User.findById(userId);
  if (!user) {
    throw ApiError.notFound("User not found");
  }
  return sanitizeUser(user);
}

async function updateProfile({ userId, data }) {
  const user = await User.findById(userId);
  if (!user) {
    throw ApiError.notFound("User not found");
  }

  const { firstName, lastName, email } = data;

  if (email && email !== user.email) {
    const existing = await User.findOne({
      email,
      _id: { $ne: userId },
    });
    if (existing) {
      throw ApiError.badRequest("Email already in use");
    }
    user.email = email;
  }

  if (firstName) user.firstName = firstName;
  if (lastName) user.lastName = lastName;

  await user.save();

  return { user: sanitizeUser(user) };
}

module.exports = {
  SURFACES,
  initiateOtp,
  resendOtp,
  verifyOtp,
  refreshTokens,
  logout,
  getAuthenticatedProfile,
  updateProfile,
};
