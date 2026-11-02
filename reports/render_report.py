"""Render the authored Arabic report to a self-contained printable HTML file."""
from pathlib import Path
import base64
import html
import re

ROOT = Path(__file__).resolve().parents[1]
REPORT = ROOT / "reports"
lines = (REPORT / "marjea-detailed-report-ar.md").read_text().splitlines()
title = lines.pop(0).removeprefix("# ")

def inline(text):
    text = html.escape(text)
    text = re.sub(r"`([^`]+)`", r'<code dir="ltr">\1</code>', text)
    text = re.sub(r"\*\*([^*]+)\*\*", r"<strong>\1</strong>", text)
    return re.sub(r"(https://[^\s<]+)", r'<a dir="ltr" href="\1" target="_blank" rel="noopener noreferrer">\1</a>', text)

def image_data(path, mime):
    return f"data:{mime};base64," + base64.b64encode(path.read_bytes()).decode()

sections, output = [], []
i = 0
while i < len(lines):
    line = lines[i].strip()
    if not line:
        i += 1
        continue
    if line == "<!--PORTAL_IMAGE-->":
        shot = Path("/tmp/replit-screenshots/marjea_afaq_CarL.jpg")
        if shot.exists():
            output.append(f'<figure><img src="{image_data(shot, "image/jpeg")}" alt="بوابة أفق بمساري الدخول والعرض"><figcaption>لقطة فعلية لبوابة أفق في بيئة التطوير، 3 أكتوبر 2026. لا تعرض بيانات حساب خاص.</figcaption></figure>')
    elif line.startswith("## "):
        heading = line[3:]
        key = f"section-{len(sections)+1}"
        sections.append((key, heading))
        output.append(f'<h2 id="{key}">{inline(heading)}</h2>')
    elif line.startswith("### "):
        output.append(f"<h3>{inline(line[4:])}</h3>")
    elif line.startswith("|"):
        rows = []
        while i < len(lines) and lines[i].strip().startswith("|"):
            cells = [v.strip() for v in lines[i].strip().strip("|").split("|")]
            if not all(re.fullmatch(r"[:\-\s]+", c) for c in cells):
                rows.append(cells)
            i += 1
        table = '<div class="table-wrap"><table><thead><tr>' + "".join(f"<th>{inline(c)}</th>" for c in rows[0]) + "</tr></thead><tbody>"
        for row in rows[1:]:
            table += "<tr>" + "".join(f"<td>{inline(c)}</td>" for c in row) + "</tr>"
        output.append(table + "</tbody></table></div>")
        continue
    elif line.startswith(">"):
        quotes = []
        while i < len(lines) and lines[i].strip().startswith(">"):
            quote = lines[i].strip().removeprefix(">").strip()
            if quote:
                quotes.append(f"<p>{inline(quote)}</p>")
            i += 1
        output.append("<blockquote>" + "".join(quotes) + "</blockquote>")
        continue
    elif line.startswith("- ") or re.match(r"\d+\.\s", line):
        ordered = not line.startswith("- ")
        tag = "ol" if ordered else "ul"
        items = []
        pattern = r"^\d+\.\s" if ordered else r"^- "
        while i < len(lines) and re.match(pattern, lines[i].strip()):
            items.append("<li>" + inline(re.sub(pattern, "", lines[i].strip())) + "</li>")
            i += 1
        output.append(f"<{tag}>" + "".join(items) + f"</{tag}>")
        continue
    else:
        paragraph = [line]
        while i + 1 < len(lines) and lines[i+1].strip() and not re.match(r"^(#|\||>|- |\d+\.\s|<!--)", lines[i+1].strip()):
            i += 1
            paragraph.append(lines[i].strip())
        output.append("<p>" + inline(" ".join(paragraph)) + "</p>")
    i += 1

