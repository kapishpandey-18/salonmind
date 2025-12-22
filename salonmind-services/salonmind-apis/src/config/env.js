const ms = require("ms");

const SURFACES = ["ADMIN", "SALON_OWNER", "SALON_EMPLOYEE"];

const requiredRoot = ["JWT_ACCESS_SECRET", "JWT_REFRESH_SECRET", "ADMIN_ALLOWLIST_NUMBERS"];

requiredRoot.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
});

const parseDuration = (value, key) => {
  const duration = ms(value);
  if (!duration) {
    throw new Error(`Invalid duration for ${key}. Use values like "15m" or "7d".`);
  }
  return duration;
};

const surfaceConfig = {};

SURFACES.forEach((surface) => {
  const accessKey = `ACCESS_TTL_${surface}`;
  const refreshKey = `REFRESH_TTL_${surface}`;
  if (!process.env[accessKey] || !process.env[refreshKey]) {
    throw new Error(`Missing required env vars ${accessKey}/${refreshKey}`);
  }

  surfaceConfig[surface] = {
    accessTtlMs: parseDuration(process.env[accessKey], accessKey),
    refreshTtlMs: parseDuration(process.env[refreshKey], refreshKey),
  };
});

const env = {
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
  otpTtlMs: Number(process.env.OTP_TTL_MS || 5 * 60 * 1000),
  otpMaxAttempts: Number(process.env.OTP_MAX_ATTEMPTS || 5),
  otpMaxResends: Number(process.env.OTP_MAX_RESENDS || 3),
  surfaces: surfaceConfig,
  adminAllowlist: process.env.ADMIN_ALLOWLIST_NUMBERS.split(",")
    .map((phone) => phone.trim())
    .filter(Boolean),
};

module.exports = env;
