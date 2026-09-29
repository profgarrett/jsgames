#!/usr/bin/env python3
"""
Replace pandas DataFrame HTML tables in nbconvert markdown with GFM pipe tables.

Why: nbconvert writes a DataFrame's output as raw HTML (<div><style scoped>...
<table class="dataframe">...). The site renders markdown with react-markdown and
no rehype-raw, so raw HTML is dropped. Worse, the blank lines inside <style> end
the HTML block, so the indented CSS rules show up on the page as a code block.
Converting to a markdown table fixes both and keeps the table visible.

Stdlib only. Safe to run repeatedly on the same file.

Usage:
    python3 scripts/notebook_tables_to_markdown.py path/to/index.md [...]
"""
import html
import re
import sys
from html.parser import HTMLParser

# Optional <div><style scoped>...</style>, the table, optional "N rows x M columns"
# note, and the closing </div>.
BLOCK = re.compile(
    r'(?:<div>\s*)?(?:<style scoped>.*?</style>\s*)?'
    r'(<table[^>]*class="dataframe"[^>]*>.*?</table>)'
    r'\s*(?:<p>(.*?)</p>\s*)?(?:</div>)?',
    re.DOTALL,
)


class TableParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.head, self.body = [], []
        self.section = 'body'
        self.row = None
        self.cell = None

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == 'thead':
            self.section = 'head'
        elif tag == 'tbody':
            self.section = 'body'
        elif tag == 'tr':
            self.row = []
        elif tag in ('th', 'td') and self.row is not None:
            self.cell = {
                'text': '',
                'colspan': int(a.get('colspan', 1) or 1),
                'rowspan': int(a.get('rowspan', 1) or 1),
            }

    def handle_endtag(self, tag):
        if tag in ('th', 'td') and self.cell is not None:
            self.row.append(self.cell)
            self.cell = None
        elif tag == 'tr' and self.row is not None:
            (self.head if self.section == 'head' else self.body).append(self.row)
            self.row = None
        elif tag == 'thead':
            self.section = 'body'

    def handle_data(self, data):
        if self.cell is not None:
            self.cell['text'] += data


def to_grid(rows):
    """Expand colspan/rowspan into a plain list of lists of strings."""
    grid, carry = [], {}  # carry: col -> (text, rows_left)
    for row in rows:
        out, col, cells = [], 0, list(row)
        while cells or col in carry:
            if col in carry:
                text, left = carry[col]
                out.append(text)
                if left > 1:
                    carry[col] = (text, left - 1)
                else:
                    del carry[col]
                col += 1
                continue
            c = cells.pop(0)
            text = ' '.join(c['text'].split())
            for i in range(c['colspan']):
                out.append(text)
                if c['rowspan'] > 1:
                    carry[col] = (text, c['rowspan'] - 1)
                col += 1
        grid.append(out)
    return grid


def cell(text):
    return text.replace('\\', '\\\\').replace('|', '\\|') or ' '


def convert_table(table_html, note):
    p = TableParser()
    p.feed(table_html)
    head, body = to_grid(p.head), to_grid(p.body)
    width = max((len(r) for r in head + body), default=0)
    if width == 0:
        return ''
    pad = lambda r: r + [''] * (width - len(r))
    head, body = [pad(r) for r in head], [pad(r) for r in body]

    # pandas uses a second header row for index names; merge header rows per column.
    header = []
    for i in range(width):
        parts = []
        for r in head:
            if r[i] and r[i] not in parts:
                parts.append(r[i])
        header.append(' / '.join(parts))

    lines = ['| ' + ' | '.join(cell(h) for h in header) + ' |',
             '|' + '---|' * width]
    lines += ['| ' + ' | '.join(cell(v) for v in r) + ' |' for r in body]
    out = '\n'.join(lines)
    if note:
        out += '\n\n*' + ' '.join(html.unescape(note).split()) + '*'
    return '\n\n' + out + '\n\n'


def convert(markdown):
    new = BLOCK.sub(lambda m: convert_table(m.group(1), m.group(2)), markdown)
    return re.sub(r'\n{4,}', '\n\n\n', new)


def main(paths):
    for path in paths:
        with open(path, encoding='utf-8') as f:
            old = f.read()
        new = convert(old)
        if new != old:
            with open(path, 'w', encoding='utf-8') as f:
                f.write(new)


if __name__ == '__main__':
    main(sys.argv[1:])
