export const organizerPostfix: string = "www.kirche-mv.de";
export const organizerBaseUrl: string = "https://www.kirche-mv.de/";
export const organizerName: string =
  "Evangelische Kirche in Mecklenburg-Vorpommern";
export const organizerEmail: string = "info@kirche-mv.de";
export const organizerEventIdPrefix: string = "kirchemv-";

export const VTIMEZONE = `X-WR-TIMEZONE:Europe/Berlin
BEGIN:VTIMEZONE
TZID:Europe/Berlin
X-LIC-LOCATION:Europe/Berlin
BEGIN:DAYLIGHT
TZOFFSETFROM:+0100
TZOFFSETTO:+0200
TZNAME:GMT+2
DTSTART:19700329T020000
RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU
END:DAYLIGHT
BEGIN:STANDARD
TZOFFSETFROM:+0200
TZOFFSETTO:+0100
TZNAME:GMT+1
DTSTART:19701025T030000
RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU
END:STANDARD
END:VTIMEZONE`;