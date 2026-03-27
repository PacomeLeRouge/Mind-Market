#!/bin/bash
openbox-session &
sleep 2

chromium \
  --app=http://localhost:3001 \
  --kiosk \
  --no-sandbox \
  --window-size=1920,1080 \
  --no-first-run \
  --use-fake-ui-for-media-stream \
  --autoplay-policy=no-user-gesture-required \
  --disable-infobars \
  --disable-gpu \
  --disable-software-rasterizer \
  --disable-dev-shm-usage
