/**
 * True when the visitor asked not to be tracked: Do Not Track or
 * Global Privacy Control. Analytics stays completely off in that case.
 *
 * @param {Navigator & { globalPrivacyControl?: boolean, msDoNotTrack?: string }} [nav]
 * @param {Window & { doNotTrack?: string }} [win]
 */
export function visitorOptedOut(nav = navigator, win = window) {
  const dnt = nav.doNotTrack ?? win.doNotTrack ?? nav.msDoNotTrack;
  return dnt === "1" || dnt === "yes" || nav.globalPrivacyControl === true;
}
