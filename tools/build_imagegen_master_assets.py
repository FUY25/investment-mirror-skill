#!/usr/bin/env python3
"""Build Investment Mirror master SVGs from imagegen-produced line-art sheets."""

from __future__ import annotations

import base64
import html
import io
import json
import re
from dataclasses import dataclass
from pathlib import Path
from urllib.parse import urlparse, unquote

import numpy as np
import yaml
from PIL import Image, ImageOps


ROOT = Path(__file__).resolve().parents[1]
MASTER_DATA = ROOT / "skills/investment-mirror/src/master_data.ts"
SHEET_DIR = ROOT / "assets/masters/imagegen_sheets"
ASSET_DIRS = [
    ROOT / "assets/masters",
    ROOT / "skills/investment-mirror/assets/masters",
]
METADATA_FILENAME = "photo_sources.yaml"
ASSET_KIND = "imagegen_line_art"
CANVAS = (440, 520)
VIEWBOX = (220, 260)
OFF_WHITE = (248, 245, 239)


@dataclass(frozen=True)
class Master:
    master_id: str
    display_name: str
    wikipedia_url: str


@dataclass(frozen=True)
class SheetSpec:
    file_name: str
    master_ids: tuple[str, str, str]
    prompt_summary: str


SHEETS: tuple[SheetSpec, ...] = (
    SheetSpec("sheet_01_buffett_munger_lynch.jpg", ("warren_buffett", "charlie_munger", "peter_lynch"), "Warren Buffett, Charlie Munger, and Peter Lynch in professional ink/copper report-line style."),
    SheetSpec("sheet_02_graham_schloss_klarman.jpg", ("benjamin_graham", "walter_schloss", "seth_klarman"), "Benjamin Graham, Walter Schloss, and Seth Klarman in professional ink/copper report-line style."),
    SheetSpec("sheet_03_li_lu_duan_fisher.jpg", ("li_lu", "duan_yongping", "philip_fisher"), "Li Lu, Duan Yongping, and Philip Fisher in professional ink/copper report-line style."),
    SheetSpec("sheet_04_trowe_terry_marks.jpg", ("t_rowe_price_jr", "terry_smith", "howard_marks"), "T. Rowe Price Jr., Terry Smith, and Howard Marks in professional ink/copper report-line style."),
    SheetSpec("sheet_05_templeton_grantham_burry.jpg", ("john_templeton", "jeremy_grantham", "michael_burry"), "John Templeton, Jeremy Grantham, and Michael Burry in professional ink/copper report-line style."),
    SheetSpec("sheet_06_soros_druckenmiller_tudorjones.jpg", ("george_soros", "stanley_druckenmiller", "paul_tudor_jones"), "George Soros, Stanley Druckenmiller, and Paul Tudor Jones in professional ink/copper report-line style."),
    SheetSpec("sheet_07_livermore_dalio_bogle.jpg", ("jesse_livermore", "ray_dalio", "john_bogle"), "Jesse Livermore, Ray Dalio, and John C. Bogle in professional ink/copper report-line style."),
    SheetSpec("sheet_08_simons_thorp_asness.jpg", ("jim_simons", "edward_thorp", "cliff_asness"), "Jim Simons, Edward O. Thorp, and Cliff Asness in professional ink/copper report-line style."),
    SheetSpec("sheet_09_fama_icahn_ackman.jpg", ("eugene_fama", "carl_icahn", "bill_ackman"), "Eugene Fama, Carl Icahn, and Bill Ackman in professional ink/copper report-line style."),
    SheetSpec("sheet_10_greenblatt_gross_swensen.jpg", ("joel_greenblatt", "bill_gross", "david_swensen"), "Joel Greenblatt, Bill Gross, and David Swensen in professional ink/copper report-line style."),
)


