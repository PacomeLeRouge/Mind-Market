import evdev
from evdev import ecodes, UInput
import time
import subprocess
import select

# --- CONFIGURATION ROTATION ---
SCREEN_NAME = "HDMI-1"
HOLD_DELAY = 5.0

# NOUVEAU : On définit les 4 positions possibles
ROTATIONS = ["normal", "right", "inverted", "left"]
current_rot_idx = 0

# On ajoute KEY_LEFT/RIGHT au cas où ton React en ait besoin un jour
cap = {
    ecodes.EV_KEY: [ecodes.KEY_ENTER, ecodes.KEY_ESC, ecodes.KEY_UP, ecodes.KEY_DOWN, ecodes.KEY_LEFT, ecodes.KEY_RIGHT]
}
ui = UInput(cap)

def toggle_rotation():
    global current_rot_idx
    # NOUVEAU : On passe à la rotation suivante dans la liste (tourne de 90°)
    current_rot_idx = (current_rot_idx + 1) % len(ROTATIONS)
    new_rot = ROTATIONS[current_rot_idx]
    
    print(f"🔄 Commande de rotation : {new_rot}")
    try:
        cmd = f"DISPLAY=:0 xrandr --output {SCREEN_NAME} --rotate {new_rot}"
        subprocess.run(cmd, shell=True, check=True)
    except Exception as e:
        print(f"❌ Erreur xrandr : {e}")

def run_bridge():
    print("🚀 Bridge lancé avec Double-Mapping des axes...")
    while True:
        try:
            devices = [evdev.InputDevice(path) for path in evdev.list_devices()]
            joystick = next((d for d in devices if "DragonRise" in d.name or "Generic" in d.name), None)

            if not joystick:
                time.sleep(5); continue

            print(f"✅ Connecté à : {joystick.name}")
            
            last_x = 0
            last_y = 0
            start_time_up = None
            rotation_triggered = False

            while True:
                r, _, _ = select.select([joystick.fd], [], [], 0.1)

                if r:
                    for event in joystick.read():
                        # --- 1. BOUTONS (Inversion Rouge/Vert) ---
                        if event.type == ecodes.EV_KEY and event.value == 1:
                            if event.code == 288: # Bouton 1 -> ESC (Rouge)
                                ui.write(ecodes.EV_KEY, ecodes.KEY_ESC, 1); ui.write(ecodes.EV_KEY, ecodes.KEY_ESC, 0); ui.syn()
                            elif event.code == 289: # Bouton 2 -> ENTER (Vert)
                                ui.write(ecodes.EV_KEY, ecodes.KEY_ENTER, 1); ui.write(ecodes.EV_KEY, ecodes.KEY_ENTER, 0); ui.syn()

                        # --- 2. JOYSTICK ---
                        elif event.type == ecodes.EV_ABS:
                            
                            # AXE X (Physiquement ton HAUT / BAS)
                            if event.code == ecodes.ABS_X or event.code == ecodes.ABS_HAT0X:
                                val = -1 if (event.value < 127 and event.value <= 0) else (1 if (event.value > 128 or event.value == 1) else 0)
                                if val != last_x:
                                    if val == -1: # HAUT physique
                                        ui.write(ecodes.EV_KEY, ecodes.KEY_UP, 1); ui.write(ecodes.EV_KEY, ecodes.KEY_UP, 0); ui.syn()
                                        start_time_up = time.time()
                                        rotation_triggered = False
                                    elif val == 1: # BAS physique
                                        ui.write(ecodes.EV_KEY, ecodes.KEY_DOWN, 1); ui.write(ecodes.EV_KEY, ecodes.KEY_DOWN, 0); ui.syn()
                                        start_time_up = None
                                    else: start_time_up = None
                                    last_x = val

                            # AXE Y (Physiquement ton GAUCHE / DROITE)
                            elif event.code == ecodes.ABS_Y or event.code == ecodes.ABS_HAT0Y:
                                val = -1 if (event.value < 127 and event.value <= 0) else (1 if (event.value > 128 or event.value == 1) else 0)
                                if val != last_y:
                                    if val == -1: # GAUCHE physique -> On envoie Haut pour faire défiler
                                        ui.write(ecodes.EV_KEY, ecodes.KEY_UP, 1); ui.write(ecodes.EV_KEY, ecodes.KEY_UP, 0); ui.syn()
                                    elif val == 1: # DROITE physique -> On envoie Bas pour faire défiler
                                        ui.write(ecodes.EV_KEY, ecodes.KEY_DOWN, 1); ui.write(ecodes.EV_KEY, ecodes.KEY_DOWN, 0); ui.syn()
                                    last_y = val

                # --- 3. TIMER ROTATION ---
                if start_time_up and not rotation_triggered:
                    if (time.time() - start_time_up) > HOLD_DELAY:
                        toggle_rotation()
                        rotation_triggered = True

        except Exception as e:
            print(f"⚠️ Erreur : {e}"); time.sleep(2)

if __name__ == "__main__":
    run_bridge()
