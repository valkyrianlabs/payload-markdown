#!/usr/bin/env bash
# Install ValkyrianLabs CLI tools (vl-release, pmdocs, ...) from the ValkyrianLabs APT repository.
# Usage: install-valkyrianlabs-tools.sh PACKAGE...
set -euo pipefail

if [ "$#" -eq 0 ]; then
  echo "usage: $0 PACKAGE..." >&2
  exit 2
fi

if [ ! -f /etc/apt/sources.list.d/valkyrianlabs.list ]; then
  sudo install -d -m 0755 /etc/apt/keyrings
  sudo curl -fsSL https://apt.valkyrianlabs.com/pubkey.gpg -o /etc/apt/keyrings/valkyrianlabs.gpg
  sudo chmod 0644 /etc/apt/keyrings/valkyrianlabs.gpg
  echo "deb [arch=amd64 signed-by=/etc/apt/keyrings/valkyrianlabs.gpg] https://apt.valkyrianlabs.com stable main" \
    | sudo tee /etc/apt/sources.list.d/valkyrianlabs.list > /dev/null
fi

sudo apt-get update
sudo apt-get install -y --no-install-recommends "$@"

for package in "$@"; do
  case "$package" in
    vl-release) vlr --version ;;
    pmdocs) pmdocs --version ;;
  esac
done
