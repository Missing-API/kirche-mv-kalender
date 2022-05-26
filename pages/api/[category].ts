import type { NextApiRequest, NextApiResponse } from "next";
import { Categories, ICategory } from "../../src/categories";
import { TIcsEvent, TIcsEventWrite } from "../../src/event";
import { getEventsFromIcsUrl } from "../../src/kircheMvClient/getEventsFromIcsUrl";
import { getIcsUrlByCategory } from "../../src/kircheMvClient/getIcsUrlByCategory";
import { mapKircheMvEventToIcsEvent } from "../../src/mapKircheMvEventToIcsEvent";
const ics = require("ics");

/**
 * @swagger
 * /api/{category}.ics:
 *   get:
 *     summary: Gets an event feed as ics for the given category.
 *     description: Fetches data from kirche-mv.de and returns an optimised event feed as ics.
 *     tags:
 *       - Events
 *     produces:
 *       - text/calendar
 *     parameters:
 *       - name: category
 *         description: >
 *            Event category as one of the following values
 *            * alle
 *            * bildung-kultur
 *            * ehrenamt
 *            * gemeindeleben
 *            * gottesdienste
 *            * konzerte-musik
 *            * sitzungen-gremien
 *            * sonstige
 *         in: path
 *         required: true
 *         type: string
 *         enum:
 *            - alle
 *            - bildung-kultur
 *            - ehrenamt
 *            - gemeindeleben
 *            - gottesdienste
 *            - konzerte-musik
 *            - sitzungen-gremien
 *            - sonstige
 *         default: "alle"
 *     responses:
 *       200:
 *         description: ICS event feed.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  // check for incoming parameter
  const { category } = req.query;
  if (category.includes(".ics") === false) {
    res.status(400).json({
      status: 400,
      message: "Bad request. Please use a proper category ics filename.",
    });
  }

  // check for valid slug
  const categorySlug: string = (category as string).split(".")[0];
  if (Categories.filter((c) => c.slug === categorySlug).length !== 1) {
    res.status(404).json({
      status: 404,
      message: "Given category ics filename does not exist.",
    });
  }

  console.debug(`incoming category slug: ${categorySlug}`);

  const currentCategory: ICategory = Categories.filter(
    (c) => c.slug === categorySlug
  )[0];

  if (!currentCategory) {
    console.warn(`no category found for slug: ${categorySlug}`);
  } else {
    console.debug(`use external category id: ${currentCategory.externalId}`);
  }

  // fetch html from kirche-mv.de
  const icsUrl: string = await getIcsUrlByCategory(currentCategory.externalId);
  if (!icsUrl) {
    console.error(
      `no ics url found for category: ${currentCategory.externalId}`
    );
  }

  // fetch events from kirche-mv.de
  const events: object[] = await getEventsFromIcsUrl(icsUrl);

  const mappedEvents: TIcsEventWrite[] = events.map((event: any) => {
    return mapKircheMvEventToIcsEvent(event, currentCategory.name);
  });

  // create ics format
  const icsBody = ics.createEvents(mappedEvents);

  console.debug(`icsBody: ${icsBody}`);

  // console.debug(mappedEvents);
  // res.status(200).json({
  //   status: 200,
  //   events: mappedEvents,
  // });

  res.setHeader("Content-Type", "application/calendar; charset=utf8");
  // res.setHeader("Content-Type", "text/plain; charset=utf8");
  res.setHeader("Cache-Control", "s-maxage=86400, stale-while-revalidate");
  res.status(200).send(icsBody.value);
}
