"""Export existing store creatives without changing or replacing originals.

Only pixel dimensions, containment padding, and RGB encoding change. Image
generation and translation are performed separately with the built-in tool.
"""
from __future__ import annotations

import argparse
import hashlib
import io
import json
import re
from pathlib import Path

from PIL import Image, ImageOps

APPLE = (1290, 2796)
PLAY = (1080, 1920)
APPLE_ACCEPTED = {(1260, 2736), APPLE, (1320, 2868), (1284, 2778), (1242, 2688)}
APPLE_ACCEPTED |= {(height, width) for width, height in APPLE_ACCEPTED.copy()}
LOCALES = {"ar-SA": "ar", "ja": "ja-JP", "ko": "ko-KR", "tr": "tr-TR",
           "zh-Hans": "zh-CN", "hi": "hi-IN", "it": "it-IT", "ru": "ru-RU",
           "pl": "pl-PL", "sv": "sv-SE", "da": "da-DK", "fi": "fi-FI"}
TARGETS = ["en-US", "ar-SA", "de-DE", "es-ES", "fr-FR", "ja", "ko", "pt-BR",
           "tr", "zh-Hans", "hi", "it", "ru", "nl-NL", "pl", "sv", "da", "fi", "id", "th"]
EXTENSIONS = {".png", ".jpg", ".jpeg"}


def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def files(directory: Path) -> list[Path]:
    return sorted(p for p in directory.iterdir() if p.is_file() and p.suffix.lower() in EXTENSIONS) if directory.is_dir() else []


def decoded(path: Path) -> Image.Image:
    with Image.open(path) as im:
        image = ImageOps.exif_transpose(im)
        if image.mode in ("RGBA", "LA") or "transparency" in image.info:
            background = Image.new("RGBA", image.size, "#08080a")
            background.alpha_composite(image.convert("RGBA"))
            return background.convert("RGB")
        return image.convert("RGB")


def unique(paths: list[Path]) -> list[Path]:
    named = [p for p in paths if re.match(r"^\d+-[a-z]", p.stem, re.I)]
    if len(named) >= 2:
        paths = named
    seen = set()
    result = []
    for path in paths:
        im = decoded(path)
        key = sha(str(im.size).encode() + im.tobytes())
        if key not in seen:
            seen.add(key)
            result.append(path)
    return result[:8]


def existing_images(repo: Path) -> dict[str, list[Path]]:
    assets = repo / "app-store-assets"
    result = {}
    for directory in [assets / "screenshots-ready", assets / "screenshots-standardized", assets / "screenshots"]:
        if not directory.is_dir():
            continue
        for child in sorted(directory.iterdir()):
            if not child.is_dir() or child.name.startswith(("_", ".")) or child.name == "legacy-mixed":
                continue
            candidates = files(child)
            if len(candidates) >= 2 and child.name not in result:
                result[child.name] = unique(candidates)
    # Reviewed imagegen masters are registered explicitly, never assumed ready.
    reviews = assets / "store-delivery-20261106" / "reviewed-masters.json"
    if reviews.exists():
        for locale, paths in json.loads(reviews.read_text(encoding="utf-8")).items():
            if len(paths) >= 1:
                result[locale] = unique([repo / p for p in paths])
    return result


