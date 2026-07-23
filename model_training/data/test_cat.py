import requests, re, json

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Accept-Language": "id-ID,id;q=0.9",
}

# Test 1: category page listing
resp = requests.get(
    "https://www.klikdokter.com/obat",
    params={"category": "obat-antinyeri", "page": 1},
    headers=HEADERS, timeout=15
)
print("Status:", resp.status_code)
html = resp.text

# Cari records dalam NEXT_DATA
idx = html.find("__NEXT_DATA__")
if idx >= 0:
    raw_start = html.find("{", idx)
    # Ambil JSON
    depth = 0
    end = raw_start
    for i, c in enumerate(html[raw_start:raw_start+200000], raw_start):
        if c == "{": depth += 1
        elif c == "}":
            depth -= 1
            if depth == 0:
                end = i + 1
                break
    try:
        d = json.loads(html[raw_start:end])
        queries = d.get("props",{}).get("pageProps",{}).get("dehydratedState",{}).get("queries",[])
        print("Queries:", len(queries))
        for q in queries:
            recs = q.get("state",{}).get("data",{}).get("data",{}).get("records",[])
            if recs:
                print("FOUND! Records:", len(recs))
                print("First:", recs[0].get("title"))
                break
        else:
            print("No records in queries")
            # Coba data lain
            for q in queries:
                d2 = q.get("state",{}).get("data",{})
                if isinstance(d2, dict) and d2:
                    print("Query keys:", list(d2.keys())[:5])
    except Exception as e:
        print("Parse error:", e)
