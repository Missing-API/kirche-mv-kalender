import {
  cleanSpaces,
  dataToText,
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
import { fixLocationString } from "./utils/fixLocationString";
import { fixMissingSpaces } from "./utils/fixMissingSpaces";
import { getIcsDate } from "./utils/getIcsDate";

export const mapKircheMvEventToIcsEvent = (
  input: TIcsEvent,
  category: ICategory
): TIcsEventWrite => {
  // reformat summary
  let optimizedSummary: string = cleanString(cleanSpaces(input.summary));
  optimizedSummary = fixMissingSpaces(optimizedSummary);

  // build rich description
  const textWithData: TextWithData = {
    description: fixMissingSpaces(cleanString(cleanSpaces(input.summary))),
    url: input?.url?.trim(),
    tags: ["Kirche", category.name],
    scopes: [category.scope],
  };
  const optimisedDescription: string = dataToText(textWithData);

  // re-format address strings
  // TODO: extract to separate function with test
  let optimisedLocation = fixLocationString(input.location);

  // re-format dates
  const icsStartDate: number[] = getIcsDate(input.start);
  const icsEndDate: number[] = getIcsDate(input.end);

  // fix organizer name
  const optimizedOrganizerName: string = (input.organizer || organizerName)
    .replaceAll(",", " ")
    .trim();

  const icsEvent: TIcsEventWrite = {
    uid: organizerEventIdPrefix + input.uid,
    location: optimisedLocation,
    title: optimizedSummary,
    description: optimisedDescription,
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
    categories: ["Kirche", ...category.name.split("/")],
    productId: organizerName + ": " + category,
  };

  return icsEvent;
};
