#!/usr/bin/env bash
cd "$(dirname "$0")"

# Automatically find an available port starting at 8000
PORT=$(python3 -c '
import socket
for p in [8000, 8001, 8080, 3000, 5000, 8888]:
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.bind(("127.0.0.1", p))
            print(p)
            break
    except OSError:
        continue
')

if [ -z "$PORT" ]; then
  PORT=8000
fi

URL="http://localhost:$PORT"
echo "========================================================"
echo " Starting Lally Computers Website on $URL"
echo "========================================================"

if command -v open >/dev/null 2>&1; then
  (sleep 1 && open "$URL") &
elif command -v xdg-open >/dev/null 2>&1; then
  (sleep 1 && xdg-open "$URL") &
fi

python3 -m http.server "$PORT"
