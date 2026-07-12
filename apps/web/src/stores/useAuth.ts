// Owner session state (DESIGN §9). The JWT lives here, in memory only — never in
// localStorage or a cookie, so a reload forces re-auth (ADR-003). The Cognito flow
// itself lives behind lib/cognito; this store only drives the login steps.
import { create } from "zustand";
import * as cognito from "../lib/cognito";

export type AuthStep = "creds" | "totp" | "authed";

interface AuthStore {
  step: AuthStep;
  jwt: string | null;
  error: string | null;
  pending: boolean; // a Cognito call is in flight — disables the form
  submitCreds: (email: string, password: string) => Promise<void>;
  submitTotp: (code: string) => Promise<void>;
  signOut: () => void;
  cancel: () => void;
}

export const useAuth = create<AuthStore>((set) => ({
  step: "creds",
  jwt: null,
  error: null,
  pending: false,

  submitCreds: async (email, password) => {
    set({ pending: true, error: null });
    try {
      const result = await cognito.signIn(email, password);
      if (result.status === "AUTHENTICATED") {
        set({ step: "authed", jwt: result.jwt, pending: false });
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

  signOut: () => {
    cognito.signOut();
    set({ step: "creds", jwt: null, error: null, pending: false });
  },

  // Abandon the current step and return to credentials (the "back"/"cancel"
  // action). Keeps the modal open; closing it is the caller's concern.
  cancel: () => {
    cognito.signOut();
    set({ step: "creds", error: null, pending: false });
  },
}));
