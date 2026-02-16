import type { Request, Response, NextFunction } from "express";
import logger from "../utils/logger.js";

const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = Date.now();

  logger.info(`→ ${req.method} ${req.originalUrl}`, {
    ip: req.ip,
    userAgent: req.get("user-agent"),
  });

  if (["POST", "PUT", "PATCH"].includes(req.method)) {
    const sanitizedBody = { ...req.body } as Record<string, unknown>;
    if (sanitizedBody.password) sanitizedBody.password = "***";
    if (sanitizedBody.otp) sanitizedBody.otp = "***";
    logger.debug("Request Body:", sanitizedBody);
  }

  const originalSend = res.send;
  res.send = function (data) {
    const duration = Date.now() - startTime;

    logger.http(req.method, req.originalUrl, res.statusCode, duration);

    if (res.statusCode >= 400) {
      logger.error(`✗ ${req.method} ${req.originalUrl} failed`, {
        status: res.statusCode,
        duration: `${duration}ms`,
      });
    }

    return originalSend.call(this, data);
  };

  next();
};

export default requestLogger;
