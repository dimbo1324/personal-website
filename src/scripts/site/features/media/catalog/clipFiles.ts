const MOBILE_SUFFIX = ".mobile";

const extOf = (file: string): string => file.split(".").pop()?.toLowerCase() ?? "";

/** "02-keynote.mobile.mp4" → "02-keynote" */
export function baseName(file: string): string {
  const withoutExt = file.slice(0, file.length - extOf(file).length - 1);
  return withoutExt.endsWith(MOBILE_SUFFIX)
    ? withoutExt.slice(0, -MOBILE_SUFFIX.length)
    : withoutExt;
}

export const isMobileVariant = (file: string): boolean =>
  file.slice(0, file.lastIndexOf(".")).endsWith(MOBILE_SUFFIX);

export interface ClipFileGroup {
  readonly base: string;
  readonly main: string;
  readonly mobile: string | null;
  readonly poster: string | null;
}

interface MutableClipFileGroup {
  base: string;
  main: string | null;
  mobile: string | null;
  poster: string | null;
}

interface ClipFileConfig {
  readonly extensions: readonly string[];
  readonly posterExtensions: readonly string[];
}

/** Groups a flat file list into clips. */
export function groupClipFiles(
  files: readonly string[],
  { extensions, posterExtensions }: ClipFileConfig,
): ClipFileGroup[] {
  const groups = new Map<string, MutableClipFileGroup>();
  const group = (base: string): MutableClipFileGroup => {
    let entry = groups.get(base);
    if (!entry) {
      entry = { base, main: null, mobile: null, poster: null };
      groups.set(base, entry);
    }
    return entry;
  };

  for (const file of files) {
    const ext = extOf(file);
    const entry = group(baseName(file));
    if (posterExtensions.includes(ext)) {
      entry.poster ??= file;
    } else if (extensions.includes(ext)) {
      if (isMobileVariant(file)) entry.mobile ??= file;
      else if (!entry.main || ext === "mp4") entry.main = file;
    }
  }

  return [...groups.values()]
    .filter((entry): entry is MutableClipFileGroup & { main: string } => entry.main !== null)
    .sort((a, b) => a.base.localeCompare(b.base, "en", { numeric: true }));
}
