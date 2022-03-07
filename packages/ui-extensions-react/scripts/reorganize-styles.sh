#!/usr/bin/env sh

# Reorganize Styles
mkdir -p styles
find dist \( -iname '*.css' -o -iname '*.css.map' \) -type f -exec mv {} styles/ \;
