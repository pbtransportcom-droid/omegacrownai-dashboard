#!/usr/bin/env python3
import json
import os
import subprocess
import sys
import textwrap
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

WIDTH = 1280
HEIGHT = 720
FPS = 24

def safe_text(value):
    return str(value or "").replace("\n", " ").strip()

def load_font(size):
    candidates = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    ]
    for candidate in candidates:
        if os.path.exists(candidate):
            return ImageFont.truetype(candidate, size)
    return ImageFont.load_default()

def draw_wrapped(draw, text, font, x, y, max_width, line_spacing=12, fill=(245, 248, 255)):
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

    for line in lines:
        draw.text((x, y), line, font=font, fill=fill)
        bbox = draw.textbbox((x, y), line, font=font)
        y += (bbox[3] - bbox[1]) + line_spacing

    return y

def create_scene_card(scene, index, total, title, out_path):
    img = Image.new("RGB", (WIDTH, HEIGHT), (8, 12, 28))
    draw = ImageDraw.Draw(img)

    # simple premium gradient bars
    for y in range(HEIGHT):
        r = int(8 + y / HEIGHT * 12)
        g = int(12 + y / HEIGHT * 22)
        b = int(28 + y / HEIGHT * 45)
        draw.line([(0, y), (WIDTH, y)], fill=(r, g, b))

    # accent panels
    draw.rounded_rectangle((70, 60, WIDTH - 70, HEIGHT - 60), radius=36, outline=(58, 214, 255), width=3)
    draw.rounded_rectangle((95, 88, WIDTH - 95, HEIGHT - 88), radius=28, fill=(10, 20, 42))

    font_small = load_font(28)
    font_title = load_font(56)
    font_body = load_font(38)
    font_footer = load_font(24)

    scene_title = safe_text(scene.get("title") or f"Scene {index + 1}")
    voiceover = safe_text(scene.get("voiceoverText") or scene.get("scriptSegment") or scene.get("visualPrompt") or "")

    draw.text((120, 120), f"OmegaCrownAI · Scene {index + 1} of {total}", font=font_small, fill=(103, 232, 249))
    draw_wrapped(draw, scene_title, font_title, 120, 180, WIDTH - 240, line_spacing=16, fill=(255, 255, 255))

    y = 330
    if voiceover:
        y = draw_wrapped(draw, voiceover, font_body, 120, y, WIDTH - 240, line_spacing=14, fill=(225, 235, 255))
    else:
        draw.text((120, y), "Generated creator scene card", font=font_body, fill=(225, 235, 255))

    draw.text((120, HEIGHT - 120), safe_text(title), font=font_footer, fill=(148, 163, 184))
    draw.text((WIDTH - 360, HEIGHT - 120), "Your journey, our royal priority.", font=font_footer, fill=(148, 163, 184))

    img.save(out_path)

def run(cmd):
    subprocess.run(cmd, check=True)

def main():
    if len(sys.argv) != 4:
        print("Usage: render_video_from_manifest.py <manifest_json> <work_dir> <output_mp4>", file=sys.stderr)
        sys.exit(2)

    manifest_path = Path(sys.argv[1])
    work_dir = Path(sys.argv[2])
    output_mp4 = Path(sys.argv[3])

    work_dir.mkdir(parents=True, exist_ok=True)
    output_mp4.parent.mkdir(parents=True, exist_ok=True)

    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    title = manifest.get("title") or "OmegaCrownAI Video"
    scenes = manifest.get("scenes") or []

    if not scenes:
        scenes = [{
            "title": title,
            "voiceoverText": manifest.get("description") or "OmegaCrownAI creator export.",
            "durationSeconds": manifest.get("durationSeconds") or 8
        }]

    concat_file = work_dir / "concat.txt"
    lines = []

    for index, scene in enumerate(scenes):
        duration = int(scene.get("durationSeconds") or 6)
        duration = max(3, min(duration, 20))
        card_path = work_dir / f"scene_{index + 1:03d}.png"
        create_scene_card(scene, index, len(scenes), title, card_path)
        lines.append(f"file '{card_path.as_posix()}'\n")
        lines.append(f"duration {duration}\n")

    # ffmpeg concat needs last file repeated
    last_card = work_dir / f"scene_{len(scenes):03d}.png"
    lines.append(f"file '{last_card.as_posix()}'\n")
    concat_file.write_text("".join(lines), encoding="utf-8")

    temp_mp4 = work_dir / "video_no_audio.mp4"

    run([
        "ffmpeg", "-y",
        "-f", "concat",
        "-safe", "0",
        "-i", concat_file.as_posix(),
        "-vsync", "vfr",
        "-pix_fmt", "yuv420p",
        "-r", str(FPS),
        temp_mp4.as_posix()
    ])

    # Add silent audio track for compatibility.
    total_duration = sum(max(3, min(int(scene.get("durationSeconds") or 6), 20)) for scene in scenes)

    run([
        "ffmpeg", "-y",
        "-i", temp_mp4.as_posix(),
        "-f", "lavfi",
        "-i", f"anullsrc=channel_layout=stereo:sample_rate=44100",
        "-shortest",
        "-t", str(total_duration),
        "-c:v", "libx264",
        "-c:a", "aac",
        "-b:a", "128k",
        "-pix_fmt", "yuv420p",
        "-movflags", "+faststart",
        output_mp4.as_posix()
    ])

    print(json.dumps({
        "ok": True,
        "output": output_mp4.as_posix(),
        "sizeBytes": output_mp4.stat().st_size,
        "durationSeconds": total_duration,
        "sceneCount": len(scenes),
    }))

if __name__ == "__main__":
    main()
