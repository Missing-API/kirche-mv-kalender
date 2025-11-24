import axios from "axios";
import { setupCache, buildMemoryStorage, AxiosCacheInstance } from "axios-cache-interceptor";
import ical from "node-ical";

const ONE_DAY = 24 * 60 * 60 * 1000;
const TEN_MINUTES = 10 * 60 * 1000;

const globalForAxios = global as unknown as { axiosIcsClient: AxiosCacheInstance | undefined };

if (!globalForAxios.axiosIcsClient) {
  console.log("Initializing global axiosIcsClient");
  globalForAxios.axiosIcsClient = setupCache(axios.create(), {
    storage: buildMemoryStorage(),
    ttl: ONE_DAY,
    staleIfError: TEN_MINUTES,
    cachePredicate: {
      statusCheck: (status) => status === 200,
    },
    headerInterpreter: () => ONE_DAY,
  });
}

const axiosIcsClient = globalForAxios.axiosIcsClient;

export const getEventsFromIcsUrl = async (
  icsUrl: string
): Promise<object[] | any> => {
  // query kirche-mv.de
  try {
    const response = await axiosIcsClient.get<any>(icsUrl.toString());

    if (response.status !== 200) {
      console.warn(`Unexpected ICS status ${response.status}`);
      return [];
    }
    const data = response.data;

    var dataLines: string[] = data.split("\n");
    var newDataLines: string[] = [];

    for (var i = 0; i < dataLines.length; i++) {
      var myLine = dataLines[i].toString().trim();
      const substrs: string[] = [
        "SUMMARY:",
        "BEGIN:",
        "END:",
        "DTSTART:",
        "DTEND:",
        "LOCATION:",
        "DESCRIPTION:",
        "URL:",
        "UID:",
        "DTSTAMP:",
        "DESCRIPTION:",
        "CATEGORIES:",
        "CLASS:",
        "GEO:",
        "METHOD:",
        "ORGANIZER:",
        "VERSION:",
        "PRODID:",
        "TZID:",
        "TZURL:",
        "X-LIC-LOCATION:",
        "TZOFFSETFROM:",
        "TZOFFSETTO:",
        "TZNAME:",
        "RRULE:",
      ];
      const regexp = new RegExp("^(" + substrs.join("|") + ")");
      if (!regexp.test(dataLines[i])) {
        myLine = "\t" + myLine;
      }
      const allowedLineEnds: string[] = [
        "89812",
        "PUBLISH",
        "VEVENT",
        "VCALENDAR",
      ];
      const excludedLineBeginnings: string[] = [
        "GEO:",
        "METHOD:",
        "DTSTART:",
        "DTEND:",
        "CLASS:",
        "URL:",
        "UID:",
        "DTSTAMP:",
        "BEGIN:",
        "END:",
        "ORGANIZER:",
      ];
      const regexpEnd = new RegExp("(" + allowedLineEnds.join("|") + ")$");
      const regexpExclude = new RegExp(
        "^(" + excludedLineBeginnings.join("|") + ")"
      );
      if (!regexpEnd.test(dataLines[i]) && !regexpExclude.test(dataLines[i])) {
        myLine = myLine + " ";
      }
      if (myLine.trim() !== "") newDataLines.push(myLine);
    }

    const fixedData = newDataLines.join("\r\n");
    const icsEvents = ical.sync.parseICS(fixedData);
    let eventsArray: object[] = [];
    const onlyEvents = Object.values(icsEvents).map((event: any) => {
      if (event.type === "VEVENT") {
        eventsArray.push(event);
      }
    });

    return eventsArray;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.warn("error message: ", error.message);
    } else {
      console.warn("unexpected error: ", error);
    }
    return [];
  }
};
