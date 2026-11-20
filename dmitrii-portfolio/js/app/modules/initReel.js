import { hook, hooks } from "../../core/dom.js";
import { VideoCarousel } from "../../features/media/VideoCarousel.js";
import { VideoCatalog } from "../../features/media/catalog/VideoCatalog.js";
import { prefersCompactMedia } from "../../features/media/mediaProfile.js";
import { Theater } from "../../features/theater/Theater.js";
import { TheaterPlayer } from "../../features/theater/TheaterPlayer.js";
import { TheaterPlaylist } from "../../features/theater/TheaterPlaylist.js";
import { TheaterLauncher } from "../../features/theater/TheaterLauncher.js";
import { ANALYTICS_EVENTS } from "../../features/analytics/events.js";
import { HERO_VIDEOS } from "../../data/heroVideos.js";
import { GALLERY_ITEMS } from "../../data/gallery.js";

/**
 * Hero video reel + theater mode. Clips are discovered asynchronously
 * (VideoCatalog), so the theater is wired once the catalog has loaded.
 * @param {import("../App.js").AppContext} ctx
 */
export async function initReel(ctx) {
  const { use, i18n, viewport } = ctx;
  const compact = prefersCompactMedia(HERO_VIDEOS.compactQuery);
  const reel = use(
    hook("hero-media"),
    (root) =>
      new VideoCarousel(root, {
        videos: hooks("reel-video"),
        fallback: hook("reel-fallback"),
        iris: hook("reel-iris"),
        segments: hook("reel-segments"),
        title: hook("reel-title"),
        counter: hook("reel-counter"),
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

/**
 * Theater mode, launched from the hero media frame (hover 5 s or click).
 * @param {import("../App.js").AppContext} ctx
 * @param {VideoCarousel | null} reel
 * @param {TheaterPlaylist} playlist
 */
function initTheater({ use, i18n, analytics }, reel, playlist) {
  const theaterVideo = hook("theater-video");
  if (!theaterVideo) return;

  let launcher = null;
  const theater = use(
    hook("theater"),
    (root) =>
      new Theater(root, {
        playlist,
        i18n,
        player: new TheaterPlayer(
          theaterVideo,
          {
            controls: hook("theater-controls"),
            play: hook("theater-play"),
            playIcon: hook("theater-play-icon"),
            progress: hook("theater-progress"),
            fill: hook("theater-progress-fill"),
            time: hook("theater-time"),
          },
          i18n,
        ),
        background: [hook("page-flow"), hook("site-header")].filter(Boolean),
        elements: {
          stage: hook("theater-stage"),
          image: hook("theater-image"),
          title: hook("theater-title"),
          caption: hook("theater-caption"),
          concept: hook("theater-concept"),
          counter: hook("theater-counter"),
          rail: hook("theater-rail"),
          close: hook("theater-close"),
          backdrop: hook("theater-backdrop"),
          prev: hook("theater-prev"),
          next: hook("theater-next"),
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
