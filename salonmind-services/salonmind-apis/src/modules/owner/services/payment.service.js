const crypto = require("crypto");

const ApiError = require("../../../utils/ApiError");

function randomId(prefix) {
  const suffix = crypto.randomBytes(6).toString("hex");
  return `${prefix}_${Date.now()}_${suffix}`;
}

function createPaymentOrder({ plan }) {
  if (!plan) {
    throw ApiError.badRequest("Subscription plan is required for checkout");
  }

  return {
    id: randomId("order"),
    amount: plan.price * 100, // store in paise for Razorpay compatibility
    currency: plan.currency || "INR",
    receipt: randomId("receipt"),
  };
}

function verifyPaymentSignature({ orderId, paymentId, signature }) {
  const secret = process.env.RAZORPAY_KEY_SECRET;

  if (!secret) {
    throw ApiError.serviceUnavailable("Payment provider not configured");
  }

  if (!signature) {
    throw ApiError.badRequest("Payment signature missing");
  }

  const body = `${orderId}|${paymentId}`;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");

  if (expected !== signature) {
    throw ApiError.badRequest("Invalid payment signature");
  }

  return true;
}

module.exports = {
  createPaymentOrder,
  verifyPaymentSignature,
};
