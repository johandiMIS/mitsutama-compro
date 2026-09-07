# Content Gaps and Open Questions

Status of content generation against [content-list.md](content-list.md), as of the research
pass over `contents/source/`.

| Menu | Items | Content written | Source available |
| --- | --- | --- | --- |
| Products | 25 | ✅ all 25 | ✅ docx brief + 2 PDFs |
| Services | 17 | ❌ none | ❌ nothing in `contents/source/` |
| Solutions | 10 | ❌ none | ❌ nothing in `contents/source/` |

---

## 1. Services and Solutions have no source material

`contents/source/` contains only Products material: the `Konten Website PRODUCT.docx`
content brief (which maps Products items to vendor URLs), a Chroma power electronics quick
guide PDF, an Audio Precision automotive amplifier application note PDF, and `links.md`
holding two IMC URLs that the docx already covers.

Nothing in the folder describes Services or Solutions. These 27 items were **not** written,
because writing them would mean inventing Mitsutama's capabilities rather than sourcing
them.

### Services — 17 items needing source material

**Testing and Certification** (6)

- Dyno Testing
- Brake Testing
- PV Testing and Certification
- Battery Testing and Certification
- Aero Dynamic Testing and Certification
- Bridge Testing and Certification

**Calibration** (11)

- EVSE Calibration
- Battery Test Calibration
- Caliper Calibration
- Torque Wrench Calibration
- Environmental Chamber Calibration
- Shaker Calibration
- Sound Level Meter Calibration
- Microphone Calibration
- Audio Analyzer Calibration
- Oscilloscope Calibration
- AC/DC Source and Load Calibration

These are Mitsutama's *own* service offerings, not a vendor's. What would unblock them:
scope of each service, the lab or facility used, accreditation held (ISO/IEC 17025 or
otherwise), calibration ranges and uncertainties, turnaround times, and which standards
each service certifies against.

### Solutions — 10 items needing source material

All under **Standard Compliance**:

- IEC 62133 Battery Standard Solution
- IEC 62619 Battery Standard Solution
- UN 38.3 Battery Standard Solution
- UNR 136 Battery Standard Solution
- UNR 100 Battery Standard Solution
- IEC 61215 Photovoltaic (PV) Standard Solution
- IEC 61730 Photovoltaic (PV) Standard Solution
- IEC 60335 Home Appliance and Similar Electrical Appliance Standard Solution
- IEC 61215 Photovoltaic (PV) Standard Solution — **duplicate, see §2**
- IEC 60598 Luminaire Standard Solution

These are standard-to-equipment mapping pages. The Lisun product pages already written
demonstrate the shape they should take — clause-by-clause tables pairing a standard's
requirements with the equipment that satisfies them. In fact two of these overlap directly
with content already produced:

| Solutions item | Overlapping Products content |
| --- | --- |
| IEC 60335 Home Appliance Standard Solution | [products/lisun-group/home-appliance-test-and-equipment.md](products/lisun-group/home-appliance-test-and-equipment.md) — full IEC 60335-1:2020 clause/model table |
| IEC 60598 Luminaire Standard Solution | [products/lisun-group/luminaire-test-and-equipment.md](products/lisun-group/luminaire-test-and-equipment.md) — full IEC 60598-1:2020 clause/model table |

Decide whether those Solutions pages should reuse that material or stand as separate pages
with their own angle.

---

## 2. `IEC 61215` is listed twice in Solutions

Positions 6 and 9 of the Standard Compliance group are both
"IEC 61215 Photovoltaic (PV) Standard Solution". `nav-links.ts` already carries a code
comment noting it was kept verbatim from the supplied design, but as a rendered menu it
produces two identical entries.

One was likely meant to be a different PV standard. Needs confirmation from whoever
supplied the design.

---

## 3. Nav changes implied by the content brief

The `Konten Website PRODUCT.docx` brief revises several item names relative to
`apps/web/src/components/nav/nav-links.ts`. The written documents follow the **docx**, on
the basis that it is the newer content brief. Each affected file records this in a
`nav_note` frontmatter field.

### Explicit replacements — the brief says "diganti" (replaced with)

| Current nav label | Brief says | Document |
| --- | --- | --- |
| Structure Analyzer | **Defense** | [products/imc/defense.md](products/imc/defense.md) |
| Fuel Cell Monitoring and Analysis | **Energy and Power Grid** | [products/imc/energy-and-power-grid.md](products/imc/energy-and-power-grid.md) |

The Energy and Power Grid replacement is corroborated by the source page itself, which
contains no fuel cell content at all — its energy scope is wind turbines, power plants and
grid infrastructure.

### Renames

| Current nav label | Brief says |
| --- | --- |
| Bridge Monitoring and Analysis | Structure & Bridge Monitoring and Analysis |
| Engine Microphone | Engine Noise Testing for EV and ICE |
| Brake Microphone | Brake Noise Testing |
| In Cabin Microphone | Vehicle Interior Noise on Electric Vehicles |
| Production Microphone | Production Line Microphone for Consumer Electronic Products |

### New items — in the brief, absent from the nav

The GRAS group grows from 5 items to 7:

- Car Buzz, Squeak and Rattle Noise Testing
- Automotive Wind Noise Testing

Adding these changes the Products totals from **23 items** to **25**, and the whole nav from
50 to 52.

---

## 4. Every Products submenu link is still `href: "#"`

None of the 25 destination pages exist as routes. `nav-links.ts` builds every submenu entry
through a helper that hardcodes `"#"`. The slugs in each document's frontmatter are ready to
map onto real paths when those routes are built.

---

## 5. One Audio Precision item is PDF-only

`Automotive Entertainment Test and Equipment` is the only Audio Precision item with no URL
in the brief. Its content comes from the supplied application note, which is explicitly the
*first in a series* and focuses on amplifiers only. If the published page needs to cover
head units, in-cabin acoustics or perceptual testing (PESQ, POLQA, ABC-MRT) in depth, more
source material is needed.
