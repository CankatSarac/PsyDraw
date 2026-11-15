"""Size/encode explicitly reviewed masters; never translate or replace artwork."""
import argparse
import hashlib
import json
import statistics
from pathlib import Path

from PIL import Image, ImageOps

PLAY_LOCALES = {'ar-SA':'ar','ja':'ja-JP','ko':'ko-KR','tr':'tr-TR','zh-Hans':'zh-CN',
    'hi':'hi-IN','it':'it-IT','ru':'ru-RU','pl':'pl-PL','sv':'sv-SE','da':'da-DK','fi':'fi-FI'}


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def verify(repo, manifest):
    locales = manifest['locales']
    assert len(locales) >= 10, 'At least 10 reviewed locales required'
    counts = {}
    for item in manifest['exports']:
        source, target = repo/item['source'], repo/item['file']
        assert sha(source) == item['sourceSha256'], f'Source changed: {source}'
        assert sha(target) == item['sha256'], f'Export changed: {target}'
        with Image.open(target) as image:
            assert image.size == tuple(item['size']) and image.mode == 'RGB'
            image.verify()
        key = (item['locale'], item['platform'])
        counts[key] = counts.get(key, 0) + 1
    for locale in locales:
        for platform in ['app-store-iphone', 'google-play-phone']:
            assert counts.get((locale, platform), 0) >= 2, (locale, platform)
    return {'locales':len(locales), 'verifiedExports':len(manifest['exports'])}


def run(repo, verify_only=False):
    delivery = repo/'app-store-assets/store-delivery-20261114'
    target_manifest = delivery/'exports.json'
    if verify_only:
        return verify(repo, json.loads(target_manifest.read_text(encoding='utf-8')))
    reviews = json.loads((delivery/'reviewed-masters.json').read_text(encoding='utf-8'))
    settings_path = delivery/'export-settings.json'
    settings = json.loads(settings_path.read_text(encoding='utf-8')) if settings_path.exists() else {}
    ready_subdirectory = settings.get('readySubdirectory','')
    assert not ready_subdirectory or (ready_subdirectory.replace('-','').isalnum() and '/' not in ready_subdirectory)
    assert len(reviews) >= 10 and all(len(v) >= 2 for v in reviews.values())
    entries = []
    previous = json.loads(target_manifest.read_text(encoding='utf-8')) if target_manifest.exists() else {'exports':[]}
    cached = {e['file']:e for e in previous['exports']}
    for locale, sources in reviews.items():
        for source_name in sources:
            source = repo/source_name
            source_hash = sha(source)
            with Image.open(source) as original:
                master = ImageOps.exif_transpose(original).convert('RGB')
            corners = [master.getpixel(p) for p in [(0,0),(master.width-1,0),(0,master.height-1),(master.width-1,master.height-1)]]
            background = tuple(round(statistics.median(c[channel] for c in corners)) for channel in range(3))
            for platform, folder, store_locale, portrait in [
                ('app-store-iphone', 'app-store-assets', locale, (1290,2796)),
                ('google-play-phone','play-store-assets',PLAY_LOCALES.get(locale,locale),(1080,1920))]:
                size = portrait if master.width <= master.height else portrait[::-1]
                prefix = ready_subdirectory+'/' if ready_subdirectory else ''
                relative = f'{folder}/screenshots-ready/{prefix}{store_locale}/{source.stem}.jpg'
                target = repo/relative
                old = cached.get(relative)
                if target.exists():
                    assert old and old['sourceSha256'] == source_hash and old['sha256'] == sha(target), f'Refusing overwrite: {target}'
                    entries.append(old)
                    continue
                content = ImageOps.contain(master, size, Image.Resampling.LANCZOS)
                output = Image.new('RGB', size, background)
                output.paste(content, ((size[0]-content.width)//2,(size[1]-content.height)//2))
                target.parent.mkdir(parents=True, exist_ok=True)
                with target.open('xb') as handle:
                    output.save(handle, format='JPEG', quality=97, subsampling=0, optimize=True)
                entries.append({'locale':locale,'platform':platform,'source':source_name,'sourceSha256':source_hash,
                    'sourceSize':list(master.size),'file':relative,'sha256':sha(target),'size':list(size),
                    'mode':'RGB','format':'JPEG','quality':97,'fit':'contain','paddingColor':list(background)})
    manifest = {'schemaVersion':1,'date':'2026-11-14','locales':list(reviews),'minimumLanguageCount':len(reviews),
        'operation':'Sizing and RGB JPEG encoding of explicitly reviewed imagegen masters. Original artwork retained.',
        'storeSpecifications':{'apple':'https://developer.apple.com/help/app-store-connect/reference/app-information/screenshot-specifications/',
            'googlePlay':'https://support.google.com/googleplay/android-developer/answer/9866151?hl=en'},'exports':entries}
    result = verify(repo, manifest)
    target_manifest.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    return result


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('repository',type=Path)
    parser.add_argument('--verify-only',action='store_true')
    args = parser.parse_args()
    print(json.dumps(run(args.repository.resolve(),args.verify_only)))
