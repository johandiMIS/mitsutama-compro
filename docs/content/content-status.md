# Content status

Generated from the database by `docs/content/generate-content-status.mjs` on 2026-10-10. Rows are the header-menu entries, with pages nested under them (grouped by product group).

| Status            | Meaning                                                                                              |
| ----------------- | ---------------------------------------------------------------------------------------------------- |
| Not started       | Menu entry exists, page body is the empty placeholder                                                |
| Need content      | Page body is empty but child pages exist; it needs a landing body listing them                       |
| In progress       | Draft has content (imported or edited) but is not published, or has edits that are not published yet |
| Ready for publish | Reviewed draft, set by hand after review (nothing is set automatically)                              |
| Done              | Published with content and no unpublished changes                                                    |

On a landing page the product cards come from its published child pages, so its block count does not include them.

## Products

### Chroma

| Menu item                                                                    | Slug                                               | Product group                | Status | Blocks | Child pages |
| ---------------------------------------------------------------------------- | -------------------------------------------------- | ---------------------------- | ------ | ------ | ----------- |
| Power Electronic Test and Equipment                                          | `power-electronic-test-and-equipment`              | –                            | Done   | 2      | 51          |
| &nbsp;&nbsp;↳ Advanced AC Power Source 61700 Series                          | `ac-power-source-61700`                            | AC Power Source              | Done   | 5      | –           |
| &nbsp;&nbsp;↳ Basic and Cost Effective AC Power Source 61600 Series          | `ac-power-source-61600`                            | AC Power Source              | Done   | 5      | –           |
| &nbsp;&nbsp;↳ High Performance AC Power Source 61500 Series                  | `ac-power-source-61500`                            | AC Power Source              | Done   | 5      | –           |
| &nbsp;&nbsp;↳ Regenerative Grid Simulator 61800 Series                       | `ac-power-source-61800`                            | AC Power Source              | Done   | 5      | –           |
| &nbsp;&nbsp;↳ Auto Range DC Power Supply 62000P Series                       | `dc-power-supply-62000p`                           | DC Power Supply              | Done   | 5      | –           |
| &nbsp;&nbsp;↳ High Power Density DC Power Supply 62000H Series               | `dc-power-supply-62000h`                           | DC Power Supply              | Done   | 6      | –           |
| &nbsp;&nbsp;↳ Modular DC Power Supply 62000B Series                          | `dc-power-supply-62000b`                           | DC Power Supply              | Done   | 5      | –           |
| &nbsp;&nbsp;↳ Programmable DC Power Supply 62000L Series                     | `dc-power-supply-62000l`                           | DC Power Supply              | Done   | 5      | –           |
| &nbsp;&nbsp;↳ Solar Array Simulator 62000H-S Series                          | `solar-array-simulator-62000h-s`                   | DC Power Supply              | Done   | 6      | –           |
| &nbsp;&nbsp;↳ Cost Effective Modular DC Electronic Load 6310A Series         | `dc-electronic-load-6310a`                         | DC Electronic Load           | Done   | 5      | –           |
| &nbsp;&nbsp;↳ High Performance DC Electronic Load 63600 Series               | `dc-electronic-load-63600`                         | DC Electronic Load           | Done   | 5      | –           |
| &nbsp;&nbsp;↳ High Power DC Electronic Load 63200A / 63200E Series           | `dc-electronic-load-63200`                         | DC Electronic Load           | Done   | 7      | –           |
| &nbsp;&nbsp;↳ LED Load Simulator 63110A / 63113A / 63115A                    | `led-load-simulator-63110a`                        | DC Electronic Load           | Done   | 5      | –           |
| &nbsp;&nbsp;↳ Programmable DC Electronic Load 63000 Series                   | `dc-electronic-load-63000`                         | DC Electronic Load           | Done   | 5      | –           |
| &nbsp;&nbsp;↳ AC Electronic Load 63800 Series                                | `ac-electronic-load-63800`                         | AC Electronic Load           | Done   | 5      | –           |
| &nbsp;&nbsp;↳ Digital Power Meter 66200 Series                               | `digital-power-meter-66200`                        | Digital Power Meter          | Done   | 5      | –           |
| &nbsp;&nbsp;↳ Adapter / Charger ATS 8020                                     | `adapter-charger-ats-8020`                         | Automatic Test System (ATS)  | Done   | 3      | –           |
| &nbsp;&nbsp;↳ Automatic Test Systems                                         | `automatic-test-systems`                           | Automatic Test System (ATS)  | Done   | 4      | –           |
| &nbsp;&nbsp;↳ Bias Current Test System 11300                                 | `bias-current-test-system-11300`                   | Automatic Test System (ATS)  | Done   | 3      | –           |
| &nbsp;&nbsp;↳ Capacitor Test System 1820                                     | `capacitor-test-system-1820`                       | Automatic Test System (ATS)  | Done   | 3      | –           |
| &nbsp;&nbsp;↳ Component ATS 8800                                             | `component-ats-8800`                               | Automatic Test System (ATS)  | Done   | 3      | –           |
| &nbsp;&nbsp;↳ DC-DC Converter ATS 8000                                       | `dc-dc-converter-ats-8000`                         | Automatic Test System (ATS)  | Done   | 3      | –           |
| &nbsp;&nbsp;↳ EDLC LC Monitoring System 8802                                 | `edlc-lc-monitoring-system-8802`                   | Automatic Test System (ATS)  | Done   | 3      | –           |
| &nbsp;&nbsp;↳ Electrical Double Layer Capacitor ATS 8801                     | `edlc-ats-8801`                                    | Automatic Test System (ATS)  | Done   | 3      | –           |
| &nbsp;&nbsp;↳ High Capacitance Electrolytic Capacitor ATS 1911               | `high-capacitance-electrolytic-capacitor-ats-1911` | Automatic Test System (ATS)  | Done   | 3      | –           |
| &nbsp;&nbsp;↳ LED Driver ATS 8491                                            | `led-driver-ats-8491`                              | Automatic Test System (ATS)  | Done   | 3      | –           |
| &nbsp;&nbsp;↳ Magnetic Component Test System 1810                            | `magnetic-component-test-system-1810`              | Automatic Test System (ATS)  | Done   | 3      | –           |
| &nbsp;&nbsp;↳ Medical Electrical Safety ATS 8910                             | `medical-electrical-safety-ats-8910`               | Automatic Test System (ATS)  | Done   | 3      | –           |
| &nbsp;&nbsp;↳ PC Power Supply ATS 8010                                       | `pc-power-supply-ats-8010`                         | Automatic Test System (ATS)  | Done   | 3      | –           |
| &nbsp;&nbsp;↳ SMPS ATS 8000                                                  | `smps-ats-8000`                                    | Automatic Test System (ATS)  | Done   | 3      | –           |
| &nbsp;&nbsp;↳ Auto Transformer Test System 13350                             | `auto-transformer-test-system-13350`               | LCR Meter and Component Test | Done   | 3      | –           |
| &nbsp;&nbsp;↳ Electrolytic Capacitor Testers 11800 Series                    | `electrolytic-capacitor-testers-11800`             | LCR Meter and Component Test | Done   | 4      | –           |
| &nbsp;&nbsp;↳ HF LCR Meter 11050 Series                                      | `hf-lcr-meter-11050`                               | LCR Meter and Component Test | Done   | 4      | –           |
| &nbsp;&nbsp;↳ LCR Meter 11021 / 11021-L                                      | `lcr-meter-11021`                                  | LCR Meter and Component Test | Done   | 3      | –           |
| &nbsp;&nbsp;↳ LCR Meter 11025                                                | `lcr-meter-11025`                                  | LCR Meter and Component Test | Done   | 3      | –           |
| &nbsp;&nbsp;↳ LCR Meters & Passive Component Testers                         | `lcr-meters-and-passive-component-testers`         | LCR Meter and Component Test | Done   | 7      | –           |
| &nbsp;&nbsp;↳ Milliohm Meter 16502                                           | `milliohm-meter-16502`                             | LCR Meter and Component Test | Done   | 4      | –           |
| &nbsp;&nbsp;↳ Battery Cell Surge Tester 19311 / 19311-10                     | `battery-cell-surge-tester-19311`                  | Electrical Safety Test       | Done   | 3      | –           |
| &nbsp;&nbsp;↳ Corona Hi-Pot Tester 19055-C                                   | `corona-hipot-tester-19055-c`                      | Electrical Safety Test       | Done   | 4      | –           |
| &nbsp;&nbsp;↳ Electrical Safety Analyzer 19032-P                             | `electrical-safety-analyzer-19032-p`               | Electrical Safety Test       | Done   | 4      | –           |
| &nbsp;&nbsp;↳ Electrical Safety Analyzers                                    | `electrical-safety-analyzers`                      | Electrical Safety Test       | Done   | 4      | –           |
| &nbsp;&nbsp;↳ Hipot Analyzer 19056 / 19057 Series                            | `hipot-analyzer-19056-19057`                       | Electrical Safety Test       | Done   | 3      | –           |
| &nbsp;&nbsp;↳ Impulse Winding Tester 19301A                                  | `impulse-winding-tester-19301a`                    | Electrical Safety Test       | Done   | 4      | –           |
| &nbsp;&nbsp;↳ Multi-Channel Hipot Tester 19020 Series                        | `multi-channel-hipot-tester-19020`                 | Electrical Safety Test       | Done   | 3      | –           |
| &nbsp;&nbsp;↳ Partial Discharge Tester 19501-K                               | `partial-discharge-tester-19501-k`                 | Electrical Safety Test       | Done   | 3      | –           |
| &nbsp;&nbsp;↳ Wound Component EST Analyzer 19036                             | `wound-component-est-analyzer-19036`               | Electrical Safety Test       | Done   | 4      | –           |
| &nbsp;&nbsp;↳ Wound Component EST Scanner 19035                              | `wound-component-est-scanner-19035`                | Electrical Safety Test       | Done   | 3      | –           |
| &nbsp;&nbsp;↳ Battery Insulation Tester 11210                                | `battery-insulation-tester-11210`                  | Insulation Tester            | Done   | 3      | –           |
| &nbsp;&nbsp;↳ Capacitor Leakage Current / IR Tester 11200                    | `capacitor-leakage-current-ir-tester-11200`        | Insulation Tester            | Done   | 3      | –           |
| &nbsp;&nbsp;↳ Inductor Layer Short Automatic Test Machine 1871               | `inductor-layer-short-test-machine-1871`           | Inductor Test Machine        | Done   | 4      | –           |
| &nbsp;&nbsp;↳ Inductor Test & Packing Machine 1870D                          | `inductor-test-and-packing-machine-1870d`          | Inductor Test Machine        | Done   | 4      | –           |
| Inverter Test and Equipment                                                  | `inverter-test-and-equipment`                      | –                            | Done   | 3      | 3           |
| &nbsp;&nbsp;↳ Micro Inverter ATS 8000                                        | `micro-inverter-ats-8000`                          | PV Inverter / PCS Test       | Done   | 3      | –           |
| &nbsp;&nbsp;↳ PV Inverter / PCS Test Solutions                               | `pv-inverter-pcs-test-solutions`                   | PV Inverter / PCS Test       | Done   | 3      | –           |
| &nbsp;&nbsp;↳ PV Inverter ATS 8000                                           | `pv-inverter-ats-8000`                             | PV Inverter / PCS Test       | Done   | 3      | –           |
| Battery Test and Equipment                                                   | `battery-test-and-equipment`                       | –                            | Done   | 3      | 12          |
| &nbsp;&nbsp;↳ Regenerative Battery Cell Charge & Discharge Test System 17011 | `regenerative-battery-cell-test-system-17011`      | Battery Cell Test            | Done   | 9      | –           |
| &nbsp;&nbsp;↳ Regenerative Battery Pack Test System 17020                    | `regenerative-battery-pack-test-system-17020`      | Battery Pack Test            | Done   | 5      | –           |
| &nbsp;&nbsp;↳ Regenerative Battery Pack Test System 17020E                   | `regenerative-battery-pack-test-system-17020e`     | Battery Pack Test            | Done   | 5      | –           |
| &nbsp;&nbsp;↳ Regenerative Battery Pack Test System 17040                    | `regenerative-battery-pack-test-system-17040`      | Battery Pack Test            | Done   | 5      | –           |
| &nbsp;&nbsp;↳ Battery Pack Simulator 17020 / 17040                           | `battery-pack-simulator-17020-17040`               | Battery Pack Simulator       | Done   | 3      | –           |
| &nbsp;&nbsp;↳ BMS Test System 8710 & Battery Cell Simulator 87001            | `bms-test-system-8710`                             | BMS Test                     | Done   | 3      | –           |
| &nbsp;&nbsp;↳ Barcode Binding Equipment                                      | `barcode-binding-equipment`                        | Battery Cell Line Equipment  | Done   | 2      | –           |
| &nbsp;&nbsp;↳ Battery Cell Grouping Equipment                                | `battery-cell-grouping-equipment`                  | Battery Cell Line Equipment  | Done   | 2      | –           |
| &nbsp;&nbsp;↳ Formation System                                               | `formation-system`                                 | Battery Cell Line Equipment  | Done   | 2      | –           |
| &nbsp;&nbsp;↳ Functional ATS                                                 | `functional-ats`                                   | Battery Cell Line Equipment  | Done   | 2      | –           |
| &nbsp;&nbsp;↳ OCV & ACR Test Equipment                                       | `ocv-acr-test-equipment`                           | Battery Cell Line Equipment  | Done   | 2      | –           |
| &nbsp;&nbsp;↳ Thermal Data Logger                                            | `thermal-data-logger`                              | Battery Cell Line Equipment  | Done   | 2      | –           |
| EV and EVSE Test and Equipment                                               | `ev-and-evse-test-and-equipment`                   | –                            | Done   | 3      | 10          |
| &nbsp;&nbsp;↳ Electric Vehicle Test Solutions                                | `ev-test-solutions`                                | EV Test Solutions            | Done   | 5      | –           |
| &nbsp;&nbsp;↳ Battery Module Maintenance ATS                                 | `battery-module-maintenance-ats`                   | Battery and BMS ATS          | Done   | 3      | –           |
| &nbsp;&nbsp;↳ Battery Pack ATS                                               | `battery-pack-ats`                                 | Battery and BMS ATS          | Done   | 3      | –           |
| &nbsp;&nbsp;↳ BMS PCBA ATS                                                   | `bms-pcba-ats`                                     | Battery and BMS ATS          | Done   | 3      | –           |
| &nbsp;&nbsp;↳ Electrical Safety Test System                                  | `electrical-safety-test-system`                    | Vehicle Electronics Test     | Done   | 3      | –           |
| &nbsp;&nbsp;↳ HCU (VMS / VCU) ATS                                            | `hcu-vms-vcu-ats`                                  | Vehicle Electronics Test     | Done   | 3      | –           |
| &nbsp;&nbsp;↳ OBC & DC-DC Converter ATS                                      | `obc-dc-dc-converter-ats`                          | Vehicle Electronics Test     | Done   | 3      | –           |
| &nbsp;&nbsp;↳ EV AC / DC Charging Compatibility ATS                          | `ev-ac-dc-charging-compatibility-ats`              | Charging Test                | Done   | 3      | –           |
| &nbsp;&nbsp;↳ EVSE ATS                                                       | `evse-ats`                                         | Charging Test                | Done   | 3      | –           |
| &nbsp;&nbsp;↳ Wireless Charger ATS                                           | `wireless-charger-ats`                             | Charging Test                | Done   | 3      | –           |

