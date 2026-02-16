import type { Types, Document } from "mongoose";
import ApiError from "../../../utils/ApiError.js";
import Tenant from "../../../models/Tenant.js";
import type { ITenant } from "../../../models/Tenant.js";
import User from "../../../models/User.js";
import type { IUser, IUserDocument } from "../../../models/User.js";
import { ensureTenantForOwner } from "./tenant.service.js";

interface NotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  appointmentReminders: boolean;
  dailyReports: boolean;
  lowStockAlerts: boolean;
}

interface BusinessHourEntry {
  open: string;
  close: string;
  closed: boolean;
}

type BusinessHoursMap = Record<string, BusinessHourEntry>;

interface BusinessHourArrayEntry {
  day: string;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  salonName: string;
  salonAddress: string;
  salonCity: string;
  salonState: string;
  salonPincode: string;
  salonPhone: string;
  salonEmail: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface SettingsResult {
  profileData: ProfileData;
  notifications: NotificationSettings;
  businessHours: BusinessHoursMap;
}

interface UpdateSettingsPayload {
  profileData?: {
    name?: string;
    email?: string;
    phone?: string;
    salonName?: string;
    salonAddress?: string;
    salonCity?: string;
    salonState?: string;
    salonPincode?: string;
    salonPhone?: string;
    salonEmail?: string;
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  };
  notifications?: Partial<NotificationSettings>;
  businessHours?: BusinessHoursMap;
}

const DEFAULT_NOTIFICATIONS: NotificationSettings = {
  emailNotifications: true,
  smsNotifications: true,
  appointmentReminders: true,
  dailyReports: true,
  lowStockAlerts: true,
};

const DEFAULT_BUSINESS_HOURS: BusinessHoursMap = {
  monday: { open: "09:00", close: "18:00", closed: false },
  tuesday: { open: "09:00", close: "18:00", closed: false },
  wednesday: { open: "09:00", close: "18:00", closed: false },
  thursday: { open: "09:00", close: "18:00", closed: false },
  friday: { open: "09:00", close: "18:00", closed: false },
  saturday: { open: "09:00", close: "18:00", closed: false },
  sunday: { open: "09:00", close: "18:00", closed: true },
};

function mapHoursArrayToObject(
  list: BusinessHourArrayEntry[] = []
): BusinessHoursMap {
  const hours: BusinessHoursMap = { ...DEFAULT_BUSINESS_HOURS };
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

function mapHoursObjectToArray(
  hours: BusinessHoursMap = {}
): BusinessHourArrayEntry[] {
  return Object.entries(hours).map(([day, value]) => ({
    day,
    isOpen: !value.closed,
    openTime: value.open || "09:00",
    closeTime: value.close || "18:00",
  }));
}

function formatProfileData(
  user: Document<Types.ObjectId, object, IUser> & IUser,
  tenant: Document<Types.ObjectId, object, ITenant> & ITenant
): ProfileData {
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

export async function getSettings({
  userId,
}: {
  userId: Types.ObjectId | string;
}): Promise<SettingsResult> {
  const user = await User.findById(userId);
  if (!user) {
    throw ApiError.notFound("User not found");
  }
  const tenant = await ensureTenantForOwner(user);
  return {
    profileData: formatProfileData(user, tenant),
    notifications: tenant.notifications || DEFAULT_NOTIFICATIONS,
    businessHours: mapHoursArrayToObject(
      tenant.businessHours as unknown as BusinessHourArrayEntry[]
    ),
  };
}

export async function updateSettings({
  userId,
  payload,
}: {
  userId: Types.ObjectId | string;
  payload: UpdateSettingsPayload;
}): Promise<SettingsResult> {
  const user = (await User.findById(userId).select(
    "+password"
  )) as IUserDocument | null;
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
    tenant.businessHours = mapHoursObjectToArray(
      payload.businessHours
    ) as typeof tenant.businessHours;
  }

  await Promise.all([user.save(), tenant.save()]);
  return getSettings({ userId });
}
