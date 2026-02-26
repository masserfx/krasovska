#!/usr/bin/env python3
import subprocess, sys

# Convert markdown to HTML via pandoc with custom CSS
css = """
@page {
    size: A4;
    margin: 1.8cm 1.5cm 1.8cm 1.5cm;
    @bottom-right { content: counter(page) " / " counter(pages); font-size: 9pt; color: #888; }
}
body {
    font-family: -apple-system, "Helvetica Neue", Arial, sans-serif;
    font-size: 10pt;
    line-height: 1.45;
    color: #1a1a1a;
}
h1 {
    font-size: 17pt;
    border-bottom: 2.5px solid #1a1a1a;
    padding-bottom: 4px;
    margin-top: 0;
}
h2 {
    font-size: 12pt;
    border-bottom: 1px solid #ccc;
    padding-bottom: 3px;
    margin-top: 18px;
    margin-bottom: 8px;
    color: #1a1a1a;
}
h3 {
    font-size: 10.5pt;
    margin-top: 12px;
    margin-bottom: 5px;
    color: #333;
}
h4 {
    font-size: 10pt;
    margin-top: 10px;
    margin-bottom: 4px;
    color: #444;
}
table {
    width: 100%;
    border-collapse: collapse;
    font-size: 9pt;
    margin: 8px 0 12px 0;
    table-layout: fixed;
}
thead tr {
    background: #1a1a1a;
    color: #fff;
}
thead th {
    padding: 5px 7px;
    text-align: left;
    white-space: nowrap;
    overflow: hidden;
}
tbody tr:nth-child(even) { background: #f5f5f5; }
tbody tr:nth-child(odd)  { background: #fff; }
td {
    padding: 4px 7px;
    border-bottom: 1px solid #e0e0e0;
    vertical-align: top;
    word-wrap: break-word;
    overflow-wrap: break-word;
    hyphens: none;
}
/* First column wider for label columns */
td:first-child, th:first-child {
    white-space: nowrap;
    width: auto;
}
/* Bold rows (markdown **text**) */
td strong { white-space: nowrap; }
blockquote {
    border-left: 4px solid #1a1a1a;
    margin: 10px 0;
    padding: 6px 12px;
    background: #f9f9f9;
    font-style: italic;
}
code {
    background: #f0f0f0;
    padding: 1px 4px;
    border-radius: 3px;
    font-size: 8.5pt;
}
ul, ol {
    margin: 5px 0;
    padding-left: 18px;
}
li { margin-bottom: 2px; }
p { margin: 5px 0; }
hr {
    border: none;
    border-top: 1px solid #ddd;
    margin: 14px 0;
}
/* Prevent page break inside tables */
table { page-break-inside: auto; }
tr { page-break-inside: avoid; }
/* Highlight doporuceni row */
tr:has(td strong) { }
"""

html_template = f"""<!DOCTYPE html>
<html lang="cs">
<head>
<meta charset="UTF-8">
<style>
{css}
</style>
</head>
<body>
{{content}}
</body>
</html>"""

# Use pandoc to convert MD → HTML fragment
result = subprocess.run([
    "pandoc",
    "/Users/lhradek/code/work/krasovska/questionnaire/docs/CEO_BRIEFING.md",
    "--from=markdown",
    "--to=html5",
    "--no-highlight",
], capture_output=True, text=True)

if result.returncode != 0:
    print("pandoc error:", result.stderr)
    sys.exit(1)

html_content = html_template.replace("{content}", result.stdout)

html_path = "/Users/lhradek/code/work/krasovska/questionnaire/docs/CEO_BRIEFING_styled.html"
pdf_path  = "/Users/lhradek/code/work/krasovska/questionnaire/docs/CEO_BRIEFING.pdf"

with open(html_path, "w", encoding="utf-8") as f:
    f.write(html_content)

print("HTML written, converting to PDF...")

from weasyprint import HTML, CSS
HTML(filename=html_path).write_pdf(pdf_path)
print(f"PDF saved: {pdf_path}")
