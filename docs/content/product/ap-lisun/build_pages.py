"""Builds the page-import JSON for the Audio Precision and Lisun product menus into pages/.

Sources: the vendor pages linked in "Konten Website PRODUCT.docx". Audio Precision text is summarised
here by hand; Lisun products and the standard -> clause -> model tables come from lisun_source.json
(extracted from Lisun's pages). Run:  python -I docs/content/product/ap-lisun/build_pages.py
Then: node docs/content/product/ap-lisun/apply_pages.mjs   (imports, orders and publishes)

Each file is one POST /admin/pages/import envelope plus the build-only keys "_oldSlug" and "_order"
that apply_pages.mjs strips. Images come from media-urls.json (written by upload_media.mjs).
"""
import json
import os
import re

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "pages")
with open(os.path.join(HERE, "media-urls.json"), encoding="utf-8") as fh:
    MEDIA = json.load(fh)
with open(os.path.join(HERE, "lisun_source.json"), encoding="utf-8") as fh:
    LISUN = json.load(fh)

pages = []


def key(s):
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")


def img(name, alt):
    return {"url": MEDIA[name], "alt": alt} if name in MEDIA else None


def heading(title, intro=""):
    return {"type": "SectionHeading", "props": {"tagline": "", "title": title, "intro": intro}}


def bullets(items):
    return {"type": "RichText", "props": {"body": "\n".join(f"- {i}" for i in items)}}


def feature_grid(items):
    return {"type": "FeatureGrid", "props": {"items": [{"title": t, "text": x} for t, x in items]}}


def spec_table(title, rows):
    return {"type": "SpecTable", "props": {"title": title, "rows": [{"label": a, "value": b} for a, b in rows]}}


def cards(title, intro, *categories):
    """categories: (name, [(name, model, [bullets], image_name)])"""
    cats = []
    for name, items in categories:
        out = []
        for pname, model, bl, image in items:
            card = {"name": pname, "badges": [], "bullets": bl[:12]}
            if model:
                card["model"] = model
            if image and img(image, pname):
                card["image"] = img(image, pname)
            out.append(card)
        if out:
            cats.append({"name": name, "products": out})
    return {"type": "CategorizedProducts", "props": {"tagline": "", "title": title, "intro": intro, "categories": cats}}


def page(group, order, slug, title, brand, intro, blocks, seo):
    props = {"tagline": brand, "title": title, "paragraphs": intro, "imageSide": "right"}
    if img(slug, title):
        props["image"] = img(slug, title)
    pages.append({
        "section": "products", "slug": slug, "title": title, "group": group, "seoDescription": seo[:400],
        "data": {"root": {"props": {}}, "content": [{"type": "ProductIntro", "props": props}, *blocks]},
        "_oldSlug": None, "_order": order,
    })


# ================================================================== Audio Precision
AP = "Audio Precision"
APX = {  # product -> (model, bullets); image name is "ap-" + key(name)
    "APx555B": ("APx555B", ["Modular two-channel audio analyzer", "Audio Precision's reference for performance and versatility"]),
    "APx58xB": ("APx58xB", ["8 or 16-channel modular audio analyzers", "Broad digital I/O for simultaneous multichannel audio test"]),
    "APx52xB": ("APx52xB", ["Modular 2- and 4-channel audio analyzers", "Balances analog performance with a wide range of digital I/O"]),
    "APx517B": ("APx517B", ["Acoustic analyzer for production lines", "For applications where cost and setup time are critical"]),
    "APx516B": ("APx516B", ["Value-oriented analyzer with flexible digital connectivity", "Built for production test, also suited to acoustic R&D"]),
    "APx515B": ("APx515B", ["Two-channel analyzer for production test and entry-level R&D", "Combines speed, performance, reliability and ease of use"]),
    "APx511B": ("APx511B", ["Analyzer for hearing aid manufacturers", "Research and development, performance verification and testing of returned hearing aids"]),
    "APx500 Flex": (None, ["Software-only option: use any ASIO-capable audio interface with the APx500 software", "For very cost-sensitive production test"]),
    "APx500 Software": (None, ["Measurement software platform shared by all APx audio analyzers"]),
    "APx1701 Transducer Test Interface": ("APx1701", ["Low noise, low distortion and flat response for loudspeaker, headphone and microphone measurement"]),
    "GRAS 45CC Headphone Test Fixture": ("45CC", ["Configurable fixture for dual-channel testing of headphones and headsets", "Options include microphones and IEC 60318-1 / IEC 60318-4 ear simulators"]),
    "GRAS KEMAR": (None, ["Industry-standard manikin for anthropomorphic testing in telecommunications, hearing conservation, noise abatement and sound recording"]),
}


