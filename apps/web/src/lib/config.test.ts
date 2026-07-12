import { afterEach, describe, expect, it, vi } from "vitest";
import { getConfig, loadConfig } from "./config";

describe("loadConfig", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("returns the parsed config on success", async () => {
    const config = {
      region: "test-region",
      apiBaseUrl: "https://api.test",
      cognitoUserPoolId: "pool",
      cognitoClientId: "client",
    };
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(JSON.stringify(config), { status: 200 })),
    );
    await expect(loadConfig()).resolves.toEqual(config);
  });

  it("throws when config.json is unavailable", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("", { status: 404 })));
    await expect(loadConfig()).rejects.toThrow("HTTP 404");
  });

  it("getConfig returns the config once loadConfig has resolved", async () => {
    const config = {
      region: "test-region",
      apiBaseUrl: "https://api.test",
      cognitoUserPoolId: "pool",
      cognitoClientId: "client",
    };
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(JSON.stringify(config), { status: 200 })),
    );
    await loadConfig();
    expect(getConfig()).toEqual(config);
  });
});
