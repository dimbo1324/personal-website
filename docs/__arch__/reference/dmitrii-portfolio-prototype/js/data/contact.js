/**
 * Contact details.
 * The phone number is stored in pieces and only assembled when a visitor
 * presses "Show number", so it never appears in the HTML for scrapers.
 */
export const CONTACT = Object.freeze({
  email: "dmitriiprikhodko9@gmail.com",
  timeZone: "America/Montevideo",
  phone: Object.freeze({
    country: "598",
    groups: Object.freeze(["96", "671", "725"]),
  }),
});
