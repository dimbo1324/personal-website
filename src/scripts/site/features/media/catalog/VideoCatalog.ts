import type { HeroVideoConfig } from "../../../data/heroVideos";
import type { LocalizedText } from "../../../i18n/types";
import { groupClipFiles } from "./clipFiles";
import { DirectoryListingSource } from "./DirectoryListingSource";
import { humanizeFileName } from "./humanizeFileName";
import { ManifestSource } from "./ManifestSource";
import { VideoClip } from "./VideoClip";

/** Discovers the hero clips from playlist.json or a directory listing. */
export class VideoCatalog {
  readonly #config: HeroVideoConfig;
  readonly #listing: DirectoryListingSource;
  readonly #manifest: ManifestSource;

  constructor(config: HeroVideoConfig) {
    this.#config = config;
    this.#listing = new DirectoryListingSource(config);
    this.#manifest = new ManifestSource(config);
  }

  async load(): Promise<VideoClip[]> {
    const manifest = await this.#manifest.load();
    const meta = new Map((manifest ?? []).map((entry) => [entry.file, entry]));

    const files: string[] = manifest
      ? manifest.flatMap((entry) =>
          [entry.file, entry.mobile, entry.poster].filter(
            (file): file is string => typeof file === "string",
          ),
        )
      : ((await this.#listing.list()) ?? []);

    const directory = new URL(this.#config.directory, document.baseURI);
    const url = (file: string | null): string | null =>
      file ? new URL(encodeURIComponent(file), directory).href : null;

    return groupClipFiles(files, this.#config).map((group) => {
      const entry = meta.get(group.main);
      const title: string | LocalizedText = entry?.title || humanizeFileName(group.main);
      const description: string | LocalizedText = entry?.description || "";
      return new VideoClip({
        file: group.main,
        src: url(group.main) ?? "",
        mobileSrc: url(group.mobile),
        poster: url(group.poster),
        title,
        description,
        generated: Boolean(entry?.generated),
      });
    });
  }
}
