#!/usr/bin/env python3
import json
import os
import subprocess
import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter

WIDTH = 1280
HEIGHT = 720
FPS = 24
SAMPLE_RATE = 44100

def safe_text(value):
    return str(value or "").replace("\n", " ").strip()

def get_audio_style(manifest):
    style = manifest.get("audioStyle") or {}
    return {
        "musicMood": style.get("musicMood") or "cinematic",
        "voiceSpeed": int(style.get("voiceSpeed") or 145),
        "voicePitch": int(style.get("voicePitch") or 45),
        "introOutro": False if style.get("introOutro") is False else True,
        "musicVolume": float(style.get("musicVolume") or 1),
        "voiceVolume": float(style.get("voiceVolume") or 1),
    }

def mood_frequencies(mood):
    mood = str(mood or "cinematic").lower()
    if mood == "royal":
        return (98, 196)
    if mood == "energetic":
        return (146, 292)
    if mood == "calm":
        return (82, 164)
    if mood == "dramatic":
        return (73, 146)
    if mood == "luxury":
        return (110, 220)
    return (110, 220)

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
    asset_path = scene.get("assetPath") or scene.get("visualAssetPath")

    if asset_path and os.path.exists(asset_path):
        img = Image.open(asset_path).convert("RGB").resize((WIDTH, HEIGHT))
        img = img.filter(ImageFilter.GaussianBlur(radius=0.2))
    else:
        img = Image.new("RGB", (WIDTH, HEIGHT), (8, 12, 28))
        draw_base = ImageDraw.Draw(img)
        for y in range(HEIGHT):
            r = int(8 + y / HEIGHT * 12)
            g = int(12 + y / HEIGHT * 22)
            b = int(28 + y / HEIGHT * 45)
            draw_base.line([(0, y), (WIDTH, y)], fill=(r, g, b))

    draw = ImageDraw.Draw(img, "RGBA")

    draw.rectangle((0, 0, WIDTH, HEIGHT), fill=(0, 0, 0, 85))
    draw.rounded_rectangle((70, 60, WIDTH - 70, HEIGHT - 60), radius=36, outline=(58, 214, 255, 170), width=3)
    draw.rounded_rectangle((95, 88, WIDTH - 95, HEIGHT - 88), radius=28, fill=(10, 20, 42, 125))

    font_small = load_font(28)
    font_title = load_font(56)
    font_body = load_font(38)
    font_footer = load_font(24)

    scene_title = safe_text(scene.get("title") or f"Scene {index + 1}")
    caption = safe_text(scene.get("caption") or scene_title)
    voiceover = safe_text(scene.get("voiceoverText") or scene.get("scriptSegment") or scene.get("visualPrompt") or "")
    timeline_order = safe_text(scene.get("timelineOrder") if scene.get("timelineOrder") is not None else index)
    duration = safe_text(scene.get("durationSeconds") or "")

    draw.text((120, 120), f"OmegaCrownAI · Timeline Scene {index + 1} of {total}", font=font_small, fill=(103, 232, 249))
    draw.text((WIDTH - 390, 120), f"Order {timeline_order} · {duration}s", font=font_footer, fill=(148, 235, 255))

    draw_wrapped(draw, scene_title, font_title, 120, 180, WIDTH - 240, line_spacing=16, fill=(255, 255, 255))

    y = 320
    if caption:
        draw.rounded_rectangle((120, y - 12, WIDTH - 120, y + 82), radius=18, fill=(15, 31, 58), outline=(34, 211, 238), width=1)
        draw_wrapped(draw, caption, font_body, 145, y, WIDTH - 290, line_spacing=10, fill=(235, 253, 255))
        y += 115

    if voiceover:
        y = draw_wrapped(draw, voiceover, font_small, 120, y, WIDTH - 240, line_spacing=10, fill=(205, 215, 235))
    else:
        draw.text((120, y), "Generated creator timeline card", font=font_small, fill=(205, 215, 235))

    draw.text((120, HEIGHT - 120), safe_text(title), font=font_footer, fill=(148, 163, 184))
    draw.text((WIDTH - 430, HEIGHT - 120), "Timeline Export · OmegaCrownAI", font=font_footer, fill=(148, 163, 184))

    img.save(out_path)

