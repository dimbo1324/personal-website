import { LOCAL_IMAGES } from "../../../data/generated/localImages";
import type { RemoteImageId } from "../../../data/remoteImages";
import { REMOTE_IMAGES, REMOTE_WIDTHS } from "../../../data/remoteImages";

export interface ImageDescriptor {
  readonly src: string;
  readonly srcset: string;
  readonly remote: boolean;
}

export interface LocalImageSizes {
  readonly full: number;
  readonly widths?: readonly number[];
}

export interface RemoteImageOptions {
  readonly local?: readonly RemoteImageId[];
  readonly widths?: readonly number[];
}

const IMAGES_DIR = "/assets/images";

export function localImage(name: string, { full, widths = [] }: LocalImageSizes): ImageDescriptor {
  const src = `${IMAGES_DIR}/${name}.webp`;
  const srcset = [
    ...widths.map((width) => `${IMAGES_DIR}/${name}-${width}.webp ${width}w`),
    `${src} ${full}w`,
  ].join(", ");
  return Object.freeze({ src, srcset, remote: false });
}

export function unsplashUrl(photoId: string, width: number): string {
  return `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=${width}&q=75`;
}

export function remoteImage(
  id: RemoteImageId,
  { local = LOCAL_IMAGES, widths = REMOTE_WIDTHS }: RemoteImageOptions = {},
): ImageDescriptor {
  const photoId = REMOTE_IMAGES[id];
  if (!photoId) throw new Error(`Unknown remote image "${id}"`);
  const largest = widths.at(-1);
  if (largest === undefined) throw new Error(`No widths configured for remote image "${id}"`);

  if (local.includes(id)) {
    const path = (width: number): string => `${IMAGES_DIR}/remote/${id}-${width}.webp`;
    return Object.freeze({
      src: path(largest),
      srcset: widths.map((width) => `${path(width)} ${width}w`).join(", "),
      remote: false,
    });
  }

  return Object.freeze({
    src: unsplashUrl(photoId, largest),
    srcset: widths.map((width) => `${unsplashUrl(photoId, width)} ${width}w`).join(", "),
    remote: true,
  });
}
