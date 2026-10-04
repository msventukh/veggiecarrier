#!/usr/bin/env bash
# Cuts the game's audio clips out of full songs, as listed in clips.txt.
#
# Usage: ./make-clips.sh [--dry-run] [clip-list]   (default list: clips.txt)
#
# Every clip is re-created on each run, so editing a start time and re-running
# is enough. Each clip gets short fades and loudness normalization, so all
# clips play at a similar volume. Requires ffmpeg (macOS: brew install ffmpeg).

set -u

FADE_IN=0.3
FADE_OUT=0.5

dry_run=false
if [ "${1:-}" = "--dry-run" ]; then
  dry_run=true
  shift
fi
list="${1:-clips.txt}"

if [ ! -f "$list" ]; then
  echo "Clip list not found: $list" >&2
  exit 1
fi
if ! $dry_run && ! command -v ffmpeg >/dev/null 2>&1; then
  echo "ffmpeg is not installed (macOS: brew install ffmpeg)." >&2
  exit 1
fi

trim() {
  local s="$1"
  s="${s#"${s%%[![:space:]]*}"}"
  s="${s%"${s##*[![:space:]]}"}"
  printf '%s' "$s"
}

made=0
failed=0
line_no=0

while IFS= read -r line || [ -n "$line" ]; do
  line_no=$((line_no + 1))
  case "$(trim "$line")" in
    "" | "#"*) continue ;;
  esac

  IFS='|' read -r output source start duration extra <<EOF
$line
EOF
  output="$(trim "${output:-}")"
  source="$(trim "${source:-}")"
  start="$(trim "${start:-}")"
  duration="$(trim "${duration:-}")"

  if [ -z "$output" ] || [ -z "$source" ] || [ -z "$start" ] || [ -z "$duration" ] || [ -n "$(trim "${extra:-}")" ]; then
    echo "Line $line_no: expected 'output | source | start | duration', got: $line" >&2
    failed=$((failed + 1))
    continue
  fi
  if ! printf '%s' "$duration" | grep -Eq '^[0-9]+(\.[0-9]+)?$'; then
    echo "Line $line_no: duration must be a number of seconds, got: $duration" >&2
    failed=$((failed + 1))
    continue
  fi
  if [ ! -f "$source" ]; then
    echo "Line $line_no: source file not found: $source" >&2
    failed=$((failed + 1))
    continue
  fi

  fade_out_start="$(awk -v d="$duration" -v f="$FADE_OUT" 'BEGIN { s = d - f; print (s > 0 ? s : 0) }')"
  filters="afade=t=in:d=$FADE_IN,afade=t=out:st=$fade_out_start:d=$FADE_OUT,loudnorm=I=-16:TP=-1.5:LRA=11"

  # -vn drops embedded cover art, -map_metadata -1 drops tags: both could
  # give the answer away.
  cmd=(ffmpeg -hide_banner -loglevel error -y
    -ss "$start" -t "$duration" -i "$source"
    -vn -map_metadata -1 -af "$filters" -ar 44100 -b:a 192k
    "$output")

  if $dry_run; then
    printf '%q ' "${cmd[@]}"
    echo
    made=$((made + 1))
    continue
  fi

  mkdir -p "$(dirname "$output")"
  # </dev/null keeps ffmpeg from consuming the rest of the clip list on stdin.
  if "${cmd[@]}" </dev/null; then
    echo "OK    $output"
    made=$((made + 1))
  else
    echo "Line $line_no: ffmpeg failed for $output" >&2
    failed=$((failed + 1))
  fi
done < "$list"

if $dry_run; then verb="planned"; else verb="made"; fi
echo "Done: $made clip(s) $verb, $failed problem(s)."
[ "$failed" -eq 0 ]
