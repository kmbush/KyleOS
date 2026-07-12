// The API seam: the single place fetch details for the content endpoints live, so
// components and hooks never build URLs or attach headers (DESIGN §8, §9).
import { getConfig } from "./config";
import type { Content } from "./schema";

// GET the content document from CloudFront — same origin as the app, no auth.
export async function getContent(): Promise<Content> {
  const response = await fetch("/content.json", { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Could not load /content.json (HTTP ${response.status})`);
  }
  return (await response.json()) as Content;
}

// Surface the API's error message when present, else a status-code fallback.
async function errorFrom(response: Response, fallback: string): Promise<Error> {
  const body = (await response.json().catch(() => null)) as { error?: string } | null;
  return new Error(body?.error ?? `${fallback} (HTTP ${response.status}).`);
}

/** Replace the content document. Owner-only — carries the Cognito ID token. */
export async function putContent(content: Content, jwt: string): Promise<void> {
  const response = await fetch(`${getConfig().apiBaseUrl}/content`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${jwt}` },
    body: JSON.stringify(content),
  });
  if (!response.ok) throw await errorFrom(response, "Could not save your changes");
}

/** Send a contact-form submission; `company` is the honeypot the Lambda checks. */
export async function postContact(fields: {
  name: string;
  email: string;
  subject: string;
  message: string;
  company: string;
}): Promise<void> {
  const response = await fetch(`${getConfig().apiBaseUrl}/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(fields),
  });
  if (!response.ok) throw await errorFrom(response, "Could not send your message");
}

/** Upload one project screenshot: presign, PUT to S3, return its stored key. */
export async function uploadImage(file: File, jwt: string): Promise<string> {
  const presign = await fetch(`${getConfig().apiBaseUrl}/upload-url`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${jwt}` },
    body: JSON.stringify({ contentType: file.type }),
  });
  if (!presign.ok) throw await errorFrom(presign, "Could not start the upload");
  const { key, url, maxBytes } = (await presign.json()) as {
    key: string;
    url: string;
    maxBytes: number;
  };
  if (file.size > maxBytes) {
    throw new Error(`Image is too large — keep it under ${Math.round(maxBytes / 1_048_576)} MB.`);
  }
  const put = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });
  if (!put.ok) throw new Error(`Upload failed (HTTP ${put.status}).`);
  return key;
}

// Uploaded images share the app's CloudFront origin; the stored key already
// carries the uploads prefix, so a root-relative path resolves it.
export function imageUrl(key: string): string {
  return `/${key}`;
}
