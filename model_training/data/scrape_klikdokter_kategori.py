"""
scrape_klikdokter_kategori.py  (v2)
=====================================
Scraper berdasarkan kategori KlikDokter.
Cara: scrape listing A-Z, tapi FILTER hanya obat yang URL-nya sesuai kategori target.
Ini memastikan obat yang diambil benar-benar masuk kategori yang dimaksud.

Cara pakai:
  python scrape_klikdokter_kategori.py
"""

import requests
import json
import csv
import time
import re
import random
from pathlib import Path

BASE_DIR    = Path(__file__).parent
CSV_OUTPUT  = BASE_DIR / "klikdokter_kategori.csv"
JSON_OUTPUT = BASE_DIR / "klikdokter_kategori_raw.json"

DELAY_LIST   = 1.0   # jeda antar halaman
DELAY_DETAIL = 0.8   # jeda antar detail
TARGET_PER_CAT = 30  # obat per kategori

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Accept-Language": "id-ID,id;q=0.9",
    "Referer": "https://www.klikdokter.com/obat",
}

# Kategori: (slug_url_klikdokter, nama_apotek)
CATEGORIES = [
    ("obat-antinyeri",                 "Nyeri & Demam"),
    ("obat-batuk-pilek-dan-flu",       "Flu & Pilek"),
    ("obat-batuk",                     "Obat Batuk"),
    ("obat-gangguan-pencernaan",       "Lambung & Maag"),
    ("obat-alergi",                    "Alergi & Gatal"),
    ("obat-kulit",                     "Antijamur & Kulit"),
    ("vitamin-dan-suplemen-dewasa",    "Suplemen"),
    ("vitamin-dan-suplemen-anak",      "Suplemen"),
    ("obat-herbal",                    "Herbal & Tradisional"),
    ("obat-mata",                      "Mata & Telinga"),
    ("obat-telinga",                   "Mata & Telinga"),
    ("obat-mulut",                     "Mulut & Tenggorokan"),
    ("obat-hidung",                    "Perawatan Hidung & Pernapasan"),
    ("perawatan-kulit-dan-tubuh",      "Obat Kulit & Luka"),
    ("gangguan-tulang-otot-dan-sendi", "Nyeri & Demam"),
]

PRICE_RANGE = {
    "Nyeri & Demam":                   (5_000,  45_000),
    "Flu & Pilek":                     (8_000,  55_000),
    "Obat Batuk":                      (8_000,  50_000),
    "Lambung & Maag":                  (10_000, 65_000),
    "Alergi & Gatal":                  (10_000, 55_000),
    "Antijamur & Kulit":               (12_000, 75_000),
    "Suplemen":                        (15_000, 125_000),
    "Herbal & Tradisional":            (8_000,  45_000),
    "Mata & Telinga":                  (12_000, 60_000),
    "Mulut & Tenggorokan":             (10_000, 45_000),
    "Perawatan Hidung & Pernapasan":   (10_000, 55_000),
    "Obat Kulit & Luka":               (10_000, 60_000),
}

SYMPTOM_KW = {
    "Nyeri & Demam":    "nyeri; demam; sakit kepala; pegal; ngilu",
    "Flu & Pilek":      "flu; pilek; hidung tersumbat; bersin; demam",
    "Obat Batuk":       "batuk; berdahak; batuk kering; tenggorokan",
    "Lambung & Maag":   "maag; asam lambung; mual; perut kembung; nyeri lambung",
    "Alergi & Gatal":   "alergi; gatal; biduran; bersin; ruam",
    "Antijamur & Kulit":"kulit; jamur; gatal kulit; infeksi kulit; eksim",
    "Suplemen":         "vitamin; suplemen; imun; daya tahan; energi; stamina",
    "Herbal & Tradisional": "herbal; tradisional; stamina; alami",
    "Mata & Telinga":   "mata; telinga; iritasi mata; infeksi mata",
    "Mulut & Tenggorokan": "sariawan; sakit tenggorokan; mulut; gusi",
    "Perawatan Hidung & Pernapasan": "hidung; pernapasan; sesak; sinusitis",
    "Obat Kulit & Luka": "luka; kulit; antiseptik; bekas luka; jerawat",
}


def fetch_listing_page(letter: str, page: int) -> list[dict]:
    """Ambil listing obat dari halaman A-Z"""
    try:
        resp = requests.get(
            "https://www.klikdokter.com/obat",
            params={"letter": letter, "page": page},
            headers={**HEADERS, "Accept": "text/html"},
            timeout=20
        )
        if resp.status_code != 200:
            return []

        html = resp.text
        m = re.search(
            r'<script id="__NEXT_DATA__" type="application/json">(.*?)</script>',
            html, re.DOTALL)
        if not m:
            return []

        data = json.loads(m.group(1))
        queries = (data.get("props", {})
                       .get("pageProps", {})
                       .get("dehydratedState", {})
                       .get("queries", []))
        for q in queries:
            records = (q.get("state", {})
                        .get("data", {})
                        .get("data", {})
                        .get("records", []))
            if records:
                return records
        return []
    except Exception as e:
        print(f"  [!] Listing error {letter}p{page}: {e}")
        return []


def fetch_detail(url_path: str) -> dict:
    """Ambil detail 1 halaman obat"""
    try:
        resp = requests.get(
            f"https://www.klikdokter.com/obat/{url_path}",
            headers={**HEADERS, "Accept": "text/html"},
            timeout=20
        )
        if resp.status_code != 200:
            return {}

        html = resp.text
        m = re.search(
            r'<script id="__NEXT_DATA__" type="application/json">(.*?)</script>',
            html, re.DOTALL)
        if not m:
            return {}

        try:
            data = json.loads(m.group(1))
        except json.JSONDecodeError:
            return {}

        queries = (data.get("props", {})
                       .get("pageProps", {})
                       .get("dehydratedState", {})
                       .get("queries", []))
        for q in queries:
            record = q.get("state", {}).get("data", {}).get("data", {})
            if isinstance(record, dict) and record.get("title"):
                return record
        return {}
    except Exception:
        return {}


