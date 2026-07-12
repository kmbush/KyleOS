// The authentication seam (ADR-003): SRP sign-in plus Cognito's native
// SOFTWARE_TOKEN_MFA challenge. Cognito owns the entire MFA lifecycle — we render
// the inputs and pass the code through. No Cognito type crosses this boundary, so
// the library stays replaceable behind these plain functions.
import {
  AuthenticationDetails,
  CognitoUser,
  CognitoUserPool,
  type ICognitoStorage,
} from "amazon-cognito-identity-js";
import { getConfig } from "./config";

export type SignInResult = { status: "MFA_REQUIRED" } | { status: "AUTHENTICATED"; jwt: string };

// The library persists its session to localStorage by default; an in-memory store
// keeps tokens out of it so a reload forces re-auth (ADR-003).
const memoryStorage: ICognitoStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key) => store[key] ?? null,
    setItem: (key, value) => {
      store[key] = value;
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

// The user awaiting its TOTP challenge, held between signIn and submitTotp.
let pendingUser: CognitoUser | null = null;

function pool(): CognitoUserPool {
  const { cognitoUserPoolId, cognitoClientId } = getConfig();
  return new CognitoUserPool({
    UserPoolId: cognitoUserPoolId,
    ClientId: cognitoClientId,
    Storage: memoryStorage,
  });
}

/** SRP sign-in. Resolves to the TOTP challenge or, if MFA is off, the ID token. */
export function signIn(email: string, password: string): Promise<SignInResult> {
  const user = new CognitoUser({ Username: email, Pool: pool() });
  const details = new AuthenticationDetails({ Username: email, Password: password });
  return new Promise((resolve, reject) => {
    user.authenticateUser(details, {
      onSuccess: (session) => {
        pendingUser = null;
        resolve({ status: "AUTHENTICATED", jwt: session.getIdToken().getJwtToken() });
      },
      onFailure: (error) => {
        pendingUser = null;
        reject(new Error(error.message || "Sign-in failed."));
      },
      totpRequired: () => {
        pendingUser = user;
        resolve({ status: "MFA_REQUIRED" });
      },
    });
  });
}

/** Hand the six-digit code to Cognito for the in-flight sign-in; returns the ID token. */
export function submitTotp(code: string): Promise<{ jwt: string }> {
  const user = pendingUser;
  if (!user) return Promise.reject(new Error("No sign-in is in progress."));
  return new Promise((resolve, reject) => {
    user.sendMFACode(
      code,
      {
        onSuccess: (session) => {
          pendingUser = null;
          resolve({ jwt: session.getIdToken().getJwtToken() });
        },
        onFailure: (error) => reject(new Error(error.message || "That code was not accepted.")),
      },
      "SOFTWARE_TOKEN_MFA",
    );
  });
}

/** Drop any in-flight sign-in. In-memory tokens are cleared by useAuth. */
export function signOut(): void {
  pendingUser?.signOut();
  pendingUser = null;
}
