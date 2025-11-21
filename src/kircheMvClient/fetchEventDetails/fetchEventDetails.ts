import axios from "axios";
import * as cheerio from "cheerio";
import { EventDetails } from "./types";

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
    // Return empty details on error - enrichment is optional
    return {};
  }
};
