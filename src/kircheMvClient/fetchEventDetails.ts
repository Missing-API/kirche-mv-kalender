import axios from "axios";
import * as cheerio from "cheerio";

export interface EventDetails {
  description?: string;
  imageUrl?: string;
  attachmentUrl?: string;
}

/**
 * Fetches and parses event detail page from kirche-mv.de
 * @param detailUrl - The URL of the event detail page
 * @param timeout - Request timeout in milliseconds (default: 20000)
 * @returns EventDetails object with scraped information
 */
export const fetchEventDetails = async (
  detailUrl: string,
  timeout: number = 20000
): Promise<EventDetails> => {
  try {
    const { data } = await axios.get<string>(detailUrl, {
      timeout,
      headers: {
        "User-Agent": "kirche-mv-kalender-middleware/1.0",
      },
    });

    const $ = cheerio.load(data);
    const details: EventDetails = {};

    // Extract image URL from eventbox > figure > picture > img
    const imageElement = $(".eventbox figure.figure_right picture img");
    if (imageElement.length > 0) {
      const imgSrc = imageElement.attr("src");
      if (imgSrc) {
        // Make absolute URL if relative
        details.imageUrl = imgSrc.startsWith("http")
          ? imgSrc
          : `https://www.kirche-mv.de${imgSrc}`;
      }
    }

    // Extract attachment URL from eventbox > a.pdf_file_preview
    const attachmentElement = $(".eventbox a.pdf_file_preview");
    if (attachmentElement.length > 0) {
      const attachmentHref = attachmentElement.attr("href");
      if (attachmentHref) {
        // Make absolute URL if relative
        details.attachmentUrl = attachmentHref.startsWith("http")
          ? attachmentHref
          : `https://www.kirche-mv.de${attachmentHref}`;
      }
    }

    // Extract description from <p> tags
    // Include p.format_autor (before eventbox) and content paragraphs within eventbox
    const paragraphs: string[] = [];
    
    // Get p.format_autor if present
    const formatAutorText = $("p.format_autor")
      .text()
      .trim()
      .replace(/\u00A0/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    if (formatAutorText) {
      paragraphs.push(formatAutorText);
    }
    
    // Get paragraphs from eventbox, but exclude special sections
    $(".eventbox p").each((_, elem) => {
      const $elem = $(elem);
      const text = $elem
        .text()
        .trim()
        .replace(/\u00A0/g, " ") // Replace non-breaking spaces
        .replace(/\s+/g, " ") // Normalize whitespace
        .trim();

      // Skip empty paragraphs and those with class names that indicate non-content
      const hasClassToSkip = $elem.hasClass("between_title");
      
      // Skip if inside the CTA buttons
      const isInsideCta = $elem.closest(".cta_buttons").length > 0;
      
      // Skip if paragraph only contains links (like "ansehen" / "herunterladen")
      const onlyContainsLinks = $elem.children("a").length > 0 && $elem.text().trim() === $elem.children("a").text().trim();
      
      if (text && text.length > 0 && !hasClassToSkip && !isInsideCta && !onlyContainsLinks) {
        paragraphs.push(text);
      }
    });

    if (paragraphs.length > 0) {
      details.description = paragraphs.join("\n\n");
    }

    return details;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.warn(
        `Failed to fetch event details from ${detailUrl}: ${error.message}`
      );
    } else {
      console.warn(`Unexpected error fetching event details: ${error}`);
    }
    // Return empty details on error - enrichment is optional
    return {};
  }
};

/**
 * Enriches multiple events with detail page information in parallel with throttling
 * @param events - Array of events with UID and URL
 * @param maxConcurrent - Maximum number of concurrent requests (default: 5)
 * @param delayMs - Delay between batches in milliseconds (default: 2000)
 * @returns Map of UID to EventDetails
 */
export const enrichEventsWithDetails = async (
  events: Array<{ uid: string; url: string }>,
  maxConcurrent: number = 5,
  delayMs: number = 2000
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

      // Retry once if first attempt returned empty details (likely failed)
      if (
        !details.description &&
        !details.imageUrl &&
        !details.attachmentUrl
      ) {
        console.log(`Retrying event detail fetch for UID: ${event.uid}`);
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

    // Add delay between batches (except after the last batch)
    if (i + maxConcurrent < events.length) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  return resultsMap;
};
