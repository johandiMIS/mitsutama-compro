"""Builds the page-import JSON for the IMC, GRAS and Audio Precision (automotive) product menus into docs/content/product/imc-gras/pages/.

Source: the vendor pages linked in "Konten Website PRODUCT.docx" (summarised, not copied) and the
GRAS product lists. Run:  python -I docs/content/product/imc-gras/build_pages.py
Then: node docs/content/product/imc-gras/apply_pages.mjs

Each file is one POST /admin/pages/import envelope (draft only) plus two build-only keys that
apply_pages.mjs strips: "_oldSlug" (the placeholder page to rename first) and "_order" (menu position).
Images come from media-urls.json (written by upload_media.mjs); a page without one has no image.
"""
import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "pages")
with open(os.path.join(HERE, "media-urls.json"), encoding="utf-8") as fh:
    MEDIA = json.load(fh)
# The APx analyzer photos are shared with the other Audio Precision pages (uploaded by ../ap-lisun).
with open(os.path.join(HERE, "..", "ap-lisun", "media-urls.json"), encoding="utf-8") as fh:
    MEDIA.update({k: v for k, v in json.load(fh).items() if k.startswith("ap-apx")})

pages = []


def img(name, alt):
    return {"url": MEDIA[name], "alt": alt} if name in MEDIA else None


def feature_grid(items):
    return {"type": "FeatureGrid", "props": {"items": [{"title": t, "text": x} for t, x in items]}}


def heading(title, intro=""):
    return {"type": "SectionHeading", "props": {"tagline": "", "title": title, "intro": intro}}


def bullets(items):
    return {"type": "RichText", "props": {"body": "\n".join(f"- {i}" for i in items)}}


def spec_table(title, rows):
    return {"type": "SpecTable", "props": {"title": title, "rows": [{"label": a, "value": b} for a, b in rows]}}


def text_image(title, body, image_name, alt):
    return {"type": "TextImage", "props": {"title": title, "body": body, "image": img(image_name, alt), "imageSide": "left"}}


def cards(title, intro, *categories):
    """A "Categorised products" block. categories: (name, [(name, model, [bullets], image_name or None)])"""
    cats = []
    for name, items in categories:
        out = []
        for pname, model, bl, image in items:
            card = {"name": pname, "badges": [], "bullets": bl}
            if model:
                card["model"] = model
            if image and img(image, pname):
                card["image"] = img(image, pname)
            out.append(card)
        cats.append({"name": name, "products": out})
    return {"type": "CategorizedProducts", "props": {"tagline": "", "title": title, "intro": intro, "categories": cats}}


def products(*categories):
    return cards("Recommended products", "", *categories)


def page(group, order, slug, title, brand, intro, blocks, seo, old_slug=None):
    props = {"tagline": brand, "title": title, "paragraphs": intro, "imageSide": "right"}
    if img(slug, title):
        props["image"] = img(slug, title)
    pages.append({
        "section": "products", "slug": slug, "title": title, "group": group,
        "seoDescription": seo[:400],
        "data": {"root": {"props": {}}, "content": [{"type": "ProductIntro", "props": props}, *blocks]},
        "_oldSlug": old_slug, "_order": order,
    })


# ================================================================== IMC
IMC = "IMC"
page(IMC, 0, "vehicle-dynamic-test-and-equipment", "Vehicle Dynamic Test and Equipment", "imc",
     ["Handling, ride comfort, braking and stability decide how a vehicle performs and how a brand is judged. As vehicles become more electrified, software-driven and automated, judging their dynamic behaviour takes accurate, synchronised, highly sampled measurement data, for example for safety tests such as the elk test and for the fast control loops of driver assistance and automated driving systems.",
      "imc offers measurement and evaluation solutions for every vehicle component, from prototype testing to quality assurance, and for complete vehicles on the road and on the test bench."],
     [cards("Applications and products", "",
            ("Test applications", [
                ("Component Testing", None, ["Measurement and evaluation for every vehicle component, in prototype testing, quality assurance and cost reduction"], "imc-vd-component-testing"),
                ("Test Rigs", None, ["Turnkey test stands for R&D and production, with traceable calibration and compliance with standards"], "imc-vd-test-rigs"),
                ("RLDA (Road Load Data Acquisition)", None, ["Data from real-life test drives, the starting point for durability testing on the test bench"], "imc-vd-rlda"),
                ("NVH", None, ["Measurement of vibration, sound pressure and sound power, with structural and order analysis"], "imc-vd-nvh"),
                ("Misuse Testing", None, ["Data acquisition while components, ECUs and the whole vehicle are validated under extreme conditions, for passive safety"], "imc-vd-misuse"),
                ("Complete Car Testing", None, ["Testing the integration, efficiency, safety and environmental compatibility of interconnected vehicle systems"], "imc-vd-complete-car"),
                ("Buzz, Squeak and Rattle Noise Testing", None, ["Finding intermittent, low-level noises, with GRAS measurement microphones"], "imc-vd-bsr"),
                ("Steering System", None, ["Reliable, precise and reproducible measurement of steering behaviour"], "imc-vd-steering"),
            ]),
            ("Products", [
                ("imc CRONOSflex", None, ["Universal data acquisition system used for vehicle tests"], "imc-cronosflex"),
                ("imc STUDIO", None, ["Measurement and analysis software"], "imc-studio"),
                ("WFT-Cx Wheel Force Transducer", "WFT-Cx", ["For wheel sizes from 13 inch", "Robust, waterproof and temperature compensated by thermosensors in the wheel", "Works as part of the imc CRONOSflex data acquisition system"], "imc-wft-cx"),
            ]))],
     "imc measurement systems for vehicle dynamics: wheel force transducers, component test stands, road load data acquisition, NVH, misuse and complete car testing.")

