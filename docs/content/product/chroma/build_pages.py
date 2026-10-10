"""Builds the per-product page-import JSON for docs/content/product/chroma/pages/.

Source: "Chroma Power Electronic Test.pdf" (text in extracted/content.md).
Run:  python -I docs/content/product/chroma/build_pages.py
Each output file is one POST /admin/pages/import envelope (section "products", draft only).
Images: prepare_media.py cuts them from the PDF, upload_media.mjs uploads them and writes
media-urls.json (name = page slug); pages without an entry are built without an image.
"""
import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "pages")
try:
    with open(os.path.join(HERE, "media-urls.json"), encoding="utf-8") as fh:
        MEDIA = json.load(fh)
except FileNotFoundError:
    MEDIA = {}


def image_for(slug, alt):
    return {"url": MEDIA[slug], "alt": alt} if slug in MEDIA else None

POWER = "power-electronic-test-and-equipment"
INVERTER = "inverter-test-and-equipment"
BATTERY = "battery-test-and-equipment"
EV = "ev-and-evse-test-and-equipment"

pages = []


def bullets(items):
    return "\n".join(f"- {i}" for i in items)


def table(title, rows):
    return {"type": "SpecTable", "props": {"title": title, "rows": [{"label": a, "value": b} for a, b in rows]}}


def page(parent, slug, title, intro, features=None, tables=(), extra=(), seo=None):
    intro_props = {"tagline": "Chroma", "title": title, "paragraphs": intro, "imageSide": "right"}
    if image_for(slug, title):
        intro_props["image"] = image_for(slug, title)
    blocks = [{"type": "ProductIntro", "props": intro_props}]
    if features:
        blocks.append({"type": "SectionHeading", "props": {"tagline": "", "title": "Key Features", "intro": ""}})
        blocks.append({"type": "RichText", "props": {"body": bullets(features)}})
    for t in tables:
        blocks.append(table(*t))
    blocks.extend(extra)
    blocks.append({"type": "ContactCta", "props": {}})
    pages.append(
        {
            "section": "products",
            "slug": slug,
            "title": title,
            "parent": parent,
            "seoDescription": seo or intro[0][:400],
            "data": {"root": {"props": {}}, "content": blocks},
        }
    )


def specs(items, sep=" · "):
    return [(m, sep.join(p for p in rest if p)) for m, *rest in items]


# ---------------------------------------------------------------- Power electronic test
page(
    POWER, "ac-electronic-load-63800", "AC Electronic Load 63800 Series",
    ["Programmable AC electronic loads from 1800W to 4500W for AC loading of UPS, AC sources and power distribution equipment."],
    ["Constant & rectified load modes for AC loading", "Parallel / 3-phase functions (AC mode only)",
     "Timing measurement for battery, UPS, fuse and breaker tests", "Analog voltage & current monitor"],
    [("Specifications", [
        ("Model", "63802 / 63803 / 63804"),
        ("Power", "63802: 1800W · 63803: 3600W · 63804: 4500W"),
        ("Current", "63802: 0 ~ 18Arms (54 Apeak, continue) · 63803: 0 ~ 36Arms (108 Apeak, continue) · 63804: 0 ~ 45Arms (135 Apeak, continue)"),
        ("Voltage", "50 ~ 350Vrms (500 Vpeak)"),
        ("Frequency", "45 ~ 440Hz, DC"),
        ("Dimension", "63802: 4U(H) · 63803 / 63804: 7U(H)"),
    ])],
)

DC_LOAD_INTRO = "Part of Chroma's Programmable DC Electronic Loads family, 100W ~ 240kW."

page(
    POWER, "dc-electronic-load-63000", "Programmable DC Electronic Load 63000 Series",
    ["Bench top programmable DC electronic load. " + DC_LOAD_INTRO],
    ["Bench top load", "OCP testing", "Battery test"],
    [("Models", specs([
        ("63003-150-40", "150V / 40A / 250W", '½ 19"(W) x 2U(H)', "Rise & fall 20µs"),
        ("63004-150-60", "150V / 60A / 350W", '½ 19"(W) x 2U(H)', "Rise & fall 20µs"),
    ]))],
)

page(
    POWER, "dc-electronic-load-6310a", "Cost Effective Modular DC Electronic Load 6310A Series",
    ["Cost effective modular DC electronic load with a unique LED mode for LED power driver tests. " + DC_LOAD_INTRO],
    ["Cost effective modular load", "Unique LED mode for LED power driver tests",
     "LED Load Simulator (63110A / 63113A / 63115A): simulates different numbers of LEDs",
     "Constant Impedance Mode (CZ Mode)"],
    [("Models", specs([
        ("63101A", "80V / 40A / 200W", "Rise & fall 10µs"),
        ("63102A", "80V / 20A / 100W x 2CH", "Rise & fall 10µs"),
        ("63103A", "80V / 60A / 300W", "Rise & fall 10µs"),
        ("63105A", "500V / 10A / 300W", "Rise & fall 24µs"),
        ("63107A", "80V / 5A & 40A / 30W & 250W", "Rise & fall 10µs"),
        ("63123A", "120V / 70A / 350W", "Rise & fall 25µs"),
        ("63106A", "80V / 120A / 600W", "Rise & fall 10µs"),
        ("63108A", "500V / 20A / 600W", "Rise & fall 24µs"),
        ("63112A", "80V / 240A / 1200W", "Rise & fall 10µs"),
        ("63110A", "500V / 2A / 100W x 2CH"),
        ("63113A", "300V / 20A / 300W", "Rise & fall 25µs"),
        ("63115A", "600V / 20A / 300W", "Rise & fall 25µs"),
        ("6312A (mainframe)", "2 slots", '½ 19"(W) / 4U(H)'),
        ("6314A (mainframe)", "4 slots", '19"(W) x 4U(H)'),
    ]))],
)

page(
    POWER, "dc-electronic-load-63600", "High Performance DC Electronic Load 63600 Series",
    ["High performance modular DC electronic load with user defined waveform simulation. " + DC_LOAD_INTRO],
    ["High performance modular load", "User defined waveform", "Multi channel synchronous control",
     "Auto frequency sweep up to 50kHz"],
    [("Models", specs([
        ("63610-80-20", "80V / 20A / 100W x 2CH", "Rise & fall 10µs"),
        ("63630-80-60", "80V / 60A / 300W", "Rise & fall 10µs"),
        ("63640-80-80", "80V / 80A / 400W", "Rise & fall 10µs"),
        ("63640-150-60", "150V / 60A / 400W", "Rise & fall 10µs"),
        ("63630-600-15", "600V / 15A / 300W", "Rise & fall 10µs"),
        ("63600-1 (mainframe)", "1 slot"),
        ("63600-2 (mainframe)", "2 slots"),
        ("63600-5 (mainframe)", "5 slots, 10 channels"),
        ("63601-5 (mainframe)", "5 slots, 6 channels"),
    ]))],
)


def high_power_rows(series, suffix_a, rise):
    kw = [2, 3, 4, 5, 6, 8, 10, 12, 15, 18, 20, 24]
    dim = {2: "3U", 3: "3U", 4: "4U", 5: "4U", 6: "4U", 8: "7U", 10: "7U", 12: "7U", 15: "10U", 18: "10U", 20: "13U", 24: "13U"}
    cfg = {
        150: ([200, 300, 400, 500, 600, 800, 1000, 1200, 1500, 1800, 2000, 2000], None),
        600: ([140, 210, 280, 350, 420, 560, 700, 840, 1050, 1260, 1400, 1680], [140, 280, 280, 350, 420, 560, 700, 840, 1050, 1260, 1400, 1680]),
        1200: ([80, 120, 160, 200, 240, 320, 400, 480, 600, 720, 800, 960], [80, 120, 160, 200, 240, 320, 400, 480, 600, 720, 800, 960]),
    }
    rows = []
    for volt, (amps, names) in cfg.items():
        names = names or amps
        r = rise[volt]
        for k, a, n in zip(kw, amps, names):
            rows.append((f"632{k:02d}{suffix_a}-{volt}-{n}", f'{volt}V / {a}A / {k}kW', f'19" x {dim[k]}', f"Rise & fall {r}"))
    return specs(rows)


