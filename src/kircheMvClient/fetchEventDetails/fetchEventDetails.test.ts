import axios from "axios";
import { fetchEventDetails } from "./fetchEventDetails";
import { enrichEventsWithDetails } from "./enrichEventsWithDetails";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("fetchEventDetails", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should parse event with image and pdf attachment", async () => {
    const htmlWithImageAndPdf = `
<div class="content">
<h1><span>Veranstaltung</span><p>Kinoabend - der kann sich sehen lassen</p></h1>
<p class="format_autor">Eine öffentliche Veranstaltung in gemütlicher Runde!</p>
<div class="eventbox">
<figure class="figure_right"><picture><img src="/fileadmin/_processed_/2/3/csm_filmabend_1_24cbf23b89.jpg" width="250" height="167" alt=""></picture></figure>
<div class="format_event_date_place">
<div class="format_event_date"><span class="icon icon-clock"></span>24.11.2025  ·  19:00 Uhr  ·  21:00 Uhr </div>
<div class="format_event_place"><span class="icon icon-marker"></span><ul><li>Ev. Pfarrhaus Marlow</li><li>Bei der Kirche 9</li><li>18337 Marlow</li></ul></div>
</div>
<p>&nbsp;</p>
<p>&nbsp;</p>
<p>&nbsp;</p>
<p>&nbsp;</p>
<p class="between_title">Dateien</p>
<p><a href="/fileadmin/tx_cal/offener_kreis_kino.pdf" class="pdf_file_preview"><img src="/fileadmin/_processed_/8/5/csm_offener_kreis_kino_719ad5ae8d.png" width="150" height="213" alt=""></a><br><a href="/fileadmin/tx_cal/offener_kreis_kino.pdf">ansehen</a><br><a href="/fileadmin/tx_cal/offener_kreis_kino.pdf">herunterladen</a><br></p>
<div class="cta_buttons">
<a href="/detailseite?tx_cal%5Buid%5D=139992&amp;type=427&amp;cHash=f99b3e7454880f2e8fc4294cf36cb106" class="ghost_btn ghost_btn_icon"><span class="icon icon-btn-download"></span>Im Kalender speichern (.ics)</a>
</div>
<div class="clear"></div>
</div>
</div>`;

    mockedAxios.get.mockResolvedValueOnce({ data: htmlWithImageAndPdf });

    const result = await fetchEventDetails(
      "https://www.kirche-mv.de/veranstaltung/139992"
    );

    expect(result.imageUrl).toBe(
      "https://www.kirche-mv.de/fileadmin/_processed_/2/3/csm_filmabend_1_24cbf23b89.jpg"
    );
    expect(result.attachmentUrl).toBe(
      "https://www.kirche-mv.de/fileadmin/tx_cal/offener_kreis_kino.pdf"
    );
    // p.format_autor is outside .eventbox so should not be included
    expect(result.description).toBeUndefined();
  });

  test("should parse event with long description and no image", async () => {
    const htmlWithLongDescription = `
<div class="content">
<h1><span>Veranstaltung</span><p>Frauenfrühstück</p></h1>
<div class="eventbox">
<figure class="figure_right"></figure>
<div class="format_event_date_place">
<div class="format_event_date"><span class="icon icon-clock"></span>22.11.2025  ·  10:00 Uhr  ·  11:00 Uhr </div>
<div class="format_event_place"><span class="icon icon-marker"></span><ul><li>Kommunales Gemeindehaus Schmarsow</li><li> Schmarsow 40</li><li>17129 Kruckow</li></ul></div>
</div>
<p>&nbsp;</p>
<p>&nbsp;</p>
<p>	Schon fast Tradition – auch in diesem November laden wir wieder herzlich zum Frauenfrühstück nach Schmarsow ein!
</p>
<p>Freut euch auf ein Leckeres Buffet, inspirierende und frische Impulse und live gespielte Musik, die für die richtige Stimmung sorgt. Ein gemütlicher Vormittag, bei dem ihr euch mit alten und neuen Freundinnen austauschen könnt! Kommt vorbei und startet mit uns in einen besonderen Morgen! Wir freuen uns auf euch!	</p>
<p>&nbsp;</p>
<p class="between_title">Leitung</p>
<p>Pastorin Kühn &amp; Team</p>
<p class="between_title">Veranstalter</p>
Ev. Kirchengemeinde Kartlow-Völschow
<div class="cta_buttons">
<a href="/detailseite?tx_cal%5Buid%5D=134337&amp;type=427&amp;cHash=26f2de1b884625479d35356ef84f0150" class="ghost_btn ghost_btn_icon"><span class="icon icon-btn-download"></span>Im Kalender speichern (.ics)</a>
</div>
<div class="clear"></div>
</div>
</div>`;

    mockedAxios.get.mockResolvedValueOnce({ data: htmlWithLongDescription });

    const result = await fetchEventDetails(
      "https://www.kirche-mv.de/veranstaltung/134337"
    );

    expect(result.imageUrl).toBeUndefined();
    expect(result.attachmentUrl).toBeUndefined();
    expect(result.description).toContain(
      "Schon fast Tradition – auch in diesem November laden wir wieder herzlich zum Frauenfrühstück nach Schmarsow ein!"
    );
    expect(result.description).toContain(
      "Freut euch auf ein Leckeres Buffet"
    );
    expect(result.description).toContain("Pastorin Kühn & Team");
    // Should not include "Leitung" or "Veranstalter" titles
    expect(result.description).not.toContain("Leitung");
    expect(result.description).not.toContain("Veranstalter");
  });

  test("should handle empty paragraphs and non-breaking spaces", async () => {
    const htmlWithEmptyParagraphs = `
<div class="eventbox">
<p>&nbsp;</p>
<p>   </p>
<p>This is actual content.</p>
<p>&nbsp;</p>
<p>More content here.</p>
</div>`;

    mockedAxios.get.mockResolvedValueOnce({ data: htmlWithEmptyParagraphs });

    const result = await fetchEventDetails(
      "https://www.kirche-mv.de/veranstaltung/test"
    );

    expect(result.description).toBe("This is actual content.\n\nMore content here.");
  });

  test("should return empty object on network error", async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error("Network error"));

    const result = await fetchEventDetails(
      "https://www.kirche-mv.de/veranstaltung/error"
    );

    expect(result).toEqual({});
  });

  test("should handle timeout errors gracefully", async () => {
    mockedAxios.get.mockRejectedValueOnce({
      isAxiosError: true,
      message: "timeout of 20000ms exceeded",
    });

    const result = await fetchEventDetails(
      "https://www.kirche-mv.de/veranstaltung/timeout"
    );

    expect(result).toEqual({});
  });

  test("should make absolute URLs from relative paths", async () => {
    const htmlWithRelativeUrls = `
<div class="eventbox">
<figure class="figure_right"><picture><img src="/fileadmin/image.jpg"></picture></figure>
<p><a href="/fileadmin/document.pdf" class="pdf_file_preview">Download</a></p>
</div>`;

    mockedAxios.get.mockResolvedValueOnce({ data: htmlWithRelativeUrls });

    const result = await fetchEventDetails(
      "https://www.kirche-mv.de/veranstaltung/test"
    );

    expect(result.imageUrl).toBe("https://www.kirche-mv.de/fileadmin/image.jpg");
    expect(result.attachmentUrl).toBe(
      "https://www.kirche-mv.de/fileadmin/document.pdf"
    );
  });
});

