"""
Test: generate one Veo 3.1 Lite image-to-video animated wallpaper for the
Ghibli theme. Reads GEMINI_API_KEY from env (do not persist to disk).
Cost: $0.05.
"""
import base64
import json
import os
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

API_KEY = os.environ.get("GEMINI_API_KEY")
if not API_KEY:
    print("ERROR: set GEMINI_API_KEY env var.", file=sys.stderr)
    sys.exit(1)

MODEL = "veo-3.1-lite-generate-preview"
BASE = "https://generativelanguage.googleapis.com/v1beta"
INPUT_IMG = Path("D:/Projects/portfolio/public/images/worlds/ghibli/wallpaper-ai.png")
OUT_VIDEO = Path("D:/Projects/portfolio/public/images/worlds/ghibli/wallpaper-ai.mp4")

PROMPT = (
    "Gentle warm wind moves through tall green grass on the rolling hills, "
    "rippling outward in soft waves. The single weathered tree on the "
    "hillside sways softly with its leaves rustling. Distant cumulus clouds "
    "drift slowly across the pastel sky. A small lone figure in a simple "
    "linen dress walks peacefully along a hillside path in the distance, "
    "their hair gently blown by the breeze. Hand-painted Studio Ghibli "
    "aesthetic, soft watercolor textures, dreamy, peaceful, cinematic. "
    "Subtle parallax depth. No camera shake. No text, no logos."
)


def post_json(url, body):
    req = urllib.request.Request(
        url,
        data=json.dumps(body).encode("utf-8"),
        headers={
            "x-goog-api-key": API_KEY,
            "Content-Type": "application/json",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=120) as resp:
            return json.loads(resp.read())
    except urllib.error.HTTPError as e:
        print(f"HTTP {e.code}: {e.read().decode('utf-8', 'replace')}", file=sys.stderr)
        raise


def get_json(url):
    req = urllib.request.Request(url, headers={"x-goog-api-key": API_KEY})
    with urllib.request.urlopen(req, timeout=60) as resp:
        return json.loads(resp.read())


def download(url, out_path):
    req = urllib.request.Request(url, headers={"x-goog-api-key": API_KEY})
    with urllib.request.urlopen(req, timeout=300) as resp, open(out_path, "wb") as f:
        f.write(resp.read())


def main():
    print(f"Encoding input image: {INPUT_IMG}")
    img_b64 = base64.b64encode(INPUT_IMG.read_bytes()).decode("ascii")

    print(f"Submitting Veo 3.1 Lite request (8s, 720p, 16:9)...")
    t0 = time.time()
    op = post_json(
        f"{BASE}/models/{MODEL}:predictLongRunning",
        {
            "instances": [{
                "prompt": PROMPT,
                "image": {
                    "inlineData": {"mimeType": "image/png", "data": img_b64},
                },
            }],
            "parameters": {
                "aspectRatio": "16:9",
                "durationSeconds": "8",
                "resolution": "720p",
            },
        },
    )
    op_name = op["name"]
    print(f"Operation: {op_name}")

    print("Polling for completion (every 10s)...")
    for i in range(60):
        time.sleep(10)
        status = get_json(f"{BASE}/{op_name}")
        if status.get("done"):
            print(f"Done in {time.time() - t0:.1f}s")
            break
        print(f"  ...still generating ({i * 10 + 10}s elapsed)")
    else:
        print("ERROR: timed out after 10 minutes", file=sys.stderr)
        sys.exit(2)

    if "error" in status:
        print(f"ERROR from API: {json.dumps(status['error'], indent=2)}", file=sys.stderr)
        sys.exit(3)

    samples = status["response"]["generateVideoResponse"]["generatedSamples"]
    video_uri = samples[0]["video"]["uri"]
    print(f"Downloading: {video_uri}")
    OUT_VIDEO.parent.mkdir(parents=True, exist_ok=True)
    download(video_uri, OUT_VIDEO)
    size_mb = OUT_VIDEO.stat().st_size / 1024 / 1024
    print(f"Saved: {OUT_VIDEO} ({size_mb:.1f} MB)")


if __name__ == "__main__":
    main()
