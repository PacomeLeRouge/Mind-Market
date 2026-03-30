#!/bin/bash

# 1. On lance le gestionnaire de fenêtres en arrière-plan
openbox-session &
sleep 2

# 2. On lance Chromium avec TOUTES les options nécessaires
chromium \
  --app=http://localhost:3001 \
  --kiosk \
  --no-sandbox \
  --window-size=1920,1080 \
  --no-first-run \
  --disable-infobars \
  --disable-gpu \
  --disable-software-rasterizer \
  --disable-dev-shm-usage \
  --user-data-dir=/home/rock/.config/chromium-kiosk \
  --use-fake-ui-for-media-stream \
  --autoplay-policy=no-user-gesture-required \
  --disable-features=WebRtcHideLocalIpsWithMdns \
  --enable-features=WebRtcAllowInputVolumeAdjustment \
  --remote-debugging-port=9222
