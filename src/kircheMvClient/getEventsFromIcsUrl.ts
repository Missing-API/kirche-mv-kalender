import axios from "axios";
import ical from "node-ical";

export const getEventsFromIcsUrl = async (
  icsUrl: string
): Promise<object[] | any> => {
  // query kirche-mv.de
  try {
    const { data } = await axios.get<any>(icsUrl.toString());

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
      console.log("error message: ", error.message);
      // 👇️ error: AxiosError<any, any>
      return error.message;
    } else {
      console.log("unexpected error: ", error);
      return "An unexpected error occurred";
    }
  }
};
