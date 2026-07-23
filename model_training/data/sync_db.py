import csv
import json
import os
import random

csv_file = "indonesia_otc_medicines.csv"
json_file = "medicines_primary.json"

# Set of realistic medical images from Unsplash (since we don't have a live API to scrape 500 real Indonesian product boxes)
images = {
    "Nyeri & Demam": [
        "https://images.unsplash.com/photo-1584308666744-24d5e4a8360f?w=400&q=80", # blister pack
        "https://images.unsplash.com/photo-1585435557343-3b092031a831?w=400&q=80", # pills
        "https://images.unsplash.com/photo-1628771065518-0d82f1938462?w=400&q=80"  # pills on blue
    ],
    "Obat Batuk": [
        "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=400&q=80", # syrup bottle
        "https://images.unsplash.com/photo-1583947581924-860bda6a5a83?w=400&q=80"  # liquid medicine
    ],
    "Flu & Pilek": [
        "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=400&q=80", # pills blister
        "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400&q=80"  # capsules
    ],
    "Lambung": [
        "https://images.unsplash.com/photo-1550572017-edb30d35e1a1?w=400&q=80", # round tablets
        "https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=400&q=80"  # white pills
    ],
    "Vitamin": [
        "https://images.unsplash.com/photo-1577401239170-897942555fb3?w=400&q=80", # supplements bottle
        "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=400&q=80", # amber bottle
        "https://images.unsplash.com/photo-1550572017-edb30d35e1a1?w=400&q=80"  # vitamins
    ],
    "Pencernaan": [
        "https://images.unsplash.com/photo-1628771065518-0d82f1938462?w=400&q=80",
        "https://images.unsplash.com/photo-1585435557343-3b092031a831?w=400&q=80"
    ]
}

medicines = []
if os.path.exists(csv_file):
    with open(csv_file, mode="r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            category = row.get("category", "Lainnya")
            img_list = images.get(category, images["Nyeri & Demam"])
            
            med = {
                "name": row.get("name", ""),
                "kategori_id": [category],
                "composition": row.get("composition", ""),
                "uses": row.get("uses", ""),
                "side_effects": row.get("side_effects", ""),
                "manufacturer": row.get("manufacturer", "Generic"),
                "image_url": random.choice(img_list)
            }
            medicines.append(med)

with open(json_file, mode="w", encoding="utf-8") as f:
    json.dump({"medicines": medicines}, f, indent=4)

print(f"Exported {len(medicines)} medicines to {json_file}")
