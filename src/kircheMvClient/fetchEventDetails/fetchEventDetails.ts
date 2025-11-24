import axios from "axios";
import { setupCache, buildMemoryStorage, AxiosCacheInstance } from "axios-cache-interceptor";
import * as cheerio from "cheerio";
import { EventDetails } from "./types";

const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;
const TEN_MINUTES = 10 * 60 * 1000;

const globalForAxios = global as unknown as { axiosDetailClient: AxiosCacheInstance | undefined };

if (!globalForAxios.axiosDetailClient) {
  console.log("Initializing global axiosDetailClient");
  globalForAxios.axiosDetailClient = setupCache(axios.create(), {
    storage: buildMemoryStorage(),
    ttl: ONE_WEEK,
    staleIfError: TEN_MINUTES,
    cachePredicate: {
      statusCheck: (status) => status === 200,
    },
    headerInterpreter: () => ONE_WEEK,
  });
}

const axiosDetailClient = globalForAxios.axiosDetailClient;

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
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await axiosDetailClient.get<string>(detailUrl, {
      timeout,
      signal: controller.signal,
      headers: {
        "User-Agent": "kirche-mv-kalender-middleware/1.0",
      },
    });

    console.debug(
      `fetchEventDetails ${detailUrl} cache=${response.cached ? "hit" : "miss"}`
    );

    const data = response.data;

    const $ = cheerio.load(data);
    const details: EventDetails = {
      fromCache: !!response.cached,
    };

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

    // Extract description from <p> tags within eventbox only
    const paragraphs: string[] = [];
    
    // Get paragraphs from eventbox, but exclude special sections
    $(".eventbox p").each((_, elem) => {
      const $elem = $(elem);
      let text = $elem
        .text()
        .trim();
      
      // Normalize line breaks and whitespace
      text = text
        .replace(/\r\n/g, "\n") // Normalize Windows line breaks
        .replace(/\r/g, "\n")   // Normalize Mac line breaks
        .replace(/\u00A0/g, " ") // Replace non-breaking spaces
        .replace(/ +/g, " ")     // Collapse multiple spaces
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
    return {};
  } finally {
    clearTimeout(timer);
  }
};
