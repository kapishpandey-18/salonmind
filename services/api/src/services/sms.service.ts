import logger from "../utils/logger.js";

// ============================================================================
// Types
// ============================================================================

export interface SmsResult {
  success: boolean;
  messageId?: string;
  provider: string;
  error?: string;
}

export interface SmsProvider {
  name: string;
  sendSms(phone: string, message: string): Promise<SmsResult>;
  sendOtp(phone: string, otp: string): Promise<SmsResult>;
}

// ============================================================================
// Console Provider (Development)
// ============================================================================

const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  bgBlue: "\x1b[44m",
} as const;

class ConsoleProvider implements SmsProvider {
  name = "console";

  async sendSms(phone: string, message: string): Promise<SmsResult> {
    console.log("\n" + "=".repeat(50));
    console.log(
      `${colors.bgBlue}${colors.bright} SMS CONSOLE ${colors.reset}`
    );
    console.log("=".repeat(50));
    console.log(`${colors.cyan}To:${colors.reset}      ${phone}`);
    console.log(`${colors.cyan}Message:${colors.reset} ${message}`);
    console.log("=".repeat(50) + "\n");

    logger.info("SMS sent (dev console)", { phone, message });

    return {
      success: true,
      messageId: `dev-${Date.now()}`,
      provider: this.name,
    };
  }

  async sendOtp(phone: string, otp: string): Promise<SmsResult> {
    const message = `Your SalonMind verification code is: ${otp}. Valid for 5 minutes. Do not share this code.`;
    return this.sendSms(phone, message);
  }
}

// ============================================================================
// MSG91 Provider (Production)
// ============================================================================

interface MSG91Config {
  authKey: string;
  senderId: string;
  templateId: string;
  otpTemplateId: string;
}

class MSG91Provider implements SmsProvider {
  name = "msg91";
  private config: MSG91Config;

  constructor() {
    this.config = {
      authKey: process.env.MSG91_AUTH_KEY || "",
      senderId: process.env.MSG91_SENDER_ID || "SLNMND",
      templateId: process.env.MSG91_TEMPLATE_ID || "",
      otpTemplateId: process.env.MSG91_OTP_TEMPLATE_ID || "",
    };
  }

  private isConfigured(): boolean {
    return Boolean(this.config.authKey && this.config.templateId);
  }

  async sendSms(phone: string, message: string): Promise<SmsResult> {
    if (!this.isConfigured()) {
      logger.error("MSG91 not configured", {
        hasAuthKey: Boolean(this.config.authKey),
        hasTemplateId: Boolean(this.config.templateId),
      });
      return {
        success: false,
        provider: this.name,
        error: "SMS provider not configured",
      };
    }

    try {
      // MSG91 API endpoint
      const url = "https://control.msg91.com/api/v5/flow/";

      const payload = {
        template_id: this.config.templateId,
        sender: this.config.senderId,
        short_url: "0",
        mobiles: phone.replace("+", ""),
        message: message,
      };

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authkey: this.config.authKey,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.type === "success") {
        logger.info("SMS sent via MSG91", { phone, messageId: data.request_id });
        return {
          success: true,
          messageId: data.request_id,
          provider: this.name,
        };
      }

      logger.error("MSG91 send failed", { phone, error: data });
      return {
        success: false,
        provider: this.name,
        error: data.message || "Failed to send SMS",
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      logger.error("MSG91 exception", { phone, error: errorMessage });
      return {
        success: false,
        provider: this.name,
        error: errorMessage,
      };
    }
  }

  async sendOtp(phone: string, otp: string): Promise<SmsResult> {
    if (!this.isConfigured()) {
      return {
        success: false,
        provider: this.name,
        error: "SMS provider not configured",
      };
    }

    try {
      // MSG91 OTP API endpoint
      const url = "https://control.msg91.com/api/v5/flow/";

      const payload = {
        template_id: this.config.otpTemplateId || this.config.templateId,
        sender: this.config.senderId,
        short_url: "0",
        mobiles: phone.replace("+", ""),
        OTP: otp,
      };

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authkey: this.config.authKey,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.type === "success") {
        logger.info("OTP sent via MSG91", { phone, messageId: data.request_id });
        return {
          success: true,
          messageId: data.request_id,
          provider: this.name,
        };
      }

      logger.error("MSG91 OTP send failed", { phone, error: data });
      return {
        success: false,
        provider: this.name,
        error: data.message || "Failed to send OTP",
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      logger.error("MSG91 OTP exception", { phone, error: errorMessage });
      return {
        success: false,
        provider: this.name,
        error: errorMessage,
      };
    }
  }
}

// ============================================================================
// Provider Factory
// ============================================================================

function getProvider(): SmsProvider {
  const env = process.env.NODE_ENV;
  const forceProvider = process.env.SMS_PROVIDER;

  // Allow forcing a specific provider via env var
  if (forceProvider === "msg91") {
    return new MSG91Provider();
  }
  if (forceProvider === "console") {
    return new ConsoleProvider();
  }

  // Default: console for dev/test, MSG91 for production
  if (env === "production") {
    return new MSG91Provider();
  }

  return new ConsoleProvider();
}

// Singleton instance
const provider = getProvider();

// ============================================================================
// Public API
// ============================================================================

export async function sendSms(
  phone: string,
  message: string
): Promise<SmsResult> {
  return provider.sendSms(phone, message);
}

export async function sendOtp(
  phone: string,
  otp: string
): Promise<SmsResult> {
  return provider.sendOtp(phone, otp);
}

export function getActiveProvider(): string {
  return provider.name;
}