page(
    POWER, "dc-electronic-load-63200", "High Power DC Electronic Load 63200A / 63200E Series",
    ["High power standalone DC electronic loads up to 2,000A and 24kW per unit, with master/slave paralleling control up to 240kW. " + DC_LOAD_INTRO],
    ["High power standalone load", "Current range up to 2,000A", "Master/Slave paralleling control up to 240kW"],
    [
        ("63200A Series", high_power_rows("63200", "A", {150: "10µs", 600: "20µs", 1200: "20µs"})),
        ("63200E Series", high_power_rows("63200", "E", {150: "100µs", 600: "100µs", 1200: "100µs"})),
        ("Function Comparison: 63200A / 63200E", [
            ("Basic functions", "CC, CR, CP, CV, CCD: 63200A and 63200E · CRD: 63200A only"),
            ("Advanced functions (both)", "Short, Battery Discharge, Auto Sequences, CZ"),
            ("Advanced functions (63200A only)", "Sine Wave Dynamic, OCP / OPP Test, CC Sweep, CV+CC, CR+CC, CV+CR, Auto Mode, User Defined Waveform, MPPT, External Waveform"),
        ]),
    ],
)

AC_COMMON = [
    "500VA~60kVA / 0~350Vac / single or three phase settings",
    "Low distortion output voltage waveform",
    "Power line disturbance simulation capability",
    "Harmonics and inter-harmonics synthesis functions",
    "High output current crest factor, ideal for inrush current testing",
    "IEC 61000-4-11, IEC 61000-4-14, IEC 61000-4-28 voltage dips and frequency variation simulations",
    "Interface: GPIB / RS-232 / USB / Ethernet",
]
AC_INTRO = "Part of Chroma's Programmable AC Sources family, 500VA ~ 300kVA."

page(POWER, "ac-power-source-61500", "High Performance AC Power Source 61500 Series",
     ["High performance programmable AC power source with power line disturbance simulation and RTCA DO-160G aerospace testing. " + AC_INTRO],
     AC_COMMON + ["Harmonics, interharmonics waveform synthesizer for IEC 61000-4-13 testing", "61512 can be connected in parallel operation up to 90kVA"],
     [("Models", specs([
         ("61501", "500VA / 300V / DC, 15~1kHz / 1Ø", "3U"), ("61502", "1000VA / 300V / DC, 15~1kHz / 1Ø", "3U"),
         ("61503", "1500VA / 300V / DC, 15~1kHz / 1Ø", "3U"), ("61504", "2000VA / 300V / DC, 15~1kHz / 1Ø", "3U"),
         ("61505", "4000VA / 300V / DC, 15~1kHz / 1Ø", "6U"), ("61507", "3000VA / 350V / DC, 15~2kHz / 1Ø&3Ø", "5U"),
         ("61508", "4500VA / 350V / DC, 15~2kHz / 1Ø&3Ø", "5U"), ("61509", "6000VA / 350V / DC, 15~2kHz / 1Ø&3Ø", "5U"),
         ("61511", "12kVA / 300V / DC, 15~1.5kHz / 1Ø&3Ø", "Cabinet / 26U"), ("61512", "18kVA / 300V / DC, 15~1.5kHz / 1Ø&3Ø", "Cabinet / 26U"),
         ("61511 + A615103", "30kVA / 300V / DC, 15~1.5kHz / 1Ø&3Ø", "Cabinet / 26U x2"),
         ("61512 + A615103", "36kVA / 300V / DC, 15~1.5kHz / 1Ø&3Ø", "Cabinet / 26U x2"),
     ]))])

page(POWER, "ac-power-source-61600", "Basic and Cost Effective AC Power Source 61600 Series",
     ["Basic and cost effective programmable AC power source with high output current crest factor and master-slave parallel operation. " + AC_INTRO],
     AC_COMMON + ["61612 can be connected in parallel operation up to 90kVA"],
     [("Models", specs([
         ("61601", "500VA / 300V / DC, 15~1kHz / 1Ø", "3U"), ("61602", "1000VA / 300V / DC, 15~1kHz / 1Ø", "3U"),
         ("61603", "1500VA / 300V / DC, 15~1kHz / 1Ø", "3U"), ("61604", "2000VA / 300V / DC, 15~1kHz / 1Ø", "3U"),
         ("61605", "4000VA / 300V / DC, 15~1kHz / 1Ø", "6U"), ("61607", "3000VA / 350V / DC, 15~2kHz / 1Ø&3Ø", "5U"),
         ("61608", "4500VA / 350V / DC, 15~2kHz / 1Ø&3Ø", "5U"), ("61609", "6000VA / 350V / DC, 15~2kHz / 1Ø&3Ø", "5U"),
         ("61611", "12kVA / 300V / DC, 15~1.5kHz / 1Ø&3Ø", "Cabinet / 26U"), ("61612", "18kVA / 300V / DC, 15~1.5kHz / 1Ø&3Ø", "Cabinet / 26U"),
         ("61611 + A615103", "30kVA / 300V / DC, 15~1.5kHz / 1Ø&3Ø", "Cabinet / 26U x2"),
         ("61612 + A615103", "36kVA / 300V / DC, 15~1.5kHz / 1Ø&3Ø", "Cabinet / 26U x2"),
     ]))])

page(POWER, "ac-power-source-61700", "Advanced AC Power Source 61700 Series",
     ["Advanced programmable AC power source with power line disturbance simulation and MIL-STD-704F aerospace testing. " + AC_INTRO],
     AC_COMMON + ["Harmonics, interharmonics waveform synthesizer for IEC 61000-4-13 testing"],
     [("Models", specs([
         ("61701", "1500VA / 300V / DC, 15~1.2kHz / 3Ø", "Cabinet / 9U"), ("61702", "3000VA / 300V / DC, 15~1.2kHz / 3Ø", "Cabinet / 9U"),
         ("61703", "4500VA / 300V / DC, 15~1.2kHz / 3Ø", "Cabinet / 9U"), ("61704", "6000VA / 300V / DC, 15~1.2kHz / 3Ø", "Cabinet / 9U"),
         ("61705", "12000VA / 300V / DC, 15~1.2kHz / 3Ø", "Cabinet / 20U"),
     ]))])

page(POWER, "ac-power-source-61800", "Regenerative Grid Simulator 61800 Series",
     ["Fully regenerative grid simulator, applicable for 4 quadrants with voltage and current. Suited to biofuel, solar and wind power, generators, energy storage systems, EVSE and grid line testing. " + AC_INTRO],
     AC_COMMON + ["Regenerative AC load (option)", "Supports parallel functions up to 300kVA (61860)"],
     [("Models", specs([
         ("61830", "30kVA / 300V / DC, 30~100Hz / 1Ø & 3Ø", "Cabinet / 39U"),
         ("61845", "45kVA / 300V / DC, 30~100Hz / 1Ø & 3Ø", "Cabinet / 39U"),
         ("61860", "60kVA / 300V / DC, 30~100Hz / 1Ø & 3Ø", "Cabinet / 39U"),
     ]))])

DC_PS_INTRO = "Part of Chroma's Programmable DC Power Supplies family, 100W ~ 1.5MW (0 ~ 1800V / 2000V, up to 3750A as a system)."
DC_PS_COMMON = ["Standard interface: USB / RS232 / RS485 / APG", "Optional interface: GPIB / Ethernet", "Auto sequencing programming", "LabView and LabWindows support"]

page(POWER, "dc-power-supply-62000b", "Modular DC Power Supply 62000B Series",
     ["Modular programmable DC power supply with hot-swappable modules and N+1 redundancy. " + DC_PS_INTRO],
     ["Hot-swappable & N+1 redundancy", "Master/slave parallel operation: the mainframe can be connected in parallel operation up to 8 units"] + DC_PS_COMMON,
     [("Models", specs([
         ("62015B-15-90", "15V / 90A / 1350W"), ("62015B-30-50", "30V / 50A / 1500W"), ("62015B-60-25", "60V / 25A / 1500W"),
         ("62015B-80-18", "80V / 18A / 1440W"), ("62015B-150-10", "150V / 10A / 1500W"),
         ("62000B-6-1 (mainframe)", '6 slots / 19"(W) x 4U(H)'), ("62000B-3-1 (mainframe)", '3 slots / ½ 19"(W) x 4U(H)'),
     ]))])

