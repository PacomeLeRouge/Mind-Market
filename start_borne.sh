#!/bin/bash

echo "Démarrage de la borne Mind & Market..."

# 1. On se place dans le bon dossier
cd ~/Mind-Market

# 2. On s'assure que les services PM2 tournent (Serveur Node + Bridge Python)
echo "Vérification du serveur et du pont joystick..."
pm2 start server.js --name "mind-market" 2>/dev/null || pm2 restart mind-market
pm2 start python3 --name "buttons-bridge" -- bridge.py 2>/dev/null || pm2 restart buttons-bridge

# 3. On sauvegarde la config PM2 (pour le redémarrage automatique du RockPi)
pm2 save

# 4. On attend 2 petites secondes pour que le serveur soit bien chaud
sleep 2

# 5. On lance l'interface graphique (Chromium en mode Kiosk)
echo "🖥️ancement de l'affichage..."
sudo xinit ./kiosk.sh -- :0
