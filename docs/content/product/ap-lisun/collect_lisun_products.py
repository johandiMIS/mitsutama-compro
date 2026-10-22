"""Rebuilds lisun_source.json: for each Lisun page, the standards it covers and, per standard, the products
(linked from Lisun's clause tables) with the clauses each one is used for, plus a photo and name per product.

Run:  python docs/content/product/ap-lisun/collect_lisun_products.py   (fetches Lisun's pages)
Then: python docs/content/product/ap-lisun/prepare_media.py  ->  upload_media.mjs  ->  build_pages.py
"""
import html
import json
import os
import re
import urllib.request
from concurrent.futures import ThreadPoolExecutor

HERE = os.path.dirname(os.path.abspath(__file__))
PAGES = {
    "luminaire-test-and-equipment": "https://www.lisungroup.com/applications/leds-and-luminaire-test-solutions.html",
    "home-appliance-test-and-equipment": "https://www.lisungroup.com/applications/household-applicances-test-solutions.html",
    "cable-and-wire-test-and-equipment": "https://www.lisungroup.com/applications/cable-and-wire-test-solutions.html",
}


def get(url):
    return urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"}), timeout=60).read().decode("utf8", "ignore")


def clean(s):
    return html.unescape(re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", s))).strip()


def key(s):
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")


catalog = {}  # product url -> {model, desc, image}
raw = {}
for slug, url in PAGES.items():
    h = get(url)
    raw[slug] = h
    for m in re.finditer(r'\{"link":"([^"]+)","image":"([^"]+)","model":"([^"]+)","desc":"([^"]*)"\}', h.replace("\\/", "/")):
        link, image, model, desc = m.groups()
        catalog.setdefault(link, {"model": model.strip(), "desc": json.loads('"' + desc + '"'), "image": image.replace("-100x100", "")})

out = {}
need = set()
for slug, h in raw.items():
    intro = [clean(p) for p in re.findall(r"<p[^>]*>([\s\S]*?)</p>", re.sub(r"<(script|style)[\s\S]*?</\1>", "", h)) if "LISUN" in clean(p) and len(clean(p)) > 120][:3]
    standards = []
    for m in re.finditer(r"<p[^>]*>\s*(?:<[^>]+>\s*)*Part\s*\d+[\s\S]*?</p>", h):
        title = re.sub(r"^Part\s*\d+\s*", "", clean(m.group(0)))
        t = re.search(r"<table[\s\S]*?</table>", h[m.end():m.end() + 200000])
        products = {}  # url -> [clauses]
        unlinked = []
        for tr in re.findall(r"<tr[\s\S]*?</tr>", t.group(0) if t else ""):
            cells = re.findall(r"<t[dh][^>]*>([\s\S]*?)</t[dh]>", tr)
            if len(cells) < 2:
                continue
            clause = clean(cells[0])
            if not clause or re.search(r"Clause and Subject|LISUN Model", clause + clean(cells[-1]), re.I):
                continue
            links = re.findall(r'<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)</a>', cells[-1])
            if not links:
                unlinked.append((clause, clean(cells[-1])))
            for href, text in links:
                href = href.split("#")[0]
                products.setdefault(href, {"text": clean(text), "clauses": []})["clauses"].append(clause)
                need.add(href)
        standards.append({"title": title, "products": products, "unlinked": unlinked})
    featured = []  # the page's own product list (photo + name), shown on Lisun below the tables
    start = h.find('class="out_wrap product_info"')
    for m in re.finditer(r'<div class="list">([\s\S]*?)</h3>', h[start:start + 60000] if start > -1 else ""):
        seg = m.group(1)
        img = re.search(r'data-src="([^"]+)"', seg)
        name = re.search(r"<h3>([\s\S]*)$", seg)
        link = re.search(r'href="([^"]+)"', seg)
        if img and name and link and "-100x100" not in img.group(1):
            featured.append({"link": link.group(1).split("#")[0], "name": clean(name.group(1)), "image": img.group(1)})
    out[slug] = {"intro": intro, "standards": standards, "featured": featured}

# photo + name for products the catalogue does not list: read their own product page
missing = [u for u in need if u not in catalog]


def page_info(url):
    try:
        h = get(url)
    except Exception as e:
        return url, None
    og = re.search(r'property="og:image"\s+content="([^"]+)"', h)
    title = re.search(r"<h1[^>]*>([\s\S]*?)</h1>", h)
    # Lisun names its product photos "<model>_AL<n>"; the og:image is sometimes a certificate or a chart
    photos = [u for u in dict.fromkeys(re.findall(r"https://www\.lisungroup\.com/wp-content/uploads/[^\"'\s]+_AL[^\"'\s/]*?\.(?:jpg|png)", h))
              if not re.search(r"-\d+x\d+\.", u)]
    # the og:image is usually a secondary shot (software screen, chart); the main photo is the other _AL image
    main = [u for u in photos if not og or u != og.group(1)]
    image = (main or photos or [og.group(1) if og else ""])[0]
    return url, {"model": "", "desc": clean(title.group(1)) if title else "", "image": image}


with ThreadPoolExecutor(8) as ex:
    for url, info in ex.map(page_info, missing):
        if info:
            catalog[url] = info

products = {}
for url in need:
    info = catalog.get(url)
    if not info:
        continue
    model = info["model"] or ""
    products[url] = {**info, "key": "lisun-" + key(model or url.rsplit("/", 1)[-1].replace(".html", ""))[:50]}

for v in out.values():
    for f in v["featured"]:
        model = f["name"].split(" ")[0]
        f["key"] = "lisun-" + key(model)[:50]
        if f["link"] not in products:
            products[f["link"]] = {"model": model, "desc": f["name"][len(model):].strip(), "image": f["image"], "key": f["key"]}
json.dump({"pages": out, "products": products}, open(os.path.join(HERE, "lisun_source.json"), "w", encoding="utf-8"), indent=1, ensure_ascii=False)
images = json.load(open(os.path.join(HERE, "images.json"), encoding="utf-8"))
for p in products.values():
    if p["image"]:
        images[p["key"]] = p["image"]
json.dump(images, open(os.path.join(HERE, "images.json"), "w", encoding="utf-8"), indent=1)
print("products", len(products), "| without image", [u for u, p in products.items() if not p["image"]])
for slug, v in out.items():
    print(slug, [(s["title"][:30], len(s["products"]), len(s["unlinked"])) for s in v["standards"]])
