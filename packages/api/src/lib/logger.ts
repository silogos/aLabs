/** Structured logging — one pino logger for the whole API package.
 *
 *  JSON lines to stdout: no transport, no hosted service (see ADR 0010).
 *  Pipe through `npx pino-pretty` locally if you want formatted output.
 *
 *  Level comes from `LOG_LEVEL` (trace…silent); default is debug outside
 *  production, info in production. Tests pin `warn` (tests/setup.ts) so
 *  request logs stay out of the reporter. */
import { pino, type DestinationStream, type Logger } from "pino";

export function createLogger(destination?: DestinationStream): Logger {
  return pino(
    {
      level: process.env.LOG_LEVEL ?? (process.env.NODE_ENV === "production" ? "info" : "debug"),
    },
    destination,
  );
}

/** Shared root logger — import this, pass context as fields per call. */
export const logger = createLogger();
