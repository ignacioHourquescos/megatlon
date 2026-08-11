"""Extract exercise thumbnails from a gym routine PDF into images/exercises/."""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

import pymupdf


def extract_images(pdf_path: Path, out_dir: Path) -> list[Path]:
    out_dir.mkdir(parents=True, exist_ok=True)
    for old in out_dir.glob("*"):
        if old.is_file():
            old.unlink()

    doc = pymupdf.open(pdf_path)
    saved: list[Path] = []

    for page_num, page in enumerate(doc):
        day = page_num + 1
        candidates: list[tuple[float, float, int, int, int]] = []
        seen: set[tuple[int, float, float]] = set()

        for im in page.get_image_info(xrefs=True):
            width, height = im["width"], im["height"]
            xref = im["xref"]
            bbox = im["bbox"]

            # Exercise thumbs are ~128px; skip logos (~100) and banners.
            if width < 120 or height < 120 or width > 400 or height > 400:
                continue

            key = (xref, round(bbox[0]), round(bbox[1]))
            if key in seen:
                continue
            seen.add(key)
            candidates.append((bbox[1], bbox[0], xref, width, height))

        candidates.sort()
        for index, (y, x, xref, width, height) in enumerate(candidates, start=1):
            pix = pymupdf.Pixmap(doc, xref)
            if pix.n - pix.alpha >= 4:
                pix = pymupdf.Pixmap(pymupdf.csRGB, pix)

            out_path = out_dir / f"d{day}-{index:02d}.png"
            pix.save(out_path.as_posix())
            saved.append(out_path)
            print(
                f"d{day}-{index:02d}.png xref={xref} "
                f"{width}x{height} @ ({x:.0f},{y:.0f})"
            )

    doc.close()
    return saved


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "pdf",
        nargs="?",
        default=r"c:\Users\ihour\Downloads\2026_08_06_073838 (1).pdf",
    )
    parser.add_argument(
        "--out",
        default=str(Path(__file__).resolve().parents[1] / "images" / "exercises"),
    )
    args = parser.parse_args()

    pdf_path = Path(args.pdf)
    out_dir = Path(args.out)

    if not pdf_path.is_file():
        print(f"PDF not found: {pdf_path}", file=sys.stderr)
        return 1

    saved = extract_images(pdf_path, out_dir)
    print(f"\nExtracted {len(saved)} images -> {out_dir}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
