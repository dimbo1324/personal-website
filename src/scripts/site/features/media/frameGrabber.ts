interface GrabFrameOptions {
  readonly at?: number;
  readonly width?: number;
  readonly timeoutMs?: number;
}

/** Captures a still from a same-origin video as a blob: URL. */
export function grabFrame(
  src: string,
  { at = 1.2, width = 320, timeoutMs = 8000 }: GrabFrameOptions = {},
): Promise<string | null> {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";
    video.crossOrigin = "anonymous";

    const done = (result: string | null): void => {
      window.clearTimeout(timer);
      video.removeAttribute("src");
      video.load();
      resolve(result);
    };
    const timer = window.setTimeout(() => done(null), timeoutMs);

    video.addEventListener("error", () => done(null), { once: true });
    video.addEventListener(
      "loadedmetadata",
      () => {
        video.currentTime = Math.min(at, (video.duration || 2) / 2);
      },
      { once: true },
    );
    video.addEventListener(
      "seeked",
      () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height =
            Math.round((width * video.videoHeight) / video.videoWidth) ||
            Math.round(width * 0.5625);
          canvas.getContext("2d")?.drawImage(video, 0, 0, canvas.width, canvas.height);
          canvas.toBlob((blob) => done(blob ? URL.createObjectURL(blob) : null), "image/webp", 0.8);
        } catch {
          done(null);
        }
      },
      { once: true },
    );
    video.src = src;
  });
}