def apx(*names):
    return [(n, APX[n][0], APX[n][1], "ap-" + key(n)[:40]) for n in names]


def res(title, text):
    return (title, None, [text], "ap-res-" + key(title)[:60])


page(AP, 0, "dac-power-amplifier-and-dsp-test-and-equipment", "DAC, Power Amplifier and DSP Test and Equipment", "Audio Precision",
     ["Audio amplifiers boost weak audio signals so they can drive loudspeakers. Amplifier designs differ, but the performance questions stay the same: how well noise is rejected, what the frequency response is, whether the gain is linear and how much distortion is added.",
      "Audio Precision analyzers with the APx500 measurement software answer these questions for power amplifiers, preamplifiers, DACs, ADCs and DSP-based audio devices. Amplifier tests are usually made at 1 W output as the standard reference level."],
     [cards("Test solutions", "",
            ("Audio analyzers and software", apx("APx555B", "APx58xB", "APx52xB", "APx516B", "APx515B", "APx500 Flex", "APx500 Software")),
            ("Application notes and guides", [
                res("Application Note: Testing Power Amplifiers", "Power amplifiers bring test challenges not found with digital or low-level analog circuits"),
                res("Measuring Switch-Mode Power Amplifiers", "Smaller, lighter and more efficient switch-mode amplifiers need specific measurement care"),
                res("Measuring Microphone Preamplifier Noise", "Special techniques for noise measurement of high-gain circuits"),
                res("Measuring Low-Power ADCs with the APx555 ADC Test Option", "Technote 136: testing low-power audio ICs with the ADC Test option"),
                res("Transfer Function Measurements with APx Audio Analyzers", "Technote 138: background and use of the Transfer Function measurement in APx500"),
                res("Stereo Power Amplifier Test", "Video: measuring stereo power amplifier performance with an APx515B and APx500"),
            ])),
      heading("Amplifier classes"),
      feature_grid([
          ("Class A", "Current flows through the output transistors all the time, giving smooth, linear amplification at low efficiency."),
          ("Class B", "Two transistors each handle one half of the waveform. Much more efficient, but prone to crossover distortion."),
          ("Class AB", "Combines classes A and B to reduce crossover distortion while improving efficiency."),
          ("Class D", "Uses pulse-width modulation to switch the transistors on and off rapidly, for very high efficiency. Needs output filtering for measurement."),
      ])],
     "Audio Precision audio analyzers and APx500 software for testing power amplifiers, preamplifiers, DACs, ADCs and DSP audio devices.")

