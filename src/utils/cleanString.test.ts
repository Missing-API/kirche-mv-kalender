import { cleanString } from "./cleanString";

describe("should clean up a string", () => {
  test("spaces", () => {
    expect(cleanString("Lorem  Ipsum")).toEqual("Lorem Ipsum");
    expect(cleanString("Lorem  Ipsum  Lorem")).toEqual("Lorem Ipsum Lorem");
    expect(cleanString("Lorem Ipsum")).toEqual("Lorem Ipsum");
    expect(cleanString("Lorem  Ipsum")).toEqual("Lorem Ipsum");
    expect(cleanString("Lorem   Ipsum")).toEqual("Lorem Ipsum");
  });
  test("trim", () => {
    expect(cleanString(" Lorem Ipsum")).toEqual("Lorem Ipsum");
    expect(cleanString("Lorem Ipsum ")).toEqual("Lorem Ipsum");
  });
  test("tabs", () => {
    expect(cleanString(" Lorem Ipsum")).toEqual("Lorem Ipsum");
    expect(cleanString("Lorem Ipsum ")).toEqual("Lorem Ipsum");
    expect(cleanString("Lorem Ipsum")).toEqual("Lorem Ipsum");
    expect(cleanString("Lorem\tIpsum")).toEqual("Lorem Ipsum");
  });
  test("line breaks", () => {
    expect(cleanString("Lorem\nIpsum")).toEqual("Lorem Ipsum");
    expect(cleanString("Lorem\n\rIpsum ")).toEqual("Lorem Ipsum");
    expect(cleanString("Lorem\r\nIpsum")).toEqual("Lorem Ipsum");
  });
});
