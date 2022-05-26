import axios from "axios";
import { organizerBaseUrl } from "../constants";
const cheerio = require("cheerio");

export const getIcsUrlByCategory = async (categoryId: number): Promise<any> => {
  const eventPageUrl = new URL(`${organizerBaseUrl}aktuell/veranstaltungen`);
  // set category id
  eventPageUrl.searchParams.append(
    "tx_cal_controller[category]",
    categoryId.toString()
  );

  eventPageUrl.searchParams.append("no_cache", "1");

  // set from date
  const today: Date = new Date();
  const todayAsString: string = today.toLocaleDateString("de-de", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  eventPageUrl.searchParams.append(
    "tx_cal_controller[start_day]",
    todayAsString
  );
  // set end date
  const inThreeMonths: Date = new Date();
  inThreeMonths.setMonth(inThreeMonths.getMonth() + 3);
  const inThreeMonthsAsString: string = inThreeMonths.toLocaleDateString(
    "de-de",
    { day: "2-digit", month: "2-digit", year: "numeric" }
  );
  eventPageUrl.searchParams.append(
    "tx_cal_controller[end_day]",
    inThreeMonthsAsString
  );

  console.debug("event page url: " + eventPageUrl.toString());
  // query kirche-mv.de
  try {
    const { data } = await axios.get<any>(eventPageUrl.toString());
    const $ = cheerio.load(data);
    const icsLink: string = $(
      ".export_dropdown a[title='Formatierte Daten zB für einen Import in einen Kalender']"
    ).attr("href");

    const icsUrl: URL = new URL(organizerBaseUrl + icsLink);
    console.debug("ics url: " + icsUrl.toString());
    return icsUrl.toString();
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