page(POWER, "dc-power-supply-62000h", "High Power Density DC Power Supply 62000H Series",
     ["High power density programmable DC power supply: 15kW in 3U. " + DC_PS_INTRO],
     ["High power density 15kW in 3U", "Master/slave parallel operation: the 62000H can be connected in parallel or serial operation up to 10 units",
      "High slew rate control 40V/ms", "Solar array simulation function"] + DC_PS_COMMON,
     [("Models", specs([
         ("62075H-30", "30V / 250A / 7500W", '19" x 3U'), ("62050H-40", "40V / 125A / 5000W", '19" x 3U'),
         ("62050H-450", "450V / 11.5A / 5000W", '19" x 3U'), ("62050H-600", "600V / 8.5A / 5000W", '19" x 3U'),
         ("62100H-30", "30V / 375A / 11250W", '19" x 3U'), ("62100H-40", "40V / 250A / 10000W", '19" x 3U'),
         ("62100H-100P", "100V / 250A / 10000W", '19" x 3U'), ("62100H-450", "450V / 23A / 10000W", '19" x 3U'),
         ("62100H-600", "600V / 17A / 10000W", '19" x 3U'), ("62100H-1000", "1000V / 10A / 10000W", '19" x 3U'),
         ("62150H-40", "40V / 375A / 15000W", '19" x 3U'), ("62150H-100P", "100V / 375A / 15000W", '19" x 3U'),
         ("62150H-450", "450V / 34A / 15000W", '19" x 3U'), ("62150H-600", "600V / 25A / 15000W", '19" x 3U'),
         ("62150H-1000", "1000V / 15A / 15000W", '19" x 3U'), ("62180H-1800P *", "1800V / 30A / 18000W", '19" x 3U'),
     ])), ("Note", [("*", "Call for availability.")])])

page(POWER, "solar-array-simulator-62000h-s", "Solar Array Simulator 62000H-S Series",
     ["Solar array simulator for PV inverter testing with static & dynamic MPPT efficiency tests and shadowed I-V curve output simulation. " + DC_PS_INTRO],
     ["Solar array simulation: EN50530, Sandia & CGC/GF004 standards", "Static & dynamic MPPT efficiency test", "Shadowed I-V curve output simulation",
      "Power factor correction (0.95)", "The 62000H-S can be connected in parallel operation up to 1.5MW (call for availability)"] + DC_PS_COMMON,
     [("Models", specs([
         ("62020H-150S", "150V / 40A / 2000W", '19" x 2U'), ("62050H-600S", "600V / 8.5A / 5000W", '19" x 3U'),
         ("62100H-600S", "600V / 17A / 10000W", '19" x 3U'), ("62150H-600S", "600V / 25A / 15000W", '19" x 3U'),
         ("62150H-1000S", "1000V / 15A / 15000W", '19" x 3U'), ("62180H-1800S *", "1800V / 30A / 18000W", '19" x 3U'),
         ("A620027", "600V / 25A / 15000W (parallelable power stage)", '19" x 3U'),
         ("A620028", "1000V / 15A / 15000W (parallelable power stage)", '19" x 3U'),
     ])), ("Note", [("*", "Call for availability.")])])

page(POWER, "dc-power-supply-62000l", "Programmable DC Power Supply 62000L Series",
     ["Low output noise programmable DC power supply with high transient response. " + DC_PS_INTRO],
     ["High transient response", "Low output noise"] + DC_PS_COMMON,
     [("Models", specs([
         ("62010L-36-7", "36V / 7A / 108W", '½ 19" x 2U'), ("62015L-60-6", "60V / 6A / 150W", '½ 19" x 2U'),
     ]))])

page(POWER, "dc-power-supply-62000p", "Auto Range DC Power Supply 62000P Series",
     ["Auto range, constant power wide range DC power supply supporting ISO 16750-2 electrical loads and corresponding tests. " + DC_PS_INTRO],
     ["Constant power wide range", "ISO 16750-2 electrical loads and corresponding tests",
      "The 62000P can be connected in parallel or serial operation up to 5 units"] + DC_PS_COMMON,
     [("Models", specs([
         ("62006P-30-80", "30V / 80A / 600W", '19" x 2U'), ("62006P-100-25", "100V / 25A / 600W", '19" x 2U'),
         ("62006P-300-8", "300V / 8A / 600W", '19" x 2U'), ("62012P-40-120", "40V / 120A / 1200W", '19" x 2U'),
         ("62012P-80-60", "80V / 60A / 1200W", '19" x 2U'), ("62012P-100-50", "100V / 50A / 1200W", '19" x 2U'),
         ("62012P-600-8", "600V / 8A / 1200W", '19" x 2U'), ("62024P-40-120", "40V / 120A / 2400W", '19" x 2U'),
         ("62024P-80-60", "80V / 60A / 2400W", '19" x 2U'), ("62024P-100-50", "100V / 50A / 2400W", '19" x 2U'),
         ("62024P-600-8", "600V / 8A / 2400W", '19" x 2U'), ("62050P-100-100", "100V / 100A / 5000W", '19" x 4U'),
     ]))])

page(POWER, "digital-power-meter-66200", "Digital Power Meter 66200 Series",
     ["Digital power meters with 1 to 4 channels. Meets ENERGY STAR / IEC 62301 / ErP ecodesign / SPEC POWER measurement requirements."],
     ["Supports several wiring configurations: 1P2W / 1P3W / 3P3W / 3P4W / 3V3A (66203 / 66204)",
      "Smart Range function provides seamless power measurement with power integration under auto range mode (66205)",
      "CT function (DCCT): A662019 DCCT power adapter, A662017 / A662018 ultra high precision DCCT",
      "Software for automotive test standards: GS 95024-2-1, LV123, ISO 16750-2, VW 80000 (voltage transient tests)"],
     [("Specifications", [
         ("Model", "66203 / 66204 / 66205"),
         ("Channels", "66203: 3 · 66204: 4 · 66205: 1"),
         ("Max. voltage range", "600 / 1200Vrms (option)"),
         ("Max. current range", "20Arms / 30Arms"),
         ("Frequency", "10 ~ 10kHz"),
         ("AC/DC measurement mode", "DC, AC+DC"),
         ("Harmonics measurement", "Up to 100 orders"),
     ])])

page(POWER, "hf-lcr-meter-11050", "HF LCR Meter 11050 Series",
     ["High frequency LCR meter for chip inductor and passive component testing."],
     ["Test frequency: 75kHz ~ 30MHz (11050-30M), 1kHz ~ 10MHz (11050), 60Hz ~ 5MHz (11050-5M)", "Test level: 10mV ~ 5V", "Basic accuracy: 0.1%", "Dual frequency mode"])

page(POWER, "corona-hipot-tester-19055-c", "Corona Hi-Pot Tester 19055-C",
     ["Hi-pot tester with corona discharge detection (CDD), suited to EV motor test solutions."],
     ["Hi-Pot: AC 5kV/100mA (4kV/120mA), DC 6kV/25mA", "Insulation: 5kVmax; 1MΩ ~ 50GΩ", "500VA output rating",
      "Floating output complies with EN50191", "Corona Discharge Detection (CDD)"])

page(POWER, "wound-component-est-analyzer-19036", "Wound Component EST Analyzer 19036",
     ["5-in-1 composite analyzer scanner for wound components, suited to EV motor test solutions."],
     ["5 in 1 composite analyzer scanner (ACW / DCW / IR / IWT / DCR)", "5kV AC / 6kV DC Hipot test", "5kV insulation resistance test",
      "Impulse Winding Tester (IWT)", "10 channels 4-wire DCR test", "L/Q test with 3252 (option)"])

page(POWER, "impulse-winding-tester-19301a", "Impulse Winding Tester 19301A",
     ["Impulse winding tester for EV motor and chip inductor test solutions."],
     ["10V ~ 1000V impulse voltage test", "0.25V test resolution", "High impulse test sampling rate (200MHz), 10bits",
      "20mS high speed test (P1.0)", "Inductance contact check function", "Inductance differential voltage compensation function"])

page(POWER, "milliohm-meter-16502", "Milliohm Meter 16502",
     ["Milliohm meter with a wide measurement range and a pulsed test mode."],
     ["Basic accuracy: 0.05%", "Wide measurement range: 0.001mΩ ~ 1.9999MΩ", "Pulsed test mode (thermal EMF reduction)"])

