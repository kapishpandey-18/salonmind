// Simple development logger utility
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

const getTimestamp = () => {
  const now = new Date();
  return now.toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
};

const logger = {
  info: (message, ...args) => {
    console.log(
      `${colors.cyan}[INFO]${colors.reset} ${colors.bright}[${getTimestamp()}]${colors.reset} ${message}`,
      ...args
    );
  },

  success: (message, ...args) => {
    console.log(
      `${colors.green}[SUCCESS]${colors.reset} ${colors.bright}[${getTimestamp()}]${colors.reset} ${message}`,
      ...args
    );
  },

  error: (message, ...args) => {
    console.error(
      `${colors.red}[ERROR]${colors.reset} ${colors.bright}[${getTimestamp()}]${colors.reset} ${message}`,
      ...args
    );
  },

  warn: (message, ...args) => {
    console.warn(
      `${colors.yellow}[WARN]${colors.reset} ${colors.bright}[${getTimestamp()}]${colors.reset} ${message}`,
      ...args
    );
  },

  debug: (message, ...args) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(
        `${colors.magenta}[DEBUG]${colors.reset} ${colors.bright}[${getTimestamp()}]${colors.reset} ${message}`,
        ...args
      );
    }
  },

  http: (method, url, status, duration) => {
    const statusColor = status >= 500 ? colors.red : status >= 400 ? colors.yellow : colors.green;
    console.log(
      `${colors.blue}[HTTP]${colors.reset} ${colors.bright}[${getTimestamp()}]${colors.reset} ${method} ${url} ${statusColor}${status}${colors.reset} ${duration}ms`
    );
  },
};

module.exports = logger;
