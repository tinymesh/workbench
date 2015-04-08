#!/bin/bash

# Syncs master with gh-pages and deploys to local stage
# Tags are automatically pushed to github!!!

git fetch origin
git reset --hard origin/master

npm install
npm run build
git commit -a -m 'lol-temp'

git checkout --orphan stage || git checkout -f stage

# I like these files, keep'em
git checkout master -- \
	index.html \
	build/dist.js \
	node_modules/bootstrap/dist/css/bootstrap.css \
	node_modules/bootstrap/dist/fonts/glyphicons-halflings-regular.eot \
	node_modules/bootstrap/dist/fonts/glyphicons-halflings-regular.svg \
	node_modules/bootstrap/dist/fonts/glyphicons-halflings-regular.ttf \
	node_modules/bootstrap/dist/fonts/glyphicons-halflings-regular.woff \
	node_modules/bootstrap/dist/fonts/glyphicons-halflings-regular.woff2


git commit -a -m $(git show --oneline master | head -1 | head -c 4)
git push origin stage
