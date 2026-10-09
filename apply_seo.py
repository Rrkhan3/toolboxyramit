#!/usr/bin/env python3
"""
Apply SEO titles, meta descriptions and H1s from all_tools_seo.csv
to the corresponding tools/*.html files.

Usage:
  1. Put this script in the root of the toolboxyramit repo
  2. Make sure seo_pack/seo_templates/all_tools_seo.csv exists
  3. Run: python apply_seo.py
"""
import csv
import os
import re
from pathlib import Path

CSV_PATH = Path("seo_pack/seo_templates/all_tools_seo.csv")
TOOLS_DIR = Path("tools")

def slugify(name: str) -> str:
    # Map tool name to filename used in repo
    mapping = {
        "Age Calculator": "age-calculator.html",
        "Average Calculator": "average-calculator.html",
        "BMI Calculator": "bmi-calculator.html",
        "Compound Interest Calculator": "compound-interest-calculator.html",
        "Date Difference Calculator": "date-difference.html",
        "Discount Calculator": "discount-calculator.html",
        "EMI Calculator": "emi-calculator.html",
        "Percentage Calculator": "percentage-calculator.html",
        "Simple Interest Calculator": "simple-interest-calculator.html",
        "Time Calculator": "time-calculator.html",
        "Case Converter": "case-converter.html",
        "Character Counter": "character-counter.html",
        "Remove Duplicate Lines": "remove-duplicate-lines.html",
        "Slug Generator": "slug-generator.html",
        "Text Cleaner": "text-cleaner.html",
        "Text Reverser": "text-reverser.html",
        "Text Sorter": "text-sorter.html",
        "Whitespace Remover": "whitespace-remover.html",
        "Word Counter": "word-counter.html",
        "HEIC to JPG Converter": "heic-to-jpg.html",
        "Image Compressor": "image-compressor.html",
        "Image Cropper": "image-cropper.html",
        "Image Metadata Remover": "image-metadata-remover.html",
        "Image Resizer": "image-resizer.html",
        "Image Resolution Changer": "image-resolution-changer.html",
        "Image to Base64 Converter": "image-to-base64.html",
        "JPG to PNG Converter": "jpg-to-png.html",
        "JPG to WebP Converter": "jpg-to-webp.html",
        "PNG to JPG Converter": "png-to-jpg.html",
        "PNG to WebP Converter": "png-to-webp.html",
        "WebP to JPG Converter": "webp-to-jpg.html",
        "Base64 Decoder": "base64-decoder.html",
        "Base64 Encoder": "base64-encoder.html",
        "Color Picker & Converter": "color-picker.html",
        "CSS Formatter": "css-formatter.html",
        "CSS Minifier": "css-minifier.html",
        "CSV to JSON Converter": "csv-to-json.html",
        "HTML Formatter": "html-formatter.html",
        "HTML Minifier": "html-minifier.html",
        "HTML to Markdown Converter": "html-to-markdown.html",
        "JavaScript Formatter": "js-formatter.html",
        "JavaScript Minifier": "js-minifier.html",
        "JSON Formatter": "json-formatter.html",
        "JSON to CSV Converter": "json-to-csv.html",
        "JSON to YAML Converter": "json-to-yaml.html",
        "JSON Validator": "json-validator.html",
        "JWT Decoder": "jwt-decoder.html",
        "Markdown to HTML Converter": "markdown-to-html.html",
        "Text to ASCII Converter": "text-to-ascii.html",
        "URL Decoder": "url-decoder.html",
        "URL Encoder": "url-encoder.html",
        "UTM URL Builder": "utm-builder.html",
        "UUID Generator": "uuid-generator.html",
        "YAML to JSON Converter": "yaml-to-json.html",
        "Area Converter": "area-converter.html",
        "Data Storage Converter": "data-storage-converter.html",
        "Length Converter": "length-converter.html",
        "Speed Converter": "speed-converter.html",
        "Temperature Converter": "temperature-converter.html",
        "Time Converter": "time-converter.html",
        "Volume Converter": "volume-converter.html",
        "Weight Converter": "weight-converter.html",
        "Barcode Generator": "barcode-generator.html",
        "Lorem Ipsum Generator": "lorem-ipsum-generator.html",
        "Password Generator": "password-generator.html",
        "QR Generator": "qr-generator.html",
        "Random Number Generator": "random-number-generator.html",
        "Image to PDF Converter": "image-to-pdf.html",
        "JPG to PDF Converter": "jpg-to-pdf.html",
        "PDF Compressor": "pdf-compressor.html",
        "PDF Merger": "pdf-merger.html",
        "PDF Page Extractor": "pdf-page-extractor.html",
        "PDF Page Reorder": "pdf-page-reorder.html",
        "PDF Rotate": "pdf-rotate.html",
        "PDF Splitter": "pdf-splitter.html",
        "PDF to JPG Converter": "pdf-to-jpg.html",
        "PDF to Text Extractor": "pdf-to-text.html",
    }
    return mapping.get(name)

def update_file(filepath: Path, title: str, meta: str, h1: str):
    text = filepath.read_text(encoding="utf-8")
    # title
    text = re.sub(r"<title>.*?</title>", f"<title>{title}</title>", text, count=1, flags=re.DOTALL)
    # meta description
    text = re.sub(
        r'<meta name="description" content="[^"]*">',
        f'<meta name="description" content="{meta}">',
        text,
        count=1,
    )
    # og:title
    text = re.sub(
        r'<meta property="og:title" content="[^"]*">',
        f'<meta property="og:title" content="{title}">',
        text,
        count=1,
    )
    # og:description
    text = re.sub(
        r'<meta property="og:description" content="[^"]*">',
        f'<meta property="og:description" content="{meta}">',
        text,
        count=1,
    )
    # twitter:title
    text = re.sub(
        r'<meta name="twitter:title" content="[^"]*">',
        f'<meta name="twitter:title" content="{title}">',
        text,
        count=1,
    )
    # twitter:description
    text = re.sub(
        r'<meta name="twitter:description" content="[^"]*">',
        f'<meta name="twitter:description" content="{meta}">',
        text,
        count=1,
    )
    # H1
    text = re.sub(r"<h1>.*?</h1>", f"<h1>{h1}</h1>", text, count=1, flags=re.DOTALL)
    filepath.write_text(text, encoding="utf-8")
    print(f"Updated: {filepath}")

def main():
    if not CSV_PATH.exists():
        print(f"CSV not found: {CSV_PATH}")
        return
    if not TOOLS_DIR.exists():
        print(f"tools/ folder not found")
        return

    with open(CSV_PATH, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            name = row["Tool Name"].strip()
            filename = slugify(name)
            if not filename:
                print(f"Skip (no mapping): {name}")
                continue
            path = TOOLS_DIR / filename
            if not path.exists():
                print(f"File missing: {path}")
                continue
            update_file(
                path,
                row["Title Tag"].strip(),
                row["Meta Description"].strip(),
                row["H1"].strip(),
            )
    print("\nDone! Now run: git add tools/ && git commit -m 'SEO: apply optimized titles meta H1 for all tools' && git push")

if __name__ == "__main__":
    main()
