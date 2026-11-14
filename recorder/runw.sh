#!/bin/bash
# usage: runw.sh <who> 'js'
cd "$(dirname "$0")"; W=$1; touch rec-$W.log
cnt() { grep -c -- '^---$' rec-$W.log; true; }
n=$(cnt); printf '%s' "$2" > cmd-$W.txt
for i in $(seq 1 1200); do [ "$(cnt)" -gt "$n" ] && break; sleep 0.5; done
awk -v n="$n" '/^---$/{c++; next} c==n' rec-$W.log | tail -20
