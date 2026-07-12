// Owner session state (DESIGN §9). The JWT lives here, in memory only — never in
// localStorage or a cookie, so a reload forces re-auth (ADR-003). The Cognito flow
// itself lives behind lib/cognito; this store only drives the login steps.
import { create } from "zustand";
import * as cognito from "../lib/cognito";

export type AuthStep = "creds" | "totp" | "mfa_setup" | "authed";

interface AuthStore {
  step: AuthStep;
  jwt: string | null;
  error: string | null;
  pending: boolean; // a Cognito call is in flight — disables the form
  // TOTP enrollment material, present only during the 'mfa_setup' step. The secret
  // is generated in the browser and never persisted (ADR-003).
  setupSecret: string | null;
  setupOtpauthUri: string | null;
  submitCreds: (email: string, password: string) => Promise<void>;
  submitTotp: (code: string) => Promise<void>;
  completeMfaSetup: (code: string) => Promise<void>;
  signOut: () => void;
  cancel: () => void;
}

const RESET = {
  step: "creds",
  error: null,
  pending: false,
  setupSecret: null,
  setupOtpauthUri: null,
} as const;

export const useAuth = create<AuthStore>((set) => ({
  ...RESET,
  jwt: null,

  submitCreds: async (email, password) => {
    set({ pending: true, error: null });
    try {
      const result = await cognito.signIn(email, password);
      if (result.status === "AUTHENTICATED") {
        set({ step: "authed", jwt: result.jwt, pending: false });
      } else if (result.status === "MFA_SETUP") {
        set({
          step: "mfa_setup",
          pending: false,
          setupSecret: result.secret,
          setupOtpauthUri: result.otpauthUri,
        });
      } else {
        set({ step: "totp", pending: false });
      }
    } catch (error) {
      set({ pending: false, error: (error as Error).message });
    }
  },

  submitTotp: async (code) => {
    set({ pending: true, error: null });
    try {
      const { jwt } = await cognito.submitTotp(code);
      set({ step: "authed", jwt, pending: false });
    } catch (error) {
      set({ pending: false, error: (error as Error).message });
    }
  },

  completeMfaSetup: async (code) => {
    set({ pending: true, error: null });
    try {
      const { jwt } = await cognito.completeMfaSetup(code);
      set({ step: "authed", jwt, pending: false, setupSecret: null, setupOtpauthUri: null });
    } catch (error) {
      set({ pending: false, error: (error as Error).message });
    }
  },

  signOut: () => {
    cognito.signOut();
    set({ ...RESET, jwt: null });
  },

  // Abandon the current step and return to credentials (the "back"/"cancel"
  // action). Keeps the modal open; closing it is the caller's concern.
  cancel: () => {
    cognito.signOut();
    set(RESET);
  },
}));
