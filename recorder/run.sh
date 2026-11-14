#!/bin/bash
cd "$(dirname "$0")"; touch rec.log
cnt() { grep -c -- '^---$' rec.log; true; }
n=$(cnt); printf '%s' "$1" > cmd.txt
for i in $(seq 1 1200); do [ "$(cnt)" -gt "$n" ] && break; sleep 0.5; done
awk -v n="$n" '/^---$/{c++; next} c==n' rec.log | tail -20
