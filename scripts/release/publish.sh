#!/usr/bin/env bash

set -euo pipefail

if [ -z "${NODE_AUTH_TOKEN:-}" ]; then
  unset NODE_AUTH_TOKEN
  # OIDC trusted publishing authenticates via short-lived OIDC tokens, so the
  # .npmrc must not declare an _authToken. Strip the line that actions/setup-node
  # wrote so yarn parses a clean config and npm falls through to the OIDC flow.
  if [ -n "${NPM_CONFIG_USERCONFIG:-}" ] && [ -f "$NPM_CONFIG_USERCONFIG" ]; then
    sed -i '/_authToken=/d' "$NPM_CONFIG_USERCONFIG"
  fi
fi

yarn install --frozen-lockfile
changeset publish
git push --follow-tags
