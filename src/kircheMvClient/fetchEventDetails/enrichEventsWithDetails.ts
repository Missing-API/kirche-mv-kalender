import { EventDetails } from "./types";
import { fetchEventDetails } from "./fetchEventDetails";

/**
 * Enriches multiple events with detail page information in parallel with throttling
 * @param events - Array of events with UID and URL
 * @param maxConcurrent - Maximum number of concurrent requests (default: 5)
 * @param delayMs - Delay between batches in milliseconds (default: 2000)
 * @returns Map of UID to EventDetails
 */
export const enrichEventsWithDetails = async (
  events: Array<{ uid: string; url: string }>,
  maxConcurrent: number = 10,
  delayMs: number = 1000
): Promise<Map<string, EventDetails>> => {
  const resultsMap = new Map<string, EventDetails>();

  // Process events in batches
  for (let i = 0; i < events.length; i += maxConcurrent) {
    const batch = events.slice(i, i + maxConcurrent);

    // Fetch details for current batch with Promise.allSettled
    const promises = batch.map(async (event) => {
      let details: EventDetails = {};

      // First attempt
      details = await fetchEventDetails(event.url);

      // Check if we have actual content (ignoring fromCache flag)
      const hasContent = Object.keys(details).some((k) => k !== "fromCache");

      // Retry once if no content and not from cache (likely failed network/parsing on fresh fetch)
      if (!hasContent && !details.fromCache) {
        console.warn(`Retrying event detail fetch for UID: ${event.uid}`);
        details = await fetchEventDetails(event.url);
      }

      return { uid: event.uid, details };
    });

    const results = await Promise.allSettled(promises);

    // Process results
    results.forEach((result) => {
      if (result.status === "fulfilled") {
        resultsMap.set(result.value.uid, result.value.details);
      } else {
        console.warn(`Failed to enrich event: ${result.reason}`);
      }
    });

    // Check if any request in the batch hit the network
    const anyNetworkHit = results.some((result) => {
      if (result.status === "fulfilled") {
        return !result.value.details.fromCache;
      }
      return true; // Failed requests count as network hits
    });

    // Add delay between batches (except after the last batch) only if we hit the network
    if (i + maxConcurrent < events.length && anyNetworkHit) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  return resultsMap;
};
