#!/usr/bin/env python3
"""
Builds assets/cv/Dmitrii-Prikhodko-CV-{EN,ES,RU}.pdf from content.py.
Requires: pip install reportlab   ·   Fonts: Fira Sans (has Cyrillic), DejaVu Sans Mono.
Usage: python3 tools/cv/build_cv.py
"""
import os, sys
from xml.sax.saxutils import escape
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.colors import HexColor
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_RIGHT
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (BaseDocTemplate, Frame, PageTemplate, Paragraph, Spacer, Table, TableStyle,
                                KeepTogether)

sys.path.insert(0, os.path.dirname(__file__))
from content import CV, CONTACTS  # noqa: E402

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
FONT_DIRS = ["/usr/share/fonts/truetype/google-fonts/ofl/firasans", "/usr/share/fonts/truetype/dejavu"]

def find(name):
    for d in FONT_DIRS:
        p = os.path.join(d, name)
        if os.path.exists(p): return p
    raise SystemExit(f"font not found: {name}")

pdfmetrics.registerFont(TTFont("Sans", find("FiraSans-Regular.ttf")))
pdfmetrics.registerFont(TTFont("Sans-Light", find("FiraSans-Light.ttf")))
pdfmetrics.registerFont(TTFont("Sans-Medium", find("FiraSans-Medium.ttf")))
pdfmetrics.registerFont(TTFont("Sans-Bold", find("FiraSans-Bold.ttf")))
pdfmetrics.registerFont(TTFont("Mono", find("DejaVuSansMono.ttf")))
pdfmetrics.registerFontFamily("Sans", normal="Sans", bold="Sans-Bold", italic="Sans", boldItalic="Sans-Bold")

INK = HexColor("#0e171b"); MUTED = HexColor("#5b7079"); ACCENT = HexColor("#158772"); AMBER = HexColor("#c56a1c")
RULE = HexColor("#d5e0e3"); TINT = HexColor("#eef6f4")

def make_styles(k=1.0):
  return {
  "name": ParagraphStyle("name", fontName="Sans-Bold", fontSize=24 * k, leading=27 * k, textColor=INK),
  "title": ParagraphStyle("title", fontName="Sans-Medium", fontSize=11.5 * k, leading=15 * k, textColor=ACCENT),
  "meta": ParagraphStyle("meta", fontName="Mono", fontSize=7.6 * k, leading=11 * k, textColor=MUTED),
  "h": ParagraphStyle("h", fontName="Mono", fontSize=8 * k, leading=10 * k, textColor=ACCENT, spaceBefore=9 * k, spaceAfter=4 * k),
  "body": ParagraphStyle("body", fontName="Sans", fontSize=9.4 * k, leading=13 * k, textColor=INK),
  "small": ParagraphStyle("small", fontName="Sans", fontSize=8.8 * k, leading=12 * k, textColor=MUTED),
  "bullet": ParagraphStyle("bullet", fontName="Sans", fontSize=9 * k, leading=12.2 * k, textColor=INK, leftIndent=9, bulletIndent=0),
  "job": ParagraphStyle("job", fontName="Sans-Bold", fontSize=10.4 * k, leading=13 * k, textColor=INK),
  "role": ParagraphStyle("role", fontName="Sans", fontSize=9 * k, leading=12 * k, textColor=MUTED),
  "years": ParagraphStyle("years", fontName="Mono", fontSize=7.8 * k, leading=13 * k, textColor=ACCENT),
  "years-r": ParagraphStyle("years-r", fontName="Mono", fontSize=7.8 * k, leading=13 * k, textColor=ACCENT, alignment=TA_RIGHT),
  "metric": ParagraphStyle("metric", fontName="Sans-Bold", fontSize=15 * k, leading=17 * k, textColor=ACCENT),
  "label": ParagraphStyle("label", fontName="Sans-Medium", fontSize=8.8 * k, leading=12 * k, textColor=INK),
  "footer": ParagraphStyle("footer", fontName="Mono", fontSize=7 * k, leading=9 * k, textColor=MUTED),
}

S = make_styles(1.0)  # body 9.4 pt

P = lambda text, style: Paragraph(escape(text), S[style])

def heading(text):
    t = Table([[Paragraph(escape(text.upper()), S["h"])]], colWidths=["100%"])
    t.setStyle(TableStyle([("LINEBELOW", (0, 0), (-1, -1), 0.6, RULE), ("LEFTPADDING", (0, 0), (-1, -1), 0),
                           ("BOTTOMPADDING", (0, 0), (-1, -1), 3), ("TOPPADDING", (0, 0), (-1, -1), 0)]))
    return t