page(POWER, "inductor-test-and-packing-machine-1870d", "Inductor Test & Packing Machine 1870D",
     ["Automatic test and packing machine for SMT type chip inductors."],
     ["Polarity automatic rotation", "High speed sorting / packing (1800ppm max.)", "For SMT type application", "Test control and data collecting"])

page(POWER, "inductor-layer-short-test-machine-1871", "Inductor Layer Short Automatic Test Machine 1871",
     ["Automatic layer short test machine for SMT type chip inductors."],
     ["Special probe design for layer short test", "High speed sorting (1200 ppm max.)", "For SMT type application", "Test control and data collecting"])

page(POWER, "electrical-safety-analyzers", "Electrical Safety Analyzers",
     ["Chroma's electrical safety tester range: hipot analyzers, multi-channel hipot testers, surge testers, partial discharge testers and wound component EST scanners."],
     None,
     [("Selection Guide (AC/DC Hipot · Insulation Resistance)", specs([
         ("19020", "5kVac / 6kVdc", "Cutoff current AC:10mA DC:5mA", "Insulation 1kV / 50GΩ", "10/4 channels"),
         ("19032", "5kVac / 6kVdc", "Cutoff current AC:40mA DC:12mA", "Insulation 1kV / 50GΩ", "Ground bond 30A / 60A (option)", "Leakage current test"),
         ("19032-P", "5kVac / 6kVdc", "Cutoff current AC:100mA DC:25mA", "Insulation 1kV / 50GΩ", "Ground bond 40A", "500VA floating output"),
         ("19035", "5kVac / 6kVdc", "Cutoff current AC:30mA DC:10mA", "Insulation 5kV / 50GΩ", "DCR 8 ports scanner"),
         ("19036", "5kVac / 6kVdc", "Cutoff current AC:100mA DC:25mA", "Insulation 5kV / 50GΩ", "Impulse winding test 6kV", "10 ports scanner"),
         ("19052", "5kVac / 6kVdc", "Cutoff current AC:30mA DC:10mA", "Insulation 1kV / 50GΩ"),
         ("19053", "5kVac / 6kVdc", "Cutoff current AC:30mA DC:10mA", "Insulation 1kV / 10GΩ", "8 ports scanner"),
         ("19054", "5kVac / 6kVdc", "Cutoff current AC:30mA DC:10mA", "Insulation 1kV / 10GΩ", "4 ports scanner"),
         ("19055", "5kVac / 6kVdc", "Cutoff current AC:100mA DC:25mA", "Insulation 5kV / 50GΩ", "500VA floating output, corona detection"),
         ("19056", "10kVac", "AC:20mA"),
         ("19057", "12kVdc", "DC:10mA", "Insulation 5kV / 50GΩ"),
         ("19057-20", "20kVdc", "DC:5mA", "Insulation 5kV / 50GΩ"),
         ("19071", "5kVac", "AC:20mA", "AC only"),
         ("19073", "5kVac / 6kVdc", "Cutoff current AC:20mA DC:5mA", "Insulation 1kV / 50GΩ"),
         ("19301A", "Impulse winding test 1kV", "0.1µH min."),
         ("19311", "Impulse winding test 6kV", "1 port scanner"),
         ("19311-10", "Impulse winding test 6kV", "10 ports scanner"),
         ("19305", "Impulse winding test 6kV", "10µH min."),
         ("19305-10", "Impulse winding test 6kV", "10 ports scanner"),
         ("19501-K", "10kVac", "AC:300µA", "Partial discharge, 1pc ~ 2000pc"),
         ("19572", "Ground bond 45A"),
     ])),
      ("Notes", [
          ("*1", "Leakage current test is required by standards for electrical appliances, medical equipment, IT products and video/audio appliances (IEC 60065, 60335, 60601, 60950 etc.)."),
          ("*2", "Options."), ("*3", "Depends on current output."),
      ])])

page(POWER, "lcr-meters-and-passive-component-testers", "LCR Meters & Passive Component Testers",
     ["LCR meters, automatic transformer test systems, electrolytic capacitor testers, programmable HF AC testers and insulation testers for passive component testing."],
     None,
     [("LCR Meter Selection Guide", specs([
         ("11020", "100Hz, 120Hz, 1kHz", "0.1pF ~ 4.00 F"),
         ("11021", "100Hz, 120Hz, 1kHz, 10kHz", "0.1mΩ ~ 100MΩ"),
         ("11021-L", "1kHz, 10kHz, 40kHz, 50kHz", "0.1mΩ ~ 100MΩ"),
         ("11022", "50/60/100/120/1k/10k/20k/40k/50k/100k Hz", "0.01mΩ ~ 100MΩ"),
         ("11025", "50/60/100/120/1k/10k/20k/40k/50k/100k Hz/DC", "0.01mΩ ~ 100MΩ"),
         ("11050-30M", "75kHz ~ 30MHz/DC", "0.1mΩ ~ 100MΩ"),
         ("11050", "1kHz ~ 10MHz/DC", "0.1mΩ ~ 100MΩ"),
         ("11050-5M", "60Hz ~ 5MHz/DC", "0.1mΩ ~ 100MΩ"),
         ("3252", "20Hz ~ 200kHz/DC", "0.1mΩ ~ 100MΩ"),
         ("3302", "20Hz ~ 1MHz/DC", "0.1mΩ ~ 100MΩ"),
     ])),
      ("Auto Transformer Test System Selection Guide", specs([
          ("13350 + A133502", "20Hz ~ 200kHz", "0.1mΩ ~ 100MΩ"), ("13350-1M + A133502", "20Hz ~ 1MHz", "0.1mΩ ~ 100MΩ"),
          ("3250 + A132501", "20Hz ~ 200kHz", "0.1mΩ ~ 100MΩ"), ("3302 + A132501", "20Hz ~ 1MHz", "0.1mΩ ~ 100MΩ"),
      ])),
      ("Electrolytic Capacitor Tester Selection Guide", specs([
          ("11800", "Ripple current tester", "100Hz/120Hz/400Hz/1kHz, 0~30A, DC bias 0.5V~500V"),
          ("11801", "Ripple current tester", "20k~100kHz, 0~10A, DC bias 0.5~500V"),
          ("11810", "Ripple current tester", "20k~1000kHz, 0~10A, DC bias 0.5~500V"),
          ("13100", "Electrolytic capacitor analyzer", "AC 100Hz/120Hz/1kHz/10kHz/20kHz/50kHz/100kHz, 1V/0.25V"),
      ])),
      ("Programmable HF AC Tester Selection Guide", specs([
          ("11802", "20kHz ~ 200kHz, step 1kHz", "500VA"), ("11805", "10kHz ~ 200kHz, step 1kHz", "1kVA"),
          ("11803", "20kHz ~ 1MHz, step 1kHz", "750VA"), ("11890", "20kHz ~ 200kHz, step 1kHz", "500VA"),
          ("11891", "20kHz ~ 200kHz, step 1kHz", "500VA"),
      ])),
      ("Insulation Tester Selection Guide", specs([
          ("11200", "LC, IR", "1.0~650V/800V, CC 0.5~500mA"),
          ("11210", "LC, IR, partial discharge (option), flashover detection (option)", "1.0~1000V, CC 0.5~50mA"),
      ]))])

