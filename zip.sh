#!/usr/bin/env bash

OUTPUT_FILE=steam-achievements-filter.zip
TEMP_INCLUDE_FILE=files-to-include.txt

[ -f $OUTPUT_FILE ] && rm $OUTPUT_FILE
find . -type f | grep -v -f zipignore.txt >$TEMP_INCLUDE_FILE
# Jar files are essentially zip files, and the command is cross-system portable
jar -cfM $OUTPUT_FILE @$TEMP_INCLUDE_FILE || (java --version >/dev/null && echo "Unknown error while creating the zip file." || echo "This zip script requires Java to be installed on your system.")
rm $TEMP_INCLUDE_FILE