page(IMC, 1, "ev-power-analyzer", "EV Power Analyzer", "imc",
     ["Optimising the electric drive train and the battery calls for measurement technology that works in high-voltage environments. imc offers measurement modules with isolation in the kV range, current measurement, test stands, mobile data acquisition systems and analysis software for e-mobility.",
      "The modules cover battery cells and HV batteries, the power bus and DC link, the inverter and the electric motor, with online power calculation for efficiency analysis."],
     [cards("Measurement modules and solutions", "",
            ("Temperature in HV environments", [
                ("imc CANSASflex-HISO-T-8-2L", "CANSASflex-HISO-T-8-2L", ["Thermocouples at 1400 V potential", "2 x LEMO.2P sockets, 4 channels each", "Per-channel isolated inputs, filtering and ADCs"], "imc-cansasflex-hiso-t-8-2l"),
                ("imc CANSASfit-HISO-T-8-2L", "CANSASfit-HISO-T-8-2L", ["Thermocouples at 1000 V potential", "8 thermocouples (type K)", "Multi-channel plugs"], "imc-cansasfit-hiso-t-8-2l"),
                ("imc CANSASfit-HISO-UT-6-3L", "CANSASfit-HISO-UT-6-3L", ["PT100 / PT1000 sensors and voltages at 1000 V potential", "6 channels: voltage, PT100 / PT1000, resistance, acceleration", "1 kHz sampling rate"], "imc-cansasfit-hiso-ut-6-3l"),
            ]),
            ("Voltage in HV environments", [
                ("imc CANSASflex-HISO8-L", "CANSASflex-HISO8-L", ["Voltages up to 100 V at 800 V potential", "8 channels: voltage, PT100 / PT1000, resistance, 20 mA", "1 kHz sampling rate"], "imc-cansasflex-hiso8-l"),
                ("imc CRONOSflex-HISO-8", "CRONOSflex-HISO-8", ["Voltages up to 100 V at 800 V potential", "8 channels: voltage, PT100 / PT1000, resistance, 20 mA", "100 kHz sampling rate"], "imc-cronosflex-hiso-8"),
                ("imc CANSASflex-HV4", "CANSASflex-HV4", ["4 voltages up to 800 V", "Measurement category 300 V CAT II", "1 kHz sampling rate"], "imc-cansasflex-hv4"),
                ("imc CANSASfit HISO-HV-4", "CANSASfit HISO-HV-4", ["4 voltages up to 1500 V", "Measurement category 1000 V CAT II", "1 kHz sampling rate"], "imc-cansasfit-hiso-hv-4"),
                ("imc CRONOSflex-HV2-4U", "CRONOSflex-HV2-4U", ["4 voltages up to 1000 Vrms", "Measurement category 300 V CAT II", "100 kHz sampling rate"], "imc-cronosflex-hv2-4u"),
            ]),
            ("Current, power and efficiency", [
                ("imc CANSAS-IHR", "CANSAS-IHR", ["CAN-based wide-range current sensor", "Uninterrupted measurement from 50 nA to 50 A"], "imc-cansas-ihr"),
                ("Power and efficiency measurement", None, ["HV modules measure up to 1000 V directly", "Inputs for current probes, Rogowski coils and shunts", "Online 1-, 2- or 3-phase power calculation"], "imc-ev-power"),
                ("Telemetric mechanical power measurement", None, ["Drive power from shaft torque and speed, measured wirelessly in real driving conditions"], "imc-ev-telemetric-power"),
                ("Wide range current measurement", None, ["Recording current sequences of ECUs and components across idle and active states, with the imc CANSAS-IHR"], "imc-ev-current"),
            ]),
            ("Motor and vehicle tests", [
                ("Testing electric motors", None, ["Test stands for the whole electromotive drive train (motor, inverter and battery), including climatic conditions and drive power up to 100 kW"], "imc-ev-motor-test"),
                ("LV test system", None, ["Certification measurement for vehicle electrical systems to LV 124, LV 148 (12 V and 48 V) and LV 123 (high voltage)"], "imc-ev-lv124"),
                ("NVH of electric vehicles", None, ["Body, chassis and powertrain NVH measurement for the sound of electric vehicles"], "imc-ev-nvh"),
                ("Wheel brake development", None, ["Measurement system for developing wheel brakes in electric vehicles"], "imc-ev-brake"),
            ]),
            ("Measurement wheels", [
                ("6-component Wheel Force Transducer WFT-Cx", "WFT-Cx", ["Weatherproof measurement wheel for test drives"], "imc-wft-cx-wheel"),
                ("Torque measurement wheel WTT-Dx", "WTT-Dx", ["Records drive and brake torque"], "imc-wtt-dx"),
                ("Brake temperature Dx-BrakeTemp", "Dx-BrakeTemp", ["Detects the brake temperature"], "imc-dx-braketemp"),
                ("Rotation rate measurement Dx-Speed", "Dx-Speed", ["Measures the wheel rotation rate"], "imc-dx-speed"),
            ]),
            ("In practice", [
                ("Electric drive train", None, ["Electric drive train test stand"], "imc-ev-drive-train"),
                ("Testing e-vehicle fleets", None, ["Analysing and assessing the efficiency of electric vehicle fleets"], "imc-ev-fleets"),
                ("Battery test stand", None, ["Battery test stand built with imc solutions"], "imc-ev-battery-stand"),
                ("Testing on solar-powered vehicles", None, ["Measurement on a solar racing vehicle at the World Solar Challenge"], "imc-ev-solar"),
            ]))],
     "imc e-mobility measurement: high-voltage modules, current measurement, efficiency and power analysis and test stands for batteries, inverters and electric motors.")

