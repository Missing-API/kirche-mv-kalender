const replace = (match: string): string => {
  if (match.length === 2) {
    return match[0] + " - " + match[1];
  } else {
    return match;
  }
};

export const fixMissingSpaces = (inputString: string): string => {
  const regex = /([a-z|ä|ö|ü|ß|!|?|.][A-Z|Ä|Ö|Ü])/gm;
  if (regex.test(inputString) === true) {
    return inputString.replace(regex, replace);
  } else {
    return inputString;
  }
};
