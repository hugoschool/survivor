# Building

Cet documentation concerne le développement en local de l'application ProfilsActifs.

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

### Database

Si vous souhaitez lancer seulement la base de donnée:
```sh
docker compose up postgres
```

## Local

Il faudra probablement injecter les valeurs du `.env` dans votre shell.

Dans un shell type ZSH: `set -o allexport && source .env && set +o allexport`

Lancez ensuite la DB, il est recommandé d'utiliser Docker pour initialiser et lancer la BDD postgres.
(Réferez vous à la partie Database du Docker)

Une fois effectué, vous pouvez lancer les différents services:

- backend avec `go run main.go`
- frontend avec `pnpm dev`