page(IMC, 2, "train-nvh-monitoring-and-analysis", "Train NVH Monitoring and Analysis", "imc",
     ["Since 1996 imc has developed measurement technology for the rail sector, from high-speed trains to streetcars. Rugged, distributed systems record thousands of channels under splash water, stone chipping, heat, cold and electromagnetic interference.",
      "The systems read rail vehicle bus systems directly, calculate in real time and can be networked and synchronised, all configured from one software, imc STUDIO."],
     [heading("Why imc for rail"),
      feature_grid([
          ("Direct reading of vehicle buses", "Rail vehicle bus systems are read directly into the measurement system."),
          ("Rugged for railway loads", "Hardware built for the shocks, temperatures and electromagnetic voltages of rail vehicles and infrastructure."),
          ("Distributed measurement", "Signals are captured at the source, close to sensors installed at many points along the vehicle, and evaluated synchronously."),
          ("Real-time calculation", "Results are calculated during the run, which saves evaluation time."),
          ("TEDS capable", "Calibration values are read automatically from the sensors."),
          ("Networked and synchronised", "Several systems can be combined and run in sync, with application-specific extensions."),
      ]),
      cards("Rail applications", "",
            ("Vehicle and wheelset tests", [
                ("Increase locomotive safety", None, ["Torsional vibration of wheelsets (rolling), which reduces traction and increases wear"], "imc-rail-locomotive"),
                ("Load test on streetcar wheels", None, ["Dynamic loads on a rail vehicle wheel under real driving conditions"], "imc-rail-streetcar-wheels"),
                ("Commissioning measurements", None, ["Commissioning measurements on the Wuppertal suspension railway"], "imc-rail-commissioning"),
                ("Monitoring wheel-load checkpoints", None, ["Stationary checkpoints that record the key figures of a passing train in real time"], "imc-rail-wheel-load-checkpoints"),
                ("Distributed measurement for rail vehicles", None, ["Signals captured at the source along the whole vehicle and evaluated synchronously"], "imc-rail-distributed"),
                ("Wheel-rail force measurement", None, ["Measurement on instrumented wheelsets with the imc MTP-NT-XS telemetry system, used by TÜV SÜD Rail"], "imc-rail-wheel-rail-forces"),
                ("Measuring wheel loads on subways and trams", None, ["Wheelsets in urban rail service under extreme dynamic forces"], "imc-rail-subway-wheels"),
                ("Telemetry for wheelsets", None, ["Wheelset testing for the safety and reliability of rail vehicles"], "imc-rail-wheelset-telemetry"),
            ]),
            ("Brakes, pantographs and structure", [
                ("Train brake tests", None, ["Checks that braking systems work reliably under all operating conditions"], "imc-rail-brake-tests"),
                ("Pantograph tests", None, ["Measuring pantographs, which take the current from overhead lines on electric trains"], "imc-rail-pantograph"),
                ("Maintenance of bogies with electric drive", None, ["Measurement for servicing bogies with traction drive"], "imc-rail-bogies"),
                ("Structural analysis of wagon bodies and derailment test", None, ["Torsion test rig for the structural integrity and rigidity of vehicle components"], "imc-rail-wagon-bodies"),
            ]),
            ("Noise and comfort", [
                ("Sound emission of rail vehicles to ISO 3095", None, ["Noise emitted by track-bound vehicles"], "imc-rail-iso3095"),
                ("Noise inside rail vehicles to ISO 3381", None, ["Measurement and evaluation of noise inside rail vehicles"], "imc-rail-iso3381"),
                ("NVH tracking for passenger comfort", None, ["Structural integrity and passenger comfort under real operating conditions"], "imc-rail-nvh-tracking"),
            ]))],
     "imc measurement and data acquisition systems for rail vehicles and rail infrastructure: wheel-rail forces, wheelset vibration, brake and pantograph tests.")

page(IMC, 3, "aeroplanes-nvh-and-analysis", "Aeroplanes NVH and Analysis", "imc",
     ["Avionics testing ensures passenger safety, and modern avionics rely on precise measurement data. imc data acquisition delivers accurate, reliable and synchronised measurements for flight test, structural test beds and ground equipment, built around the IRIG 106 standards.",
      "The systems support virtually all sensors and interfaces, provide real-time analysis, monitoring and data reduction, and handle high-speed rotating components and harsh environments."],
     [cards("Aerospace applications", "",
            ("Applications", [
                ("eVTOL testing", None, ["Structural, powertrain, electrical and acoustic testing of eVTOL aircraft, together with GRAS acoustic sensors"], "imc-aero-evtol"),
                ("Flight test instrumentation", None, ["Several hundred to a thousand analogue channels plus ARINC 429, ARINC 664 and MIL-STD-1553B bus data", "Data stored on board or sent to a ground station over IRIG 106 telemetry"], "imc-aero-fti"),
                ("Structural analysis of components", None, ["Strain and stress measurement on airframes, wings, rotor blades, landing gear, actuators and motors", "For calibration, static, fatigue and endurance test beds"], "imc-aero-structural"),
                ("Test rigs and hardware-in-the-loop", None, ["HiL for nose-wheel steering, iron bird and ISTR rigs, cargo loading systems and ATP test stands"], "imc-aero-winglets"),
            ]),
            ("In practice", [
                ("Aircraft certification testing", None, ["Evektor chooses imc measurement systems"], "imc-aero-certification"),
                ("Aircraft recertification testing", None, ["Recertification tests at LET Aircraft Industries"], "imc-aero-recertification"),
                ("Ultra-light helicopter flight tests", None, ["Data acquisition and analysis applied by CURTI"], "imc-aero-helicopter"),
                ("Winglets: testing wing-end components", None, ["FACC tests winglets for the A350 XWB with imc measurement solutions"], "imc-aero-winglets"),
            ]))],
     "imc aerospace test equipment: flight test instrumentation, structural test beds, eVTOL testing, HiL rigs and ground equipment built around IRIG 106.")

