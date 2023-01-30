import { fixLocationString } from "./fixLocationString";

describe("should clean up a location string", () => {
  test("spaces", () => {
    const locationString: string =
      "* Pfarrhaus Schwaan\n* Schulstraße 12\n * 18258 Schwaan";
    expect(fixLocationString(locationString)).toEqual(
      "Pfarrhaus Schwaan, Schulstraße 12, 18258 Schwaan"
    );
  });
});
