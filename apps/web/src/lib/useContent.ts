// Access to the content document (DESIGN §9). The query cache — prefetched at boot
// in main.tsx — is the single source of truth for every rendered word, so app
// components read a plain Content and never a loading state (DESIGN §10). The
// optimistic save hook (useSaveContent) lands with the editor in Phase 4.
import { useQuery } from "@tanstack/react-query";
import { getContent } from "./api";
import type { Content } from "./schema";

export const contentQuery = { queryKey: ["content"], queryFn: getContent } as const;

export function useContent(): Content {
  // Data is always present: main.tsx prefetches it before the shell renders, and
  // the cache is never cleared — so a plain Content, never undefined (DESIGN §10).
  return useQuery(contentQuery).data as Content;
}