page(IMC, 4, "defense", "Defense", "imc",
     ["Performance, reliability and safety in defense start with precise measurement. The Axiometrix Solutions brands Audio Precision, GRAS Acoustics and imc Test & Measurement bring three decades of experience delivering test and measurement solutions to the defense industry.",
      "Solutions range from complete systems for test labs and integrators to tailored sensing and turnkey systems for specialised missions."],
     [cards("Defense solutions", "",
            ("Defense segments", [
                ("Air Force", None, ["Aircraft, helicopters, UAVs, missiles and space", "Survivability, durability and acoustic performance under extreme conditions"], "def-air-force"),
                ("Ground Platforms", None, ["Armored vehicles, tactical systems, artillery and weapons testing", "Performance, reliability and crew safety in harsh environments"], "def-ground"),
                ("Naval Platforms", None, ["Naval vessels, subsystems and maritime installations", "Measuring and controlling noise and vibration"], "def-naval"),
                ("Custom and OEM Defense Solutions", None, ["Tailored sensing and turnkey systems designed around the customer's requirements"], "def-custom-oem"),
                ("Soldier and Communication Systems", None, ["Headsets, radios, hearing protection and tactical audio"], "def-soldier-comms"),
                ("Test Labs and Qualification Facilities", None, ["Scalable measurement systems for R&D, qualification, production and field deployment"], "def-test-labs"),
            ]),
            ("Applications", [
                ("Acoustic Source Localization and Identification", None, ["High-performance GRAS acoustic sensors for source localization and identification systems"], "def-source-localization"),
                ("Aircrew Hearing and Performance", None, ["Protecting aircrew from noise exposure, ensuring effective communication and reducing noise-induced fatigue"], "def-aircrew-hearing"),
                ("Aviation and Tactical Communications", None, ["Reliable communication and hearing protection in high-stakes environments"], "def-aviation-comms"),
                ("Blast and Ordnance Characterization", None, ["Acoustic and pressure effects of explosions, for safety, design and impact assessment"], "def-blast"),
                ("Hearing Aid and Implant Development", None, ["Acoustic measurement equipment for developing and testing hearing aids and implants"], "def-hearing-aid"),
                ("Military Communication Systems", None, ["Clear, reliable communication for mission-critical environments, with GRAS and Audio Precision"], "def-military-comms"),
            ]))],
     "Defense test and measurement from imc, GRAS and Audio Precision (Axiometrix Solutions): air force, ground and naval platforms, custom systems and test labs.",
     old_slug="structure-analyzer")

page(IMC, 5, "structure-and-bridge-monitoring-and-analysis", "Structure & Bridge Monitoring and Analysis", "imc",
     ["Measurement systems keep bridges and other structures safe through inspection and monitoring over long periods. Vibration and oscillation caused by environmental influences and traffic reveal how a structure behaves.",
      "imc measurement technology covers short-term and long-term measurements, with remote monitoring and automatic data transfer."],
     [heading("Capabilities"),
      feature_grid([
          ("Oscillation measurement", "Immediate and long-term measurement of oscillations and vibrations."),
          ("Close to the sensor", "Decentralised modular technology measures near the sensor for higher signal quality."),
          ("Remote monitoring", "Automatic data transfer and remote monitoring with imc LINK."),
          ("Analysis and visualisation", "Comprehensive analysis and visualisation of the captured data with imc FAMOS."),
          ("Building physics", "Thermal measurement of room climate, sound and noise measurement, and measurement of energy use in buildings."),
      ])],
     "imc measurement technology for civil engineering: long-term monitoring of bridges and structures, oscillation measurement, remote monitoring with imc LINK.",
     old_slug="bridge-monitoring-and-analysis")

page(IMC, 6, "energy-and-power-grid", "Energy and Power Grid", "imc",
     ["imc works with leading energy companies on turnkey measurement and monitoring solutions for wind turbines, power plants and energy networks. The robust systems work independently of a PC, with signal conditioning, AD conversion, real-time computation and data storage integrated.",
      "They are modular and decentralised, can be synchronised over a network, by GPS or by direct cable, and are operated with imc STUDIO and imc WAVE."],
     [heading("Applications"),
      feature_grid([
          ("Prototype and component tests", "Measurements on prototypes and components, including development and certification of wind turbines."),
          ("Power curve measurement", "Power curve measurements to optimise efficiency."),
          ("Load measurement", "Load measurements that verify safety, stability and durability, plus load and electromechanical efficiency measurements."),
          ("Grid and supply quality", "Power monitoring and quality analysis to EN 50160 and IEC 61400-7, -15, -21 and -30: frequency, voltage spikes, fluctuations, harmonics, flicker and signal frequencies."),
          ("Grid integration", "Measurement of electrical quantities such as voltage, current and power, and of all output power and performance parameters."),
          ("Condition monitoring", "Automatic condition monitoring, sound and noise measurement and measurement data transfer with imc LINK."),
          ("Smart-grid simulation", "Platform for smart-grid simulation."),
      ])],
     "imc measurement and monitoring for wind turbines, power plants and energy networks: power quality to EN 50160 and IEC 61400, load and grid integration measurements.",
     old_slug="fuel-cell-monitoring-and-analysis")