# ---------------------------------------------------------------- Battery
page(BATTERY, "regenerative-battery-cell-test-system-17011", "Regenerative Battery Cell Charge & Discharge Test System 17011",
     ["Regenerative charge & discharge test system for battery cells and modules, supporting formation, room-temperature aging and high-temperature aging. Energy is recycled back to the AC line through direct regeneration."],
     ["Regenerative (bi-direction) AC line circuit, direct energy recycling", "Available for data logger",
      "Compatible with battery cell, module and pack test instruments: OCV & ACR test, barcode binding and grouping equipment, 16 CH battery simulator, thermal data logger"],
     [("Modules", specs([
         ("17212R-5-60", "5V / 60A", "Parallelable 6A ~ 720A", "Energy recycling", "12ch./set (fixed)"),
         ("17212R-5-100", "5V / 100A", "Parallelable 100A ~ 1200A", "Energy recycling", "12ch./set (fixed)"),
         ("17212M-6-100", "6V / 100A", "Parallelable 100A ~ 1200A", "Energy recycling", "12ch./set (fixed)"),
         ("17216M-10-6", "10V / 6A", "Parallelable 6A ~ 96A", "16ch./set (fixed)"),
         ("17208M-6-30", "6V / 30A", "Parallelable 30A ~ 240A", "8ch./set (fixed)"),
     ])),
      ("System channels: 6A / 30A", [
          ("25U (1100 x 600 x 1340 mm)", "6A: 32 CH · 30A: 16 CH"),
          ("36U (1100 x 600 x 1830 mm)", "6A: 64 CH · 30A: 32 CH"),
          ("41U (1100 x 600 x 2060 mm)", "30A: 40 CH"),
      ]),
      ("System channels: 60A / 100A", [
          ("25U (1100 x 600 x 1340 mm)", "60A: 12 CH · 100A: 12 CH"),
          ("36U (1100 x 600 x 1830 mm)", "60A: 48 CH · 100A: 36 CH"),
          ("41U (1100 x 600 x 2060 mm)", "60A: 48 CH · 100A: 36 CH"),
      ]),
      ("Power requirement", [
          ("6A (1Φ220V / 3Φ380V)", "16 CH: 3 kVA · 32 CH: 5 kVA · 48 CH: 8 kVA · 64 CH: 10 kVA"),
          ("30A (1Φ220V / 3Φ380V)", "8 CH: 4.5 kVA · 16 CH: 9 kVA · 24 CH: 13 kVA · 32 CH: 17 kVA · 40 CH: 22 kVA"),
          ("60A (3Φ220V / 3Φ380V)", "12 CH: 9 kVA · 24 CH: 18 kVA · 36 CH: 26 kVA · 48 CH: 35 kVA"),
          ("100A (3Φ220V / 3Φ380V)", "12 CH: 15 kVA · 24 CH: 29 kVA · 36 CH: 43 kVA"),
      ]),
      ("Regeneration", [
          ("AC line regeneration", "Bi-direction circuit through the Chroma A691104 AC/DC module"),
          ("Direct regeneration", "Supported, as shown in the 17011 system diagram"),
      ])])

BP_FEATURES = ["AC line regenerative function: discharge power returns to the AC line, lowering AC power consumption",
               "Internal loading", "Driving profile simulation", "Hardware / software integration and customization",
               "Interfaces: Ethernet, Digital I/O, GPIB, CANBus, USB, RS485, RS232, chamber and third party devices"]

page(BATTERY, "regenerative-battery-pack-test-system-17020", "Regenerative Battery Pack Test System 17020",
     ["Regenerative battery pack test system. More power or channel combinations are available."],
     BP_FEATURES,
     [("Models", specs([
         ("17020 · 600W", "Max. 60V / 13A per channel", "8~56 channels per unit (parallelable)"),
         ("17020 · 1.25kW", "20V / 60V · 65A / 62.5A per channel", "4~40 channels per unit"),
         ("17020 · 2.5kW", "20V / 60V / 100V / 200V / 500V * · 130A / 125A / 62.5A / 50A / 30A / 13A", "4~20 channels per unit"),
         ("17020 · 5kW", "2.5kW per channel · 20V ~ 500V * · 260A / 250A / 125A / 100A / 60A / 26A", "2~10 channels per unit"),
         ("17020 · 10kW", "2.5kW per channel · 20V ~ 500V * · 520A / 500A / 250A / 200A / 120A / 52A", "1~5 channels per unit"),
         ("17020 · 20kW", "2.5kW per channel · 20V ~ 500V * · 1040A / 1000A / 500A / 400A / 240A / 104A", "1~3 channels per unit"),
         ("17020 · 50kW", "2.5kW per channel · 20V ~ 500V * · 2600A / 2500A / 1250A / 1000A / 600A / 260A", "1 channel per unit"),
         ("17020 · 60kW", "2.5kW per channel · 60V / 100V / 200V / 500V · 1500A / 1200A / 720A / 312A", "1 channel per unit"),
     ]))])

page(BATTERY, "regenerative-battery-pack-test-system-17020e", "Regenerative Battery Pack Test System 17020E",
     ["Regenerative battery pack test system for high current, low voltage packs. More power or channel combinations are available."],
     BP_FEATURES,
     [("Models", specs([
         ("17020E · 20kW", "10kW per channel · 100V * · 100A per channel", "2 channels per unit (parallelable)"),
         ("17020E · 40kW", "10kW per channel · 100V * · 100A per channel", "4 channels per unit"),
         ("17020E · 20kW", "10kW per channel · 60V * · 180A per channel", "2 channels per unit"),
         ("17020E · 40kW", "10kW per channel · 60V * · 180A per channel", "4 channels per unit"),
         ("17020E · 40kW", "20kW per channel · 60V * · 360A per channel", "2 channels per unit"),
     ]))])

page(BATTERY, "regenerative-battery-pack-test-system-17040", "Regenerative Battery Pack Test System 17040",
     ["High power regenerative battery pack test system up to 300kW, 1000V. More power or channel combinations are available."],
     BP_FEATURES,
     [("Models", specs([
         ("17040 · 60kW", "60kW per channel · 1000V · 150A", "1 channel per unit (parallelable)"),
         ("17040 · 120kW", "60kW per channel · 1000V · 150A", "2 channels per unit"),
         ("17040 · 120kW", "120kW per channel · 1000V · 300A", "1 channel per unit"),
         ("17040 · 250kW", "125kW per channel · 1000V · 300A", "2 channels per unit"),
         ("17040 · 180kW", "180kW per channel · 1000V · 450A", "1 channel per unit"),
         ("17040 · 250kW", "250kW per channel · 1000V · 600A", "1 channel per unit"),
         ("17040 · 300kW", "300kW per channel · 1000V · 750A", "1 channel per unit"),
     ]))])

page(BATTERY, "battery-pack-simulator-17020-17040", "Battery Pack Simulator 17020 / 17040",
     ["Battery pack simulator for testing on-board chargers, DC/DC converters and DC charging stations, using the regenerative 17020 / 17040 test systems with Battery Pack Simulator Soft Panel."],
     None,
     [("Applications", [
         ("1.4kW OBC", "17020 and Battery Pack Simulator Soft Panel"),
         ("3.3 ~ 6.6kW OBC", "17020 and Battery Pack Simulator Soft Panel"),
         ("1.6 ~ 2.5kW D/D Converter", "17020 and Battery Pack Simulator Soft Panel"),
         ("50kW DC Charging station", "17040 and Battery Pack Simulator Soft Panel"),
     ])])

page(BATTERY, "bms-test-system-8710", "BMS Test System 8710 & Battery Cell Simulator 87001",
     ["BMS automatic test systems for E-scooter (32 cells) and EV (96 cells) battery management systems, with the 87001 16CH battery cell simulator."],
     None,
     [("BMS Functions Covered", [
         ("Cell voltage monitor and balance circuit", "87001 and 8710"),
         ("High voltage measurement", "8710"), ("Current measurement", "8710"), ("Temperature measurement", "8710"),
         ("Insulation resistor detection", "8710"), ("CANbus communication (UDS)", "8710"),
         ("AC/DC charger signal", "8710"), ("Starter battery", "8710"), ("HSD / LSD circuit", "8710"),
     ])])

# ---------------------------------------------------------------- Inverter
page(INVERTER, "pv-inverter-pcs-test-solutions", "PV Inverter / PCS Test Solutions",
     ["Complete test solutions for PV inverters and PCS covering stand alone (off grid) and grid connected type testing, built from Chroma's solar array simulators, regenerative grid simulators, AC electronic loads and digital power meters."],
     None,
     [("Solution Components", [
         ("DC input", "Solar Array Simulator 62000H Series · Battery Pack Simulator 17020 / 17040"),
         ("AC output / grid", "Regenerative Grid Simulator 61800 Series · AC Electronic Load 63800 Series"),
         ("Measurement", "Digital Power Meter 66200 Series"),
         ("Automatic test systems", "PV Inverter ATS 8000 · Micro Inverter ATS 8000"),
     ])])

# ---------------------------------------------------------------- EV
page(EV, "ev-test-solutions", "Electric Vehicle Test Solutions",
     ["Automatic test systems and software platform for electric vehicle components, from battery cells to EVSE, all driven by the PowerPro III software platform."],
     ["PowerPro III software platform: test program editing, running GO/NOGO, statistic report"],
     [("EV Test Systems", [
         ("Battery cell", "Battery Cell Charge & Discharge Test System · Regenerative Battery Pack Test Systems"),
         ("Battery module / pack", "BMS PCBA ATS · Battery Pack ATS · Battery Module Maintenance ATS"),
         ("Vehicle control", "HCU (VMS/VCU) ATS"),
         ("Charging", "EV AC/DC Charging Compatibility ATS · Wireless Charger ATS · EVSE ATS · OBC & DC-DC Converter ATS"),
         ("Safety", "Electrical Safety Test System"),
     ])])

