#!/bin/sh
set -eu

standalone_dir=.next/standalone
helper_dir=node_modules/.pnpm/@swc+helpers@0.5.23/node_modules/@swc/helpers
next_modules=$(node -e 'const fs=require("node:fs"),path=require("node:path"); console.log(path.dirname(fs.realpathSync(".next/standalone/node_modules/next")))')
mkdir -p "$standalone_dir/.next" "$next_modules/@swc"
cp -R .next/static "$standalone_dir/.next/static"
rm -rf "$next_modules/@swc/helpers"
cp -RL "$helper_dir" "$next_modules/@swc/helpers"
export HOSTNAME=localhost
exec node "$standalone_dir/server.js"
