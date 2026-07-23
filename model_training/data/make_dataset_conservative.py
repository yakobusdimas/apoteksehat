import csv
import json
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parent
CSV_PATH = DATA_DIR / "indonesia_otc_medicines.csv"
JSON_PATH = DATA_DIR / "medicines_primary.json"

HEADER = [
    "name", "composition", "uses", "side_effects", "category", "manufacturer",
    "requires_prescription", "is_otc", "symptom_keywords", "recommendation_note", "image_url"
]

# Conservative replacements for vague / non-specific compositions.
COMPOSITION_FIXES = {
    "decolsin": "Paracetamol; Phenylpropanolamine HCl; Chlorpheniramine Maleate; Dextromethorphan HBr",
    "laserin": "Ekstrak Jahe; Ekstrak Daun Sirih; Ekstrak Kayu Manis; Madu",
    "komix herbal": "Ekstrak Jahe; Madu; Ekstrak Licorice",
    "herbakof": "Ekstrak Daun Legundi; Ekstrak Jahe; Ekstrak Saga; Ekstrak Mahkota Dewa",
    "kuldon": "Ekstrak herbal; Glycyrrhizae radix; Menthae folium",
    "tolak angin": "Ekstrak Jahe; Ekstrak Daun Mint; Ekstrak Adas; Madu",
    "antangin": "Ekstrak Jahe; Panax Ginseng; Royal Jelly; Madu",
    "bejo jahe merah": "Ekstrak Jahe Merah; Ekstrak Herbal; Madu",
    "balsem lang": "Menthol; Camphor; Eucalyptus Oil; Methyl Salicylate",
    "transpulmin baby": "Eucalyptus Oil; Chamomile Oil; Herbal Oil",
    "otopain": "Phenazone; Lidocaine HCl",
    "mebo": "Herbal burn ointment; Sesame Oil; Beeswax",
}

# Items containing these ingredients should not be treated as pure OTC recommendations.
RESTRICTED_INGREDIENTS = [
    "metampyrone",
    "neomycin",
    "silver sulfadiazine",
    "framycetin",
    "loperamide",
    "permethrin",
    "phenazone",
    "lidocaine",
    "phenylpropanolamine",
    "pseudoephedrine",
    "ephedrine",
]

RESTRICTED_NAME_PARTS = [
    "neuralgin rx",
    "bioplacenton",
    "burnazin",
    "sofra-tulle",
    "lodia",
    "scabimite",
    "otopain",
]

BASE_NOTES = {
    "restricted": "Gunakan hanya sesuai aturan pakai/anjuran tenaga kesehatan. Jangan dipakai jangka panjang tanpa konsultasi.",
    "external": "Untuk pemakaian luar. Hindari mata, mulut, dan luka luas kecuali sesuai petunjuk produk.",
}

EXTERNAL_CATEGORIES = {"Obat Kulit & Luka", "Antijamur & Kulit", "Obat Oles Nyeri"}


def fix_composition(name: str, composition: str) -> tuple[str, bool]:
    lower_name = name.lower()
    lower_comp = composition.lower().strip()
    if lower_comp in {"kombinasi flu dan batuk", "herbal extract", "ekstrak herbal"} or "combination" in lower_comp:
        for key, fixed in COMPOSITION_FIXES.items():
            if key in lower_name:
                return fixed, True
    for key, fixed in COMPOSITION_FIXES.items():
        if key in lower_name and (not composition.strip() or composition.lower() in {"herbal extract", "ekstrak herbal"}):
            return fixed, True
    return composition, False


def is_restricted(name: str, composition: str) -> bool:
    text = f"{name} {composition}".lower()
    return any(x in text for x in RESTRICTED_INGREDIENTS) or any(x in text for x in RESTRICTED_NAME_PARTS)


def conservative_note(row: dict, restricted: bool, fixed: bool) -> str:
    note = (row.get("recommendation_note") or "").strip()
    additions = []
    if fixed:
        additions.append("Komposisi telah dibuat lebih spesifik untuk kebutuhan dataset; tetap verifikasi label produk sebelum penggunaan nyata.")
    if restricted:
        additions.append(BASE_NOTES["restricted"])
    if row.get("category") in EXTERNAL_CATEGORIES:
        additions.append(BASE_NOTES["external"])
    for addition in additions:
        if addition not in note:
            note = f"{note} {addition}".strip()
    return note


def main():
    with CSV_PATH.open("r", encoding="utf-8", newline="") as f:
        reader = csv.DictReader(f)
        rows = list(reader)

    cleaned = []
    seen = set()
    fixed_count = 0
    restricted_count = 0

    for row in rows:
        name = (row.get("name") or "").strip()
        if not name or name.lower() in seen:
            continue
        seen.add(name.lower())

        composition, fixed = fix_composition(name, row.get("composition", ""))
        restricted = is_restricted(name, composition)
        if fixed:
            fixed_count += 1
        if restricted:
            restricted_count += 1

        out = {key: (row.get(key) or "").strip() for key in HEADER}
        out["name"] = name
        out["composition"] = composition
        out["requires_prescription"] = "true" if restricted else "false"
        out["is_otc"] = "false" if restricted else "true"
        out["recommendation_note"] = conservative_note(out, restricted, fixed)
        out["image_url"] = ""
        cleaned.append(out)

    with CSV_PATH.open("w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=HEADER)
        writer.writeheader()
        writer.writerows(cleaned)

    medicines = [
        {
            "name": row["name"],
            "kategori_id": [row["category"]],
            "composition": row["composition"],
            "uses": row["uses"],
            "side_effects": row["side_effects"],
            "manufacturer": row["manufacturer"],
            "image_url": row["image_url"],
            "requires_prescription": row["requires_prescription"] == "true",
            "is_otc": row["is_otc"] == "true",
        }
        for row in cleaned
    ]
    JSON_PATH.write_text(json.dumps({"medicines": medicines}, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"rows={len(cleaned)}")
    print(f"fixed_compositions={fixed_count}")
    print(f"restricted_marked={restricted_count}")
    print(f"csv={CSV_PATH}")
    print(f"json={JSON_PATH}")


if __name__ == "__main__":
    main()
