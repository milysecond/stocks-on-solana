#!/usr/bin/env python3
"""Clean Gray bull logos: kill white fringe, export site icons."""
from __future__ import annotations

from pathlib import Path

import numpy as np
from PIL import Image

SRC = Path("/Volumes/PRO-G40/MacHome-Offload/dotfiles/hermes/cache/images/img_a0e2576a991a.jpg")
OUT = Path("/Users/metaclaw/.openclaw/workspace/stocks-on-solana/public")


def content_runs(arr: np.ndarray) -> tuple[list[tuple[int, int]], int, int]:
    mask = np.logical_not(
        (arr[:, :, 0] > 245) & (arr[:, :, 1] > 245) & (arr[:, :, 2] > 245)
    )
    col = mask.any(axis=0)
    runs: list[tuple[int, int]] = []
    on = False
    start = 0
    for i, v in enumerate(col):
        if v and not on:
            start = i
            on = True
        elif (not v) and on:
            if i - start > 50:
                runs.append((start, i))
            on = False
    if on and len(col) - start > 50:
        runs.append((start, len(col)))
    ys = np.where(mask.any(axis=1))[0]
    return runs, int(ys[0]), int(ys[-1]) + 1


def kill_white_fringe(a: np.ndarray, lum_cut: float = 140, sat_cut: float = 28) -> np.ndarray:
    out = a.astype(np.float32).copy()
    r, g, b = out[:, :, 0], out[:, :, 1], out[:, :, 2]
    mx = np.maximum(np.maximum(r, g), b)
    mn = np.minimum(np.minimum(r, g), b)
    sat = mx - mn
    lum = 0.2126 * r + 0.7152 * g + 0.0722 * b
    fringe = (sat < sat_cut) & (lum > lum_cut)
    white = (r > 240) & (g > 240) & (b > 240)
    kill = fringe | white
    out[kill, 3] = 0
    return out


def bbox_crop(a: np.ndarray, pad: int = 8) -> np.ndarray:
    alpha = a[:, :, 3]
    ys, xs = np.where(alpha > 10)
    if len(xs) == 0:
        return a
    x0 = max(0, int(xs.min()) - pad)
    x1 = min(a.shape[1], int(xs.max()) + pad + 1)
    y0 = max(0, int(ys.min()) - pad)
    y1 = min(a.shape[0], int(ys.max()) + pad + 1)
    return a[y0:y1, x0:x1].copy()


def on_black_square(cropped: np.ndarray, pad: int = 24) -> Image.Image:
    h, w = cropped.shape[:2]
    side = max(h, w) + pad
    canvas = np.zeros((side, side, 4), dtype=np.float32)
    canvas[:, :, 3] = 255  # opaque black
    yoff = (side - h) // 2
    xoff = (side - w) // 2
    src_rgb = cropped[:, :, :3]
    src_a = (cropped[:, :, 3:4] / 255.0)
    region = canvas[yoff : yoff + h, xoff : xoff + w]
    region[:, :, :3] = src_rgb * src_a + region[:, :, :3] * (1.0 - src_a)
    region[:, :, 3] = 255
    canvas[yoff : yoff + h, xoff : xoff + w] = region
    return Image.fromarray(canvas.astype(np.uint8), "RGBA")


def bare_transparent(cropped: np.ndarray, pad: int = 16) -> Image.Image:
    h, w = cropped.shape[:2]
    side = max(h, w) + pad
    canvas = np.zeros((side, side, 4), dtype=np.uint8)
    yoff = (side - h) // 2
    xoff = (side - w) // 2
    img = Image.fromarray(cropped.astype(np.uint8), "RGBA")
    out = Image.fromarray(canvas, "RGBA")
    out.paste(img, (xoff, yoff), img)
    return out


