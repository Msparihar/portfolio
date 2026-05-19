"""
Generate 15 kitsune mascot variations via OpenAI gpt-image-2.
5 styles x 3 poses each. Parallel (max 8 in flight).
Cost: ~$0.60 total. Saves to public/images/mascot/<style>/<pose>.png.
"""
import base64
import concurrent.futures
import json
import time
import urllib.request
import urllib.error
from pathlib import Path

ENV_FILE = Path("C:/Users/manis/.env.local")
OUT_BASE = Path("D:/Projects/portfolio/public/images/mascot")
MODEL = "gpt-image-2"
SIZE = "1024x1024"

NEG = (
    "No text, no logos, no watermarks, no UI elements, no humans, "
    "single subject only, plain or thematic background."
)

STYLES = {
    "ghibli-watercolor": {
        "style": (
            "Studio Ghibli hand-painted watercolor style, soft cream-and-white fur "
            "kitsune fox spirit with three gentle tails, large warm amber eyes, "
            "small body, peaceful expression. Pastel palette, gentle light, "
            "Miyazaki aesthetic. Painterly textures, dreamlike."
        ),
        "poses": {
            "01-curled": "Curled up sleeping on a mossy stone, three tails wrapping around the body, a tiny scroll tucked beside its paws.",
            "02-walking": "Walking through tall green grass on a sunny hillside, ears alert, tails trailing softly in the breeze.",
            "03-skygaze": "Sitting on a wooden fence post, looking up at fluffy cumulus clouds drifting across a pastel sky.",
        },
    },
    "elden-ring": {
        "style": (
            "FromSoftware dark fantasy painterly style kitsune fox spirit, "
            "Carmine Pelt variant — deep amber-and-rust fur with faint glowing ember "
            "motes, three tails tipped with golden flame, one notched ear, scarred, "
            "watchful golden eyes. Atmospheric mist, painterly, melancholic and grand."
        ),
        "poses": {
            "01-grace": "Sitting regally before a small golden Site of Grace glow, the grace particles drifting upward, ruined stones around.",
            "02-alert": "Standing alert on a moss-covered ruin at twilight, distant ash motes in the air, head turned toward the viewer.",
            "03-leap": "Mid-leap over weathered rubble in a misty field, tails streaming behind, embers trailing.",
        },
    },
    "got-north": {
        "style": (
            "Game of Thrones House Stark aesthetic kitsune fox spirit of the North, "
            "thick silver-white winter coat, three tails frosted at the tips, frosted "
            "blue eyes, breath fogging in the cold. Snow-dusted, atmospheric, "
            "muted blues and slate greys, cinematic and brooding."
        ),
        "poses": {
            "01-standing": "Standing on a snowy hillside at blue hour, distant pine forest, snow drifting.",
            "02-aurora": "Sitting on a frozen lakeshore looking up at a pale green aurora, breath fogging.",
            "03-howl": "Howling on a snow-covered cliff under a cold pale moon, tails raised.",
        },
    },
    "chibi-sticker": {
        "style": (
            "Cute chibi sticker illustration kitsune fox, large head small body, "
            "clean bold outlines, flat cel-shaded color, expressive big eyes, "
            "three small fluffy tails. Designed as a sticker / Discord emoji — "
            "transparent or solid pastel background, centered subject."
        ),
        "poses": {
            "01-wave": "Sitting and waving one paw cheerfully, big smile, sparkle accents.",
            "02-sleep": "Curled up sleeping with z-z-z bubbles, peaceful little smile, blanket of one tail.",
            "03-coding": "Sitting at a tiny laptop with glowing screen, focused expression, tails flicked in concentration.",
        },
    },
    "sumi-e-ink": {
        "style": (
            "Traditional Japanese sumi-e brush ink kitsune fox spirit, monochrome "
            "black ink on aged off-white paper, expressive minimal brushstrokes, "
            "single accent of vermilion on one tail tip. Flowing, calligraphic, "
            "negative space respected. Ancient scroll aesthetic."
        ),
        "poses": {
            "01-running": "Mid-stride running, three tails streaming in dynamic ink strokes, sense of forward motion.",
            "02-curled": "Curled small in the lower-right corner of the composition, head resting on tails, contemplative.",
            "03-profile": "Standing in side profile, looking left, ears pricked, tails arched — like a heraldic sigil.",
        },
    },
}


def load_api_key():
    for line in ENV_FILE.read_text(encoding="utf-8").splitlines():
        if line.startswith("OPENAI_API_KEY="):
            return line.split("=", 1)[1].strip().strip('"').strip("'")
    raise RuntimeError("OPENAI_API_KEY not found")


def gen_one(api_key, style_key, style_spec, pose_key, pose_text):
    out = OUT_BASE / style_key / f"{pose_key}.png"
    prompt = f"{style_spec['style']} {pose_text} {NEG}"
    body = json.dumps({
        "model": MODEL,
        "prompt": prompt,
        "size": SIZE,
        "n": 1,
    }).encode("utf-8")
    req = urllib.request.Request(
        "https://api.openai.com/v1/images/generations",
        data=body,
        headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
        method="POST",
    )
    t0 = time.time()
    try:
        with urllib.request.urlopen(req, timeout=300) as resp:
            payload = json.loads(resp.read())
    except urllib.error.HTTPError as e:
        return (style_key, pose_key, False, f"HTTP {e.code}: {e.read().decode('utf-8', 'replace')[:300]}", 0)
    item = payload["data"][0]
    raw = base64.b64decode(item["b64_json"]) if "b64_json" in item else urllib.request.urlopen(item["url"], timeout=120).read()
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_bytes(raw)
    return (style_key, pose_key, True, str(out), time.time() - t0)


def main():
    api_key = load_api_key()
    jobs = [
        (sk, ss, pk, pt)
        for sk, ss in STYLES.items()
        for pk, pt in ss["poses"].items()
    ]
    print(f"Generating {len(jobs)} kitsune mascot variations with {MODEL} @ {SIZE} (max 8 parallel)...")
    t0 = time.time()
    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as ex:
        futures = [ex.submit(gen_one, api_key, sk, STYLES[sk], pk, pt) for sk, _, pk, pt in jobs]
        for f in concurrent.futures.as_completed(futures):
            sk, pk, ok, info, dt = f.result()
            tag = "OK " if ok else "ERR"
            print(f"[{tag}] {sk:20s} {pk:14s} {dt:5.1f}s  {info}")
    print(f"\nTotal wall-clock: {time.time() - t0:.1f}s")
    print(f"Output: {OUT_BASE}")


if __name__ == "__main__":
    main()