def parse_master_records() -> dict[str, Master]:
    text = MASTER_DATA.read_text(encoding="utf-8")
    array_match = re.search(
        r"export const MASTER_RECORDS: MasterRecord\[] = \[(?P<records>.*)\];\s*\n\s*export const ACTIVE_MASTER_IDS",
        text,
        re.S,
    )
    if not array_match:
        raise RuntimeError("Could not locate MASTER_RECORDS array")
    records: dict[str, Master] = {}
    for block in re.finditer(r"^  \{\n    id:\s*\"([^\"]+)\"(?P<body>.*?)(?=^  \},?\n^  \{|\Z)", array_match.group("records"), re.S | re.M):
        master_id = block.group(1)
        body = block.group("body")
        display_match = re.search(r"displayName:\s*\"([^\"]+)\"", body)
        wiki_match = re.search(r"wikipediaUrl:\s*\"([^\"]+)\"", body)
        if display_match and wiki_match:
            records[master_id] = Master(master_id, display_match.group(1), wiki_match.group(1))
    if len(records) != 30:
        raise RuntimeError(f"Expected 30 active masters, found {len(records)}")
    return records


def trim_paper_margin(image: Image.Image) -> Image.Image:
    arr = np.asarray(image.convert("RGB")).astype(np.int16)
    bg = np.asarray(image.resize((1, 1), Image.Resampling.BOX).getpixel((0, 0)), dtype=np.int16)
    distance = np.abs(arr - bg).sum(axis=2)
    mask = distance > 58
    if mask.sum() < 500:
        return image
    ys, xs = np.where(mask)
    pad_x = max(18, int(image.width * 0.035))
    pad_y = max(24, int(image.height * 0.035))
    left = max(0, xs.min() - pad_x)
    top = max(0, ys.min() - pad_y)
    right = min(image.width, xs.max() + pad_x)
    bottom = min(image.height, ys.max() + pad_y)
    return image.crop((left, top, right, bottom))


