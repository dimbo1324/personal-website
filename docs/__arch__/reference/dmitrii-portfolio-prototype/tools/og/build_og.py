#!/usr/bin/env python3
"""
Renders assets/social/og-image.png (1200×630) — the link preview for
LinkedIn, Telegram, WhatsApp, Slack…  Uses the site's own fonts and portrait.
Requires: pip install pillow fonttools brotli
Usage: python3 tools/og/build_og.py
"""
import os, tempfile
from PIL import Image, ImageDraw, ImageFont, ImageFilter
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
FONTS = os.path.join(ROOT, "assets", "fonts")
W, H = 1200, 630
BG, INK, MUTED, ACCENT, AMBER, LINE = "#0a1114", "#f2f6f7", "#7e97a1", "#24b89b", "#f2994a", "#1d2c32"

def ttf(woff2, weight=None):
    """woff2 (optionally variable) → static TTF path PIL can read."""
    font = TTFont(os.path.join(FONTS, woff2))
    if weight is not None:
        font = instantiateVariableFont(font, {"wght": weight})
    font.flavor = None
    path = os.path.join(tempfile.gettempdir(), f"og-{woff2}-{weight}.ttf")
    font.save(path)
    return path

def main():
    sans_bold = ttf("manrope-latin-wght-normal.woff2", 800)
    sans_mid = ttf("manrope-latin-wght-normal.woff2", 600)
    mono = ttf("jetbrains-mono-latin-500-normal.woff2")
    F = lambda path, size: ImageFont.truetype(path, size)

    img = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(img)

    # dot grid + soft teal glow behind the portrait
    for y in range(18, H, 24):
        for x in range(18, W, 24):
            d.point((x, y), fill="#16252b")
    glow = Image.new("RGB", (W, H), BG)
    ImageDraw.Draw(glow).ellipse((760, 70, 1180, 490), fill="#0f3a33")
    img = Image.blend(img, glow.filter(ImageFilter.GaussianBlur(90)), 0.55)
    d = ImageDraw.Draw(img)

    # top bar: teal with an amber head (same "laser" colours as the site)
    d.rectangle((0, 0, W, 6), fill=ACCENT)
    d.rectangle((0, 0, 220, 6), fill=AMBER)

    x0 = 72
    d.text((x0, 78), "INDUSTRIAL AUTOMATION · IIOT · SOFTWARE", font=F(mono, 22), fill=ACCENT)
    d.text((x0, 122), "Dmitrii", font=F(sans_bold, 112), fill=INK)
    d.text((x0, 238), "Prikhodko", font=F(sans_bold, 112), fill=ACCENT)

    d.text((x0, 384), "PLC / DCS / SIS commissioning · digital twins · C++ / Python",
           font=F(sans_mid, 25), fill="#bdd0d6")

    kpis = [("5+ yrs", "OT / IT", INK), ("2,500+", "refinery I/O", ACCENT), ("−25%", "PLC delivery", AMBER), ("+12%", "plant yield", INK)]
    kx = x0
    for value, label, colour in kpis:
        d.line((kx, 446, kx, 520), fill=LINE, width=2)
        d.text((kx + 16, 446), value, font=F(sans_bold, 38), fill=colour)
        d.text((kx + 16, 496), label.upper(), font=F(mono, 15), fill=MUTED)
        kx += 168

    d.ellipse((x0, 572, x0 + 12, 584), fill=ACCENT)
    d.text((x0 + 26, 566), "Montevideo, Uruguay · open to work & collaboration", font=F(mono, 19), fill=MUTED)

    # portrait in a ringed circle
    size = 330
    portrait = Image.open(os.path.join(ROOT, "assets", "images", "portrait.webp")).convert("RGB").resize((size, size), Image.LANCZOS)
    mask = Image.new("L", (size, size), 0)
    ImageDraw.Draw(mask).ellipse((0, 0, size - 1, size - 1), fill=255)
    px, py = 812, 112
    d.ellipse((px - 14, py - 14, px + size + 14, py + size + 14), outline=ACCENT, width=3)
    d.arc((px - 30, py - 30, px + size + 30, py + size + 30), start=200, end=290, fill=AMBER, width=3)
    img.paste(portrait, (px, py), mask)

    out = os.path.join(ROOT, "assets", "social", "og-image.png")
    img.save(out, optimize=True)
    print("wrote", os.path.relpath(out, ROOT), os.path.getsize(out) // 1024, "KB")

if __name__ == "__main__":
    main()
