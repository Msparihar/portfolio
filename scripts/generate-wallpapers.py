"""
Generate themed desktop wallpapers via OpenAI gpt-image-2 in parallel.
Saves PNGs alongside existing .webp wallpapers (suffix -ai).
"""
import base64
import concurrent.futures
import json
import os
import sys
import time
import urllib.request
from pathlib import Path

ENV_FILE = Path("C:/Users/manis/.env.local")
PROJECT_ROOT = Path("D:/Projects/portfolio")
OUT_BASE = PROJECT_ROOT / "public" / "images" / "worlds"
MODEL = "gpt-image-2"
SIZE = "1536x1024"


def load_api_key():
    for line in ENV_FILE.read_text(encoding="utf-8").splitlines():
        if line.startswith("OPENAI_API_KEY="):
            return line.split("=", 1)[1].strip().strip('"').strip("'")
    raise RuntimeError("OPENAI_API_KEY not found in .env.local")


PROMPTS = {
    "elden-ring": {
        "out": OUT_BASE / "elden-ring" / "wallpaper-ai.png",
        "prompt": (
            "A cinematic dark fantasy desktop wallpaper inspired by Elden Ring. "
            "A massive golden Erdtree silhouetted on the horizon, glowing softly "
            "against a misty twilight sky of deep amber, charcoal, and faded gold. "
            "Distant ruined castle silhouettes, drifting ash particles, painterly "
            "FromSoftware aesthetic, melancholic and grand. Wide composition with "
            "negative space at the top-left for desktop icons. No text, no logos, "
            "no characters, no UI elements. Subtle film grain, soft bloom, "
            "high detail, 16:9."
        ),
    },
    "ghibli": {
        "out": OUT_BASE / "ghibli" / "wallpaper-ai.png",
        "prompt": (
            "A soft hand-painted Studio Ghibli style desktop wallpaper. Rolling "
            "green hills under a gentle pastel sky with fluffy cumulus clouds, a "
            "single weathered tree on a hillside, distant warm sunlight, wind "
            "moving through tall grass. Watercolor textures, Miyazaki aesthetic, "
            "calm and dreamy. Wide composition with open sky at the top for "
            "desktop icons. No text, no logos, no characters, no buildings, "
            "no UI elements. 16:9."
        ),
    },
    "got-north": {
        "out": OUT_BASE / "got" / "north" / "wallpaper-ai.png",
        "prompt": (
            "A cold cinematic desktop wallpaper inspired by the North in Game of "
            "Thrones. A vast snowy pine forest at blue hour, a frozen lake "
            "reflecting an aurora-tinged sky, distant towering ice cliffs, "
            "swirling snow particles, muted blues, slate greys, and pale teals. "
            "Brooding, atmospheric, painterly. Wide composition with negative "
            "space at the top for desktop icons. No text, no logos, no "
            "characters, no UI elements, no banners. 16:9."
        ),
    },
}


def generate_one(api_key, name, spec):
    t0 = time.time()
    body = json.dumps({
        "model": MODEL,
        "prompt": spec["prompt"],
        "size": SIZE,
        "n": 1,
    }).encode("utf-8")
    req = urllib.request.Request(
        "https://api.openai.com/v1/images/generations",
        data=body,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=300) as resp:
            payload = json.loads(resp.read())
    except urllib.error.HTTPError as e:
        return (name, False, f"HTTP {e.code}: {e.read().decode('utf-8', 'replace')[:400]}", 0)

    item = payload["data"][0]
    if "b64_json" in item:
        raw = base64.b64decode(item["b64_json"])
    else:
        with urllib.request.urlopen(item["url"], timeout=120) as r:
            raw = r.read()

    out_path = spec["out"]
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_bytes(raw)
    return (name, True, str(out_path), time.time() - t0)


def main():
    api_key = load_api_key()
    print(f"Generating {len(PROMPTS)} wallpapers with {MODEL} @ {SIZE} in parallel...")
    t0 = time.time()
    with concurrent.futures.ThreadPoolExecutor(max_workers=len(PROMPTS)) as ex:
        futures = {
            ex.submit(generate_one, api_key, name, spec): name
            for name, spec in PROMPTS.items()
        }
        for f in concurrent.futures.as_completed(futures):
            name, ok, info, dt = f.result()
            tag = "OK " if ok else "ERR"
            print(f"[{tag}] {name:12s} {dt:5.1f}s  {info}")
    print(f"Total wall-clock: {time.time() - t0:.1f}s")


if __name__ == "__main__":
    main()
