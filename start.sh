#!/usr/bin/env bash
PORT=8000
echo "Starting Lally Computers Website on http://localhost:$PORT ..."
if command -v open >/dev/null 2>&1; then
  (sleep 1 && open "http://localhost:$PORT") &
fi
python3 -m http.server "$PORT"
