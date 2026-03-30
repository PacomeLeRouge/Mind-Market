#!/bin/bash

echo "Préparation du système..."
# Désacactive veille
sudo setterm -blank 0 -powersave off -powerdown 0

sudo modprobe uinput
sudo chmod 666 /dev/uinput

# On force le démarrage du son pour l'utilisateur
pulseaudio --start --exit-idle-time=-1

echo "Nettoyage PM2..."
pm2 delete all 2>/dev/null

cd ~/Mind-Market
pm2 start server.js --name "mind-market"
pm2 start python3 -- bridge.py --name "buttons-bridge"
pm2 save --force

sleep 1

echo "ancement de l'affichage..."
# On utilise une méthode plus propre pour D-Bus
export $(dbus-launch)
xinit ./kiosk.sh -- :0
