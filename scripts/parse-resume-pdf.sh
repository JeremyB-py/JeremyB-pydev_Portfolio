#!/usr/bin/env bash
# Extract resume text from PDF into docs/JeremyB_Resume.md (keeps PDF out of chat context).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DOCS="$ROOT/docs"
DEFAULT_PDF="$DOCS/JeremyB_Resume26.7.10.pdf"
OUT="$DOCS/JeremyB_Resume.md"

PDF="${1:-$DEFAULT_PDF}"

if [[ ! -f "$PDF" ]]; then
  echo "error: PDF not found: $PDF" >&2
  exit 1
fi

if ! command -v pdftotext >/dev/null 2>&1; then
  echo "error: pdftotext (poppler-utils) is required" >&2
  exit 1
fi

TMP="$(mktemp)"
trap 'rm -f "$TMP"' EXIT

pdftotext -layout "$PDF" "$TMP"

{
  printf '%s\n' "<!-- Generated from $(basename "$PDF") via scripts/parse-resume-pdf.sh; do not hand-edit without updating the PDF. -->"
  printf '\n'
  sed -e 's/\f$//' -e 's/[[:space:]]*$//' "$TMP" | awk 'NF || blank++ < 2 { if (NF) blank=0; print }'
} > "$OUT"

echo "Wrote $OUT from $PDF"
