import { hook, hooks } from "../../core/dom";
import { VideoCarousel } from "../../features/media/VideoCarousel";
import { VideoCatalog } from "../../features/media/catalog/VideoCatalog";
import { prefersCompactMedia } from "../../features/media/mediaProfile";
import { Theater } from "../../features/theater/Theater";
import { TheaterPlayer } from "../../features/theater/TheaterPlayer";
import { TheaterPlaylist } from "../../features/theater/TheaterPlaylist";
import { TheaterLauncher } from "../../features/theater/TheaterLauncher";
import { ANALYTICS_EVENTS } from "../../features/analytics/events";
import { HERO_VIDEOS } from "../../data/heroVideos";
import { GALLERY_ITEMS } from "../../data/gallery";
import type { AppContext } from "../types";
import type { VideoCarousel as Carousel } from "../../features/media/VideoCarousel";
import type { TheaterPlaylist as Playlist } from "../../features/theater/TheaterPlaylist";

/** Hero video reel + theater mode, wired once the clip catalog has loaded. */
export async function initReel(ctx: AppContext): Promise<void> {
  const { use, i18n, viewport } = ctx;
  const compact = prefersCompactMedia(HERO_VIDEOS.compactQuery);
  const reel = use(
    hook("hero-media"),
    (root) =>
      new VideoCarousel(root, {
        videos: hooks<HTMLVideoElement>("reel-video"),
        fallback: hook<HTMLImageElement>("reel-fallback") ?? document.createElement("img"),
        iris: hook("reel-iris") ?? root,
        segments: hook("reel-segments") ?? root,
        title: hook("reel-title") ?? root,
        counter: hook("reel-counter") ?? root,
        concept: hook("reel-concept"),
        i18n,
        compact,
        viewport,
      }),
  );

  const clips = await new VideoCatalog(HERO_VIDEOS).load();
  reel?.setClips(clips, HERO_VIDEOS.fallback);
  initTheater(ctx, reel, new TheaterPlaylist(clips, GALLERY_ITEMS, { compact }));
}

function initTheater(
  { use, i18n, analytics }: AppContext,
  reel: Carousel | null,
  playlist: Playlist,
): void {
  const theaterVideo = hook<HTMLVideoElement>("theater-video");
  if (!theaterVideo) return;

  let launcher: TheaterLauncher | null = null;
  const theater = use(
    hook("theater"),
    (root) =>
      new Theater(root, {
        playlist,
        i18n,
        player: new TheaterPlayer(
          theaterVideo,
          {
            controls: hook("theater-controls") ?? root,
            play: hook<HTMLButtonElement>("theater-play") ?? document.createElement("button"),
            playIcon:
              document.querySelector<SVGUseElement>('[data-js="theater-play-icon"]') ??
              (document.createElementNS("http://www.w3.org/2000/svg", "use") as SVGUseElement),
            progress: hook("theater-progress") ?? root,
            fill: hook("theater-progress-fill") ?? root,
            time: hook("theater-time") ?? root,
          },
          i18n,
        ),
        background: [hook("page-flow"), hook("site-header")].filter(
          (element): element is HTMLElement => element !== null,
        ),
        elements: {
          stage: hook("theater-stage") ?? root,
          image: hook<HTMLImageElement>("theater-image") ?? document.createElement("img"),
          title: hook("theater-title") ?? root,
          caption: hook("theater-caption") ?? root,
          concept: hook("theater-concept"),
          counter: hook("theater-counter") ?? root,
          rail: hook("theater-rail") ?? root,
          close: hook<HTMLButtonElement>("theater-close") ?? document.createElement("button"),
          backdrop: hook("theater-backdrop") ?? root,
          prev: hook<HTMLButtonElement>("theater-prev") ?? document.createElement("button"),
          next: hook<HTMLButtonElement>("theater-next") ?? document.createElement("button"),
        },
        hooks: {
          onOpen: () => {
            reel?.suspend();
            analytics.track(ANALYTICS_EVENTS.theaterOpen);
          },
          onClose: () => reel?.resume(),
          sourceRect: () => launcher?.screenRect ?? null,
        },
      }),
  );
  if (!theater) return;

  launcher = use(
    hook("hero-media"),
    (root) =>
      new TheaterLauncher(root, {
        label: hook("dwell-text"),
        i18n,
        onLaunch: (from) =>
          theater.open({
            from,
            index: reel?.clips.length ? reel.index : 0,
            time: reel?.activeVideo?.currentTime ?? 0,
          }),
      }),
  );
}
