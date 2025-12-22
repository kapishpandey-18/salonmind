const ApiError = require("../../../utils/ApiError");
const env = require("../../../config/env");

const isPhoneAllowListed = (phone) =>
  env.adminAllowlist.some((allowed) => allowed === phone);

function ensureAdminPhoneAllowed(phone) {
  if (!isPhoneAllowListed(phone)) {
    throw ApiError.forbidden("Phone number is not authorized for admin access");
  }
}

function ensureEmployeeActive(user) {
  if (!user) {
    throw ApiError.notFound("Employee record not found");
  }
  if (!user.isActive) {
    throw ApiError.forbidden("Employee account is inactive");
  }
  if (!user.salon) {
    throw ApiError.badRequest("Employee is not assigned to a salon");
  }
}

module.exports = {
  ensureAdminPhoneAllowed,
  ensureEmployeeActive,
};
