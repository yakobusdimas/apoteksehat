"""
scrape_klikdokter.py
====================
Scraper data obat dari KlikDokter menggunakan API internal mereka.

Cara pakai:
  pip install requests
  python scrape_klikdokter.py

Output:
  klikdokter_medicines.csv  -- data obat mentah dari KlikDokter

CATATAN ETIS:
- Script ini mengakses data publik dari klikdokter.com
- Diberi jeda antar request (1-2 detik) agar tidak membebani server
- Hanya untuk keperluan pendidikan/penelitian
"""

import requests
import json
import csv
import time
import re
import os
from pathlib import Path

# ── Config ─────────────────────────────────────────────────────────────
OUTPUT_DIR = Path(__file__).parent
CSV_OUTPUT = OUTPUT_DIR / "klikdokter_medicines.csv"
JSON_OUTPUT = OUTPUT_DIR / "klikdokter_raw.json"

DELAY_LIST = 1.2        # Detik jeda antar halaman listing
DELAY_DETAIL = 1.5      # Detik jeda antar halaman detail
FETCH_DETAILS = True    # True = ambil detail per obat (lambat tapi lengkap)
TARGET_COUNT = 500      # Berhenti setelah dapat sekian obat (0 = semua)

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8",
    "Referer": "https://www.klikdokter.com/obat",
}

LETTERS = list("ABCDEFGHIJKLMNOPQRSTUVWXYZ")

CATEGORY_MAP = {
    "obat-antinyeri": "Nyeri & Demam",
    "obat-batuk-pilek-dan-flu": "Flu & Pilek",
    "obat-batuk": "Obat Batuk",
    "obat-antibiotik": "Flu & Pilek",
    "obat-gangguan-pencernaan": "Pencernaan & Diare",
    "obat-alergi": "Alergi & Gatal",
    "obat-kulit": "Antijamur & Kulit",
    "vitamin-dan-suplemen-dewasa": "Suplemen",
    "vitamin-dan-suplemen-anak": "Suplemen",
    "obat-herbal": "Herbal & Tradisional",
    "obat-mata": "Mata & Telinga",
    "obat-telinga": "Mata & Telinga",
    "obat-hidung": "Perawatan Hidung & Pernapasan",
    "perawatan-kulit-dan-tubuh": "Antijamur & Kulit",
    "gangguan-tulang-otot-dan-sendi": "Nyeri & Demam",
    "obat-antiinflamasi": "Nyeri & Demam",
    "obat-mulut": "Mulut & Tenggorokan",
    "obat-lainnya": "Herbal & Tradisional",
    "obat-hipertensi": "Nyeri & Demam",
    "obat-diabetes": "Suplemen",
}


def scrape_list_page(letter: str, page: int) -> list[dict]:
    """Scrape daftar obat dari halaman listing A-Z"""
    try:
        url = f"https://www.klikdokter.com/obat"
        params = {"letter": letter.lower(), "page": page}
        resp = requests.get(url, params=params, headers={**HEADERS, "Accept": "text/html"}, timeout=20)

        if resp.status_code != 200:
            return []

        html = resp.text
        match = re.search(r'<script id="__NEXT_DATA__" type="application/json">(.*?)</script>', html, re.DOTALL)
        if not match:
            return []

        data = json.loads(match.group(1))
        queries = data.get("props", {}).get("pageProps", {}).get("dehydratedState", {}).get("queries", [])

        for q in queries:
            records = q.get("state", {}).get("data", {}).get("data", {}).get("records", [])
            if records:
                return records
        return []

    except Exception as e:
        print(f"  [!] Error listing {letter} p{page}: {e}")
        return []


def scrape_detail(url_path: str) -> dict:
    """Scrape detail satu halaman obat"""
    try:
        url = f"https://www.klikdokter.com/obat/{url_path}"
        resp = requests.get(url, headers={**HEADERS, "Accept": "text/html"}, timeout=20)

        if resp.status_code != 200:
            return {}

        html = resp.text
        match = re.search(r'<script id="__NEXT_DATA__" type="application/json">(.*?)</script>', html, re.DOTALL)
        if not match:
            return {}

        try:
            data = json.loads(match.group(1))
        except json.JSONDecodeError:
            return {}

        queries = data.get("props", {}).get("pageProps", {}).get("dehydratedState", {}).get("queries", [])

        for q in queries:
            qdata = q.get("state", {}).get("data", {})
            if isinstance(qdata, dict):
                record = qdata.get("data", {})
                if isinstance(record, dict) and record.get("title"):
                    return record

        # Fallback: extract dari text HTML
        result = {}
        for label, key in [
            ("Golongan", "golongan"), ("Kategori", "kategori"),
            ("Manfaat", "manfaat"), ("Komposisi", "komposisi"),
            ("Dikonsumsi oleh", "dikonsumsi_oleh"),
        ]:
            pattern = rf"{label}\s*\n?\s*([^\n<]{{5,300}})"
            m = re.search(pattern, html)
            if m:
                result[key] = m.group(1).strip()
        return result

    except Exception as e:
        print(f"  [!] Detail error {url_path}: {e}")
        return {}


def clean(text: str, maxlen: int = 300) -> str:
    if not text:
        return ""
    text = re.sub(r'<[^>]+>', '', str(text))
    text = ' '.join(text.split())
    return text[:maxlen]


def map_category(url: str) -> str:
    for key, val in CATEGORY_MAP.items():
        if key in url:
            return val
    return "Herbal & Tradisional"


