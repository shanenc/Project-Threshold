"""
Generates a synthetic approximation of the Project Threshold homepage background.
Replicates the dark neon aesthetic: black field, purple/blue centre glow,
neon-bordered panel zones, and placeholder text labels.
"""
from PIL import Image, ImageDraw, ImageFont
import math, os

W, H = 951, 1269
img = Image.new("RGB", (W, H), (1, 8, 14))
draw = ImageDraw.Draw(img, "RGBA")

def radial_glow(cx, cy, rx, ry, color, alpha_center=120):
    """Draw an elliptical radial glow by layering transparent ellipses."""
    steps = 30
    for i in range(steps, 0, -1):
        f = i / steps
        a = int(alpha_center * (1 - f) ** 1.8)
        x0 = cx - rx * f
        y0 = cy - ry * f
        x1 = cx + rx * f
        y1 = cy + ry * f
        r, g, b = color
        draw.ellipse([x0, y0, x1, y1], fill=(r, g, b, a))

# ── Background glows ─────────────────────────────────────────────────────────
radial_glow(W//2, int(H*0.46), 320, 240, (50, 0, 130), 140)   # purple centre
radial_glow(W//2, int(H*0.46), 180, 180, (0, 30, 120), 80)    # blue inner
radial_glow(int(W*0.11), int(H*0.14), 100, 80, (0, 60, 0), 90)  # green top-L
radial_glow(int(W*0.89), int(H*0.14), 100, 80, (0, 30, 80), 90)  # blue top-R
radial_glow(W//2, int(H*0.88), 260, 100, (70, 0, 60), 80)    # magenta bottom

# ── Moon circle ──────────────────────────────────────────────────────────────
cx, cy, r = W//2, int(H*0.45), 190
for dr in range(30, 0, -1):
    alpha = int(60 * (1 - dr/30) ** 2)
    draw.ellipse([cx-r-dr, cy-r-dr, cx+r+dr, cy+r+dr], fill=(80, 100, 200, alpha))
draw.ellipse([cx-r, cy-r, cx+r, cy+r], fill=(30, 40, 120))
draw.ellipse([cx-r, cy-r, cx+r, cy+r], outline=(100, 140, 255), width=2)

# ── Helper: neon border rect ─────────────────────────────────────────────────
COLORS = {
    "green":   (57, 255, 20),
    "cyan":    (0, 240, 255),
    "yellow":  (255, 230, 0),
    "magenta": (220, 0, 200),
    "orange":  (255, 100, 0),
}

def panel(x, y, w, h, color_name, label="", label_pos="bottom"):
    c = COLORS[color_name]
    # subtle fill
    draw.rectangle([x, y, x+w, y+h], fill=(c[0]//12, c[1]//12, c[2]//12, 180))
    # border glow (outer)
    for t in range(3, 0, -1):
        a = 60 if t == 3 else (100 if t == 2 else 200)
        draw.rectangle([x-t, y-t, x+w+t, y+h+t], outline=(c[0], c[1], c[2], a), width=1)
    draw.rectangle([x, y, x+w, y+h], outline=c, width=2)
    if label:
        # Draw label text approximation as a bright rectangle strip
        lh = 14
        ly = (y + h - lh - 6) if label_pos == "bottom" else (y + 6)
        draw.rectangle([x+4, ly, x+w-4, ly+lh], fill=(c[0]//4, c[1]//4, c[2]//4, 200))
        draw.rectangle([x+4, ly, x+w-4, ly+lh], outline=c, width=1)

# ── Panel zones (matching hotspot % positions) ───────────────────────────────
# Percentages → pixels: left%, top%, width%, height%
def pct(lp, tp, wp, hp):
    return int(W*lp), int(H*tp), int(W*wp), int(H*hp)

# Login top-left
x,y,w,h = pct(.01,.01,.21,.20); panel(x,y,w,h,"green","LOGIN")
# Settings top-right
x,y,w,h = pct(.78,.01,.21,.20); panel(x,y,w,h,"cyan","SETTINGS")
# Title centre (no border, just glow text area)
x,y,w,h = pct(.22,.01,.56,.10); panel(x,y,w,h,"cyan")
# Report CTA
x,y,w,h = pct(.22,.24,.56,.10); panel(x,y,w,h,"yellow","REPORT AN EXPERIENCE »")
# Overlapping reports left-mid
x,y,w,h = pct(.01,.22,.21,.26); panel(x,y,w,h,"green","OPEN REPORTS »")
# Encounter reports right-mid
x,y,w,h = pct(.78,.22,.21,.26); panel(x,y,w,h,"magenta","OPEN REPORTS »")
# Fear & intimidation left-lower
x,y,w,h = pct(.01,.50,.21,.22); panel(x,y,w,h,"cyan","OPEN REPORTS »")
# Lessons integrated right-lower
x,y,w,h = pct(.78,.50,.21,.22); panel(x,y,w,h,"orange","OPEN REPORTS »")
# Explore theory CTA
x,y,w,h = pct(.22,.73,.56,.08); panel(x,y,w,h,"cyan","EXPLORE THE THEORY »")
# Evidence & encounters bottom-left
x,y,w,h = pct(.01,.74,.21,.24); panel(x,y,w,h,"green","OPEN REPORTS »")
# Neutralizing fear bottom-centre
x,y,w,h = pct(.22,.81,.34,.17); panel(x,y,w,h,"magenta","OPEN REPORTS »")
# Community forum bottom-right
x,y,w,h = pct(.57,.81,.42,.17); panel(x,y,w,h,"cyan","OPEN REPORTS »")

# ── Star field ───────────────────────────────────────────────────────────────
import random
random.seed(42)
for _ in range(320):
    sx = random.randint(0, W)
    sy = random.randint(0, H)
    sa = random.randint(40, 200)
    sr = random.choice([1, 1, 1, 2])
    draw.ellipse([sx-sr, sy-sr, sx+sr, sy+sr], fill=(255, 255, 255, sa))

# ── Title text blocks (coloured rectangles as stand-ins) ─────────────────────
# "PROJECT THRESHOLD"
tx, ty, tw, th = int(W*.28), int(H*.03), int(W*.44), int(H*.04)
draw.rectangle([tx, ty, tx+tw, ty+th], fill=(0, 200, 255, 40))
# subtitle bar
tx2, ty2 = int(W*.30), int(H*.075)
draw.rectangle([tx2, ty2, tx2+int(W*.40), ty2+int(H*.025)], fill=(255, 0, 200, 30))

out = "public/images/homepage-bg.jpg"
os.makedirs(os.path.dirname(out), exist_ok=True)
img.save(out, "JPEG", quality=92)
print(f"Saved {out}  ({W}×{H}px)")
