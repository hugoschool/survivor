# Documentation technique

Le projet JibJob est composé de différentes parties:

- Partie backend
- Partie frontend
- Partie BDD

## Backend

Le backend est fait à l'aide de Golang, en utilisant le framework Gin et l'ORM GORM.

Le linting utilisé est golangci-lint.

[swag](https://github.com/swaggo/swag) est utilisé afin de générer la documentation Swagger, disponible sur la route `/swagger/index.html` du backend. (La commande utilisée est la suivante: `swag init --parseDependency --parseInternal`)

## Frontend

Le frontend est fait en React + React Router.

Le linting et le formattage est assuré par BiomeJS.

Tailwind CSS est utilisé pour le styling. Certains composants sont pris de shadcn/ui.

## Base de données

La base de donnée utilisée est PostgreSQL, choisie pour sa performance et sa fiabilité.