def extract_keywords(text: str) -> str:
    SYMPTOMS = [
        "demam", "panas", "sakit kepala", "pusing", "batuk", "pilek", "flu",
        "alergi", "gatal", "mual", "muntah", "diare", "maag", "lambung",
        "nyeri", "infeksi", "luka", "jerawat", "kulit", "mata", "telinga",
        "vitamin", "suplemen", "imun", "energi", "kesemutan", "pegal",
        "sariawan", "cacingan", "anemia", "asam urat", "rematik",
    ]
    tl = text.lower()
    found = [s for s in SYMPTOMS if s in tl]
    return "; ".join(found[:5]) if found else tl[:60]


def main():
    print("=" * 60)
    print("  KLIKDOKTER MEDICINE SCRAPER")
    print(f"  Target  : {TARGET_COUNT if TARGET_COUNT else 'Semua'} obat")
    print(f"  Detail  : {'Ya (lambat)' if FETCH_DETAILS else 'Tidak (cepat)'}")
    print("  Hentikan: Ctrl+C (data tersimpan otomatis)")
    print("=" * 60)

    all_medicines = []
    seen_names = set()

    try:
        for letter in LETTERS:
            if TARGET_COUNT and len(all_medicines) >= TARGET_COUNT:
                break

            print(f"\n[{letter}] Mencari obat...")
            empty_pages = 0

            for page in range(1, 20):
                if TARGET_COUNT and len(all_medicines) >= TARGET_COUNT:
                    break

                records = scrape_list_page(letter, page)

                if not records:
                    empty_pages += 1
                    if empty_pages >= 2:
                        break
                    time.sleep(DELAY_LIST)
                    continue

                empty_pages = 0
                new_count = 0
                for rec in records:
                    name = rec.get("title", "").strip()
                    if not name or name.lower() in seen_names:
                        continue
                    seen_names.add(name.lower())

                    med = {
                        "name": name,
                        "slug": rec.get("slug", ""),
                        "url": rec.get("url", ""),
                        "short_desc": clean(rec.get("short_desc", "")),
                        "thumbnail": rec.get("thumbnail_url", ""),
                        "category_url": rec.get("url", "").split("/")[0] if "/" in rec.get("url", "") else "",
                        # Detail fields (diisi nanti)
                        "composition": "",
                        "uses": "",
                        "side_effects": "",
                        "manufacturer": "",
                    }
                    all_medicines.append(med)
                    new_count += 1

                print(f"  Hal {page}: +{new_count} baru | Total: {len(all_medicines)}")
                time.sleep(DELAY_LIST)

    except KeyboardInterrupt:
        print(f"\n[STOP] Listing dihentikan. Total listing: {len(all_medicines)}")

    # ── Fetch detail ────────────────────────────────────────────────────
    if FETCH_DETAILS and all_medicines:
        print(f"\n[DETAIL] Mengambil detail untuk {len(all_medicines)} obat...")
        print("         Tekan Ctrl+C untuk skip detail dan langsung simpan\n")
        try:
            for i, med in enumerate(all_medicines):
                if not med.get("url"):
                    continue
                print(f"  [{i+1:3d}/{len(all_medicines)}] {med['name'][:40]:<40}", end=" ", flush=True)

                detail = scrape_detail(med["url"])
                if detail:
                    med["composition"] = clean(detail.get("composition") or detail.get("komposisi") or "")
                    med["uses"] = clean(detail.get("uses") or detail.get("manfaat") or med["short_desc"])
                    med["side_effects"] = clean(detail.get("side_effects") or detail.get("efek_samping") or "Konsultasikan dengan dokter")
                    med["manufacturer"] = clean(detail.get("manufacturer") or detail.get("produsen") or "")
                    print("OK")
                else:
                    med["uses"] = med["short_desc"]
                    med["side_effects"] = "Konsultasikan dengan dokter"
                    print("-")

                time.sleep(DELAY_DETAIL)

        except KeyboardInterrupt:
            print(f"\n[STOP] Detail dihentikan di obat {i+1}. Menyimpan...")

    # ── Simpan ─────────────────────────────────────────────────────────
    save_csv(all_medicines)
    with open(JSON_OUTPUT, "w", encoding="utf-8") as f:
        json.dump(all_medicines, f, ensure_ascii=False, indent=2)

    print(f"\n[SELESAI] {len(all_medicines)} obat tersimpan ke:")
    print(f"  CSV : {CSV_OUTPUT}")
    print(f"  JSON: {JSON_OUTPUT}")
    print(f"\nSelanjutnya, import data ke dataset utama dengan:")
    print(f"  python merge_klikdokter.py")


def save_csv(medicines: list):
    fieldnames = [
        "name", "composition", "uses", "side_effects", "category",
        "manufacturer", "requires_prescription", "is_otc",
        "symptom_keywords", "recommendation_note", "price", "stock",
        "image_url", "source_url"
    ]

    with open(CSV_OUTPUT, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        for med in medicines:
            uses = med.get("uses") or med.get("short_desc", "")
            writer.writerow({
                "name": med.get("name", ""),
                "composition": med.get("composition", ""),
                "uses": uses,
                "side_effects": med.get("side_effects", "Konsultasikan dengan dokter"),
                "category": map_category(med.get("category_url", "")),
                "manufacturer": med.get("manufacturer", ""),
                "requires_prescription": "False",
                "is_otc": "True",
                "symptom_keywords": extract_keywords(uses),
                "recommendation_note": "Sumber: KlikDokter",
                "price": "",
                "stock": "",
                "image_url": med.get("thumbnail", ""),
                "source_url": f"https://www.klikdokter.com/obat/{med.get('url', '')}",
            })


if __name__ == "__main__":
    main()
