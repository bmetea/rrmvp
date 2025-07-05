type LogLevel = "DEBUG" | "INFO" | "WARN" | "ERROR";

interface LogContext {
  [key: string]: unknown;
}

interface RequestContext extends LogContext {
  requestId: string;
  path: string;
  method: string;
}

interface ResponseContext extends LogContext {
  duration: number;
  statusCode: number;
}

interface ErrorContext extends LogContext {
  error: string;
  duration: number;
  statusCode?: number;
}

class Logger {
  private serviceName: string;
  private environment: string;
  private logLevel: LogLevel;
  private context: LogContext;

  constructor(config: {
    serviceName: string;
    environment?: string;
    logLevel?: LogLevel;
  }) {
    this.serviceName = config.serviceName;
    this.environment = config.environment || "development";
    this.logLevel = config.logLevel || "INFO";
    this.context = {};
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ["DEBUG", "INFO", "WARN", "ERROR"];
    return levels.indexOf(level) >= levels.indexOf(this.logLevel);
  }

  private formatMessage(
    level: LogLevel,
    message: string,
    context: LogContext = {}
  ): string {
    const timestamp = new Date().toISOString();
    const logContext = { ...this.context, ...context };

    return JSON.stringify({
      timestamp,
      level,
      service: this.serviceName,
      environment: this.environment,
      message,
      ...logContext,
    });
  }

  addContext(context: LogContext): void {
    this.context = { ...this.context, ...context };
  }

  debug(message: string, context: LogContext = {}): void {
    if (this.shouldLog("DEBUG")) {
      console.debug(this.formatMessage("DEBUG", message, context));
    }
  }

  info(message: string, context: LogContext = {}): void {
    if (this.shouldLog("INFO")) {
      console.info(this.formatMessage("INFO", message, context));
    }
  }

  warn(message: string, context: LogContext = {}): void {
    if (this.shouldLog("WARN")) {
      console.warn(this.formatMessage("WARN", message, context));
    }
  }

  error(message: string, context: LogContext = {}): void {
    if (this.shouldLog("ERROR")) {
      console.error(this.formatMessage("ERROR", message, context));
    }
  }
}

// Create a logger instance with default configuration
const logger = new Logger({
  serviceName: "rrmvp",
  logLevel: (process.env.LOG_LEVEL as LogLevel) || "INFO",
  environment: process.env.NODE_ENV || "development",
});

// Add custom middleware to include request context
export const withLogging = (
  handler: (req: Request, res: Response) => Promise<Response>
) => {
  return async (req: Request, res: Response) => {
    const startTime = Date.now();
    const requestId = req.headers.get("x-request-id") || crypto.randomUUID();

    // Add request context to logger
    const requestContext: RequestContext = {
      requestId,
      path: req.url,
      method: req.method,
    };
    logger.addContext(requestContext);

    try {
      const result = await handler(req, res);
      const duration = Date.now() - startTime;

      const responseContext: ResponseContext = {
        duration,
        statusCode: res.status,
      };
      logger.info("Request completed", responseContext);

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;

      const errorContext: ErrorContext = {
        error: error instanceof Error ? error.message : "Unknown error",
        duration,
        statusCode: res.status,
      };
      logger.error("Request failed", errorContext);

      throw error;
    }
  };
};

export { logger };
