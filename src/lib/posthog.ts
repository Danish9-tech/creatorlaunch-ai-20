import posthog from 'posthog-js';

/**
 * PostHog Analytics Configuration
 * Tracks user behavior, feature usage, and product analytics
 */

const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY;
const POSTHOG_HOST = import.meta.env.VITE_POSTHOG_HOST || 'https://app.posthog.com';

// Initialize PostHog
export const initPostHog = () => {
  if (!POSTHOG_KEY) {
    console.warn('PostHog key not found. Analytics will be disabled.');
    return;
  }

  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    loaded: (posthog) => {
      if (import.meta.env.DEV) {
        console.log('PostHog loaded successfully');
      }
    },
    autocapture: true,
    capture_pageview: true,
    capture_pageleave: true,
    enable_recording_console_log: true,
    session_recording: {
      recordCrossOriginIframes: true,
    },
  });
};

// Identify user
export const identifyUser = (userId: string, traits?: Record<string, any>) => {
  if (POSTHOG_KEY) {
    posthog.identify(userId, traits);
  }
};

// Track custom event
export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  if (POSTHOG_KEY) {
    posthog.capture(eventName, properties);
  }
};

// Reset user session (on logout)
export const resetPostHog = () => {
  if (POSTHOG_KEY) {
    posthog.reset();
  }
};

export default posthog;