page(AP, 1, "audio-device-production-test-and-quality-check", "Audio Device Production Test and Quality Check", "Audio Precision",
     ["Production test has to keep cost down without giving up quality. Audio Precision provides complete production test and measurement solutions, from analyzer performance to automation in the APx500 software.",
      "The same tools cover electronic audio devices such as power amplifiers, headphone amplifiers, DACs and ADCs, and electro-acoustic devices such as loudspeakers, microphones and headphones."],
     [cards("Production test solutions", "",
            ("Audio analyzers, interfaces and fixtures", apx("APx555B", "APx58xB", "APx52xB", "APx517B", "APx516B", "APx511B", "APx1701 Transducer Test Interface", "GRAS 45CC Headphone Test Fixture", "APx500 Flex", "APx500 Software")),
            ("Application notes and guides", [
                res("Production Test with APx Audio Analyzers", "Technote 129: APx500 features for automated production test sequences, with a focus on electro-acoustic devices"),
                res("The Cost of Production-Line Audio Testing", "How accurate, repeatable audio testing improves quality, cuts manufacturing cost and speeds time to market"),
                res("From Frustration to Automation", "From built-in sequencing to API-driven customisation, replacing subjective listening tests with objective automated tests"),
                res("APx517B & Speaker Test Setup", "Video: from unboxing an APx517B acoustic analyzer to measuring a loudspeaker"),
                res("APx Production Test Demonstration Project", "An APx project file that illustrates the production test and automation features"),
                res("AP Applied: Acoustic Response", "Key features of an acoustic analyzer, non-ideal test environments and production needs"),
                res("High Speed Test in Production & Broadcast", "High Speed Tester (HST): a fast audio test application for production lines and transmission quality"),
            ])),
      heading("APx500 features for production test"),
      bullets(["Sequence mode, with the Navigator and Sequencer, signal paths, measurements and sequence steps",
               "Variables, auxiliary control, data export and report generation",
               "Microphone calibration, output level regulation and input equalization",
               "Limits defined from a Golden Unit (reference device) and an analog generator voltage limit to protect connected devices",
               "Password-restricted Production Test mode with a simple operator screen, plus sequence logging and statistics"])],
     "Audio Precision production test: APx audio analyzers, APx1701, GRAS 45CC fixture and APx500 automation for electronic and electro-acoustic audio devices.")

page(AP, 2, "headphone-earbud-and-smart-speaker-test", "Headphone, Earbud and Smart Speaker Test", "Audio Precision",
     ["Many people spend hours a day wearing speakers on or in their ears, and expect hi-fi sound from a very small package. Measuring the audio quality of headphones, earbuds and headsets reliably is demanding work for the engineers who design them.",
      "Audio Precision analyzers with GRAS test fixtures and the APx500 software cover these measurements, including Bluetooth and USB devices."],
     [cards("Test solutions", "",
            ("Analyzers, fixtures and software", apx("APx555B", "APx58xB", "APx52xB", "APx517B", "APx516B", "APx515B", "APx511B", "APx1701 Transducer Test Interface", "GRAS 45CC Headphone Test Fixture", "GRAS KEMAR", "APx500 Flex", "APx500 Software")),
            ("Bluetooth, USB and standards", [
                res("Technote 142: Audio Test of USB Headsets with APx", "Testing USB headsets with APx500 analyzers using open-loop test techniques"),
                res("Testing Headphones to EN 50332 Standards with APx", "Webinar: testing headphones to EN 50332 accurately and efficiently"),
                res("A Step by Step Guide to setting up the APx Bluetooth Duo Module", "Configuring the APx500 software (v4.5 or later) and pairing it with a device"),
                res("APx Bluetooth 5 Option Datasheet", "Third-generation Bluetooth module with Bluetooth LE Audio, supporting Bluetooth specification v5.4"),
                res("APx Bluetooth Duo Option Datasheet", "Wider choice of A2DP codecs, faster pairing and connection, and improved RF shielding"),
                res("Quick Tip 141 – Bluetooth Duo Module", "Video overview of the Bluetooth Duo I/O module and its APx500 integration"),
            ])),
      heading("Common headphone measurements"),
      bullets(["Frequency response", "Electrical impedance", "Input voltages", "Sound pressure level",
               "Harmonic and intermodulation distortion", "Noise attenuation", "Crosstalk attenuation", "Rub and buzz", "Left / right tracking"]),
      heading("Earphone types"),
      feature_grid([
          ("Circumaural (around-ear)", "Completely surround the pinna and rest on the head around it."),
          ("Supra-aural (on-ear)", "Rest on the pinna."),
          ("Intra-concha (in-ear)", "Small earphones that rest within the concha cavity, just outside the ear canal."),
          ("Insert", "Small earphones that partly or completely enter the ear canal."),
          ("Supra-concha", "Rest upon the ridges of the concha cavity."),
      ])],
     "Audio Precision headphone, earbud and headset test: APx analyzers, GRAS 45CC fixture and KEMAR, Bluetooth and USB headset testing, EN 50332.")

