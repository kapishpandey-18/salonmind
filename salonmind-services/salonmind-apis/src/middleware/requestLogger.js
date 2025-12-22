const logger = require('../utils/logger');

// HTTP request logging middleware
const requestLogger = (req, res, next) => {
  const startTime = Date.now();

  // Log incoming request
  logger.info(`→ ${req.method} ${req.originalUrl}`, {
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });

  // Log request body for POST/PUT/PATCH (excluding sensitive data)
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const sanitizedBody = { ...req.body };
    // Remove sensitive fields
    if (sanitizedBody.password) sanitizedBody.password = '***';
    if (sanitizedBody.otp) sanitizedBody.otp = '***';
    logger.debug('Request Body:', sanitizedBody);
  }

  // Capture response
  const originalSend = res.send;
  res.send = function (data) {
    const duration = Date.now() - startTime;
    
    // Log response
    logger.http(req.method, req.originalUrl, res.statusCode, duration);

    // Log error responses
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

module.exports = requestLogger;
