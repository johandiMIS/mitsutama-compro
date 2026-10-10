"""Cuts the Chroma product images out of "Chroma Power Electronic Test.pdf" as WebP.

Run:  python docs/content/product/chroma/prepare_media.py   (needs: pip install pymupdf pillow)
Output: docs/content/product/chroma/media/<name>.webp  — the site only accepts WebP.

Two kinds of source:
  * EMBEDDED  — a photo stored in the PDF (xref id). Composited on white (many have alpha),
                then upscaled 3x because the PDF keeps them small (60-250px wide).
  * CLIP      — a region of a page rendered at 300 dpi, for diagrams that are drawn rather than
                stored as one picture (system overviews, grid simulator diagram).
Use upload_media.mjs next to push them to the media bucket.
"""
import os

import pymupdf
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
PDF = os.path.join(HERE, "Chroma Power Electronic Test.pdf")
OUT = os.path.join(HERE, "media")
EXTRACTED = os.path.join(HERE, "extracted", "images")

# name -> xref of an image embedded in the PDF
EMBEDDED = {
    "ac-electronic-load-63800": 1616,
    "dc-electronic-load-63000": 1618,
    "dc-electronic-load-6310a": 1224,
    "dc-electronic-load-63200": 1647,
    "dc-electronic-load-63600": 1214,
    "ac-power-source-61500": 3546,
    "ac-power-source-61600": 3541,
    "ac-power-source-61700": 3550,
    "dc-power-supply-62000b": 5170,
    "dc-power-supply-62000h": 5152,
    "dc-power-supply-62000l": 5156,
    "dc-power-supply-62000p": 5592,
    "solar-array-simulator-62000h-s": 5154,
    "digital-power-meter-66200": 5598,
    "wound-component-est-analyzer-19036": 5647,
    "corona-hipot-tester-19055-c": 5644,
    "impulse-winding-tester-19301a": 5622,
    "hf-lcr-meter-11050": 5621,
    "milliohm-meter-16502": 5639,
    "inductor-test-and-packing-machine-1870d": 5630,
    "inductor-layer-short-test-machine-1871": 5638,
    "electrical-safety-analyzers": 5658,
    "lcr-meters-and-passive-component-testers": 5675,
    "regenerative-battery-cell-test-system-17011": 5790,
    "regenerative-battery-pack-test-system-17020e": 5951,
    "regenerative-battery-pack-test-system-17040": 5953,
    "automatic-test-systems": 6227,
    "inverter-test-and-equipment": 6288,
    "multi-channel-hipot-tester-19020": 5658,
    "electrical-safety-analyzer-19032-p": 5665,
    "wound-component-est-scanner-19035": 5656,
    "battery-cell-surge-tester-19311": 5661,
    "partial-discharge-tester-19501-k": 5664,
    "hipot-analyzer-19056-19057": 5662,
    "lcr-meter-11021": 5674,
    "lcr-meter-11025": 5675,
    "auto-transformer-test-system-13350": 5673,
    "electrolytic-capacitor-testers-11800": 5676,
    "battery-insulation-tester-11210": 5679,
    "capacitor-leakage-current-ir-tester-11200": 5677,
    "pv-inverter-ats-8000": 6009,
    "micro-inverter-ats-8000": 5993,
    "bms-pcba-ats": 6183,
    "hcu-vms-vcu-ats": 6186,
    "obc-dc-dc-converter-ats": 6198,
    "ev-ac-dc-charging-compatibility-ats": 6196,
    "wireless-charger-ats": 6192,
    "evse-ats": 6190,
    "led-load-simulator-63110a": 1222,
    "formation-system": 5808,
}

