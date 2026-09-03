# Building

Cet documentation concerne le développement en local de l'application JibJob.

## Prérequis

Il faut d'abord mettre en place les variables d'environnement.

Un `.env.example` est fourni, il suffit de le copier dans un fichier `.env` et de rajouter des valeurs aux variables actuellement vides.

## Docker

En utilisant docker, il suffit de utiliser le docker compose.

```sh
docker compose up --build
```

Le frontend sera disponible sur `http://localhost:3000`.

Le backend sera disponible sur `http://localhost:8080`.