# ================================================================== GRAS
GRAS = "GRAS"
KEMAR_ROWS = [
    ("45BB", "Non-configured KEMAR head and torso. 2 channels, 0 V/CCP or 200 V/LEMO"),
    ("45BC", "Non-configured KEMAR with built-in mouth simulator and power amplifier. 2 channels"),
    ("45BD", "Automotive head and torso simulator with a seat-mount system compatible with ISOFIX"),
    ("45BB-1", "Hearing aid test. 1 channel, LEMO"),
    ("45BB-2", "Hearing aid test. 1 channel, CCP"),
    ("45BB-7", "Binaural hearing aid test. 2 channels, LEMO"),
    ("45BB-8", "Binaural hearing aid test. 2 channels, CCP"),
    ("45BB-3", "Sound quality recording. 2 channels, LEMO"),
    ("45BB-4", "Sound quality recording. 2 channels, CCP"),
    ("45BB-5", "Ear and headphone test. 2 channels, LEMO"),
    ("45BB-6", "Ear and headphone test. 2 channels, CCP"),
    ("45BB-9", "Ear and headphone test with anthropometric pinnae. 2 channels, LEMO"),
    ("45BB-10", "Ear and headphone test with anthropometric pinna. 2 channels, CCP"),
    ("45BB-11", "Low-noise ear and headphone test with anthropometric pinna. 1 channel, LEMO"),
    ("45BB-12", "Low-noise ear and headphone test with anthropometric pinna. 2 channels, LEMO"),
    ("45BB-13", "High-frequency test of ear and headphones. 2 channels, LEMO"),
    ("45BB-14", "High-frequency test of ear and headphones. 2 channels, CCP"),
    ("45BB-15", "Hi-Res ear simulators for ear and headphone test. 2 channels, LEMO"),
    ("45BB-16", "Hi-Res ear simulators for ear and headphone test. 2 channels, CCP"),
    ("45BC-1", "Headset test with mouth simulator. 2 channels, LEMO"),
    ("45BC-2", "Headset test with mouth simulator. 2 channels, CCP"),
    ("45BC-3", "Telephone test with mouth simulator. 1 channel, LEMO"),
    ("45BC-4", "Telephone test with mouth simulator. 1 channel, CCP"),
    ("45BC-9", "Headset test with mouth simulator and anthropometric pinnae. 2 channels, LEMO"),
    ("45BC-10", "Headset test with mouth simulator and anthropometric pinnae. 2 channels, CCP"),
    ("45BC-11", "Low-noise headset test with mouth simulator and anthropometric pinnae. 1 channel, LEMO"),
    ("45BC-12", "Low-noise headset test with mouth simulator and anthropometric pinnae. 2 channels, LEMO"),
    ("45BC-13", "High-frequency headset test with mouth simulator. 2 channels, LEMO"),
    ("45BC-14", "High-frequency headset test with mouth simulator. 2 channels, CCP"),
    ("45BC-15", "Headset test with mouth simulator and Hi-Res simulators. 2 channels, LEMO"),
    ("45BC-16", "Headset test with mouth simulator and Hi-Res ear simulators. 2 channels, CCP"),
]
with open(os.path.join(HERE, "kemar_names.json"), encoding="utf-8") as fh:
    KEMAR_NAMES = json.load(fh)  # model -> official GRAS product name
KEMAR_INFO = {model.split(" ")[0]: text for model, text in KEMAR_ROWS}
KEMAR_GROUPS = [
    ("Automotive", ["45BD"]),
    ("Headset test (with mouth simulator)", ["45BC-1", "45BC-2", "45BC-9", "45BC-10", "45BC-11", "45BC-12", "45BC-13", "45BC-14", "45BC-15", "45BC-16"]),
    ("Telephone test", ["45BC-3", "45BC-4"]),
    ("Ear and headphone test", ["45BB-5", "45BB-6", "45BB-9", "45BB-10", "45BB-11", "45BB-12", "45BB-13", "45BB-14", "45BB-15", "45BB-16"]),
    ("Hearing aid test", ["45BB-1", "45BB-2", "45BB-7", "45BB-8"]),
    ("Sound quality recording", ["45BB-3", "45BB-4"]),
    ("Non-configured", ["45BB", "45BC"]),
]
assert sorted(m for _, ms in KEMAR_GROUPS for m in ms) == sorted(KEMAR_NAMES), "every KEMAR variant in exactly one group"


def kemar_card(model):
    bl = [part.strip().rstrip(".") for part in KEMAR_INFO[model].split(". ") if part.strip()]
    return (KEMAR_NAMES[model], model, bl, "gras-" + model.lower())


page(GRAS, 0, "head-and-torso", "Head and Torso", "GRAS",
     ["Audio design is a vital part of developing cars, computers, hearing aids, mobile phones and many other products. The GRAS KEMAR head and torso simulator was first developed with the audiological industry for hearing aid work and remains its de facto standard.",
      "KEMAR is built on statistical research of the average human body, so it has the acoustic properties of a real person, and it meets ISO, IEC and ANSI standards. Its use has spread to telecommunications, hearing protection, noise abatement, sound recording and automotive development."],
     [cards("KEMAR variants",
            "Preconfigured versions for specific purposes, with optional accessories to change the configuration. 45BB variants have no mouth simulator, 45BC variants have one.",
            *[(name, [kemar_card(m) for m in models]) for name, models in KEMAR_GROUPS])],
     "GRAS KEMAR head and torso simulators for hearing aid, headset, headphone, telephone, sound quality and automotive acoustic testing, including AutoKEMAR 45BD.")

