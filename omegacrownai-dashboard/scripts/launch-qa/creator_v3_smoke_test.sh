#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-https://omegacrownai.com}"
COMPANY_ID="${COMPANY_ID:-cmoyy1gl700004mkqn7or7hxr}"
PROJECT_ID="${PROJECT_ID:-cmoyekpqe00022dkq7s4jrokk}"

echo "== OmegaCrownAI Creator v3 Launch QA =="
echo "BASE_URL=$BASE_URL"
echo "COMPANY_ID=$COMPANY_ID"
echo "PROJECT_ID=$PROJECT_ID"

check_head() {
  local url="$1"
  local expected="$2"
  local label="$3"

  echo
  echo "---- $label"
  echo "$url"

  local status
  status="$(curl -s -o /dev/null -w "%{http_code}" -I "$url")"

  echo "status=$status"

  if [ "$status" != "$expected" ]; then
    echo "FAIL: expected $expected got $status for $label"
    exit 1
  fi
}

check_head "$BASE_URL" "200" "Homepage"
check_head "$BASE_URL/projects/$PROJECT_ID/company/creator-exports" "200" "Creator Exports Dashboard"
check_head "$BASE_URL/projects/$PROJECT_ID/company/video" "200" "Video Dashboard"

echo
echo "---- Billing API"
BILLING_JSON="$(curl -s "$BASE_URL/api/company/$COMPANY_ID/creator-billing")"
python3 -c 'import json,sys
data=json.loads(sys.argv[1])
assert data["ok"] is True
assert data["summary"]["counters"] >= 4
print(json.dumps({"tier": data["summary"]["tier"], "usage": data["summary"]["usage"]}, indent=2))
' "$BILLING_JSON"

echo
echo "---- Distribution API"
DISTRIBUTION_JSON="$(curl -s "$BASE_URL/api/company/$COMPANY_ID/creator-distribution")"
SHARE_SLUG="$(python3 -c 'import json,sys
data=json.loads(sys.argv[1])
assert data["ok"] is True
records=[r for r in data["records"] if r.get("shareSlug")]
assert records, "No shareSlug records found"
print(records[0]["shareSlug"])
' "$DISTRIBUTION_JSON")"

echo "shareSlug=$SHARE_SLUG"

check_head "$BASE_URL/share/$SHARE_SLUG" "200" "Share Portal"

open_status="$(curl -s -o /dev/null -w "%{http_code}" -I "$BASE_URL/share/$SHARE_SLUG/open")"
download_status="$(curl -s -o /dev/null -w "%{http_code}" -I "$BASE_URL/share/$SHARE_SLUG/download")"

echo "open_redirect_status=$open_status"
echo "download_redirect_status=$download_status"

case "$open_status" in
  301|302|307|308) ;;
  *) echo "FAIL: expected redirect for open route"; exit 1 ;;
esac

case "$download_status" in
  301|302|307|308) ;;
  *) echo "FAIL: expected redirect for download route"; exit 1 ;;
esac

open_location="$(curl -s -I "$BASE_URL/share/$SHARE_SLUG/open" | awk 'tolower($1)=="location:" {print $2}' | tr -d '\r')"
download_location="$(curl -s -I "$BASE_URL/share/$SHARE_SLUG/download" | awk 'tolower($1)=="location:" {print $2}' | tr -d '\r')"

echo "open_location=$open_location"
echo "download_location=$download_location"

case "$open_location" in
  https://omegacrownai.com/exports/*) ;;
  *) echo "FAIL: open route location is not public exports URL"; exit 1 ;;
esac

case "$download_location" in
  https://omegacrownai.com/exports/*) ;;
  *) echo "FAIL: download route location is not public exports URL"; exit 1 ;;
esac

echo
echo "---- Latest Media URLs"
MP4_FILE="$(ls -t "public/exports/$COMPANY_ID"/*.mp4 | head -1)"
echo "mp4=$MP4_FILE"

MP4_PROBE="$(ffprobe -v error -show_entries format=format_name,duration,bit_rate -show_entries stream=codec_name,codec_type -of json "$MP4_FILE")"
python3 -c 'import json,sys
data=json.loads(sys.argv[1])
streams=data.get("streams", [])
assert any(s.get("codec_type")=="video" for s in streams)
assert any(s.get("codec_type")=="audio" for s in streams)
print(json.dumps(data, indent=2))
' "$MP4_PROBE"

if ls "public/exports/$COMPANY_ID"/*.mp3 >/dev/null 2>&1; then
  MP3_FILE="$(ls -t "public/exports/$COMPANY_ID"/*.mp3 | head -1)"
  echo "mp3=$MP3_FILE"

  MP3_PROBE="$(ffprobe -v error -show_entries format=format_name,duration,bit_rate -show_entries stream=codec_name,channels,sample_rate -of json "$MP3_FILE")"
  python3 -c 'import json,sys
data=json.loads(sys.argv[1])
assert data["streams"][0]["codec_name"] == "mp3"
print(json.dumps(data, indent=2))
' "$MP3_PROBE"
fi

echo
echo "PASS: Creator v3 launch QA smoke test completed."