def run(cmd):
    subprocess.run(cmd, check=True)

def scene_tone_frequency(index):
    # Gentle placeholder voice cue per scene, not speech synthesis yet.
    base = 420
    return base + (index % 6) * 35

def create_voiceover_placeholder(scene, index, duration, out_path, audio_style):
    text = safe_text(scene.get("voiceoverText") or scene.get("scriptSegment") or scene.get("visualPrompt") or "")
    word_count = max(len(text.split()), 1)

    if not text:
        text = f"Scene {index + 1}. OmegaCrownAI creator export."

    raw_tts = out_path.with_suffix(".raw_tts.wav")

    try:
        run([
            "espeak-ng",
            "-v", "en-us",
            "-s", str(audio_style["voiceSpeed"]),
            "-p", str(audio_style["voicePitch"]),
            "-a", "145",
            "-w", raw_tts.as_posix(),
            text
        ])

        run([
            "ffmpeg", "-y",
            "-i", raw_tts.as_posix(),
            "-af", "volume={},aresample={}:async=1,apad,atrim=0:{},afade=t=in:st=0:d=0.12,afade=t=out:st={}:d=0.18".format(
                1.15 * audio_style["voiceVolume"],
                SAMPLE_RATE,
                duration,
                max(duration - 0.2, 0)
            ),
            out_path.as_posix()
        ])

        return {
            "sceneIndex": index,
            "durationSeconds": duration,
            "wordCount": word_count,
            "type": "tts_voiceover",
            "engine": "espeak-ng",
            "voice": "en-us",
            "speed": audio_style["voiceSpeed"],
            "pitch": audio_style["voicePitch"],
            "text": text,
            "file": out_path.as_posix()
        }

    except Exception:
        freq = scene_tone_frequency(index)

        run([
            "ffmpeg", "-y",
            "-f", "lavfi",
            "-i", f"sine=frequency={freq}:duration={duration}:sample_rate={SAMPLE_RATE}",
            "-af", "volume=0.055,afade=t=in:st=0:d=0.25,afade=t=out:st={}:d=0.35".format(max(duration - 0.35, 0)),
            out_path.as_posix()
        ])

        return {
            "sceneIndex": index,
            "durationSeconds": duration,
            "wordCount": word_count,
            "frequency": freq,
            "type": "voiceover_fallback_tone",
            "engine": "ffmpeg_sine",
            "text": text,
            "file": out_path.as_posix()
        }

def create_music_bed(duration, out_path, audio_style):
    freq_one, freq_two = mood_frequencies(audio_style["musicMood"])
    music_volume = audio_style["musicVolume"]

    run([
        "ffmpeg", "-y",
        "-f", "lavfi",
        "-i", f"sine=frequency={freq_one}:duration={duration}:sample_rate={SAMPLE_RATE}",
        "-f", "lavfi",
        "-i", f"sine=frequency={freq_two}:duration={duration}:sample_rate={SAMPLE_RATE}",
        "-filter_complex",
        "[0:a]volume={}[a0];[1:a]volume={}[a1];[a0][a1]amix=inputs=2:duration=longest,afade=t=in:st=0:d=1,afade=t=out:st={}:d=1[a]".format(
            0.035 * music_volume,
            0.018 * music_volume,
            max(duration - 1, 0)
        ),
        "-map", "[a]",
        out_path.as_posix()
    ])

def concat_audio_files(audio_files, concat_path, output_path):
    concat_path.write_text(
        "".join([f"file '{file.as_posix()}'\n" for file in audio_files]),
        encoding="utf-8"
    )

    run([
        "ffmpeg", "-y",
        "-f", "concat",
        "-safe", "0",
        "-i", concat_path.as_posix(),
        "-c", "copy",
        output_path.as_posix()
    ])

