// Edit this file to set your business name, time zone and opening hours.
// Hours use 24-hour "HH:MM" format. Leave a day as [] if you're closed all day.
// A day can have several ranges, e.g. [["09:00", "12:00"], ["13:00", "17:00"]].
// For overnight hours use a close time past midnight, e.g. [["18:00", "02:00"]].
window.CONFIG = {
  businessName: "My Business",
  timeZone: "Asia/Karachi", // any IANA zone, e.g. "Europe/London", "America/New_York"
  hours: {
    monday:    [["09:00", "17:00"]],
    tuesday:   [["09:00", "17:00"]],
    wednesday: [["09:00", "17:00"]],
    thursday:  [["09:00", "17:00"]],
    friday:    [["09:00", "12:30"], ["14:30", "17:00"]],
    saturday:  [["10:00", "14:00"]],
    sunday:    [],
  },
};
