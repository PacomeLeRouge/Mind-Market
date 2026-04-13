#  Guide d'Utilisation de la Borne

Ce guide vous accompagne dans l'installation, l'utilisation au quotidien et le dépannage de votre borne.

---

##  Installation

Suivez ces étapes dans l'ordre pour mettre en service la borne :

1.  **Connectique vidéo :** Branchez le câble **HDMI**.
2.  **Audio :** Branchez la **prise jack** (normalement elle est déjà branchée).
3.  **Alimentation :** Branchez le câble **USB-C**.

> [!IMPORTANT]
> La borne démarre automatiquement dès qu'elle est sous tension.
> 
> **Pour éteindre :** Il suffit de débrancher l'alimentation de la borne.

---

##  Utilisation

L'interface se pilote à l'aide du joystick et des boutons principaux :

* **Navigation :** Utilisez le **Joystick (Gauche / Droite)** pour naviguer dans les menus.
* **Valider :** Appuyez sur le **Bouton Vert** (OK).
* **Annuler / Retour :** Appuyez sur le **Bouton Rouge**.
* **Rotation d'écran :** Maintenez le **Joystick vers le haut** pendant **5 secondes** pour effectuer une rotation à 90°.

---

##  Dépannage (Debug)

Si vous rencontrez un problème technique, suivez ces procédures :

1.  **Vérification physique :** Contrôlez l'ensemble des branchements (HDMI, USB-C, Jack).
2.  **Accès console :** * Branchez un clavier sur l'un des ports USB.
    * Appuyez sur `ALT` + `F4` pour quitter l'interface graphique et accéder à la console.
3.  **Redémarrage :** Pour relancer le système proprement, tapez la commande suivante :
    ```bash
    sudo reboot
    ```

###  Mise à jour de l'application
Si vous avez effectué des modifications dans le fichier `app.jsx`, vous devez reconstruire l'application avec la commande suivante :
```bash
npm run build
```

***
