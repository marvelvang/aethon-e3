#!/usr/bin/env python3
"""Convert building SVGs to PNGs for Pixi.js texture loading.

Run automatically via the Vite build plugin and dev-setup.sh.
Output: src/frontend/app/src/assets/buildings/png/*.png  (gitignored)

Composite PNGs (multi-tile buildings) are generated here too, because they
cannot be derived from a single SVG — they are assembled from multiple tiles.
"""
import os
import io
import cairosvg
from PIL import Image, ImageDraw, ImageFont

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
SVG_DIR    = os.path.join(SCRIPT_DIR, '..', 'src', 'frontend', 'app', 'src', 'assets', 'buildings')
PNG_DIR    = os.path.join(SVG_DIR, 'png')

os.makedirs(PNG_DIR, exist_ok=True)

# ── Single-tile SVGs → PNGs ────────────────────────────────────────────────
svgs = sorted(f for f in os.listdir(SVG_DIR) if f.endswith('.svg'))
for fname in svgs:
    cairosvg.svg2png(
        url=os.path.join(SVG_DIR, fname),
        write_to=os.path.join(PNG_DIR, fname[:-4] + '.png'),
        scale=1,
    )

print(f'[render-pngs] {len(svgs)} PNGs generated in {PNG_DIR}')

# ── Composite PNGs (multi-tile buildings) ─────────────────────────────────
# Grid constants in PNG pixels (4× display scale: TW=32×4=128, TH=16×4=64)
TW = 128  # half-width in PNG pixels
TH = 64   # half-height in PNG pixels
TILE_AX = 128  # tile anchor x within 256-wide tile PNG
TILE_AY = 178  # tile anchor y within 308-tall tile PNG


def make_composite_png(base_svg, size, canvas_w, canvas_h, cx, cy, text, font_size, out_path):
    """Render a composite isometric building PNG from a single-tile SVG.

    Args:
        base_svg:  path to the single-tile SVG used for each cell
        size:      side length of the square footprint (2 for 2×2, 3 for 3×3)
        canvas_w:  output canvas width in pixels
        canvas_h:  output canvas height in pixels
        cx, cy:    pixel position of the anchor tile's top vertex in the canvas
        text:      Roman numeral string to overlay
        font_size: overlay text size in pixels
        out_path:  output PNG path
    """
    tile_bytes = cairosvg.svg2png(url=base_svg, output_width=256, output_height=308)
    tile_img = Image.open(io.BytesIO(tile_bytes)).convert('RGBA')

    canvas = Image.new('RGBA', (canvas_w, canvas_h), (0, 0, 0, 0))

    # Paint tiles in painter's order (back to front: increasing dx+dy)
    tiles = sorted(
        [(dx, dy) for dx in range(size) for dy in range(size)],
        key=lambda t: t[0] + t[1],
    )
    for dx, dy in tiles:
        # Offset of this tile's top vertex relative to anchor tile (size-1, size-1)
        rel_tx = (dx - dy) * TW
        rel_ty = (dx + dy - 2 * (size - 1)) * TH
        tv_x = cx + rel_tx
        tv_y = cy + rel_ty
        paste_x = tv_x - TILE_AX
        paste_y = tv_y - TILE_AY
        canvas.paste(tile_img, (paste_x, paste_y), tile_img)

    # Overlay Roman numeral — white fill with black outline
    draw = ImageDraw.Draw(canvas)
    font = None
    for font_path in [
        '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',
        '/usr/share/fonts/TTF/DejaVuSans-Bold.ttf',
        '/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf',
    ]:
        if os.path.exists(font_path):
            font = ImageFont.truetype(font_path, font_size)
            break
    if font is None:
        font = ImageFont.load_default()

    tx, ty = cx, cy + 20  # same y-offset as single-tile text (20 units below tile top)
    stroke = max(1, font_size // 15)
    for ox in range(-stroke, stroke + 1):
        for oy in range(-stroke, stroke + 1):
            if ox == 0 and oy == 0:
                continue
            draw.text((tx + ox, ty + oy), text, font=font, fill=(0, 0, 0, 255), anchor='mm')
    draw.text((tx, ty), text, font=font, fill=(255, 255, 255, 255), anchor='mm')

    canvas.save(out_path)


HOUSING_T2_SVG = os.path.join(SVG_DIR, 'housing_t2.svg')

# HousingT3: 2×2 footprint (4 tiles), canvas 532×456, anchor (266, 316)
make_composite_png(
    base_svg=HOUSING_T2_SVG,
    size=2,
    canvas_w=532, canvas_h=456,
    cx=266, cy=316,
    text='III',
    font_size=160,
    out_path=os.path.join(PNG_DIR, 'housing_t3.png'),
)

# HousingT5: 3×3 footprint (9 tiles), canvas 788×584, anchor (394, 444)
make_composite_png(
    base_svg=HOUSING_T2_SVG,
    size=3,
    canvas_w=788, canvas_h=584,
    cx=394, cy=444,
    text='V',
    font_size=240,
    out_path=os.path.join(PNG_DIR, 'housing_t5.png'),
)

print('[render-pngs] 2 composite PNGs generated (housing_t3, housing_t5)')