### IMC

| Menu item                          | Slug                                 | Product group | Status      | Blocks | Child pages |
| ---------------------------------- | ------------------------------------ | ------------- | ----------- | ------ | ----------- |
| Vehicle Dynamic Test and Equipment | `vehicle-dynamic-test-and-equipment` | –             | Not started | 0      | 0           |
| EV Power Analyzer                  | `ev-power-analyzer`                  | –             | Not started | 0      | 0           |
| Train NVH Monitoring and Analysis  | `train-nvh-monitoring-and-analysis`  | –             | Not started | 0      | 0           |
| Aeroplanes NVH and Analysis        | `aeroplanes-nvh-and-analysis`        | –             | Not started | 0      | 0           |
| Structure Analyzer                 | `structure-analyzer`                 | –             | Not started | 0      | 0           |
| Bridge Monitoring and Analysis     | `bridge-monitoring-and-analysis`     | –             | Not started | 0      | 0           |
| Fuel Cell Monitoring and Analysis  | `fuel-cell-monitoring-and-analysis`  | –             | Not started | 0      | 0           |

### GRAS

| Menu item             | Slug                    | Product group | Status      | Blocks | Child pages |
| --------------------- | ----------------------- | ------------- | ----------- | ------ | ----------- |
| Head and Torso        | `head-and-torso`        | –             | Not started | 0      | 0           |
| Engine Microphone     | `engine-microphone`     | –             | Not started | 0      | 0           |
| Brake Microphone      | `brake-microphone`      | –             | Not started | 0      | 0           |
| In Cabin Microphone   | `in-cabin-microphone`   | –             | Not started | 0      | 0           |
| Production Microphone | `production-microphone` | –             | Not started | 0      | 0           |

