"""
prep_bodym_data.py  --  INSTRUCTOR SCRIPT (run once, before Session 1)

Downloads the Amazon BodyM dataset from its public S3 bucket and packages it
as bodym_data.zip for students to download from the course page.

    Source:  s3://amazon-bodym  (us-west-2, public, no AWS account needed)
    Info:    https://registry.opendata.aws/bodym/
    License: CC BY-NC 4.0 (non-commercial use; cite Ruiz et al., 2022)

Run it in a working folder OUTSIDE the website repo (for example ~/Downloads/bodym_prep).
The download is thousands of small image files; you don't want them copied into the site
build. Afterwards, copy only bodym_data.zip into static/pages/course_model/ml21-bodym/.

Usage (from a terminal, in that working folder):

    python prep_bodym_data.py                      # download everything, build bodym_data.zip
    python prep_bodym_data.py --max-height 320     # also shrink images to cut the zip size

--max-height shrinks the downloaded files in place. A later run without --skip-download
fetches the full-size originals again.

Only the Python standard library is needed. --max-height also needs Pillow
(pip install pillow). Re-running is safe: files already downloaded are skipped.

If you have the AWS CLI, this does the same download:
    aws s3 sync --no-sign-request s3://amazon-bodym ./bodym
then run:  python prep_bodym_data.py --skip-download

The zip unpacks to a folder called bodym/ that mirrors the bucket, e.g.
    bodym/train/measurements.csv
    bodym/train/mask/<photo_id>.png        (front silhouette)
    bodym/train/mask_left/<photo_id>.png   (side silhouette)
The script prints the layout it actually found, so you can confirm the
folder and file names match what the notebooks expect.
"""

import argparse
import collections
import os
import sys
import time
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
import zipfile
from concurrent.futures import ThreadPoolExecutor, as_completed

BUCKET_URL = "https://amazon-bodym.s3.us-west-2.amazonaws.com"
S3_NS = "{http://s3.amazonaws.com/doc/2006-03-01/}"
EXPECTED = ["measurements.csv", "hwg_metadata.csv", "subject_to_photo_map.csv", "mask/", "mask_left/"]


def list_keys(endpoint, prefix=""):
    """List every object in the bucket (S3 ListObjectsV2, anonymous, 1,000 keys per page)."""
    keys, token = [], None
    while True:
        params = {"list-type": "2", "prefix": prefix}
        if token:
            params["continuation-token"] = token
        url = endpoint + "/?" + urllib.parse.urlencode(params)
        with urllib.request.urlopen(url, timeout=60) as resp:
            root = ET.fromstring(resp.read())
        for item in root.iter(S3_NS + "Contents"):
            key = item.find(S3_NS + "Key").text
            size = int(item.find(S3_NS + "Size").text)
            if not key.endswith("/"):
                keys.append((key, size))
        truncated = root.find(S3_NS + "IsTruncated")
        if truncated is not None and truncated.text == "true":
            token = root.find(S3_NS + "NextContinuationToken").text
            print(f"  listed {len(keys):,} files so far...")
        else:
            return keys


def download_one(endpoint, key, size, out_dir, retries=4):
    """Download one object unless a file of the same size is already on disk."""
    dest = os.path.join(out_dir, *key.split("/"))
    if os.path.exists(dest) and os.path.getsize(dest) == size:
        return "skipped"
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    url = endpoint + "/" + urllib.parse.quote(key)
    for attempt in range(retries):
        try:
            with urllib.request.urlopen(url, timeout=60) as resp:
                data = resp.read()
            with open(dest + ".part", "wb") as f:
                f.write(data)
            os.replace(dest + ".part", dest)
            return "downloaded"
        except Exception as e:  # network hiccup: wait and retry
            if attempt == retries - 1:
                raise RuntimeError(f"Failed to download {key}: {e}")
            time.sleep(2 ** attempt)


def download_all(endpoint, out_dir, workers):
    print(f"Listing files in {endpoint} ...")
    keys = list_keys(endpoint)
    total_mb = sum(s for _, s in keys) / 1e6
    print(f"Found {len(keys):,} files, {total_mb:,.0f} MB. Downloading with {workers} threads ...")
    counts = collections.Counter()
    start = time.time()
    with ThreadPoolExecutor(max_workers=workers) as pool:
        futures = [pool.submit(download_one, endpoint, k, s, out_dir) for k, s in keys]
        for i, fut in enumerate(as_completed(futures), 1):
            counts[fut.result()] += 1
            if i % 1000 == 0 or i == len(futures):
                print(f"  {i:,}/{len(futures):,} files  ({time.time() - start:.0f}s)")
    print(f"Done: {counts['downloaded']:,} downloaded, {counts['skipped']:,} already present.")


