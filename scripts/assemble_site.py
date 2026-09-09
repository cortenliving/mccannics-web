#!/usr/bin/env python3
"""Assemble site HTML/JS/CSS from _site_chunks base64 parts (manifest-driven)."""
from pathlib import Path
import base64, json

root = Path(__file__).resolve().parents[1]
chunks = root / "_site_chunks"
if not chunks.exists():
    print("No _site_chunks")
    raise SystemExit(0)

manifest_path = chunks / "manifest.json"
if manifest_path.exists():
    manifest = json.loads(manifest_path.read_text())
    for entry in manifest:
        key = entry["key"]
        dest = entry["dest"]
        n = int(entry["parts"])
        parts = [chunks / f"{key}.b64.part{i:02d}" for i in range(1, n + 1)]
        missing = [str(p) for p in parts if not p.exists()]
        if missing:
            print("skip incomplete", key, missing)
            continue
        b64 = "".join(p.read_text().strip() for p in parts)
        data = base64.b64decode(b64)
        out = root / dest
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_bytes(data)
        print(f"Wrote {dest} ({len(data)} bytes) from {n} parts")
else:
    # fallback legacy
    groups = {}
    for p in sorted(chunks.glob("*.b64.part*")):
        key = p.name.rsplit(".b64.part", 1)[0]
        groups.setdefault(key, []).append(p)
    mapping = {
        "index.html": "index.html",
        "hire__index.html": "hire/index.html",
        "shop__index.html": "shop/index.html",
        "services__index.html": "services/index.html",
        "contact__index.html": "contact/index.html",
        "about__index.html": "about/index.html",
        "solar__index.html": "solar/index.html",
        "solar__solar.js": "solar/solar.js",
        "styles.css": "styles.css",
        "README.md": "README.md",
        "site.js": "site.js",
    }
    for key, parts in groups.items():
        dest = mapping.get(key)
        if not dest:
            print("skip unknown", key)
            continue
        b64 = "".join(p.read_text().strip() for p in parts)
        data = base64.b64decode(b64)
        out = root / dest
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_bytes(data)
        print(f"Wrote {dest} ({len(data)} bytes) from {len(parts)} parts")