page(POWER, "automatic-test-systems", "Automatic Test Systems",
     ["Chroma automatic test systems (ATS) for power supplies, LED drivers, inverters, passive components and medical electrical safety."],
     None,
     [("ATS Models", [
         ("8000", "SMPS ATS · PV Inverter ATS · DC-DC Converter ATS · Adapter/Charger · Battery Charger · Switching Mode Rectifier · EV power electronics"),
         ("8010", "PC Power Supply ATS · Switching Power Supply (multi-output) · DC Power"),
         ("8020", "Adapter / Charger ATS · Switching Power Supply (multi-output) · Battery Charger"),
         ("8200", "Switching Power Supply (multi-output) · Adapter · LED Power Driver"),
         ("8491", "LED Driver ATS · LED Power Driver"),
         ("11300", "Bias Current Test System · Inductor (saturation current test)"),
         ("1810", "Magnetic Component Test System · Inductor (AC+DC, temperature-rising test)"),
         ("1820", "Capacitor Test System · Capacitor (AC+DC, load life test)"),
         ("1911", "High Capacitance Electrolytic Capacitor ATS"),
         ("8800", "Component ATS · Passive component"),
         ("8801", "Electrical Double Layer Capacitor ATS · EDLC (capacitance, DCIR, ESR test)"),
         ("8802", "EDLC LC Monitoring System · EDLC (leakage current test)"),
         ("8910", "Medical Electrical Safety ATS · Medical equipment (safety test)"),
     ]),
      ("Software Functions (8000 Series Platform)", [
          ("Open system architecture", "8000 and 8491"), ("Optional instrument extendible", "8000 and 8491"),
          ("User permission setting", "All models"), ("Network management", "8000, 8010, 8020, 8491"),
          ("Shop floor control software", "All models"), ("Test report editing / printing", "All models"),
          ("Test program editing / saving", "All models"), ("GO/NO GO test", "All models"),
          ("Statistical analysis control", "All models"),
          ("Test item editing, debug run, on-line control, report wizard", "8000 and 8491"),
      ])])

# ---------------------------------------------------------------- Electrical safety, LCR, insulation (PDF pages 9-10)
page(
    POWER, "multi-channel-hipot-tester-19020", "Multi-Channel Hipot Tester 19020 Series",
    ["Multi-channel hipot tester for AC / DC withstand voltage and insulation resistance tests, available with 10 or 4 channels."],
    None,
    [("Specifications", [
        ("AC / DC output", "5kVac · 6kVdc"),
        ("Cutoff current", "AC: 10mA · DC: 5mA"),
        ("Flashover detection", "AC: 20mA · DC: 10mA"),
        ("Insulation resistance", "1kV output · range up to 50GΩ"),
        ("Channels", "10 / 4 channels"),
    ])],
)
page(
    POWER, "electrical-safety-analyzer-19032-p", "Electrical Safety Analyzer 19032-P",
    ["Electrical safety analyzer combining hipot, insulation resistance, ground bond and leakage current tests, with a 500VA floating output."],
    None,
    [("Specifications", [
        ("AC / DC output", "5kVac · 6kVdc"),
        ("Cutoff current", "AC: 100mA · DC: 25mA"),
        ("Flashover detection", "AC: 20mA · DC: 10mA"),
        ("Insulation resistance", "1kV output · range up to 50GΩ"),
        ("Ground bond", "Current 40A · range 510mΩ (depends on current output)"),
        ("Leakage current test (option)", "300V / 20A max."),
        ("Others", "500VA floating output"),
    ]), ("Note", [("Leakage current test", "Required by standards for electrical appliances, medical equipment, IT products and video / audio appliances (IEC 60065, 60335, 60601, 60950 etc.).")])],
)
page(
    POWER, "wound-component-est-scanner-19035", "Wound Component EST Scanner 19035",
    ["Wound component electrical safety test scanner with hipot and insulation resistance tests and an 8 port DCR scanner."],
    None,
    [("Specifications", [
        ("AC / DC output", "5kVac · 6kVdc"),
        ("Cutoff current", "AC: 30mA · DC: 10mA"),
        ("Flashover detection", "AC: 15mA · DC: 10mA"),
        ("Insulation resistance", "5kV output · range up to 50GΩ"),
        ("Others", "DCR 8 ports scanner"),
    ])],
)
page(
    POWER, "battery-cell-surge-tester-19311", "Battery Cell Surge Tester 19311 / 19311-10",
    ["Surge (impulse) tester for battery cells, with a 1 port scanner (19311) or a 10 ports scanner (19311-10)."],
    None,
    [("Specifications", [
        ("Impulse / surge test", "6kV"),
        ("19311", "1 port scanner"),
        ("19311-10", "10 ports scanner"),
    ])],
)
page(
    POWER, "partial-discharge-tester-19501-k", "Partial Discharge Tester 19501-K",
    ["Partial discharge tester for detecting insulation defects."],
    None,
    [("Specifications", [
        ("Output", "10kVac"),
        ("Cutoff current", "AC: 300µA"),
        ("Discharge detection", "1pc ~ 2000pc"),
    ])],
)
page(
    POWER, "hipot-analyzer-19056-19057", "Hipot Analyzer 19056 / 19057 Series",
    ["High voltage hipot analyzers: 19056 for AC withstand voltage up to 10kVac, and 19057 / 19057-20 for DC withstand voltage and insulation resistance up to 12kVdc / 20kVdc."],
    None,
    [("Specifications", [
        ("19056", "Output 10kVac · cutoff current AC: 20mA · flashover detection 20mA"),
        ("19057", "Output 12kVdc · cutoff current DC: 10mA · flashover detection 10mA · insulation resistance 5kV output, range up to 50GΩ"),
        ("19057-20", "Output 20kVdc · cutoff current DC: 5mA · flashover detection 10mA · insulation resistance 5kV output, range up to 50GΩ"),
    ])],
)
page(
    POWER, "lcr-meter-11021", "LCR Meter 11021 / 11021-L",
    ["LCR meters for passive component measurement from 0.1mΩ to 100MΩ."],
    None,
    [("Specifications", [
        ("11021", "Frequency 100Hz, 120Hz, 1kHz, 10kHz · impedance 0.1mΩ ~ 100MΩ"),
        ("11021-L", "Frequency 1kHz, 10kHz, 40kHz, 50kHz · impedance 0.1mΩ ~ 100MΩ"),
    ])],
)
page(
    POWER, "lcr-meter-11025", "LCR Meter 11025",
    ["LCR meter with a wide set of test frequencies and DC measurement, covering 0.01mΩ to 100MΩ."],
    None,
    [("Specifications", [
        ("Frequency", "50 / 60 / 100 / 120 / 1k / 10k / 20k / 40k / 50k / 100k Hz / DC"),
        ("Impedance range", "0.01mΩ ~ 100MΩ"),
    ])],
)
page(
    POWER, "auto-transformer-test-system-13350", "Auto Transformer Test System 13350",
    ["Automatic transformer test systems built from an LCR meter and a transformer test scanner."],
    None,
    [("Auto Transformer Test System Selection Guide", [
        ("13350 + A133502", "Frequency 20Hz ~ 200kHz · impedance 0.1mΩ ~ 100MΩ"),
        ("13350-1M + A133502", "Frequency 20Hz ~ 1MHz · impedance 0.1mΩ ~ 100MΩ"),
        ("3250 + A132501", "Frequency 20Hz ~ 200kHz · impedance 0.1mΩ ~ 100MΩ"),
        ("3302 + A132501", "Frequency 20Hz ~ 1MHz · impedance 0.1mΩ ~ 100MΩ"),
    ])],
)
page(
    POWER, "electrolytic-capacitor-testers-11800", "Electrolytic Capacitor Testers 11800 Series",
    ["Ripple current testers and an electrolytic capacitor analyzer, plus programmable HF AC testers."],
    None,
    [("Electrolytic Capacitor Tester Selection Guide", [
        ("11800", "Ripple current tester · 100Hz / 120Hz / 400Hz / 1kHz, 0 ~ 30A, DC bias 0.5V ~ 500V"),
        ("11801", "Ripple current tester · 20k ~ 100kHz, 0 ~ 10A, DC bias 0.5 ~ 500V"),
        ("11810", "Ripple current tester · 20k ~ 1000kHz, 0 ~ 10A, DC bias 0.5 ~ 500V"),
        ("13100", "Electrolytic capacitor analyzer · AC 100Hz / 120Hz / 1kHz / 10kHz / 20kHz / 50kHz / 100kHz, 1V / 0.25V"),
    ]), ("Programmable HF AC Tester Selection Guide", [
        ("11802", "20kHz ~ 200kHz, step 1kHz · 500VA"),
        ("11805", "10kHz ~ 200kHz, step 1kHz · 1kVA"),
        ("11803", "20kHz ~ 1MHz, step 1kHz · 750VA"),
        ("11890", "20kHz ~ 200kHz, step 1kHz · 500VA"),
        ("11891", "20kHz ~ 200kHz, step 1kHz · 500VA"),
    ])],
)
page(
    POWER, "battery-insulation-tester-11210", "Battery Insulation Tester 11210",
    ["Insulation tester for leakage current and insulation resistance, with optional partial discharge and flashover detection."],
    None,
    [("Specifications", [
        ("Primary function", "LC, IR · Partial discharge (option) · Flashover detection (option)"),
        ("Test signal", "1.0 ~ 1000V · CC 0.5 ~ 50mA"),
    ])],
)
page(
    POWER, "capacitor-leakage-current-ir-tester-11200", "Capacitor Leakage Current / IR Tester 11200",
    ["Insulation tester for capacitor leakage current and insulation resistance."],
    None,
    [("Specifications", [
        ("Primary function", "LC, IR"),
        ("Test signal", "1.0 ~ 650V / 800V · CC 0.5 ~ 500mA"),
    ])],
)

