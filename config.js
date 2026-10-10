// Edit this file to set the site name and the restaurants it lists.
// Hours use 24-hour "HH:MM" format. Leave a day as [] if the restaurant is closed all day.
// A day can have several ranges, e.g. [["12:00", "15:00"], ["19:00", "23:00"]].
// For hours past midnight use a close time after midnight, e.g. [["18:00", "02:00"]].
// address, phone, cuisine and timeZone are optional per restaurant.
window.CONFIG = {
  siteName: "Azlan Foods",
  tagline: "See which of our restaurants are open right now.",
  timeZone: "Asia/Karachi", // default for every restaurant; any IANA zone, e.g. "Europe/London"

  restaurants: [
    {
      name: "Azlan Foods",
      cuisine: "Pakistani · Grill",
      address: "Add your address here",
      phone: "",
      hours: {
        monday:    [["12:00", "23:00"]],
        tuesday:   [["12:00", "23:00"]],
        wednesday: [["12:00", "23:00"]],
        thursday:  [["12:00", "23:00"]],
        friday:    [["14:00", "00:30"]],
        saturday:  [["12:00", "00:30"]],
        sunday:    [["12:00", "23:00"]],
      },
    },
    {
      name: "Restaurant Two",
      cuisine: "Example — edit in config.js",
      address: "",
      phone: "",
      hours: {
        monday:    [["08:00", "16:00"]],
        tuesday:   [["08:00", "16:00"]],
        wednesday: [["08:00", "16:00"]],
        thursday:  [["08:00", "16:00"]],
        friday:    [["08:00", "12:30"], ["14:30", "16:00"]],
        saturday:  [["09:00", "14:00"]],
        sunday:    [],
      },
    },
    {
      name: "Restaurant Three",
      cuisine: "Example — edit in config.js",
      address: "",
      phone: "",
      hours: {
        monday:    [],
        tuesday:   [["18:00", "02:00"]],
        wednesday: [["18:00", "02:00"]],
        thursday:  [["18:00", "02:00"]],
        friday:    [["18:00", "03:00"]],
        saturday:  [["18:00", "03:00"]],
        sunday:    [["18:00", "01:00"]],
      },
    },
  ],
};
