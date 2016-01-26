#!/bin/bash

date=$(TZ=UTC git show --pretty=%cI | head -1 | sed 's/:/-/g;s/+.*$//')
rev=$(git describe --always --tags)
target=$(basename $PWD)-$date-$rev

[ -e "./${target}.tar.xz" ] && ( echo "build exists, removing old $target."; rm ./pkgs/${target}.tar.xz; rm ./pkgs/${target}.tar; )

rm -rf ./pkgs
mkdir -p ./pkgs

set -x
npm run build >&2
tar cf ./pkgs/${target}.tar -C dist/ . >&2
tar rf ./pkgs/${target}.tar ./index.html >&2

xz -z pkgs/${target}.tar >&2
echo ./pkgs/${target}.tar

