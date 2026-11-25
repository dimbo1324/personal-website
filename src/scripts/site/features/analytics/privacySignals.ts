interface PrivacyNavigator extends Navigator {
  readonly globalPrivacyControl?: boolean;
  readonly msDoNotTrack?: string;
}

interface PrivacyWindow extends Window {
  readonly doNotTrack?: string;
}

export function visitorOptedOut(
  nav: PrivacyNavigator = navigator as PrivacyNavigator,
  win: PrivacyWindow = window as PrivacyWindow,
): boolean {
  const dnt = nav.doNotTrack ?? win.doNotTrack ?? nav.msDoNotTrack;
  return dnt === "1" || dnt === "yes" || nav.globalPrivacyControl === true;
}