def portrait_from_sheet(sheet_path: Path, position: int) -> bytes:
    source = Image.open(sheet_path).convert("RGB")
    width, height = source.size
    left = round(position * width / 3)
    right = round((position + 1) * width / 3)
    third = source.crop((left, 0, right, height))
    portrait = trim_paper_margin(third)
    portrait = ImageOps.contain(portrait, CANVAS, Image.Resampling.LANCZOS)
    canvas = Image.new("RGB", CANVAS, OFF_WHITE)
    x = (CANVAS[0] - portrait.width) // 2
    y = max(0, (CANVAS[1] - portrait.height) // 2)
    canvas.paste(portrait, (x, y))
    buffer = io.BytesIO()
    canvas.save(buffer, format="JPEG", quality=92, optimize=True, progressive=True)
    return buffer.getvalue()


def svg_for(master: Master, sheet: SheetSpec, position: int, jpeg_bytes: bytes) -> str:
    b64 = base64.b64encode(jpeg_bytes).decode("ascii")
    metadata = {
        "master_id": master.master_id,
        "display_name": master.display_name,
        "asset_kind": ASSET_KIND,
        "wikipedia_url": master.wikipedia_url,
        "generated_sheet_path": f"assets/masters/imagegen_sheets/{sheet.file_name}",
        "sheet_position": position,
        "generation_tool": "built-in imagegen",
        "prompt_summary": sheet.prompt_summary,
        "source_note": "Generated with the built-in imagegen tool from a public-figure portrait prompt, then locally cropped into a finished professional report-line asset. This replaces rejected deterministic photo edge-trace SVGs.",
    }
    metadata_json = html.escape(json.dumps(metadata, ensure_ascii=False, sort_keys=True), quote=False)
    title = html.escape(f"{master.display_name} imagegen line-art portrait")
    desc = html.escape("Professional ink and copper line-art portrait generated for Investment Mirror report cards.")
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {VIEWBOX[0]} {VIEWBOX[1]}" role="img" aria-labelledby="{master.master_id}-title {master.master_id}-desc" data-asset-kind="{ASSET_KIND}" data-master-id="{html.escape(master.master_id)}">
  <title id="{master.master_id}-title">{title}</title>
  <desc id="{master.master_id}-desc">{desc}</desc>
  <metadata>{metadata_json}</metadata>
  <rect width="{VIEWBOX[0]}" height="{VIEWBOX[1]}" fill="#f8f5ef"/>
  <image x="0" y="0" width="{VIEWBOX[0]}" height="{VIEWBOX[1]}" preserveAspectRatio="xMidYMid meet" href="data:image/jpeg;base64,{b64}"/>
</svg>
'''


def write_assets(master: Master, svg: str) -> None:
    for directory in ASSET_DIRS:
        directory.mkdir(parents=True, exist_ok=True)
        (directory / f"{master.master_id}.svg").write_text(svg, encoding="utf-8")


def write_metadata(entries: list[dict[str, object]]) -> None:
    payload = {
        "version": "0.2",
        "asset_kind": ASSET_KIND,
        "generation_tool": "built-in imagegen",
        "notes": "Assets are generated professional line-art portraits cropped from local imagegen triptych sheets. They are not deterministic photo edge traces.",
        "masters": entries,
    }
    for directory in ASSET_DIRS:
        path = directory / METADATA_FILENAME
        path.write_text(yaml.safe_dump(payload, sort_keys=False, allow_unicode=True, width=120), encoding="utf-8")


def validate_outputs(masters: dict[str, Master], entries: list[dict[str, object]]) -> None:
    expected_ids = set(masters)
    actual_ids = {str(entry["master_id"]) for entry in entries}
    if expected_ids != actual_ids:
        raise RuntimeError(f"Metadata mismatch: missing={sorted(expected_ids - actual_ids)} extra={sorted(actual_ids - expected_ids)}")
    for directory in ASSET_DIRS:
        for master_id in sorted(expected_ids):
            path = directory / f"{master_id}.svg"
            text = path.read_text(encoding="utf-8")
            if f'data-asset-kind="{ASSET_KIND}"' not in text:
                raise RuntimeError(f"Missing imagegen asset-kind marker in {path}")
            if "data:image/jpeg;base64," not in text:
                raise RuntimeError(f"Missing embedded imagegen JPEG payload in {path}")
            if "source_photo_line_art" in text:
                raise RuntimeError(f"Rejected edge-trace marker still present in {path}")
        metadata_path = directory / METADATA_FILENAME
        metadata = yaml.safe_load(metadata_path.read_text(encoding="utf-8"))
        if len(metadata.get("masters", [])) != 30:
            raise RuntimeError(f"Expected 30 metadata entries in {metadata_path}")


def build() -> None:
    masters = parse_master_records()
    entries: list[dict[str, object]] = []
    seen_ids: set[str] = set()
    for sheet in SHEETS:
        sheet_path = SHEET_DIR / sheet.file_name
        if not sheet_path.exists():
            raise RuntimeError(f"Missing imagegen sheet: {sheet_path}")
        for position, master_id in enumerate(sheet.master_ids):
            if master_id in seen_ids:
                raise RuntimeError(f"Duplicate master in sheet mapping: {master_id}")
            seen_ids.add(master_id)
            master = masters[master_id]
            jpeg = portrait_from_sheet(sheet_path, position)
            write_assets(master, svg_for(master, sheet, position, jpeg))
            entries.append({
                "master_id": master.master_id,
                "display_name": master.display_name,
                "asset_kind": ASSET_KIND,
                "wikipedia_url": master.wikipedia_url,
                "generated_sheet_path": f"assets/masters/imagegen_sheets/{sheet.file_name}",
                "sheet_position": position,
                "generation_tool": "built-in imagegen",
                "prompt_summary": sheet.prompt_summary,
                "source_note": "Generated with built-in imagegen from a public-figure portrait prompt, then locally cropped into a finished professional report-line asset.",
            })
    write_metadata(entries)
    validate_outputs(masters, entries)
    print(f"Generated {len(entries)} imagegen line-art master assets.")


if __name__ == "__main__":
    build()
