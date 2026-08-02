#!/usr/bin/env python3
from pathlib import Path

import numpy as np
from PIL import Image

PUB = Path(__file__).resolve().parents[1] / "public"


def square_pad(im: Image.Image) -> Image.Image:
    im = im.convert("RGBA")
    side = max(im.size)
    sq = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    sq.paste(im, ((side - im.size[0]) // 2, (side - im.size[1]) // 2), im)
    return sq


def black_icon(mark: Image.Image, size: int, path: Path) -> None:
    bg = Image.new("RGBA", (size, size), (10, 10, 10, 255))
    m = mark.resize((int(size * 0.78), int(size * 0.78)), Image.Resampling.LANCZOS)
    bg.paste(m, ((size - m.width) // 2, (size - m.height) // 2), m)
    bg.save(path)
    a = np.array(bg)
    white_mask = (
        (a[:, :, 0] > 240)
        & (a[:, :, 1] > 240)
        & (a[:, :, 2] > 240)
        & (a[:, :, 3] > 200)
    )
    white = int(white_mask.sum())
    mean = a[a[:, :, 3] > 200][:, :3].mean(axis=0)
    print(f"{path.name}: white={white} mean={mean.round(1)}")


def main() -> None:
    raw = Image.open(PUB / "logo-mark-raw.png")
    sq = square_pad(raw)
    sq.save(PUB / "logo-mark-sq.png")

    black_icon(sq, 1024, PUB / "logo.png")
    black_icon(sq, 512, PUB / "logo-new.png")
    black_icon(sq, 192, PUB / "logo-192-app.png")
    black_icon(sq, 180, PUB / "apple-touch-icon.png")
    black_icon(sq, 32, PUB / "favicon-32.png")

    sq.resize((256, 256), Image.Resampling.LANCZOS).save(PUB / "logo-mark.png")
    sq.resize((192, 192), Image.Resampling.LANCZOS).save(PUB / "logo-192.png")

    for src_name, out_name in (("w.png", "logo-white.png"), ("b.png", "logo-black.png")):
        p = Path("/tmp") / src_name
        if p.exists():
            square_pad(Image.open(p)).save(PUB / out_name)
            print("saved", out_name)

    print("done")


if __name__ == "__main__":
    main()
