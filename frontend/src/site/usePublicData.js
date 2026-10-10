/**
 * Admin-managed data for the public site (settings, live sessions, testimonials, contact
 * channels, donation methods). One request per resource per page load, shared by every
 * component that asks; until it arrives (or if it fails) callers get `null` and use their
 * bundled fallback, so the site never waits on or breaks because of the backend.
 */
import { useEffect, useState } from "react";
import { publicApi } from "../lib/api";

const cache = new Map(); // key -> { value, promise }

function load(key, fetcher) {
  let entry = cache.get(key);
  if (!entry) {
    entry = { value: undefined, promise: null };
    entry.promise = fetcher()
      .then((v) => (entry.value = v ?? null))
      .catch(() => (entry.value = null));
    cache.set(key, entry);
  }
  return entry;
}

function usePublic(key, fetcher) {
  const entry = load(key, fetcher);
  const [value, setValue] = useState(entry.value === undefined ? null : entry.value);
  useEffect(() => {
    let live = true;
    entry.promise.then(() => live && setValue(entry.value));
    return () => {
      live = false;
    };
  }, [entry]);
  return value;
}

/** Flat public settings: { "zoom.url": "...", "support.primary": "9173...", "social.whatsapp": ... } */
export const useSiteSettings = () => usePublic("settings", publicApi.settings);

/** Published Live Sessions: each has recurrence, local_time, timezone, next_starts_at, next_ends_at, join_url, is_past. */
export const useLiveSessions = () => usePublic("events", publicApi.events);

/** Featured testimonials, else all published ones; null while loading / when there are none. */
export function useTestimonials() {
  const featured = usePublic("testimonials:featured", publicApi.featuredTestimonials);
  const all = usePublic("testimonials", publicApi.testimonials);
  if (Array.isArray(featured) && featured.length) return featured;
  if (Array.isArray(all) && all.length) return all;
  return null;
}

export const useContactChannels = () => usePublic("contact-channels", publicApi.contactChannels);
export const useDonationMethods = () => usePublic("donation-methods", publicApi.donationMethods);

/** Strip quote marks the design copy wraps around quotes, so admin text and bundled text match. */
export const cleanQuote = (s) => String(s || "").trim().replace(/^["“”]+|["“”]+$/g, "").trim();
