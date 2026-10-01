"use client";

import { datadogRum } from "@datadog/browser-rum";
import * as Sentry from "@sentry/nextjs";

let hasInitialized = false;

export function initClientObservability() {
  if (hasInitialized || typeof window === "undefined") {
    return;
  }

  hasInitialized = true;

  const sentryDsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (sentryDsn) {
    Sentry.init({
      dsn: sentryDsn,
      tracesSampleRate: Number(process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE ?? 0.2),
      replaysSessionSampleRate: Number(
        process.env.NEXT_PUBLIC_SENTRY_REPLAYS_SESSION_SAMPLE_RATE ?? 0.1,
      ),
      replaysOnErrorSampleRate: Number(
        process.env.NEXT_PUBLIC_SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE ?? 1.0,
      ),
      environment: process.env.NEXT_PUBLIC_APP_ENV ?? "development",
      enabled: process.env.NODE_ENV !== "test",
    });
  }

  const datadogAppId = process.env.NEXT_PUBLIC_DD_APPLICATION_ID;
  const datadogClientToken = process.env.NEXT_PUBLIC_DD_CLIENT_TOKEN;
  if (datadogAppId && datadogClientToken) {
    datadogRum.init({
      applicationId: datadogAppId,
      clientToken: datadogClientToken,
      site: process.env.NEXT_PUBLIC_DD_SITE || "datadoghq.com",
      service: process.env.NEXT_PUBLIC_DD_SERVICE || "psycare-web",
      env: process.env.NEXT_PUBLIC_APP_ENV || process.env.NODE_ENV,
      sessionSampleRate: Number(process.env.NEXT_PUBLIC_DD_SESSION_SAMPLE_RATE ?? 100),
      sessionReplaySampleRate: Number(process.env.NEXT_PUBLIC_DD_REPLAY_SAMPLE_RATE ?? 20),
      trackUserInteractions: true,
      trackResources: true,
      trackLongTasks: true,
      defaultPrivacyLevel: "mask-user-input",
    });
    datadogRum.startSessionReplayRecording();
  }

  const nrLicenseKey = process.env.NEXT_PUBLIC_NEW_RELIC_LICENSE_KEY;
  const nrAppId = process.env.NEXT_PUBLIC_NEW_RELIC_APP_ID;
  if (nrLicenseKey && nrAppId) {
    void import("@newrelic/browser-agent/loaders/browser-agent").then(({ BrowserAgent }) => {
      new BrowserAgent({
        init: {
          distributed_tracing: { enabled: true },
          privacy: { cookies_enabled: true },
        },
        info: {
          beacon: "bam.nr-data.net",
          errorBeacon: "bam.nr-data.net",
          licenseKey: nrLicenseKey,
          applicationID: nrAppId,
          sa: 1,
        },
        loader_config: {
          accountID: process.env.NEXT_PUBLIC_NEW_RELIC_ACCOUNT_ID || "",
          trustKey: process.env.NEXT_PUBLIC_NEW_RELIC_TRUST_KEY || "",
          agentID: process.env.NEXT_PUBLIC_NEW_RELIC_AGENT_ID || "",
          licenseKey: nrLicenseKey,
          applicationID: nrAppId,
        },
      });
    });
  }
}
