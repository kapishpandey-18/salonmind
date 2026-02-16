import crypto from "crypto";
import ApiError from "../../../utils/ApiError.js";
import logger from "../../../utils/logger.js";
import type { ISubscriptionPlanDocument } from "../../../models/SubscriptionPlan.js";

// ============================================================================
// Types
// ============================================================================

export interface PaymentOrder {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  status?: string;
  notes?: Record<string, string>;
}

interface RazorpayConfig {
  keyId: string;
  keySecret: string;
}

interface RazorpayOrderOptions {
  amount: number;
  currency: string;
  receipt: string;
  notes?: Record<string, string>;
}

// ============================================================================
// Configuration
// ============================================================================

function getConfig(): RazorpayConfig {
  return {
    keyId: process.env.RAZORPAY_KEY_ID || "",
    keySecret: process.env.RAZORPAY_KEY_SECRET || "",
  };
}

function isConfigured(): boolean {
  const config = getConfig();
  return Boolean(config.keyId && config.keySecret);
}

function isTestMode(): boolean {
  return (
    process.env.NODE_ENV === "test" ||
    process.env.NODE_ENV === "development" ||
    process.env.RAZORPAY_TEST_MODE === "true"
  );
}

// ============================================================================
// Mock Implementation (Dev/Test)
// ============================================================================

function randomId(prefix: string): string {
  const suffix = crypto.randomBytes(6).toString("hex");
  return `${prefix}_${Date.now()}_${suffix}`;
}

function createMockOrder(options: RazorpayOrderOptions): PaymentOrder {
  return {
    id: randomId("order"),
    amount: options.amount,
    currency: options.currency,
    receipt: options.receipt,
    status: "created",
    notes: options.notes,
  };
}

// ============================================================================
// Razorpay API Implementation
// ============================================================================

async function createRazorpayOrder(
  options: RazorpayOrderOptions
): Promise<PaymentOrder> {
  const config = getConfig();

  if (!isConfigured()) {
    throw ApiError.serviceUnavailable(
      "Payment provider not configured. Missing RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET."
    );
  }

  try {
    const auth = Buffer.from(`${config.keyId}:${config.keySecret}`).toString(
      "base64"
    );

    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify({
        amount: options.amount,
        currency: options.currency,
        receipt: options.receipt,
        notes: options.notes || {},
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      logger.error("Razorpay order creation failed", {
        status: response.status,
        error: errorData,
      });
      throw ApiError.serviceUnavailable(
        errorData.error?.description || "Failed to create payment order"
      );
    }

    const order = await response.json();

    logger.info("Razorpay order created", {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });

    return {
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      status: order.status,
      notes: order.notes,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    const message = error instanceof Error ? error.message : "Unknown error";
    logger.error("Razorpay API exception", { error: message });
    throw ApiError.serviceUnavailable(`Payment service error: ${message}`);
  }
}

// ============================================================================
// Public API
// ============================================================================

export async function createPaymentOrder({
  plan,
  tenantId,
  userId,
}: {
  plan: ISubscriptionPlanDocument;
  tenantId?: string;
  userId?: string;
}): Promise<PaymentOrder> {
  if (!plan) {
    throw ApiError.badRequest("Subscription plan is required for checkout");
  }

  const options: RazorpayOrderOptions = {
    amount: plan.price * 100, // Razorpay expects amount in paise
    currency: plan.currency || "INR",
    receipt: randomId("receipt"),
    notes: {
      planCode: plan.code,
      planName: plan.name,
      ...(tenantId && { tenantId }),
      ...(userId && { userId }),
    },
  };

  // Use mock in test/dev, real Razorpay in production
  if (isTestMode()) {
    logger.info("Creating mock payment order (test mode)", {
      amount: options.amount,
      currency: options.currency,
    });
    return createMockOrder(options);
  }

  return createRazorpayOrder(options);
}

export function verifyPaymentSignature({
  orderId,
  paymentId,
  signature,
}: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  // Skip verification in test mode
  if (isTestMode() && signature === "sig_test") {
    logger.info("Skipping signature verification (test mode)");
    return true;
  }

  const config = getConfig();

  if (!config.keySecret) {
    throw ApiError.serviceUnavailable(
      "Payment provider not configured. Missing RAZORPAY_KEY_SECRET."
    );
  }

  if (!signature) {
    throw ApiError.badRequest("Payment signature is required");
  }

  if (!orderId || !paymentId) {
    throw ApiError.badRequest("Order ID and Payment ID are required");
  }

  // Razorpay signature verification:
  // HMAC-SHA256(orderId + "|" + paymentId, secret)
  const body = `${orderId}|${paymentId}`;
  const expectedSignature = crypto
    .createHmac("sha256", config.keySecret)
    .update(body)
    .digest("hex");

  if (expectedSignature !== signature) {
    logger.warn("Invalid payment signature", {
      orderId,
      paymentId,
      expected: expectedSignature.substring(0, 10) + "...",
      received: signature.substring(0, 10) + "...",
    });
    throw ApiError.badRequest("Invalid payment signature");
  }

  logger.info("Payment signature verified", { orderId, paymentId });
  return true;
}

export async function fetchPaymentDetails(paymentId: string): Promise<{
  id: string;
  amount: number;
  currency: string;
  status: string;
  method: string;
  orderId: string;
} | null> {
  if (isTestMode()) {
    // Return mock payment details in test mode
    return {
      id: paymentId,
      amount: 0,
      currency: "INR",
      status: "captured",
      method: "test",
      orderId: "",
    };
  }

  const config = getConfig();

  if (!isConfigured()) {
    throw ApiError.serviceUnavailable("Payment provider not configured");
  }

  try {
    const auth = Buffer.from(`${config.keyId}:${config.keySecret}`).toString(
      "base64"
    );

    const response = await fetch(
      `https://api.razorpay.com/v1/payments/${paymentId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Basic ${auth}`,
        },
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      const errorData = await response.json();
      throw ApiError.serviceUnavailable(
        errorData.error?.description || "Failed to fetch payment details"
      );
    }

    const payment = await response.json();

    return {
      id: payment.id,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      method: payment.method,
      orderId: payment.order_id,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    const message = error instanceof Error ? error.message : "Unknown error";
    logger.error("Failed to fetch payment details", { paymentId, error: message });
    throw ApiError.serviceUnavailable(`Payment service error: ${message}`);
  }
}

export function getPublicKey(): string {
  const config = getConfig();
  if (!config.keyId) {
    throw ApiError.serviceUnavailable("Payment provider not configured");
  }
  return config.keyId;
}
