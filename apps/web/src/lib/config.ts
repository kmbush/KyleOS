// Runtime configuration, fetched from /config.json at boot so the bundle ships no
// environment values (ADR-006). CI generates the real config.json from Terraform
// outputs at deploy time; a forker's values never touch this repo.

export interface AppConfig {
  region: string;
  apiBaseUrl: string;
  cognitoUserPoolId: string;
  cognitoClientId: string;
}

// Cached after the boot fetch so synchronous callers (the API and Cognito seams)
// can read config without threading a promise through every call site.
let config: AppConfig | null = null;

export async function loadConfig(): Promise<AppConfig> {
  const response = await fetch("/config.json", { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Could not load /config.json (HTTP ${response.status})`);
  }
  config = (await response.json()) as AppConfig;
  return config;
}

/** The runtime config, available after loadConfig() has resolved at boot. */
export function getConfig(): AppConfig {
  if (!config) throw new Error("Config not loaded — loadConfig() must run before getConfig().");
  return config;
}
