import evdev
from evdev import ecodes, UInput
import time

# On autorise le clavier virtuel à utiliser Entrée, Echap et les Flèches
cap = {
    ecodes.EV_KEY: [ecodes.KEY_ENTER, ecodes.KEY_ESC, ecodes.KEY_UP, ecodes.KEY_DOWN]
}
ui = UInput(cap)

def run_bridge():
    print("Recherche du Joystick DragonRise...")
    while True:
        try:
            devices = [evdev.InputDevice(path) for path in evdev.list_devices()]
            joystick = None
            for d in devices:
                if "DragonRise" in d.name or "Generic" in d.name:
                    joystick = d
                    break

            if not joystick:
                time.sleep(5)
                continue

            print(f"Connecté à : {joystick.name}")
            
            # Variable pour mémoriser la position du joystick et ne pas spammer
            last_x = 0

            for event in joystick.read_loop():
                # 1. GESTION DES BOUTONS (Inversés ici !)
                if event.type == ecodes.EV_KEY and event.value == 1:
                    if event.code == 288: # Bouton Physique 1
                        # INVERSION : on envoie ESC (Rouge) au lieu de ENTER (Vert)
                        ui.write(ecodes.EV_KEY, ecodes.KEY_ESC, 1)
                        ui.write(ecodes.EV_KEY, ecodes.KEY_ESC, 0)
                        ui.syn()
                    elif event.code == 289: # Bouton Physique 2
                        # INVERSION : on envoie ENTER (Vert) au lieu de ESC (Rouge)
                        ui.write(ecodes.EV_KEY, ecodes.KEY_ENTER, 1)
                        ui.write(ecodes.EV_KEY, ecodes.KEY_ENTER, 0)
                        ui.syn()

                # 2. GESTION DU JOYSTICK (Axes Y : Haut / Bas)
                elif event.type == ecodes.EV_ABS:
                    # Le code 1 (ABS_Y) ou 17 (ABS_HAT0Y) correspond à Haut/Bas
                    if event.code == ecodes.ABS_Y or event.code == ecodes.ABS_HAT0Y:
                        # Détection de la direction
                        if event.value < 127 and event.value <= 0:
                            current_y = -1 # Haut
                        elif event.value > 128 or event.value == 1:
                            current_y = 1  # Bas
                        else:
                            current_y = 0  # Centre

                        # Si la direction a changé
                        if current_y != last_x: # On réutilise ta variable last_x ou crée last_y au début
                            if current_y == -1:
                                ui.write(ecodes.EV_KEY, ecodes.KEY_UP, 1)
                                ui.write(ecodes.EV_KEY, ecodes.KEY_UP, 0)
                                ui.syn()
                            elif current_y == 1:
                                ui.write(ecodes.EV_KEY, ecodes.KEY_DOWN, 1)
                                ui.write(ecodes.EV_KEY, ecodes.KEY_DOWN, 0)
                                ui.syn()
                            last_x = current_y # On met à jour l'état

        except Exception as e:
            print(f"Erreur : {e}")
            time.sleep(2)

if __name__ == "__main__":
    run_bridge()
