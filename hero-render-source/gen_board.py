#!/usr/bin/env python3
"""Procedural macro-PCB generator for the Lally Computers hero render.
World units are millimetres. Board is 64 x 36 mm. Texture row index grows with world z (toward the camera).
Outputs raw binary textures in ./data for the WebGL2 renderer."""
import numpy as np, cv2, math, json, os, subprocess
from PIL import Image, ImageDraw, ImageFont

PXMM = int(os.environ.get('PXMM', 64))
W_MM, H_MM = 64.0, 36.0
Wp, Hp = int(W_MM * PXMM), int(H_MM * PXMM)
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data')
os.makedirs(OUT, exist_ok=True)
rng = np.random.default_rng(11)


def font_path(query):
    try:
        out = subprocess.check_output(['fc-match', '-f', '%{file}', query]).decode()
        return out
    except Exception:
        return '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'

F_BRAND = font_path('Inter Display:style=Black')
F_BOLD = font_path('Inter:style=Bold')
F_MONO = font_path('DejaVu Sans Mono:style=Bold')
print('fonts', F_BRAND, F_BOLD, F_MONO)


def lin(c):
    c = np.array(c, np.float32) / 255.0
    return np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4).astype(np.float32)

# ---------- palette (linear) ----------
MASK = lin((9, 70, 58))
MASK_HI = lin((14, 96, 78))
GOLD = np.array([1.0, 0.70, 0.27], np.float32)
TIN = np.array([0.80, 0.80, 0.83], np.float32)
EPOXY = np.array([0.013, 0.014, 0.017], np.float32)
SILK = lin((236, 229, 205))
CERAMIC = lin((158, 112, 58))
TANT = lin((214, 112, 14))
DARK = np.array([0.003, 0.003, 0.004], np.float32)
FERRITE = np.array([0.026, 0.022, 0.020], np.float32)
SLEEVE = lin((8, 28, 30))

# ---------- buffers ----------
H = np.zeros((Hp, Wp), np.float32)
ALB = np.empty((Hp, Wp, 3), np.float32)
MET = np.zeros((Hp, Wp), np.float32)
ROU = np.full((Hp, Wp), 0.42, np.float32)
SPAR = np.zeros((Hp, Wp), np.float32)
PHS = np.zeros((Hp, Wp), np.float32)