PLATFORM = ('Software functions', [('Platform', 'Chroma 8000 series automatic test system software'), ('Test programs', 'Test program editing and saving, GO / NO GO test, statistical analysis control'), ('Reports', 'Test report editing and printing'), ('Factory integration', 'Works with Shop Floor Control software for factory-wide and remote control')])

# ---------------------------------------------------------------- Inverter and EV systems (PDF pages 13-14)
page(
    INVERTER, "pv-inverter-ats-8000", "PV Inverter ATS 8000",
    ["Automatic test system on the Chroma 8000 series platform for PV inverters, used in the grid connected and stand alone (off grid) type tests of the PV Inverter / PCS test solutions."],
    None, [PLATFORM],
)
page(
    INVERTER, "micro-inverter-ats-8000", "Micro Inverter ATS 8000",
    ["Automatic test system on the Chroma 8000 series platform for micro inverters, part of the PV Inverter / PCS test solutions."],
    None, [PLATFORM],
)
page(
    EV, "bms-pcba-ats", "BMS PCBA ATS",
    ["Automatic test system for the printed circuit board assembly of a battery management system (BMS), part of Chroma's electric vehicle test solutions."],
    None, [PLATFORM],
)
page(
    EV, "battery-pack-ats", "Battery Pack ATS",
    ["Automatic test system for battery packs, part of Chroma's electric vehicle test solutions."],
    None, [PLATFORM],
)
page(
    EV, "battery-module-maintenance-ats", "Battery Module Maintenance ATS",
    ["Automatic test system for battery module maintenance, part of Chroma's electric vehicle test solutions."],
    None, [PLATFORM],
)
page(
    EV, "hcu-vms-vcu-ats", "HCU (VMS / VCU) ATS",
    ["Automatic test system for hybrid control units, vehicle management systems (VMS) and vehicle control units (VCU), part of Chroma's electric vehicle test solutions."],
    None, [PLATFORM],
)
page(
    EV, "obc-dc-dc-converter-ats", "OBC & DC-DC Converter ATS",
    ["Automatic test system for on-board chargers (OBC) and DC-DC converters, part of Chroma's electric vehicle test solutions. Battery pack simulators 17020 / 17040 cover 1.4kW and 3.3 ~ 6.6kW OBC and 1.6 ~ 2.5kW DC-DC converter applications."],
    None, [PLATFORM],
)
page(
    EV, "electrical-safety-test-system", "Electrical Safety Test System",
    ["Electrical safety test system for electric vehicle components, part of Chroma's electric vehicle test solutions."],
    None, [PLATFORM],
)
page(
    EV, "ev-ac-dc-charging-compatibility-ats", "EV AC / DC Charging Compatibility ATS",
    ["Automatic test system for the compatibility of AC and DC charging between electric vehicles and chargers, part of Chroma's electric vehicle test solutions."],
    None, [PLATFORM],
)
page(
    EV, "wireless-charger-ats", "Wireless Charger ATS",
    ["Automatic test system for wireless chargers, part of Chroma's electric vehicle test solutions."],
    None, [PLATFORM],
)
page(
    EV, "evse-ats", "EVSE ATS",
    ["Automatic test system for electric vehicle supply equipment (EVSE), part of Chroma's electric vehicle test solutions."],
    None, [PLATFORM],
)

# ---------------------------------------------------------------- Audit additions (PDF pages 3, 11, 15)
page(
    POWER, "led-load-simulator-63110a", "LED Load Simulator 63110A / 63113A / 63115A",
    ["Unique LED mode of the 6310A series electronic loads, for LED power driver tests. It simulates different numbers of LEDs."],
    ["LED mode for LED power driver tests", "Simulates different numbers of LEDs"],
    [("Specifications", [
        ("63110A", "500V / 2A / 100W x 2CH"),
        ("63113A", "300V / 20A / 300W · rise & fall time 25µs"),
        ("63115A", "600V / 20A / 300W · rise & fall time 25µs"),
    ])],
)


def ats(slug, title, model_note, uut, extra=()):
    page(
        POWER, slug, title,
        [f"Chroma automatic test system ({model_note}) for {uut[0].lower() if len(uut) == 1 else 'power electronics and components'}."],
        None,
        [("Unit under test", [("UUT type", " · ".join(uut))] + list(extra))],
    )


COMMON_8010_8020 = [
    ("Functions", "User permission setting · system administrator access log · network management · "
                  "Shop Floor Control software · test report editing and printing · test program editing and saving · "
                  "GO / NO GO test · statistical analysis control"),
]
ats("adapter-charger-ats-8020", "Adapter / Charger ATS 8020", "8020", ["Battery charger", "Switching power supply (multi-output)", "Adapter"], COMMON_8010_8020)
ats("pc-power-supply-ats-8010", "PC Power Supply ATS 8010", "8010", ["Switching power supply (multi-output)", "DC power"], COMMON_8010_8020)
ats("dc-dc-converter-ats-8000", "DC-DC Converter ATS 8000", "8000", ["DC to DC converter"])
ats("smps-ats-8000", "SMPS ATS 8000", "8000", ["Switching power supply (multi-output)"])
ats("led-driver-ats-8491", "LED Driver ATS 8491", "8491", ["LED power driver"],
    [("Functions", "Open system architecture · optional instrument extendible · test item editing · debug run · on-line control · report wizard · "
                   "user permission setting · network management · Shop Floor Control software · statistical analysis control")])
ats("high-capacitance-electrolytic-capacitor-ats-1911", "High Capacitance Electrolytic Capacitor ATS 1911", "1911", ["High capacitance electrolytic capacitor"])
ats("medical-electrical-safety-ats-8910", "Medical Electrical Safety ATS 8910", "8910", ["Medical equipment (safety test)"])
ats("magnetic-component-test-system-1810", "Magnetic Component Test System 1810", "1810", ["Inductor (AC+DC, temperature-rising test)"])
ats("capacitor-test-system-1820", "Capacitor Test System 1820", "1820", ["Capacitor (AC+DC, load life test)"])
ats("bias-current-test-system-11300", "Bias Current Test System 11300", "11300", ["Inductor (saturation current test)"])
ats("component-ats-8800", "Component ATS 8800", "8800", ["Passive component"])
ats("edlc-ats-8801", "Electrical Double Layer Capacitor ATS 8801", "8801", ["EDLC (capacitance, DCIR, ESR test)"])
ats("edlc-lc-monitoring-system-8802", "EDLC LC Monitoring System 8802", "8802", ["EDLC (leakage current test)"])


