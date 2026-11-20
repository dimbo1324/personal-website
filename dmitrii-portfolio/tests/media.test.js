import { test } from "node:test";
import assert from "node:assert/strict";
import { baseName, groupClipFiles, isMobileVariant } from "../js/features/media/catalog/clipFiles.js";
import { humanizeFileName } from "../js/features/media/catalog/humanizeFileName.js";
import { VideoClip } from "../js/features/media/catalog/VideoClip.js";
import { TheaterPlaylist } from "../js/features/theater/TheaterPlaylist.js";
import { localImage, remoteImage } from "../js/features/media/images/imageSources.js";

const CONFIG = { extensions: ["mp4", "webm"], posterExtensions: ["webp", "jpg"] };

test("baseName / isMobileVariant follow the folder conventions", () => {
  assert.equal(baseName("02-keynote.mobile.mp4"), "02-keynote");
  assert.equal(baseName("02-keynote.webp"), "02-keynote");
  assert.equal(isMobileVariant("02-keynote.mobile.mp4"), true);
  assert.equal(isMobileVariant("02-keynote.mp4"), false);
});

test("groupClipFiles pairs clips with their mobile file and poster, sorted naturally", () => {
  const groups = groupClipFiles(
    ["10-last.mp4", "2-b.webm", "2-b.mp4", "2-b.mobile.mp4", "2-b.webp", "notes.txt", "1-a.webm", "orphan.jpg"],
    CONFIG,
  );
  assert.deepEqual(groups, [
    { base: "1-a", main: "1-a.webm", mobile: null, poster: null },
    { base: "2-b", main: "2-b.mp4", mobile: "2-b.mobile.mp4", poster: "2-b.webp" },
    { base: "10-last", main: "10-last.mp4", mobile: null, poster: null },
  ]);
});

test("humanizeFileName strips order prefixes and keeps acronyms", () => {
  assert.equal(humanizeFileName("02-iiot-architecture_keynote.mp4"), "IIoT Architecture Keynote");
  assert.equal(humanizeFileName("05-pump%20station-scada.mp4"), "Pump Station SCADA");
  assert.equal(humanizeFileName("123.mp4"), "123.mp4");
});

test("VideoClip localizes texts and picks the compact source", () => {
  const clip = new VideoClip({
    file: "a.mp4",
    src: "a.mp4",
    mobileSrc: "a.mobile.mp4",
    title: { en: "Pump", es: "Bomba" },
    description: "plain",
  });
  assert.equal(clip.title("es"), "Bomba");
  assert.equal(clip.title("ru"), "Pump", "falls back to English");
  assert.equal(clip.description("ru"), "plain");
  assert.equal(clip.sourceFor({ compact: true }), "a.mobile.mp4");
  assert.equal(clip.sourceFor(), "a.mp4");
  assert.equal(new VideoClip({ file: "b", src: "b.mp4", title: "B" }).sourceFor({ compact: true }), "b.mp4");
});

test("TheaterPlaylist lists clips then photos and finds the next video", () => {
  const clips = ["a", "b"].map(
    (name) => new VideoClip({ file: name, src: `${name}.mp4`, poster: `${name}.webp`, title: name, generated: true }),
  );
  const photos = [{ image: { src: "p.webp" }, title: "P", description: "" }];
  const playlist = new TheaterPlaylist(clips, photos);
  assert.deepEqual(
    playlist.items.map((item) => item.type),
    ["video", "video", "image"],
  );
  assert.equal(playlist.items[0].thumb, "a.webp", "poster doubles as thumbnail");
  playlist.select(1);
  assert.equal(playlist.nextVideoIndex, 0, "wraps past the photos");
  assert.equal(playlist.select(-1).type, "image", "negative index wraps");
});

test("image sources build srcset and prefer local copies of remote images", () => {
  assert.deepEqual(localImage("keynote", { full: 1280, widths: [640] }), {
    src: "assets/images/keynote.webp",
    srcset: "assets/images/keynote-640.webp 640w, assets/images/keynote.webp 1280w",
    remote: false,
  });
  const remote = remoteImage("server-room", { local: [], widths: [480, 960] });
  assert.equal(remote.remote, true);
  assert.match(remote.src, /images\.unsplash\.com\/photo-.*w=960/);
  const local = remoteImage("server-room", { local: ["server-room"], widths: [480, 960] });
  assert.equal(local.src, "assets/images/remote/server-room-960.webp");
  assert.throws(() => remoteImage(/** @type {any} */ ("nope")), /Unknown remote image/);
});
