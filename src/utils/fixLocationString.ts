import { cleanString } from "./cleanString";

export const fixLocationString = (inputString: string): string => {
  let clearString: string = inputString;
  if (clearString.substring(0, 1) === "*")
    clearString = clearString.substring(1); // remove leading *
  clearString = clearString.replaceAll("*", ","); // replace * with ,
  clearString = cleanString(clearString).trim();
  clearString = clearString.replaceAll(" ,", ",");
  return clearString;
};
