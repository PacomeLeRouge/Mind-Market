#!/bin/bash

# 1. On lance openbox en arrière-plan (indispensable !)
openbox &

# 2. On attend une fraction de seconde que le gestionnaire soit prêt
sleep 2

# Force la création d'un bus de session pour éviter le crash D-Bus
export $(dbus-launch)

# 3. Lancement de Chromium version "Blindée"
# On ajoute --disable-features=SharedArrayBuffer pour éviter certains crashs ARM
# On ajoute --disable-gpu-compositing pour stabiliser l'affichage
chromium \
  --app=http://localhost:3001 \
  --kiosk \
  --no-sandbox \
  --window-size=1920,1080 \
  --user-data-dir=/home/rock/.config/chromium-kiosk \
  --use-fake-ui-for-media-stream \
  --autoplay-policy=no-user-gesture-required \
  --disable-gpu \
  --disable-software-rasterizer \
  --disable-dev-shm-usage \
  --disable-features=SharedArrayBuffer \
  --disable-gpu-compositing \
  --no-first-run