page(GRAS, 1, "engine-noise-testing-for-ev-and-ice", "Engine Noise Testing for EV and ICE", "GRAS",
     ["An engine sound check covers much more than the engine itself: gearbox, belt drive, pumps, cooling fans, the A/C compressor and the power steering motors all shape the acoustic comfort of a vehicle, and engine bay noise also affects the legally regulated pass-by noise.",
      "On electric vehicles the low-frequency engine noise is gone, so other noises are no longer masked. New high-frequency tonal noise from the electric motor and inverter can be very disturbing, which makes reliable measurement at higher frequencies more important."],
     [heading("What engine bay measurements show"),
      bullets(["Source location, source strength, frequency content, engine order content and time variation of the noise",
               "How well acoustic packages, which insulate or absorb sound, perform when combined with interior or exterior measurements",
               "Measurements on development vehicles, production follow-up vehicles and for benchmarking"]),
      products(("Recommended microphones", [
          ("GRAS 147AX", "147AX", ["Rugged pressure microphone with a mounting system for repeatable cold and hot engine testing, also on the proving ground"], "gras-147ax"),
          ("GRAS 146AE", "146AE", ["Free-field microphone, the choice for testing inside the car"], "gras-146ae"),
          ("GRAS 42AG", "42AG", ["Recommended for calibration"], "gras-42ag"),
      ]))],
     "GRAS acoustic measurement for engine noise testing on electric and combustion vehicles: engine bay, interior and pass-by noise, with rugged pressure microphones.",
     old_slug="engine-microphone")

page(GRAS, 2, "brake-noise-testing", "Brake Noise Testing", "GRAS",
     ["Brake noise is caused by friction-induced vibration that makes the brake system radiate sound. It disturbs owners and bystanders, hurts customer satisfaction surveys and drives warranty costs, so it is tested throughout development.",
      "Electrification changes the picture: engine masking disappears, and regenerative braking means friction brakes are used less, which calls for new brake designs and more attention to noise."],
     [heading("Brake noise types"),
      feature_grid([
          ("Low frequency, 100 to 1,000 Hz", "Often broadband noise, described as scraping, grinding, grunt, groan, moan or judder."),
          ("Medium to high frequency, 1 to 5 kHz", "Friction-induced tonal noise, typically from coupled modes between pads and rotor. Squeal starts under specific brake pressure, rotor temperature and environment."),
          ("High-frequency tonal noise, above 5 kHz", "Squeal or squeak from in-plane resonances of the brake rotor."),
      ]),
      bullets(["Component testing and modal analysis of brake components, especially pads and rotor, with CAE correlation",
               "Brake dynamometer squeal test and wheelhouse test, both with microphones"]),
      products(("Recommended microphones", [
          ("GRAS 146AE", "146AE", ["Free-field microphone, the choice for test bench testing"], "gras-146ae"),
          ("GRAS 147EB", "147EB", ["Rugged microphone with extra protection for on-road testing in all climates"], None),
          ("GRAS 42AG", "42AG", ["Recommended for calibration"], "gras-42ag"),
      ]))],
     "GRAS microphones for brake noise testing: dynamometer squeal tests, wheelhouse tests and on-road measurement of brake noise on combustion and electric vehicles.",
     old_slug="brake-microphone")

page(GRAS, 3, "vehicle-interior-noise-on-electric-vehicles", "Vehicle Interior Noise on Electric Vehicles", "GRAS",
     ["Interior noise, vibration and harshness (NVH) covers all noise inside the vehicle that comes from the road, body, chassis and components. Road noise is structure-borne and airborne, and component noise comes from systems such as HVAC and power windows.",
      "Measuring inside the cabin is harder on an electric vehicle than on a combustion vehicle: more high-frequency content makes TPA and ENR measurements difficult, and a distributed powertrain with wind, road and tyre noise makes pressure microphones more relevant than directional free-field microphones."],
     [heading("EV cabin considerations"),
      bullets(["Active noise cancellation is hard to control in the cabin, and uncontrolled phase can amplify the noise",
               "Passive measures such as acoustic packages and anti-vibration mounts remain in use and must be adapted to the new environment"]),
      products(("Recommended microphones", [
          ("GRAS 47HC", "47HC", ["1/2 inch CCP low-noise microphone system"], "gras-47hc"),
          ("GRAS 147AX", "147AX", ["Rugged pressure microphone with the MagMount mounting system for precise, repeatable in-cabin tests"], "gras-147ax"),
          ("GRAS 146AE", "146AE", ["Free-field microphone set for driver seat measurements and almost all acoustic NVH testing"], "gras-146ae"),
          ("GRAS 46BC", "46BC", ["Multifield, high-sensitivity microphone"], "gras-46bc"),
      ]))],
     "GRAS microphones for vehicle interior NVH on electric vehicles: road and component noise, cabin measurement challenges and recommended microphone systems.",
     old_slug="in-cabin-microphone")

page(GRAS, 4, "car-buzz-squeak-and-rattle-noise-testing", "Car Buzz, Squeak and Rattle Noise Testing", "GRAS",
     ["Buzz, squeak and rattle (BSR) are noises made by installed parts that move against each other, sometimes only in certain environmental conditions. Buzz comes from the structure or part itself, squeak from friction between parts and rattle from impact.",
      "Even at low levels BSR is easy to hear because it is intermittent and poorly masked, and it is a common source of customer complaints. In electric vehicles masking is lower still while weight targets make BSR harder to prevent."],
     [heading("Preventing BSR"),
      bullets(["Chassis and structural design, material selection and controlled tolerance chains are specified in the design targets, from prototype to production",
               "Measure continuously with reliable measurement microphones",
               "BSR testing uses microphones and vibration sensors to locate the noise source and improve perceived quality"]),
      products(("Recommended microphones", [
          ("GRAS 146AE", "146AE", ["Versatile free-field microphone set, the first choice for buzz, squeak and rattle testing anywhere in and around the car"], "gras-146ae"),
          ("GRAS 46BC", "46BC", ["Multifield, high-sensitivity microphone"], "gras-46bc"),
          ("GRAS 42AG", "42AG", ["Recommended for calibration"], "gras-42ag"),
      ]))],
     "GRAS microphones for buzz, squeak and rattle noise testing of vehicles, including electric vehicles where low masking makes BSR more noticeable.")

