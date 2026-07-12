import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as cognito from "../lib/cognito";
import { useAuth } from "./useAuth";

vi.mock("../lib/cognito", () => ({
  signIn: vi.fn(),
  submitTotp: vi.fn(),
  completeMfaSetup: vi.fn(),
  signOut: vi.fn(),
}));

const signIn = vi.mocked(cognito.signIn);
const submitTotp = vi.mocked(cognito.submitTotp);
const completeMfaSetup = vi.mocked(cognito.completeMfaSetup);

beforeEach(() => {
  useAuth.setState({
    step: "creds",
    jwt: null,
    error: null,
    pending: false,
    setupSecret: null,
    setupOtpauthUri: null,
  });
});
afterEach(() => vi.clearAllMocks());

describe("useAuth", () => {
  it("moves to the TOTP step when Cognito requires MFA", async () => {
    signIn.mockResolvedValue({ status: "MFA_REQUIRED" });
    await useAuth.getState().submitCreds("k@example.com", "pw");
    expect(useAuth.getState().step).toBe("totp");
    expect(useAuth.getState().jwt).toBeNull();
  });

  it("authenticates directly when no MFA challenge is issued", async () => {
    signIn.mockResolvedValue({ status: "AUTHENTICATED", jwt: "id-token" });
    await useAuth.getState().submitCreds("k@example.com", "pw");
    expect(useAuth.getState()).toMatchObject({ step: "authed", jwt: "id-token" });
  });

  it("enters the enrollment step with the secret when MFA is not yet set up", async () => {
    signIn.mockResolvedValue({
      status: "MFA_SETUP",
      secret: "SEED123456",
      otpauthUri: "otpauth://totp/KyleOS:k@example.com?secret=SEED123456&issuer=KyleOS",
    });
    await useAuth.getState().submitCreds("k@example.com", "pw");
    expect(useAuth.getState()).toMatchObject({
      step: "mfa_setup",
      setupSecret: "SEED123456",
      jwt: null,
    });
  });

  it("authenticates and clears the secret when enrollment is completed", async () => {
    useAuth.setState({ step: "mfa_setup", setupSecret: "SEED123456" });
    completeMfaSetup.mockResolvedValue({ jwt: "id-token" });
    await useAuth.getState().completeMfaSetup("123456");
    expect(useAuth.getState()).toMatchObject({
      step: "authed",
      jwt: "id-token",
      setupSecret: null,
    });
  });

  it("keeps the owner on the setup step when the enrollment code is rejected", async () => {
    useAuth.setState({ step: "mfa_setup", setupSecret: "SEED123456" });
    completeMfaSetup.mockRejectedValue(new Error("That code was not accepted."));
    await useAuth.getState().completeMfaSetup("000000");
    expect(useAuth.getState().step).toBe("mfa_setup");
    expect(useAuth.getState().error).toBe("That code was not accepted.");
  });

  it("surfaces a sign-in failure and stays on the creds step", async () => {
    signIn.mockRejectedValue(new Error("Incorrect username or password."));
    await useAuth.getState().submitCreds("k@example.com", "bad");
    expect(useAuth.getState().step).toBe("creds");
    expect(useAuth.getState().error).toBe("Incorrect username or password.");
    expect(useAuth.getState().pending).toBe(false);
  });

  it("stores the JWT in memory on a valid TOTP code", async () => {
    useAuth.setState({ step: "totp" });
    submitTotp.mockResolvedValue({ jwt: "id-token" });
    await useAuth.getState().submitTotp("123456");
    expect(useAuth.getState()).toMatchObject({ step: "authed", jwt: "id-token" });
  });

  it("keeps the owner on the TOTP step when the code is rejected", async () => {
    useAuth.setState({ step: "totp" });
    submitTotp.mockRejectedValue(new Error("That code was not accepted."));
    await useAuth.getState().submitTotp("000000");
    expect(useAuth.getState().step).toBe("totp");
    expect(useAuth.getState().error).toBe("That code was not accepted.");
  });

  it("clears the in-memory JWT on sign-out", () => {
    useAuth.setState({ step: "authed", jwt: "id-token" });
    useAuth.getState().signOut();
    expect(useAuth.getState()).toMatchObject({ step: "creds", jwt: null });
    expect(cognito.signOut).toHaveBeenCalled();
  });

  it("cancel returns to creds without touching an existing JWT slot", () => {
    useAuth.setState({ step: "totp", error: "x" });
    useAuth.getState().cancel();
    expect(useAuth.getState().step).toBe("creds");
    expect(useAuth.getState().error).toBeNull();
  });
});
