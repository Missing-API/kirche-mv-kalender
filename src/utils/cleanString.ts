export const cleanString = (inputString: string): string => {
  let clearString: string = inputString;
  clearString = clearString.replaceAll(" ", " ");
  clearString = clearString.replace(/\n/g, " ");
  clearString = clearString.replace(/\r/g, " ");
  clearString = clearString.replace(/\t/g, " ");
  clearString = clearString.replaceAll("  ", " ");
  clearString = clearString.replaceAll("  ", " ");
  clearString = clearString.trim();
  return clearString;
};
