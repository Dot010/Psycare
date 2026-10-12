"use client";

import { useLocalStorage } from "@/lib/useLocalStorage";
import { EMPTY_PROFILE, PROFILE_KEY, type Profile } from "./schema";

export function useProfile() {
  return useLocalStorage<Profile>(PROFILE_KEY, EMPTY_PROFILE);
}