page(GRAS, 5, "automotive-wind-noise-testing", "Automotive Wind Noise Testing", "GRAS",
     ["Aeroacoustics studies noise generated by turbulent fluid motion or by aerodynamic forces acting on surfaces. It matters in the design of vehicles, aircraft, wind turbines, buildings and bridges, and it is a critical part of automotive design, certification and operation.",
      "Two sources matter: external noise and aerodynamic (pseudo) noise. Wind tests are expensive and slow, and calculation is hard to make realistic because of boundary layer pressure variations, so measurement with surface microphones is key."],
     [heading("Surface microphones for aeroacoustics"),
      products(("Recommended microphones", [
          ("GRAS 48LX-1", "48LX-1", ["Ultra-Thin Precision (UTP) surface microphone set for aeroacoustic testing", "Ideal for measurements in boundary layers and turbulence"], "gras-48lx-1"),
          ("GRAS 48LX-4 / 48LX-8", "48LX-4 / 48LX-8", ["Ultra-Thin Precision (UTP) surface microphone line-arrays", "Ideal for wind-induced noise on vehicles and in wind tunnels"], None),
          ("GRAS 40LA / 40LS", "40LA / 40LS", ["Surface microphone for planar and curved surfaces", "For investigating turbulence and wind-induced noise"], "gras-40ls"),
          ("GRAS 42AG with GRAS 4800", "42AG + 4800", ["Verification solution for the test setup"], "gras-42ag"),
      ]))],
     "GRAS surface microphones for automotive wind noise and aeroacoustic testing in wind tunnels and on vehicles, including the UTP 48LX series.")

PROD = [
    ("GRAS 40PO-H EQset High Freq. Production Line Microphone, High SPL", "40PO-H", ["Frequency range: 10 Hz to 40 kHz", "Dynamic range: 36 dBA to 138 dB", "Sensitivity: 8 mV/Pa"], "gras-40po-h"),
    ("GRAS 40PO-L EQset High Freq. Production Line Microphone, Low SPL", "40PO-L", ["Frequency range: 10 Hz to 40 kHz", "Dynamic range: 30 dBA to 128 dB", "Sensitivity: 25 mV/Pa"], "gras-40po-l"),
    ("GRAS 40PM EQset Miniature Production Line Microphone", "40PM", ["Frequency range: 20 Hz to 20 kHz", "Dynamic range: 30 dB(A) to 120 dB", "Sensitivity: 25 mV/Pa"], "gras-40pm"),
    ("GRAS 40PM-1 EQset Miniature Production Line Microphone, High Precision", "40PM-1", ["Frequency range: 20 Hz to 20 kHz", "Dynamic range: 30 dB(A) to 125 dB", "Sensitivity: 20 mV/Pa"], "gras-40pm-1"),
    ("GRAS 40PI Production Line Microphone", "40PI", ["Frequency range: 20 Hz to 20 kHz", "Dynamic range: 30 dB(A) to 146 dB", "Sensitivity: 12 mV/Pa"], "gras-40pi"),
    ("GRAS 40PP-10 CCP Free-field QC Microphone", "40PP-10", ["Frequency range: 10 Hz to 20 kHz", "Dynamic range: 33 dB(A) to 128 dB", "Sensitivity: 50 mV/Pa"], "gras-40pp-10"),
    ("GRAS 40PP-10-S1 CCP Free-field QC Microphone, High Pressure", "40PP-10-S1", ["Frequency range: 10 Hz to 20 kHz", "Dynamic range: 33 dB(A) to 142 dB", "Sensitivity: 9 mV/Pa (±3 dB)"], "gras-40pp-10-s1"),
]
page(GRAS, 6, "production-line-microphone-for-consumer-electronic-products", "Production Line Microphone for Consumer Electronic Products", "GRAS",
     ["Production line testing confirms that finished products match the quality target set by R&D and that no sub-standard unit reaches the market. Production line microphones therefore have to give repeatable, precise measurements every day.",
      "They are also needed in larger numbers than in R&D, so GRAS offers a range of production line and QC microphones, several with EQset technology for ease of use and environmental stability."],
     [products(("Production line and QC microphones", PROD))],
     "GRAS production line and QC microphones for consumer electronics: EQset 40PO and 40PM series, 40PI and 40PP-10 free-field QC microphones with their key specifications.",
     old_slug="production-microphone")