### Audio Precision

| Menu item                                       | Slug                                             | Product group | Status      | Blocks | Child pages |
| ----------------------------------------------- | ------------------------------------------------ | ------------- | ----------- | ------ | ----------- |
| DAC, Power Amplifier and DSP Test and Equipment | `dac-power-amplifier-and-dsp-test-and-equipment` | –             | Not started | 0      | 0           |
| Audio Device Production Test and Quality Check  | `audio-device-production-test-and-quality-check` | –             | Not started | 0      | 0           |
| Headphone, Earbud and Smart Speaker Test        | `headphone-earbud-and-smart-speaker-test`        | –             | Not started | 0      | 0           |
| Automotive Entertainment Test and Equipment     | `automotive-entertainment-test-and-equipment`    | –             | Not started | 0      | 0           |

### Lisun Group

| Menu item                         | Slug                                | Product group | Status      | Blocks | Child pages |
| --------------------------------- | ----------------------------------- | ------------- | ----------- | ------ | ----------- |
| Luminaire Test and Equipment      | `luminaire-test-and-equipment`      | –             | Not started | 0      | 0           |
| Home Appliance Test and Equipment | `home-appliance-test-and-equipment` | –             | Not started | 0      | 0           |
| Cable and Wire Test and Equipment | `cable-and-wire-test-and-equipment` | –             | Not started | 0      | 0           |