css = """
*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:#f4f1ea;color:#15221e;font-family:'DejaVu Sans',Arial,sans-serif;font-size:15px;line-height:1.95}
.report{max-width:1080px;margin:30px auto;background:#fff;padding:48px 58px;box-shadow:0 8px 40px #102e1812}
.cover{border-bottom:4px solid #0a5c40;padding-bottom:24px;margin-bottom:24px}.brands{display:flex;align-items:center;gap:16px;flex-wrap:wrap;color:#45675a;font-weight:bold}.brands img{width:54px;height:54px;object-fit:contain;border-radius:12px}
h1{font-size:33px;line-height:1.55;margin:22px 0 10px;color:#0a5c40}.kicker{font-size:14px;color:#50615a}.badges{display:flex;gap:8px;flex-wrap:wrap}.badge{background:#e6f1ea;border:1px solid #cbded2;padding:5px 12px;border-radius:6px;font-size:12px}
h2{font-size:24px;line-height:1.6;color:#0a5c40;border-bottom:1px solid #d4e1d9;padding-bottom:9px;margin:36px 0 15px;scroll-margin-top:18px}h3{font-size:18px;color:#254b3a;margin:24px 0 10px}p{margin:10px 0}li{margin:7px 0}strong{font-weight:700}blockquote{margin:18px 0;background:#eff5f0;border-right:5px solid #0a5c40;padding:15px 22px;color:#203e30}
.toc{padding:20px 24px;background:#f6f8f5;border:1px solid #d9e5db;margin:25px 0}.toc b{display:block;font-size:19px;margin-bottom:10px}.toc ol{columns:2;column-gap:34px;padding:0;list-style:none;font-size:12px}.toc li{break-inside:avoid;margin:5px 0}
a{color:#075741;overflow-wrap:anywhere;text-decoration:none}a:hover{text-decoration:underline}a[dir=ltr],code{unicode-bidi:isolate;display:inline-block}code{font-family:'DejaVu Sans Mono',monospace;background:#f0f3f1;padding:0 4px;font-size:11px;overflow-wrap:anywhere}
.table-wrap{margin:16px 0}table{border-collapse:collapse;width:100%;font-size:12px;line-height:1.9;table-layout:auto}th,td{border:1px solid #d6dfd9;padding:10px 12px;text-align:right;vertical-align:top;overflow-wrap:anywhere}th{background:#e8f1eb;color:#16452d}tr:nth-child(even) td{background:#f8faf8}td a{font-size:10px}
figure{margin:24px 0;border:1px solid #d6dfd9;background:#fafaf8;padding:10px}figure img{display:block;width:100%;height:auto}figcaption{font-size:11px;color:#52645a;margin-top:8px}.foot{border-top:2px solid #0a5c40;margin-top:36px;padding-top:16px;font-size:12px;color:#52645a}.print{position:fixed;left:20px;bottom:20px;background:#0a5c40;color:white;border:0;border-radius:8px;padding:13px 22px;font:inherit;cursor:pointer}
@media(max-width:700px){.report{padding:25px 18px;margin:0}h1{font-size:25px}h2{font-size:21px}.toc ol{columns:1}table{font-size:11px}td,th{padding:7px}.print{position:static;margin:18px}}
@page{size:A4;margin:17mm 16mm;@bottom-center{content:counter(page) " / " counter(pages);font-family:'DejaVu Sans',sans-serif;font-size:8pt;color:#63766a}}
@media print{html{scroll-behavior:auto}body{background:#fff;font-size:10.5pt;line-height:1.85}.report{margin:0;padding:0;max-width:none;box-shadow:none}.print{display:none}h1{font-size:24pt}h2{font-size:16pt;margin-top:24px;break-after:avoid}h3{font-size:12pt;break-after:avoid}table{font-size:8.1pt}th,td{padding:7px 8px}thead{display:table-header-group}tr,figure,blockquote{break-inside:avoid}p{orphans:3;widows:3}.toc{break-inside:avoid}.toc ol{font-size:8.6pt}.cover{break-inside:avoid}a{color:inherit}*{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
"""
marjea = image_data(ROOT / "artifacts/marjea/public/marjea-symbol.png", "image/png")
afaq = image_data(ROOT / "artifacts/marjea/public/images/afaq-digital-logo.png", "image/png")
toc = '<nav class="toc" aria-label="فهرس التقرير"><b>فهرس التقرير</b><ol>' + "".join(f'<li><a href="#{key}">{html.escape(heading)}</a></li>' for key, heading in sections) + "</ol></nav>"
document = f"""<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{html.escape(title)}</title><style>{css}</style></head><body><button class="print" onclick="window.print()">طباعة التقرير أو حفظه PDF</button><main class="report"><header class="cover"><div class="brands"><img src="{marjea}" alt="مَرْجِع"><span>مَرْجِع · المنصة</span><img src="{afaq}" alt="أفق"><span>أفق · الجهة المشتركة</span></div><h1>{html.escape(title)}</h1><p class="kicker">تقرير الحالة والتنفيذ والتحقق · 3 أكتوبر 2026</p><div class="badges"><span class="badge">المنتج الفعلي</span><span class="badge">بوابة أفق</span><span class="badge">عرض اللجنة</span><span class="badge">نتائج وحدود التحقق</span></div></header>{toc}{"".join(output)}<footer class="foot">نهاية التقرير · لا يتضمن أسرار اتصال أو بيانات اعتماد. تاريخ التقرير لا يحوّل نتائج الاختبارات السابقة إلى اعتماد إنتاجي.</footer></main></body></html>"""
(REPORT / "marjea-detailed-report-ar.html").write_text(document)
print(f"Generated HTML: {len(sections)} sections, {len(document.encode())} bytes")