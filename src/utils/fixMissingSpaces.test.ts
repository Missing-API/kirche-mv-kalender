import { fixMissingSpaces } from "./fixMissingSpaces";

describe("should replace a lowercase/uppercase sequence with a separater", () => {
  test("positive cases", () => {
    expect(fixMissingSpaces("LoremIpsum")).toEqual("Lorem - Ipsum");
  });
  test("Umlaute", () => {
    expect(fixMissingSpaces("LoremÄpsum")).toEqual("Lorem - Äpsum");
    expect(fixMissingSpaces("LoremÖpsum")).toEqual("Lorem - Öpsum");
    expect(fixMissingSpaces("LoremÜpsum")).toEqual("Lorem - Üpsum");
    expect(fixMissingSpaces("LoreäIpsum")).toEqual("Loreä - Ipsum");
    expect(fixMissingSpaces("LoreöIpsum")).toEqual("Loreö - Ipsum");
    expect(fixMissingSpaces("LoreüIpsum")).toEqual("Loreü - Ipsum");
    expect(fixMissingSpaces("LoreßIpsum")).toEqual("Loreß - Ipsum");
  });

  test("set characters", () => {
    expect(fixMissingSpaces("Lorem!Ipsum")).toEqual("Lorem! - Ipsum");
    expect(fixMissingSpaces("Lorem?Ipsum")).toEqual("Lorem? - Ipsum");
    expect(fixMissingSpaces("Lorem.Ipsum")).toEqual("Lorem. - Ipsum");
  });

  test("non matching cases", () => {
    expect(fixMissingSpaces("Lorem Ipsum")).toEqual("Lorem Ipsum");
    expect(fixMissingSpaces("Lorem")).toEqual("Lorem");
  });

  test("edge cases", () => {
    expect(fixMissingSpaces("")).toEqual("");
  });
});