## Services

### Testing and Certification

| Menu item                              | Slug                                     | Product group | Status      | Blocks | Child pages |
| -------------------------------------- | ---------------------------------------- | ------------- | ----------- | ------ | ----------- |
| Dyno Testing                           | `dyno-testing`                           | –             | Not started | 0      | 0           |
| Brake Testing                          | `brake-testing`                          | –             | Not started | 0      | 0           |
| PV Testing and Certification           | `pv-testing-and-certification`           | –             | Not started | 0      | 0           |
| Battery Testing and Certification      | `battery-testing-and-certification`      | –             | Not started | 0      | 0           |
| Aero Dynamic Testing and Certification | `aero-dynamic-testing-and-certification` | –             | Not started | 0      | 0           |
| Bridge Testing and Certification       | `bridge-testing-and-certification`       | –             | Not started | 0      | 0           |

### Calibration

| Menu item                         | Slug                                | Product group | Status      | Blocks | Child pages |
| --------------------------------- | ----------------------------------- | ------------- | ----------- | ------ | ----------- |
| EVSE Calibration                  | `evse-calibration`                  | –             | Not started | 0      | 0           |
| Battery Test Calibration          | `battery-test-calibration`          | –             | Not started | 0      | 0           |
| Caliper Calibration               | `caliper-calibration`               | –             | Not started | 0      | 0           |
| Torque Wrench Calibration         | `torque-wrench-calibration`         | –             | Not started | 0      | 0           |
| Environmental Chamber Calibration | `environmental-chamber-calibration` | –             | Not started | 0      | 0           |
| Shaker Calibration                | `shaker-calibration`                | –             | Not started | 0      | 0           |
| Sound Level Meter Calibration     | `sound-level-meter-calibration`     | –             | Not started | 0      | 0           |
| Microphone Calibration            | `microphone-calibration`            | –             | Not started | 0      | 0           |
| Audio Analyzer Calibration        | `audio-analyzer-calibration`        | –             | Not started | 0      | 0           |
| Oscilloscope Calibration          | `oscilloscope-calibration`          | –             | Not started | 0      | 0           |
| AC/DC Source and Load Calibration | `ac-dc-source-and-load-calibration` | –             | Not started | 0      | 0           |

