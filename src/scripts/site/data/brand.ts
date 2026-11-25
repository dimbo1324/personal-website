export interface BrandName {
  readonly name: string;
  readonly hint: string;
}

/** Name variants the brand mark cycles through on click. */
export const BRAND_NAMES: readonly BrandName[] = Object.freeze([
  { name: "Dmitrii Prikhodko", hint: "OT · IIoT · Software" },
  { name: "Дмитрий Приходько", hint: "Инженер АСУ ТП" },
  { name: "Dmitri Prijodko", hint: "Ingeniero · Montevideo" },
]);
