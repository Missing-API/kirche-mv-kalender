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

  // build rich description with enriched data
  let descriptionText = fixMissingSpaces(cleanString(cleanSpaces(input.summary)));
  
  // Add detailed description if available
  if (input.detailedDescription) {
    descriptionText = input.detailedDescription;
  }
  
  const textWithData: TextWithData = {
    description: descriptionText,
    url: input?.url?.trim(),
    tags: ["Kirche", ...category.name.split("/")],
    scopes: [category.scope],
  };
  let optimisedDescription: string = dataToText(textWithData);
  
  // Append image URL to description if available
  if (input.imageUrl) {
    optimisedDescription += `\n\nBild: ${input.imageUrl}`;
  }
  
  // Append attachment URL to description if available
  if (input.attachmentUrl) {
    optimisedDescription += `\n\nAnhang: ${input.attachmentUrl}`;
  }

  // re-format address strings
  // TODO: extract to separate function with test
  let optimisedLocation = fixLocationString(input.location);

  // re-format dates
  let icsStartDate: number[] = getIcsDate(input.start);
  let icsEndDate: number[] = getIcsDate(input.end);

  if (new Date(input.end) < new Date(input.start)) {
    // omg - they really messed up the dates
    // it's for real in august 2024
    console.warn("Start is after end! We will switch dates, but how creapy is that?");
     icsStartDate = getIcsDate(input.end);
     icsEndDate = getIcsDate(input.start);
  }

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
    productId: organizerName + ": " + category.name,
  };

  return icsEvent;
};