## Solutions

### Standard Compliance

| Menu item                                                                   | Slug                                                                          | Product group | Status      | Blocks | Child pages |
| --------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | ------------- | ----------- | ------ | ----------- |
| IEC 62133 Battery Standard Solution                                         | `iec-62133-battery-standard-solution`                                         | –             | Not started | 0      | 0           |
| IEC 62619 Battery Standard Solution                                         | `iec-62619-battery-standard-solution`                                         | –             | Not started | 0      | 0           |
| UN 38.3 Battery Standard Solution                                           | `un-38-3-battery-standard-solution`                                           | –             | Not started | 0      | 0           |
| UNR 136 Battery Standard Solution                                           | `unr-136-battery-standard-solution`                                           | –             | Not started | 0      | 0           |
| UNR 100 Battery Standard Solution                                           | `unr-100-battery-standard-solution`                                           | –             | Not started | 0      | 0           |
| IEC 61215 Photovoltaic (PV) Standard Solution                               | `iec-61215-photovoltaic-pv-standard-solution`                                 | –             | Not started | 0      | 0           |
| IEC 61730 Photovoltaic (PV) Standard Solution                               | `iec-61730-photovoltaic-pv-standard-solution`                                 | –             | Not started | 0      | 0           |
| IEC 60335 Home Appliance and Similar Electrical Appliance Standard Solution | `iec-60335-home-appliance-and-similar-electrical-appliance-standard-solution` | –             | Not started | 0      | 0           |
| IEC 60598 Luminaire Standard Solution                                       | `iec-60598-luminaire-standard-solution`                                       | –             | Not started | 0      | 0           |

## Summary

| Section   | Not started | Need content | In progress | Ready for publish | Done |
| --------- | ----------- | ------------ | ----------- | ----------------- | ---- |
| Products  | 19          | 0            | 0           | 0                 | 80   |
| Services  | 17          | 0            | 0           | 0                 | 0    |
| Solutions | 9           | 0            | 0           | 0                 | 0    |