def clean_light_card(tile: Image.Image) -> Image.Image:
    a = np.array(tile.convert("RGBA")).astype(np.float32)
    r, g, b = a[:, :, 0], a[:, :, 1], a[:, :, 2]
    white = (r > 248) & (g > 248) & (b > 248)
    a[white, 3] = 0
    mx = np.maximum(np.maximum(r, g), b)
    mn = np.minimum(np.minimum(r, g), b)
    sat = mx - mn
    lum = 0.2126 * r + 0.7152 * g + 0.0722 * b
    fringe = (sat < 12) & (lum > 250)
    a[fringe, 3] = 0
    c = bbox_crop(a, pad=4)
    h, w = c.shape[:2]
    side = max(h, w)
    canvas = np.zeros((side, side, 4), dtype=np.float32)
    opac = c[:, :, 3] > 200
    if opac.any():
        fill = c[opac].mean(axis=0)
        canvas[:, :] = fill
        canvas[:, :, 3] = 255
    yo = (side - h) // 2
    xo = (side - w) // 2
    sa = c[:, :, 3:4] / 255.0
    region = canvas[yo : yo + h, xo : xo + w]
    region[:, :, :3] = c[:, :, :3] * sa + region[:, :, :3] * (1.0 - sa)
    region[:, :, 3] = 255
    canvas[yo : yo + h, xo : xo + w] = region
    return Image.fromarray(canvas.astype(np.uint8), "RGBA")


def main() -> None:
    im = Image.open(SRC).convert("RGBA")
    arr = np.array(im)
    runs, y0, y1 = content_runs(arr)
    print("runs", runs, "y", y0, y1)
    assert len(runs) >= 3

    tiles = [im.crop((a, y0, b, y1)) for a, b in runs[:3]]

    # Dark gradient bull (primary)
    d = kill_white_fringe(np.array(tiles[0].convert("RGBA")))
    d = bbox_crop(d, pad=6)
    primary = on_black_square(d, pad=28)

    # White bull
    warr = kill_white_fringe(np.array(tiles[1].convert("RGBA")), lum_cut=200, sat_cut=20)
    # don't kill the white bull body — only page white (already mostly gone)
    # re-process: only kill pure white outside bull by using sat on midtones
    warr = np.array(tiles[1].convert("RGBA")).astype(np.float32)
    r, g, b = warr[:, :, 0], warr[:, :, 1], warr[:, :, 2]
    # page white only
    page = (r > 250) & (g > 250) & (b > 250)
    warr[page, 3] = 0
    # light gray fringe outside mark: high lum, on near-black neighborhood
    warr = bbox_crop(warr, pad=6)
    white_logo = on_black_square(warr, pad=28)

    light = clean_light_card(tiles[2])

    # Bare mark (transparent) from dark gradient tile — for header on dark UI
    bare_arr = kill_white_fringe(np.array(tiles[0].convert("RGBA")))
    # also kill near-black card so only the colorful bull remains
    r, g, b, al = bare_arr[:, :, 0], bare_arr[:, :, 1], bare_arr[:, :, 2], bare_arr[:, :, 3]
    mx = np.maximum(np.maximum(r, g), b)
    mn = np.minimum(np.minimum(r, g), b)
    sat = mx - mn
    lum = 0.2126 * r + 0.7152 * g + 0.0722 * b
    # black card: low lum low sat
    black_card = (lum < 35) & (sat < 25) & (al > 0)
    bare_arr[black_card, 3] = 0
    bare_arr = bbox_crop(bare_arr, pad=4)
    bare = bare_transparent(bare_arr, pad=20)

    OUT.mkdir(parents=True, exist_ok=True)
    primary.save(OUT / "logo-bull-gradient-dark.png")
    white_logo.save(OUT / "logo-bull-white.png")
    light.save(OUT / "logo-bull-gradient-light.png")
    bare.save(OUT / "logo-bull-bare.png")
    bare.resize((256, 256), Image.Resampling.LANCZOS).save(OUT / "logo-mark.png")

    for size, name in [
        (1024, "logo.png"),
        (512, "logo-new.png"),
        (192, "logo-192.png"),
        (32, "favicon-32.png"),
        (180, "apple-touch-icon.png"),
    ]:
        primary.resize((size, size), Image.Resampling.LANCZOS).save(OUT / name)
        a = np.array(Image.open(OUT / name).convert("RGBA"))
        near_w = int(((a[:, :, 0] > 240) & (a[:, :, 1] > 240) & (a[:, :, 2] > 240) & (a[:, :, 3] > 200)).sum())
        print(f"{name}: near-white={near_w} corner={tuple(a[0, 0])}")

    print("bare corner", bare.getpixel((0, 0)))
    print("done")


if __name__ == "__main__":
    main()