def shrink_images(out_dir, max_height):
    """Resize every PNG so its height is at most max_height (keeps aspect ratio and 0/255 values)."""
    from PIL import Image
    n = 0
    for folder, _, files in os.walk(out_dir):
        for name in files:
            if not name.lower().endswith((".png", ".jpg", ".jpeg")):
                continue
            path = os.path.join(folder, name)
            with Image.open(path) as im:
                if im.height <= max_height:
                    continue
                w = round(im.width * max_height / im.height)
                small = im.convert("L").resize((w, max_height), Image.NEAREST)
            small.save(path, optimize=True)
            n += 1
    print(f"Resized {n:,} images to a height of {max_height}px.")


def describe_layout(out_dir):
    """Print what was downloaded so the instructor can confirm names and counts."""
    print("\nLayout found:")
    ok = True
    for split in sorted(os.listdir(out_dir)):
        split_dir = os.path.join(out_dir, split)
        if not os.path.isdir(split_dir):
            continue
        print(f"  {split}/")
        for entry in sorted(os.listdir(split_dir)):
            p = os.path.join(split_dir, entry)
            if os.path.isdir(p):
                files = os.listdir(p)
                exts = collections.Counter(os.path.splitext(f)[1].lower() for f in files)
                print(f"    {entry}/  {len(files):,} files {dict(exts)}")
            else:
                print(f"    {entry}  ({os.path.getsize(p) / 1e3:,.0f} KB)")
        present = set(os.listdir(split_dir))
        missing = [e for e in EXPECTED if e.rstrip("/") not in present]
        if missing:
            ok = False
            print(f"    !! expected but not found: {missing}")
    try:  # a quick look at one image
        from PIL import Image
        import glob
        sample = glob.glob(os.path.join(out_dir, "*", "mask", "*"))[:1]
        if sample:
            with Image.open(sample[0]) as im:
                print(f"\nSample image {os.path.basename(sample[0])}: {im.width}x{im.height} px, mode {im.mode}")
    except ImportError:
        pass
    if not ok:
        print("\nWARNING: some expected names were not found. Check the notebooks' file paths before class.")


def build_zip(out_dir, zip_path):
    print(f"\nWriting {zip_path} ...")
    parent = os.path.dirname(os.path.abspath(out_dir))
    with zipfile.ZipFile(zip_path, "w", compression=zipfile.ZIP_DEFLATED) as zf:
        for folder, _, files in os.walk(out_dir):
            for name in sorted(files):
                if name.endswith(".part") or name.startswith("."):
                    continue
                full = os.path.join(folder, name)
                zf.write(full, os.path.relpath(full, parent))
    print(f"Zip size: {os.path.getsize(zip_path) / 1e6:,.0f} MB")
    print("Post this zip on the course page. Students unzip it next to their notebook.")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--out", default="bodym", help="folder to download into (default: bodym)")
    ap.add_argument("--zip", default="bodym_data.zip", help="zip file to create (default: bodym_data.zip)")
    ap.add_argument("--max-height", type=int, default=None, help="shrink images to this height in px (e.g. 320)")
    ap.add_argument("--workers", type=int, default=16, help="parallel downloads (default: 16)")
    ap.add_argument("--skip-download", action="store_true", help="use files already in --out")
    ap.add_argument("--no-zip", action="store_true", help="download only")
    ap.add_argument("--endpoint", default=BUCKET_URL, help=argparse.SUPPRESS)  # for testing against a mirror
    args = ap.parse_args()

    if os.path.basename(os.path.normpath(args.out)) != "bodym":
        print("Note: the notebooks expect the folder to be named 'bodym'.")
    if not args.skip_download:
        download_all(args.endpoint.rstrip("/"), args.out, args.workers)
    if args.max_height:
        shrink_images(args.out, args.max_height)
    describe_layout(args.out)
    if not args.no_zip:
        build_zip(args.out, args.zip)


if __name__ == "__main__":
    sys.exit(main())
