export const fixIcsDate = (inputString: string): string => {
    let fixedIceDate: string = inputString;
    /*
        replace 
        "DTSTART:20240815T200000Z" with "DTSTART;TZID=Europe/Berlin:20240815T200000" 
        and replace
        "DTEND:20240815T200000Z" with "DTEND;TZID=Europe/Berlin:20240815T200000" 
    */
    const rexExpStart = /DTSTART:(\d{8})T(\d{6})Z/g;
    fixedIceDate = fixedIceDate.replace(rexExpStart, "DTSTART;TZID=Europe/Berlin:$1T$2");

    const rexExpEnd = /DTEND:(\d{8})T(\d{6})Z/g;
    fixedIceDate = fixedIceDate.replace(rexExpEnd, "DTEND;TZID=Europe/Berlin:$1T$2");

    return fixedIceDate;
};