# name -> (page number, (x0, y0, x1, y1) in PDF points)
CLIPS = {
    "power-electronic-test-and-equipment": (2, (22, 290, 578, 508)),  # world map of offices and distributors
    "ac-power-source-61800": (5, (28, 688, 305, 775)),
    "regenerative-battery-pack-test-system-17020": (12, (38, 125, 183, 267)),
    "battery-pack-simulator-17020-17040": (13, (28, 88, 295, 232)),
    "bms-test-system-8710": (13, (27, 280, 335, 430)),
    "pv-inverter-pcs-test-solutions": (13, (28, 495, 600, 822)),
    "ev-test-solutions": (14, (20, 60, 585, 545)),
    # page 15 automatic test systems (PDF points)
    "adapter-charger-ats-8020": (15, (30, 184, 128, 275)),
    "pc-power-supply-ats-8010": (15, (132, 115, 185, 275)),
    "dc-dc-converter-ats-8000": (15, (187, 115, 239, 275)),
    "smps-ats-8000": (15, (242, 115, 289, 275)),
    "led-driver-ats-8491": (15, (431, 115, 531, 275)),
    "high-capacitance-electrolytic-capacitor-ats-1911": (15, (27, 344, 114, 471)),
    "medical-electrical-safety-ats-8910": (15, (114, 335, 155, 471)),
    "magnetic-component-test-system-1810": (15, (184, 400, 241, 471)),
    "capacitor-test-system-1820": (15, (241, 344, 296, 471)),
    "bias-current-test-system-11300": (15, (310, 344, 360, 471)),
    "component-ats-8800": (15, (369, 344, 416, 471)),
    "edlc-ats-8801": (15, (426, 328, 469, 471)),
    "edlc-lc-monitoring-system-8802": (15, (488, 328, 531, 471)),
    # page 11 battery cell line (PDF points)
    "barcode-binding-equipment": (11, (76, 184, 112, 238)),
    "ocv-acr-test-equipment": (11, (256, 191, 288, 238)),
    "battery-cell-grouping-equipment": (11, (228, 264, 284, 291)),
    "functional-ats": (11, (359, 189, 382, 238)),
    "thermal-data-logger": (11, (487, 291, 522, 318)),
    "battery-pack-ats": (14, (283, 148, 325, 250)),
    "battery-module-maintenance-ats": (14, (328, 161, 366, 247)),
    "electrical-safety-test-system": (14, (63, 541, 105, 614)),
}

# name -> file already extracted to extracted/images (lifestyle photos from the cover)
COVER = {
    "battery-test-and-equipment": "p01_01.png",
    "ev-and-evse-test-and-equipment": "p01_03.png",
}


def on_white(im):
    if im.mode in ("RGBA", "LA", "P"):
        im = im.convert("RGBA")
        bg = Image.new("RGB", im.size, "white")
        bg.paste(im, mask=im.split()[3])
        return bg
    return im.convert("RGB")


def save(im, name):
    im.save(os.path.join(OUT, name + ".webp"), "WEBP", quality=90, method=6)
    print(f"{name:55s} {im.width}x{im.height}")


def embedded(doc, xref):
    pix = pymupdf.Pixmap(doc, xref)
    smask = next((i[1] for p in doc for i in p.get_images(full=True) if i[0] == xref), 0)
    if smask:
        pix = pymupdf.Pixmap(pix, pymupdf.Pixmap(doc, smask))
    if pix.colorspace.n > 3:
        pix = pymupdf.Pixmap(pymupdf.csRGB, pix)
    im = Image.frombytes("RGBA" if pix.alpha else "RGB", (pix.width, pix.height), pix.samples)
    im = on_white(im)
    return im.resize((im.width * 3, im.height * 3), Image.LANCZOS)


def main():
    os.makedirs(OUT, exist_ok=True)
    doc = pymupdf.open(PDF)
    for name, xref in EMBEDDED.items():
        save(embedded(doc, xref), name)
    for name, (page, rect) in CLIPS.items():
        pix = doc[page - 1].get_pixmap(dpi=300, clip=pymupdf.Rect(*rect))
        save(Image.frombytes("RGB", (pix.width, pix.height), pix.samples), name)
    for name, fn in COVER.items():
        im = on_white(Image.open(os.path.join(EXTRACTED, fn)))
        save(im.resize((im.width * 3, im.height * 3), Image.LANCZOS), name)


if __name__ == "__main__":
    main()
