// Frontend development logger utility

type LogLevel = 'info' | 'success' | 'error' | 'warn' | 'debug';

const colors = {
  info: '#3b82f6',    // blue
  success: '#22c55e', // green
  error: '#ef4444',   // red
  warn: '#f59e0b',    // yellow
  debug: '#a855f7',   // purple
};

const getTimestamp = (): string => {
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

const log = (level: LogLevel, message: string, ...args: any[]) => {
  const timestamp = getTimestamp();
  const color = colors[level];
  const emoji = {
    info: 'ℹ️',
    success: '✅',
    error: '❌',
    warn: '⚠️',
    debug: '🔍',
  }[level];

  const consoleMethod = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;

  consoleMethod(
    `%c${emoji} [${level.toUpperCase()}] %c[${timestamp}] %c${message}`,
    `color: ${color}; font-weight: bold`,
    'color: #9ca3af',
    'color: inherit',
    ...args
  );
};

export const logger = {
  info: (message: string, ...args: any[]) => {
    if (import.meta.env.DEV) {
      log('info', message, ...args);
    }
  },

  success: (message: string, ...args: any[]) => {
    if (import.meta.env.DEV) {
      log('success', message, ...args);
    }
  },

  error: (message: string, ...args: any[]) => {
    if (import.meta.env.DEV) {
      log('error', message, ...args);
    }
  },

  warn: (message: string, ...args: any[]) => {
    if (import.meta.env.DEV) {
      log('warn', message, ...args);
    }
  },

  debug: (message: string, ...args: any[]) => {
    if (import.meta.env.DEV) {
      log('debug', message, ...args);
    }
  },

  // API request logger
  apiRequest: (method: string, url: string, data?: any) => {
    if (import.meta.env.DEV) {
      console.log(
        `%c→ API ${method} %c${url}`,
        'color: #3b82f6; font-weight: bold',
        'color: #6b7280',
        data ? data : ''
      );
    }
  },

  // API response logger
  apiResponse: (method: string, url: string, status: number, duration: number, data?: any) => {
    if (import.meta.env.DEV) {
      const statusColor = status >= 500 ? '#ef4444' : status >= 400 ? '#f59e0b' : '#22c55e';
      console.log(
        `%c← API ${method} %c${url} %c${status} %c${duration}ms`,
        'color: #3b82f6; font-weight: bold',
        'color: #6b7280',
        `color: ${statusColor}; font-weight: bold`,
        'color: #9ca3af',
        data ? data : ''
      );
    }
  },

  // Group logs
  group: (title: string, callback: () => void) => {
    if (import.meta.env.DEV) {
      console.group(`%c${title}`, 'color: #8b5cf6; font-weight: bold');
      callback();
      console.groupEnd();
    }
  },
};
