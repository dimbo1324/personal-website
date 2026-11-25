import type { RemoteImageId } from "../remoteImages";

// Lists the remote (Unsplash) images committed under public/assets/images/remote/,
// so the site serves them locally instead of from images.unsplash.com.
export const LOCAL_IMAGES: readonly RemoteImageId[] = Object.freeze([
  "hero-plant",
  "hero-pcb",
  "server-room",
  "control-cabinet",
  "embedded-board",
  "panel-wiring",
]);
