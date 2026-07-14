from pathlib import Path

from PIL import Image, ImageDraw

SIZE = 600
OUTPUT_DIR = Path(__file__).resolve().parents[1] / "app/static/camera-images/defaults"

BODY = (61, 72, 82, 255)
BODY_LIGHT = (143, 157, 168, 255)
BODY_EDGE = (31, 41, 49, 255)
LENS = (13, 28, 38, 255)
LENS_GLOW = (70, 190, 203, 255)
BACKDROP = (148, 163, 174, 30)
SHADOW = (15, 23, 30, 45)


def canvas() -> tuple[Image.Image, ImageDraw.ImageDraw]:
    image = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)
    draw.ellipse((70, 70, 530, 530), fill=BACKDROP)
    draw.ellipse((145, 455, 455, 505), fill=SHADOW)
    return image, draw


def lens(draw: ImageDraw.ImageDraw, bounds: tuple[int, int, int, int]) -> None:
    draw.ellipse(bounds, fill=BODY_EDGE)
    inset = 16
    inner = (
        bounds[0] + inset,
        bounds[1] + inset,
        bounds[2] - inset,
        bounds[3] - inset,
    )
    draw.ellipse(inner, fill=LENS)
    highlight = (
        inner[0] + 24,
        inner[1] + 20,
        inner[0] + 52,
        inner[1] + 48,
    )
    draw.ellipse(highlight, fill=LENS_GLOW)


def dome() -> Image.Image:
    image, draw = canvas()
    draw.rounded_rectangle((145, 180, 455, 245), radius=28, fill=BODY_LIGHT, outline=BODY_EDGE, width=8)
    draw.pieslice((165, 190, 435, 465), start=0, end=180, fill=BODY, outline=BODY_EDGE, width=8)
    draw.ellipse((215, 265, 385, 435), fill=BODY_LIGHT, outline=BODY_EDGE, width=8)
    lens(draw, (250, 300, 350, 400))
    return image


def bullet() -> Image.Image:
    image, draw = canvas()
    body = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    body_draw = ImageDraw.Draw(body)
    body_draw.rounded_rectangle((140, 215, 445, 355), radius=45, fill=BODY_LIGHT, outline=BODY_EDGE, width=9)
    body_draw.polygon(((400, 220), (485, 250), (485, 320), (400, 350)), fill=BODY, outline=BODY_EDGE)
    lens(body_draw, (405, 235, 485, 335))
    body = body.rotate(-10, resample=Image.Resampling.BICUBIC, center=(300, 300))
    image.alpha_composite(body)
    draw = ImageDraw.Draw(image)
    draw.rounded_rectangle((265, 355, 330, 440), radius=18, fill=BODY, outline=BODY_EDGE, width=7)
    draw.rounded_rectangle((205, 425, 390, 470), radius=20, fill=BODY_LIGHT, outline=BODY_EDGE, width=7)
    return image


def ptz() -> Image.Image:
    image, draw = canvas()
    draw.rounded_rectangle((185, 140, 415, 205), radius=25, fill=BODY_LIGHT, outline=BODY_EDGE, width=8)
    draw.rounded_rectangle((230, 190, 370, 285), radius=28, fill=BODY, outline=BODY_EDGE, width=8)
    draw.ellipse((175, 235, 425, 485), fill=BODY_LIGHT, outline=BODY_EDGE, width=9)
    draw.pieslice((190, 250, 410, 470), start=0, end=180, fill=BODY, outline=BODY_EDGE, width=8)
    lens(draw, (245, 315, 355, 425))
    return image


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    for name, factory in {"dome": dome, "bullet": bullet, "ptz": ptz}.items():
        factory().save(OUTPUT_DIR / f"{name}.webp", format="WEBP", lossless=True, method=6)


if __name__ == "__main__":
    main()