def line(slug, title, text):
    page(BATTERY, slug, title, [text], None, ())


LINE_NOTE = "Part of Chroma's battery cell test line, shown in the Battery Cell & Battery Pack Test Solutions overview."
line("barcode-binding-equipment", "Barcode Binding Equipment", "Barcode binding equipment for battery cells. " + LINE_NOTE)
line("formation-system", "Formation System", "Formation system for battery cells, working with the regenerative battery cell charge & discharge test systems. " + LINE_NOTE)
line("ocv-acr-test-equipment", "OCV & ACR Test Equipment", "Open circuit voltage (OCV) and AC resistance (ACR) test equipment for battery cells. " + LINE_NOTE)
line("battery-cell-grouping-equipment", "Battery Cell Grouping Equipment", "Grouping equipment for battery cells, used after the OCV & ACR test. " + LINE_NOTE)
line("functional-ats", "Functional ATS", "Functional automatic test system for battery modules and packs, part of the regenerative battery module / pack test systems.")
line("thermal-data-logger", "Thermal Data Logger", "Thermal data logger, listed with the battery cell, module and pack test instruments.")

# ---------------------------------------------------------------- Landing pages
# The three menu pages under Chroma that only list their children, as linked product cards.
# (Power Electronic Test and Equipment is hand-built in the admin and is deliberately not touched.)
GROUPS = {}  # child slug -> product group (tab) on its parent page


def landing(slug, title, intro, seo, tabs):
    """tabs: {tab name: [child slugs]}. A landing page has only the tab names: its cards are the
    published child pages, listed automatically under the group set on each child
    (see mergeChildProducts in apps/api)."""
    for name, slugs in tabs.items():
        for s_ in slugs:
            GROUPS[s_] = name
    intro_props = {"tagline": "Chroma", "title": title, "paragraphs": intro, "imageSide": "right"}
    if image_for(slug, title):
        intro_props["image"] = image_for(slug, title)
    pages.append(
        {
            "section": "products",
            "slug": slug,
            "title": title,
            "seoDescription": seo,
            "landing": True,
            "data": {
                "root": {"props": {}},
                "content": [
                    {"type": "ProductIntro", "props": intro_props},
                    {"type": "CategorizedProducts",
                     "props": {"tagline": "Chroma", "title": title, "intro": "",
                               "categories": [{"name": n, "products": []} for n in tabs]}},
                    {"type": "ContactCta", "props": {}},
                ],
            },
        }
    )


landing(
    INVERTER, "Inverter Test and Equipment",
    ["Chroma provides complete test solutions for PV inverters and PCS (power conversion systems), covering both stand alone (off grid) and grid connected type testing.",
     "The solutions combine Chroma's solar array simulators, regenerative grid simulators, AC electronic loads, battery pack simulators and digital power meters, with automatic test systems for PV inverters and micro inverters."],
    "Complete test solutions for PV inverters and PCS from Chroma: solar array simulators, regenerative grid simulators, AC electronic loads and automatic test systems.",
    {"PV Inverter / PCS Test": ["pv-inverter-pcs-test-solutions", "pv-inverter-ats-8000", "micro-inverter-ats-8000"]},
)
landing(
    BATTERY, "Battery Test and Equipment",
    ["Chroma's battery test portfolio covers the full path from cell to pack: regenerative charge and discharge systems for cells, modules and packs, battery pack simulators, and BMS test systems.",
     "Regenerative designs return discharge energy to the grid, with driving profile simulation and hardware / software integration that can be customised to the test setup."],
    "Battery cell, module and pack test solutions from Chroma: regenerative charge and discharge systems, battery pack simulators and BMS test systems.",
    {
        "Battery Cell Test": ["regenerative-battery-cell-test-system-17011"],
        "Battery Pack Test": ["regenerative-battery-pack-test-system-17020", "regenerative-battery-pack-test-system-17020e", "regenerative-battery-pack-test-system-17040"],
        "Battery Pack Simulator": ["battery-pack-simulator-17020-17040"],
        "BMS Test": ["bms-test-system-8710"],
        "Battery Cell Line Equipment": ["barcode-binding-equipment", "formation-system", "ocv-acr-test-equipment", "battery-cell-grouping-equipment", "functional-ats", "thermal-data-logger"],
    },
)
landing(
    EV, "EV and EVSE Test and Equipment",
    ["Chroma's electric vehicle test solutions span the vehicle's power electronics and its charging infrastructure: battery cell and pack test, BMS and HCU ATS, OBC and DC-DC converter ATS, wireless charger and EVSE ATS, and electrical safety test.",
     "All systems run on the PowerPro III software platform for test program editing, GO/NOGO runs and statistical reports."],
    "Electric vehicle and EVSE test solutions from Chroma: battery, BMS, OBC and DC-DC converter, wireless charger and EVSE automatic test systems.",
    {
        "EV Test Solutions": ["ev-test-solutions"],
        "Battery and BMS ATS": ["bms-pcba-ats", "battery-pack-ats", "battery-module-maintenance-ats"],
        "Vehicle Electronics Test": ["hcu-vms-vcu-ats", "obc-dc-dc-converter-ats", "electrical-safety-test-system"],
        "Charging Test": ["ev-ac-dc-charging-compatibility-ats", "wireless-charger-ats", "evse-ats"],
    },
)

POWER_TABS = {
    "AC Power Source": ["ac-power-source-61500", "ac-power-source-61600", "ac-power-source-61700", "ac-power-source-61800"],
    "DC Power Supply": ["dc-power-supply-62000b", "dc-power-supply-62000h", "dc-power-supply-62000l", "dc-power-supply-62000p", "solar-array-simulator-62000h-s"],
    "DC Electronic Load": ["dc-electronic-load-63000", "dc-electronic-load-6310a", "led-load-simulator-63110a", "dc-electronic-load-63200", "dc-electronic-load-63600"],
    "AC Electronic Load": ["ac-electronic-load-63800"],
    "Digital Power Meter": ["digital-power-meter-66200"],
    "Automatic Test System (ATS)": [
        "automatic-test-systems", "adapter-charger-ats-8020", "pc-power-supply-ats-8010", "dc-dc-converter-ats-8000",
        "smps-ats-8000", "led-driver-ats-8491", "high-capacitance-electrolytic-capacitor-ats-1911",
        "medical-electrical-safety-ats-8910", "magnetic-component-test-system-1810", "capacitor-test-system-1820",
        "bias-current-test-system-11300", "component-ats-8800", "edlc-ats-8801", "edlc-lc-monitoring-system-8802",
    ],
    "Electrical Safety Test": [
        "electrical-safety-analyzers", "multi-channel-hipot-tester-19020", "electrical-safety-analyzer-19032-p",
        "corona-hipot-tester-19055-c", "hipot-analyzer-19056-19057", "battery-cell-surge-tester-19311",
        "partial-discharge-tester-19501-k", "impulse-winding-tester-19301a", "wound-component-est-scanner-19035",
        "wound-component-est-analyzer-19036",
    ],
    "LCR Meter and Component Test": [
        "lcr-meters-and-passive-component-testers", "lcr-meter-11021", "lcr-meter-11025", "hf-lcr-meter-11050",
        "milliohm-meter-16502", "auto-transformer-test-system-13350", "electrolytic-capacitor-testers-11800",
    ],
    "Insulation Tester": ["battery-insulation-tester-11210", "capacitor-leakage-current-ir-tester-11200"],
    "Inductor Test Machine": ["inductor-test-and-packing-machine-1870d", "inductor-layer-short-test-machine-1871"],
}
for _name, _slugs in POWER_TABS.items():
    for _s in _slugs:
        GROUPS[_s] = _name
for _p in pages:
    if _p.get("parent") and _p["slug"] in GROUPS:
        _p["productGroup"] = GROUPS[_p["slug"]]

os.makedirs(OUT, exist_ok=True)
for f in os.listdir(OUT):
    if f.endswith(".json"):
        os.remove(os.path.join(OUT, f))
for p in pages:
    with open(os.path.join(OUT, p["slug"] + ".json"), "w", encoding="utf-8") as fh:
        json.dump(p, fh, ensure_ascii=False, indent=2)
print(len(pages), "pages")
