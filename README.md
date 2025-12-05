# InfoPasManiak

Dépôt préconfiguré pour la Nuit de l'Info.

## Prise en main

Ce dépôt contient les fichiers pour différents backends

### Backend PHP

Servir les fichiers php dans le dossier `public/` (si pas de configuration WAMP / LAMP, c'est faisable avec `php -S 0.0.0.0:8000 -t public/`)

Vous pouvez supprimer les fichiers `package*.json` et `index.js`.

### Backend Node

Installer les dépendances avec `npm install`, puis lancer le code avec `npm start`.

Vous pouvez supprimer les fichiers `public/*.php`.

## Script de redéploiement

Le script `deploy_script.sh` sera executé pour finaliser chacun de vos déploiements. Pensez à le personnaliser en fonction de votre framework / langage avant le premier commit