def clean(text: str, maxlen: int = 350) -> str:
    if not text:
        return ""
    text = re.sub(r'<[^>]+>', '', str(text))
    text = re.sub(r'&amp;', '&', text)
    text = re.sub(r'&[a-z]+;', '', text)
    text = ' '.join(text.split())
    # Buang jika masih ada JSON artifacts
    if any(x in text for x in ['{"meta"', '""meta_', 'data-next-head', '\\u00']):
        return ""
    return text[:maxlen]


def main():
    # Build target set per kategori
    cat_targets = {slug: name for slug, name in CATEGORIES}
    # Track per kategori
    cat_collected = {slug: 0 for slug, _ in CATEGORIES}
    cat_done = set()

    all_medicines = []
    seen_names = set()

    print("=" * 60)
    print("  KLIKDOKTER - SCRAPER BERDASARKAN KATEGORI (v2)")
    print(f"  Kategori  : {len(CATEGORIES)}")
    print(f"  Target/kat: {TARGET_PER_CAT}")
    print("=" * 60)

    LETTERS = list("ABCDEFGHIJKLMNOPQRSTUVWXYZ")

    try:
        for letter in LETTERS:
            # Cek apakah semua kategori sudah terpenuhi
            remaining = {s for s in cat_targets if s not in cat_done}
            if not remaining:
                print("\n[DONE] Semua kategori sudah terpenuhi!")
                break

            for page in range(1, 20):
                remaining = {s for s in cat_targets if s not in cat_done}
                if not remaining:
                    break

                records = fetch_listing_page(letter, page)
                if not records:
                    break

                for rec in records:
                    name     = rec.get("title", "").strip()
                    url_path = rec.get("url", "")
                    short    = clean(rec.get("short_desc", ""))
                    thumb    = rec.get("thumbnail_url", "")

                    if not name or not url_path:
                        continue
                    if name.lower() in seen_names:
                        continue

                    # Cari slug kategori dari URL path
                    # url format: "obat-antinyeri/nama-obat"
                    cat_slug = url_path.split("/")[0] if "/" in url_path else ""
                    if cat_slug not in cat_targets:
                        continue
                    if cat_slug in cat_done:
                        continue
                    if cat_collected[cat_slug] >= TARGET_PER_CAT:
                        cat_done.add(cat_slug)
                        continue

                    cat_name = cat_targets[cat_slug]

                    # Fetch detail
                    detail = fetch_detail(url_path)
                    time.sleep(DELAY_DETAIL)

                    uses = clean(
                        detail.get("uses") or detail.get("manfaat") or
                        detail.get("kegunaan") or detail.get("short_desc") or short
                    ) or short or name

                    comp = clean(detail.get("composition") or detail.get("komposisi") or "")
                    side = clean(detail.get("side_effects") or detail.get("efek_samping") or "Konsultasikan dengan dokter") or "Konsultasikan dengan dokter"
                    mfg  = clean(detail.get("manufacturer") or detail.get("produsen") or "")
                    if not thumb:
                        thumb = detail.get("thumbnail_url", "")

                    seen_names.add(name.lower())
                    cat_collected[cat_slug] += 1

                    low, high = PRICE_RANGE.get(cat_name, (10_000, 50_000))
                    price = random.randint(low // 500, high // 500) * 500

                    all_medicines.append({
                        "name":        name,
                        "composition": comp or "-",
                        "uses":        uses,
                        "side_effects": side,
                        "category":    cat_name,
                        "manufacturer": mfg,
                        "requires_prescription": "False",
                        "is_otc":      "True",
                        "symptom_keywords": SYMPTOM_KW.get(cat_name, ""),
                        "recommendation_note": "Sumber: KlikDokter",
                        "price":       price,
                        "stock":       random.randint(80, 190),
                        "image_url":   thumb,
                        "source_url":  f"https://www.klikdokter.com/obat/{url_path}",
                    })

                    print(f"  [{cat_name[:25]:<25}] {name[:35]:<35} ({cat_collected[cat_slug]}/{TARGET_PER_CAT})")

                time.sleep(DELAY_LIST)

            # Ringkasan per huruf
            collected_now = sum(cat_collected.values())
            done_cats = len(cat_done)
            print(f"\n[{letter}] Total: {collected_now} obat | {done_cats}/{len(CATEGORIES)} kategori selesai")

    except KeyboardInterrupt:
        print(f"\n[STOP] Dihentikan. {len(all_medicines)} obat terkumpul.")

    print(f"\n[INFO] Total: {len(all_medicines)} obat dari {len(set(m['category'] for m in all_medicines))} kategori")

    # Simpan
    fieldnames = ["name","composition","uses","side_effects","category",
                  "manufacturer","requires_prescription","is_otc",
                  "symptom_keywords","recommendation_note","price","stock",
                  "image_url","source_url"]
    with open(CSV_OUTPUT, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        for m in all_medicines:
            writer.writerow({k: m.get(k,"") for k in fieldnames})

    with open(JSON_OUTPUT, "w", encoding="utf-8") as f:
        json.dump(all_medicines, f, ensure_ascii=False, indent=2)

    print(f"[SELESAI] {len(all_medicines)} obat tersimpan ke {CSV_OUTPUT.name}")
    print(f"\nSelanjutnya: python merge_klikdokter.py")


if __name__ == "__main__":
    main()
