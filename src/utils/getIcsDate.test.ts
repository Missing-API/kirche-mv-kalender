import { getIcsDate } from "./getIcsDate";

describe("should create a number array for ics date", () => {
  test("date to number array", () => {
    const dateString: any = "2023-04-03T16:30:00.000Z"; // 2023-03-12T08:00:00.000Z { tz: 'Etc/UTC' }
    expect(getIcsDate(dateString)).toEqual([2023, 4, 3, 18, 30]);
  });
});