ALB[:] = MASK
lowf = cv2.resize(rng.random((Hp // 90 + 2, Wp // 90 + 2)).astype(np.float32), (Wp, Hp), interpolation=cv2.INTER_CUBIC)
fine = rng.random((Hp, Wp)).astype(np.float32)
ALB *= (0.80 + 0.40 * lowf)[..., None]
ALB *= (0.93 + 0.14 * fine)[..., None]
ROU += 0.10 * (fine - 0.5) + 0.12 * (lowf - 0.5)
del fine, lowf

OC = 0.2
OCC = np.zeros((int(H_MM / OC) + 2, int(W_MM / OC) + 2), np.uint8)


def smoothstep(e0, e1, x):
    t = np.clip((x - e0) / (e1 - e0), 0, 1)
    return t * t * (3 - 2 * t)


def box_region(x0, z0, x1, z1, pad=3):
    ix0 = max(int(math.floor(x0 * PXMM)) - pad, 0)
    ix1 = min(int(math.ceil(x1 * PXMM)) + pad, Wp)
    iz0 = max(int(math.floor(z0 * PXMM)) - pad, 0)
    iz1 = min(int(math.ceil(z1 * PXMM)) + pad, Hp)
    return iz0, iz1, ix0, ix1


def grid(r):
    iz0, iz1, ix0, ix1 = r
    xs = (np.arange(ix0, ix1, dtype=np.float32) + 0.5) / PXMM
    zs = (np.arange(iz0, iz1, dtype=np.float32) + 0.5) / PXMM
    return np.meshgrid(xs, zs)


def sl_of(r):
    iz0, iz1, ix0, ix1 = r
    return (slice(iz0, iz1), slice(ix0, ix1))


def stamp(r, d, hgt=None, bevel=0.06, color=None, met=None, rou=None):
    sl = sl_of(r)
    cov = np.clip(0.5 - d * PXMM, 0, 1).astype(np.float32)
    if hgt is not None:
        prof = (hgt * smoothstep(-0.5 / PXMM, bevel, -d)).astype(np.float32)
        H[sl] = np.maximum(H[sl], prof)
    if color is not None:
        c = np.asarray(color, np.float32)
        ALB[sl] = ALB[sl] * (1 - cov[..., None]) + c * cov[..., None]
    if met is not None:
        MET[sl] = MET[sl] * (1 - cov) + met * cov
    if rou is not None:
        ROU[sl] = ROU[sl] * (1 - cov) + rou * cov
    return cov


def sd_rbox(X, Z, cx, cz, hx, hz, rad=0.0):
    qx = np.abs(X - cx) - (hx - rad)
    qz = np.abs(Z - cz) - (hz - rad)
    return np.sqrt(np.maximum(qx, 0) ** 2 + np.maximum(qz, 0) ** 2) + np.minimum(np.maximum(qx, qz), 0) - rad


def sd_circle(X, Z, cx, cz, rad):
    return np.sqrt((X - cx) ** 2 + (Z - cz) ** 2) - rad


def occ_rect(x0, z0, x1, z1, margin=0.4):
    OCC[max(int((z0 - margin) / OC), 0):int((z1 + margin) / OC) + 1, max(int((x0 - margin) / OC), 0):int((x1 + margin) / OC) + 1] = 1


def occ_line(a, b, w):
    cv2.line(OCC, (int(a[0] / OC), int(a[1] / OC)), (int(b[0] / OC), int(b[1] / OC)), 1, thickness=max(int(w / OC), 1))


def occ_free(x0, z0, x1, z1, margin=0.4):
    if x0 - margin < 0.8 or z0 - margin < 0.8 or x1 + margin > W_MM - 0.8 or z1 + margin > H_MM - 0.8:
        return False
    return not OCC[int((z0 - margin) / OC):int((z1 + margin) / OC) + 1, int((x0 - margin) / OC):int((x1 + margin) / OC) + 1].any()


# ---------- text ----------
def text_stamp(txt, x, z, cap_mm, fpath, color, rot=0, hgt=0.012, rou=0.55, met=0.0, track=0.0, alpha=1.0, occ=False):
    size_px = max(int(cap_mm * PXMM / 0.73), 6)
    font = ImageFont.truetype(fpath, size_px)
    adv = [font.getlength(ch) + track * PXMM for ch in txt]
    total = int(sum(adv)) + 16
    hpx = int(size_px * 1.5) + 16
    img = Image.new('L', (total, hpx), 0)
    d = ImageDraw.Draw(img)
    cx = 8
    for ch, a in zip(txt, adv):
        d.text((cx, 8), ch, font=font, fill=255)
        cx += a
    bb = img.getbbox()
    if bb is None:
        return
    img = img.crop(bb)
    if rot:
        img = img.rotate(rot, expand=True, resample=Image.BICUBIC)
    m = np.asarray(img, np.float32) / 255.0
    h, w = m.shape
    ix0 = int(round(x * PXMM - w / 2)); iz0 = int(round(z * PXMM - h / 2))
    cx0, cz0 = max(ix0, 0), max(iz0, 0)
    cx1, cz1 = min(ix0 + w, Wp), min(iz0 + h, Hp)
    if cx1 <= cx0 or cz1 <= cz0:
        return
    m = m[cz0 - iz0:cz1 - iz0, cx0 - ix0:cx1 - ix0] * alpha
    sl = (slice(cz0, cz1), slice(cx0, cx1))
    ALB[sl] = ALB[sl] * (1 - m[..., None]) + np.asarray(color, np.float32) * m[..., None]
    H[sl] = np.maximum(H[sl], hgt * m)
    ROU[sl] = ROU[sl] * (1 - m) + rou * m
    MET[sl] = MET[sl] * (1 - m) + met * m
    if occ:
        occ_rect(cx0 / PXMM, cz0 / PXMM, cx1 / PXMM, cz1 / PXMM, 0.3)


# ---------- traces ----------
def unit(v):
    v = np.asarray(v, np.float64)
    return v / np.linalg.norm(v)


def offset_poly(pts, d):
    pts = [np.asarray(p, np.float64) for p in pts]
    out = []
    n = len(pts)
    for i in range(n):
        if i == 0:
            u = unit(pts[1] - pts[0]); nrm = np.array([-u[1], u[0]]); out.append(pts[0] + nrm * d)
        elif i == n - 1:
            u = unit(pts[-1] - pts[-2]); nrm = np.array([-u[1], u[0]]); out.append(pts[-1] + nrm * d)
        else:
            u1 = unit(pts[i] - pts[i - 1]); u2 = unit(pts[i + 1] - pts[i])
            n1 = np.array([-u1[1], u1[0]]); n2 = np.array([-u2[1], u2[0]])
            m = (n1 + n2) / (1 + float(n1 @ n2))
            out.append(pts[i] + m * d)
    return out


def trace_seg(a, b, w, s0, phase, pulse, gold=True, hgt=0.055):
    a = np.array(a, np.float32); b = np.array(b, np.float32)
    L = float(np.linalg.norm(b - a))
    u = (b - a) / max(L, 1e-6)
    r = box_region(min(a[0], b[0]) - w, min(a[1], b[1]) - w, max(a[0], b[0]) + w, max(a[1], b[1]) + w)
    X, Z = grid(r)
    px = X - a[0]; pz = Z - a[1]
    t = np.clip(px * u[0] + pz * u[1], 0, L)
    dist = np.sqrt((px - u[0] * t) ** 2 + (pz - u[1] * t) ** 2)
    d = dist - w * 0.5
    if gold:
        cov = stamp(r, d, hgt=hgt, bevel=0.05, color=GOLD, met=1.0, rou=0.30)
    else:
        cov = stamp(r, d, hgt=0.02, bevel=0.05, color=MASK_HI, met=0.0, rou=0.34)
    if gold and pulse is not None:
        sl = sl_of(r)
        upd = cov > 0.5
        SPAR[sl][upd] = (s0 + t)[upd]
        PHS[sl][upd] = pulse + 1.0
    return L


def draw_lane(pts, w=0.26, phase=0.0, pulse=True, gold=True):
    s = 0.0
    for i in range(len(pts) - 1):
        L = trace_seg(pts[i], pts[i + 1], w, s, phase if pulse else None, pulse, gold)
        occ_line(pts[i], pts[i + 1], w + 0.5)
        s += L
    return s


def bundle(center_pts, n, pitch, w=0.26, gold=True, pulse=True):
    lanes = []
    for k in range(n):
        d = (k - (n - 1) / 2.0) * pitch
        lanes.append(offset_poly(center_pts, d))
    for k, lane in enumerate(lanes):
        draw_lane(lane, w=w, phase=float(rng.random()), pulse=pulse, gold=gold)
    return lanes


def via(x, z, ro=0.42, ri=0.17):
    r = box_region(x - ro, z - ro, x + ro, z + ro)
    X, Z = grid(r)
    stamp(r, sd_circle(X, Z, x, z, ro), hgt=0.07, bevel=0.05, color=GOLD, met=1.0, rou=0.28)
    stamp(r, sd_circle(X, Z, x, z, ri), hgt=None, color=DARK, met=0.0, rou=0.9)


def pad_rect(x, z, hx, hz, rad=0.06, color=GOLD, h=0.06):
    r = box_region(x - hx, z - hz, x + hx, z + hz)
    X, Z = grid(r)
    stamp(r, sd_rbox(X, Z, x, z, hx, hz, rad), hgt=h, bevel=0.04, color=color, met=1.0, rou=0.28)


# =====================================================================
# 1. Copper-pour hatch zones (under solder mask)
# =====================================================================
def hatch_zone(x0, z0, x1, z1, pitch=1.1, lw=0.40):
    r = box_region(x0, z0, x1, z1, 0)
    X, Z = grid(r)
    a = np.mod(X + Z, pitch); b = np.mod(X - Z, pitch)
    da = np.minimum(a, pitch - a) - lw / 2; db = np.minimum(b, pitch - b) - lw / 2
    d = np.minimum(da, db) * 0.7071
    box = sd_rbox(X, Z, (x0 + x1) / 2, (z0 + z1) / 2, (x1 - x0) / 2, (z1 - z0) / 2, 0.0)
    d = np.maximum(d, box)
    stamp(r, d, hgt=0.022, bevel=0.04, color=MASK_HI, met=0.0, rou=0.34)
    occ_rect(x0, z0, x1, z1, 0.0)

hatch_zone(1.2, 7.0, 7.0, 21.5)
hatch_zone(58.6, 1.2, 62.8, 6.4, 1.1)

# =====================================================================
# 2. Component bodies are placed first in occupancy (so filler avoids them)
# =====================================================================
SOC = (30.0, 19.0)          # QFP centre
SOC_HALF = 7.0
MEM1 = (52.4, 13.0, 5.0, 4.4)   # cx, cz, hx, hz
MEM2 = (52.4, 25.0, 5.0, 4.4)
occ_rect(SOC[0] - 8.9, SOC[1] - 8.9, SOC[0] + 8.9, SOC[1] + 8.9, 0.1)
occ_rect(MEM1[0] - MEM1[2], MEM1[1] - MEM1[3], MEM1[0] + MEM1[2], MEM1[1] + MEM1[3], 0.5)
occ_rect(MEM2[0] - MEM2[2], MEM2[1] - MEM2[3], MEM2[0] + MEM2[2], MEM2[1] + MEM2[3], 0.5)
occ_rect(4.0, 1.6, 18.8, 5.2, 0.6)           # FFC
occ_rect(19.4, 0.8, 40.8, 3.8, 0.6)          # header
occ_rect(42.5, 2.8, 49.5, 7.2, 0.6)          # crystal
occ_rect(18.5, 30.2, 41.5, 35.5, 0.1)        # brand silkscreen
for (cx, cz) in [(6.2, 31.0), (12.8, 31.4), (52.6, 32.6), (59.4, 32.0)]:
    occ_rect(cx - 3.2, cz - 3.2, cx + 3.2, cz + 3.2, 0.2)
for (cx, cz) in [(8.4, 24.6), (15.2, 24.6)]:
    occ_rect(cx - 2.8, cz - 2.8, cx + 2.8, cz + 2.8, 0.2)

# =====================================================================
# 3. Gold signal buses with travelling pulses
# =====================================================================
P_ = 0.8
SOC_LEAD_Z = [SOC[1] + (k - 7.5) * P_ for k in range(16)]
# right side -> memory chips (two sub-bundles)
bundle([(38.7, 15.8), (41.2, 15.8), (44.0, 13.0), (46.2, 13.0)], 8, P_)
bundle([(38.7, 22.2), (41.2, 22.2), (44.0, 25.0), (46.2, 25.0)], 8, P_)
# left side -> FFC connector
left_lanes = bundle([(21.3, 19.0), (17.0, 19.0), (11.2, 13.2), (11.2, 6.4)], 16, P_)
# top side (8 lanes) fan-out to header pins
HDR_X = [30.0 + (k - 3.5) * 2.54 for k in range(8)]
for k in range(8):
    xs = 30.0 + (k - 3.5) * P_
    xe = HDR_X[k]
    dlt = xe - xs
    pts = [(xs, 10.3), (xs, 9.8), (xs + dlt, 9.8 - abs(dlt)), (xe, 3.9)]
    # drop the degenerate diagonal for the two central lanes
    pts = [p for i, p in enumerate(pts) if i == 0 or np.linalg.norm(np.array(p) - np.array(pts[i - 1])) > 0.05]
    draw_lane(pts, w=0.26, phase=float(rng.random()), pulse=True)
# crystal pair (two lanes)
bundle([(43.4, 5.0), (41.6, 5.0), (41.6, 8.4), (37.6, 10.3 - 0.0)], 2, P_ , w=0.24)

# vias along lane ends
for k in range(8):
    via(HDR_X[k], 3.7)
for z in [13.0 + (j - 3.5) * P_ for j in range(8)]:
    via(46.2, z, 0.34, 0.14)
for z in [25.0 + (j - 3.5) * P_ for j in range(8)]:
    via(46.2, z, 0.34, 0.14)
for k in range(16):
    pad_rect(11.2 + (k - 7.5) * P_, 5.7, 0.2, 0.7)

# =====================================================================
# 4. Minor (under-mask) traces
# =====================================================================
dirs = [(1, 0), (0, 1), (-1, 0), (0, -1), (1, 1), (1, -1), (-1, 1), (-1, -1)]
tries = 0
count = 0
while count < 90 and tries < 3000:
    tries += 1
    x = rng.uniform(2.5, 61.5); z = rng.uniform(2.5, 33.5)
    if not occ_free(x - 0.3, z - 0.3, x + 0.3, z + 0.3, 0.2):
        continue
    pts = [(x, z)]
    ok = True
    d = dirs[int(rng.integers(0, 8))]
    for seg in range(int(rng.integers(2, 5))):
        L = rng.uniform(1.6, 5.5)
        n = (pts[-1][0] + d[0] * L * (0.7071 if d[0] and d[1] else 1), pts[-1][1] + d[1] * L * (0.7071 if d[0] and d[1] else 1))
        if not occ_free(min(pts[-1][0], n[0]) - 0.2, min(pts[-1][1], n[1]) - 0.2, max(pts[-1][0], n[0]) + 0.2, max(pts[-1][1], n[1]) + 0.2, 0.15):
            ok = False
            break
        pts.append(n)
        # turn by +-45 deg
        idx = dirs.index(d)
        d = dirs[(idx + int(rng.choice([-1, 1])) * (1 if idx >= 4 else 2)) % 8] if False else dirs[int(rng.integers(0, 8))]
    if not ok or len(pts) < 2:
        continue
    for i in range(len(pts) - 1):
        trace_seg(pts[i], pts[i + 1], 0.14, 0.0, None, None, gold=False)
        occ_line(pts[i], pts[i + 1], 0.8)
    via(pts[0][0], pts[0][1], 0.36, 0.14)
    via(pts[-1][0], pts[-1][1], 0.36, 0.14)
    count += 1
print('minor traces', count)

# =====================================================================
# 5. Silkscreen: component outlines
# =====================================================================
def outline_rect(cx, cz, hx, hz, lw=0.14, notch=False):
    r = box_region(cx - hx - lw, cz - hz - lw, cx + hx + lw, cz + hz + lw)
    X, Z = grid(r)
    d = np.abs(sd_rbox(X, Z, cx, cz, hx, hz, 0.0)) - lw / 2
    stamp(r, d, hgt=0.012, bevel=0.02, color=SILK, met=0.0, rou=0.6)


outline_rect(*SOC, SOC_HALF + 2.5, SOC_HALF + 2.5)
outline_rect(MEM1[0], MEM1[1], MEM1[2] + 0.7, MEM1[3] + 0.7)
outline_rect(MEM2[0], MEM2[1], MEM2[2] + 0.7, MEM2[3] + 0.7)
outline_rect(11.2, 3.4, 7.7, 1.9)
outline_rect(30.0, 2.3, 10.5, 1.55)
outline_rect(46.0, 5.0, 3.4, 2.1)

# =====================================================================
# 6. Components (drawn over silkscreen)
# =====================================================================
# --- QFP SoC ---
bx, bz = SOC
body_r = box_region(bx - 8, bz - 8, bx + 8, bz + 8)
# leads
for k in range(16):
    z = SOC_LEAD_Z[k]
    for side in (1, -1):    # right, left
        x0 = bx + side * (SOC_HALF - 0.15)
        x1 = bx + side * (SOC_HALF + 1.75)
        rr = box_region(min(x0, x1), z - 0.2, max(x0, x1), z + 0.2)
        X, Z = grid(rr)
        stamp(rr, sd_rbox(X, Z, (x0 + x1) / 2, z, abs(x1 - x0) / 2, 0.17, 0.05), hgt=0.28, bevel=0.07, color=TIN, met=1.0, rou=0.30)
        pad_rect(bx + side * (SOC_HALF + 1.95), z, 0.38, 0.22, 0.05)
    xk = bx + (k - 7.5) * P_
    for side in (1, -1):
        z0 = bz + side * (SOC_HALF - 0.15)
        z1 = bz + side * (SOC_HALF + 1.75)
        rr = box_region(xk - 0.2, min(z0, z1), xk + 0.2, max(z0, z1))
        X, Z = grid(rr)
        stamp(rr, sd_rbox(X, Z, xk, (z0 + z1) / 2, 0.17, abs(z1 - z0) / 2, 0.05), hgt=0.28, bevel=0.07, color=TIN, met=1.0, rou=0.30)
        pad_rect(xk, bz + side * (SOC_HALF + 1.95), 0.22, 0.38, 0.05)
# body
X, Z = grid(body_r)
epoxy = EPOXY[None, None, :] * (0.7 + 0.7 * rng.random(X.shape).astype(np.float32))[..., None]
d_body = sd_rbox(X, Z, bx, bz, SOC_HALF, SOC_HALF, 0.25)
cov = stamp(body_r, d_body, hgt=1.35, bevel=0.22, color=epoxy, met=0.0, rou=0.36)
# inner mould line + raised die area
d_inner = np.abs(sd_rbox(X, Z, bx, bz, SOC_HALF - 1.1, SOC_HALF - 1.1, 0.15)) - 0.05
stamp(body_r, d_inner, hgt=None, color=lin((46, 48, 54)), met=0.0, rou=0.5)
# pin-1 dimple
stamp(body_r, sd_circle(X, Z, bx - SOC_HALF + 1.7, bz - SOC_HALF + 1.7, 0.42), hgt=None, color=lin((60, 62, 68)), met=0.0, rou=0.7)
text_stamp('LALLY', bx, bz - 2.4, 1.15, F_BRAND, lin((172, 176, 184)), hgt=0.0, rou=0.55, track=0.12)
text_stamp('COMPUTERS', bx, bz - 0.5, 0.75, F_BOLD, lin((150, 154, 162)), hgt=0.0, rou=0.55, track=0.10)
text_stamp('MOGA  PB', bx, bz + 1.1, 0.62, F_MONO, lin((130, 134, 142)), hgt=0.0, rou=0.55, track=0.05)
text_stamp('LC-SYS-1  0001', bx, bz + 2.6, 0.55, F_MONO, lin((120, 124, 132)), hgt=0.0, rou=0.55, track=0.04)

# --- memory chips (BGA) ---
for (cx, cz, hx, hz) in (MEM1, MEM2):
    r = box_region(cx - hx - 0.5, cz - hz - 0.5, cx + hx + 0.5, cz + hz + 0.5)
    X, Z = grid(r)
    ep = EPOXY[None, None, :] * (0.7 + 0.7 * rng.random(X.shape).astype(np.float32))[..., None]
    stamp(r, sd_rbox(X, Z, cx, cz, hx, hz, 0.22), hgt=1.05, bevel=0.2, color=ep, met=0.0, rou=0.38)
    stamp(r, sd_circle(X, Z, cx - hx + 1.0, cz - hz + 1.0, 0.34), hgt=None, color=lin((62, 64, 70)), met=0.0, rou=0.7)
    text_stamp('MEM-A', cx + 0.6, cz - 1.3, 0.95, F_BRAND, lin((166, 170, 178)), hgt=0.0, rou=0.55, track=0.1)
    text_stamp('LALLY  MOGA', cx + 0.6, cz + 0.3, 0.55, F_MONO, lin((130, 134, 142)), hgt=0.0, rou=0.55, track=0.04)
    text_stamp('0001  LC', cx + 0.6, cz + 1.5, 0.5, F_MONO, lin((120, 124, 132)), hgt=0.0, rou=0.55, track=0.04)

# --- header (8 pins) ---
r = box_region(19.6, 0.9, 40.4, 3.7)
X, Z = grid(r)
stamp(r, sd_rbox(X, Z, 30.0, 2.3, 10.15, 1.27, 0.12), hgt=2.5, bevel=0.15, color=lin((20, 20, 24)), met=0.0, rou=0.45)
for xk in HDR_X:
    rr = box_region(xk - 0.4, 2.3 - 0.4, xk + 0.4, 2.3 + 0.4)
    X, Z = grid(rr)
    stamp(rr, sd_rbox(X, Z, xk, 2.3, 0.32, 0.32, 0.04), hgt=8.4, bevel=0.1, color=GOLD, met=1.0, rou=0.24)

# --- FFC connector ---
r = box_region(3.8, 1.5, 19.0, 5.0)
X, Z = grid(r)
stamp(r, sd_rbox(X, Z, 11.2, 3.4, 7.5, 1.55, 0.15), hgt=1.9, bevel=0.14, color=lin((28, 28, 32)), met=0.0, rou=0.42)
stamp(r, sd_rbox(X, Z, 11.2, 2.5, 7.1, 0.55, 0.1), hgt=2.35, bevel=0.1, color=lin((214, 168, 70)), met=1.0, rou=0.35)

# --- crystal can ---
r = box_region(42.5, 2.8, 49.5, 7.2)
X, Z = grid(r)
stamp(r, sd_rbox(X, Z, 46.0, 5.0, 3.0, 1.7, 0.7), hgt=1.7, bevel=0.2, color=TIN, met=1.0, rou=0.24)
pad_rect(42.9, 5.0, 0.5, 0.9); pad_rect(49.1, 5.0, 0.5, 0.9)
text_stamp('16.000', 46.0, 5.0, 0.7, F_MONO, lin((60, 60, 66)), hgt=0.0, rou=0.4, met=0.0, track=0.05)

# --- inductors + tantalum ---
for (cx, cz) in [(8.4, 24.6), (15.2, 24.6)]:
    r = box_region(cx - 3.0, cz - 3.0, cx + 3.0, cz + 3.0)
    X, Z = grid(r)
    stamp(r, sd_rbox(X, Z, cx, cz, 2.55, 2.55, 0.35), hgt=2.7, bevel=0.2, color=FERRITE, met=0.0, rou=0.42)
    stamp(r, sd_rbox(X, Z, cx, cz, 2.0, 2.0, 0.3), hgt=2.8, bevel=0.12, color=lin((40, 36, 32)), met=0.0, rou=0.34)
    text_stamp('4R7', cx, cz, 0.95, F_MONO, lin((132, 118, 98)), hgt=0.0, rou=0.5, track=0.05)
    pad_rect(cx - 2.8, cz, 0.35, 1.3); pad_rect(cx + 2.8, cz, 0.35, 1.3)
for (cx, cz) in [(5.2, 18.5), (19.8, 27.8)]:
    r = box_region(cx - 2, cz - 1.7, cx + 2, cz + 1.7)
    X, Z = grid(r)
    stamp(r, sd_rbox(X, Z, cx, cz, 1.75, 1.4, 0.25), hgt=1.85, bevel=0.2, color=TANT, met=0.0, rou=0.4)
    stamp(r, sd_rbox(X, Z, cx - 1.2, cz, 0.3, 1.4, 0.05), hgt=None, color=lin((24, 18, 10)), met=0.0, rou=0.5)
occ_rect(3.3, 16.8, 7.1, 20.2, 0.4); occ_rect(17.9, 26.1, 21.7, 29.5, 0.4)

# --- electrolytic caps ---
for (cx, cz) in [(6.2, 31.0), (12.8, 31.4), (52.6, 32.6), (59.4, 32.0)]:
    rad = 3.0
    r = box_region(cx - rad - 0.6, cz - rad - 0.6, cx + rad + 0.6, cz + rad + 0.6)
    X, Z = grid(r)
    stamp(r, sd_circle(X, Z, cx, cz, rad), hgt=6.8, bevel=0.3, color=SLEEVE, met=0.0, rou=0.3)
    stamp(r, sd_circle(X, Z, cx, cz, rad - 0.42), hgt=None, color=TIN, met=1.0, rou=0.30)
    # vent score (K)
    for ang in (0, 120, 240):
        a = math.radians(ang)
        xe = cx + math.cos(a) * (rad - 0.9); ze = cz + math.sin(a) * (rad - 0.9)
        tx = X - cx; tz = Z - cz
        u = np.array([math.cos(a), math.sin(a)], np.float32)
        t = np.clip(tx * u[0] + tz * u[1], 0, rad - 0.9)
        dist = np.sqrt((tx - u[0] * t) ** 2 + (tz - u[1] * t) ** 2) - 0.06
        stamp(r, dist, hgt=None, color=lin((34, 36, 40)), met=0.0, rou=0.5)
    # gold stripe on rim
    ring = np.abs(sd_circle(X, Z, cx, cz, rad - 0.15)) - 0.08
    stamp(r, ring, hgt=None, color=lin((196, 150, 60)), met=1.0, rou=0.35)

# =====================================================================
# 7. Filler SMD passives
# =====================================================================
KINDS = {
    'c0603': (1.6, 0.8, 0.45, CERAMIC, 0.5),
    'r0603': (1.6, 0.8, 0.40, np.array([0.008, 0.008, 0.010], np.float32), 0.4),
    'c0402': (1.0, 0.5, 0.34, CERAMIC, 0.5),
    'r0402': (1.0, 0.5, 0.32, np.array([0.008, 0.008, 0.010], np.float32), 0.4),
    'c0805': (2.0, 1.25, 0.62, CERAMIC, 0.5),
}
DESIG = ['C', 'R', 'C', 'R', 'C']
des_count = {'C': 1, 'R': 1}


def smd(cx, cz, kind, rot):
    L, Wd, h, col, rr_ = KINDS[kind]
    hx, hz = (L / 2, Wd / 2) if rot == 0 else (Wd / 2, L / 2)
    r = box_region(cx - hx - 0.2, cz - hz - 0.2, cx + hx + 0.2, cz + hz + 0.2)
    X, Z = grid(r)
    # solder pads under
    stamp(r, sd_rbox(X, Z, cx, cz, hx + 0.18, hz + 0.1, 0.05), hgt=0.05, bevel=0.03, color=TIN, met=1.0, rou=0.35)
    stamp(r, sd_rbox(X, Z, cx, cz, hx, hz, 0.06), hgt=h, bevel=0.07, color=col, met=0.0, rou=rr_)
    ec = L * 0.2
    if rot == 0:
        for sgn in (-1, 1):
            stamp(r, sd_rbox(X, Z, cx + sgn * (hx - ec / 2), cz, ec / 2, hz, 0.04), hgt=h + 0.04, bevel=0.05, color=TIN, met=1.0, rou=0.32)
    else:
        for sgn in (-1, 1):
            stamp(r, sd_rbox(X, Z, cx, cz + sgn * (hz - ec / 2), hx, ec / 2, 0.04), hgt=h + 0.04, bevel=0.05, color=TIN, met=1.0, rou=0.32)
    occ_rect(cx - hx - 0.2, cz - hz - 0.2, cx + hx + 0.2, cz + hz + 0.2, 0.15)


# decoupling row under SoC leads (bottom) - hand placed
for i in range(8):
    smd(24.0 + 1.75 * i, 29.3, 'c0603', 90)
# hand-placed rows
for i in range(11):
    smd(60.5, 8.5 + 1.95 * i, 'r0603', 90)
    if i % 3 == 1:
        text_stamp(f'R{20+i}', 62.2, 8.5 + 1.95 * i, 0.5, F_MONO, SILK, hgt=0.012, rou=0.6)
for i in range(6):
    smd(47.8 + 2.15 * i, 19.0, 'c0603', 0)
for i in range(5):
    smd(51.0 + 1.5 * i, 4.6, 'c0402', 0)
smd(55.5, 6.2, 'c0805', 0)
for i in range(4):
    smd(19.2 + 1.5 * i, 30.2, 'c0402', 0) if False else None

placed = 0
tries = 0
while placed < 330 and tries < 12000:
    tries += 1
    kind = ['c0603', 'r0603', 'c0402', 'r0402', 'c0805'][int(rng.integers(0, 5))]
    rot = int(rng.choice([0, 90]))
    L, Wd, h, col, rr_ = KINDS[kind]
    hx, hz = (L / 2, Wd / 2) if rot == 0 else (Wd / 2, L / 2)
    cx = rng.uniform(2.0, 62.0); cz = rng.uniform(2.0, 34.0)
    # cluster bias around SoC / chips
    if rng.random() < 0.6:
        cx = rng.normal(30.0, 15.0); cz = rng.normal(19.0, 9.0)
    if not occ_free(cx - hx - 0.2, cz - hz - 0.2, cx + hx + 0.2, cz + hz + 0.2, 0.22):
        continue
    smd(cx, cz, kind, rot)
    if rng.random() < 0.28:
        desig = 'C' if kind.startswith('c') else 'R'
        txt = f"{desig}{des_count[desig]}"
        des_count[desig] += 1
        text_stamp(txt, cx, cz + 1.1 + hz, 0.5, F_MONO, SILK, hgt=0.012, rou=0.6, track=0.02)
    placed += 1
print('smd', placed)

# test points + extra via field
for _ in range(90):
    x = rng.uniform(2.5, 61.5); z = rng.uniform(2.5, 33.5)
    if occ_free(x - 0.6, z - 0.6, x + 0.6, z + 0.6, 0.3):
        via(x, z, 0.45, 0.18)
        occ_rect(x - 0.5, z - 0.5, x + 0.5, z + 0.5, 0.1)

# =====================================================================
# 8. Brand silkscreen, designators, ornaments
# =====================================================================
text_stamp('LALLY COMPUTERS', 30.0, 33.0, 1.9, F_BRAND, SILK, hgt=0.014, rou=0.55, track=0.14)
text_stamp('SUPREME INFOSYS  -  SODHI NAGAR, MOGA, PUNJAB', 30.0, 31.0, 0.55, F_BOLD, SILK, hgt=0.014, rou=0.55, track=0.08)
text_stamp('U2', 58.4, 8.9, 0.8, F_MONO, SILK, hgt=0.012, rou=0.6)
text_stamp('U3', 58.4, 20.9, 0.8, F_MONO, SILK, hgt=0.012, rou=0.6)
text_stamp('J1', 2.3, 3.4, 0.8, F_MONO, SILK, hgt=0.012, rou=0.6)
text_stamp('J2', 30.0, 5.6, 0.8, F_MONO, SILK, hgt=0.012, rou=0.6)
text_stamp('Y1', 46.0, 1.9, 0.7, F_MONO, SILK, hgt=0.012, rou=0.6)
text_stamp('L1', 8.4, 21.1, 0.8, F_MONO, SILK, hgt=0.012, rou=0.6)
text_stamp('L2', 15.2, 21.1, 0.8, F_MONO, SILK, hgt=0.012, rou=0.6)

# diamond chain (stitched border) - a nod to phulkari embroidery
def diamond(cx, cz, rd, filled):
    r = box_region(cx - rd - 0.2, cz - rd - 0.2, cx + rd + 0.2, cz + rd + 0.2)
    X, Z = grid(r)
    dd = (np.abs(X - cx) + np.abs(Z - cz)) * 0.7071 - rd * 0.7071
    if not filled:
        dd = np.abs(dd) - 0.045
    stamp(r, dd, hgt=0.012, bevel=0.02, color=SILK, met=0.0, rou=0.6)

for i in range(0, 36):
    x = 15.0 + i * 0.85
    diamond(x, 35.15, 0.3, i % 2 == 0)

# =====================================================================
# 9. Derived maps
# =====================================================================
print('deriving normals / AO ...')
Hs = cv2.GaussianBlur(H, (0, 0), 0.7)
dhdx = np.zeros_like(H); dhdz = np.zeros_like(H)
dhdx[:, 1:-1] = (Hs[:, 2:] - Hs[:, :-2]) * 0.5 * PXMM
dhdz[1:-1, :] = (Hs[2:, :] - Hs[:-2, :]) * 0.5 * PXMM
nx = -dhdx; ny = np.ones_like(H); nz = -dhdz
inv = 1.0 / np.sqrt(nx * nx + ny * ny + nz * nz)
nx *= inv; nz *= inv
del dhdx, dhdz, ny


def ao_term(sig_mm, scale_mm):
    b = cv2.GaussianBlur(H, (0, 0), sig_mm * PXMM)
    return np.clip((b - H) / scale_mm, 0, 1)

AO = 1.0 - 0.38 * ao_term(0.22, 0.12) - 0.34 * ao_term(0.8, 0.5) - 0.28 * ao_term(2.6, 1.8)
AO = np.clip(AO, 0.12, 1.0)

def enc8(a):
    return np.clip(a * 255.0 + 0.5, 0, 255).astype(np.uint8)

def to_srgb(c):
    c = np.clip(c, 0, 1)
    return np.where(c <= 0.0031308, c * 12.92, 1.055 * np.power(c, 1 / 2.4) - 0.055)

alb8 = np.empty((Hp, Wp, 4), np.uint8)
alb8[..., :3] = enc8(to_srgb(ALB))
alb8[..., 3] = enc8(MET)
nrm8 = np.empty((Hp, Wp, 4), np.uint8)
nrm8[..., 0] = enc8(nx * 0.5 + 0.5)
nrm8[..., 1] = enc8(nz * 0.5 + 0.5)
nrm8[..., 2] = enc8(AO)
nrm8[..., 3] = enc8(np.clip(ROU, 0.04, 1.0))

alb8.tofile(os.path.join(OUT, 'alb.bin'))
nrm8.tofile(os.path.join(OUT, 'nrm.bin'))
H.astype(np.float16).tofile(os.path.join(OUT, 'height.bin'))
tr = np.empty((Hp, Wp, 2), np.float16)
tr[..., 0] = SPAR.astype(np.float16)
tr[..., 1] = PHS.astype(np.float16)
tr.tofile(os.path.join(OUT, 'trace.bin'))
json.dump({'wmm': W_MM, 'hmm': H_MM, 'w': Wp, 'h': Hp, 'hmax': float(H.max()), 'pxmm': PXMM}, open(os.path.join(OUT, 'meta.json'), 'w'))

# previews
pv = cv2.resize(alb8[..., :3], (1600, int(1600 * Hp / Wp)), interpolation=cv2.INTER_AREA)
cv2.imwrite(os.path.join(OUT, 'prev_alb.png'), cv2.cvtColor(pv, cv2.COLOR_RGB2BGR))
hv = cv2.resize(H, (1600, int(1600 * Hp / Wp)), interpolation=cv2.INTER_AREA)
cv2.imwrite(os.path.join(OUT, 'prev_h.png'), enc8(np.clip(hv / 8.5, 0, 1) ** 0.6))
print('done', Wp, Hp, 'hmax', H.max())
