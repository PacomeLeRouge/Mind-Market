# Mind&Market

Application React/Vite conçue pour un dispositif d’écran vertical 9:16.

Le projet présente un parcours simple pour aider un porteur de projet :

- affichage automatique de questions
- sélection d’une question
- lancement d’un enregistrement vocal
- confirmation de la réponse
- écran de remerciement

L’interface a été pensée pour une borne ou un téléviseur retourné en format portrait, avec un écran intérieur mis en scène dans un cadre visuel plus large.

## Stack technique

- React
- Vite
- CSS natif

## Lancer le projet

Installer les dépendances :

```bash
npm install
```

Lancer le serveur de développement (Front) :

```bash
npm run dev
```

Lancer le serveur de développement (Back) :

```bash
npm run server
```

Créer un build de production :

```bash
npm run build
```

Prévisualiser le build :

```bash
npm run preview
```

## Structure du projet

```text
Mind&Market/
├── index.html
├── package.json
├── README.md
├── src/
│   ├── App.jsx
│   ├── main.jsx
│   ├── styles.css
│   └── svg/
│       ├── Green_Button.svg
│       ├── Red_Button.svg
│       ├── Hand.svg
│       ├── Joystick.svg
│       ├── OpenHub.svg
│       ├── Whisper.svg
│       └── index.js
```

## Fonctionnement de l’application

Le parcours utilisateur est découpé en plusieurs étapes :

- `question`
  - fait défiler automatiquement les questions
  - permet de valider une question

- `speak`
  - affiche la question choisie
  - invite à démarrer l’enregistrement

- `recording`
  - montre un indicateur visuel d’enregistrement
  - permet de finaliser l’enregistrement

- `confirm`
  - propose de valider la réponse
  - ou de recommencer l’enregistrement

- `thanks`
  - affiche un message de remerciement
  - revient automatiquement au premier écran après 10 secondes

## Comportements actuels

- rotation automatique des questions sur le premier écran
- retour automatique à l’écran initial après l’écran de remerciement
- animations simples et légères
- mise en page optimisée pour un affichage 9:16
- visuels SVG utilisés comme éléments principaux de l’interface
- écran intérieur tourné à 90° pour simuler un téléviseur utilisé en portrait

## Fichiers importants

- `src/App.jsx`
  - logique du flow et rendu des écrans

- `src/styles.css`
  - styles globaux, responsive, rotation, dimensions et hiérarchie visuelle

- `src/svg/index.js`
  - point d’entrée des assets SVG

## Notes

Le projet est volontairement simple et centré sur l’expérience visuelle.
Les textes, espacements, tailles et alignements ont été ajustés pour correspondre à un usage sur grand écran vertical.
