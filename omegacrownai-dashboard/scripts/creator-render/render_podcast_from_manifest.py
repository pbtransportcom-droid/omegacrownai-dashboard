#!/usr/bin/env python3
import json
import subprocess
import sys
from pathlib import Path

SAMPLE_RATE = 44100

def safe_text(value):
    return str(value or "").replace("\n", " ").strip()

def get_audio_style(manifest):
    style = manifest.get("audioStyle") or {}
    return {
        "musicMood": style.get("musicMood") or manifest.get("audioPlan", {}).get("music") or "cinematic",
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

def run(cmd):
    subprocess.run(cmd, check=True)

def create_tone_audio(freq, duration, volume, out_path):
    run([
        "ffmpeg", "-y",
        "-f", "lavfi",
        "-i", f"sine=frequency={freq}:duration={duration}:sample_rate={SAMPLE_RATE}",
        "-af", f"volume={volume},afade=t=in:st=0:d=0.4,afade=t=out:st={max(duration - 0.5, 0)}:d=0.5",
        out_path.as_posix()
    ])

def create_intro_music(duration, out_path, audio_style):
    freq_one, freq_two = mood_frequencies(audio_style["musicMood"])
    music_volume = audio_style["musicVolume"]

    run([
        "ffmpeg", "-y",
        "-f", "lavfi",
        "-i", f"sine=frequency={freq_one}:duration={duration}:sample_rate={SAMPLE_RATE}",
        "-f", "lavfi",
        "-i", f"sine=frequency={freq_two}:duration={duration}:sample_rate={SAMPLE_RATE}",
        "-filter_complex",
        f"[0:a]volume={0.060 * music_volume}[a0];[1:a]volume={0.028 * music_volume}[a1];[a0][a1]amix=inputs=2:duration=longest,afade=t=in:st=0:d=0.5,afade=t=out:st={max(duration - 0.7, 0)}:d=0.7[a]",
        "-map", "[a]",
        out_path.as_posix()
    ])

def create_narration_placeholder(text, index, duration, out_path, audio_style):
    text = safe_text(text)
    word_count = max(len(text.split()), 1)

    if not text:
        text = f"Podcast segment {index + 1}. OmegaCrownAI creator export."

    raw_tts = out_path.with_suffix(".raw_tts.wav")

    try:
        run([
            "espeak-ng",
            "-v", "en-us",
            "-s", str(audio_style["voiceSpeed"]),
            "-p", str(audio_style["voicePitch"]),
            "-a", "150",
            "-w", raw_tts.as_posix(),
            text
        ])

        run([
            "ffmpeg", "-y",
            "-i", raw_tts.as_posix(),
            "-af", f"volume={1.20 * audio_style['voiceVolume']},aresample={SAMPLE_RATE}:async=1,apad,atrim=0:{duration},afade=t=in:st=0:d=0.12,afade=t=out:st={max(duration - 0.2, 0)}:d=0.18",
            out_path.as_posix()
        ])

        return {
            "index": index,
            "wordCount": word_count,
            "durationSeconds": duration,
            "type": "podcast_tts_narration",
            "engine": "espeak-ng",
            "voice": "en-us",
            "speed": audio_style["voiceSpeed"],
            "pitch": audio_style["voicePitch"],
            "text": text,
            "file": out_path.as_posix()
        }

    except Exception:
        freq = 360 + (index % 8) * 30

        run([
            "ffmpeg", "-y",
            "-f", "lavfi",
            "-i", f"sine=frequency={freq}:duration={duration}:sample_rate={SAMPLE_RATE}",
            "-af", f"volume=0.070,afade=t=in:st=0:d=0.2,afade=t=out:st={max(duration - 0.25, 0)}:d=0.25",
            out_path.as_posix()
        ])

        return {
            "index": index,
            "wordCount": word_count,
            "frequency": freq,
            "durationSeconds": duration,
            "type": "podcast_narration_fallback_tone",
            "engine": "ffmpeg_sine",
            "text": text,
            "file": out_path.as_posix()
        }

def concat_audio(audio_files, concat_path, output_path):
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

def main():
    if len(sys.argv) != 4:
        print("Usage: render_podcast_from_manifest.py <manifest_json> <work_dir> <output_mp3>", file=sys.stderr)
        sys.exit(2)

    manifest_path = Path(sys.argv[1])
    work_dir = Path(sys.argv[2])
    output_mp3 = Path(sys.argv[3])

    work_dir.mkdir(parents=True, exist_ok=True)
    output_mp3.parent.mkdir(parents=True, exist_ok=True)

    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    audio_style = get_audio_style(manifest)
    title = safe_text(manifest.get("title") or "OmegaCrownAI Podcast")
    description = safe_text(manifest.get("description") or "")

    # Accept several possible shapes so the renderer works with current and future podcast schemas.
    segments = manifest.get("segments") or manifest.get("chapters") or manifest.get("scenes") or []
    if not segments:
        source_text = description or title or "OmegaCrownAI podcast export."
        segments = [
            {
                "title": "Introduction",
                "scriptText": f"Welcome to {title}. {source_text}",
                "durationSeconds": 10,
            },
            {
                "title": "Main Segment",
                "scriptText": source_text,
                "durationSeconds": max(18, min(int(manifest.get("durationSeconds") or 60), 90)),
            },
            {
                "title": "Closing",
                "scriptText": "Thank you for listening. This episode was prepared by OmegaCrownAI.",
                "durationSeconds": 10,
            },
        ]

    audio_files = []
    narration_manifest = []

    intro = work_dir / "intro_music.wav"
    if audio_style["introOutro"]:
        create_intro_music(5, intro, audio_style)
        audio_files.append(intro)

    for index, segment in enumerate(segments):
        text = safe_text(
            segment.get("scriptText")
            or segment.get("voiceoverText")
            or segment.get("text")
            or segment.get("summary")
            or segment.get("title")
            or ""
        )

        duration = int(segment.get("durationSeconds") or max(6, min(len(text.split()) // 2, 25)))
        duration = max(5, min(duration, 45))

        segment_audio = work_dir / f"narration_{index + 1:03d}.wav"
        info = create_narration_placeholder(text, index, duration, segment_audio, audio_style)
        info["title"] = safe_text(segment.get("title") or f"Segment {index + 1}")
        narration_manifest.append(info)
        audio_files.append(segment_audio)

    outro = work_dir / "outro_music.wav"
    if audio_style["introOutro"]:
        create_intro_music(5, outro, audio_style)
        audio_files.append(outro)

    concat_path = work_dir / "podcast_concat.txt"
    wav_mix = work_dir / "podcast_mix.wav"
    concat_audio(audio_files, concat_path, wav_mix)

    # Convert to MP3 with tags.
    run([
        "ffmpeg", "-y",
        "-i", wav_mix.as_posix(),
        "-codec:a", "libmp3lame",
        "-b:a", "192k",
        "-ar", str(SAMPLE_RATE),
        "-metadata", f"title={title}",
        "-metadata", "artist=OmegaCrownAI",
        "-metadata", "album=OmegaCrownAI Creator Exports",
        "-metadata", f"comment={description[:240]}",
        output_mp3.as_posix()
    ])

    total_duration = (10 if audio_style["introOutro"] else 0) + sum(item["durationSeconds"] for item in narration_manifest)

    print(json.dumps({
        "ok": True,
        "output": output_mp3.as_posix(),
        "sizeBytes": output_mp3.stat().st_size,
        "durationSeconds": total_duration,
        "segmentCount": len(narration_manifest),
        "audio": {
            "renderer": "podcast_espeak_tts_narration_music_bed",
            "audioStyle": audio_style,
            "codec": "mp3",
            "sampleRate": SAMPLE_RATE,
            "bitrate": "192k",
            "introOutro": True,
            "narrationPlaceholders": narration_manifest,
            "workDir": work_dir.as_posix()
        }
    }))

if __name__ == "__main__":
    main()
