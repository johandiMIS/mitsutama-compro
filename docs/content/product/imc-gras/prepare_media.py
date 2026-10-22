"""Prepares the images for the IMC, GRAS and Audio Precision pages as WebP: downloaded from the vendors' pages, plus
two taken from the Audio Precision application note PDF.

Run:  python docs/content/product/imc-gras/prepare_media.py      (needs: pip install pillow)
Output: docs/content/product/imc-gras/media/<name>.webp  -- the site only accepts WebP.
Then:   node docs/content/product/imc-gras/upload_media.mjs

Sources are the vendors' own product / application pages (the links in "Konten Website PRODUCT.docx").
They are third-party marketing images: check you may host them before publishing, or replace them
in the admin.
"""
import io
import json
import os
import urllib.request

from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "media")
IMC = "https://www.imc-tm.com"
GRAS = "https://www.grasacoustics.com"

# media name (= page slug for heroes) -> image URL
IMAGES = {
    # IMC
    "vehicle-dynamic-test-and-equipment": IMC + "/fileadmin/Public/Applications/General_Solutions/Automotive_Tests/Automotive_Tests/DrivingDynamics_imc_TorqueVectoring_WFT_Sensors.jpg",
    "ev-power-analyzer": IMC + "/fileadmin/Public/Applications/E-Mobility/Test-Validation-of-hybrid-and-electric-vehicles.jpg",
    "train-nvh-monitoring-and-analysis": IMC + "/fileadmin/Public/Applications/Rail/Schienenfahrzeuge_slider_1140.jpg",
    "aeroplanes-nvh-and-analysis": IMC + "/fileadmin/Public/Applications/Aerospace/Structural-analysis-of-components.jpg",
    "defense": IMC + "/fileadmin-ap/user_upload/Axiometrix_Solutions_Defense_Hero_Mobile.jpg",
    "structure-and-bridge-monitoring-and-analysis": IMC + "/fileadmin/Public/Applications/2Brueckenbild.jpg",
    "energy-and-power-grid": IMC + "/fileadmin/Public/Applications/Energy/Offshore_Windpark.jpg",
    # GRAS pages
    "head-and-torso": GRAS + "/fileadmin-gras/_processed_/6/0/csm_Head_and_Torso_Simulators-Banner_11b34ef96a.jpg",
    "engine-noise-testing-for-ev-and-ice": GRAS + "/fileadmin-gras/Images/Industries/Automotive/Engine_Noise/engine-1362x481.png",
    "brake-noise-testing": GRAS + "/fileadmin-gras/Images/Industries/Automotive/Brake_Noise/brake-1362x481.png",
    "vehicle-interior-noise-on-electric-vehicles": GRAS + "/fileadmin-gras/Images/Industries/Automotive/Vehicle_Interior/vehicle_interior_16180413.jpg",
    "car-buzz-squeak-and-rattle-noise-testing": GRAS + "/fileadmin-gras/Images/Industries/Automotive/Squeak_Rattle/buzz_squeak_rattle_noise_157198139.jpg",
    "automotive-wind-noise-testing": GRAS + "/fileadmin-gras/Images/Industries/Automotive/Wind_Noise/banner-til-slider.jpg",
    "production-line-microphone-for-consumer-electronic-products": GRAS + "/fileadmin-gras/_processed_/d/9/csm_GRAS_40PO-H_Transparent_0dcffaf052.png",
    # GRAS recommended microphones (cards on the noise-testing pages)
    "gras-42ag": GRAS + "/fileadmin-gras/Products/GRAS_42AG_1kHz-114dB.jpg",
    "gras-146ae": GRAS + "/fileadmin-gras/Products/GRAS_146AE_skygge.png",
    "gras-147ax": GRAS + "/fileadmin-gras/Products/Content/147AX_NY.jpg",
    "gras-46bc": GRAS + "/fileadmin-gras/Products/GRAS_46BC_TransBG_WithShadow_WEB.png",
    "gras-47hc": GRAS + "/fileadmin-gras/Products/47hc_web.jpg",
    "gras-48lx-1": GRAS + "/fileadmin-gras/Products/Content/UTP_48LX-1_p413x267-08072020.jpg",
    "gras-40ls": GRAS + "/fileadmin-gras/Products/40ls_web.jpg",
    # GRAS production line microphones (cards)
    "gras-40po-h": GRAS + "/fileadmin-gras/_processed_/d/9/csm_GRAS_40PO-H_Transparent_0dcffaf052.png",
    "gras-40po-l": GRAS + "/fileadmin-gras/_processed_/4/c/csm_GRAS_40PO-L_Transparent_5f3c5a9383.png",
    "gras-40pm": GRAS + "/fileadmin-gras/_processed_/7/5/csm_GRAS_40PM_withShadow-NEW_d7d3d7ae8d.jpg",
    "gras-40pm-1": GRAS + "/fileadmin-gras/_processed_/b/4/csm_GRAS_40PM-1_withShadow-NEW_a4eb7861dc.jpg",
    "gras-40pi": GRAS + "/fileadmin-gras/_processed_/7/1/csm_gras_40PI_5b3473e0cf.jpg",
    "gras-40pp-10": GRAS + "/fileadmin-gras/Products/40PP-10_Hires_500x423.jpg",
    "gras-40pp-10-s1": GRAS + "/fileadmin-gras/_processed_/1/5/csm_40pp-s1_web_ug_5ae3ff5238.jpg",
}
MAX_SIDE = 1600