def mix_audio(voice_track, music_bed, output_path):
    run([
        "ffmpeg", "-y",
        "-i", voice_track.as_posix(),
        "-i", music_bed.as_posix(),
        "-filter_complex",
        "[0:a]volume=1.0[a0];[1:a]volume=1.0[a1];[a0][a1]amix=inputs=2:duration=longest:dropout_transition=0,alimiter=limit=0.8[a]",
        "-map", "[a]",
        "-c:a", "aac",
        "-b:a", "128k",
        output_path.as_posix()
    ])

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
    audio_style = get_audio_style(manifest)
    title = manifest.get("title") or "OmegaCrownAI Video"
    scenes = manifest.get("scenes") or []

    if not scenes:
        scenes = [{
            "title": title,
            "voiceoverText": manifest.get("description") or "OmegaCrownAI creator export.",
            "durationSeconds": manifest.get("durationSeconds") or 8
        }]

    concat_file = work_dir / "concat.txt"
    video_lines = []
    audio_files = []
    audio_manifest = []

    for index, scene in enumerate(scenes):
        duration = int(scene.get("durationSeconds") or 6)
        duration = max(3, min(duration, 20))

        card_path = work_dir / f"scene_{index + 1:03d}.png"
        create_scene_card(scene, index, len(scenes), title, card_path)

        video_lines.append(f"file '{card_path.as_posix()}'\n")
        video_lines.append(f"duration {duration}\n")

        scene_audio = work_dir / f"voice_scene_{index + 1:03d}.wav"
        audio_info = create_voiceover_placeholder(scene, index, duration, scene_audio, audio_style)
        audio_manifest.append(audio_info)
        audio_files.append(scene_audio)

    last_card = work_dir / f"scene_{len(scenes):03d}.png"
    video_lines.append(f"file '{last_card.as_posix()}'\n")
    concat_file.write_text("".join(video_lines), encoding="utf-8")

    temp_video = work_dir / "video_no_audio.mp4"

    run([
        "ffmpeg", "-y",
        "-f", "concat",
        "-safe", "0",
        "-i", concat_file.as_posix(),
        "-vsync", "vfr",
        "-pix_fmt", "yuv420p",
        "-r", str(FPS),
        temp_video.as_posix()
    ])

    total_duration = sum(item["durationSeconds"] for item in audio_manifest)

    voice_concat = work_dir / "voice_concat.txt"
    voice_track = work_dir / "voice_placeholder.wav"
    music_bed = work_dir / "music_bed.wav"
    mixed_audio = work_dir / "mixed_audio.m4a"

    concat_audio_files(audio_files, voice_concat, voice_track)
    create_music_bed(total_duration, music_bed, audio_style)
    mix_audio(voice_track, music_bed, mixed_audio)

    run([
        "ffmpeg", "-y",
        "-i", temp_video.as_posix(),
        "-i", mixed_audio.as_posix(),
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
        "timeline": {
            "source": manifest.get("source") or "timeline_editor",
            "exportSettings": manifest.get("exportSettings") or {},
            "sceneDurations": [scene.get("durationSeconds") for scene in scenes],
        },
        "visualAssets": {
            "enabled": any(scene.get("assetPath") or scene.get("visualAssetPath") for scene in scenes),
            "assets": [
                {
                    "sceneIndex": index,
                    "sceneId": scene.get("id"),
                    "assetPath": scene.get("assetPath") or scene.get("visualAssetPath"),
                    "assetEngine": scene.get("assetEngine"),
                }
                for index, scene in enumerate(scenes)
            ],
        },
        "audio": {
            "renderer": "espeak_tts_voiceover_plus_music_bed",
            "audioStyle": audio_style,
            "voiceTrack": voice_track.as_posix(),
            "musicBed": music_bed.as_posix(),
            "mixedAudio": mixed_audio.as_posix(),
            "voiceoverPlaceholders": audio_manifest,
            "codec": "aac",
            "sampleRate": SAMPLE_RATE
        }
    }))

if __name__ == "__main__":
    main()
