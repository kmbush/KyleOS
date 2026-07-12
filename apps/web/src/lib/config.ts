// Runtime configuration, fetched from /config.json at boot so the bundle ships no
// environment values (ADR-006). CI generates the real config.json from Terraform
// outputs at deploy time; a forker's values never touch this repo.

export interface AppConfig {
  region: string;
  apiBaseUrl: string;
  cognitoUserPoolId: string;
  cognitoClientId: string;
}

export async function loadConfig(): Promise<AppConfig> {
  const response = await fetch("/config.json", { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Could not load /config.json (HTTP ${response.status})`);
  }
  return (await response.json()) as AppConfig;
}