# ================================================================== Lisun Group
LG = "Lisun Group"
MAX_CLAUSES = 8
# Navigation / group names: a plain description first, the standard code after it. Matched on the start
# of the standard title as Lisun writes it.
SHORT_NAMES = [
    ("IEC 60598-1", "Luminaire safety · IEC 60598-1"),
    ("IEC 62722-2-1", "LED luminaire performance · IEC 62722-2-1"),
    ("CIE 121", "Photometry of luminaires · CIE 121"),
    ("IS 16101", "LED terms and optical safety · IS 16101"),
    ("IS 16104", "LED control gear · IS 16104"),
    ("IEC 60335-1", "Household appliance safety · IEC 60335-1"),
    ("IEC 60245-1", "Rubber-insulated cables · IEC 60245-1"),
    ("IEC 60227-1", "PVC-insulated cables · IEC 60227-1"),
    ("IEC 60502-1", "Power cables 1 to 30 kV · IEC 60502-1"),
    ("Power cables with extruded insulation and their accessories for rated voltages above 30 kV", "Power cables 30 to 150 kV · IEC 60840"),
    ("IEC 60189-1", "Low-frequency PVC cables · IEC 60189-1"),
    ("IEC 61196-1", "Mineral-insulated cables · IEC 61196-1"),
    ("EN 50305", "Railway rolling stock cables · EN 50305"),
    ("UL 83", "Thermoplastic-insulated wires · UL 83"),
    ("UL 44", "Thermoset-insulated wires · UL 44"),
]


STD_REF = re.compile(
    r"(?:EN/)?\b(?:IEC|EN|UL|ISO|GB)\s?\d[\d\-]*(?::\d{4})?"
    r"(?:\s*(?:Clause|Figure|Fig\.)\s*[\d.]+(?:\s*(?:and|/|&)\s*[\d.]+)*)*"
    r"(?:\s*(?:Clause|Figure|Fig\.)\s*[\d.]+)*",
    re.I)


def product_name(desc):
    """Lisun often names products by the standard clause they test ("IEC 60884-1 Clause 23.2 Figure 27
    Retention Tensile Force Test Device"); the clauses are listed on the card, so keep only the product."""
    last = [part.strip() for part in desc.split("|") if part.strip()]
    text = last[-1] if last else desc
    text = STD_REF.sub("", text)
    text = re.sub(r"^[\s,;:\-–]+|[\s,;:\-–]+$", "", re.sub(r"\s{2,}", " ", text))
    text = re.sub(r"^(?:Figure|Fig\.)\s*[A-Z]?\.?[\d.]+\s+", "", text)
    text = re.sub(r"^(?:Standard\s+)?(?=Test Probe)", "", text)
    return text if len(text) >= 6 else ""


def short_name(title):
    return next((n for prefix, n in SHORT_NAMES if title.startswith(prefix)), title)[:120]


