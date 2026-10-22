"""Downloads the images for the Audio Precision and Lisun product pages and converts them to WebP.

Run:  python docs/content/product/ap-lisun/prepare_media.py      (needs: pip install pillow)
Output: docs/content/product/ap-lisun/media/<name>.webp  -- the site only accepts WebP.
Then:   node docs/content/product/ap-lisun/upload_media.mjs

images.json (name -> URL) lists the hero of each page plus one photo per product / resource card, taken
from the vendor pages linked in "Konten Website PRODUCT.docx". Lisun images are the full-size versions of
the thumbnails on its pages. These are third-party marketing images: check you may host them.
"""
import io
import json
import os
import sys
import urllib.request
from concurrent.futures import ThreadPoolExecutor

from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "media")
MAX_SIDE = 1600
with open(os.path.join(HERE, "images.json"), encoding="utf-8") as fh:
    IMAGES = json.load(fh)


def fetch(item):
    name, url = item
    try:
        raw = urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"}), timeout=60).read()
        im = Image.open(io.BytesIO(raw))
        if im.mode in ("RGBA", "LA", "P"):
            im = im.convert("RGBA")
            bg = Image.new("RGB", im.size, "white")
            bg.paste(im, mask=im.split()[3])
            im = bg
        else:
            im = im.convert("RGB")
        im.thumbnail((MAX_SIDE, MAX_SIDE), Image.LANCZOS)
        im.save(os.path.join(OUT, name + ".webp"), "WEBP", quality=85, method=6)
        return name, f"{im.width}x{im.height}"
    except Exception as e:  # report and carry on; the card is then built without an image
        return name, f"FAILED {e}"


def main():
    os.makedirs(OUT, exist_ok=True)
    only = set(sys.argv[1:])
    with ThreadPoolExecutor(8) as ex:
        for name, result in ex.map(fetch, [(k, v) for k, v in IMAGES.items() if not only or k in only]):
            print(f"{name:62s} {result}")


if __name__ == "__main__":
    main()
