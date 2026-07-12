// Access to the content document (DESIGN §9). The query cache — prefetched at boot
// in main.tsx — is the single source of truth for every rendered word, so app
// components read a plain Content and never a loading state (DESIGN §10).
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef } from "react";
import { useAuth } from "../stores/useAuth";
import { getContent, putContent } from "./api";
import type { Content } from "./schema";

export const contentQuery = { queryKey: ["content"], queryFn: getContent } as const;

export function useContent(): Content {
  // Data is always present: main.tsx prefetches it before the shell renders, and
  // the cache is never cleared — so a plain Content, never undefined (DESIGN §10).
  return useQuery(contentQuery).data as Content;
}

/**
 * Optimistic save (DESIGN §9). The editor writes edits straight into the cache so
 * they preview live across the OS; this persists them via PUT /content and, on
 * failure, rolls the cache back to the last server-confirmed document.
 */
export function useSaveContent() {
  const queryClient = useQueryClient();
  const jwt = useAuth((s) => s.jwt);
  // The rollback baseline: the last document the server accepted. Seeded from the
  // freshly-loaded cache, then advanced on every successful save.
  const saved = useRef(queryClient.getQueryData<Content>(contentQuery.queryKey));

  return useMutation({
    mutationFn: (content: Content) => {
      if (!jwt) throw new Error("You are signed out — sign in again to save.");
      return putContent(content, jwt);
    },
    onSuccess: (_result, content) => {
      saved.current = content;
    },
    onError: () => {
      if (saved.current) queryClient.setQueryData(contentQuery.queryKey, saved.current);
    },
  });
}