def export_image(repo: Path, source: Path, target: Path, size: tuple[int, int], cached: dict | None = None) -> dict:
    source_bytes = source.read_bytes()
    if (cached and target.exists() and cached.get("source") == source.relative_to(repo).as_posix()
            and cached.get("file") == target.relative_to(repo).as_posix()
            and cached.get("sourceSha256") == sha(source_bytes) and cached.get("size") == list(size)
            and cached.get("fit") == "contain" and cached.get("mode") == "RGB"
            and cached.get("sha256") == sha(target.read_bytes())):
        with Image.open(target) as current:
            if current.size == size and current.mode == "RGB":
                return {**cached, "created": False}
    source_image = decoded(source)
    content = ImageOps.contain(source_image, size, Image.Resampling.LANCZOS)
    output = Image.new("RGB", size, "#08080a")
    output.paste(content, ((size[0] - content.width) // 2, (size[1] - content.height) // 2))
    stream = io.BytesIO()
    output.save(stream, format="PNG", optimize=True)
    payload = stream.getvalue()
    created = False
    if target.exists():
        current = decoded(target)
        if current.size != size or current.tobytes() != output.tobytes():
            raise ValueError(f"Refusing to replace existing asset: {target}")
    else:
        target.parent.mkdir(parents=True, exist_ok=True)
        with target.open("xb") as handle:
            handle.write(payload)
        created = True
    with Image.open(target) as check:
        if check.size != size or check.mode != "RGB":
            raise ValueError(f"Invalid export: {target}")
    if source.read_bytes() != source_bytes:
        raise ValueError(f"Source changed: {source}")
    return {"source": source.relative_to(repo).as_posix(), "sourceSha256": sha(source_bytes),
            "sourceSize": list(source_image.size), "file": target.relative_to(repo).as_posix(),
            "sha256": sha(target.read_bytes()), "size": list(size), "mode": "RGB",
            "contentSize": list(content.size), "fit": "contain", "created": created}


def run(repo: Path, verify: bool = False) -> dict:
    assets = repo / "app-store-assets"
    delivery = assets / "store-delivery-20261106"
    manifest_path = delivery / "exports.json"
    if verify:
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
        for entry in manifest["exports"]:
            if sha((repo / entry["source"]).read_bytes()) != entry["sourceSha256"]:
                raise ValueError(f"Source changed: {entry['source']}")
            image_path = repo / entry["file"]
            if sha(image_path.read_bytes()) != entry["sha256"]:
                raise ValueError(f"Export changed: {entry['file']}")
            with Image.open(image_path) as image:
                if list(image.size) != entry["size"] or image.mode != "RGB":
                    raise ValueError(f"Invalid export: {image_path}")
        return {"repo": repo.name, "verified": len(manifest["exports"]), "locales": len(manifest["locales"])}
    sources = existing_images(repo)
    if not sources:
        return {"repo": repo.name, "status": "needs-reviewed-source-artwork", "exports": 0}
    previous = json.loads(manifest_path.read_text(encoding="utf-8")) if manifest_path.exists() else {"exports": []}
    reviews_path = delivery / "reviewed-masters.json"
    reviewed_locales = set(json.loads(reviews_path.read_text(encoding="utf-8"))) if reviews_path.exists() else set()
    # Keep the original source for completed locales. A later ready-sized Apple
    # export must not become a new input and cause a second resize of Play art.
    for locale in previous.get("locales", []):
        if locale in reviewed_locales:
            continue
        prior_sources = []
        for entry in previous["exports"]:
            if entry["locale"] != locale or entry["platform"] != "google-play-phone":
                continue
            source = repo / entry["source"]
            if sha(source.read_bytes()) != entry["sourceSha256"]:
                raise ValueError(f"Previously verified source changed: {source}")
            if source not in prior_sources:
                prior_sources.append(source)
        if prior_sources:
            sources[locale] = prior_sources
    entries = {item["file"]: item for item in previous["exports"]}
    created = []
    existing_apple = []
    for locale, paths in sources.items():
        for index, source in enumerate(paths, 1):
            with Image.open(source) as image:
                landscape = image.width > image.height
            apple_size = tuple(reversed(APPLE)) if landscape else APPLE
            play_size = tuple(reversed(PLAY)) if landscape else PLAY
            slug = re.sub(r"^\d+[-_ ]*", "", source.stem)
            slug = re.sub(r"[^a-z0-9-]+", "-", slug.lower()).strip("-") or "screen"
            name = f"{index:02d}-{slug}.png"
            apple_ready = assets / "screenshots-ready" / locale
            valid_apple = []
            for path in files(apple_ready):
                with Image.open(path) as im:
                    if im.size in APPLE_ACCEPTED and im.mode == "RGB":
                        valid_apple.append(path)
            # Preserve all previously exported Apple locale sets; only fill empty folders.
            if len(valid_apple) >= len(paths):
                if index == 1:
                    existing_apple.extend(p.relative_to(repo).as_posix() for p in valid_apple)
            else:
                target = apple_ready / name
                if target.resolve() != source.resolve():
                    entry = export_image(repo, source, target, apple_size, entries.get(target.relative_to(repo).as_posix()))
                    entry.update(locale=locale, platform="app-store-iphone")
                    entries[entry["file"]] = entry
                    if entry["created"]:
                        created.append(entry["file"])
            target = repo / "play-store-assets" / "screenshots-ready" / LOCALES.get(locale, locale) / name
            entry = export_image(repo, source, target, play_size, entries.get(target.relative_to(repo).as_posix()))
            entry.update(locale=locale, platform="google-play-phone")
            entries[entry["file"]] = entry
            if entry["created"]:
                created.append(entry["file"])
    delivery.mkdir(parents=True, exist_ok=True)
    manifest = {"schemaVersion": 1, "date": "2026-11-06", "targetLocales": TARGETS,
                "locales": sorted(sources), "missingTargetLocales": [x for x in TARGETS if x not in sources],
                "operation": "Size and RGB encoding only. Existing creatives preserved; translations are separate imagegen jobs.",
                "storeSpecifications": {"apple": "https://developer.apple.com/help/app-store-connect/reference/app-information/screenshot-specifications/",
                                        "googlePlay": "https://support.google.com/googleplay/android-developer/answer/9866151?hl=en"},
                "existingAppleAssets": sorted(set(existing_apple)),
                "exports": sorted(entries.values(), key=lambda entry: entry["file"])}
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return {"repo": repo.name, "status": "exported", "locales": len(sources), "created": len(created),
            "missingTargetLocales": manifest["missingTargetLocales"], "createdFiles": created,
            "manifest": manifest_path.relative_to(repo).as_posix()}


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("repository", type=Path)
    parser.add_argument("--verify-only", action="store_true")
    arguments = parser.parse_args()
    print(json.dumps(run(arguments.repository.resolve(), arguments.verify_only), ensure_ascii=False))
