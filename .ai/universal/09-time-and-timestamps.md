# Time and Timestamps: Never Take a Date Without Its Moment

<!-- tier: extended -->

> **Essence.** Read and report every date at full precision — hours, minutes, seconds, zone. For git use `--date=iso-strict` (`git log --pretty=format:"%h %cd %s"`); `--oneline`, `--date=short` and "2 days ago" never answer _when_.

Purpose: a date without a time cannot order two things that happened on the same day.

## The rule

Whenever you take in information that carries a date — a commit, a file's mtime, a log
line, a release, a build, a record — take the **full moment** with it: hours, minutes,
seconds, and the timezone (or an explicit note that the value is UTC). Report it the
same way.

Forbidden as an _answer_ to "when did this happen":

- relative time alone — "2 days ago", "recently";
- a bare date with no time;
- `git log --oneline`, which carries no time at all;
- a timestamp with no zone and no statement that it is UTC.

## Git specifically

```powershell
git log -15 --date=iso-strict --pretty=format:"%h %cd %s"   # history, with committer dates
git show -s --format=fuller --date=iso-strict <ref>         # one commit, author AND committer
git log -1 --date=iso-strict --format=%cd -- <path>         # when a file last changed
```

`%cd` (committer date) orders history as it landed; `%ad` (author date) survives a
rebase unchanged. Never fall back to `--date=short` or `--date=relative`.

## In code and artifacts

- A timestamp written into an artifact, a log line, or a record carries seconds and a
  zone (prefer ISO 8601 with `Z`).
- Store the full instant even when the current display is coarser.