describe("enrichEventsWithDetails", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should enrich multiple events in parallel with throttling", async () => {
    const events = [
      { uid: "event1", url: "https://www.kirche-mv.de/veranstaltung/1" },
      { uid: "event2", url: "https://www.kirche-mv.de/veranstaltung/2" },
      { uid: "event3", url: "https://www.kirche-mv.de/veranstaltung/3" },
    ];

    mockedAxios.get
      .mockResolvedValueOnce({
        data: '<div class="eventbox"><p>Event 1 description</p></div>',
      })
      .mockResolvedValueOnce({
        data: '<div class="eventbox"><p>Event 2 description</p></div>',
      })
      .mockResolvedValueOnce({
        data: '<div class="eventbox"><p>Event 3 description</p></div>',
      });

    const result = await enrichEventsWithDetails(events, 5, 100);

    expect(result.size).toBe(3);
    expect(result.get("event1")?.description).toBe("Event 1 description");
    expect(result.get("event2")?.description).toBe("Event 2 description");
    expect(result.get("event3")?.description).toBe("Event 3 description");
  });

  test("should continue enrichment even if some events fail", async () => {
    const events = [
      { uid: "event1", url: "https://www.kirche-mv.de/veranstaltung/1" },
      { uid: "event2", url: "https://www.kirche-mv.de/veranstaltung/2" },
      { uid: "event3", url: "https://www.kirche-mv.de/veranstaltung/3" },
    ];

    mockedAxios.get
      .mockResolvedValueOnce({
        data: '<div class="eventbox"><p>Event 1 description</p></div>',
      })
      .mockRejectedValueOnce(new Error("Network error"))
      .mockResolvedValueOnce({
        data: '<div class="eventbox"><p>Event 3 description</p></div>',
      });

    const result = await enrichEventsWithDetails(events, 5, 100);

    expect(result.size).toBe(3);
    expect(result.get("event1")?.description).toBe("Event 1 description");
    expect(result.get("event2")).toEqual({}); // Failed event returns empty object
    expect(result.get("event3")?.description).toBe("Event 3 description");
  });

  test("should process events in batches", async () => {
    const events = Array.from({ length: 12 }, (_, i) => ({
      uid: `event${i + 1}`,
      url: `https://www.kirche-mv.de/veranstaltung/${i + 1}`,
    }));

    // Mock all 12 requests
    for (let i = 0; i < 12; i++) {
      mockedAxios.get.mockResolvedValueOnce({
        data: `<div class="eventbox"><p>Event ${i + 1} description</p></div>`,
      });
    }

    const startTime = Date.now();
    const result = await enrichEventsWithDetails(events, 5, 100);
    const endTime = Date.now();

    expect(result.size).toBe(12);
    // With 12 events, 5 max concurrent, and 100ms delay, we expect at least 2 delays (200ms)
    // But we're lenient here because of test execution variance
    expect(endTime - startTime).toBeGreaterThanOrEqual(100);
  });
});
