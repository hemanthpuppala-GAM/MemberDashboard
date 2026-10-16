#!/usr/bin/env bash
# Swap in vendor/ from vendor.zip (uploaded by the deploy workflow as one file
# instead of thousands). Run in the cPanel terminal from the backend folder:
#
#   cd ~/public_html/goldenagewisdom.org/staging/backend && bash unpack-vendor.sh
#
# Only needed when the deploy summary says the PHP libraries changed. Safe to
# re-run: it does nothing when vendor/ already matches the zip.
set -euo pipefail
cd "$(dirname "$0")"

[ -f vendor.zip ] || { echo "vendor.zip not found — has the deploy finished?"; exit 1; }
hash=$(sha256sum vendor.zip | cut -d' ' -f1)
if [ -f vendor/.zip-sha256 ] && [ "$(cat vendor/.zip-sha256)" = "$hash" ]; then
  echo "vendor/ is already up to date."
  exit 0
fi

rm -rf vendor-new
if command -v unzip >/dev/null; then
  unzip -q vendor.zip            # the zip holds one folder: vendor-new/
else
  php -r '$z = new ZipArchive; if ($z->open("vendor.zip") !== true || !$z->extractTo(".")) exit(1);'
fi
[ -f vendor-new/autoload.php ] || { echo "vendor.zip looks incomplete — not swapping."; rm -rf vendor-new; exit 1; }
echo "$hash" > vendor-new/.zip-sha256

# Two renames: the site sees the old or the new vendor/, never a half-copied one.
old="vendor-old-$(date +%Y%m%d%H%M%S)"
[ -d vendor ] && mv vendor "$old"
mv vendor-new vendor
rm -rf vendor-old-*
php artisan config:cache >/dev/null && php artisan route:cache >/dev/null
echo "vendor/ replaced. Caches rebuilt."
