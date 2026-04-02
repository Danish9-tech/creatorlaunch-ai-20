// src/lib/sentry.ts
// Sentry Error Monitoring Configuration for CreatorWand AI
import * as Sentry from "@sentry/react";

/**
 * Initialize Sentry for error tracking and performance monitoring.
 * Only runs in production to avoid polluting error logs during development.
 */
export function initSentry() {
  // Only initialize in production
  if (import.meta.env.PROD) {
    const sentryDsn = import.meta.env.VITE_SENTRY_DSN;

    if (!sentryDsn) {
      console.warn(
        "[Sentry] DSN not configured. Add VITE_SENTRY_DSN to your .env file to enable error tracking."
      );
      return;
    }

    Sentry.init({
      dsn: sentryDsn,
      environment: import.meta.env.MODE,
      
      // Performance Monitoring
      tracesSampleRate: 1.0, // Capture 100% of transactions for performance monitoring
      
      // Session Replay
      replaysSessionSampleRate: 0.1, // Sample 10% of sessions
      replaysOnErrorSampleRate: 1.0, // Sample 100% of sessions with errors
      
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration({
          maskAllText: false,
          blockAllMedia: false,
        }),
      ],

      // Filter out common errors
      beforeSend(event, hint) {
        // Filter out network errors from ad blockers
        const error = hint.originalException as Error;
        if (error?.message?.includes("blocked")) {
          return null;
        }
        return event;
      },
    });

    console.log("[Sentry] Error monitoring initialized");
  }
}

/**
 * Manually capture an exception
 */
export function captureException(error: Error, context?: Record<string, any>) {
  if (import.meta.env.PROD) {
    Sentry.captureException(error, {
      extra: context,
    });
  } else {
    console.error("[Dev Error]", error, context);
  }
}

/**
 * Capture a message (for non-error logging)
 */
export function captureMessage(message: string, level: Sentry.SeverityLevel = "info") {
  if (import.meta.env.PROD) {
    Sentry.captureMessage(message, level);
  } else {
    console.log(`[Dev ${level}]`, message);
  }
}

/**
 * Set user context for error tracking
 */
export function setUser(user: { id: string; email?: string; username?: string } | null) {
  if (import.meta.env.PROD) {
    Sentry.setUser(user);
  }
}

export { Sentry };
