const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
} as const;

const getTimestamp = (): string => {
  const now = new Date();
  return now.toLocaleString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
};

const logger = {
  info: (message: unknown, ...args: unknown[]): void => {
    console.log(
      `${colors.cyan}[INFO]${colors.reset} ${colors.bright}[${getTimestamp()}]${colors.reset} ${message}`,
      ...args
    );
  },

  success: (message: string, ...args: unknown[]): void => {
    console.log(
      `${colors.green}[SUCCESS]${colors.reset} ${colors.bright}[${getTimestamp()}]${colors.reset} ${message}`,
      ...args
    );
  },

  error: (message: unknown, ...args: unknown[]): void => {
    const formattedMessage = typeof message === 'object' && message !== null
      ? JSON.stringify(message, null, 2)
      : message;
    console.error(
      `${colors.red}[ERROR]${colors.reset} ${colors.bright}[${getTimestamp()}]${colors.reset} ${formattedMessage}`,
      ...args
    );
  },

  warn: (message: string, ...args: unknown[]): void => {
    console.warn(
      `${colors.yellow}[WARN]${colors.reset} ${colors.bright}[${getTimestamp()}]${colors.reset} ${message}`,
      ...args
    );
  },

  debug: (message: string, ...args: unknown[]): void => {
    if (process.env.NODE_ENV === "development") {
      console.log(
        `${colors.magenta}[DEBUG]${colors.reset} ${colors.bright}[${getTimestamp()}]${colors.reset} ${message}`,
        ...args
      );
    }
  },

  http: (method: string, url: string, status: number, duration: number): void => {
    const statusColor =
      status >= 500 ? colors.red : status >= 400 ? colors.yellow : colors.green;
    console.log(
      `${colors.blue}[HTTP]${colors.reset} ${colors.bright}[${getTimestamp()}]${colors.reset} ${method} ${url} ${statusColor}${status}${colors.reset} ${duration}ms`
    );
  },
};

export default logger;
