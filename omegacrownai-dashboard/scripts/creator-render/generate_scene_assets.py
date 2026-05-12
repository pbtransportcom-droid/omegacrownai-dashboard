#!/usr/bin/env python3
import hashlib
import json
import os
import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter

WIDTH = 1280
HEIGHT = 720

def safe_text(value):
    return str(value or "").replace("\n", " ").strip()

def load_font(size, bold=True):
    candidates = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    ]
    for candidate in candidates:
        if os.path.exists(candidate):
            return ImageFont.truetype(candidate, size)
    return ImageFont.load_default()

def hash_color(seed, offset=0):
    digest = hashlib.sha256((seed + str(offset)).encode("utf-8")).hexdigest()
    r = int(digest[0:2], 16)
    g = int(digest[2:4], 16)
    b = int(digest[4:6], 16)
    return (max(20, r), max(20, g), max(30, b))

def draw_wrapped(draw, text, font, x, y, max_width, line_spacing=10, fill=(255, 255, 255)):
    words = text.split()
    lines = []
    current = ""

    for word in words:
        test = f"{current} {word}".strip()
        bbox = draw.textbbox((0, 0), test, font=font)
        if bbox[2] - bbox[0] <= max_width:
            current = test
        else:
            if current:
                lines.append(current)
            current = word

    if current:
        lines.append(current)

    for line in lines[:5]:
        draw.text((x, y), line, font=font, fill=fill)
        bbox = draw.textbbox((x, y), line, font=font)
        y += (bbox[3] - bbox[1]) + line_spacing

    return y

def create_asset(scene, index, total, title, out_path):
    scene_title = safe_text(scene.get("title") or f"Scene {index + 1}")
    prompt = safe_text(scene.get("visualPrompt") or scene.get("voiceoverText") or scene.get("caption") or scene_title)
    caption = safe_text(scene.get("caption") or scene_title)
    seed = f"{title}|{scene_title}|{prompt}|{index}"

    c1 = hash_color(seed, 1)
    c2 = hash_color(seed, 2)
    c3 = hash_color(seed, 3)

    img = Image.new("RGB", (WIDTH, HEIGHT), c1)
    px = img.load()

    for y in range(HEIGHT):
        t = y / max(HEIGHT - 1, 1)
        for x in range(WIDTH):
            wave = ((x * 3 + y * 2 + index * 41) % 255) / 255
            r = int(c1[0] * (1 - t) + c2[0] * t + c3[0] * wave * 0.15)
            g = int(c1[1] * (1 - t) + c2[1] * t + c3[1] * wave * 0.15)
            b = int(c1[2] * (1 - t) + c2[2] * t + c3[2] * wave * 0.15)
            px[x, y] = (min(255, r), min(255, g), min(255, b))

    img = img.filter(ImageFilter.GaussianBlur(radius=0.6))
    draw = ImageDraw.Draw(img, "RGBA")

    # Cinematic abstract shapes
    for i in range(9):
        digest = hashlib.sha256(f"{seed}-{i}".encode("utf-8")).hexdigest()
        x = int(digest[0:4], 16) % WIDTH
        y = int(digest[4:8], 16) % HEIGHT
        w = 160 + int(digest[8:12], 16) % 360
        h = 80 + int(digest[12:16], 16) % 260
        color = hash_color(seed, i + 10)
        alpha = 34 + (int(digest[16:18], 16) % 55)
        draw.rounded_rectangle((x - w // 2, y - h // 2, x + w // 2, y + h // 2), radius=40, fill=(*color, alpha))

    # Dark overlay for readability
    draw.rectangle((0, 0, WIDTH, HEIGHT), fill=(0, 0, 0, 80))
    draw.rounded_rectangle((70, 60, WIDTH - 70, HEIGHT - 60), radius=38, outline=(125, 230, 255, 130), width=3)
    draw.rounded_rectangle((95, 90, WIDTH - 95, HEIGHT - 90), radius=30, fill=(0, 0, 0, 70))

    font_micro = load_font(24, bold=False)
    font_title = load_font(58, bold=True)
    font_caption = load_font(38, bold=True)
    font_prompt = load_font(26, bold=False)

    draw.text((120, 120), f"OmegaCrownAI Visual Asset · {index + 1}/{total}", font=font_micro, fill=(155, 245, 255, 230))

    y = draw_wrapped(draw, scene_title, font_title, 120, 185, WIDTH - 240, line_spacing=14, fill=(255, 255, 255, 255))

    draw.rounded_rectangle((120, 345, WIDTH - 120, 455), radius=18, fill=(10, 25, 50, 185), outline=(60, 215, 255, 120), width=1)
    draw_wrapped(draw, caption, font_caption, 145, 365, WIDTH - 290, line_spacing=8, fill=(235, 253, 255, 255))

    draw_wrapped(draw, prompt, font_prompt, 120, 500, WIDTH - 240, line_spacing=8, fill=(215, 225, 245, 230))

    draw.text((120, HEIGHT - 110), safe_text(title), font=font_micro, fill=(210, 220, 235, 220))
    draw.text((WIDTH - 420, HEIGHT - 110), "Generated Scene Asset", font=font_micro, fill=(210, 220, 235, 220))

    img.save(out_path)

def main():
    if len(sys.argv) != 3:
        print("Usage: generate_scene_assets.py <manifest_json> <asset_dir>", file=sys.stderr)
        sys.exit(2)

    manifest_path = Path(sys.argv[1])
    asset_dir = Path(sys.argv[2])
    asset_dir.mkdir(parents=True, exist_ok=True)

    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    title = manifest.get("title") or "OmegaCrownAI Video"
    scenes = manifest.get("scenes") or []

    assets = []
    for index, scene in enumerate(scenes):
        out_path = asset_dir / f"scene_asset_{index + 1:03d}.png"
        create_asset(scene, index, len(scenes), title, out_path)
        assets.append({
            "sceneIndex": index,
            "sceneId": scene.get("id"),
            "type": "generated_scene_asset",
            "engine": "pillow_deterministic_visual_asset",
            "filePath": out_path.as_posix(),
            "fileName": out_path.name,
            "prompt": scene.get("visualPrompt") or scene.get("voiceoverText") or scene.get("caption") or scene.get("title"),
        })

    print(json.dumps({
        "ok": True,
        "assetDir": asset_dir.as_posix(),
        "count": len(assets),
        "assets": assets,
    }))

if __name__ == "__main__":
    main()
