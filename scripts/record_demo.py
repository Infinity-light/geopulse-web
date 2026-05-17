# -*- coding: utf-8 -*-
"""
GeoPulse demo recorder.

Drives a headless Chromium through a complete tour of the trading terminal
and records a 45-second video that highlights every column + the daily
report + the architecture page. Converts WebM → MP4 + animated GIF using
ffmpeg (via imageio-ffmpeg, no system install needed).

Usage:
    python scripts/record_demo.py [base_url]

base_url defaults to http://127.0.0.1:3000.
"""

import sys
import time
import shutil
import subprocess
from pathlib import Path

import imageio_ffmpeg
from playwright.sync_api import sync_playwright

BASE = sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1:3000"
OUT_DIR = Path(__file__).resolve().parent.parent / "media"
OUT_DIR.mkdir(parents=True, exist_ok=True)

VIDEO_WEBM = OUT_DIR / "demo.webm"
VIDEO_MP4 = OUT_DIR / "demo.mp4"
GIF = OUT_DIR / "demo.gif"
GIF_PALETTE = OUT_DIR / "_palette.png"

FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()


def record():
    with sync_playwright() as pw:
        browser = pw.chromium.launch(headless=True)
        ctx = browser.new_context(
            viewport={"width": 1440, "height": 900},
            record_video_dir=str(OUT_DIR),
            record_video_size={"width": 1440, "height": 900},
        )
        page = ctx.new_page()

        # 1. Terminal — initial framing (5 s)
        page.goto(f"{BASE}/", wait_until="domcontentloaded", timeout=60_000)
        page.wait_for_timeout(2500)

        # 2. Highlight Geo Pulse Feed (left column) by scrolling it (5 s)
        page.evaluate(
            "() => { const sec = document.querySelectorAll('section')[0]; "
            "if (sec) { const list = sec.querySelector('ul'); "
            "if (list) list.scrollTo({ top: 240, behavior: 'smooth' }); } }"
        )
        page.wait_for_timeout(3500)

        # 3. Hover Market Watch first asset card (5 s)
        try:
            page.locator("text=BTC/USDT").first.hover(timeout=5_000)
        except Exception:
            pass
        page.wait_for_timeout(3500)

        # 4. Scroll center column down to reveal Correlation Heatmap (5 s)
        page.evaluate(
            "() => { const center = document.querySelectorAll('main > div')[1]; "
            "if (center) center.scrollTo({ top: 9999, behavior: 'smooth' }); }"
        )
        page.wait_for_timeout(4000)

        # 5. Hover the Signal Stream (right column) (4 s)
        try:
            page.locator("text=AI Signal Stream").first.hover(timeout=5_000)
        except Exception:
            pass
        page.wait_for_timeout(3500)

        # 6. Navigate to Daily report (5 s)
        page.click("text=DAILY", timeout=5_000)
        page.wait_for_load_state("domcontentloaded", timeout=30_000)
        page.wait_for_timeout(2500)
        page.evaluate("() => window.scrollBy({ top: 600, behavior: 'smooth' })")
        page.wait_for_timeout(2500)

        # 7. Navigate to Architecture page (5 s)
        page.click("text=ARCHITECTURE", timeout=5_000)
        page.wait_for_load_state("domcontentloaded", timeout=30_000)
        page.wait_for_timeout(2500)
        page.evaluate("() => window.scrollBy({ top: 500, behavior: 'smooth' })")
        page.wait_for_timeout(2500)

        # 8. Back to Terminal for the closing beat (3 s)
        page.click("text=TERMINAL", timeout=5_000)
        page.wait_for_load_state("domcontentloaded", timeout=30_000)
        page.wait_for_timeout(3000)

        video_path = page.video.path() if page.video else None
        ctx.close()
        browser.close()

        if not video_path:
            raise RuntimeError("Playwright did not produce a video file")
        src = Path(video_path)
        if src.resolve() != VIDEO_WEBM.resolve():
            shutil.move(src, VIDEO_WEBM)
        print(f"[record] saved webm → {VIDEO_WEBM}")


def convert_to_mp4():
    cmd = [
        FFMPEG, "-y", "-i", str(VIDEO_WEBM),
        "-c:v", "libx264", "-preset", "fast", "-crf", "23",
        "-pix_fmt", "yuv420p",
        "-movflags", "+faststart",
        str(VIDEO_MP4),
    ]
    subprocess.check_call(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    print(f"[convert] mp4 → {VIDEO_MP4}  ({VIDEO_MP4.stat().st_size / 1024:.0f} KB)")


def convert_to_gif():
    palette_cmd = [
        FFMPEG, "-y", "-i", str(VIDEO_WEBM),
        "-vf", "fps=12,scale=900:-1:flags=lanczos,palettegen=stats_mode=diff",
        str(GIF_PALETTE),
    ]
    subprocess.check_call(palette_cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

    gif_cmd = [
        FFMPEG, "-y", "-i", str(VIDEO_WEBM), "-i", str(GIF_PALETTE),
        "-lavfi",
        "fps=12,scale=900:-1:flags=lanczos [x]; [x][1:v] paletteuse=dither=bayer:bayer_scale=5",
        str(GIF),
    ]
    subprocess.check_call(gif_cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    GIF_PALETTE.unlink(missing_ok=True)
    print(f"[convert] gif → {GIF}  ({GIF.stat().st_size / 1024:.0f} KB)")


def main():
    print(f"Recording demo from {BASE}")
    record()
    convert_to_mp4()
    convert_to_gif()
    print("\nAll outputs:")
    for p in [VIDEO_WEBM, VIDEO_MP4, GIF]:
        if p.exists():
            print(f"  {p}  ({p.stat().st_size / 1024:.0f} KB)")


if __name__ == "__main__":
    main()