def build(lang, data, width):
    story = []
    contacts = f"{CONTACTS['email']}   ·   {CONTACTS['linkedin']}   ·   {CONTACTS['github']}"
    story += [P(data["name"], "name"), Spacer(1, 2), P(data["title"], "title"), Spacer(1, 5), P(contacts, "meta"),
              P(f"{data['location']}   ·   {data['availability']}", "meta")]
    story += [heading(data["sections"]["profile"]), P(data["profile"], "body")]

    cells = [[Paragraph(escape(v), S["metric"]), Paragraph(escape(t), S["small"])] for v, t in data["results"]]
    row = [Table([[c[0]], [c[1]]], colWidths=[width / 3 - 8]) for c in cells]
    for t in row:
        t.setStyle(TableStyle([("LEFTPADDING", (0, 0), (-1, -1), 8), ("TOPPADDING", (0, 0), (-1, -1), 2),
                               ("BACKGROUND", (0, 0), (-1, -1), TINT), ("LINEBEFORE", (0, 0), (0, -1), 2, ACCENT)]))
    results = Table([row], colWidths=[width / 3] * 3)
    results.setStyle(TableStyle([("LEFTPADDING", (0, 0), (-1, -1), 0), ("RIGHTPADDING", (0, 0), (-1, -1), 8),
                                 ("VALIGN", (0, 0), (-1, -1), "TOP")]))
    story += [heading(data["sections"]["results"]), results]

    story.append(heading(data["sections"]["experience"]))
    for years, company, role, bullets in data["jobs"]:
        head = Table([[P(company, "job"), P(years, "years-r")]], colWidths=[width * 0.75, width * 0.25])
        head.setStyle(TableStyle([("ALIGN", (1, 0), (1, 0), "RIGHT"), ("LEFTPADDING", (0, 0), (-1, -1), 0),
                                  ("RIGHTPADDING", (0, 0), (-1, -1), 0), ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
                                  ("VALIGN", (0, 0), (-1, -1), "BOTTOM")]))
        block = [head, P(role, "role"), Spacer(1, 2)]
        block += [Paragraph(escape(b), S["bullet"], bulletText="•") for b in bullets]
        block.append(Spacer(1, 4))
        story.append(KeepTogether(block))

    rows = [[P(k, "label"), P(v, "body")] for k, v in data["skills"]]
    skills = Table(rows, colWidths=[width * 0.2, width * 0.8])
    skills.setStyle(TableStyle([("LEFTPADDING", (0, 0), (-1, -1), 0), ("TOPPADDING", (0, 0), (-1, -1), 1.5),
                                ("BOTTOMPADDING", (0, 0), (-1, -1), 1.5), ("VALIGN", (0, 0), (-1, -1), "TOP")]))
    story.append(KeepTogether([heading(data["sections"]["skills"]), skills]))

    edu = [[P(y, "years"), [P(t, "label"), P(s, "small")]] for y, t, s in data["education"]]
    edu_t = Table(edu, colWidths=[width * 0.16, width * 0.53 - 14])
    edu_t.setStyle(TableStyle([("LEFTPADDING", (0, 0), (-1, -1), 0), ("VALIGN", (0, 0), (-1, -1), "TOP"),
                               ("BOTTOMPADDING", (0, 0), (-1, -1), 4)]))
    lang_rows = [[P(n, "label"), P(lvl, "small")] for n, lvl in data["languages"]]
    lang_t = Table(lang_rows, colWidths=[width * 0.15, width * 0.14])
    lang_t.setStyle(TableStyle([("LEFTPADDING", (0, 0), (-1, -1), 0), ("TOPPADDING", (0, 0), (-1, -1), 1),
                                ("BOTTOMPADDING", (0, 0), (-1, -1), 1)]))
    left = [heading(data["sections"]["education"]), edu_t]
    right = [heading(data["sections"]["languages"]), lang_t]
    bottom = Table([[left, right]], colWidths=[width * 0.69, width * 0.31])
    bottom.setStyle(TableStyle([("LEFTPADDING", (0, 0), (-1, -1), 0), ("RIGHTPADDING", (0, 0), (0, 0), 14),
                                ("RIGHTPADDING", (1, 0), (1, 0), 0), ("VALIGN", (0, 0), (-1, -1), "TOP")]))
    story.append(bottom)
    return story

def page_decor(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(ACCENT); canvas.rect(0, A4[1] - 4, A4[0], 4, stroke=0, fill=1)
    canvas.setFillColor(AMBER); canvas.rect(0, A4[1] - 4, A4[0] * 0.18, 4, stroke=0, fill=1)
    canvas.setFont("Mono", 7); canvas.setFillColor(MUTED)
    canvas.drawRightString(A4[0] - 18 * mm, 10 * mm, f"{doc.page}")
    canvas.restoreState()

def main():
    out = os.path.join(ROOT, "assets", "cv"); os.makedirs(out, exist_ok=True)
    for lang, data in CV.items():
        path = os.path.join(out, f"Dmitrii-Prikhodko-CV-{lang.upper()}.pdf")
        doc = BaseDocTemplate(path, pagesize=A4, leftMargin=18 * mm, rightMargin=18 * mm, topMargin=14 * mm,
                              bottomMargin=13 * mm, title=f"{data['name']} — CV", author=data["name"],
                              subject=data["title"], lang=lang)
        frame = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id="f", leftPadding=0, rightPadding=0,
                      topPadding=0, bottomPadding=0)
        doc.addPageTemplates([PageTemplate(id="p", frames=[frame], onPage=page_decor)])
        doc.build(build(lang, data, doc.width))
        print("wrote", os.path.relpath(path, ROOT), f"({doc.page} pages)")

if __name__ == "__main__":
    main()