def lisun_page(order, slug, title, intro, seo, std_label):
    """One product-card group per standard: each card is a Lisun product with the clauses it is used for.
    Products the page features that no clause table links go under "Other test equipment"."""
    src = LISUN["pages"][slug]
    products = LISUN["products"]

    def card(url, model_text):
        p = products[url]
        desc = p["desc"].split(" | ")[0].strip()
        model = model_text or p["model"]
        # the model code is shown on its own line, so the name is just the description
        if model and desc.upper().startswith(model.upper()):
            desc = desc[len(model):].strip(" -–:")
        return (product_name(p["desc"]) or desc or model)[:160], model[:80], p["key"]

    groups, used_models, used_links = [], set(), set()
    for std in src["standards"]:
        items = []
        for url, entry in std["products"].items():
            if url not in products:
                continue
            name, model, image = card(url, entry["text"])
            clauses = entry["clauses"]
            bl = clauses[:MAX_CLAUSES] + ([f"and {len(clauses) - MAX_CLAUSES} more clauses"] if len(clauses) > MAX_CLAUSES else [])
            items.append((name, model, bl, image))
            used_links.add(url)
            used_models.update(m.strip().upper() for m in re.split(r"[/&]|\band\b", entry["text"], flags=re.I) if m.strip())
        if items:
            groups.append((short_name(std["title"]), items))
    other = []
    for f in src["featured"]:
        model = f["name"].split(" ")[0]
        if f["link"] in used_links or model.upper() in used_models:
            continue
        name, model, image = card(f["link"], model)
        other.append((name, model, [f"Part of Lisun's {std_label} test solutions"], image))
    if other:
        groups.append(("Other test equipment", other))
    blocks = [cards("Test equipment by standard",
                    "Each group is a standard; each card is the Lisun product used for the clauses listed on it.",
                    *groups)]
    page(LG, order, slug, title, "Lisun", intro, blocks, seo)


lisun_page(0, "luminaire-test-and-equipment", "Luminaire Test and Equipment",
           ["Lisun's test solutions for indoor and outdoor LED luminaires and fixtures cover the key international standards for safety, photometric and colour performance, and environmental robustness of LED products.",
            "IEC 60598-1 sets the general safety requirements for luminaires, such as mechanical strength, insulation, protection against electric shock and fire resistance, while IEC 62722-2-1 covers LED luminaire performance such as luminous flux and efficacy. Photometry follows CIE 121, and the Indian standards IS 16101 and IS 16104 cover LED terms and control gear."],
           "Lisun LED luminaire test equipment: goniophotometers, integrating spheres, spectroradiometers, power and safety testers for IEC 60598-1, IEC 62722-2-1, CIE 121 and IS 16101 / 16104.",
           "LED and luminaire")
lisun_page(1, "home-appliance-test-and-equipment", "Home Appliance Test and Equipment",
           ["Lisun's household appliance test solutions follow IEC 60335, the basic international safety standard for household and similar electrical appliances rated up to 250 V single-phase and 480 V three-phase. It sets safety requirements and test methods across electrical, mechanical, thermal, abnormal operation and electromagnetic compatibility aspects.",
            "The solutions cover the key IEC 60335 tests: accessibility, heating, leakage current and dielectric strength, water resistance, EMC (ESD, fast transients, surges), mechanical strength, corrosion and flame resistance, plus flexing, salt spray and drop tests."],
           "Lisun household appliance test equipment for IEC 60335-1: test probes, leakage current and withstand voltage testers, EMC generators, glow-wire, needle flame and mechanical testers.",
           "household appliance")
lisun_page(2, "cable-and-wire-test-and-equipment", "Cable and Wire Test and Equipment",
           ["Lisun's cable and wire test solutions verify compliance with international safety and performance standards for rubber-insulated, PVC-insulated, medium and high-voltage, and communication cables.",
            "They cover electrical tests (insulation resistance, dielectric strength, partial discharge, capacitance), mechanical tests (flexing, static flexibility, abrasion, tensile strength), environmental tests (temperature and humidity cycling, thermal shock, ozone, salt spray) and safety tests (flame retardance, heat resistance, pressure at high temperature)."],
           "Lisun cable and wire test equipment for IEC 60245-1, IEC 60227-1, IEC 60502-1, IEC 60189-1, IEC 61196-1, EN 50305, UL 83 and UL 44.",
           "cable and wire")

os.makedirs(OUT, exist_ok=True)
for f in os.listdir(OUT):
    if f.endswith(".json"):
        os.remove(os.path.join(OUT, f))
for p in pages:
    with open(os.path.join(OUT, p["slug"] + ".json"), "w", encoding="utf-8") as fh:
        json.dump(p, fh, ensure_ascii=False, indent=2)
print(len(pages), "pages")
