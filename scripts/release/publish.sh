#!/usr/bin/env bash

set -euo pipefail

if [ -z "${NODE_AUTH_TOKEN:-}" ]; then
  unset NODE_AUTH_TOKEN
fi

yarn install --frozen-lockfile
changeset publish
git push --follow-tags
