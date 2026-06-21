#!/usr/bin/env python3
"""Convert building SVGs to PNGs for Pixi.js texture loading.

Run automatically via the Vite build plugin and dev-setup.sh.
Output: src/frontend/app/src/assets/buildings/png/*.png  (gitignored)
"""
import os
import cairosvg

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
SVG_DIR    = os.path.join(SCRIPT_DIR, '..', 'src', 'frontend', 'app', 'src', 'assets', 'buildings')
PNG_DIR    = os.path.join(SVG_DIR, 'png')

os.makedirs(PNG_DIR, exist_ok=True)

svgs = sorted(f for f in os.listdir(SVG_DIR) if f.endswith('.svg'))
for fname in svgs:
    cairosvg.svg2png(
        url=os.path.join(SVG_DIR, fname),
        write_to=os.path.join(PNG_DIR, fname[:-4] + '.png'),
        scale=2,
    )

print(f'[render-pngs] {len(svgs)} PNGs generated in {PNG_DIR}')