# Photos for the item cards (applications, modules, KEMAR variants): name -> URL, picked per item from the
# vendor pages (matched by each image's alt text and file name).
with open(os.path.join(HERE, "item_images.json"), encoding="utf-8") as fh:
    IMAGES.update(json.load(fh))

# Audio Precision application note "Automotive Audio Testing - Amplifiers": media name -> embedded image xref, or (page, clip rect)
APP_NOTE = r"C:\Users\Zenversenstiven\Downloads\Audio-Precision-AppNote-Automotive-Audio-Amplifier-Testing.pdf"
APP_NOTE_IMAGES = {
    "automotive-entertainment-test-and-equipment": 396,  # cover photo: speakers in a car door
    "ap-automotive-audio-subsystems": (2, (95, 295, 535, 560)),
    "ap-grounding": (4, (60, 334, 484, 455)),         # bus vs star grounding diagram with captions
    "ap-classd-filter": (27, (62, 192, 434, 300)),    # class D output before / after the filter  # page 2 diagram incl. its labels (rendered, 250 dpi)
}


def save_webp(im, name):
    im.thumbnail((MAX_SIDE, MAX_SIDE), Image.LANCZOS)
    path = os.path.join(OUT, name + ".webp")
    im.save(path, "WEBP", quality=85, method=6)
    print(f"{name:62s} {im.width}x{im.height} {os.path.getsize(path) // 1024} KB")


def app_note_images():
    import pymupdf  # pip install pymupdf

    doc = pymupdf.open(APP_NOTE)
    for name, source in APP_NOTE_IMAGES.items():
        if isinstance(source, tuple):  # (page, clip rect in points): the labels are vector drawings, not part of the image
            page, rect = source
            pix = doc[page - 1].get_pixmap(dpi=250, clip=pymupdf.Rect(*rect))
            save_webp(Image.frombytes("RGB", (pix.width, pix.height), pix.samples), name)
            continue
        xref = source
        info = doc.extract_image(xref)
        im = Image.open(io.BytesIO(info["image"])).convert("RGB")
        if info.get("smask"):  # transparency stored as a separate mask image
            mask = Image.open(io.BytesIO(doc.extract_image(info["smask"])["image"])).convert("L")
            bg = Image.new("RGB", im.size, "white")
            bg.paste(im, mask=mask.resize(im.size))
            im = bg
        save_webp(im, name)


def main():
    os.makedirs(OUT, exist_ok=True)
    app_note_images()
    for name, url in IMAGES.items():
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        raw = urllib.request.urlopen(req, timeout=40).read()
        im = Image.open(io.BytesIO(raw))
        if im.mode in ("RGBA", "LA", "P"):
            im = im.convert("RGBA")
            bg = Image.new("RGB", im.size, "white")
            bg.paste(im, mask=im.split()[3])
            im = bg
        else:
            im = im.convert("RGB")
        im.thumbnail((MAX_SIDE, MAX_SIDE), Image.LANCZOS)
        path = os.path.join(OUT, name + ".webp")
        im.save(path, "WEBP", quality=85, method=6)
        print(f"{name:62s} {im.width}x{im.height} {os.path.getsize(path) // 1024} KB")


if __name__ == "__main__":
    main()
