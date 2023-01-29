import {
  cleanSpaces,
  dataToHtml,
  TextWithData,
} from "@schafevormfenster/data-text-mapper/dist";
import { ICategory } from "./categories";
import {
  organizerBaseUrl,
  organizerEmail,
  organizerEventIdPrefix,
  organizerName,
} from "./constants";
import { TIcsEvent, TIcsEventWrite } from "./event";
import { cleanString } from "./utils/cleanString";
import { fixMissingSpaces } from "./utils/fixMissingSpaces";

export const mapKircheMvEventToIcsEvent = (
  input: TIcsEvent,
  category: ICategory
): TIcsEventWrite => {
  // reformat summary
  let optimizedSummary: string = cleanString(cleanSpaces(input.summary));
  optimizedSummary = fixMissingSpaces(optimizedSummary);

  // build rich description
  const textWithData: TextWithData = {
    description: cleanString(cleanSpaces(input.summary)),
    url: input?.url?.trim(),
    tags: [category.name],
    scopes: [category.scope],
  };
  const htmlDescription: string = dataToHtml(textWithData);

  // re-format address strings
  // TODO: extract to separate function with test
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

  // fix organizer name
  let optimizedOrganizerName = input.organizer || organizerName;
  optimizedOrganizerName = optimizedOrganizerName.replaceAll(",", " ");
  optimizedOrganizerName = optimizedOrganizerName.trim();

  const icsEvent: TIcsEventWrite = {
    uid: organizerEventIdPrefix + input.uid,
    location: optimisedLocation,
    title: optimizedSummary,
    description: htmlDescription,
    start: icsStartDate,
    startInputType: "local",
    end: icsEndDate,
    endInputType: "local",
    url: input.url.includes(organizerBaseUrl) ? input.url.trim() : "",
    // geo: input.geo || undefined,
    // class: input.class || "PUBLIC",
    method: input.method || "PUBLISH",
    organizer: {
      name: optimizedOrganizerName,
      email: organizerEmail,
    },
    categories: [category.name],
    productId: organizerName + ": " + category,
  };

  return icsEvent;
};
