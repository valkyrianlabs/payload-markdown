#!/usr/bin/env bash
# Install ValkyrianLabs CLI tools (vl-release, pmdocs, ...) from the ValkyrianLabs APT repository.
# Usage: install-valkyrianlabs-tools.sh PACKAGE...
#
# Checks before touching apt: when every tool is already installed at the repository's newest
# version (read from its Packages index over HTTPS), nothing is refreshed or installed. Otherwise
# only the ValkyrianLabs source is refreshed, so slow upstream mirrors are never waited on; where
# sudo allows only a plain `apt-get update` (the self-hosted runner), that is the fallback.
set -euo pipefail

REPO=https://apt.valkyrianlabs.com
LIST=/etc/apt/sources.list.d/valkyrianlabs.list

if [ "$#" -eq 0 ]; then
  echo "usage: $0 PACKAGE..." >&2
  exit 2
fi

show_versions() {
  for package in "$@"; do
    case "$package" in
      vl-release) vlr --version ;;
      pmdocs) pmdocs --version ;;
    esac
  done
}

index="$(for arch in all amd64; do curl -fsS --max-time 30 "$REPO/dists/stable/main/binary-$arch/Packages" || true; done)"

outdated=()
for package in "$@"; do
  newest=""
  for version in $(awk -v p="$package" '$1 == "Package:" { name = $2 } $1 == "Version:" && name == p { print $2 }' <<< "$index"); do
    if [ -z "$newest" ] || dpkg --compare-versions "$version" gt "$newest"; then newest="$version"; fi
  done
  installed=""
  if dpkg-query -W -f='${Status}' "$package" 2>/dev/null | grep -q "install ok installed"; then
    installed="$(dpkg-query -W -f='${Version}' "$package")"
  fi
  if [ -n "$installed" ] && [ -n "$newest" ] && dpkg --compare-versions "$installed" ge "$newest"; then
    echo "$package $installed is the newest published version"
  else
    echo "$package: installed ${installed:-none}, newest ${newest:-unknown}"
    outdated+=("$package")
  fi
done

if [ "${#outdated[@]}" -eq 0 ]; then
  show_versions "$@"
  exit 0
fi

if [ ! -f "$LIST" ]; then
  sudo -n install -d -m 0755 /etc/apt/keyrings
  curl -fsSL "$REPO/pubkey.gpg" -o valkyrianlabs.gpg
  sudo -n install -m 0644 valkyrianlabs.gpg /etc/apt/keyrings/valkyrianlabs.gpg
  rm -f valkyrianlabs.gpg
  echo "deb [arch=amd64 signed-by=/etc/apt/keyrings/valkyrianlabs.gpg] $REPO stable main" \
    | sudo -n tee "$LIST" > /dev/null
fi

if ! sudo -n apt-get update \
  -o Dir::Etc::sourcelist="sources.list.d/valkyrianlabs.list" \
  -o Dir::Etc::sourceparts=- \
  -o APT::Get::List-Cleanup=0; then
  echo "refreshing only the ValkyrianLabs source is not permitted here; running a full apt-get update"
  sudo -n apt-get update
fi
sudo -n apt-get install -y --no-install-recommends "${outdated[@]}"

show_versions "$@"
