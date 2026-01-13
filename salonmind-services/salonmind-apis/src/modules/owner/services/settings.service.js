const ApiError = require("../../../utils/ApiError");
const Tenant = require("../../../models/Tenant");
const User = require("../../../models/User");
const { ensureTenantForOwner } = require("./tenant.service");

const DEFAULT_NOTIFICATIONS = {
  emailNotifications: true,
  smsNotifications: true,
  appointmentReminders: true,
  dailyReports: true,
  lowStockAlerts: true,
};

const DEFAULT_BUSINESS_HOURS = {
  monday: { open: "09:00", close: "18:00", closed: false },
  tuesday: { open: "09:00", close: "18:00", closed: false },
  wednesday: { open: "09:00", close: "18:00", closed: false },
  thursday: { open: "09:00", close: "18:00", closed: false },
  friday: { open: "09:00", close: "18:00", closed: false },
  saturday: { open: "09:00", close: "18:00", closed: false },
  sunday: { open: "09:00", close: "18:00", closed: true },
};

function mapHoursArrayToObject(list = []) {
  const hours = { ...DEFAULT_BUSINESS_HOURS };
  list.forEach((entry) => {
    if (!entry?.day) {
      return;
    }
    hours[entry.day] = {
      open: entry.openTime || "09:00",
      close: entry.closeTime || "18:00",
      closed: entry.isOpen === false,
    };
  });
  return hours;
}

function mapHoursObjectToArray(hours = {}) {
  return Object.entries(hours).map(([day, value]) => ({
    day,
    isOpen: !value.closed,
    openTime: value.open || "09:00",
    closeTime: value.close || "18:00",
  }));
}

function formatProfileData(user, tenant) {
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ");
  return {
    name: fullName || "Salon Owner",
    email: user.email || "",
    phone: user.phoneNumber || "",
    salonName: tenant.name || "",
    salonAddress: tenant.address?.street || "",
    salonCity: tenant.address?.city || "",
    salonState: tenant.address?.state || "",
    salonPincode: tenant.address?.zipCode || "",
    salonPhone: tenant.contact?.phone || "",
    salonEmail: tenant.contact?.email || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  };
}

async function getSettings({ userId }) {
  const user = await User.findById(userId);
  if (!user) {
    throw ApiError.notFound("User not found");
  }
  const tenant = await ensureTenantForOwner(user);
  return {
    profileData: formatProfileData(user, tenant),
    notifications: tenant.notifications || DEFAULT_NOTIFICATIONS,
    businessHours: mapHoursArrayToObject(tenant.businessHours),
  };
}

async function updateSettings({ userId, payload }) {
  const user = await User.findById(userId).select("+password");
  if (!user) {
    throw ApiError.notFound("User not found");
  }
  const tenant = await ensureTenantForOwner(user);

  if (payload?.profileData) {
    const profile = payload.profileData;
    const wantsPasswordUpdate =
      profile.currentPassword || profile.newPassword || profile.confirmPassword;

    if (wantsPasswordUpdate) {
      if (!profile.newPassword || !profile.confirmPassword) {
        throw ApiError.badRequest(
          "New password and confirm password are required"
        );
      }
      if (profile.newPassword.length < 8) {
        throw ApiError.badRequest("Password must be at least 8 characters");
      }
      if (profile.newPassword !== profile.confirmPassword) {
        throw ApiError.badRequest("Passwords do not match");
      }
      if (user.password) {
        if (!profile.currentPassword) {
          throw ApiError.badRequest("Current password is required");
        }
        const isMatch = await user.comparePassword(profile.currentPassword);
        if (!isMatch) {
          throw ApiError.badRequest("Current password is incorrect");
        }
      }
      user.password = profile.newPassword;
    }

    if (profile.email && profile.email !== user.email) {
      const existing = await User.findOne({
        email: profile.email,
        _id: { $ne: userId },
      });
      if (existing) {
        throw ApiError.badRequest("Email already in use");
      }
      user.email = profile.email;
    }
    if (profile.phone) {
      user.phoneNumber = profile.phone;
    }
    if (profile.name) {
      const [firstName, ...rest] = profile.name.trim().split(" ");
      user.firstName = firstName;
      user.lastName = rest.join(" ");
    }
    tenant.name = profile.salonName || tenant.name;
    tenant.contact = {
      ...(tenant.contact || {}),
      phone: profile.salonPhone || tenant.contact?.phone || "",
      email: profile.salonEmail || tenant.contact?.email || "",
    };
    tenant.address = {
      ...(tenant.address || {}),
      street: profile.salonAddress || tenant.address?.street || "",
      city: profile.salonCity || tenant.address?.city || "",
      state: profile.salonState || tenant.address?.state || "",
      zipCode: profile.salonPincode || tenant.address?.zipCode || "",
      country: tenant.address?.country || "India",
    };
  }

  if (payload?.notifications) {
    tenant.notifications = {
      ...DEFAULT_NOTIFICATIONS,
      ...payload.notifications,
    };
  }

  if (payload?.businessHours) {
    tenant.businessHours = mapHoursObjectToArray(payload.businessHours);
  }

  await Promise.all([user.save(), tenant.save()]);
  return getSettings({ userId });
}

module.exports = {
  getSettings,
  updateSettings,
};