# ================================================================== Audio Precision
AP = "Audio Precision"
page(AP, 3, "automotive-entertainment-test-and-equipment", "Automotive Entertainment Test and Equipment", "Audio Precision",
     ["Audio Precision's application note on automotive amplifiers describes the measurements normally made on car audio amplifiers and what to watch for in automotive systems. Most car audio amplifiers are class A/B or D, chosen to keep power consumption low while keeping output high and distortion low.",
      "The tests are the same from one amplifier class to the next, apart from the special output filtering that class D amplifiers need. They run on an Audio Precision audio analyzer from the APx500 series, with a DC supply of 9 to 16 VDC, a power meter, a multimeter, non-inductive load resistors of the rated impedance and power, and ground cables to a common ground."],
     [cards("Test equipment", "The Audio Precision equipment named in the application note.",
            ("Audio analyzers", [
                ("APx555B", "APx555B", ["Modular two-channel audio analyzer", "Two-channel generator for the basic and IEC 60268-3 CMRR tests"], "ap-apx555b"),
                ("APx52xB", "APx525 / APx526", ["Modular 2- and 4-channel audio analyzers", "Two-channel generator for the basic and IEC 60268-3 CMRR tests"], "ap-apx52xb"),
                ("APx58xB", "APx582", ["8 or 16-channel modular audio analyzers for multichannel amplifier test"], "ap-apx58xb"),
                ("APx515B", "APx515B", ["Two-channel analyzer for production test and entry-level R&D"], "ap-apx515b"),
                ("APx500 Software", None, ["Measurement software for all APx analyzers, including the AES17 filter used for class D measurements"], "ap-apx500-software"),
            ]),
            ("Class D measurement filters", [
                ("AUX-0025", "AUX-0025", ["Two-channel switching amplifier measurement filter (low-pass)", "Passive filter between the amplifier outputs and the analyzer inputs"], "ap-aux-0025"),
                ("AUX-0100", "AUX-0100", ["Eight-channel switching amplifier measurement filter (low-pass)", "For multichannel class D amplifiers"], "ap-aux-0100"),
                ("AUX-0040", "AUX-0040", ["Two-channel 40 kHz low-pass switching amplifier measurement filter"], "ap-aux-0040"),
            ]),
            ("Automotive interfaces", [
                ("A2B audio testing", None, ["Multichannel audio test over the Automotive Audio Bus (A2B) with an APx analyzer"], "ap-a2b"),
            ])),
      heading("Amplifier measurements", "The typical measurements made on automotive audio amplifiers."),
      feature_grid([
          ("Gain and level", "A stepped input level sweep, measuring output level and gain on two channels at once. It shows gain, channel matching, the point where the output clips and the linear dynamic range."),
          ("Noise floor and SNR", "How quiet a channel is. Noise can be random or deterministic, from crosstalk, power supply isolation, grounding or EMI from electric motors and ignition. Occupants notice it most in a quiet vehicle."),
          ("Common mode rejection (CMRR)", "Compares output noise of a balanced output with the same amplifier unbalanced. The basic test and the IEC 60268-3 method are both available. A well-designed amplifier is typically 60 dB or better."),
          ("Power supply rejection (PSRR)", "How well the amplifier keeps power system noise out of the audio, which is critical for systems powered straight from the vehicle battery. An example setup is 13.8 V DC with about 2 Vrms AC."),
          ("Frequency response", "Output level across 20 Hz to 20 kHz, or to 45 or 90 kHz for high definition audio. A logarithmic chirp can replace a stepped sweep in production test: for example 4 seconds instead of 23."),
          ("Output power and THD+N", "THD+N at 1 W with all channels driven, and at full power with one channel driven. THD+N can rise by 10 times or more between the two."),
          ("Intermodulation distortion", "Two-tone tests of the upper audio range: difference frequency distortion (DFD) and SMPTE IMD, typically with f1 at 60 Hz and f2 at 7 kHz at a 4:1 amplitude ratio."),
          ("Crosstalk", "Unintended coupling from one channel to another, measured as a function of frequency and often at 1 W output."),
          ("DC offset, click and pop", "The DC level at the outputs, and the turn-on and turn-off transients, judged with Q-peak measurement and an estimate of the resulting sound pressure level."),
          ("Class D amplifiers", "Out-of-band switching noise needs a passive filter in front of the analyzer, plus the analyzer's AES17 filter. Audio Precision offers external low-pass filters for this purpose."),
      ]),
      text_image("Automotive audio test subsystems",
                 "Seen through an audio lens, a car is a complex system, so Audio Precision breaks testing into subsystems: the amplifier, the head unit, the cabin (acoustic, perceptual and Bluetooth) and A2B. Interfaces range from analog and I2S to Bluetooth, PDM and TDM, and the tests include multichannel, perceptual (PESQ, POLQA, ABC-MRT), acoustic and open-loop file analysis. The amplifier is the subject of this first paper in a series.",
                 "ap-automotive-audio-subsystems", "Diagram of the automotive audio test subsystems around a car"),
      heading("Typical targets", "Performance levels from the application note, for a well-designed automotive amplifier."),
      feature_grid([
          ("Test supply", "9 to 16 VDC for the amplifier under test"),
          ("CMRR", "60 dB or better"),
          ("PSRR", "60 dB or better, 20 Hz to 5 kHz"),
          ("SMPTE IMD", "0.5% or less (standard), 0.1% or less (premium)"),
          ("Crosstalk", "-40 dB or better (standard), -50 dB or better (premium), often at 1 W"),
      ]),
      text_image("Grounding",
                 "Connect each device's chassis ground straight to the analyzer's ground (star grounding). Chaining grounds from device to device (bus grounding) adds noise and often gives the worst results.",
                 "ap-grounding", "Bus grounding (not recommended) compared with star grounding (recommended)"),
      text_image("Class D output filtering",
                 "A class D output carries high-frequency switching noise. Put a passive filter such as the AUX-0025, AUX-0100 or AUX-0040 between the amplifier and the analyzer, then use the analyzer's AES17 filter. The external filter also protects the analyzer inputs.",
                 "ap-classd-filter", "Class D amplifier output before and after the measurement filter")],
     "Audio Precision automotive audio amplifier testing: gain, noise, CMRR, PSRR, frequency response, THD+N, intermodulation, crosstalk, DC offset, click and pop, and class D filtering.")

os.makedirs(OUT, exist_ok=True)
for f in os.listdir(OUT):
    if f.endswith(".json"):
        os.remove(os.path.join(OUT, f))
for p in pages:
    with open(os.path.join(OUT, p["slug"] + ".json"), "w", encoding="utf-8") as fh:
        json.dump(p, fh, ensure_ascii=False, indent=2)
print(len(pages), "pages")
