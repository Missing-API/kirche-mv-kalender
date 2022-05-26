import { url } from "inspector";
import {
  organizerBaseUrl,
  organizerEmail,
  organizerEventIdPrefix,
  organizerName,
} from "./constants";
import { TIcsEvent, TIcsEventWrite } from "./event";

export const mapKircheMvEventToIcsEvent = (
  input: TIcsEvent,
  category: string
): TIcsEventWrite => {
  // reformat summary
  let optimizedSummary: string = input.summary;
  optimizedSummary = optimizedSummary.trim();
  optimizedSummary = optimizedSummary.replaceAll("  ", " ");

  // refrormate description text
  let optimizedDescription: string = input.description;
  optimizedDescription = optimizedDescription.replace(/\n/g, " ");
  optimizedDescription = optimizedDescription.replaceAll("  ", " ");
  if (input.url)
    optimizedDescription += `\n\nLink: ${input.url.trim()} #${category}`;
  optimizedDescription = optimizedDescription.trim();

  // reformat address strings
  let optimisedLocation = input.location;
  if (optimisedLocation.substring(0, 1) === "*")
    optimisedLocation = optimisedLocation.substring(1);
  optimisedLocation = optimisedLocation.replaceAll("\n", " ");
  optimisedLocation = optimisedLocation.replaceAll("*", ",");
  optimisedLocation = optimisedLocation.replaceAll("  ", " ");
  optimisedLocation = optimisedLocation.replaceAll(" ,", ",");
  optimisedLocation = optimisedLocation.trim();

  // reformat dates
  const startDate: Date = new Date(input.start);
  const icsStartDate = [
    startDate.getFullYear(),
    startDate.getMonth() + 1,
    startDate.getDate(),
    startDate.getHours(),
    startDate.getMinutes(),
  ];

  const endDate: Date = new Date(input.end);
  const icsEndDate = [
    endDate.getFullYear(),
    endDate.getMonth() + 1,
    endDate.getDate(),
    endDate.getHours(),
    endDate.getMinutes(),
  ];

  const icsEvent: TIcsEventWrite = {
    uid: organizerEventIdPrefix + input.uid,
    location: optimisedLocation,
    title: optimizedSummary,
    description: optimizedDescription,
    start: icsStartDate,
    startInputType: "local",
    end: icsEndDate,
    endInputType: "local",
    url: input.url.includes(organizerBaseUrl) ? input.url.trim() : "",
    // geo: input.geo || undefined,
    // class: input.class || "PUBLIC",
    method: input.method || "PUBLISH",
    organizer: {
      name: input?.organizer?.trim() || organizerName,
      email: organizerEmail,
    },
    categories: [category],
    productId: organizerName + ": " + category,
  };

  return icsEvent;
};
